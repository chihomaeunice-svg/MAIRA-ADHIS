import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus,
  Scale, Users, AlertCircle, Clock, MapPin, X, FileText,
} from 'lucide-react';
import {
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { CalendarEventType } from '@/types';
import { formatDate } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<CalendarEventType, { label: string; color: string; dotColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  HEARING:  { label: 'Court Hearing', color: 'bg-red-50 text-red-700 border-red-200',       dotColor: 'bg-red-500',    icon: Scale       },
  MEETING:  { label: 'Meeting',       color: 'bg-blue-50 text-blue-700 border-blue-200',     dotColor: 'bg-blue-500',   icon: Users       },
  DEADLINE: { label: 'Deadline',      color: 'bg-orange-50 text-orange-700 border-orange-200', dotColor: 'bg-orange-500', icon: AlertCircle },
  REMINDER: { label: 'Reminder',      color: 'bg-purple-50 text-purple-700 border-purple-200', dotColor: 'bg-purple-500', icon: Clock       },
};

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface FirestoreEvent {
  id: string;
  title: string;
  date: string;
  type: CalendarEventType;
  location?: string;
  relatedCaseId?: string;
  notes?: string;
  createdAt: Date;
}

type FormData = {
  title: string;
  date: string;
  type: CalendarEventType;
  location: string;
  relatedCaseId: string;
  notes: string;
};

const todayStr = () => new Date().toISOString().split('T')[0];

const CalendarPage: React.FC = () => {
  const { setPageTitle } = useUIStore();
  const { user } = useAuthStore();

  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState<CalendarEventType | 'ALL'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormData>({
    title: '', date: todayStr(), type: 'HEARING', location: '', relatedCaseId: '', notes: '',
  });

  useEffect(() => { setPageTitle('Calendar'); }, [setPageTitle]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'calendarEvents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      if (snap.docs.length > 0) {
        setEvents(snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            date: data.date,
            type: data.type,
            location: data.location || undefined,
            relatedCaseId: data.relatedCaseId || undefined,
            notes: data.notes || undefined,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          };
        }));
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay      = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday     = () => { setCurrentDate(new Date()); setSelectedDate(new Date()); };

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });

  const selectedEvents = selectedDate
    ? events.filter((e) => {
        const d = new Date(e.date);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth()    === selectedDate.getMonth()    &&
          d.getDate()     === selectedDate.getDate()
        );
      })
    : [];

  const todayDateStr = new Date().toISOString().split('T')[0];

  const upcomingEvents = [...events]
    .filter((e) => {
      const isUpcoming = e.date >= todayDateStr;
      const matchType  = typeFilter === 'ALL' || e.type === typeFilter;
      return isUpcoming && matchType;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const isToday    = (day: number) => { const now = new Date(); return now.getFullYear() === year && now.getMonth() === month && now.getDate() === day; };
  const isSelected = (day: number) => selectedDate ? selectedDate.getFullYear() === year && selectedDate.getMonth() === month && selectedDate.getDate() === day : false;

  // Build calendar grid (6 rows × 7 cols)
  const calendarCells: { day: number; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)      calendarCells.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  for (let d = 1; d <= daysInMonth; d++)        calendarCells.push({ day: d,                  isCurrentMonth: true  });
  for (let d = 1; d <= 42 - calendarCells.length; d++) calendarCells.push({ day: d,            isCurrentMonth: false });

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Event title is required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, 'calendarEvents'), {
        title: form.title.trim(),
        date: form.date,
        type: form.type,
        location: form.location.trim() || null,
        relatedCaseId: form.relatedCaseId.trim() || null,
        notes: form.notes.trim() || null,
        addedBy: user?.id || 'unknown',
        addedByName: user?.name || 'Unknown',
        createdAt: Timestamp.now(),
      });
      toast.success('Event added to calendar');
      setShowModal(false);
      setForm({ title: '', date: todayStr(), type: 'HEARING', location: '', relatedCaseId: '', notes: '' });
      fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Court hearings, meetings, and deadlines</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Event
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading calendar...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-card">
            {/* Month Nav */}
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

            {/* Grid */}
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
                      isToday(cell.day) && cell.isCurrentMonth    ? 'bg-primary-600 text-white' :
                      isSelected(cell.day) && cell.isCurrentMonth ? 'bg-primary-200 text-primary-800' :
                      cell.isCurrentMonth                         ? 'text-gray-700' : 'text-gray-300'
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

            {/* Selected Day */}
            {selectedDate && (
              <div className="px-5 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedDate.toLocaleDateString('en-TZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <button
                    onClick={() => {
                      setForm((p) => ({ ...p, date: selectedDate.toISOString().split('T')[0] }));
                      setShowModal(true);
                    }}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add event
                  </button>
                </div>
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{event.title}</p>
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs mt-0.5 opacity-75">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            {event.relatedCaseId && (
                              <div className="flex items-center gap-1 text-xs mt-0.5 opacity-75">
                                <FileText className="h-3 w-3" />
                                Case: {event.relatedCaseId}
                              </div>
                            )}
                            {event.notes && (
                              <p className="text-xs mt-1 opacity-75 line-clamp-2">{event.notes}</p>
                            )}
                          </div>
                          <span className="ml-auto text-xs font-semibold opacity-75 flex-shrink-0">{cfg.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                  All Events ({events.filter((e) => e.date >= todayDateStr).length})
                </button>
                {(Object.entries(TYPE_CONFIG) as [CalendarEventType, typeof TYPE_CONFIG[CalendarEventType]][]).map(([type, cfg]) => {
                  const EventIcon = cfg.icon;
                  const count = events.filter((e) => e.type === type && e.date >= todayDateStr).length;
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
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-2 text-xs text-primary-600 hover:underline"
                    >
                      Schedule an event
                    </button>
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
      )}

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Add Calendar Event</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Kimaro v. Mkando — Hearing"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as CalendarEventType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {(Object.entries(TYPE_CONFIG) as [CalendarEventType, typeof TYPE_CONFIG[CalendarEventType]][]).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. High Court of Tanzania, Dar es Salaam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Related Case (optional)</label>
                <input
                  type="text"
                  value={form.relatedCaseId}
                  onChange={(e) => setForm((p) => ({ ...p, relatedCaseId: e.target.value }))}
                  placeholder="e.g. HC/CIV/001/2024"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Any additional notes or instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    <><Calendar className="h-4 w-4" /> Add Event</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
