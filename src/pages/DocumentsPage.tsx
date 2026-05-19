import React, { useState, useEffect } from 'react';
import {
  FileText, Upload, Search, Filter, Download, Eye,
  AlertCircle, Calendar, Tag,
} from 'lucide-react';
import { mockDocuments } from '@/data/mockData';
import { Document, DocumentCategory } from '@/types';
import { formatDate, formatFileSize } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

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

function getCategoryColor(category: DocumentCategory): string {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat?.color || 'bg-gray-100 text-gray-600';
}

const DocumentsPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [documents] = useState<Document[]>(mockDocuments);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'ALL'>('ALL');

  useEffect(() => { setPageTitle('Documents'); }, [setPageTitle]);

  const filtered = documents.filter((d) => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const isExpiringSoon = (date?: Date) => {
    if (!date) return false;
    const diff = new Date(date).getTime() - Date.now();
    return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
  };

  const isExpired = (date?: Date) => {
    if (!date) return false;
    return new Date(date).getTime() < Date.now();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Category Filter */}
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

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No documents found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className={clsx(
                'bg-white rounded-xl border shadow-card hover:shadow-card-hover transition-shadow p-5',
                isExpired(doc.expiryDate) ? 'border-red-200' : isExpiringSoon(doc.expiryDate) ? 'border-amber-200' : 'border-gray-200'
              )}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                  <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block', getCategoryColor(doc.category))}>
                    {doc.category}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3 w-3" />
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Uploaded: {formatDate(doc.createdAt)}</span>
                </div>
                {doc.expiryDate && (
                  <div className={clsx(
                    'flex items-center gap-1.5 font-medium',
                    isExpired(doc.expiryDate) ? 'text-red-600' : isExpiringSoon(doc.expiryDate) ? 'text-amber-600' : 'text-gray-500'
                  )}>
                    <AlertCircle className="h-3 w-3" />
                    <span>
                      {isExpired(doc.expiryDate) ? 'Expired: ' : 'Expires: '}
                      {formatDate(doc.expiryDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
