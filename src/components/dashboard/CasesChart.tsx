import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'New', value: 8, color: '#3b82f6' },
  { name: 'Ongoing', value: 24, color: '#f97316' },
  { name: 'Completed', value: 18, color: '#22c55e' },
  { name: 'Archived', value: 6, color: '#9ca3af' },
];

const CasesChart: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cases by Status</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value} cases`, '']} />
          <Legend iconType="circle" iconSize={10} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CasesChart;
