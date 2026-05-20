import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Upload, Search, Download, Eye, AlertCircle, Calendar,
  Tag, Trash2, Printer, X, File, FileImage, FileSpreadsheet, Plus,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { useStorage } from '@/hooks/useStorage';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { mockDocuments } from '@/data/mockData';
import { DocumentCategory } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

interface FirestoreDocument {
  id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  storagePath: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  relatedCase?: string;
  expiryDate?: string;
  createdAt: Date;
}

const CATEGORIES: { value: DocumentCategory | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'All Documents', color: '' },
  { value: 'CERTIFICATE', label: 'Certificates', color: 'bg-blue-50 text-blue-700' },
  { value: 'TAX', label: 'Tax Documents', color: 'bg-yellow-50 text-yellow-700' },
  { value: 'BRELA', label: 'BRELA', color: 'bg-purple-50 text-purple-700' },
  { value: 'CONTRACT', label: 'Contracts', color: 'bg-green-50 text-green-700' },
  { value: 'POLICY', label: 'Policies', color: 'bg-orange-50 text-orange-700' },
  { value: 'COURT', label: 'Court Documents', color: 'bg-red-50 text-red-700' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-100 text-gray-600' },
];

const CATEGORY_SELECT: DocumentCategory[] = ['CERTIFICATE', 'TAX', 'BRELA', 'CONTRACT', 'POLICY', 'COURT', 'OTHER'];

function getCategoryColor(category: string): string {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat?.color || 'bg-gray-100 text-gray-600';
}

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType.includes('word') || fileType.includes('doc')) return <FileText className="h-5 w-5 text-blue-500" />;
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xls')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return <FileImage className="h-5 w-5 text-purple-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
}

function getFileIconBg(fileType: string): string {
  if (fileType.includes('pdf')) return 'bg-red-50';
  if (fileType.includes('word') || fileType.includes('doc')) return 'bg-blue-50';
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xls')) return 'bg-green-50';
  if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return 'bg-purple-50';
  return 'bg-gray-100';
}

const isExpiringSoon = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
};

const isExpired = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
};

