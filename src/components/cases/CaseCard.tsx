import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Scale, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { Case } from '@/types';
import Badge from '@/components/ui/Badge';
import { clsx } from 'clsx';

const statusConfig = {
  NEW: { variant: 'primary' as const, label: 'New' },
  ONGOING: { variant: 'warning' as const, label: 'Ongoing' },
  COMPLETED: { variant: 'success' as const, label: 'Completed' },
  ARCHIVED: { variant: 'gray' as const, label: 'Archived' },
  DRAFT: { variant: 'gray' as const, label: 'Draft' },
};

interface CaseCardProps {
  caseItem: Case;
}

const CaseCard: React.FC<CaseCardProps> = ({ caseItem }) => {
  const navigate = useNavigate();
  const nextHearing = caseItem.hearingDates
    .filter(h => new Date(h.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div
      onClick={() => navigate(`/dashboard/cases/${caseItem.id}`)}
      className="bg-white rounded-xl border border-gray-200 shadow-card p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-mono text-primary-600 font-semibold">{caseItem.caseNumber}</span>
          <h3 className="font-semibold text-gray-900 text-sm mt-0.5 line-clamp-2">{caseItem.title}</h3>
        </div>
        <Badge variant={statusConfig[caseItem.status].variant} size="sm">
          {statusConfig[caseItem.status].label}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mb-3">{caseItem.courtName}</p>
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{caseItem.clientName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Scale className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{caseItem.advocateName}</span>
        </div>
        {nextHearing && (
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
            <span className="text-xs text-orange-600 font-medium">
              Next: {format(new Date(nextHearing.date), 'dd MMM yyyy')}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">{caseItem.category}</span>
        <span className="text-xs text-primary-600 font-medium flex items-center gap-1">
          View <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
};

export default CaseCard;
