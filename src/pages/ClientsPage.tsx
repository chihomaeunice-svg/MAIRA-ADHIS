import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, Eye, Building2, User, Phone, Mail } from 'lucide-react';
import { mockClients } from '@/data/mockData';
import { Client } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const ClientsPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [clients] = useState<Client[]>(mockClients);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'CORPORATE'>('ALL');

  useEffect(() => { setPageTitle('Clients'); }, [setPageTitle]);

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{filtered.length} of {clients.length} clients</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
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
      {filtered.length === 0 ? (
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
                <Link
                  to={`/clients/${client.id}`}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientsPage;
