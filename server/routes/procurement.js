const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.query;
    let query = db.collection('procurement').orderBy('date', 'desc');
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ procurement: items, total: items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch procurement' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const data = {
      ...req.body,
      totalPrice: req.body.quantity * req.body.unitPrice,
      status: 'PENDING',
      requestedBy: req.user.uid,
      date: new Date(),
      createdAt: new Date(),
    };
    const docRef = await db.collection('procurement').add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create procurement request' });
  }
});

router.put('/:id/approve', authenticate, requireRole('ADMIN', 'MANAGING_PARTNER'), async (req, res) => {
  try {
    const db = getDb();
    await db.collection('procurement').doc(req.params.id).update({
      status: 'APPROVED',
      approvedBy: req.user.uid,
      approvedAt: new Date(),
    });
    res.json({ message: 'Procurement request approved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

router.put('/:id/reject', authenticate, requireRole('ADMIN', 'MANAGING_PARTNER'), async (req, res) => {
  try {
    const db = getDb();
    await db.collection('procurement').doc(req.params.id).update({
      status: 'REJECTED',
      rejectedBy: req.user.uid,
      rejectedAt: new Date(),
    });
    res.json({ message: 'Procurement request rejected' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject request' });
  }
});

module.exports = router;
