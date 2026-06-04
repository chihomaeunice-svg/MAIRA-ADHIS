import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail, Plus, Search, ArrowUpRight, ArrowDownLeft,
  FileText, MessageSquare, AlertCircle, Bell, X, Calendar,
  User, Link2, ChevronRight,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';

import { Correspondence, CorrespondenceType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<CorrespondenceType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  LETTER:       { label: 'Letter',        color: 'bg-blue-50 text-blue-700',   icon: FileText      },
  EMAIL:        { label: 'Email',         color: 'bg-purple-50 text-purple-700', icon: Mail         },
  COURT_NOTICE: { label: 'Court Notice',  color: 'bg-red-50 text-red-700',     icon: AlertCircle   },
  DEMAND_NOTICE:{ label: 'Demand Notice', color: 'bg-orange-50 text-orange-700', icon: Bell        },
  LEGAL_NOTICE: { label: 'Legal Notice',  color: 'bg-amber-50 text-amber-700', icon: MessageSquare },
};

interface FirestoreCorrespondence {
  id: string;
  type: CorrespondenceType;
  reference: string;
  subject: string;
  fromParty: string;
  toParty: string;
  date: string;
  direction: 'SENT' | 'RECEIVED';
  relatedCaseId?: string;
  content?: string;
  createdAt: Date;
}

type FormData = {
  type: CorrespondenceType;
  reference: string;
  subject: string;
  fromParty: string;
  toParty: string;
  date: string;
  direction: 'SENT' | 'RECEIVED';
  relatedCaseId: string;
  content: string;
};

const todayStr = () => new Date().toISOString().split('T')[0];

const CorrespondencePage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();

  const [items, setItems] = useState<FirestoreCorrespondence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dirFilter, setDirFilter] = useState<'ALL' | 'SENT' | 'RECEIVED'>('ALL');
  const [typeFilter, setTypeFilter] = useState<CorrespondenceType | 'ALL'>('ALL');
  const [selectedItem, setSelectedItem] = useState<FirestoreCorrespondence | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    type: 'LETTER',
    reference: '',
    subject: '',
    fromParty: 'MAIRA & ADHIS COMPANY ADVOCATES',
    toParty: '',
    date: todayStr(),
    direction: 'SENT',
    relatedCaseId: '',
    content: '',
  });

  useEffect(() => { setPageTitle('Correspondence'); }, [setPageTitle]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'correspondence'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setItems(snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: data.type,
            reference: data.reference,
            subject: data.subject,
            fromParty: data.fromParty,
            toParty: data.toParty,
            date: data.date,
            direction: data.direction,
            relatedCaseId: data.relatedCaseId || undefined,
            content: data.content || undefined,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        }));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim()) { toast.error('Subject is required'); return; }
    if (!form.toParty.trim()) { toast.error('Recipient is required'); return; }
    if (!form.reference.trim()) { toast.error('Reference number is required'); return; }

    setSaving(true);
    try {
      await addDoc(collection(db, 'correspondence'), {
        type: form.type,
        reference: form.reference.trim(),
        subject: form.subject.trim(),
        fromParty: form.fromParty.trim(),
        toParty: form.toParty.trim(),
        date: form.date,
        direction: form.direction,
        relatedCaseId: form.relatedCaseId.trim() || null,
        content: form.content.trim() || null,
        addedBy: user?.id || 'unknown',
        addedByName: user?.name || 'Unknown',
        createdAt: Timestamp.now(),
      });
      toast.success('Correspondence record saved');
      setShowModal(false);
      setForm({
        type: 'LETTER', reference: '', subject: '',
        fromParty: 'MAIRA & ADHIS COMPANY ADVOCATES', toParty: '',
        date: todayStr(), direction: 'SENT', relatedCaseId: '', content: '',
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save correspondence');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Correspondence</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} records</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
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
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading correspondence...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No correspondence found</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-sm text-primary-600 hover:underline"
              >
                Add first record
              </button>
            </div>
          ) : (
            filtered.map((item) => {
              const typeConfig = TYPE_CONFIG[item.type];
              const TypeIcon = typeConfig.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex items-start gap-4 p-5 hover:bg-gray-50 transition-colors cursor-pointer group"
                >
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
                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                      <span>From: <strong className="text-gray-700">{item.fromParty}</strong></span>
                      <span className="text-gray-300">→</span>
                      <span>To: <strong className="text-gray-700">{item.toParty}</strong></span>
                      <span className="text-gray-300">·</span>
                      <span>{formatDate(item.date)}</span>
                    </div>
                    {item.content && (
                      <p className="text-xs text-gray-400 mt-1.5 line-clamp-1 italic">"{item.content}"</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Detail Panel / Modal */}
      {selectedItem && (() => {
        const typeConfig = TYPE_CONFIG[selectedItem.type];
        const TypeIcon = typeConfig.icon;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className={clsx('flex items-start justify-between p-5 rounded-t-2xl', typeConfig.color)}>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/50 rounded-xl">
                    <TypeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{typeConfig.label}</p>
                    <p className="text-xs opacity-75">Ref: {selectedItem.reference}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-1.5 hover:bg-black/10 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{selectedItem.subject}</h2>
                  <span className={clsx(
                    'inline-flex items-center gap-1 mt-1 text-xs px-2.5 py-1 rounded-full font-medium',
                    selectedItem.direction === 'SENT' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                  )}>
                    {selectedItem.direction === 'SENT' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                    {selectedItem.direction}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{selectedItem.fromParty}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">To</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{selectedItem.toParty}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>{formatDate(selectedItem.date)}</span>
                    </div>
                  </div>
                  {selectedItem.relatedCaseId && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Related Case</p>
                      <div className="flex items-center gap-2 text-gray-900">
                        <Link2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-primary-600">{selectedItem.relatedCaseId}</span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedItem.content ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content / Notes</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedItem.content}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No additional content recorded for this correspondence.</p>
                    <p className="text-xs text-gray-400 mt-1">Use "New Record" to add correspondence with full content.</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Correspondence Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Correspondence Record</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CorrespondenceType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {Object.entries(TYPE_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Direction *</label>
                  <div className="flex gap-2">
                    {(['SENT', 'RECEIVED'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, direction: d }))}
                        className={clsx(
                          'flex-1 py-2 text-sm font-medium rounded-lg border transition-colors',
                          form.direction === d
                            ? d === 'SENT' ? 'bg-green-600 text-white border-green-600' : 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                        )}
                      >
                        {d === 'SENT' ? '↑ Sent' : '↓ Received'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Number *</label>
                <input
                  type="text"
                  required
                  value={form.reference}
                  onChange={(e) => setForm((p) => ({ ...p, reference: e.target.value }))}
                  placeholder="e.g. MA/LTR/2025/001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Demand for Settlement — Kimaro v. Mkando"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From *</label>
                  <input
                    type="text"
                    required
                    value={form.fromParty}
                    onChange={(e) => setForm((p) => ({ ...p, fromParty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                  <input
                    type="text"
                    required
                    value={form.toParty}
                    onChange={(e) => setForm((p) => ({ ...p, toParty: e.target.value }))}
                    placeholder="e.g. Mkando Real Estate Ltd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Related Case (optional)</label>
                  <input
                    type="text"
                    value={form.relatedCaseId}
                    onChange={(e) => setForm((p) => ({ ...p, relatedCaseId: e.target.value }))}
                    placeholder="e.g. HC/CIV/001/2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content / Notes (optional)</label>
                <textarea
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Enter the full text or a summary of this correspondence..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Mail className="h-4 w-4" /> Save Record</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrespondencePage;
