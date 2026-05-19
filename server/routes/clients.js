const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { type, search, limit = 50 } = req.query;

    let query = db.collection('clients').orderBy('createdAt', 'desc').limit(Number(limit));
    if (type) query = query.where('clientType', '==', type);

    const snapshot = await query.get();
    let clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter(c =>
        c.fullName?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.phone?.includes(s)
      );
    }

    res.json({ clients, total: clients.length });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const doc = await db.collection('clients').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Client not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const clientData = { ...req.body, createdAt: new Date(), cases: [] };
    const docRef = await db.collection('clients').add(clientData);
    res.status(201).json({ id: docRef.id, ...clientData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('clients').doc(req.params.id).update({ ...req.body, updatedAt: new Date() });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

module.exports = router;
