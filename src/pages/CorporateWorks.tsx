import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Building2, Phone, Mail, X, Trash2, ChevronDown, ChevronUp, Briefcase,
  FileText, Upload, Download,
} from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase';
import { useStorage } from '@/hooks/useStorage';
import { Company, CorporateWorkItem, CorporateWorkStatus, DocumentRef } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getStatusColor, formatDate } from '@/lib/utils';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface NewCompanyForm {
  name: string;
  registrationNumber: string;
  industry: string;
  clientName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  retainerStatus: 'ACTIVE' | 'INACTIVE';
}

const defaultForm = (): NewCompanyForm => ({
  name: '',
  registrationNumber: '',
  industry: '',
  clientName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  address: '',
  retainerStatus: 'ACTIVE',
});

interface NewWorkForm {
  title: string;
  workType: string;
  status: CorporateWorkStatus;
  dueDate: string;
  notes: string;
}

const defaultWorkForm = (): NewWorkForm => ({ title: '', workType: '', status: 'PENDING', dueDate: '', notes: '' });

const CorporateWorks: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const { uploadFile } = useStorage();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [form, setForm] = useState<NewCompanyForm>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [workForm, setWorkForm] = useState<NewWorkForm>(defaultWorkForm());
  const [savingWork, setSavingWork] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  useEffect(() => { setPageTitle('Corporate Works'); }, [setPageTitle]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'companies'), orderBy('createdAt', 'desc')));
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt?.toDate?.() ?? new Date(),
          works: (raw.works ?? []).map((w: any) => ({ ...w, dueDate: w.dueDate?.toDate?.() ?? undefined, createdAt: w.createdAt?.toDate?.() ?? new Date() })),
          documents: raw.documents ?? [],
        } as Company;
      });
      setCompanies(data);
    } catch {
      toast.error('Failed to load corporate works');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanies(); }, []);

  const filtered = companies.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Company name is required'); return; }
    if (!form.clientName.trim()) { toast.error('Client name is required'); return; }
    if (!form.contactPerson.trim()) { toast.error('Contact person is required'); return; }
    if (!form.contactPhone.trim()) { toast.error('Contact phone is required'); return; }
    setSaving(true);
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'companies'), {
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || null,
        industry: form.industry.trim() || null,
        clientName: form.clientName.trim(),
        contactPerson: form.contactPerson.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim() || null,
        address: form.address.trim() || null,
        retainerStatus: form.retainerStatus,
        works: [],
        documents: [],
        addedBy: user?.id || 'unknown',
        addedByName: user?.name || 'Unknown',
        createdAt: now,
      });
      const newCompany: Company = {
        id: docRef.id,
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || undefined,
        industry: form.industry.trim() || undefined,
        clientName: form.clientName.trim(),
        contactPerson: form.contactPerson.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim() || undefined,
        address: form.address.trim() || undefined,
        retainerStatus: form.retainerStatus,
        works: [],
        documents: [],
        createdAt: new Date(),
      };
      setCompanies(prev => [newCompany, ...prev]);
      toast.success('Company added successfully');
      setShowNewCompany(false);
      setForm(defaultForm());
    } catch (err) {
      console.error(err);
      toast.error('Failed to save company. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'companies', id));
      setCompanies(prev => prev.filter(c => c.id !== id));
      toast.success('Company removed');
    } catch {
      toast.error('Failed to remove company');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const addWork = async (companyId: string) => {
    if (!workForm.title.trim() || !workForm.workType.trim()) { toast.error('Title and work type are required'); return; }
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    setSavingWork(true);
    const work: CorporateWorkItem = {
      id: `work-${Date.now()}`,
      title: workForm.title.trim(),
      workType: workForm.workType.trim(),
      status: workForm.status,
      dueDate: workForm.dueDate ? new Date(workForm.dueDate) : undefined,
      notes: workForm.notes.trim() || undefined,
      createdAt: new Date(),
    };
    try {
      await updateDoc(doc(db, 'companies', companyId), {
        works: arrayUnion({
          ...work,
          dueDate: work.dueDate ? Timestamp.fromDate(work.dueDate) : null,
          createdAt: Timestamp.now(),
        }),
      });
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, works: [...c.works, work] } : c));
      setWorkForm(defaultWorkForm());
      toast.success('Work item added');
    } catch {
      toast.error('Failed to add work item');
    } finally {
      setSavingWork(false);
    }
  };

  const uploadCompanyDocument = async (companyId: string, file: File) => {
    setUploadingFor(companyId);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `companies/${companyId}/${Date.now()}-${safeName}`;
      const url = await uploadFile(file, path);
      const docRef: DocumentRef = { id: `doc-${Date.now()}`, name: file.name, url };
      await updateDoc(doc(db, 'companies', companyId), { documents: arrayUnion(docRef) });
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, documents: [...c.documents, docRef] } : c));
      toast.success('Document uploaded');
    } catch {
      toast.error('Failed to upload document');
    } finally {
      setUploadingFor(null);
    }
  };

  const removeCompanyDocument = async (companyId: string, docRef: DocumentRef) => {
    try {
      await updateDoc(doc(db, 'companies', companyId), { documents: arrayRemove(docRef) });
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, documents: c.documents.filter(d => d.id !== docRef.id) } : c));
      toast.success('Document removed');
    } catch {
      toast.error('Failed to remove document');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Corporate Works</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {companies.length} corporate clients</p>
        </div>
        <button
          onClick={() => setShowNewCompany(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Company
        </button>
      </div>

      <div className="flex-1 min-w-[200px] relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by company, contact person, industry..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No corporate clients found</p>
          <p className="text-gray-400 text-sm mt-1">Add a company to start tracking corporate work</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(company => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-gray-900">{company.name}</h3>
                      <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor(company.retainerStatus))}>
                        {company.retainerStatus}
                      </span>
                    </div>
                    {company.industry && <p className="text-xs text-gray-500 mt-0.5">{company.industry}</p>}
                    <p className="text-xs text-gray-600 mt-1">Client: <span className="font-medium">{company.clientName}</span>{company.registrationNumber && <span className="text-gray-400"> · Reg. No. {company.registrationNumber}</span>}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-gray-600"><Phone className="h-3 w-3 text-gray-400" />{company.contactPhone}</span>
                      {company.contactEmail && <span className="flex items-center gap-1 text-xs text-gray-600"><Mail className="h-3 w-3 text-gray-400" />{company.contactEmail}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {deleteConfirmId === company.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDeleteCompany(company.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Confirm</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(company.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove company">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(expandedId === company.id ? null : company.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                  >
                    <Briefcase className="h-3.5 w-3.5" /> Works ({company.works.length}) · Docs ({company.documents.length})
                    {expandedId === company.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {expandedId === company.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {company.works.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-3">No work items yet</p>
                  ) : (
                    company.works.map(w => (
                      <div key={w.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{w.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{w.workType}{w.dueDate ? ` · Due ${formatDate(w.dueDate)}` : ''}</p>
                          {w.notes && <p className="text-xs text-gray-500 mt-1">{w.notes}</p>}
                        </div>
                        <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', getStatusColor(w.status))}>
                          {w.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))
                  )}

                  <div className="bg-white border border-dashed border-gray-300 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Add Work Item</p>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input value={workForm.title} onChange={e => setWorkForm(f => ({ ...f, title: e.target.value }))} placeholder="Title"
                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      <input value={workForm.workType} onChange={e => setWorkForm(f => ({ ...f, workType: e.target.value }))} placeholder="Type (e.g. Contract Review)"
                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                      <select value={workForm.status} onChange={e => setWorkForm(f => ({ ...f, status: e.target.value as CorporateWorkStatus }))}
                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      <input type="date" value={workForm.dueDate} onChange={e => setWorkForm(f => ({ ...f, dueDate: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                    <textarea value={workForm.notes} onChange={e => setWorkForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" rows={2}
                      className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none mb-2" />
                    <div className="flex justify-end">
                      <button onClick={() => addWork(company.id)} disabled={savingWork}
                        className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60">
                        {savingWork ? 'Saving…' : 'Add Work Item'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Company Documents</p>
                    {company.documents.length === 0 ? (
                      <p className="text-sm text-gray-400 mb-2">No documents uploaded yet</p>
                    ) : (
                      <div className="space-y-1.5 mb-2">
                        {company.documents.map(docItem => (
                          <div key={docItem.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="flex-1 min-w-0 text-sm text-gray-700 truncate">{docItem.name}</span>
                            <a href={docItem.url} target="_blank" rel="noopener noreferrer"
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Download">
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button onClick={() => removeCompanyDocument(company.id, docItem)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className={clsx(
                      'flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-50 transition-colors',
                      uploadingFor === company.id ? 'text-gray-400 pointer-events-none' : 'text-primary-600'
                    )}>
                      <Upload className="h-3.5 w-3.5" />
                      {uploadingFor === company.id ? 'Uploading…' : 'Upload document (registration certificate, requirements, etc.)'}
                      <input type="file" className="hidden" disabled={uploadingFor === company.id}
                        onChange={e => { const file = e.target.files?.[0]; if (file) uploadCompanyDocument(company.id, file); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showNewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Company</h2>
              <button onClick={() => { setShowNewCompany(false); setForm(defaultForm()); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form id="new-company-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Acme Ltd"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
                  <input value={form.registrationNumber} onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))} placeholder="e.g. 12345678"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))} placeholder="e.g. Manufacturing"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="e.g. John Mwangi"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} placeholder="e.g. Jane Doe"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input type="tel" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} placeholder="+255 7XX XXX XXX"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="contact@company.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="e.g. P.O. Box 123, Dar es Salaam"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Retainer Status</label>
                <div className="flex gap-2">
                  {(['ACTIVE', 'INACTIVE'] as const).map(s => (
                    <button key={s} type="button" onClick={() => setForm(f => ({ ...f, retainerStatus: s }))}
                      className={clsx('flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                        form.retainerStatus === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')}>
                      {s === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>
              </div>
            </form>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
              <button type="button" onClick={() => { setShowNewCompany(false); setForm(defaultForm()); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button type="submit" form="new-company-form" disabled={saving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {saving ? 'Saving...' : 'Add Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateWorks;
