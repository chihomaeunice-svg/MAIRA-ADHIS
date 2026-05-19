import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Briefcase, Building, User } from 'lucide-react';
import { Client } from '@/types';
import Badge from '@/components/ui/Badge';

interface ClientCardProps {
  client: Client;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/dashboard/clients/${client.id}`)}
      className="bg-white rounded-xl border border-gray-200 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${client.clientType === 'CORPORATE' ? 'bg-purple-600' : 'bg-primary-600'}`}>
          {client.clientType === 'CORPORATE' ? <Building className="h-6 w-6" /> : client.fullName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{client.fullName}</h3>
          {client.companyName && <p className="text-xs text-gray-500 truncate">{client.companyName}</p>}
          <Badge variant={client.clientType === 'CORPORATE' ? 'secondary' : 'primary'} size="sm" className="mt-1">
            {client.clientType === 'CORPORATE' ? 'Corporate' : 'Individual'}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600">{client.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{client.email}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-xs text-gray-600">{client.cases.length} {client.cases.length === 1 ? 'case' : 'cases'}</span>
        </div>
        <span className="text-xs text-primary-600 font-medium">View details →</span>
      </div>
    </div>
  );
};

export default ClientCard;
