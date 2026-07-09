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

interface StaffOption { id: string; name: string; }

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
        .map(d => ({ id: d.id, name: d.data().name as string, role: d.data().role as string }))
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

  const handleSaveDraft = async () => {
    if (!form.title.trim()) { toast.error('A case title is required to save as draft'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'cases'), buildCasePayload('DRAFT'));
      toast.success('Case saved as draft');
      setShowNewCase(false);
      setForm(defaultForm());
      fetchCases();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const updateParty = (type: 'plaintiffs' | 'defendants', index: number, value: string) => {
    setForm(p => {
      const arr = [...p[type]];
      arr[index] = value;
      return { ...p, [type]: arr };
    });
  };

  const addParty = (type: 'plaintiffs' | 'defendants') =>
    setForm(p => ({ ...p, [type]: [...p[type], ''] }));

  const removeParty = (type: 'plaintiffs' | 'defendants', index: number) =>
    setForm(p => ({ ...p, [type]: p[type].filter((_, i) => i !== index) }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Cases</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading...' : `${filtered.length} of ${cases.length} cases`}
          </p>
        </div>
        <button
          onClick={() => { setForm(defaultForm()); setShowNewCase(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
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
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading cases...</p>
          </div>
        ) : filtered.length === 0 ? (
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
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Client / Plaintiff</th>
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
                          <p className="text-sm font-medium text-gray-900">{c.title}</p>
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
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/cases/${c.id}`}
                          className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        {deleteConfirmId === c.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteCase(c.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700">Confirm</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium hover:bg-gray-200">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(c.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete case">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Case Modal */}
      {showNewCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">New Case</h2>
              <button onClick={() => setShowNewCase(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              {/* Case Number & Filing Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number *</label>
                  <input
                    type="text"
                    required
                    value={form.caseNumber}
                    onChange={(e) => setForm((p) => ({ ...p, caseNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filing Date *</label>
                  <input
                    type="date"
                    required
                    value={form.filingDate}
                    onChange={(e) => setForm((p) => ({ ...p, filingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Case Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Case Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Kimaro & Saidi v. Mkando Real Estate Ltd"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Court & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Court Name *</label>
                  <select
                    value={form.courtName}
                    onChange={(e) => setForm((p) => ({ ...p, courtName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {COURT_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {CASE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Plaintiffs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Plaintiff(s) *</label>
                  <button
                    type="button"
                    onClick={() => addParty('plaintiffs')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> Add plaintiff
                  </button>
                </div>
                <div className="space-y-2">
                  {form.plaintiffs.map((pl, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={pl}
                        onChange={(e) => updateParty('plaintiffs', i, e.target.value)}
                        placeholder={`Plaintiff ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {form.plaintiffs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParty('plaintiffs', i)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Defendants */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Defendant(s) *</label>
                  <button
                    type="button"
                    onClick={() => addParty('defendants')}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
                  >
                    <Plus className="h-3 w-3" /> Add defendant
                  </button>
                </div>
                <div className="space-y-2">
                  {form.defendants.map((def, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={def}
                        onChange={(e) => updateParty('defendants', i, e.target.value)}
                        placeholder={`Defendant ${i + 1}`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {form.defendants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParty('defendants', i)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Opposing Counsel */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Opposing Counsel (optional)</label>
                <input
                  type="text"
                  value={form.opposingCounsel}
                  onChange={(e) => setForm((p) => ({ ...p, opposingCounsel: e.target.value }))}
                  placeholder="Name of opposing advocate or law firm"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="tel"
                    value={form.opposingCounselPhone}
                    onChange={(e) => setForm((p) => ({ ...p, opposingCounselPhone: e.target.value }))}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                  <input
                    type="email"
                    value={form.opposingCounselEmail}
                    onChange={(e) => setForm((p) => ({ ...p, opposingCounselEmail: e.target.value }))}
                    placeholder="Email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  />
                </div>
                <input
                  type="text"
                  value={form.opposingCounselAddress}
                  onChange={(e) => setForm((p) => ({ ...p, opposingCounselAddress: e.target.value }))}
                  placeholder="Physical / postal address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                />
              </div>

              {/* Judge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Presiding Judge / Magistrate</label>
                <input
                  type="text"
                  value={form.judgeName}
                  onChange={(e) => setForm((p) => ({ ...p, judgeName: e.target.value }))}
                  placeholder="e.g. Hon. Justice Mwangi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Advocates */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Advocate(s) Handling</label>
                  {form.selectedAdvocateIds.length < 2 && (
                    <button
                      type="button"
                      onClick={() => setForm(p => ({
                        ...p,
                        selectedAdvocateIds: [...p.selectedAdvocateIds, ''],
                        selectedAdvocateNames: [...p.selectedAdvocateNames, ''],
                      }))}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-0.5"
                    >
                      <Plus className="h-3 w-3" /> Add 2nd advocate
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.selectedAdvocateIds.map((id, i) => (
                    <div key={i} className="flex gap-2">
                      <select
                        value={id}
                        onChange={(e) => updateAdvocate(i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        <option value="">— Select advocate —</option>
                        {advocates.map(adv => (
                          <option key={adv.id} value={adv.id}>{adv.name}</option>
                        ))}
                      </select>
                      {form.selectedAdvocateIds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm(p => ({
                            ...p,
                            selectedAdvocateIds: p.selectedAdvocateIds.filter((_, j) => j !== i),
                            selectedAdvocateNames: p.selectedAdvocateNames.filter((_, j) => j !== i),
                          }))}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* First Hearing & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Hearing Date (optional)</label>
                  <input
                    type="date"
                    value={form.firstHearingDate}
                    onChange={(e) => setForm((p) => ({ ...p, firstHearingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as CaseStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    <option value="NEW">NEW</option>
                    <option value="ONGOING">ONGOING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the case..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowNewCase(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-2 border border-primary-300 text-primary-700 bg-primary-50 text-sm font-medium rounded-lg hover:bg-primary-100 disabled:opacity-50"
                >
                  <FileEdit className="h-4 w-4" /> Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Plus className="h-4 w-4" /> Add Case</>
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

export default CasesPage;
