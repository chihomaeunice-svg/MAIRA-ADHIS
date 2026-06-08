import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Eye, Building2, User, Phone, Mail, X, Trash2 } from 'lucide-react';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase';

import { Client } from '@/types';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface NewClientForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idNumber: string;
  clientType: 'INDIVIDUAL' | 'CORPORATE';
  companyName: string;
  companyReg: string;
}

const defaultForm = (): NewClientForm => ({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  idNumber: '',
  clientType: 'INDIVIDUAL',
  companyName: '',
  companyReg: '',
});

const ClientsPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'CORPORATE'>('ALL');
  const [showNewClient, setShowNewClient] = useState(false);
  const [form, setForm] = useState<NewClientForm>(defaultForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => { setPageTitle('Clients'); }, [setPageTitle]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'clients'), orderBy('createdAt', 'desc')));
      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        cases: d.data().cases ?? [],
      })) as Client[];
      setClients(data);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const filtered = clients.filter((c) => {
    const matchSearch =
      !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'ALL' || c.clientType === typeFilter;
    return matchSearch && matchType;
  });

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Client deleted');
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!form.phone.trim()) { toast.error('Phone number is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (form.clientType === 'CORPORATE' && !form.companyName.trim()) {
      toast.error('Company name is required for corporate clients');
      return;
    }
    setSaving(true);
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'clients'), {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        idNumber: form.idNumber.trim() || null,
        clientType: form.clientType,
        companyName: form.clientType === 'CORPORATE' ? form.companyName.trim() : null,
        companyReg: form.clientType === 'CORPORATE' ? form.companyReg.trim() || null : null,
        cases: [],
        addedBy: user?.id || 'unknown',
        addedByName: user?.name || 'Unknown',
        createdAt: now,
      });

      const newClient: Client = {
        id: docRef.id,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        idNumber: form.idNumber.trim() || undefined,
        clientType: form.clientType,
        companyName: form.clientType === 'CORPORATE' ? form.companyName.trim() : undefined,
        companyReg: form.clientType === 'CORPORATE' ? form.companyReg.trim() || undefined : undefined,
        cases: [],
        createdAt: new Date(),
      };

      setClients(prev => [newClient, ...prev]);
      toast.success('Client added successfully');
      setShowNewClient(false);
      setForm(defaultForm());
    } catch (err) {
      console.error(err);
      toast.error('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {clients.length} clients</p>
        </div>
        <button
          onClick={() => setShowNewClient(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Client
        </button>
      </div>

      {/* Type Filter + Search */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(['ALL', 'INDIVIDUAL', 'CORPORATE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                typeFilter === t
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'ALL' ? 'All' : t === 'INDIVIDUAL' ? 'Individual' : 'Corporate'}
              <span className="ml-1.5 text-xs text-gray-400">
                ({t === 'ALL' ? clients.length : clients.filter((c) => c.clientType === t).length})
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No clients found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover transition-shadow p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    client.clientType === 'CORPORATE' ? 'bg-blue-50' : 'bg-purple-50'
                  )}>
                    {client.clientType === 'CORPORATE'
                      ? <Building2 className="h-5 w-5 text-blue-600" />
                      : <User className="h-5 w-5 text-purple-600" />
                    }
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{client.fullName}</h3>
                    {client.companyName && client.companyName !== client.fullName && (
                      <p className="text-xs text-gray-500 mt-0.5">{client.companyName}</p>
                    )}
                  </div>
                </div>
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  client.clientType === 'CORPORATE'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                )}>
                  {client.clientType}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <span className="font-semibold text-gray-700">{client.cases.length}</span> case{client.cases.length !== 1 ? 's' : ''}
                  <span className="text-gray-300 mx-1.5">·</span>
                  Since {new Date(client.createdAt).getFullYear()}
                </div>
                <div className="flex items-center gap-2">
                  {deleteConfirmId === client.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDeleteClient(client.id)} className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">Confirm</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(client.id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete client">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <Link
                    to={`/clients/${client.id}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">New Client</h2>
              <button onClick={() => { setShowNewClient(false); setForm(defaultForm()); }} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form id="new-client-form" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4">
              {/* Client Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Type</label>
                <div className="flex gap-2">
                  {(['INDIVIDUAL', 'CORPORATE'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, clientType: t }))}
                      className={clsx(
                        'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                        form.clientType === t
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {t === 'INDIVIDUAL' ? 'Individual' : 'Corporate'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. John Mwangi"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Corporate fields */}
              {form.clientType === 'CORPORATE' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                      placeholder="e.g. Acme Ltd"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration No.</label>
                    <input
                      type="text"
                      value={form.companyReg}
                      onChange={e => setForm(f => ({ ...f, companyReg: e.target.value }))}
                      placeholder="e.g. 12345678"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+255 7XX XXX XXX"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="e.g. P.O. Box 123, Dar es Salaam"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* ID Number */}
              {form.clientType === 'INDIVIDUAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID / Passport Number</label>
                  <input
                    type="text"
                    value={form.idNumber}
                    onChange={e => setForm(f => ({ ...f, idNumber: e.target.value }))}
                    placeholder="National ID or Passport"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </form>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setShowNewClient(false); setForm(defaultForm()); }}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="new-client-form"
                disabled={saving}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
