import React, { useState, useEffect } from 'react';
import {
  Mail, Plus, Search, ArrowUpRight, ArrowDownLeft,
  FileText, MessageSquare, AlertCircle, Bell,
} from 'lucide-react';
import { mockCorrespondence } from '@/data/mockData';
import { Correspondence, CorrespondenceType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const TYPE_CONFIG: Record<CorrespondenceType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  LETTER: { label: 'Letter', color: 'bg-blue-50 text-blue-700', icon: FileText },
  EMAIL: { label: 'Email', color: 'bg-purple-50 text-purple-700', icon: Mail },
  COURT_NOTICE: { label: 'Court Notice', color: 'bg-red-50 text-red-700', icon: AlertCircle },
  DEMAND_NOTICE: { label: 'Demand Notice', color: 'bg-orange-50 text-orange-700', icon: Bell },
  LEGAL_NOTICE: { label: 'Legal Notice', color: 'bg-amber-50 text-amber-700', icon: MessageSquare },
};

const CorrespondencePage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [items] = useState<Correspondence[]>(mockCorrespondence);
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<CorrespondenceType | 'ALL'>('ALL');

  useEffect(() => { setPageTitle('Correspondence'); }, [setPageTitle]);

  const filtered = items.filter((c) => {
    const matchSearch =
      !search ||
      c.subject.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      c.fromParty.toLowerCase().includes(search.toLowerCase()) ||
      c.toParty.toLowerCase().includes(search.toLowerCase());
    const matchDir = dirFilter === 'ALL' || c.direction === dirFilter;
    const matchType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchSearch && matchDir && matchType;
  });

  const sentCount = items.filter((c) => c.direction === 'SENT').length;
  const receivedCount = items.filter((c) => c.direction === 'RECEIVED').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Correspondence</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Record
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{items.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{sentCount}</p>
          <p className="text-xs text-green-600 mt-0.5">Sent</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{receivedCount}</p>
          <p className="text-xs text-blue-600 mt-0.5">Received</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['ALL', 'SENT', 'RECEIVED'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirFilter(d)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                dirFilter === d ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {d === 'ALL' ? 'All' : d}
            </button>
          ))}
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CorrespondenceType | 'ALL')}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">All Types</option>
          {Object.entries(TYPE_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by subject, reference, parties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No correspondence found</p>
          </div>
        ) : (
          filtered.map((item) => {
            const typeConfig = TYPE_CONFIG[item.type];
            const TypeIcon = typeConfig.icon;
            return (
              <div key={item.id} className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors">
                <div className={clsx('p-2.5 rounded-xl flex-shrink-0', typeConfig.color)}>
                  <TypeIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Ref: {item.reference}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', typeConfig.color)}>
                        {typeConfig.label}
                      </span>
                      <span className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                        item.direction === 'SENT' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                      )}>
                        {item.direction === 'SENT'
                          ? <ArrowUpRight className="h-3 w-3" />
                          : <ArrowDownLeft className="h-3 w-3" />
                        }
                        {item.direction}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>From: <strong className="text-gray-700">{item.fromParty}</strong></span>
                    <span className="text-gray-300">→</span>
                    <span>To: <strong className="text-gray-700">{item.toParty}</strong></span>
                    <span className="text-gray-300">·</span>
                    <span>{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CorrespondencePage;
