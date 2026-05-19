import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, Plus, Search, CheckCircle2, Clock,
  XCircle, Package, TrendingUp,
} from 'lucide-react';
import { mockProcurement, mockExpenses } from '@/data/mockData';
import { Procurement, ProcurementStatus, Expense } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const STATUSES: { value: ProcurementStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'REJECTED', label: 'Rejected' },
];

const EXPENSE_COLORS: Record<string, string> = {
  RENT: 'bg-blue-50 text-blue-700',
  UTILITIES: 'bg-teal-50 text-teal-700',
  SALARY: 'bg-purple-50 text-purple-700',
  STATIONERY: 'bg-green-50 text-green-700',
  TRANSPORT: 'bg-amber-50 text-amber-700',
  MISCELLANEOUS: 'bg-gray-100 text-gray-600',
};

const ProcurementPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [procurements] = useState<Procurement[]>(mockProcurement);
  const [expenses] = useState<Expense[]>(mockExpenses);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'procurement' | 'expenses'>('procurement');

  useEffect(() => { setPageTitle('Procurement & Expenses'); }, [setPageTitle]);

  const filteredProc = procurements.filter((p) => {
    const matchSearch = !search || p.itemName.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const pendingCount = procurements.filter((p) => p.status === 'PENDING').length;
  const totalProcurement = procurements
    .filter((p) => p.status !== 'REJECTED')
    .reduce((s, p) => s + p.totalPrice, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Procurement & Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track purchases, expenses, and approvals</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Request
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Procurement</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalProcurement)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Approvals</p>
              <p className="text-lg font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly Expenses</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('procurement')}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'procurement' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Procurement ({procurements.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={clsx(
            'px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeTab === 'expenses' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Expenses ({expenses.length})
        </button>
      </div>

      {activeTab === 'procurement' && (
        <>
          {/* Procurement Filters */}
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                  statusFilter === s.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                )}
              >
                {s.label}
              </button>
            ))}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items or supplier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
          </div>

          {/* Procurement Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
            {filteredProc.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No procurement records found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Item</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Supplier</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Qty</th>
                      <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Total</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProc.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{p.itemName}</p>
                              <p className="text-xs text-gray-500">By: {p.requestedBy}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-sm text-gray-700">{p.supplier}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                          <span className="text-sm text-gray-700">{p.quantity}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(p.totalPrice)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(p.status))}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden lg:table-cell">
                          <span className="text-sm text-gray-500">{formatDate(p.date)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          {p.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button className="p-1 rounded text-green-600 hover:bg-green-50" title="Approve">
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button className="p-1 rounded text-red-600 hover:bg-red-50" title="Reject">
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Description</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', EXPENSE_COLORS[exp.category] || 'bg-gray-100 text-gray-600')}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-700">{exp.description}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(exp.amount)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{formatDate(exp.date)}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-500">{exp.approvedBy || '—'}</span>
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={2} className="px-5 py-3">
                    <span className="text-sm font-semibold text-gray-900">Total</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(totalExpenses)}</span>
                  </td>
                  <td colSpan={2} className="hidden sm:table-cell"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
