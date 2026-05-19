import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, Eye, Calendar, User } from 'lucide-react';
import { mockCases } from '@/data/mockData';
import { Case, CaseStatus } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const STATUSES: { value: CaseStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Cases' },
  { value: 'NEW', label: 'New' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const CATEGORIES = [
  'All Categories',
  'Commercial & Corporate',
  'Criminal Defense',
  'Labour Law',
  'Family Matters',
  'Conveyances & Property',
];

const CasesPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [cases] = useState<Case[]>(mockCases);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setPageTitle('Cases'); }, [setPageTitle]);

  const filtered = cases.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.advocateName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchCategory = categoryFilter === 'All Categories' || c.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  const counts = {
    ALL: cases.length,
    NEW: cases.filter((c) => c.status === 'NEW').length,
    ONGOING: cases.filter((c) => c.status === 'ONGOING').length,
    COMPLETED: cases.filter((c) => c.status === 'COMPLETED').length,
    ARCHIVED: cases.filter((c) => c.status === 'ARCHIVED').length,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {cases.length} cases
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Case
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              statusFilter === s.value
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
            )}
          >
            {s.label}
            <span className={clsx('ml-1.5 text-xs px-1.5 py-0.5 rounded-full', statusFilter === s.value ? 'bg-white/20' : 'bg-gray-100 text-gray-500')}>
              {counts[s.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by case number, title, client, advocate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors',
            showFilters ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
          )}
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Category Filter */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  categoryFilter === cat
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cases Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No cases found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Case</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Client</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Advocate</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Filed</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Briefcase className="h-4 w-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 hover:text-primary-700">
                            {c.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{c.caseNumber}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{c.courtName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{c.clientName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-700">{c.advocateName}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{c.category}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={clsx('text-xs px-2.5 py-1 rounded-full font-medium', getStatusColor(c.status))}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(c.filingDate)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/cases/${c.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage;
