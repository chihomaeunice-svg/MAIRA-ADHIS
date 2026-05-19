const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { type, direction, caseId } = req.query;
    let query = db.collection('correspondence').orderBy('date', 'desc');
    if (type) query = query.where('type', '==', type);
    if (direction) query = query.where('direction', '==', direction);
    if (caseId) query = query.where('relatedCaseId', '==', caseId);
    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ correspondence: items, total: items.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch correspondence' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const data = { ...req.body, createdAt: new Date(), createdBy: req.user.uid };
    const docRef = await db.collection('correspondence').add(data);
    res.status(201).json({ id: docRef.id, ...data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create correspondence' });
  }
});

module.exports = router;