const printDocument = (url: string, _name: string) => {
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

interface UploadFormData {
  name: string;
  category: DocumentCategory;
  relatedCase: string;
  expiryDate: string;
}

const DocumentsPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();
  const { uploadFile, uploading, progress } = useStorage();

  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'ALL'>('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewDoc, setViewDoc] = useState<FirestoreDocument | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<UploadFormData>({
    name: '',
    category: 'OTHER',
    relatedCase: '',
    expiryDate: '',
  });

  const isAdmin = useAuthStore((s) => s.isAdmin)();

  useEffect(() => { setPageTitle('Documents'); }, [setPageTitle]);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const docs: FirestoreDocument[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          category: data.category,
          fileUrl: data.fileUrl,
          storagePath: data.storagePath,
          fileSize: data.fileSize,
          fileType: data.fileType,
          uploadedBy: data.uploadedBy,
          uploadedByName: data.uploadedByName,
          relatedCase: data.relatedCase,
          expiryDate: data.expiryDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        };
      });
      if (docs.length > 0) {
        setDocuments(docs);
      } else {
        // Fall back to mock data mapped to our structure
        const mapped: FirestoreDocument[] = mockDocuments.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          fileUrl: d.fileUrl,
          storagePath: '',
          fileSize: d.fileSize,
          fileType: 'application/pdf',
          uploadedBy: d.uploadedBy,
          uploadedByName: d.uploadedBy,
          relatedCase: d.relatedCaseId,
          expiryDate: d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : undefined,
          createdAt: d.createdAt,
        }));
        setDocuments(mapped);
      }
    } catch {
      const mapped: FirestoreDocument[] = mockDocuments.map((d) => ({
        id: d.id,
        name: d.name,
        category: d.category,
        fileUrl: d.fileUrl,
        storagePath: '',
        fileSize: d.fileSize,
        fileType: 'application/pdf',
        uploadedBy: d.uploadedBy,
        uploadedByName: d.uploadedBy,
        relatedCase: d.relatedCaseId,
        expiryDate: d.expiryDate ? d.expiryDate.toISOString().split('T')[0] : undefined,
        createdAt: d.createdAt,
      }));
      setDocuments(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const filtered = documents.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setSelectedFile(file);
    if (!form.name) {
      setForm((prev) => ({ ...prev, name: file.name.replace(/\.[^/.]+$/, '') }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error('Please select a file'); return; }
    if (!form.name.trim()) { toast.error('Please enter a document name'); return; }

    try {
      const timestamp = Date.now();
      const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `documents/${form.category}/${safeName}-${timestamp}`;
      const url = await uploadFile(selectedFile, path);

      await addDoc(collection(db, 'documents'), {
        name: form.name.trim(),
        category: form.category,
        fileUrl: url,
        storagePath: path,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        uploadedBy: user?.id || 'unknown',
        uploadedByName: user?.name || 'Unknown User',
        relatedCase: form.relatedCase.trim() || null,
        expiryDate: form.expiryDate || null,
        createdAt: Timestamp.now(),
      });

      toast.success('Document uploaded successfully');
      setShowUploadModal(false);
      setSelectedFile(null);
      setForm({ name: '', category: 'OTHER', relatedCase: '', expiryDate: '' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Please try again.');
    }
  };

  const handleDelete = async (docItem: FirestoreDocument) => {
    if (!confirm(`Delete "${docItem.name}"? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'documents', docItem.id));
      toast.success('Document deleted');
      fetchDocuments();
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const isViewable = (fileType: string) =>
    fileType.includes('pdf') || fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategoryFilter(cat.value)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
              categoryFilter === cat.value
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}
          >
            {cat.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({cat.value === 'ALL' ? documents.length : documents.filter((d) => d.category === cat.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading documents...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No documents found</p>
          <p className="text-gray-400 text-sm mt-1">Upload a document to get started</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((docItem) => (
            <div
              key={docItem.id}
              className={clsx(
                'bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5',
                isExpired(docItem.expiryDate)
                  ? 'border-red-200'
                  : isExpiringSoon(docItem.expiryDate)
                  ? 'border-amber-200'
                  : 'border-gray-200'
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', getFileIconBg(docItem.fileType))}>
                  {getFileIcon(docItem.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate" title={docItem.name}>{docItem.name}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block', getCategoryColor(docItem.category))}>
                    {docItem.category}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3 flex-shrink-0" />
                  <span>{formatFileSize(docItem.fileSize)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span>Uploaded: {formatDate(docItem.createdAt)}</span>
                </div>
                {docItem.uploadedByName && (
                  <div className="text-xs text-gray-400 truncate">By: {docItem.uploadedByName}</div>
                )}
                {docItem.relatedCase && (
                  <div className="text-xs text-gray-400 truncate">Case: {docItem.relatedCase}</div>
                )}
                {docItem.expiryDate && (
                  <div className={clsx(
                    'flex items-center gap-1.5 font-medium',
                    isExpired(docItem.expiryDate) ? 'text-red-600' : isExpiringSoon(docItem.expiryDate) ? 'text-amber-600' : 'text-gray-500'
                  )}>
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {isExpired(docItem.expiryDate) ? 'Expired: ' : 'Expires: '}
                      {formatDate(docItem.expiryDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => {
                    if (docItem.fileUrl === '#') { toast.error('No file available — upload a real file to view it'); return; }
                    setViewDoc(docItem);
                  }}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button
                  onClick={() => {
                    if (docItem.fileUrl === '#') { toast.error('No file available — upload a real file to download it'); return; }
                    window.open(docItem.fileUrl, '_blank');
                  }}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
                <button
                  onClick={() => {
                    if (docItem.fileUrl === '#') { toast.error('No file available — upload a real file to print it'); return; }
                    printDocument(docItem.fileUrl, docItem.name);
                  }}
                  className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(docItem)}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. TRA Tax Clearance Certificate 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as DocumentCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {CATEGORY_SELECT.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File * (max 10MB)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-gray-300 rounded-lg cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-500 mt-1">{selectedFile.name} ({formatFileSize(selectedFile.size)})</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Case (optional)</label>
                <input
                  type="text"
                  value={form.relatedCase}
                  onChange={(e) => setForm((p) => ({ ...p, relatedCase: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. HC/CIV/001/2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {uploading && (
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Upload</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-base font-semibold text-gray-900 truncate mr-4">{viewDoc.name}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => printDocument(viewDoc.fileUrl, viewDoc.name)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => window.open(viewDoc.fileUrl, '_blank')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button onClick={() => setViewDoc(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {viewDoc.fileType.includes('image') || viewDoc.fileType.includes('png') || viewDoc.fileType.includes('jpg') ? (
                <div className="h-full flex items-center justify-center bg-gray-100 p-4">
                  <img
                    src={viewDoc.fileUrl}
                    alt={viewDoc.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow"
                  />
                </div>
              ) : (
                <iframe
                  src={viewDoc.fileUrl}
                  className="w-full h-full border-0"
                  title={viewDoc.name}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
