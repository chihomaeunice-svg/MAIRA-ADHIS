import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { mockCalendarEvents } from '@/data/mockData';
import { clsx } from 'clsx';

const typeColors = {
  HEARING: 'bg-orange-100 text-orange-700 border-orange-200',
  MEETING: 'bg-blue-100 text-blue-700 border-blue-200',
  DEADLINE: 'bg-red-100 text-red-700 border-red-200',
  REMINDER: 'bg-gray-100 text-gray-700 border-gray-200',
};

const UpcomingHearings: React.FC = () => {
  const events = mockCalendarEvents
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{events.length} upcoming</span>
      </div>
      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className={clsx('p-3 rounded-lg border', typeColors[event.type])}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-tight flex-1">{event.title}</p>
                <span className="text-xs font-medium whitespace-nowrap">{event.type}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  {format(event.date, 'dd MMM yyyy')}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1 text-xs truncate">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{event.location.split(',')[0]}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingHearings;
