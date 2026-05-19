const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate } = require('../middleware/auth');

// GET all cases
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { status, advocateId, clientId, limit = 50 } = req.query;

    let query = db.collection('cases').orderBy('createdAt', 'desc').limit(Number(limit));

    if (status) query = query.where('status', '==', status);
    if (advocateId) query = query.where('advocateId', '==', advocateId);
    if (clientId) query = query.where('clientId', '==', clientId);

    const snapshot = await query.get();
    const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({ cases, total: cases.length });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET single case
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('cases').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error fetching case:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// POST create case
router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const caseData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user.uid,
    };

    const docRef = await db.collection('cases').add(caseData);
    res.status(201).json({ id: docRef.id, ...caseData });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// PUT update case
router.put('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
      updatedBy: req.user.uid,
    };

    await db.collection('cases').doc(req.params.id).update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (error) {
    console.error('Error updating case:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE case (soft delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('cases').doc(req.params.id).update({
      status: 'ARCHIVED',
      deletedAt: new Date(),
      deletedBy: req.user.uid,
    });
    res.json({ message: 'Case archived successfully' });
  } catch (error) {
    console.error('Error archiving case:', error);
    res.status(500).json({ error: 'Failed to archive case' });
  }
});

module.exports = router;
