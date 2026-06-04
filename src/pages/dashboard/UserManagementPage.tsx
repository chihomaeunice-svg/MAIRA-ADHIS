import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { FirestoreUser, UserRole } from '@/types';
import { ROLE_LABELS, ROLE_COLORS, ROLE_PERMISSIONS } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import {
  Users, Shield, UserCheck, Clock, Search, ChevronDown,
  CheckCircle, XCircle, RefreshCw, Crown, UserPlus, Trash2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ALL_ROLES: UserRole[] = [
  'ADMIN', 'MANAGING_PARTNER', 'ADVOCATE', 'SECRETARY',
  'ACCOUNTANT', 'PROCUREMENT_OFFICER', 'EMPLOYEE',
];

const DEPARTMENTS = ['Management', 'Legal', 'Administration', 'Finance', 'Procurement', 'General'];

const LOCAL_FALLBACK_USERS: FirestoreUser[] = [
  {
    uid: 'local-admin',
    name: 'Admin User',
    email: 'admin@adhisadvocates.co.tz',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    uid: 'local-partner',
    name: 'Managing Partner',
    email: 'partner@adhisadvocates.co.tz',
    role: 'MANAGING_PARTNER',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    uid: 'local-advocate',
    name: 'Senior Advocate',
    email: 'advocate@adhisadvocates.co.tz',
    role: 'ADVOCATE',
    status: 'ACTIVE',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    uid: 'local-secretary',
    name: 'Office Secretary',
    email: 'secretary@adhisadvocates.co.tz',
    role: 'SECRETARY',
    status: 'ACTIVE',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    uid: 'local-accountant',
    name: 'Firm Accountant',
    email: 'accountant@adhisadvocates.co.tz',
    role: 'ACCOUNTANT',
    status: 'ACTIVE',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
];

interface AddUserForm {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone: string;
}

const defaultAddForm = (): AddUserForm => ({
  name: '', email: '', role: 'EMPLOYEE', department: 'General', phone: '',
});

const UserManagementPage: React.FC = () => {
  const { user: currentUser, isLocalSession } = useAuthStore();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>(defaultAddForm());
  const [addingUser, setAddingUser] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    if (isLocalSession) {
      setUsers(LOCAL_FALLBACK_USERS);
      setLoading(false);
      return;
    }
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => ({
        uid: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
        lastLogin: d.data().lastLogin?.toDate?.() ?? null,
      })) as FirestoreUser[];
      const sorted = data.sort((a, b) => ALL_ROLES.indexOf(a.role) - ALL_ROLES.indexOf(b.role));
      setUsers(sorted.length > 0 ? sorted : LOCAL_FALLBACK_USERS);
    } catch {
      toast.error('Failed to load users — showing local data');
      setUsers(LOCAL_FALLBACK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    if (uid === currentUser?.id && newRole !== 'ADMIN') {
      toast.error('You cannot remove your own admin role.');
      return;
    }
    setUpdatingId(uid);
    setOpenRoleDropdown(null);
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: serverTimestamp() });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${ROLE_LABELS[newRole]}`);
    } catch {
      toast.error('Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (uid: string, currentStatus: string) => {
    if (uid === currentUser?.id) {
      toast.error('You cannot deactivate your own account.');
      return;
    }
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingId(uid);
    try {
      await updateDoc(doc(db, 'users', uid), { status: newStatus, updatedAt: serverTimestamp() });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus as 'ACTIVE' | 'INACTIVE' } : u));
      toast.success(`Account ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) { toast.error('Name is required'); return; }
    if (!addForm.email.trim()) { toast.error('Email is required'); return; }
    setAddingUser(true);
    try {
      const uid = `manual-${Date.now()}`;
      const newUser = {
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        role: addForm.role,
        department: addForm.department || null,
        phone: addForm.phone.trim() || null,
        status: 'ACTIVE',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), newUser);
      setUsers(prev => [...prev, {
        uid,
        name: addForm.name.trim(),
        email: addForm.email.trim().toLowerCase(),
        role: addForm.role,
        department: addForm.department || undefined,
        phone: addForm.phone.trim() || undefined,
        status: 'ACTIVE' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      }].sort((a, b) => ALL_ROLES.indexOf(a.role) - ALL_ROLES.indexOf(b.role)));
      toast.success(`${addForm.name} added to the system`);
      setShowAddUser(false);
      setAddForm(defaultAddForm());
    } catch {
      toast.error('Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (uid === currentUser?.id) {
      toast.error('You cannot delete your own account.');
      setDeleteConfirmId(null);
      return;
    }
    setUpdatingId(uid);
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
      toast.success('User removed');
    } catch {
      toast.error('Failed to remove user');
    } finally {
      setUpdatingId(null);
      setDeleteConfirmId(null);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pending: users.filter(u => u.role === 'EMPLOYEE').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
  };

  const formatLastLogin = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage staff accounts and role permissions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-gray-500" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Staff', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Pending Role', value: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Administrators', value: stats.admins, icon: Crown, color: 'text-red-600 bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'ADMIN', 'ADVOCATE', 'SECRETARY', 'ACCOUNTANT', 'EMPLOYEE'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r as UserRole | 'ALL')}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                roleFilter === r ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {r === 'ALL' ? 'All Users' : ROLE_LABELS[r as UserRole]}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Staff Member', 'Role', 'Access Level', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u.uid} className={clsx('hover:bg-gray-50 transition-colors', updatingId === u.uid && 'opacity-60')}>
                    {/* Staff Member */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0',
                          u.role === 'ADMIN' ? 'bg-red-500' : 'bg-primary-600'
                        )}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900">{u.name}</p>
                            {u.uid === currentUser?.id && (
                              <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-medium">You</span>
                            )}
                            {u.role === 'ADMIN' && <Crown className="h-3.5 w-3.5 text-yellow-500" />}
                          </div>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role with dropdown */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenRoleDropdown(openRoleDropdown === u.uid ? null : u.uid)}
                          disabled={updatingId === u.uid}
                          className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all',
                            ROLE_COLORS[u.role],
                            'hover:ring-2 hover:ring-offset-1 hover:ring-primary-400 cursor-pointer'
                          )}
                        >
                          {ROLE_LABELS[u.role]}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        {openRoleDropdown === u.uid && (
                          <div className="absolute top-8 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[200px]">
                            <p className="px-3 py-1.5 text-xs text-gray-400 font-medium uppercase tracking-wide border-b border-gray-100 mb-1">
                              Change Role
                            </p>
                            {ALL_ROLES.map(role => (
                              <button
                                key={role}
                                onClick={() => handleRoleChange(u.uid, role)}
                                className={clsx(
                                  'w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                                  u.role === role && 'bg-primary-50 text-primary-700'
                                )}
                              >
                                <span>{ROLE_LABELS[role]}</span>
                                {u.role === role && <CheckCircle className="h-3.5 w-3.5 text-primary-600" />}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Access level */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {(ROLE_PERMISSIONS[u.role] || []).slice(0, 3).map(p => (
                          <span key={p} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">{p}</span>
                        ))}
                        {ROLE_PERMISSIONS[u.role]?.length > 3 && (
                          <span className="text-xs text-gray-400">+{ROLE_PERMISSIONS[u.role].length - 3} more</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      )}>
                        {u.status === 'ACTIVE' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {u.status}
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatLastLogin(u.lastLogin)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusToggle(u.uid, u.status)}
                          disabled={updatingId === u.uid || u.uid === currentUser?.id}
                          className={clsx(
                            'text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
                            u.status === 'ACTIVE'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          )}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>

                        {deleteConfirmId === u.uid ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="text-xs px-2 py-1.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-xs px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(u.uid)}
                            disabled={updatingId === u.uid || u.uid === currentUser?.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800">Role Change Notice</p>
          <p className="text-amber-700 mt-0.5">
            New staff members are assigned the <strong>Employee</strong> role by default with limited access.
            Click on a role badge to change it. Changes take effect on the user's next login.
          </p>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Staff Member</h2>
              <button onClick={() => { setShowAddUser(false); setAddForm(defaultAddForm()); }} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form id="add-user-form" onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Adv. Jane Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="e.g. jane.doe@maca.co.tz"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={addForm.role}
                    onChange={e => setAddForm(f => ({ ...f, role: e.target.value as UserRole }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {ALL_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={addForm.department}
                    onChange={e => setAddForm(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                After adding, also create a Firebase Auth account for this person in the Firebase Console so they can log in.
              </p>
            </form>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setShowAddUser(false); setAddForm(defaultAddForm()); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-user-form"
                disabled={addingUser}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addingUser ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
