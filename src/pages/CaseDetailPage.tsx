import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Briefcase, Calendar, User, FileText, MessageSquare,
  Clock, MapPin, Scale, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { mockCases } from '@/data/mockData';
import { formatDate, getStatusColor } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const CaseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { setPageTitle } = useUIStore();
  const caseData = mockCases.find((c) => c.id === id);

  useEffect(() => {
    setPageTitle(caseData ? `Case: ${caseData.caseNumber}` : 'Case Not Found');
  }, [caseData, setPageTitle]);

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
        <h2 className="text-lg font-semibold text-gray-700">Case Not Found</h2>
        <p className="text-gray-500 text-sm mt-1">The case you are looking for does not exist.</p>
        <Link to="/cases" className="mt-4 text-primary-600 hover:underline text-sm font-medium">
          Back to Cases
        </Link>
      </div>
    );
  }

  const now = new Date();
  const upcomingHearings = caseData.hearingDates.filter((h) => new Date(h.date) >= now);
  const pastHearings = caseData.hearingDates.filter((h) => new Date(h.date) < now);

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Back link */}
      <Link
        to="/cases"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Cases
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <Scale className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{caseData.caseNumber}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-0.5">{caseData.title}</h1>
              <p className="text-sm text-gray-600 mt-1">{caseData.courtName}</p>
            </div>
          </div>
          <span className={clsx('text-sm px-3 py-1.5 rounded-full font-semibold', getStatusColor(caseData.status))}>
            {caseData.status}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 font-medium">Plaintiff</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{caseData.partiesNames.plaintiff}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Defendant</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{caseData.partiesNames.defendant}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Category</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{caseData.category}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Filed Date</p>
            <p className="text-sm text-gray-800 font-medium mt-0.5">{formatDate(caseData.filingDate)}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary-600" />
              Case Description
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">{caseData.description}</p>
            {caseData.judgment && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Judgment / Outcome
                </p>
                <p className="text-sm text-green-800">{caseData.judgment}</p>
              </div>
            )}
          </div>

          {/* Hearing Dates */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary-600" />
              Hearing Dates
            </h2>
            {caseData.hearingDates.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hearing dates recorded</p>
            ) : (
              <div className="space-y-3">
                {upcomingHearings.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Upcoming</p>
                    {upcomingHearings.map((h) => (
                      <div key={h.id} className="flex gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{formatDate(h.date)}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{h.purpose}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                            <MapPin className="h-3 w-3" />
                            {h.venue}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pastHearings.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Past</p>
                    {pastHearings.map((h) => (
                      <div key={h.id} className="flex gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{formatDate(h.date)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{h.purpose}</p>
                          {h.outcome && (
                            <p className="text-xs text-green-700 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {h.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary-600" />
              Case Notes
            </h2>
            {caseData.notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No notes recorded</p>
            ) : (
              <div className="space-y-3">
                {caseData.notes.map((note) => (
                  <div key={note.id} className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-sm text-gray-800">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{note.authorName}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-3 w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors">
              + Add Note
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Parties / Advocate */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Case Details</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <User className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Client</p>
                  <Link to={`/clients/${caseData.clientId}`} className="text-sm font-medium text-primary-700 hover:underline">
                    {caseData.clientName}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Scale className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Assigned Advocate</p>
                  <p className="text-sm font-medium text-gray-800">{caseData.advocateName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <Calendar className="h-4 w-4 text-primary-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Last Updated</p>
                  <p className="text-sm font-medium text-gray-800">{formatDate(caseData.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-600" />
              Documents ({caseData.documents.length})
            </h2>
            {caseData.documents.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-3">No documents attached</p>
            ) : (
              <div className="space-y-2">
                {caseData.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            )}
            <button className="mt-3 w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-colors">
              + Attach Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetailPage;
