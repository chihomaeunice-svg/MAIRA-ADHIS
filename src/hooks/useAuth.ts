import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { FirestoreUser, UserRole } from '@/types';
import toast from 'react-hot-toast';

export function useAuth() {
  const { setUser, logout: storeLogout, setLoading } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<FirestoreUser | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Update lastLogin
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
        const data = userSnap.data();
        return {
          uid: firebaseUser.uid,
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
          phone: data.phone,
          avatar: data.avatar,
          status: data.status,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
          lastLogin: data.lastLogin?.toDate ? data.lastLogin.toDate() : new Date(),
        } as FirestoreUser;
      } else {
        // First login — create user document with EMPLOYEE role
        const newUser: Omit<FirestoreUser, 'uid'> = {
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: 'EMPLOYEE' as UserRole,
          status: 'ACTIVE',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
        };
        await setDoc(userRef, {
          ...newUser,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        return { uid: firebaseUser.uid, ...newUser };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser);
        if (profile) {
          setUser({
            id: profile.uid,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            phone: profile.phone,
            avatar: profile.avatar,
            createdAt: profile.createdAt,
          });
        }
      } else {
        storeLogout();
      }
      setLoading(false);
      setInitializing(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(userCredential.user);
    if (profile?.status === 'INACTIVE') {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Contact your administrator.');
    }
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    storeLogout();
    toast.success('Signed out successfully');
  };

  return { login, logout, initializing };
}
