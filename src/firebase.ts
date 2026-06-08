import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: "AIzaSyB9oV7n3Tm2WJJIP1e2Ql1BkMqC0b5gFh4",
  authDomain: "maira-adhis.firebaseapp.com",
  projectId: "maira-adhis",
  storageBucket: "maira-adhis.firebasestorage.app",
  messagingSenderId: "558234463503",
  appId: "1:558234463503:web:b55176a470e1f11394227a",
  measurementId: "G-FE8DCQF0HF"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, auth, db, storage, analytics };
