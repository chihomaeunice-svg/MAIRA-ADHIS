"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentCases } from "@/components/dashboard/RecentCases";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const mockRecentCases = [
  {
    id: "1",
    caseNumber: "MA/2024/1042",
    title: "Kamau v. Wangari Property Dispute",
    clientName: "John Kamau",
    status: "ONGOING",
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    caseNumber: "MA/2024/1038",
    title: "Republic v. Odhiambo Criminal Matter",
    clientName: "State Prosecution",
    status: "NEW",
    lastActivity: "1 day ago",
  },
  {
    id: "3",
    caseNumber: "MA/2024/1031",
    title: "TechCorp Ltd Corporate Merger",
    clientName: "TechCorp Limited",
    status: "ONGOING",
    lastActivity: "2 days ago",
  },
  {
    id: "4",
    caseNumber: "MA/2024/1025",
    title: "Hassan Divorce Proceedings",
    clientName: "Fatuma Hassan",
    status: "COMPLETED",
    lastActivity: "1 week ago",
  },
  {
    id: "5",
    caseNumber: "MA/2024/1019",
    title: "Njoroge Land Title Dispute",
    clientName: "Robert Njoroge",
    status: "ONGOING",
    lastActivity: "1 week ago",
  },
];

const casesByStatus = [
  { name: "New", value: 8, color: "#3b82f6" },
  { name: "Ongoing", value: 24, color: "#f59e0b" },
  { name: "Completed", value: 45, color: "#10b981" },
  { name: "Archived", value: 12, color: "#6b7280" },
];

const monthlyFilings = [
  { month: "Jul", cases: 8 },
  { month: "Aug", cases: 12 },
  { month: "Sep", cases: 10 },
  { month: "Oct", cases: 15 },
  { month: "Nov", cases: 11 },
  { month: "Dec", cases: 9 },
  { month: "Jan", cases: 14 },
  { month: "Feb", cases: 18 },
  { month: "Mar", cases: 13 },
  { month: "Apr", cases: 16 },
  { month: "May", cases: 20 },
  { month: "Jun", cases: 17 },
];

const expenseData = [
  { category: "Office Supplies", amount: 45000 },
  { category: "Court Fees", amount: 120000 },
  { category: "Travel", amount: 35000 },
  { category: "Communication", amount: 28000 },
  { category: "Library", amount: 15000 },
  { category: "Staff Welfare", amount: 52000 },
];

const recentActivity = [
  {
    type: "case",
    text: "New case filed: MA/2024/1042",
    time: "2 hours ago",
    icon: Briefcase,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    type: "hearing",
    text: "Hearing scheduled for Kamau v. Wangari",
    time: "3 hours ago",
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    type: "client",
    text: "New client registered: TechCorp Ltd",
    time: "5 hours ago",
    icon: Users,
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    type: "task",
    text: "Document uploaded for case MA/2024/1031",
    time: "1 day ago",
    icon: CheckCircle,
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    type: "reminder",
    text: "Reminder: Court appearance tomorrow 9:00 AM",
    time: "1 day ago",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="xl:col-span-1">
            <StatsCard
              title="Active Cases"
              value="32"
              change="+4 this month"
              changeType="increase"
              icon={Briefcase}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />
          </div>
          <div className="xl:col-span-1">
            <StatsCard
              title="New Cases"
              value="8"
              change="This month"
              changeType="neutral"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-100"
            />
          </div>
          <div className="xl:col-span-1">
            <StatsCard
              title="Upcoming Hearings"
              value="5"
              change="Next 7 days"
              changeType="neutral"
              icon={Calendar}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
            />
          </div>
          <div className="xl:col-span-1">
            <StatsCard
              title="Total Clients"
              value="148"
              change="+12 this month"
              changeType="increase"
              icon={Users}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
            />
          </div>
          <div className="xl:col-span-1">
            <StatsCard
              title="Pending Tasks"
              value="12"
              change="3 overdue"
              changeType="decrease"
              icon={Clock}
              iconColor="text-red-600"
              iconBg="bg-red-100"
            />
          </div>
          <div className="xl:col-span-1">
            <StatsCard
              title="Monthly Expenses"
              value="KES 295K"
              change="-5% vs last month"
              changeType="increase"
              icon={DollarSign}
              iconColor="text-gold-600"
              iconBg="bg-gold-100"
            />
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Case Filings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">
              Monthly Case Filings (Last 12 Months)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyFilings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="cases"
                  fill="#1e3a5f"
                  radius={[4, 4, 0, 0]}
                  name="Cases Filed"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cases by Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-navy-900 mb-4">
              Cases by Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={casesByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {casesByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {casesByStatus.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <RecentCases cases={mockRecentCases} />
          </div>

          {/* Activity Feed */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-navy-900">Recent Activity</h3>
            </div>
            <div className="p-4 space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.bg}`}
                  >
                    <activity.icon
                      className={`w-4 h-4 ${activity.color}`}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-tight">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-navy-900 mb-4">
            Expense Breakdown (Current Month)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={expenseData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fontSize: 12 }}
                tickLine={false}
                width={120}
              />
              <Tooltip
                formatter={(value: number) =>
                  `KES ${value.toLocaleString()}`
                }
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar
                dataKey="amount"
                fill="#c9a227"
                radius={[0, 4, 4, 0]}
                name="Amount (KES)"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
