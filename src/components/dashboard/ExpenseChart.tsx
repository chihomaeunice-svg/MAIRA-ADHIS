import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockMonthlyStats } from '@/data/mockData';

const ExpenseChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Case Filings 2024</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={mockMonthlyStats} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="cases" fill="#1B2B6B" radius={[4, 4, 0, 0]} name="Filed" />
          <Bar dataKey="completed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseChart;
