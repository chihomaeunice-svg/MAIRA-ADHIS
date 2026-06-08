import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, FileText, TrendingUp, Users, DollarSign, Printer,
  Download, Eye,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  collection, getDocs, query, orderBy,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { formatDate, formatCurrency } from '@/lib/utils';
import { clsx } from 'clsx';

type TabId = 'cases' | 'financial' | 'documents' | 'employees' | 'clients';

const TABS: { id: TabId; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'cases', label: 'Case Reports', icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
  { id: 'financial', label: 'Financial Reports', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { id: 'documents', label: 'Document Reports', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  { id: 'employees', label: 'Employee Reports', icon: Users, color: 'text-orange-600 bg-orange-50' },
  { id: 'clients', label: 'Client Reports', icon: TrendingUp, color: 'text-pink-600 bg-pink-50' },
];

const PRINT_STYLES = `
  body { font-family: Arial, sans-serif; padding: 20px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
  th { background: #1B2B6B; color: white; }
  h1 { color: #1B2B6B; }
  h2 { color: #1B2B6B; border-bottom: 2px solid #C9A227; padding-bottom: 5px; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 3px solid #1B2B6B; padding-bottom: 15px; }
  .firm-name { font-size: 20px; font-weight: bold; color: #1B2B6B; }
  .firm-details { font-size: 11px; color: #666; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
  .stat-box { border: 1px solid #ddd; padding: 10px; text-align: center; border-radius: 4px; }
  .stat-value { font-size: 24px; font-weight: bold; color: #1B2B6B; }
  .stat-label { font-size: 11px; color: #666; }
  @media print { button { display: none; } }
`;

function printReport(elementId: string) {
  const content = document.getElementById(elementId);
  if (!content) return;
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>MAIRA & ADHIS ADVOCATES - Report</title>
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="firm-name">MAIRA &amp; ADHIS ADVOCATES</div>
              <div class="firm-details">17 Usalama Drive, Drive-in Estate, Old Bagamoyo Road, Dar Es Salaam, Tanzania</div>
              <div class="firm-details">Tel: +255 763 717 988 | Email: info@maca.co.tz</div>
            </div>
            <div class="firm-details">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

function printDocument(url: string) {
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => { printWindow.print(); };
  }
}

interface FirestoreCase {
  id: string;
  caseNumber: string;
  title: string;
  status: string;
  category: string;
  advocateName: string;
  clientName: string;
  filingDate: string;
}

interface FirestoreExpense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  approvedBy?: string;
}

interface IncomeRecord {
  id: string;
  date: string;
  clientName: string;
  description: string;
  amount: number;
  caseReference?: string;
  status: string;
}

interface DocRecord {
  id: string;
  name: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedByName: string;
  createdAt: string;
}

interface StaffUser {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  status: string;
}

interface ClientRecord {
  id: string;
  fullName: string;
  clientType: string;
  phone: string;
  email: string;
  address: string;
  caseCount: number;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGING_PARTNER: 'Managing Partner',
  ADVOCATE: 'Advocate',
  SECRETARY: 'Secretary',
  ACCOUNTANT: 'Accountant',
  PROCUREMENT_OFFICER: 'Procurement Officer',
};

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('cases');
  const [cases, setCases] = useState<FirestoreCase[]>([]);
  const [expenses, setExpenses] = useState<FirestoreExpense[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [documents, setDocuments] = useState<DocRecord[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [clientRecords, setClientRecords] = useState<ClientRecord[]>([]);
  const [docCategoryFilter, setDocCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Cases
      const casesSnap = await getDocs(query(collection(db, 'cases'), orderBy('createdAt', 'desc')));
      if (casesSnap.docs.length > 0) {
        setCases(casesSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            caseNumber: data.caseNumber,
            title: data.title,
            status: data.status,
            category: data.category,
            advocateName: data.advocateName || '',
            clientName: data.clientName || data.partiesNames?.plaintiff || '',
            filingDate: data.filingDate?.toDate ? data.filingDate.toDate().toISOString() : String(data.filingDate),
          };
        }));
      } else {
        setCases([]);
      }
    } catch {
      setCases([]);
    }

    try {
      const expSnap = await getDocs(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')));
      if (expSnap.docs.length > 0) {
        setExpenses(expSnap.docs.map((d) => {
          const data = d.data();
          return { id: d.id, date: data.date, category: data.category, description: data.description, amount: data.amount, approvedBy: data.approvedBy };
        }));
      } else {
        setExpenses([]);
      }
    } catch {
      setExpenses([]);
    }

    try {
      const incSnap = await getDocs(query(collection(db, 'income'), orderBy('createdAt', 'desc')));
      setIncome(incSnap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, date: data.date, clientName: data.clientName, description: data.description, amount: data.amount, caseReference: data.caseReference, status: data.status };
      }));
    } catch { setIncome([]); }

    try {
      const docSnap = await getDocs(query(collection(db, 'documents'), orderBy('createdAt', 'desc')));
      setDocuments(docSnap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id, name: data.name, category: data.category, fileUrl: data.fileUrl,
          fileType: data.fileType, fileSize: data.fileSize, uploadedByName: data.uploadedByName,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : String(data.createdAt),
        };
      }));
    } catch { setDocuments([]); }

    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      setStaffUsers(usersSnap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, name: data.name, role: data.role, department: data.department || '', email: data.email, phone: data.phone || '', status: data.status || 'ACTIVE' };
      }));
    } catch { setStaffUsers([]); }

    try {
      const clientsSnap = await getDocs(collection(db, 'clients'));
      const allCasesSnap = await getDocs(collection(db, 'cases'));
      const casesPerClient: Record<string, number> = {};
      allCasesSnap.docs.forEach((d) => { const cid = d.data().clientId; if (cid) casesPerClient[cid] = (casesPerClient[cid] || 0) + 1; });
      setClientRecords(clientsSnap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, fullName: data.fullName, clientType: data.clientType, phone: data.phone, email: data.email, address: data.address || '', caseCount: casesPerClient[d.id] || 0 };
      }));
    } catch { setClientRecords([]); }

    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Computed stats ────────────────────────────────────────────────────────
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpensesSum = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpensesSum;

  const pieData = [
    { name: 'NEW', value: cases.filter((c) => c.status === 'NEW').length, color: '#3b82f6' },
    { name: 'ONGOING', value: cases.filter((c) => c.status === 'ONGOING').length, color: '#f97316' },
    { name: 'COMPLETED', value: cases.filter((c) => c.status === 'COMPLETED').length, color: '#22c55e' },
    { name: 'ARCHIVED', value: cases.filter((c) => c.status === 'ARCHIVED').length, color: '#9ca3af' },
  ];

  // Monthly income vs expenses chart data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const monthlyStats = months.map((month, idx) => ({
    month,
    cases: cases.filter((c) => new Date(c.filingDate).getMonth() === idx).length,
    completed: cases.filter((c) => new Date(c.filingDate).getMonth() === idx && c.status === 'COMPLETED').length,
  }));
  const financialChartData = months.map((month, idx) => {
    const monthIncome = income.filter((i) => new Date(i.date).getMonth() === idx).reduce((s, i) => s + i.amount, 0);
    const monthExpense = expenses.filter((e) => new Date(e.date).getMonth() === idx).reduce((s, e) => s + e.amount, 0);
    return { month, income: monthIncome, expenses: monthExpense };
  });

  const filteredDocs = docCategoryFilter === 'ALL'
    ? documents
    : documents.filter((d) => d.category === docCategoryFilter);

  const docCategories = ['ALL', ...Array.from(new Set(documents.map((d) => d.category)))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Generate and print reports for all departments</p>
        </div>
      </div>

      {/* Tab buttons */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}
          >
            <div className={clsx('w-6 h-6 rounded-lg flex items-center justify-center', activeTab === tab.id ? 'bg-white/20' : tab.color)}>
              <tab.icon className="h-3.5 w-3.5" />
            </div>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── CASE REPORTS ── */}
      {activeTab === 'cases' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => printReport('case-report-content')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
          <div id="case-report-content" className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Case Statistics Report</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Cases', value: cases.length },
                { label: 'Active (Ongoing)', value: cases.filter((c) => c.status === 'ONGOING').length },
                { label: 'Completed', value: cases.filter((c) => c.status === 'COMPLETED').length },
                { label: 'New', value: cases.filter((c) => c.status === 'NEW').length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Cases by Status</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Case Filings 2024</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="cases" fill="#1B2B6B" radius={[3, 3, 0, 0]} name="Filed" />
                    <Bar dataKey="completed" fill="#22c55e" radius={[3, 3, 0, 0]} name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">All Cases</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Case No.</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Title</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Client</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Category</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Filed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs text-gray-700">{c.caseNumber}</td>
                        <td className="px-5 py-3 text-gray-900 font-medium max-w-[200px] truncate">{c.title}</td>
                        <td className="px-5 py-3 text-gray-600 hidden md:table-cell">{c.clientName}</td>
                        <td className="px-5 py-3 hidden lg:table-cell"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{c.category}</span></td>
                        <td className="px-5 py-3">
                          <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', {
                            'bg-blue-100 text-blue-800': c.status === 'NEW',
                            'bg-yellow-100 text-yellow-800': c.status === 'ONGOING',
                            'bg-green-100 text-green-800': c.status === 'COMPLETED',
                            'bg-gray-100 text-gray-800': c.status === 'ARCHIVED',
                          })}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(c.filingDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FINANCIAL REPORTS ── */}
      {activeTab === 'financial' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => printReport('financial-report-content')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
          <div id="financial-report-content" className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Financial Report</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-green-200 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Income</p>
              </div>
              <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpensesSum)}</p>
                <p className="text-sm text-gray-500 mt-1">Total Expenses</p>
              </div>
              <div className={clsx('bg-white rounded-xl border p-4 text-center', netBalance >= 0 ? 'border-blue-200' : 'border-orange-200')}>
                <p className={clsx('text-2xl font-bold', netBalance >= 0 ? 'text-blue-600' : 'text-orange-600')}>{formatCurrency(netBalance)}</p>
                <p className="text-sm text-gray-500 mt-1">Net Balance</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Income vs Expenses</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={financialChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), '']} />
                  <Legend />
                  <Bar dataKey="income" fill="#22c55e" radius={[3, 3, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[3, 3, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Expenses ({expenses.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-xs text-gray-600">{formatDate(e.date)}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-700">{e.category}</td>
                          <td className="px-4 py-2.5 text-xs text-right font-semibold text-red-700">{e.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 border-t-2">
                        <td colSpan={2} className="px-4 py-2.5 text-xs font-bold">Total</td>
                        <td className="px-4 py-2.5 text-xs text-right font-bold text-red-700">{totalExpensesSum.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="text-base font-semibold text-gray-900">Income ({income.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {income.length === 0 ? (
                        <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400 text-sm">No income records yet</td></tr>
                      ) : income.map((i) => (
                        <tr key={i.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-xs text-gray-600">{formatDate(i.date)}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-700 truncate max-w-[120px]">{i.clientName}</td>
                          <td className="px-4 py-2.5 text-xs text-right font-semibold text-green-700">{i.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      {income.length > 0 && (
                        <tr className="bg-gray-50 border-t-2">
                          <td colSpan={2} className="px-4 py-2.5 text-xs font-bold">Total</td>
                          <td className="px-4 py-2.5 text-xs text-right font-bold text-green-700">{totalIncome.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DOCUMENT REPORTS ── */}
      {activeTab === 'documents' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-2">
              {docCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDocCategoryFilter(cat)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    docCategoryFilter === cat ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  )}
                >
                  {cat}
                  <span className="ml-1 opacity-70">({cat === 'ALL' ? documents.length : documents.filter((d) => d.category === cat).length})</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => printReport('document-report-content')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print All Documents List
            </button>
          </div>
          <div id="document-report-content">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Report</h2>
            {filteredDocs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No documents found</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Uploaded By</th>
                        <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Upload Date</th>
                        <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Size</th>
                        <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredDocs.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-gray-900 font-medium max-w-[200px] truncate" title={d.name}>{d.name}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{d.category}</span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 hidden md:table-cell text-xs">{d.uploadedByName}</td>
                          <td className="px-5 py-3 text-gray-500 text-xs hidden sm:table-cell">{formatDate(d.createdAt)}</td>
                          <td className="px-5 py-3 text-right text-gray-500 text-xs hidden lg:table-cell">
                            {d.fileSize ? `${(d.fileSize / 1024).toFixed(0)} KB` : '—'}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {d.fileUrl && d.fileUrl !== '#' && (
                                <>
                                  <button onClick={() => window.open(d.fileUrl, '_blank')} className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium px-2 py-1 rounded hover:bg-primary-50">
                                    <Eye className="h-3.5 w-3.5" /> View
                                  </button>
                                  <button onClick={() => printDocument(d.fileUrl)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100">
                                    <Printer className="h-3.5 w-3.5" /> Print
                                  </button>
                                  <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100">
                                    <Download className="h-3.5 w-3.5" /> Download
                                  </a>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── EMPLOYEE REPORTS ── */}
      {activeTab === 'employees' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => printReport('employee-report-content')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
          <div id="employee-report-content">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Report</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Staff', value: staffUsers.length },
                { label: 'Legal Department', value: staffUsers.filter((e) => e.department === 'Legal').length },
                { label: 'Other Departments', value: staffUsers.filter((e) => e.department !== 'Legal').length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {['Name', 'Role', 'Department', 'Email', 'Phone', 'Status'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staffUsers.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No staff records found</td></tr>
                    ) : staffUsers.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{e.name}</td>
                        <td className="px-5 py-3 text-gray-600">{ROLE_LABELS[e.role] || e.role}</td>
                        <td className="px-5 py-3 text-gray-600">{e.department || '—'}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{e.email}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{e.phone || '—'}</td>
                        <td className="px-5 py-3">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', e.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENT REPORTS ── */}
      {activeTab === 'clients' && (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              onClick={() => printReport('client-report-content')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
          <div id="client-report-content">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Report</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Clients', value: clientRecords.length },
                { label: 'Individual', value: clientRecords.filter((c) => c.clientType === 'INDIVIDUAL').length },
                { label: 'Corporate', value: clientRecords.filter((c) => c.clientType === 'CORPORATE').length },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {['Client Name', 'Type', 'Phone', 'Email', 'Address', 'Cases'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clientRecords.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm">No client records found</td></tr>
                    ) : clientRecords.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium text-gray-900">{c.fullName}</td>
                        <td className="px-5 py-3">
                          <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', c.clientType === 'CORPORATE' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}>
                            {c.clientType}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{c.phone}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{c.email}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs max-w-[160px] truncate">{c.address}</td>
                        <td className="px-5 py-3 text-gray-600 font-medium">{c.caseCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
