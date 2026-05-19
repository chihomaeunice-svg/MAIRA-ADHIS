const admin = require('firebase-admin');
require('dotenv').config();

let db, auth, storage;

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    // Initialize with service account or default credentials
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // For development without service account
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'maira-adhis-dev',
      });
    }
  }

  db = admin.firestore();
  auth = admin.auth();
  storage = admin.storage();

  return { db, auth, storage };
};

module.exports = { initializeFirebase, getDb: () => db, getAuth: () => auth, getStorage: () => storage };
