const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/summary', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const [casesSnap, clientsSnap, employeesSnap, procurementSnap] = await Promise.all([
      db.collection('cases').get(),
      db.collection('clients').get(),
      db.collection('employees').where('status', '==', 'ACTIVE').get(),
      db.collection('procurement').get(),
    ]);

    const cases = casesSnap.docs.map(d => d.data());
    const procurement = procurementSnap.docs.map(d => d.data());

    const summary = {
      totalCases: cases.length,
      activeCases: cases.filter(c => c.status === 'ONGOING').length,
      completedCases: cases.filter(c => c.status === 'COMPLETED').length,
      newCases: cases.filter(c => c.status === 'NEW').length,
      totalClients: clientsSnap.size,
      activeEmployees: employeesSnap.size,
      totalProcurement: procurement.reduce((sum, p) => sum + (p.totalPrice || 0), 0),
      approvedProcurement: procurement.filter(p => p.status === 'APPROVED').reduce((sum, p) => sum + (p.totalPrice || 0), 0),
    };

    res.json(summary);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

router.get('/cases-by-month', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('cases').orderBy('createdAt').get();
    const cases = snapshot.docs.map(d => d.data());

    const monthlyData = {};
    cases.forEach(c => {
      if (c.createdAt) {
        const date = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      }
    });

    res.json(monthlyData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate cases by month report' });
  }
});

module.exports = router;
