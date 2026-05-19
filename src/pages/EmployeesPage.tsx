import React, { useState, useEffect } from 'react';
import {
  UserCog, Plus, Search, Phone, Mail, Calendar,
  DollarSign, Clock, CheckCircle2,
} from 'lucide-react';
import { mockEmployees } from '@/data/mockData';
import { Employee } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';

const EmployeesPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const [employees] = useState<Employee[]>(mockEmployees);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => { setPageTitle('Employees'); }, [setPageTitle]);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGING_PARTNER';
  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filtered = employees.filter((e) => {
    const matchSearch =
      !search ||
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  const deptColors: Record<string, string> = {
    Legal: 'bg-blue-50 text-blue-700',
    Administration: 'bg-purple-50 text-purple-700',
    Finance: 'bg-green-50 text-green-700',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {employees.length} staff members</p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Staff', value: employees.length, color: 'bg-blue-50 border-blue-200' },
          { label: 'Legal Dept', value: employees.filter((e) => e.department === 'Legal').length, color: 'bg-purple-50 border-purple-200' },
          { label: 'Admin Dept', value: employees.filter((e) => e.department === 'Administration').length, color: 'bg-green-50 border-green-200' },
          { label: 'Finance Dept', value: employees.filter((e) => e.department === 'Finance').length, color: 'bg-amber-50 border-amber-200' },
        ].map((s) => (
          <div key={s.label} className={clsx('rounded-xl border p-4 text-center', s.color)}>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {departments.map((dept) => (
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
            placeholder="Search by name, position, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {/* Employee Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <UserCog className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No employees found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <div key={emp.id} className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-700 text-lg font-bold">
                    {emp.fullName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{emp.fullName}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{emp.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', deptColors[emp.department] || 'bg-gray-100 text-gray-600')}>
                      {emp.department}
                    </span>
                    <span className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                      emp.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}>
                      <CheckCircle2 className="h-3 w-3" />
                      {emp.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {emp.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  Since {formatDate(emp.contractStartDate)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                {isAdmin && (
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <DollarSign className="h-3 w-3" />
                      Salary
                    </div>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{formatCurrency(emp.salary)}</p>
                  </div>
                )}
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    Leave
                  </div>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5">{emp.leaveBalance} days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
