import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Calendar, TrendingUp, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Scale, FileText, ShoppingCart,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { mockCases, mockClients, mockCalendarEvents, mockMonthlyStats, mockExpensesByMonth } from '@/data/mockData';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { clsx } from 'clsx';

const PIE_COLORS = ['#2a41bb', '#C9A227', '#8B1A1A', '#6b7280'];

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();

  useEffect(() => {
    setPageTitle('Dashboard');
  }, [setPageTitle]);

  const activeCases = mockCases.filter((c) => c.status === 'ONGOING').length;
  const newCases = mockCases.filter((c) => c.status === 'NEW').length;
  const completedCases = mockCases.filter((c) => c.status === 'COMPLETED').length;
  const totalClients = mockClients.length;

  const now = new Date();
  const upcomingHearings = mockCalendarEvents.filter(
    (e) => e.type === 'HEARING' && new Date(e.date) >= now
  ).length;

  const monthlyExpenses = mockExpensesByMonth[mockExpensesByMonth.length - 1]?.amount || 0;

  const casesByStatus = [
    { name: 'Ongoing', value: activeCases },
    { name: 'New', value: newCases },
    { name: 'Completed', value: completedCases },
    { name: 'Archived', value: mockCases.filter((c) => c.status === 'ARCHIVED').length },
  ];

  const recentCases = [...mockCases]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const upcomingEvents = mockCalendarEvents
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const stats = [
    {
      label: 'Active Cases',
      value: activeCases,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
      border: 'border-blue-200',
      change: '+2 this month',
      changeColor: 'text-green-600',
    },
    {
      label: 'Total Clients',
      value: totalClients,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-200',
      change: '+1 this week',
      changeColor: 'text-green-600',
    },
    {
      label: 'Upcoming Hearings',
      value: upcomingHearings,
      icon: Calendar,
      color: 'bg-amber-50 text-amber-600',
      border: 'border-amber-200',
      change: 'Next: 3 days',
      changeColor: 'text-amber-600',
    },
    {
      label: 'Monthly Expenses',
      value: formatCurrency(monthlyExpenses),
      icon: TrendingUp,
      color: 'bg-red-50 text-red-600',
      border: 'border-red-200',
      change: 'June 2024',
      changeColor: 'text-gray-500',
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-40 flex items-center justify-center opacity-10">
          <Scale className="w-32 h-32" />
        </div>
        <div className="relative z-10">
          <p className="text-primary-200 text-sm">{getGreeting()},</p>
          <h2 className="text-2xl font-bold mt-0.5">{user?.name || 'Welcome back'}</h2>
          <p className="text-primary-200 text-sm mt-1">
            {user?.role?.replace('_', ' ')} &mdash; MAIRA &amp; ADHIS ADVOCATES
          </p>
          <div className="mt-3 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Briefcase className="h-4 w-4" />
              {activeCases} active cases
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
              <Calendar className="h-4 w-4" />
              {upcomingHearings} upcoming hearings
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className={clsx('bg-white rounded-xl border p-5 shadow-card', stat.border)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={clsx('text-xs mt-1', stat.changeColor)}>{stat.change}</p>
              </div>
              <div className={clsx('p-3 rounded-xl', stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases Monthly Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cases Overview – 2024</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockMonthlyStats} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cases" name="Total Cases" fill="#1B2B6B" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="#C9A227" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Case Status Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cases by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={casesByStatus}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {casesByStatus.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-card">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Monthly Expenses Trend (TZS)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={mockExpensesByMonth} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Expenses']}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="amount" stroke="#C9A227" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Cases + Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Cases</h3>
            <Link to="/cases" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Briefcase className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary-700">{c.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.caseNumber} &bull; {c.advocateName}</p>
                </div>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', getStatusColor(c.status))}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
            <Link to="/calendar" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map((event) => {
                const typeColors: Record<string, string> = {
                  HEARING: 'bg-red-50 text-red-700',
                  MEETING: 'bg-blue-50 text-blue-700',
                  DEADLINE: 'bg-orange-50 text-orange-700',
                  REMINDER: 'bg-purple-50 text-purple-700',
                };
                const typeIcons: Record<string, React.ReactNode> = {
                  HEARING: <Scale className="h-4 w-4" />,
                  MEETING: <Users className="h-4 w-4" />,
                  DEADLINE: <AlertCircle className="h-4 w-4" />,
                  REMINDER: <Clock className="h-4 w-4" />,
                };
                return (
                  <div key={event.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className={clsx('p-1.5 rounded-lg flex-shrink-0 mt-0.5', typeColors[event.type])}>
                      {typeIcons[event.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}</p>
                      {event.location && (
                        <p className="text-xs text-gray-400 truncate">{event.location}</p>
                      )}
                    </div>
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', typeColors[event.type])}>
                      {event.type}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'New Case', icon: Briefcase, path: '/cases', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' },
          { label: 'Add Client', icon: Users, path: '/clients', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100' },
          { label: 'Upload Document', icon: FileText, path: '/documents', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' },
          { label: 'Procurement', icon: ShoppingCart, path: '/procurement', color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={clsx('flex items-center gap-3 p-4 rounded-xl border font-medium text-sm transition-colors', item.color)}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
