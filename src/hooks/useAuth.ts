import { useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@/types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: storeLogout } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: userData.role || 'ADVOCATE',
              phone: userData.phone,
              avatar: userData.avatar || firebaseUser.photoURL || undefined,
              createdAt: userData.createdAt?.toDate() || new Date(),
            } as User);
          } else {
            // Create basic user profile from Firebase Auth
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: 'ADVOCATE',
              createdAt: new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setLoading(false);
        }
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: unknown) {
      setLoading(false);
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.error('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      storeLogout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  // Demo login for testing
  const demoLogin = (role: string) => {
    const demoUsers: Record<string, User> = {
      ADMIN: {
        id: 'demo-admin',
        name: 'Admin User',
        email: 'admin@maca.co.tz',
        role: 'ADMIN',
        createdAt: new Date(),
      },
      MANAGING_PARTNER: {
        id: 'demo-mp',
        name: 'Advocate Maira',
        email: 'maira@maca.co.tz',
        role: 'MANAGING_PARTNER',
        createdAt: new Date(),
      },
      ADVOCATE: {
        id: 'demo-adv',
        name: 'Advocate Adhis',
        email: 'adhis@maca.co.tz',
        role: 'ADVOCATE',
        createdAt: new Date(),
      },
      SECRETARY: {
        id: 'demo-sec',
        name: 'Jane Secretary',
        email: 'secretary@maca.co.tz',
        role: 'SECRETARY',
        createdAt: new Date(),
      },
    };
    const demoUser = demoUsers[role] || demoUsers.ADVOCATE;
    setUser(demoUser);
    toast.success(`Logged in as ${demoUser.name} (${demoUser.role})`);
  };

  return { user, isAuthenticated, isLoading, login, logout, demoLogin };
};
