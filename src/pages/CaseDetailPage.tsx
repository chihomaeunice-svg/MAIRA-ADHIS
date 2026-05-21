import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Scale, Calendar, User, FileText, MessageSquare,
  Clock, MapPin, CheckCircle2, AlertCircle, Plus, Edit2,
  Save, X, Printer, Upload, ChevronDown,
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { mockCases } from '@/data/mockData';
import { Case, CaseStatus, HearingDate, Note } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const STATUSES: CaseStatus[] = ['NEW', 'ONGOING', 'COMPLETED', 'ARCHIVED'];

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hearings' | 'notes' | 'documents'>('overview');

  // Edit case state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', status: '' as CaseStatus, judgment: '' });

  // Add note state
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Add hearing state
  const [showHearingForm, setShowHearingForm] = useState(false);
  const [hearingForm, setHearingForm] = useState({ date: '', venue: '', purpose: '', outcome: '' });
  const [savingHearing, setSavingHearing] = useState(false);

  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadCase = async () => {
    setLoading(true);
    try {
      // Try Firestore first
      if (id && !id.startsWith('case-')) {
        const docRef = doc(db, 'cases', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCaseData({ id: docSnap.id, ...data, filingDate: data.filingDate?.toDate?.() ?? new Date(data.filingDate), createdAt: data.createdAt?.toDate?.() ?? new Date(), updatedAt: data.updatedAt?.toDate?.() ?? new Date() } as Case);
          setPageTitle(`Case: ${data.caseNumber}`);
          setLoading(false);
          return;
        }
      }
      // Fall back to mock data
      const mock = mockCases.find((c) => c.id === id);
      if (mock) { setCaseData(mock); setPageTitle(`Case: ${mock.caseNumber}`); }
    } catch { const mock = mockCases.find((c) => c.id === id); if (mock) { setCaseData(mock); setPageTitle(`Case: ${mock.caseNumber}`); } }
    setLoading(false);
  };

  const startEdit = () => {
    if (!caseData) return;
    setEditForm({ title: caseData.title, description: caseData.description, status: caseData.status, judgment: caseData.judgment || '' });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!caseData) return;
    setSavingEdit(true);
    try {
      if (!caseData.id.startsWith('case-')) {
        await updateDoc(doc(db, 'cases', caseData.id), { ...editForm, updatedAt: Timestamp.now() });
      }
      setCaseData({ ...caseData, ...editForm });
      setEditing(false);
      toast.success('Case updated successfully');
    } catch { toast.error('Failed to save changes'); }
    setSavingEdit(false);
  };

  const addNote = async () => {
    if (!noteText.trim() || !caseData) return;
    setSavingNote(true);
    const note: Note = { id: `note-${Date.now()}`, content: noteText.trim(), authorId: user?.id || '', authorName: user?.name || 'Unknown', createdAt: new Date() };
    try {
      if (!caseData.id.startsWith('case-')) {
        await updateDoc(doc(db, 'cases', caseData.id), { notes: arrayUnion({ ...note, createdAt: Timestamp.now() }), updatedAt: Timestamp.now() });
      }
      setCaseData({ ...caseData, notes: [...caseData.notes, note] });
      setNoteText('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
    setSavingNote(false);
  };

  const addHearing = async () => {
    if (!hearingForm.date || !hearingForm.venue || !hearingForm.purpose || !caseData) return;
    setSavingHearing(true);
    const hearing: HearingDate = { id: `h-${Date.now()}`, date: new Date(hearingForm.date), venue: hearingForm.venue, purpose: hearingForm.purpose, outcome: hearingForm.outcome || undefined };
    try {
      if (!caseData.id.startsWith('case-')) {
        await updateDoc(doc(db, 'cases', caseData.id), { hearingDates: arrayUnion({ ...hearing, date: Timestamp.fromDate(hearing.date) }), updatedAt: Timestamp.now() });
      }
      setCaseData({ ...caseData, hearingDates: [...caseData.hearingDates, hearing] });
      setHearingForm({ date: '', venue: '', purpose: '', outcome: '' });
      setShowHearingForm(false);
      toast.success('Hearing date added');
    } catch { toast.error('Failed to add hearing'); }
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
    w.document.close(); w.print();
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
  const upcomingHearings = caseData.hearingDates.filter(h => new Date(h.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastHearings = caseData.hearingDates.filter(h => new Date(h.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/cases" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Cases
        </Link>
        <div className="flex gap-2">
          <button onClick={printCase} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Printer className="h-4 w-4" /> Print
          </button>
          {!editing ? (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              <Edit2 className="h-4 w-4" /> Edit Case
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                <X className="h-4 w-4" /> Cancel
              </button>
              <button onClick={saveEdit} disabled={savingEdit} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                <Save className="h-4 w-4" /> {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        {editing ? (
          <div className="space-y-4">
            <input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})}
              className="w-full text-xl font-bold border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Case Title" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as CaseStatus})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Judgment/Outcome</label>
                <input value={editForm.judgment} onChange={e => setEditForm({...editForm, judgment: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Judgment or outcome (optional)" />
              </div>
            </div>
            <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Case description" />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'hearings', 'notes', 'documents'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors',
              activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
            {tab} {tab === 'hearings' ? `(${caseData.hearingDates.length})` : tab === 'notes' ? `(${caseData.notes.length})` : tab === 'documents' ? `(${caseData.documents.length})` : ''}
          </button>
        ))}
      </div>

      {/* Tab Content */}
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
          <div className="flex justify-end">
            <button onClick={() => setShowHearingForm(true)} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700">
              <Plus className="h-4 w-4" /> Add Hearing Date
            </button>
          </div>
          {showHearingForm && (
            <div className="bg-white rounded-xl border border-primary-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">New Hearing Date</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Date *</label>
                  <input type="datetime-local" value={hearingForm.date} onChange={e => setHearingForm({...hearingForm, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Venue *</label>
                  <input value={hearingForm.venue} onChange={e => setHearingForm({...hearingForm, venue: e.target.value})} placeholder="Court / venue name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Purpose *</label>
                  <input value={hearingForm.purpose} onChange={e => setHearingForm({...hearingForm, purpose: e.target.value})} placeholder="e.g. Case Management Conference"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="text-xs font-medium text-gray-600 mb-1 block">Outcome (if past)</label>
                  <input value={hearingForm.outcome} onChange={e => setHearingForm({...hearingForm, outcome: e.target.value})} placeholder="Optional outcome"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowHearingForm(false)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={addHearing} disabled={savingHearing || !hearingForm.date || !hearingForm.venue || !hearingForm.purpose}
                  className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60">
                  {savingHearing ? 'Saving…' : 'Add Hearing'}
                </button>
              </div>
            </div>
          )}
          {upcomingHearings.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upcoming</p>
              {upcomingHearings.map(h => (
                <div key={h.id} className="bg-white border border-blue-200 rounded-xl p-4 mb-2 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0"><Calendar className="h-5 w-5 text-blue-600" /></div>
                  <div><p className="text-sm font-bold text-gray-900">{formatDate(h.date)}</p>
                    <p className="text-sm text-gray-700">{h.purpose}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{h.venue}</p></div>
                </div>
              ))}
            </div>
          )}
          {pastHearings.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Past Hearings</p>
              {pastHearings.map(h => (
                <div key={h.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-2 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Clock className="h-5 w-5 text-gray-500" /></div>
                  <div><p className="text-sm font-semibold text-gray-700">{formatDate(h.date)}</p>
                    <p className="text-sm text-gray-600">{h.purpose}</p>
                    {h.outcome && <p className="text-xs text-green-700 mt-1 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />{h.outcome}</p>}
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" />{h.venue}</p></div>
                </div>
              ))}
            </div>
          )}
          {caseData.hearingDates.length === 0 && !showHearingForm && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No hearing dates yet</p>
              <button onClick={() => setShowHearingForm(true)} className="mt-3 text-primary-600 text-sm font-medium hover:underline">Add first hearing date</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Note</h3>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={3} placeholder="Write a case note, update, or observation…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            <div className="flex justify-end mt-2">
              <button onClick={addNote} disabled={savingNote || !noteText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60">
                <MessageSquare className="h-4 w-4" /> {savingNote ? 'Saving…' : 'Add Note'}
              </button>
            </div>
          </div>
          {caseData.notes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
              <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No notes yet. Add the first note above.</p>
            </div>
          ) : (
            [...caseData.notes].reverse().map(note => (
              <div key={note.id} className="bg-white rounded-xl border border-amber-200 p-4">
                <p className="text-sm text-gray-800 leading-relaxed">{note.content}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">{note.authorName.charAt(0)}</div>
                  <span className="text-xs text-gray-600 font-medium">{note.authorName}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-4">
          {caseData.documents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No documents attached to this case</p>
              <Link to="/documents" className="mt-3 inline-block text-primary-600 text-sm font-medium hover:underline">Go to Documents →</Link>
            </div>
          ) : (
            caseData.documents.map(docItem => (
              <div key={docItem.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{docItem.name}</p></div>
                <div className="flex gap-2">
                  {docItem.url && docItem.url !== '#' && (
                    <>
                      <button onClick={() => window.open(docItem.url, '_blank')} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Download</button>
                      <button onClick={() => { const w = window.open(docItem.url, '_blank'); if (w) { w.onload = () => w.print(); }}} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-1"><Printer className="h-3 w-3" />Print</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CaseDetailPage;
