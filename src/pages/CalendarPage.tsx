import React, { useState, useEffect } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  Scale, Users, AlertCircle, Clock, MapPin,
} from 'lucide-react';
import { mockCalendarEvents } from '@/data/mockData';
import { CalendarEvent, CalendarEventType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const TYPE_CONFIG: Record<CalendarEventType, { label: string; color: string; dotColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  HEARING: { label: 'Court Hearing', color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', icon: Scale },
  MEETING: { label: 'Meeting', color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500', icon: Users },
  DEADLINE: { label: 'Deadline', color: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500', icon: AlertCircle },
  REMINDER: { label: 'Reminder', color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500', icon: Clock },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CalendarPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState<CalendarEventType | 'ALL'>('ALL');

  useEffect(() => { setPageTitle('Calendar'); }, [setPageTitle]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const getEventsForDay = (day: number) => {
    return events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const selectedEvents = selectedDate
    ? events.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : [];

  const upcomingEvents = [...events]
    .filter((e) => {
      const isUpcoming = new Date(e.date) >= new Date();
      const matchType = typeFilter === 'ALL' || e.type === typeFilter;
      return isUpcoming && matchType;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const isToday = (day: number) => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day;
  };

  const isSelected = (day: number) => {
    return selectedDate
      ? selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day
      : false;
  };

  // Build calendar grid (6 rows x 7 cols)
  const calendarCells: { day: number; isCurrentMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, isCurrentMonth: true });
  }
  const remaining = 42 - calendarCells.length;
  for (let d = 1; d <= remaining; d++) {
    calendarCells.push({ day: d, isCurrentMonth: false });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Court hearings, meetings, and deadlines</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-center">
              <h2 className="text-base font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={goToToday} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Today
              </button>
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map((day) => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, i) => {
              const dayEvents = cell.isCurrentMonth ? getEventsForDay(cell.day) : [];
              return (
                <div
                  key={i}
                  onClick={() => cell.isCurrentMonth && setSelectedDate(new Date(year, month, cell.day))}
                  className={clsx(
                    'min-h-[72px] p-1.5 border-r border-b border-gray-50 cursor-pointer transition-colors',
                    !cell.isCurrentMonth && 'bg-gray-50/50',
                    cell.isCurrentMonth && 'hover:bg-blue-50',
                    isSelected(cell.day) && cell.isCurrentMonth && 'bg-primary-50'
                  )}
                >
                  <span className={clsx(
                    'w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full',
                    isToday(cell.day) && cell.isCurrentMonth ? 'bg-primary-600 text-white' :
                    isSelected(cell.day) && cell.isCurrentMonth ? 'bg-primary-200 text-primary-800' :
                    cell.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                  )}>
                    {cell.day}
                  </span>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={clsx('text-[10px] px-1.5 py-0.5 rounded truncate font-medium', TYPE_CONFIG[event.type].color)}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Day Events */}
          {selectedDate && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {selectedDate.toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => {
                    const cfg = TYPE_CONFIG[event.type];
                    const EventIcon = cfg.icon;
                    return (
                      <div key={event.id} className={clsx('flex items-start gap-3 p-3 rounded-lg border', cfg.color)}>
                        <EventIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs mt-0.5 opacity-75">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        <span className="ml-auto text-xs font-semibold opacity-75">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          {/* Type Filter */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Filter by Type</p>
            <div className="space-y-1.5">
              <button
                onClick={() => setTypeFilter('ALL')}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  typeFilter === 'ALL' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                All Events ({events.filter((e) => new Date(e.date) >= new Date()).length})
              </button>
              {(Object.entries(TYPE_CONFIG) as [CalendarEventType, typeof TYPE_CONFIG[CalendarEventType]][]).map(([type, cfg]) => {
                const EventIcon = cfg.icon;
                const count = events.filter((e) => e.type === type && new Date(e.date) >= new Date()).length;
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={clsx(
                      'w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      typeFilter === type ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <EventIcon className="h-4 w-4" />
                    {cfg.label}
                    <span className="ml-auto text-xs text-gray-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const cfg = TYPE_CONFIG[event.type];
                  const EventIcon = cfg.icon;
                  return (
                    <div key={event.id} className="flex items-start gap-3 p-4">
                      <div className={clsx('p-1.5 rounded-lg flex-shrink-0', cfg.color)}>
                        <EventIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}</p>
                        {event.location && (
                          <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
