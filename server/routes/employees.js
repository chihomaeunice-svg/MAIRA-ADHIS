const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const snapshot = await db.collection('employees').orderBy('fullName').get();
    const employees = snapshot.docs.map(doc => {
      const data = doc.data();
      // Hide salary unless admin or managing partner
      const userRole = req.user?.role;
      if (!['ADMIN', 'MANAGING_PARTNER', 'ACCOUNTANT'].includes(userRole)) {
        delete data.salary;
      }
      return { id: doc.id, ...data };
    });
    res.json({ employees, total: employees.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

router.post('/', authenticate, requireRole('ADMIN', 'MANAGING_PARTNER'), async (req, res) => {
  try {
    const db = getDb();
    const empData = { ...req.body, createdAt: new Date() };
    const docRef = await db.collection('employees').add(empData);
    res.status(201).json({ id: docRef.id, ...empData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

router.put('/:id', authenticate, requireRole('ADMIN', 'MANAGING_PARTNER'), async (req, res) => {
  try {
    const db = getDb();
    await db.collection('employees').doc(req.params.id).update({ ...req.body, updatedAt: new Date() });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

module.exports = router;
