import React from 'react';
import { format } from 'date-fns';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { HearingDate } from '@/types';

interface CaseTimelineProps {
  hearingDates: HearingDate[];
}

const CaseTimeline: React.FC<CaseTimelineProps> = ({ hearingDates }) => {
  const sorted = [...hearingDates].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No hearing dates scheduled</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {sorted.map((hearing, idx) => {
          const isPast = new Date(hearing.date) < new Date();
          return (
            <div key={hearing.id} className="relative flex gap-4 pl-10">
              <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center -translate-x-0.5 ${isPast ? 'bg-green-500' : 'bg-primary-600'}`}>
                {isPast ? <CheckCircle className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-900">{hearing.purpose}</span>
                  <span className="text-xs text-gray-500">{format(new Date(hearing.date), 'dd MMM yyyy')}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{hearing.venue}</p>
                {hearing.outcome && (
                  <p className="text-xs text-green-700 mt-1 bg-green-50 px-2 py-1 rounded">
                    Outcome: {hearing.outcome}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaseTimeline;
