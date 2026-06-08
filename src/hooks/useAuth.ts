import { useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { FirestoreUser, UserRole } from '@/types';
import toast from 'react-hot-toast';

// Hardcoded bootstrap credentials for the initial firm admins.
// On first login these auto-create a real Firebase Auth + Firestore account.
const LOCAL_STAFF: Record<string, { password: string; name: string; role: UserRole; department: string }> = {
  'admin1@maca.co.tz':          { password: 'Admin@Maira2024', name: 'Adv. Maira Hassan',  role: 'ADMIN',               department: 'Management'    },
  'admin2@maca.co.tz':          { password: 'Admin@Adhis2024', name: 'Adv. Adhis Nkrumah', role: 'ADMIN',               department: 'Management'    },
  'james.kimani@maca.co.tz':    { password: 'Staff@2024!',     name: 'James Kimani',        role: 'ADVOCATE',            department: 'Legal'         },
  'florence.mwangi@maca.co.tz': { password: 'Staff@2024!',     name: 'Florence Mwangi',     role: 'SECRETARY',           department: 'Administration'},
  'robert.osei@maca.co.tz':     { password: 'Staff@2024!',     name: 'Robert Osei',         role: 'ACCOUNTANT',          department: 'Finance'       },
  'amina.saleh@maca.co.tz':     { password: 'Staff@2024!',     name: 'Amina Saleh',         role: 'PROCUREMENT_OFFICER', department: 'Procurement'   },
  'david.njoroge@maca.co.tz':   { password: 'Staff@2024!',     name: 'David Njoroge',       role: 'EMPLOYEE',            department: 'General'       },
  'grace.wanjiku@maca.co.tz':   { password: 'Staff@2024!',     name: 'Grace Wanjiku',       role: 'EMPLOYEE',            department: 'General'       },
};

export function useAuth() {
  const { setUser, logout: storeLogout, setLoading } = useAuthStore();

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
        // New account — create Firestore profile, using LOCAL_STAFF map for role if available
        const local = LOCAL_STAFF[firebaseUser.email?.toLowerCase() || ''];
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
        storeLogout();
      }
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      // Normal sign-in — works for all users who already have Firebase Auth accounts
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const profile = await fetchUserProfile(userCredential.user);
      if (profile?.status === 'INACTIVE') {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Contact your administrator.');
      }
      return profile;
    } catch (firebaseErr: unknown) {
      const code = (firebaseErr as { code?: string })?.code;

      // If no Firebase Auth account exists yet, check LOCAL_STAFF and auto-create one
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        const local = LOCAL_STAFF[normalizedEmail];
        if (local && local.password === password) {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
            const profile = await fetchUserProfile(newCred.user);
            toast.success(`Welcome, ${local.name}!`);
            return profile;
          } catch (createErr: unknown) {
            const createCode = (createErr as { code?: string })?.code;
            // Account actually exists but password was wrong — re-throw original error
            if (createCode === 'auth/email-already-in-use') throw firebaseErr;
            throw createErr;
          }
        }
      }

      throw firebaseErr;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch { /* ignore */ }
    storeLogout();
    toast.success('Signed out successfully');
  };

  return { login, logout };
}
