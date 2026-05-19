import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, User, Building2, Phone, Mail, MapPin, Briefcase,
  Calendar, Hash, AlertCircle,
} from 'lucide-react';
import { mockClients, mockCases } from '@/data/mockData';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setPageTitle } = useUIStore();
  const client = mockClients.find((c) => c.id === id);
  const clientCases = mockCases.filter((c) => c.clientId === id);

  useEffect(() => {
    setPageTitle(client ? client.fullName : 'Client Not Found');
  }, [client, setPageTitle]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">Client Not Found</h2>
        <p className="text-gray-500 text-sm mt-1">The client record you are looking for does not exist.</p>
        <Link to="/clients" className="mt-4 text-primary-600 hover:underline text-sm font-medium">
          Back to Clients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <div className="flex items-start gap-4">
          <div className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0',
            client.clientType === 'CORPORATE' ? 'bg-blue-100' : 'bg-purple-100'
          )}>
            {client.clientType === 'CORPORATE'
              ? <Building2 className="h-8 w-8 text-blue-600" />
              : <User className="h-8 w-8 text-purple-600" />
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{client.fullName}</h1>
              <span className={clsx(
                'text-xs px-2.5 py-1 rounded-full font-semibold',
                client.clientType === 'CORPORATE' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
              )}>
                {client.clientType}
              </span>
            </div>
            {client.companyName && client.companyName !== client.fullName && (
              <p className="text-gray-600 text-sm mt-0.5">{client.companyName}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">Client since {formatDate(client.createdAt)}</p>
          </div>
        </div>

        {/* Contact Details */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-800">{client.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-800">{client.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-400">Address</p>
              <p className="text-sm font-medium text-gray-800">{client.address}</p>
            </div>
          </div>
          {client.idNumber && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Hash className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">ID Number</p>
                <p className="text-sm font-medium text-gray-800">{client.idNumber}</p>
              </div>
            </div>
          )}
          {client.companyReg && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Company Registration</p>
                <p className="text-sm font-medium text-gray-800">{client.companyReg}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cases */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary-600" />
            Cases ({clientCases.length})
          </h2>
          <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            New Case
          </button>
        </div>
        {clientCases.length === 0 ? (
          <div className="py-8 text-center">
            <Briefcase className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No cases for this client</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientCases.map((c) => (
              <Link
                key={c.id}
                to={`/cases/${c.id}`}
                className="flex items-start justify-between gap-3 p-4 bg-gray-50 hover:bg-primary-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 truncate">
                    {c.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{c.caseNumber}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(c.filingDate)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      {c.advocateName}
                    </div>
                  </div>
                </div>
                <span className={clsx('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', getStatusColor(c.status))}>
                  {c.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailPage;
