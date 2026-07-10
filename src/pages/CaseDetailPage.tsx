import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Scale, Calendar, User, FileText, MessageSquare,
  Clock, MapPin, CheckCircle2, AlertCircle, Plus, Edit2,
  Save, X, Printer, Upload, ChevronDown,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Case, CaseStatus, HearingDate, Note } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { notifyHearingScheduled } from '@/services/emailService';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const STATUSES: CaseStatus[] = ['DRAFT', 'NEW', 'ONGOING', 'COMPLETED', 'ARCHIVED'];
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

interface EditFormData {
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
  category: string;
  description: string;
  status: CaseStatus;
}

interface Advocate {
  id: string;
  name: string;
  email?: string;
  role: string;
}

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hearings' | 'notes' | 'documents'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const [showHearingForm, setShowHearingForm] = useState(false);
  const [hearingForm, setHearingForm] = useState({ date: '', venue: '', purpose: '', outcome: '' });
  const [savingHearing, setSavingHearing] = useState(false);

  useEffect(() => {
    loadCase();
    loadAdvocates();
  }, [id]);

  const loadAdvocates = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
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
    } catch (error) {
      console.error('Error loading advocates:', error);
    }
  }, []);

  const loadCase = async () => {
    setLoading(true);
    try {
      if (id) {
        const docRef = doc(db, 'cases', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCaseData({
            id: docSnap.id,
            ...data,
            filingDate: data.filingDate?.toDate?.() ?? new Date(data.filingDate),
            createdAt: data.createdAt?.toDate?.() ?? new Date(),
            updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
          } as Case);
          setPageTitle(`Case: ${data.caseNumber}`);
        }
      }
    } catch (error) {
      console.error('Error loading case:', error);
    }
    setLoading(false);
  };

  const openEditModal = () => {
    if (!caseData) return;
    const plaintiffs = caseData.partiesNames.plaintiff ? caseData.partiesNames.plaintiff.split(' & ') : [''];
    const defendants = caseData.partiesNames.defendant ? caseData.partiesNames.defendant.split(' & ') : [''];
    const advIds = caseData.advocateIds || (caseData.advocateId ? [caseData.advocateId] : []);
    const advNames = caseData.advocateNames || (caseData.advocateName ? [caseData.advocateName] : []);

    setEditForm({
      title: caseData.title,
      courtName: caseData.courtName,
      plaintiffs,
      defendants,
      opposingCounsel: caseData.opposingCounsel || '',
      opposingCounselPhone: caseData.opposingCounselPhone || '',
      opposingCounselEmail: caseData.opposingCounselEmail || '',
      opposingCounselAddress: caseData.opposingCounselAddress || '',
      judgeName: caseData.judgeName || '',
      selectedAdvocateIds: advIds.length > 0 ? advIds : [''],
      selectedAdvocateNames: advNames.length > 0 ? advNames : [''],
      filingDate: caseData.filingDate instanceof Date ? caseData.filingDate.toISOString().split('T')[0] : new Date(caseData.filingDate).toISOString().split('T')[0],
      category: caseData.category,
      description: caseData.description,
      status: caseData.status,
    });
    setShowEditModal(true);
  };

  const updateParty = (type: 'plaintiffs' | 'defendants', index: number, value: string) => {
    if (!editForm) return;
    const arr = [...editForm[type]];
    arr[index] = value;
    setEditForm({ ...editForm, [type]: arr });
  };

  const addParty = (type: 'plaintiffs' | 'defendants') => {
    if (!editForm) return;
    setEditForm({ ...editForm, [type]: [...editForm[type], ''] });
  };

  const removeParty = (type: 'plaintiffs' | 'defendants', index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [type]: editForm[type].filter((_, i) => i !== index) });
  };

  const updateAdvocate = (index: number, advId: string) => {
    if (!editForm) return;
    const adv = advocates.find(a => a.id === advId);
    const ids = [...editForm.selectedAdvocateIds];
    const names = [...editForm.selectedAdvocateNames];
    ids[index] = advId;
    names[index] = adv?.name || '';
    setEditForm({ ...editForm, selectedAdvocateIds: ids, selectedAdvocateNames: names });
  };

  const saveEdit = async () => {
    if (!editForm || !caseData) return;
    if (!editForm.title.trim()) { toast.error('Case title is required'); return; }
    if (!editForm.plaintiffs.some(s => s.trim())) { toast.error('At least one plaintiff is required'); return; }
    if (!editForm.defendants.some(s => s.trim())) { toast.error('At least one defendant is required'); return; }
    if (!editForm.selectedAdvocateIds.some(s => s)) { toast.error('At least one advocate is required'); return; }

    setSavingEdit(true);
    try {
      const joinedPlaintiff = editForm.plaintiffs.filter(s => s.trim()).join(' & ');
      const joinedDefendant = editForm.defendants.filter(s => s.trim()).join(' & ');
      const joinedAdvocateName = editForm.selectedAdvocateNames.filter(Boolean).join(' & ');
      const primaryAdvocateId = editForm.selectedAdvocateIds.filter(Boolean)[0] || '';

      const updateData = {
        title: editForm.title.trim(),
        courtName: editForm.courtName,
        partiesNames: { plaintiff: joinedPlaintiff, defendant: joinedDefendant },
        opposingCounsel: editForm.opposingCounsel.trim() || null,
        opposingCounselPhone: editForm.opposingCounselPhone.trim() || null,
        opposingCounselEmail: editForm.opposingCounselEmail.trim() || null,
        opposingCounselAddress: editForm.opposingCounselAddress.trim() || null,
        judgeName: editForm.judgeName.trim() || null,
        advocateId: primaryAdvocateId,
        advocateName: joinedAdvocateName,
        advocateIds: editForm.selectedAdvocateIds.filter(Boolean),
        advocateNames: editForm.selectedAdvocateNames.filter(Boolean),
        filingDate: Timestamp.fromDate(new Date(editForm.filingDate)),
        category: editForm.category,
        description: editForm.description.trim(),
        status: editForm.status,
        updatedAt: Timestamp.now(),
      };

      await updateDoc(doc(db, 'cases', caseData.id), updateData);
      await loadCase();
      setShowEditModal(false);
      toast.success('Case updated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save case');
    } finally {
      setSavingEdit(false);
    }
  };

  const addNote = async () => {
    if (!noteText.trim() || !caseData) return;
    setSavingNote(true);
    const note: Note = { id: `note-${Date.now()}`, content: noteText.trim(), authorId: user?.id || '', authorName: user?.name || 'Unknown', createdAt: new Date() };
    try {
      await updateDoc(doc(db, 'cases', caseData.id), { notes: arrayUnion({ ...note, createdAt: Timestamp.now() }), updatedAt: Timestamp.now() });
      setCaseData({ ...caseData, notes: [...caseData.notes, note] });
      setNoteText('');
      toast.success('Note added');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
    setSavingNote(false);
  };

  const addHearing = async () => {
    if (!hearingForm.date || !hearingForm.venue || !hearingForm.purpose || !caseData) return;
    setSavingHearing(true);
    const hearing: HearingDate = { id: `h-${Date.now()}`, date: new Date(hearingForm.date), venue: hearingForm.venue, purpose: hearingForm.purpose, outcome: hearingForm.outcome || undefined };
    try {
      await updateDoc(doc(db, 'cases', caseData.id), { hearingDates: arrayUnion({ ...hearing, date: Timestamp.fromDate(hearing.date) }), updatedAt: Timestamp.now() });
      setCaseData({ ...caseData, hearingDates: [...caseData.hearingDates, hearing] });

      if (caseData.advocateId && caseData.advocateName) {
        const advocate = advocates.find(a => a.id === caseData.advocateId);
        if (advocate) {
          notifyHearingScheduled(advocate.email || '', advocate.name, {
            caseTitle: caseData.title,
            hearingDate: formatDate(hearing.date),
            venue: hearing.venue,
            purpose: hearing.purpose,
          }).catch(err => console.error('Failed to send hearing notification:', err));
        }
      }

      setHearingForm({ date: '', venue: '', purpose: '', outcome: '' });
      setShowHearingForm(false);
      toast.success('Hearing date added');
    } catch (error) {
      console.error('Error adding hearing:', error);
      toast.error('Failed to add hearing');
    }
    setSavingHearing(false);
  };

  const printCase = () => {
    const w = window.open('', '_blank');
    if (!w || !caseData) return;
    w.document.write(`<html><head><title>Case Report - ${caseData.caseNumber}</title>
    <style>body{font-family:Arial,sans-serif;padding:30px;color:#222}
    .header{border-bottom:3px solid #1B2B6B;padding-bottom:15px;margin-bottom:20px}
    .firm{font-size:20px;font-weight:bold;color:#1B2B6B}.sub{font-size:11px;color:#666}
    h2{color:#1B2B6B;font-size:14px;border-bottom:1px solid #eee;padding-bottom:5px}
    table{width:100%;border-collapse:collapse;margin:10px 0;font-size:12px}
    td{padding:6px 10px;border:1px solid #ddd}td:first-child{background:#f5f7fa;font-weight:bold;width:160px}
    .note{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px;margin:6px 0;font-size:12px}
    .hearing{background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px;margin:6px 0;font-size:12px}
    @media print{button{display:none}}</style></head><body>
    <div class="header"><div class="firm">MAIRA &amp; ADHIS COMPANY ADVOCATES</div>
    <div class="sub">17 Usalama Drive, Dar Es Salaam, Tanzania | Tel: +255 763 717 988 | info@maca.co.tz</div></div>
    <h2>CASE FILE: ${caseData.caseNumber}</h2>
    <table>
      <tr><td>Case Title</td><td>${caseData.title}</td></tr>
      <tr><td>Court</td><td>${caseData.courtName}</td></tr>
      <tr><td>Plaintiff</td><td>${caseData.partiesNames.plaintiff}</td></tr>
      <tr><td>Defendant</td><td>${caseData.partiesNames.defendant}</td></tr>
      <tr><td>Opposing Counsel</td><td>${caseData.opposingCounsel || '—'}</td></tr>
      <tr><td>Presiding Judge / Magistrate</td><td>${caseData.judgeName || '—'}</td></tr>
      <tr><td>Our Advocate</td><td>${caseData.advocateName}</td></tr>
      <tr><td>Filing Date</td><td>${formatDate(caseData.filingDate)}</td></tr>
      <tr><td>Status</td><td>${caseData.status}</td></tr>
      <tr><td>Category</td><td>${caseData.category}</td></tr>
      <tr><td>Description</td><td>${caseData.description}</td></tr>
      ${caseData.judgment ? `<tr><td>Judgment</td><td>${caseData.judgment}</td></tr>` : ''}
    </table>
    <h2>Hearing Dates (${caseData.hearingDates.length})</h2>
    ${caseData.hearingDates.map(h => `<div class="hearing"><strong>${formatDate(h.date)}</strong> — ${h.purpose}<br/><small>${h.venue}</small>${h.outcome ? `<br/><em>Outcome: ${h.outcome}</em>` : ''}</div>`).join('')}
    <h2>Case Notes (${caseData.notes.length})</h2>
    ${caseData.notes.map(n => `<div class="note">${n.content}<br/><small>— ${n.authorName}, ${formatDate(n.createdAt)}</small></div>`).join('')}
    <p style="margin-top:40px;font-size:10px;color:#999">Printed: ${new Date().toLocaleString()} | MAIRA &amp; ADHIS COMPANY ADVOCATES — CONFIDENTIAL</p>
    </body></html>`);
    w.document.close();
    w.print();
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!caseData) return (
    <div className="flex flex-col items-center justify-center py-24">
      <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
      <h2 className="text-lg font-semibold text-gray-700">Case Not Found</h2>
      <Link to="/cases" className="mt-4 text-primary-600 hover:underline text-sm">Back to Cases</Link>
    </div>
  );

  const now = new Date();
  const upcomingHearings = caseData.hearingDates.filter(h => new Date(h.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastHearings = caseData.hearingDates.filter(h => new Date(h.date) < now).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/cases" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cases
        </Link>
        <div className="flex gap-2">
          <button onClick={printCase} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={openEditModal} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            <Edit2 className="h-4 w-4" /> Edit Case
          </button>
        </div>
      </div>

      {showEditModal && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">Edit Case</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Case Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Court Name *</label>
                  <select
                    value={editForm.courtName}
                    onChange={e => setEditForm({ ...editForm, courtName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {COURT_NAMES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-600">Plaintiffs *</label>
                  <button type="button" onClick={() => addParty('plaintiffs')} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {editForm.plaintiffs.map((plaintiff, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={plaintiff}
                        onChange={e => updateParty('plaintiffs', i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Plaintiff name"
                      />
                      {editForm.plaintiffs.length > 1 && (
                        <button type="button" onClick={() => removeParty('plaintiffs', i)} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
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
                  <button type="button" onClick={() => addParty('defendants')} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {editForm.defendants.map((defendant, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={defendant}
                        onChange={e => updateParty('defendants', i, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Defendant name"
                      />
                      {editForm.defendants.length > 1 && (
                        <button type="button" onClick={() => removeParty('defendants', i)} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
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
                  <button type="button" onClick={() => setEditForm({ ...editForm, selectedAdvocateIds: [...editForm.selectedAdvocateIds, ''], selectedAdvocateNames: [...editForm.selectedAdvocateNames, ''] })} className="text-xs text-primary-600 hover:text-primary-700">+ Add</button>
                </div>
                <div className="space-y-2">
                  {editForm.selectedAdvocateIds.map((advId, i) => (
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
                      {editForm.selectedAdvocateIds.length > 1 && (
                        <button type="button" onClick={() => setEditForm({ ...editForm, selectedAdvocateIds: editForm.selectedAdvocateIds.filter((_, ii) => ii !== i), selectedAdvocateNames: editForm.selectedAdvocateNames.filter((_, ii) => ii !== i) })} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {CASE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Filing Date *</label>
                  <input
                    type="date"
                    value={editForm.filingDate}
                    onChange={e => setEditForm({ ...editForm, filingDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Opposing Counsel</label>
                <input
                  type="text"
                  value={editForm.opposingCounsel}
                  onChange={e => setEditForm({ ...editForm, opposingCounsel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editForm.opposingCounselPhone}
                    onChange={e => setEditForm({ ...editForm, opposingCounselPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.opposingCounselEmail}
                    onChange={e => setEditForm({ ...editForm, opposingCounselEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    value={editForm.opposingCounselAddress}
                    onChange={e => setEditForm({ ...editForm, opposingCounselAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judge / Magistrate Name</label>
                <input
                  type="text"
                  value={editForm.judgeName}
                  onChange={e => setEditForm({ ...editForm, judgeName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as CaseStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={savingEdit}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Scale className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium font-mono">{caseData.caseNumber}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">{caseData.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{caseData.courtName}</p>
            </div>
          </div>
          <span className={clsx('text-sm px-3 py-1.5 rounded-full font-semibold', getStatusColor(caseData.status))}>{caseData.status}</span>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
          {[
            { label: 'Plaintiff', value: caseData.partiesNames.plaintiff },
            { label: 'Defendant', value: caseData.partiesNames.defendant },
            { label: 'Category', value: caseData.category },
            { label: 'Filed Date', value: formatDate(caseData.filingDate) },
            ...(caseData.opposingCounsel ? [{ label: 'Opposing Counsel', value: caseData.opposingCounsel }] : []),
            ...(caseData.judgeName ? [{ label: 'Presiding Judge / Magistrate', value: caseData.judgeName }] : []),
          ].map(item => (
            <div key={item.label}>
              <p className="text-xs text-gray-400 font-medium">{item.label}</p>
              <p className="text-sm text-gray-800 font-medium mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'hearings', 'notes', 'documents'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
              activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab} {tab === 'hearings' ? `(${caseData.hearingDates.length})` : tab === 'notes' ? `(${caseData.notes.length})` : tab === 'documents' ? `(${caseData.documents.length})` : ''}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Case Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{caseData.description}</p>
              {caseData.judgment && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Judgment / Outcome</p>
                  <p className="text-sm text-green-800">{caseData.judgment}</p>
                </div>
              )}
            </div>
            {upcomingHearings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" />Next Hearing</p>
                <p className="text-base font-bold text-blue-900">{formatDate(upcomingHearings[0].date)}</p>
                <p className="text-sm text-blue-700">{upcomingHearings[0].purpose}</p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{upcomingHearings[0].venue}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">Case Details</h2>
              {[
                { icon: User, label: 'Client', value: caseData.clientName },
                { icon: Scale, label: 'Advocate', value: caseData.advocateName },
                { icon: User, label: 'Opposing Counsel', value: caseData.opposingCounsel || '—' },
                { icon: User, label: 'Judge / Magistrate', value: caseData.judgeName || '—' },
                { icon: Calendar, label: 'Last Updated', value: formatDate(caseData.updatedAt) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <item.icon className="h-4 w-4 text-primary-600 flex-shrink-0" />
                  <div><p className="text-xs text-gray-400">{item.label}</p><p className="text-sm font-medium text-gray-800">{item.value}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hearings' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-900">Hearing Dates</h2>
            <button onClick={() => setShowHearingForm(!showHearingForm)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">
              <Plus className="h-3.5 w-3.5" /> Add Hearing
            </button>
          </div>
          {showHearingForm && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <input type="date" value={hearingForm.date} onChange={e => setHearingForm({...hearingForm, date: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={hearingForm.venue} onChange={e => setHearingForm({...hearingForm, venue: e.target.value})} placeholder="Venue" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={hearingForm.purpose} onChange={e => setHearingForm({...hearingForm, purpose: e.target.value})} placeholder="Purpose" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={hearingForm.outcome} onChange={e => setHearingForm({...hearingForm, outcome: e.target.value})} placeholder="Outcome (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <div className="flex gap-2">
                <button onClick={addHearing} disabled={savingHearing} className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                  {savingHearing ? 'Adding...' : 'Add Hearing'}
                </button>
                <button onClick={() => setShowHearingForm(false)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {upcomingHearings.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-600 uppercase mt-4">Upcoming</h3>
                {upcomingHearings.map(h => (
                  <div key={h.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900">{formatDate(h.date)}</p>
                    <p className="text-sm text-blue-700 mt-1">{h.purpose}</p>
                    <p className="text-xs text-blue-600 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{h.venue}</p>
                  </div>
                ))}
              </>
            )}
            {pastHearings.length > 0 && (
              <>
                <h3 className="text-xs font-semibold text-gray-600 uppercase mt-4">Past</h3>
                {pastHearings.map(h => (
                  <div key={h.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700">{formatDate(h.date)}</p>
                    <p className="text-sm text-gray-600 mt-1">{h.purpose}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{h.venue}</p>
                    {h.outcome && <p className="text-xs text-gray-600 mt-1"><strong>Outcome:</strong> {h.outcome}</p>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Add a note..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <button onClick={addNote} disabled={savingNote} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60">
              {savingNote ? 'Adding...' : 'Add Note'}
            </button>
          </div>
          <div className="space-y-3">
            {caseData.notes.map(note => (
              <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-gray-800">{note.content}</p>
                <p className="text-xs text-gray-500 mt-2">— {note.authorName}, {formatDate(note.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No documents added yet</p>
        </div>
      )}
    </div>
  );
};

export default CaseDetailPage;