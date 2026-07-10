import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Upload, Download, ArrowLeft, X, Eye, EyeOff } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Company } from '@/types';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const REGISTRATION_TYPES = ['NEW_REGISTRATION', 'RENEWAL', 'AMENDMENT', 'DISSOLUTION'];
const BUSINESS_TYPES = ['Private Limited', 'Public Limited', 'Partnership', 'Sole Proprietorship', 'NGO', 'Cooperative', 'Other'];
const DOC_TYPES = ['MEMORANDUM', 'ARTICLES', 'ID', 'ADDRESS_PROOF', 'OTHER'];

const CorporateWorksPage: React.FC = () => {
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    companyName: '',
    registrationType: 'NEW_REGISTRATION',
    registrationNumber: '',
    clientName: '',
    clientId: '',
    directorName: '',
    directorPhone: '',
    directorEmail: '',
    businessType: '',
    businessAddress: '',
    capitalAmount: '',
    status: 'DRAFT',
    notes: '',
  });
  const [clients, setClients] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    setPageTitle('Corporate Registration Works');
    loadCompanies();
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const snap = await getDocs(collection(db, 'clients'));
      setClients(snap.docs.map(d => ({ id: d.id, fullName: d.data().fullName })));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'companies'));
      const data = snap.docs.map(d => {
        const raw = d.data();
        return {
          ...raw,
          id: d.id,
          createdAt: raw.createdAt?.toDate?.() ?? new Date(),
          updatedAt: raw.updatedAt?.toDate?.() ?? new Date(),
          documents: (raw.documents || []).map((doc: any) => ({
            ...doc,
            uploadedAt: doc.uploadedAt?.toDate?.() ?? new Date(),
          })),
        } as Company;
      });
      setCompanies(data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: client?.fullName || '',
    });
  };

  const handleSave = async () => {
    if (!formData.companyName || !formData.clientId || !formData.directorName) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      const payload = {
        companyName: formData.companyName,
        registrationType: formData.registrationType,
        registrationNumber: formData.registrationNumber || null,
        clientId: formData.clientId,
        clientName: formData.clientName,
        directorName: formData.directorName,
        directorPhone: formData.directorPhone,
        directorEmail: formData.directorEmail,
        businessType: formData.businessType,
        businessAddress: formData.businessAddress,
        capitalAmount: formData.capitalAmount ? parseInt(formData.capitalAmount) : null,
        status: formData.status,
        notes: formData.notes || null,
        assignedTo: user?.id || null,
        updatedAt: Timestamp.now(),
      };

      if (editingId) {
        await updateDoc(doc(db, 'companies', editingId), payload);
        toast.success('Company updated successfully');
      } else {
        await addDoc(collection(db, 'companies'), {
          ...payload,
          documents: [],
          createdAt: Timestamp.now(),
        });
        toast.success('Company registered successfully');
      }

      resetForm();
      loadCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error('Failed to save company');
    }
  };

  const handleEdit = (company: Company) => {
    setFormData({
      companyName: company.companyName,
      registrationType: company.registrationType,
      registrationNumber: company.registrationNumber || '',
      clientId: company.clientId,
      clientName: company.clientName,
      directorName: company.directorName,
      directorPhone: company.directorPhone,
      directorEmail: company.directorEmail,
      businessType: company.businessType,
      businessAddress: company.businessAddress,
      capitalAmount: company.capitalAmount?.toString() || '',
      status: company.status,
      notes: company.notes || '',
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this company registration?')) return;
    try {
      await deleteDoc(doc(db, 'companies', id));
      toast.success('Company deleted');
      loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      registrationType: 'NEW_REGISTRATION',
      registrationNumber: '',
      clientName: '',
      clientId: '',
      directorName: '',
      directorPhone: '',
      directorEmail: '',
      businessType: '',
      businessAddress: '',
      capitalAmount: '',
      status: 'DRAFT',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SUBMITTED: 'bg-blue-100 text-blue-700',
      APPROVED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-emerald-100 text-emerald-700',
    };
    return colors[status] || colors.DRAFT;
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Corporate Registration Works</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> New Registration
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Registration' : 'New Company Registration'}
              </h2>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Registration Type *</label>
                  <select
                    value={formData.registrationType}
                    onChange={e => setFormData({ ...formData, registrationType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {REGISTRATION_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., BRN-2024-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={e => handleClientSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select a client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Director Name *</label>
                  <input
                    type="text"
                    value={formData.directorName}
                    onChange={e => setFormData({ ...formData, directorName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Director Phone</label>
                  <input
                    type="tel"
                    value={formData.directorPhone}
                    onChange={e => setFormData({ ...formData, directorPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Director Email</label>
                <input
                  type="email"
                  value={formData.directorEmail}
                  onChange={e => setFormData({ ...formData, directorEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select business type</option>
                    {BUSINESS_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Capital Amount</label>
                  <input
                    type="number"
                    value={formData.capitalAmount}
                    onChange={e => setFormData({ ...formData, capitalAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Business Address</label>
                <textarea
                  value={formData.businessAddress}
                  onChange={e => setFormData({ ...formData, businessAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Enter business address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Add any notes or comments"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                  {editingId ? 'Update' : 'Save'} Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Director</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Reg. Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No company registrations yet
                  </td>
                </tr>
              ) : (
                companies.map(company => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{company.companyName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.clientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.registrationType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{company.directorName}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs px-2 py-1 rounded-full font-medium', getStatusColor(company.status))}>
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(company.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CorporateWorksPage;
