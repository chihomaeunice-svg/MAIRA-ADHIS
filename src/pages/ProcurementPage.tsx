import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Plus, Search, CheckCircle2, Clock, XCircle, Package,
  TrendingUp, TrendingDown, DollarSign, X, Trash2, Receipt,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useStorage } from '@/hooks/useStorage';
import { mockProcurement, mockExpenses, mockEmployees } from '@/data/mockData';
import { Procurement, ProcurementStatus, Expense, ExpenseCategory } from '@/types';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const STATUSES: { value: ProcurementStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'REJECTED', label: 'Rejected' },
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['RENT', 'UTILITIES', 'STATIONERY', 'TRANSPORT', 'SALARY', 'MISCELLANEOUS'];
const INCOME_STATUSES = ['RECEIVED', 'PENDING', 'PARTIAL'] as const;
type IncomeStatus = typeof INCOME_STATUSES[number];

const EXPENSE_COLORS: Record<string, string> = {
  RENT: 'bg-blue-50 text-blue-700',
  UTILITIES: 'bg-teal-50 text-teal-700',
  SALARY: 'bg-purple-50 text-purple-700',
  STATIONERY: 'bg-green-50 text-green-700',
  TRANSPORT: 'bg-amber-50 text-amber-700',
  MISCELLANEOUS: 'bg-gray-100 text-gray-600',
};

const INCOME_STATUS_COLORS: Record<IncomeStatus, string> = {
  RECEIVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
};

interface FirestoreExpense {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  approvedBy: string;
  receiptUrl?: string;
  createdAt: Date;
}

interface IncomeRecord {
  id: string;
  date: string;
  clientName: string;
  description: string;
  amount: number;
  caseReference?: string;
  status: IncomeStatus;
  createdAt: Date;
}

const todayStr = () => new Date().toISOString().split('T')[0];

const ProcurementPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const isAdmin = useAuthStore((s) => s.isAdmin)();
  const { uploadFile, uploading, progress } = useStorage();

  const [activeTab, setActiveTab] = useState<'expenses' | 'income' | 'procurement'>('expenses');

  // Expenses
  const [expenses, setExpenses] = useState<FirestoreExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    date: todayStr(), category: 'RENT' as ExpenseCategory, description: '', amount: '', approvedBy: '', receiptFile: null as File | null,
  });

  // Income
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [loadingIncome, setLoadingIncome] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({
    date: todayStr(), clientName: '', description: '', amount: '', caseReference: '', status: 'RECEIVED' as IncomeStatus,
  });

  // Procurement
  const [procurements] = useState<Procurement[]>(mockProcurement);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | 'ALL'>('ALL');
  const [showProcModal, setShowProcModal] = useState(false);
  const [procForm, setProcForm] = useState({
    itemName: '', quantity: '1', unitPrice: '', supplier: '',
  });
  const [savingProc, setSavingProc] = useState(false);

  useEffect(() => { setPageTitle('Procurement & Finances'); }, [setPageTitle]);

  // ─── Fetch Expenses ────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(async () => {
    setLoadingExpenses(true);
    try {
      const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setExpenses(snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            date: data.date,
            category: data.category,
            description: data.description,
            amount: data.amount,
            approvedBy: data.approvedBy || '',
            receiptUrl: data.receiptUrl,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        }));
      } else {
        setExpenses(mockExpenses.map((e) => ({
          id: e.id,
          date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date),
          category: e.category,
          description: e.description,
          amount: e.amount,
          approvedBy: e.approvedBy || '',
          receiptUrl: e.receiptUrl,
          createdAt: e.date instanceof Date ? e.date : new Date(),
        })));
      }
    } catch {
      setExpenses(mockExpenses.map((e) => ({
        id: e.id,
        date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e.date),
        category: e.category,
        description: e.description,
        amount: e.amount,
        approvedBy: e.approvedBy || '',
        receiptUrl: e.receiptUrl,
        createdAt: e.date instanceof Date ? e.date : new Date(),
      })));
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  // ─── Fetch Income ──────────────────────────────────────────────────────────
  const fetchIncome = useCallback(async () => {
    setLoadingIncome(true);
    try {
      const q = query(collection(db, 'income'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setIncome(snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          date: data.date,
          clientName: data.clientName,
          description: data.description,
          amount: data.amount,
          caseReference: data.caseReference,
          status: data.status,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        };
      }));
    } catch {
      setIncome([]);
    } finally {
      setLoadingIncome(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); fetchIncome(); }, [fetchExpenses, fetchIncome]);

  // ─── Monthly Totals ────────────────────────────────────────────────────────
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const monthlyExpenses = expenses
    .filter((e) => { const d = new Date(e.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
    .reduce((s, e) => s + e.amount, 0);

  const monthlyIncome = income
    .filter((i) => { const d = new Date(i.date); return d.getMonth() === thisMonth && d.getFullYear() === thisYear; })
    .reduce((s, i) => s + i.amount, 0);

  const netBalance = monthlyIncome - monthlyExpenses;

  const pendingIncome = income
    .filter((i) => i.status === 'PENDING' || i.status === 'PARTIAL')
    .reduce((s, i) => s + i.amount, 0);

  // ─── Add Expense ───────────────────────────────────────────────────────────
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseForm.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    try {
      let receiptUrl: string | undefined;
      if (expenseForm.receiptFile) {
        const path = `receipts/${expenseForm.receiptFile.name}-${Date.now()}`;
        receiptUrl = await uploadFile(expenseForm.receiptFile, path);
      }
      await addDoc(collection(db, 'expenses'), {
        date: expenseForm.date,
        category: expenseForm.category,
        description: expenseForm.description.trim(),
        amount,
        approvedBy: expenseForm.approvedBy.trim(),
        receiptUrl: receiptUrl || null,
        addedBy: user?.id || 'unknown',
        createdAt: Timestamp.now(),
      });
      toast.success('Expense recorded');
      setShowExpenseModal(false);
      setExpenseForm({ date: todayStr(), category: 'RENT', description: '', amount: '', approvedBy: '', receiptFile: null });
      fetchExpenses();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save expense');
    }
  };

  // ─── Add Income ────────────────────────────────────────────────────────────
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(incomeForm.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    if (!incomeForm.clientName.trim()) { toast.error('Client name is required'); return; }
    try {
      await addDoc(collection(db, 'income'), {
        date: incomeForm.date,
        clientName: incomeForm.clientName.trim(),
        description: incomeForm.description.trim(),
        amount,
        caseReference: incomeForm.caseReference.trim() || null,
        status: incomeForm.status,
        addedBy: user?.id || 'unknown',
        createdAt: Timestamp.now(),
      });
      toast.success('Income recorded');
      setShowIncomeModal(false);
      setIncomeForm({ date: todayStr(), clientName: '', description: '', amount: '', caseReference: '', status: 'RECEIVED' });
      fetchIncome();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save income');
    }
  };

  // ─── Delete Expense ────────────────────────────────────────────────────────
  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Delete this expense record?')) return;
    try {
      await deleteDoc(doc(db, 'expenses', id));
      toast.success('Expense deleted');
      fetchExpenses();
    } catch { toast.error('Failed to delete'); }
  };

  // ─── Delete Income ─────────────────────────────────────────────────────────
  const handleDeleteIncome = async (id: string) => {
    if (!confirm('Delete this income record?')) return;
    try {
      await deleteDoc(doc(db, 'income', id));
      toast.success('Income record deleted');
      fetchIncome();
    } catch { toast.error('Failed to delete'); }
  };

  // ─── Add Procurement ───────────────────────────────────────────────────────
  const handleAddProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const unitPrice = parseFloat(procForm.unitPrice);
    const qty = parseInt(procForm.quantity, 10);
    if (!procForm.itemName.trim()) { toast.error('Item name required'); return; }
    if (!unitPrice || unitPrice <= 0) { toast.error('Valid unit price required'); return; }
    setSavingProc(true);
    try {
      await addDoc(collection(db, 'procurement'), {
        itemName: procForm.itemName.trim(),
        quantity: qty || 1,
        unitPrice,
        totalPrice: (qty || 1) * unitPrice,
        supplier: procForm.supplier.trim(),
        status: 'PENDING',
        requestedBy: user?.name || 'Unknown',
        date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now(),
      });
      toast.success('Purchase request submitted');
      setShowProcModal(false);
      setProcForm({ itemName: '', quantity: '1', unitPrice: '', supplier: '' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit request');
    } finally {
      setSavingProc(false);
    }
  };

  const filteredProc = procurements.filter((p) => {
    const matchSearch = !search || p.itemName.toLowerCase().includes(search.toLowerCase()) || p.supplier.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Procurement & Finances</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track expenses, income, and procurement requests</p>
        </div>
        {activeTab === 'expenses' && (
          <button onClick={() => setShowExpenseModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        )}
        {activeTab === 'income' && (
          <button onClick={() => setShowIncomeModal(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> Add Income
          </button>
        )}
        {activeTab === 'procurement' && (
          <button onClick={() => setShowProcModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
            <Plus className="h-4 w-4" /> New Request
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-50 rounded-xl"><TrendingUp className="h-5 w-5 text-green-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Income This Month</p>
              <p className="text-base font-bold text-gray-900 truncate">{formatCurrency(monthlyIncome)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-red-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-50 rounded-xl"><TrendingDown className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Expenses This Month</p>
              <p className="text-base font-bold text-gray-900 truncate">{formatCurrency(monthlyExpenses)}</p>
            </div>
          </div>
        </div>
        <div className={clsx('bg-white rounded-xl border p-4 shadow-card', netBalance >= 0 ? 'border-blue-200' : 'border-orange-200')}>
          <div className="flex items-center gap-3">
            <div className={clsx('p-2.5 rounded-xl', netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50')}>
              <DollarSign className={clsx('h-5 w-5', netBalance >= 0 ? 'text-blue-600' : 'text-orange-600')} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Balance</p>
              <p className={clsx('text-base font-bold truncate', netBalance >= 0 ? 'text-blue-700' : 'text-orange-700')}>{formatCurrency(netBalance)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 rounded-xl"><Clock className="h-5 w-5 text-amber-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Pending Payments</p>
              <p className="text-base font-bold text-gray-900 truncate">{formatCurrency(pendingIncome)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(['expenses', 'income', 'procurement'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize',
              activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'procurement' ? `Procurement (${procurements.length})` : tab === 'expenses' ? `Expenses (${expenses.length})` : `Income (${income.length})`}
          </button>
        ))}
      </div>

      {/* ── EXPENSES TAB ── */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          {loadingExpenses ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingDown className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No expenses recorded yet</p>
              <button onClick={() => setShowExpenseModal(true)} className="mt-3 text-sm text-primary-600 hover:underline">Add first expense</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Description</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount (TZS)</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Approved By</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Receipt</th>
                    {isAdmin && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(exp.date)}</td>
                      <td className="px-5 py-3.5">
                        <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', EXPENSE_COLORS[exp.category] || 'bg-gray-100 text-gray-600')}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 max-w-[220px] truncate">{exp.description}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-gray-900">{exp.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">{exp.approvedBy || '—'}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        {exp.receiptUrl ? (
                          <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                            <Receipt className="h-3.5 w-3.5" /> View
                          </a>
                        ) : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleDeleteExpense(exp.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-900">Total</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-gray-900">{totalExpenses.toLocaleString()}</td>
                    <td colSpan={isAdmin ? 3 : 2} className="hidden md:table-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── INCOME TAB ── */}
      {activeTab === 'income' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
          {loadingIncome ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 text-sm">Loading income records...</p>
            </div>
          ) : income.length === 0 ? (
            <div className="py-12 text-center">
              <TrendingUp className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No income recorded yet</p>
              <button onClick={() => setShowIncomeModal(true)} className="mt-3 text-sm text-green-600 hover:underline">Record first income</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Client</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Description</th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Amount (TZS)</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Case Ref</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                    {isAdmin && <th className="px-5 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {income.map((inc) => (
                    <tr key={inc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600">{formatDate(inc.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{inc.clientName}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 max-w-[200px] truncate">{inc.description}</td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-green-700">{inc.amount.toLocaleString()}</td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-sm text-gray-500">{inc.caseReference || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', INCOME_STATUS_COLORS[inc.status])}>
                          {inc.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3.5">
                          <button onClick={() => handleDeleteIncome(inc.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td colSpan={3} className="px-5 py-3 text-sm font-semibold text-gray-900">Total Income</td>
                    <td className="px-5 py-3 text-right text-sm font-bold text-green-700">{income.reduce((s, i) => s + i.amount, 0).toLocaleString()}</td>
                    <td colSpan={isAdmin ? 3 : 2} className="hidden md:table-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PROCUREMENT TAB ── */}
      {activeTab === 'procurement' && (
        <>
          <div className="flex flex-wrap gap-3">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatusFilter(s.value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                  statusFilter === s.value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
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
                        <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm text-gray-700">{p.supplier}</span></td>
                        <td className="px-5 py-3.5 text-right hidden sm:table-cell"><span className="text-sm text-gray-700">{p.quantity}</span></td>
                        <td className="px-5 py-3.5 text-right"><span className="text-sm font-semibold text-gray-900">{formatCurrency(p.totalPrice)}</span></td>
                        <td className="px-5 py-3.5"><span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(p.status))}>{p.status}</span></td>
                        <td className="px-5 py-3.5 hidden lg:table-cell"><span className="text-sm text-gray-500">{formatDate(p.date)}</span></td>
                        <td className="px-5 py-3.5">
                          {p.status === 'PENDING' && (
                            <div className="flex gap-1">
                              <button className="p-1 rounded text-green-600 hover:bg-green-50" title="Approve"><CheckCircle2 className="h-4 w-4" /></button>
                              <button className="p-1 rounded text-red-600 hover:bg-red-50" title="Reject"><XCircle className="h-4 w-4" /></button>
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

      {/* ── ADD EXPENSE MODAL ── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Expense</h2>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={expenseForm.category} onChange={(e) => setExpenseForm((p) => ({ ...p, category: e.target.value as ExpenseCategory }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input type="text" required value={expenseForm.description} onChange={(e) => setExpenseForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Monthly office rent"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (TZS) *</label>
                  <input type="number" required min="1" value={expenseForm.amount} onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approved By</label>
                  <select value={expenseForm.approvedBy} onChange={(e) => setExpenseForm((p) => ({ ...p, approvedBy: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    <option value="">— Select —</option>
                    {mockEmployees.map((emp) => <option key={emp.id} value={emp.fullName}>{emp.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Upload (optional, max 10MB)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && f.size > 10 * 1024 * 1024) { toast.error('File too large (max 10MB)'); return; }
                    setExpenseForm((p) => ({ ...p, receiptFile: f || null }));
                  }}
                  className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-300 rounded-lg cursor-pointer" />
              </div>
              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1"><span>Uploading receipt...</span><span>{progress}%</span></div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading} className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</> : <><Plus className="h-4 w-4" /> Save Expense</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD INCOME MODAL ── */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Record Income</h2>
              <button onClick={() => setShowIncomeModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddIncome} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" required value={incomeForm.date} onChange={(e) => setIncomeForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={incomeForm.status} onChange={(e) => setIncomeForm((p) => ({ ...p, status: e.target.value as IncomeStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                    {INCOME_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input type="text" required value={incomeForm.clientName} onChange={(e) => setIncomeForm((p) => ({ ...p, clientName: e.target.value }))}
                  placeholder="e.g. Juma Kimaro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input type="text" required value={incomeForm.description} onChange={(e) => setIncomeForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Legal fees for case HC/001/2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (TZS) *</label>
                  <input type="number" required min="1" value={incomeForm.amount} onChange={(e) => setIncomeForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Reference (optional)</label>
                  <input type="text" value={incomeForm.caseReference} onChange={(e) => setIncomeForm((p) => ({ ...p, caseReference: e.target.value }))}
                    placeholder="e.g. HC/CIV/001/2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIncomeModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" /> Record Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD PROCUREMENT MODAL ── */}
      {showProcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Purchase Request</h2>
              <button onClick={() => setShowProcModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleAddProcurement} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                <input type="text" required value={procForm.itemName} onChange={(e) => setProcForm((p) => ({ ...p, itemName: e.target.value }))}
                  placeholder="e.g. Office Stationery Pack"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input type="number" required min="1" value={procForm.quantity} onChange={(e) => setProcForm((p) => ({ ...p, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (TZS) *</label>
                  <input type="number" required min="1" value={procForm.unitPrice} onChange={(e) => setProcForm((p) => ({ ...p, unitPrice: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input type="text" value={procForm.supplier} onChange={(e) => setProcForm((p) => ({ ...p, supplier: e.target.value }))}
                  placeholder="e.g. Office World Tanzania"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              {procForm.unitPrice && procForm.quantity && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <span className="text-blue-700 font-medium">Total: </span>
                  <span className="text-blue-900 font-bold">{formatCurrency(parseFloat(procForm.unitPrice || '0') * parseInt(procForm.quantity || '1', 10))}</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProcModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={savingProc} className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2">
                  {savingProc ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><ShoppingCart className="h-4 w-4" /> Submit Request</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementPage;
