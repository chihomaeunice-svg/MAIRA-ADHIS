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

// Local staff accounts — used when Firebase accounts are not yet created.
// Admins can create Firebase accounts later via Firebase Console.
const LOCAL_STAFF: Record<string, { password: string; name: string; role: UserRole; department: string }> = {
  'admin1@maca.co.tz':          { password: 'Admin@Maira2024', name: 'Adv. Maira Hassan',  role: 'ADMIN',                department: 'Management'   },
  'admin2@maca.co.tz':          { password: 'Admin@Adhis2024', name: 'Adv. Adhis Nkrumah', role: 'ADMIN',                department: 'Management'   },
  'james.kimani@maca.co.tz':    { password: 'Staff@2024!',     name: 'James Kimani',        role: 'ADVOCATE',             department: 'Legal'        },
  'florence.mwangi@maca.co.tz': { password: 'Staff@2024!',     name: 'Florence Mwangi',     role: 'SECRETARY',            department: 'Administration'},
  'robert.osei@maca.co.tz':     { password: 'Staff@2024!',     name: 'Robert Osei',         role: 'ACCOUNTANT',           department: 'Finance'      },
  'amina.saleh@maca.co.tz':     { password: 'Staff@2024!',     name: 'Amina Saleh',         role: 'PROCUREMENT_OFFICER',  department: 'Procurement'  },
  'david.njoroge@maca.co.tz':   { password: 'Staff@2024!',     name: 'David Njoroge',       role: 'EMPLOYEE',             department: 'General'      },
  'grace.wanjiku@maca.co.tz':   { password: 'Staff@2024!',     name: 'Grace Wanjiku',       role: 'EMPLOYEE',             department: 'General'      },
};

export function useAuth() {
  const { setUser, logout: storeLogout, setLoading, isLocalSession } = useAuthStore();
  const [initializing, setInitializing] = useState(true);

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<FirestoreUser | null> => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
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
        const local = LOCAL_STAFF[firebaseUser.email || ''];
        const newUser: Omit<FirestoreUser, 'uid'> = {
          name: local?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || '',
          role: (local?.role || 'EMPLOYEE') as UserRole,
          department: local?.department,
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
        // Real Firebase session — fetch profile from Firestore
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
          }, false);
        }
      } else {
        // No Firebase session — but keep local-only sessions alive
        if (!isLocalSession) {
          storeLogout();
        }
      }
      setLoading(false);
      setInitializing(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    // First try local staff accounts (works without Firebase Auth accounts being created)
    const local = LOCAL_STAFF[email.trim().toLowerCase()];
    if (local && local.password === password) {
      // Sign into Firebase with local credentials
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await fetchUserProfile(userCredential.user);
        if (profile?.status === 'INACTIVE') {
          await signOut(auth);
          throw new Error('Your account has been deactivated. Contact your administrator.');
        }
        return profile;
      } catch (firebaseErr: unknown) {
        const code = (firebaseErr as { code?: string })?.code;
        // If Firebase account doesn't exist yet, log in locally (no Firebase session)
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/invalid-email') {
          // Firebase account not created yet — use local session
          setUser({
            id: `local-${email}`,
            name: local.name,
            email,
            role: local.role,
            createdAt: new Date(),
          }, true); // true = local session, won't be wiped by onAuthStateChanged
          setLoading(false);
          toast.success(`Welcome, ${local.name}!`);
          return null;
        }
        throw firebaseErr;
      }
    }

    // Try Firebase Auth for accounts not in local list
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(userCredential.user);
    if (profile?.status === 'INACTIVE') {
      await signOut(auth);
      throw new Error('Your account has been deactivated. Contact your administrator.');
    }
    return profile;
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // local-only session has no Firebase session to sign out of
    }
    storeLogout();
    toast.success('Signed out successfully');
  };

  return { login, logout, initializing };
}
