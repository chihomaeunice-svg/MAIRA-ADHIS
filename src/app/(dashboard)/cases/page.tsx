"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";

const mockCases = [
  {
    id: "1",
    caseNumber: "MA/2024/1042",
    title: "Kamau v. Wangari Property Dispute",
    courtName: "High Court of Kenya - Nairobi",
    clientName: "John Kamau",
    advocate: "Sarah Adhis",
    filingDate: "2024-01-15",
    nextHearing: "2024-06-20",
    status: "ONGOING",
    caseType: "Property Law",
  },
  {
    id: "2",
    caseNumber: "MA/2024/1038",
    title: "Republic v. Odhiambo Criminal Matter",
    courtName: "Milimani Law Courts",
    clientName: "State Prosecution",
    advocate: "James Maira",
    filingDate: "2024-01-10",
    nextHearing: "2024-06-25",
    status: "NEW",
    caseType: "Criminal Law",
  },
  {
    id: "3",
    caseNumber: "MA/2024/1031",
    title: "TechCorp Ltd Corporate Merger",
    courtName: "Commercial Court",
    clientName: "TechCorp Limited",
    advocate: "James Maira",
    filingDate: "2024-01-05",
    nextHearing: "2024-07-01",
    status: "ONGOING",
    caseType: "Corporate Law",
  },
  {
    id: "4",
    caseNumber: "MA/2024/1025",
    title: "Hassan Divorce Proceedings",
    courtName: "Family Division - High Court",
    clientName: "Fatuma Hassan",
    advocate: "Sarah Adhis",
    filingDate: "2023-12-20",
    nextHearing: null,
    status: "COMPLETED",
    caseType: "Family Law",
  },
  {
    id: "5",
    caseNumber: "MA/2024/1019",
    title: "Njoroge Land Title Dispute",
    courtName: "Environment & Land Court",
    clientName: "Robert Njoroge",
    advocate: "David Kamau",
    filingDate: "2023-12-15",
    nextHearing: "2024-06-28",
    status: "ONGOING",
    caseType: "Property Law",
  },
  {
    id: "6",
    caseNumber: "MA/2024/1012",
    title: "ABC Ltd Employment Dispute",
    courtName: "Employment and Labour Relations Court",
    clientName: "ABC Limited",
    advocate: "Grace Wanjiku",
    filingDate: "2023-12-01",
    nextHearing: "2024-07-05",
    status: "ONGOING",
    caseType: "Employment Law",
  },
];

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    title: "",
    courtName: "",
    partiesNames: "",
    caseType: "",
    filingDate: "",
    notes: "",
  });

  const filtered = mockCases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.advocate.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Cases" }]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Cases</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all legal cases and matters
            </p>
          </div>
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cases by number, title, client or advocate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "NEW", "ONGOING", "COMPLETED", "ARCHIVED"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === status
                        ? "bg-navy-900 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Case Details
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Court
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Advocate
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Next Hearing
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-navy-900" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 font-mono">
                            {c.caseNumber}
                          </div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {c.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.clientName} • {c.caseType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {c.courtName}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-600">{c.advocate}</div>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-600">
                        {c.nextHearing
                          ? new Date(c.nextHearing).toLocaleDateString(
                              "en-KE"
                            )
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/cases/${c.id}`}
                          className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No cases found matching your criteria</p>
            </div>
          )}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filtered.length} of {mockCases.length} cases</span>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-navy-900 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 border rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Case Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy-900">
                Create New Case
              </h2>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCase.title}
                    onChange={(e) =>
                      setNewCase({ ...newCase, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. Smith v. Jones Property Dispute"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Court Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCase.courtName}
                    onChange={(e) =>
                      setNewCase({ ...newCase, courtName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. High Court of Kenya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Case Type *
                  </label>
                  <select
                    required
                    value={newCase.caseType}
                    onChange={(e) =>
                      setNewCase({ ...newCase, caseType: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  >
                    <option value="">Select type...</option>
                    <option>Criminal Law</option>
                    <option>Civil Law</option>
                    <option>Corporate Law</option>
                    <option>Family Law</option>
                    <option>Property Law</option>
                    <option>Employment Law</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parties Names *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCase.partiesNames}
                    onChange={(e) =>
                      setNewCase({ ...newCase, partiesNames: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="e.g. John Smith v. Jane Jones"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filing Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newCase.filingDate}
                    onChange={(e) =>
                      setNewCase({ ...newCase, filingDate: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Advocate
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900">
                    <option>James Maira</option>
                    <option>Sarah Adhis</option>
                    <option>David Kamau</option>
                    <option>Grace Wanjiku</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    value={newCase.notes}
                    onChange={(e) =>
                      setNewCase({ ...newCase, notes: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="Additional notes about this case..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewCaseModal(false);
                    alert("Case created successfully! (Demo mode)");
                  }}
                  className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
