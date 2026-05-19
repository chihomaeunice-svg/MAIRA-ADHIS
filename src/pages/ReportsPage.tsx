import React, { useState } from 'react';
import { BarChart3, FileText, TrendingUp, Users, DollarSign, Download, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockCases, mockClients, mockEmployees, mockExpenses, mockMonthlyStats, mockExpensesByMonth } from '@/data/mockData';
import Button from '@/components/ui/Button';
import { clsx } from 'clsx';

const reportTypes = [
  { id: 'cases', label: 'Case Statistics', icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
  { id: 'clients', label: 'Client Report', icon: Users, color: 'text-purple-600 bg-purple-50' },
  { id: 'financial', label: 'Financial Report', icon: DollarSign, color: 'text-green-600 bg-green-50' },
  { id: 'employees', label: 'Employee Report', icon: FileText, color: 'text-orange-600 bg-orange-50' },
];

const pieData = [
  { name: 'NEW', value: mockCases.filter(c => c.status === 'NEW').length, color: '#3b82f6' },
  { name: 'ONGOING', value: mockCases.filter(c => c.status === 'ONGOING').length, color: '#f97316' },
  { name: 'COMPLETED', value: mockCases.filter(c => c.status === 'COMPLETED').length, color: '#22c55e' },
  { name: 'ARCHIVED', value: mockCases.filter(c => c.status === 'ARCHIVED').length, color: '#9ca3af' },
];

const ReportsPage: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState('cases');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Printer className="h-4 w-4" />}>Print</Button>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button>
          <Button leftIcon={<Download className="h-4 w-4" />}>Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {reportTypes.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedReport(r.id)}
            className={clsx(
              'bg-white rounded-xl border p-5 text-left transition-all',
              selectedReport === r.id ? 'border-primary-600 shadow-md ring-1 ring-primary-600/20' : 'border-gray-200 hover:border-gray-300 shadow-card'
            )}
          >
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', r.color)}>
              <r.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{r.label}</p>
          </button>
        ))}
      </div>

      {selectedReport === 'cases' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cases', value: mockCases.length },
              { label: 'Active (Ongoing)', value: mockCases.filter(c => c.status === 'ONGOING').length },
              { label: 'Completed', value: mockCases.filter(c => c.status === 'COMPLETED').length },
              { label: 'New', value: mockCases.filter(c => c.status === 'NEW').length },
            ].map(stat => (
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
                <BarChart data={mockMonthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="cases" fill="#1B2B6B" radius={[3,3,0,0]} name="Filed" />
                  <Bar dataKey="completed" fill="#22c55e" radius={[3,3,0,0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Cases by Category</h3>
            <div className="space-y-3">
              {['Commercial & Corporate', 'Family Matters', 'Conveyances & Property', 'Labour Law', 'Criminal Defense'].map(cat => {
                const count = mockCases.filter(c => c.category === cat).length;
                const pct = Math.round((count / mockCases.length) * 100);
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-44 flex-shrink-0">{cat}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-600 h-2 rounded-full" style={{ width: `${pct || 5}%` }} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedReport === 'financial' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Expenditure</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockExpensesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v/1000000).toFixed(0)}M`} />
                <Tooltip formatter={(v: number) => [`TZS ${v.toLocaleString()}`, 'Expenses']} />
                <Bar dataKey="amount" fill="#1B2B6B" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Category', 'Amount (TZS)', '% of Total'].map(h => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.category}</td>
                    <td className="px-4 py-3">{e.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{((e.amount / mockExpenses.reduce((s, ex) => s + ex.amount, 0)) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-bold">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-primary-700">{mockExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</td>
                  <td className="px-4 py-3">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReport === 'clients' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Clients', value: mockClients.length },
              { label: 'Individual', value: mockClients.filter(c => c.clientType === 'INDIVIDUAL').length },
              { label: 'Corporate', value: mockClients.filter(c => c.clientType === 'CORPORATE').length },
            ].map(stat => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {['Client Name', 'Type', 'Contact', 'Cases'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockClients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{c.clientType}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{c.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{c.cases.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport === 'employees' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Staff', value: mockEmployees.length },
              { label: 'Legal Department', value: mockEmployees.filter(e => e.department === 'Legal').length },
              { label: 'Admin/Finance', value: mockEmployees.filter(e => e.department !== 'Legal').length },
            ].map(stat => (
              <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-primary-600">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                {['Name', 'Position', 'Department', 'Status', 'Leave Balance'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockEmployees.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{e.fullName}</td>
                  <td className="px-4 py-3 text-gray-600">{e.position}</td>
                  <td className="px-4 py-3 text-gray-600">{e.department}</td>
                  <td className="px-4 py-3"><span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', e.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{e.status}</span></td>
                  <td className="px-4 py-3 text-gray-600">{e.leaveBalance} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
