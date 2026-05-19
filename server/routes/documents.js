const express = require('express');
const router = express.Router();
const { getDb } = require('../firebase');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const { category, caseId, clientId } = req.query;
    let query = db.collection('documents').orderBy('createdAt', 'desc');
    if (category) query = query.where('category', '==', category);
    if (caseId) query = query.where('relatedCaseId', '==', caseId);
    if (clientId) query = query.where('relatedClientId', '==', clientId);
    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ documents, total: documents.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const docData = { ...req.body, uploadedBy: req.user.uid, createdAt: new Date() };
    const docRef = await db.collection('documents').add(docData);
    res.status(201).json({ id: docRef.id, ...docData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create document' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    await db.collection('documents').doc(req.params.id).delete();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router;
