"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  FileText, Upload, Search, Download, Trash2, Eye,
  AlertCircle, Calendar, Filter
} from "lucide-react";

const mockDocuments = [
  { id: "1", name: "Kamau Property Sale Agreement.pdf", category: "LEGAL", type: "Contract", case: "MA/2024/1042", uploaded: "2024-01-15", expiryDate: null, size: "2.3 MB", uploadedBy: "Sarah Adhis" },
  { id: "2", name: "Land Title Deed - Plot 145.pdf", category: "LEGAL", type: "Evidence", case: "MA/2024/1042", uploaded: "2024-01-15", expiryDate: null, size: "1.1 MB", uploadedBy: "Sarah Adhis" },
  { id: "3", name: "TechCorp Merger Agreement.pdf", category: "CONTRACT", type: "Contract", case: "MA/2024/1031", uploaded: "2024-01-05", expiryDate: "2025-01-05", size: "4.5 MB", uploadedBy: "James Maira" },
  { id: "4", name: "Court Summons - Hassan.pdf", category: "COURT_FILING", type: "Court Filing", case: "MA/2024/1025", uploaded: "2023-12-20", expiryDate: null, size: "380 KB", uploadedBy: "Mary Secretary" },
  { id: "5", name: "ABC Ltd Employment Contract.pdf", category: "CONTRACT", type: "Contract", case: "MA/2024/1012", uploaded: "2023-12-01", expiryDate: "2024-12-01", size: "1.8 MB", uploadedBy: "Grace Wanjiku" },
  { id: "6", name: "Monthly Expense Report May 2024.xlsx", category: "FINANCIAL", type: "Report", case: null, uploaded: "2024-05-31", expiryDate: null, size: "256 KB", uploadedBy: "John Accountant" },
  { id: "7", name: "Law Society Practicing Certificate 2024.pdf", category: "LEGAL", type: "Certificate", case: null, uploaded: "2024-01-01", expiryDate: "2024-12-31", size: "450 KB", uploadedBy: "Admin User" },
  { id: "8", name: "Njoroge Land Survey Report.pdf", category: "LEGAL", type: "Evidence", case: "MA/2024/1019", uploaded: "2023-12-15", expiryDate: null, size: "3.2 MB", uploadedBy: "David Kamau" },
];

const categoryColors: Record<string, string> = {
  LEGAL: "bg-blue-50 text-blue-700",
  FINANCIAL: "bg-green-50 text-green-700",
  CORRESPONDENCE: "bg-purple-50 text-purple-700",
  COURT_FILING: "bg-red-50 text-red-700",
  CONTRACT: "bg-orange-50 text-orange-700",
  GENERAL: "bg-gray-50 text-gray-700",
};

const categoryLabel: Record<string, string> = {
  LEGAL: "Legal",
  FINANCIAL: "Financial",
  CORRESPONDENCE: "Correspondence",
  COURT_FILING: "Court Filing",
  CONTRACT: "Contract",
  GENERAL: "General",
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filtered = mockDocuments.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.case && d.case.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === "ALL" || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const isExpiringSoon = (expiry: string | null) => {
    if (!expiry) return false;
    const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days > 0;
  };

  const isExpired = (expiry: string | null) => {
    if (!expiry) return false;
    return new Date(expiry) < new Date();
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Documents" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Documents</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and organize all legal documents</p>
          </div>
          <button className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Expiry Alerts */}
        {mockDocuments.filter(d => isExpiringSoon(d.expiryDate)).length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-orange-800">Documents Expiring Soon</div>
                <div className="text-sm text-orange-700 mt-1">
                  {mockDocuments.filter(d => isExpiringSoon(d.expiryDate)).map(d => d.name).join(", ")} — expiring within 30 days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Documents", value: mockDocuments.length, color: "bg-blue-50 text-blue-700" },
            { label: "Court Filings", value: mockDocuments.filter(d => d.category === "COURT_FILING").length, color: "bg-red-50 text-red-700" },
            { label: "Contracts", value: mockDocuments.filter(d => d.category === "CONTRACT").length, color: "bg-orange-50 text-orange-700" },
            { label: "Expiring Soon", value: mockDocuments.filter(d => isExpiringSoon(d.expiryDate)).length, color: "bg-yellow-50 text-yellow-700" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm mt-1 opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["ALL", "LEGAL", "FINANCIAL", "CONTRACT", "COURT_FILING", "CORRESPONDENCE"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    categoryFilter === cat ? "bg-navy-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat === "ALL" ? "All" : categoryLabel[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Case</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden xl:table-cell">Uploaded By</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{doc.name}</div>
                          <div className="text-xs text-gray-400">{doc.size} • {new Date(doc.uploaded).toLocaleDateString("en-KE")}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${categoryColors[doc.category]}`}>
                        {categoryLabel[doc.category]}
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-sm text-gray-600 font-mono">{doc.case || "—"}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      {doc.expiryDate ? (
                        <div className="flex items-center space-x-1">
                          <Calendar className={`w-3.5 h-3.5 ${isExpired(doc.expiryDate) ? "text-red-500" : isExpiringSoon(doc.expiryDate) ? "text-orange-500" : "text-gray-400"}`} />
                          <span className={`text-xs ${isExpired(doc.expiryDate) ? "text-red-600 font-medium" : isExpiringSoon(doc.expiryDate) ? "text-orange-600 font-medium" : "text-gray-500"}`}>
                            {new Date(doc.expiryDate).toLocaleDateString("en-KE")}
                            {isExpired(doc.expiryDate) && " (Expired)"}
                            {isExpiringSoon(doc.expiryDate) && " (Soon)"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No expiry</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden xl:table-cell">
                      <span className="text-sm text-gray-600">{doc.uploadedBy}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Download">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
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
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No documents found</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
