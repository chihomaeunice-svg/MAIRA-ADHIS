import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Briefcase, Eye, Calendar, User, X, Trash2, FileEdit } from 'lucide-react';
import {
  collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { Case, CaseStatus } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { notifyCaseCreated } from '@/services/emailService';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const STATUSES: { value: CaseStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Cases' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'NEW', label: 'New' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const CATEGORIES = [
  'All Categories',
  'Civil Litigation',
  'Commercial & Corporate',
  'Criminal Defense',
  'Labour Law',
  'Family Matters',
  'Conveyances & Property',
  'Notary Public',
  'Other',
];

const COURT_NAMES = [
  'High Court of Tanzania',
  'Resident Magistrate Court - Kinondoni',
  'Resident Magistrate Court - Ilala',
  'Labour Court of Tanzania',
  'Court of Appeal',
  'District Court',
  'Land Division - High Court',
  'Other',
];

const CASE_CATEGORIES = [
  'Civil Litigation',
  'Commercial & Corporate',
  'Criminal Defense',
  'Labour Law',
  'Family Matters',
  'Conveyances & Property',
  'Notary Public',
  'Other',
];

function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 9000) + 1000);
  return `HC/CASE/${year}/${num}`;
}

interface NewCaseForm {
  caseNumber: string;
  title: string;
  courtName: string;
  plaintiffs: string[];
  defendants: string[];
  opposingCounsel: string;
  opposingCounselPhone: string;
  opposingCounselEmail: string;
  opposingCounselAddress: string;
  judgeName: string;
  selectedAdvocateIds: string[];
  selectedAdvocateNames: string[];
  filingDate: string;
  firstHearingDate: string;
  category: string;
  description: string;
  status: CaseStatus;
}

const defaultForm = (): NewCaseForm => ({
  caseNumber: generateCaseNumber(),
  title: '',
  courtName: 'High Court of Tanzania',
  plaintiffs: [''],
  defendants: [''],
  opposingCounsel: '',
  opposingCounselPhone: '',
  opposingCounselEmail: '',
  opposingCounselAddress: '',
  judgeName: '',
  selectedAdvocateIds: [''],
  selectedAdvocateNames: [''],
  filingDate: new Date().toISOString().split('T')[0],
  firstHearingDate: '',
  category: 'Civil Litigation',
  description: '',
  status: 'NEW',
});

interface StaffOption { id: string; name: string; email?: string; }

const CasesPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewCase, setShowNewCase] = useState(false);
  const [form, setForm] = useState<NewCaseForm>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [advocates, setAdvocates] = useState<StaffOption[]>([]);

  useEffect(() => { setPageTitle('Cases'); }, [setPageTitle]);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      const staff = snap.docs
        .map(d => ({
          id: d.id,
          name: d.data().name as string,
          email: d.data().email as string,
          role: d.data().role as string,
        }))
        .filter(u => ['ADVOCATE', 'ADMIN', 'MANAGING_PARTNER', 'SECRETARY'].includes(u.role))
        .sort((a, b) => a.name.localeCompare(b.name));
      setAdvocates(staff);
    }).catch(() => {});
  }, []);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cases'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        const fetched: Case[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            caseNumber: data.caseNumber,
            title: data.title,
            courtName: data.courtName,
            partiesNames: data.partiesNames || { plaintiff: '', defendant: '' },
            advocateId: data.advocateId || '',
            advocateName: data.advocateName || '',
            clientId: data.clientId || '',
            clientName: data.clientName || data.partiesNames?.plaintiff || '',
            filingDate: data.filingDate?.toDate ? data.filingDate.toDate() : new Date(data.filingDate),
            hearingDates: data.hearingDates || [],
            status: data.status,
            category: data.category,
            description: data.description || '',
            notes: data.notes || [],
            documents: data.documents || [],
            judgment: data.judgment,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || data.createdAt),
          };
        });
        setCases(fetched);
      } else {
        setCases([]);
      }
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCases(); }, [fetchCases]);

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
    DRAFT: cases.filter((c) => c.status === 'DRAFT').length,
    NEW: cases.filter((c) => c.status === 'NEW').length,
    ONGOING: cases.filter((c) => c.status === 'ONGOING').length,
    COMPLETED: cases.filter((c) => c.status === 'COMPLETED').length,
    ARCHIVED: cases.filter((c) => c.status === 'ARCHIVED').length,
  };

  const handleDeleteCase = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'cases', id));
      setCases(prev => prev.filter(c => c.id !== id));
      toast.success('Case deleted');
    } catch {
      toast.error('Failed to delete case');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const updateAdvocate = (index: number, id: string) => {
    const adv = advocates.find(a => a.id === id);
    setForm(p => {
      const ids = [...p.selectedAdvocateIds];
      const names = [...p.selectedAdvocateNames];
      ids[index] = id;
      names[index] = adv?.name || '';
      return { ...p, selectedAdvocateIds: ids, selectedAdvocateNames: names };
    });
  };

  const buildCasePayload = (status: CaseStatus) => {
    const now = Timestamp.now();
    const joinedPlaintiff = form.plaintiffs.filter(s => s.trim()).join(' & ');
    const joinedDefendant = form.defendants.filter(s => s.trim()).join(' & ');
    const joinedAdvocateName = form.selectedAdvocateNames.filter(Boolean).join(' & ');
    const primaryAdvocateId = form.selectedAdvocateIds.filter(Boolean)[0] || '';
    const hearingDates = form.firstHearingDate
      ? [{ id: `h-${Date.now()}`, date: Timestamp.fromDate(new Date(form.firstHearingDate)), venue: form.courtName, purpose: 'First Hearing' }]
      : [];

    return {
      caseNumber: form.caseNumber,
      title: form.title.trim(),
      courtName: form.courtName,
      partiesNames: { plaintiff: joinedPlaintiff, defendant: joinedDefendant },
      opposingCounsel: form.opposingCounsel.trim() || null,
      opposingCounselPhone: form.opposingCounselPhone.trim() || null,
      opposingCounselEmail: form.opposingCounselEmail.trim() || null,
      opposingCounselAddress: form.opposingCounselAddress.trim() || null,
      judgeName: form.judgeName.trim() || null,
      advocateId: primaryAdvocateId,
      advocateName: joinedAdvocateName,
      advocateIds: form.selectedAdvocateIds.filter(Boolean),
      advocateNames: form.selectedAdvocateNames.filter(Boolean),
      clientId: '',
      clientName: joinedPlaintiff,
      filingDate: Timestamp.fromDate(new Date(form.filingDate)),
      hearingDates,
      status,
      category: form.category,
      description: form.description.trim(),
      notes: [],
      documents: [],
      addedBy: user?.id || 'unknown',
      addedByName: user?.name || 'Unknown',
      createdAt: now,
      updatedAt: now,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Case title is required'); return; }
    if (!form.plaintiffs.some(s => s.trim())) { toast.error('At least one plaintiff is required'); return; }
    if (!form.defendants.some(s => s.trim())) { toast.error('At least one defendant is required'); return; }
    if (!form.selectedAdvocateIds.some(s => s)) { toast.error('At least one advocate is required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'cases'), buildCasePayload(form.status));

      if (form.status !== 'DRAFT') {
        form.selectedAdvocateIds.forEach((advId, idx) => {
          if (advId) {
            const advocate = advocates.find(a => a.id === advId);
            if (advocate) {
              notifyCaseCreated(advocate.email || '', advocate.name, {
                caseTitle: form.title,
                clientName: user?.name || 'Client',
                courtName: form.courtName,
                status: form.status,
              }).catch(err => console.error('Failed to queue email:', err));
            }
          }
        });
      }

      toast.success('Case added successfully');
      setShowNewCase(false);
      setForm(defaultForm());
      fetchCases();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save case. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-500 mt-1">{counts.ALL} total cases</p>
        </div>
        <button
          onClick={() => setShowNewCase(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Case
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUSES.map(status => (
          <button
            key={status.value}
            onClick={() => setStatusFilter(status.value)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              statusFilter === status.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {status.label} ({counts[status.value as keyof typeof counts]})
          </button>
        ))}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search cases, case numbers, clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {showNewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">New Case</h2>
              <button onClick={() => setShowNewCase(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Case Number</label>
                  <input
                    type="text"
                    value={form.caseNumber}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Case Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter case title"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Court Name *</label>
                  <select
                    value={form.courtName}
                    onChange={e => setForm({ ...form, courtName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {COURT_NAMES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {CASE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Plaintiffs *</label>
                  <button type="button" onClick={() => setForm({ ...form, plaintiffs: [...form.plaintiffs, ''] })} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.plaintiffs.map((plaintiff, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={plaintiff}
                        onChange={e => {
                          const p = [...form.plaintiffs];
                          p[i] = e.target.value;
                          setForm({ ...form, plaintiffs: p });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Plaintiff name"
                      />
                      {form.plaintiffs.length > 1 && (
                        <button type="button" onClick={() => setForm({ ...form, plaintiffs: form.plaintiffs.filter((_, ii) => ii !== i) })} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Defendants *</label>
                  <button type="button" onClick={() => setForm({ ...form, defendants: [...form.defendants, ''] })} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.defendants.map((defendant, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={defendant}
                        onChange={e => {
                          const d = [...form.defendants];
                          d[i] = e.target.value;
                          setForm({ ...form, defendants: d });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Defendant name"
                      />
                      {form.defendants.length > 1 && (
                        <button type="button" onClick={() => setForm({ ...form, defendants: form.defendants.filter((_, ii) => ii !== i) })} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Advocate(s) *</label>
                  <button type="button" onClick={() => setForm({ ...form, selectedAdvocateIds: [...form.selectedAdvocateIds, ''], selectedAdvocateNames: [...form.selectedAdvocateNames, ''] })} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {form.selectedAdvocateIds.map((advId, i) => (
                    <div key={i} className="flex gap-2">
                      <select
                        value={advId}
                        onChange={e => updateAdvocate(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select advocate</option>
                        {advocates.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      {form.selectedAdvocateIds.length > 1 && (
                        <button type="button" onClick={() => setForm({ ...form, selectedAdvocateIds: form.selectedAdvocateIds.filter((_, ii) => ii !== i), selectedAdvocateNames: form.selectedAdvocateNames.filter((_, ii) => ii !== i) })} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Filing Date *</label>
                  <input
                    type="date"
                    value={form.filingDate}
                    onChange={e => setForm({ ...form, filingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First Hearing Date</label>
                  <input
                    type="date"
                    value={form.firstHearingDate}
                    onChange={e => setForm({ ...form, firstHearingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Opposing Counsel</label>
                <input
                  type="text"
                  value={form.opposingCounsel}
                  onChange={e => setForm({ ...form, opposingCounsel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Opposing counsel name"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.opposingCounselPhone}
                    onChange={e => setForm({ ...form, opposingCounselPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.opposingCounselEmail}
                    onChange={e => setForm({ ...form, opposingCounselEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={form.opposingCounselAddress}
                    onChange={e => setForm({ ...form, opposingCounselAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judge / Magistrate Name</label>
                <input
                  type="text"
                  value={form.judgeName}
                  onChange={e => setForm({ ...form, judgeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Judge or magistrate name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Case description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as CaseStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="NEW">New</option>
                  <option value="ONGOING">Ongoing</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowNewCase(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
                  {saving ? 'Saving...' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Case?</h3>
            <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDeleteCase(deleteConfirmId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No cases found
          </div>
        ) : (
          filtered.map(caseItem => (
            <Link key={caseItem.id} to={`/cases/${caseItem.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary-600 font-semibold">{caseItem.caseNumber}</span>
                    <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(caseItem.status))}>{caseItem.status}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{caseItem.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{caseItem.courtName}</p>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>{caseItem.clientName}</span>
                    <span>{caseItem.advocateName}</span>
                    <span>{caseItem.category}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.preventDefault(); setDeleteConfirmId(caseItem.id); }} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default CasesPage;