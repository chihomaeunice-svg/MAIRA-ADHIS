import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for development
const DEMO_ACCOUNTS: Array<{ email: string; password: string; user: User }> = [
  {
    email: 'admin@maira-adhis.com',
    password: 'admin123',
    user: {
      id: 'user-001',
      name: 'System Administrator',
      email: 'admin@maira-adhis.com',
      role: 'ADMIN',
      phone: '+255 763 717 988',
      createdAt: new Date('2020-01-01'),
    },
  },
  {
    email: 'partner@maira-adhis.com',
    password: 'partner123',
    user: {
      id: 'user-002',
      name: 'Adv. Maira Hassan',
      email: 'partner@maira-adhis.com',
      role: 'MANAGING_PARTNER',
      phone: '+255 763 717 988',
      createdAt: new Date('2005-01-01'),
    },
  },
  {
    email: 'advocate@maira-adhis.com',
    password: 'advocate123',
    user: {
      id: 'user-003',
      name: 'Adv. Adhis Nkrumah',
      email: 'advocate@maira-adhis.com',
      role: 'ADVOCATE',
      phone: '+255 754 494 010',
      createdAt: new Date('2010-06-01'),
    },
  },
  {
    email: 'secretary@maira-adhis.com',
    password: 'secretary123',
    user: {
      id: 'user-004',
      name: 'Florence Kamau',
      email: 'secretary@maira-adhis.com',
      role: 'SECRETARY',
      phone: '+255 785 678 901',
      createdAt: new Date('2018-03-01'),
    },
  },
  {
    email: 'accounts@maira-adhis.com',
    password: 'accounts123',
    user: {
      id: 'user-005',
      name: 'Robert Osei',
      email: 'accounts@maira-adhis.com',
      role: 'ACCOUNTANT',
      phone: '+255 756 432 109',
      createdAt: new Date('2020-07-01'),
    },
  },
];

const AUTH_STORAGE_KEY = 'maira-adhis-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.user) {
          setUser(parsed.user);
        }
      }
    } catch {
      // Invalid storage data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (account) {
      setUser(account.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: account.user }));
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password. Please try again.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export const DEMO_ACCOUNTS_LIST = DEMO_ACCOUNTS.map(({ email, password, user }) => ({
  email,
  password,
  role: user.role,
  name: user.name,
}));
