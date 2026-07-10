import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { FirestoreUser } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';
import { Clock, LogIn, LogOut } from 'lucide-react';

const UserActivityPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    setPageTitle('User Activity & Status');
    loadUsers();
    const interval = setInterval(loadUsers, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          ...raw,
          uid: d.id,
          createdAt: raw.createdAt?.toDate?.() ?? new Date(),
          updatedAt: raw.updatedAt?.toDate?.() ?? new Date(),
          lastLogin: raw.lastLogin?.toDate?.() ?? new Date(),
          currentSessionStart: raw.currentSessionStart?.toDate?.() ?? null,
        } as FirestoreUser;
      });
      setUsers(data.sort((a, b) => {
        if (a.isCurrentlyActive && !b.isCurrentlyActive) return -1;
        if (!a.isCurrentlyActive && b.isCurrentlyActive) return 1;
        return (b.lastLogin?.getTime() || 0) - (a.lastLogin?.getTime() || 0);
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSessionDuration = (user: FirestoreUser): string => {
    if (!user.isCurrentlyActive || !user.currentSessionStart) return '—';
    const now = new Date();
    const diff = now.getTime() - user.currentSessionStart.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getLastActivityTime = (user: FirestoreUser): string => {
    if (!user.lastLogin) return 'Never';
    const now = new Date();
    const diff = now.getTime() - user.lastLogin.getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-50 border-red-200',
    MANAGING_PARTNER: 'bg-purple-50 border-purple-200',
    ADVOCATE: 'bg-blue-50 border-blue-200',
    SECRETARY: 'bg-green-50 border-green-200',
    ACCOUNTANT: 'bg-yellow-50 border-yellow-200',
    PROCUREMENT_OFFICER: 'bg-indigo-50 border-indigo-200',
    EMPLOYEE: 'bg-gray-50 border-gray-200',
  };

  const statusDotColor = (user: FirestoreUser): string => {
    if (user.isCurrentlyActive) return 'bg-green-500';
    const now = new Date();
    const lastLogin = user.lastLogin || new Date();
    const diff = now.getTime() - lastLogin.getTime();
    const hoursAgo = diff / 3600000;
    if (hoursAgo < 24) return 'bg-yellow-500';
    if (hoursAgo < 168) return 'bg-orange-500';
    return 'bg-gray-400';
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.isCurrentlyActive;
    if (filter === 'inactive') return !u.isCurrentlyActive;
    return true;
  });

  const activeCount = users.filter(u => u.isCurrentlyActive).length;
  const totalUsers = users.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Active Now</p>
          <p className="text-2xl font-bold text-primary-600">{activeCount}</p>
          <p className="text-xs text-gray-400 mt-2">of {totalUsers} users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Last 24 Hours</p>
          <p className="text-2xl font-bold text-yellow-600">
            {users.filter(u => {
              const now = new Date();
              const diff = (now.getTime() - (u.lastLogin?.getTime() || now.getTime())) / 3600000;
              return diff < 24;
            }).length}
          </p>
          <p className="text-xs text-gray-400 mt-2">recently active</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 font-medium mb-1">Inactive</p>
          <p className="text-2xl font-bold text-gray-600">
            {users.filter(u => {
              const now = new Date();
              const diff = (now.getTime() - (u.lastLogin?.getTime() || now.getTime())) / 3600000;
              return diff >= 24;
            }).length}
          </p>
          <p className="text-xs text-gray-400 mt-2">beyond 24 hours</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f === 'all' ? 'All Users' : f === 'active' ? 'Currently Active' : 'Inactive'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No users found for this filter
          </div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.uid}
              className={clsx(
                'bg-white rounded-xl border-2 p-4 transition-all',
                roleColors[user.role] || roleColors.EMPLOYEE
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={clsx('w-3 h-3 rounded-full mt-1 flex-shrink-0', statusDotColor(user))} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                      <span className="text-xs font-medium text-gray-500 bg-white/70 px-2 py-0.5 rounded">
                        {user.role.replace(/_/g, ' ')}
                      </span>
                      {user.isCurrentlyActive && (
                        <span className="text-xs font-bold text-green-600 bg-green-100/50 px-2 py-0.5 rounded animate-pulse">
                          ONLINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{user.email}</p>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500 mb-0.5 flex items-center gap-1">
                          <LogIn className="h-3 w-3" /> Last Login
                        </p>
                        <p className="font-medium text-gray-900">
                          {user.lastLogin ? getLastActivityTime(user) : 'Never'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {user.lastLogin ? formatDate(user.lastLogin) : '—'}
                        </p>
                      </div>

                      {user.isCurrentlyActive && user.currentSessionStart && (
                        <div>
                          <p className="text-gray-500 mb-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Session Duration
                          </p>
                          <p className="font-medium text-green-600">{getSessionDuration(user)}</p>
                          <p className="text-gray-500 text-xs">
                            Since {user.currentSessionStart.toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right ml-4 flex-shrink-0">
                  <span
                    className={clsx(
                      'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                      user.isCurrentlyActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {user.isCurrentlyActive ? '🟢 Active' : '⚪ Offline'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserActivityPage;
