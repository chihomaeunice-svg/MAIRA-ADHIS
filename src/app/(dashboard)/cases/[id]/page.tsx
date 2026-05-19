"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getStatusColor } from "@/lib/utils";
import {
  Briefcase,
  Calendar,
  FileText,
  User,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const mockCase = {
  id: "1",
  caseNumber: "MA/2024/1042",
  title: "Kamau v. Wangari Property Dispute",
  courtName: "High Court of Kenya - Nairobi",
  courtCaseNumber: "ELC/E/1042/2024",
  partiesNames: "John Kamau (Plaintiff) v. Mary Wangari (Defendant)",
  advocate: "Sarah Adhis",
  clientName: "John Kamau",
  clientPhone: "+254 722 345 678",
  filingDate: "2024-01-15",
  caseType: "Property Law",
  status: "ONGOING",
  opposingAdvocate: "Omondi & Associates",
  description:
    "Dispute over 2-acre parcel of land in Kiambu County. The plaintiff claims ownership based on a 1998 sale agreement while the defendant disputes the validity of the agreement.",
  notes: [
    {
      date: "2024-05-15",
      author: "Sarah Adhis",
      text: "Filed response to defendant's application. Court to hear on June 20th.",
    },
    {
      date: "2024-04-20",
      author: "Sarah Adhis",
      text: "Attended preliminary hearing. Court ordered parties to file documents by May 15th.",
    },
    {
      date: "2024-03-10",
      author: "Mary Secretary",
      text: "Received court mention notice for April 20th hearing.",
    },
    {
      date: "2024-01-15",
      author: "James Maira",
      text: "Case filed at the Environment and Land Court. Allocated to Judge Wanjiku.",
    },
  ],
  hearings: [
    { date: "2024-06-20", type: "Full Hearing", status: "UPCOMING", court: "ELC Division 2" },
    { date: "2024-04-20", type: "Mention", status: "COMPLETED", court: "ELC Division 2" },
    { date: "2024-02-15", type: "First Hearing", status: "COMPLETED", court: "ELC Division 2" },
  ],
  documents: [
    { name: "Sale Agreement 1998.pdf", type: "Evidence", uploaded: "2024-01-15", size: "2.3 MB" },
    { name: "Land Title Deed.pdf", type: "Evidence", uploaded: "2024-01-15", size: "1.1 MB" },
    { name: "Plaintiff Plaint.pdf", type: "Court Filing", uploaded: "2024-01-15", size: "450 KB" },
    { name: "Defense Response.pdf", type: "Court Filing", uploaded: "2024-03-01", size: "380 KB" },
  ],
};

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Cases", href: "/cases" },
        { label: mockCase.caseNumber },
      ]}
    >
      <div className="space-y-6">
        {/* Case Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-sm font-mono text-gray-500">
                    {mockCase.caseNumber}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(mockCase.status)}`}
                  >
                    {mockCase.status}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {mockCase.caseType}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-navy-900">
                  {mockCase.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {mockCase.partiesNames}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
                Edit Case
              </button>
              <button className="px-4 py-2 bg-navy-900 text-white text-sm font-medium rounded-lg hover:bg-navy-800">
                Update Status
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Case Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Case Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase">
                    Court
                  </label>
                  <div className="flex items-center space-x-1 mt-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {mockCase.courtName}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase">
                    Court Case No.
                  </label>
                  <div className="text-sm text-gray-700 mt-1">
                    {mockCase.courtCaseNumber}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase">
                    Filing Date
                  </label>
                  <div className="flex items-center space-x-1 mt-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {new Date(mockCase.filingDate).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase">
                    Opposing Advocate
                  </label>
                  <div className="text-sm text-gray-700 mt-1">
                    {mockCase.opposingAdvocate}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium text-gray-400 uppercase">
                  Case Description
                </label>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                  {mockCase.description}
                </p>
              </div>
            </div>

            {/* Hearing Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">
                  Hearing Timeline
                </h2>
                <button className="text-sm text-gold-500 hover:text-gold-600 font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule Hearing
                </button>
              </div>
              <div className="space-y-4">
                {mockCase.hearings.map((hearing, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          hearing.status === "COMPLETED"
                            ? "bg-green-100"
                            : "bg-orange-100"
                        }`}
                      >
                        {hearing.status === "COMPLETED" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                      {index < mockCase.hearings.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {hearing.type}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            hearing.status === "COMPLETED"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {hearing.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(hearing.date).toLocaleDateString("en-KE", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        — {hearing.court}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Notes */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">Case Notes</h2>
                <button className="text-sm text-gold-500 hover:text-gold-600 font-medium flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Add Note
                </button>
              </div>
              <div className="space-y-4">
                {mockCase.notes.map((note, index) => (
                  <div
                    key={index}
                    className="border-l-2 border-navy-200 pl-4 py-1"
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-navy-900">
                        {note.author}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(note.date).toLocaleDateString("en-KE")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Client</h2>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {mockCase.clientName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {mockCase.clientPhone}
                  </div>
                </div>
              </div>
              <Link
                href="/clients/1"
                className="text-sm text-gold-500 hover:text-gold-600 flex items-center"
              >
                View full profile <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Assigned Advocate */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">
                Assigned Advocate
              </h2>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-navy-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {mockCase.advocate}
                  </div>
                  <div className="text-xs text-gold-500">Senior Advocate</div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">Documents</h2>
                <button className="text-xs text-gold-500 hover:text-gold-600 flex items-center">
                  <Upload className="w-3 h-3 mr-1" />
                  Upload
                </button>
              </div>
              <div className="space-y-2">
                {mockCase.documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {doc.type} • {doc.size}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Hearing Alert */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-orange-800">
                    Next Hearing
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    June 20, 2024 — Full Hearing
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    ELC Division 2
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
