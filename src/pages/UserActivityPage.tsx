import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { FirestoreUser, UserRole } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions';
import { useUIStore } from '@/stores/uiStore';
import { Activity, RefreshCw, Users } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

type Filter = 'all' | 'active' | 'inactive';

const UserActivityPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => { setPageTitle('User Activity'); }, [setPageTitle]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          uid: d.id,
          name: raw.name,
          email: raw.email,
          role: raw.role,
          department: raw.department,
          phone: raw.phone,
          avatar: raw.avatar,
          status: raw.status,
          isCurrentlyActive: raw.isCurrentlyActive ?? false,
          createdAt: raw.createdAt?.toDate?.() ?? new Date(),
          updatedAt: raw.updatedAt?.toDate?.() ?? new Date(),
          lastLogin: raw.lastLogin?.toDate?.() ?? null,
          currentSessionStart: raw.currentSessionStart?.toDate?.() ?? null,
          lastLogoutAt: raw.lastLogoutAt?.toDate?.() ?? null,
        } as FirestoreUser;
      });
      setUsers(data.sort((a, b) => {
        if (a.isCurrentlyActive && !b.isCurrentlyActive) return -1;
        if (!a.isCurrentlyActive && b.isCurrentlyActive) return 1;
        return a.name.localeCompare(b.name);
      }));
    } catch {
      toast.error('Failed to load user activity');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const sessionDuration = (u: FirestoreUser): string => {
    if (!u.isCurrentlyActive || !u.currentSessionStart) return '—';
    const now = new Date();
    const diff = now.getTime() - u.currentSessionStart.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'active') return u.isCurrentlyActive;
    if (filter === 'inactive') return !u.isCurrentlyActive;
    return true;
  });

  const activeCount = users.filter(u => u.isCurrentlyActive).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">User Activity</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeCount} of {users.length} staff currently active</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{users.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Staff</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Now</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{users.length - activeCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">Offline</p>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['all', 'active', 'inactive'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize',
              filter === f ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading user activity...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Staff</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.isCurrentlyActive && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[user.role as UserRole] || 'bg-gray-100 text-gray-600')}>
                      {ROLE_LABELS[user.role as UserRole] || user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={clsx('text-xs font-medium flex items-center gap-1.5', user.isCurrentlyActive ? 'text-green-600' : 'text-gray-400')}>
                      <Activity className="h-3.5 w-3.5" />
                      {user.isCurrentlyActive ? 'Active' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {user.isCurrentlyActive && user.currentSessionStart
                      ? <>Since {user.currentSessionStart.toLocaleTimeString()} ({sessionDuration(user)})</>
                      : user.lastLogoutAt
                        ? <>Logged out {user.lastLogoutAt.toLocaleString()}</>
                        : user.lastLogin
                          ? <>Last seen {user.lastLogin.toLocaleString()}</>
                          : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserActivityPage;
