import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { FirestoreUser, UserRole } from '@/types';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/permissions';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  UserCog, Search, Phone, Mail, RefreshCw, Trash2, Users,
} from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const EmployeesPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const [employees, setEmployees] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGING_PARTNER';

  useEffect(() => { setPageTitle('Employees'); }, [setPageTitle]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const data = snap.docs.map(d => ({
        uid: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
        lastLogin: d.data().lastLogin?.toDate?.() ?? null,
      })) as FirestoreUser[];
      setEmployees(data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      toast.error('Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (uid: string) => {
    if (uid === currentUser?.id) {
      toast.error('You cannot remove your own account.');
      setDeleteConfirmId(null);
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', uid));
      setEmployees(prev => prev.filter(e => e.uid !== uid));
      toast.success('Employee removed');
    } catch {
      toast.error('Failed to remove employee');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const departments = ['All', ...Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[]];

  const filtered = employees.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.department || '').toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const deptStats = Array.from(new Set(employees.map(e => e.department).filter(Boolean))).map(dept => ({
    label: dept as string,
    count: employees.filter(e => e.department === dept).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {employees.length} staff members</p>
        </div>
        <button
          onClick={fetchEmployees}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Staff</p>
        </div>
        {deptStats.slice(0, 3).map((s, i) => (
          <div key={s.label} className={clsx('rounded-xl border p-4 text-center', [
            'border-purple-200 bg-purple-50',
            'border-green-200 bg-green-50',
            'border-amber-200 bg-amber-50',
          ][i] || 'border-gray-200 bg-gray-50')}>
            <p className="text-xl font-bold text-gray-900">{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-wrap">
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                deptFilter === dept ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {dept}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading employees...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No employees found</p>
          {employees.length === 0 && (
            <p className="text-gray-400 text-sm mt-1">Add staff accounts from User Management</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.uid} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                  emp.role === 'ADMIN' ? 'bg-red-100' : 'bg-primary-100'
                )}>
                  <span className={clsx('text-lg font-bold', emp.role === 'ADMIN' ? 'text-red-700' : 'text-primary-700')}>
                    {emp.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{emp.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[emp.role as UserRole] || 'bg-gray-100 text-gray-600')}>
                      {ROLE_LABELS[emp.role as UserRole] || emp.role}
                    </span>
                    {emp.department && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                        {emp.department}
                      </span>
                    )}
                  </div>
                  <span className={clsx(
                    'text-xs mt-1 inline-block font-medium',
                    emp.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'
                  )}>
                    {emp.status}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    {emp.phone}
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="pt-3 border-t border-gray-100">
                  {deleteConfirmId === emp.uid ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(emp.uid)}
                        className="flex-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="flex-1 text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(emp.uid)}
                      disabled={emp.uid === currentUser?.id}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Employee
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
