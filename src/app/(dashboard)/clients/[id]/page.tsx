"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  CreditCard,
  Edit,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { getStatusColor } from "@/lib/utils";

const mockClient = {
  id: "1",
  fullName: "John Kamau",
  phone: "+254 722 345 678",
  email: "john.kamau@email.com",
  address: "14 Westlands Road, Westlands, Nairobi",
  idNumber: "12345678",
  nationality: "Kenyan",
  type: "Individual",
  joinDate: "2023-06-15",
  status: "Active",
  notes: "Long-standing client with multiple property matters.",
  cases: [
    { id: "1", caseNumber: "MA/2024/1042", title: "Kamau v. Wangari Property Dispute", status: "ONGOING", type: "Property Law" },
    { id: "5", caseNumber: "MA/2024/1019", title: "Njoroge Land Title Dispute", status: "ONGOING", type: "Property Law" },
    { id: "9", caseNumber: "MA/2023/0988", title: "Westlands Plot Purchase Agreement", status: "COMPLETED", type: "Property Law" },
  ],
  payments: [
    { date: "2024-05-01", amount: 50000, description: "Legal fees - Q2 2024", status: "PAID" },
    { date: "2024-02-01", amount: 45000, description: "Legal fees - Q1 2024", status: "PAID" },
    { date: "2023-11-01", amount: 40000, description: "Legal fees - Q4 2023", status: "PAID" },
    { date: "2024-06-01", amount: 55000, description: "Legal fees - Q3 2024", status: "PENDING" },
  ],
  documents: [
    { name: "ID Copy.pdf", type: "Identity", uploaded: "2023-06-15", size: "520 KB" },
    { name: "Residence Proof.pdf", type: "Address", uploaded: "2023-06-15", size: "340 KB" },
    { name: "Land Title Copy.pdf", type: "Property", uploaded: "2024-01-15", size: "1.2 MB" },
  ],
};

export default function ClientDetailPage() {
  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clients", href: "/clients" },
        { label: mockClient.fullName },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-navy-900">
                  {mockClient.fullName}
                </h1>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                    {mockClient.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                    {mockClient.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    Client since {new Date(mockClient.joinDate).toLocaleDateString("en-KE", { month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400">Phone</div>
                    <div className="text-sm text-gray-800">{mockClient.phone}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400">Email</div>
                    <div className="text-sm text-gray-800">{mockClient.email}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400">Address</div>
                    <div className="text-sm text-gray-800">{mockClient.address}</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-400">ID Number</div>
                    <div className="text-sm text-gray-800">{mockClient.idNumber}</div>
                  </div>
                </div>
              </div>
              {mockClient.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400 mb-1">Notes</div>
                  <div className="text-sm text-gray-700">{mockClient.notes}</div>
                </div>
              )}
            </div>

            {/* Cases */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy-900">
                  Cases ({mockClient.cases.length})
                </h2>
                <Link
                  href="/cases"
                  className="text-sm text-gold-500 hover:text-gold-600 font-medium"
                >
                  View all cases
                </Link>
              </div>
              <div className="space-y-3">
                {mockClient.cases.map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-4 h-4 text-navy-600" />
                      <div>
                        <div className="text-xs text-gray-400 font-mono">{c.caseNumber}</div>
                        <div className="text-sm font-medium text-gray-800">{c.title}</div>
                        <div className="text-xs text-gray-500">{c.type}</div>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(c.status)}`}>
                      {c.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 pb-2">Date</th>
                      <th className="text-left text-xs font-semibold text-gray-500 pb-2">Description</th>
                      <th className="text-right text-xs font-semibold text-gray-500 pb-2">Amount</th>
                      <th className="text-center text-xs font-semibold text-gray-500 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockClient.payments.map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(payment.date).toLocaleDateString("en-KE")}
                        </td>
                        <td className="py-3 text-sm text-gray-700">{payment.description}</td>
                        <td className="py-3 text-sm font-medium text-gray-900 text-right">
                          KES {payment.amount.toLocaleString()}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            payment.status === "PAID"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={2} className="pt-3 text-sm font-semibold text-gray-700">Total Paid</td>
                      <td className="pt-3 text-sm font-bold text-navy-900 text-right">
                        KES {mockClient.payments
                          .filter(p => p.status === "PAID")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Active Cases</span>
                  <span className="text-sm font-semibold text-navy-900">
                    {mockClient.cases.filter(c => c.status !== "COMPLETED").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Cases</span>
                  <span className="text-sm font-semibold text-navy-900">{mockClient.cases.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Paid</span>
                  <span className="text-sm font-semibold text-green-600">
                    KES {mockClient.payments.filter(p => p.status === "PAID").reduce((s, p) => s + p.amount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Outstanding</span>
                  <span className="text-sm font-semibold text-orange-600">
                    KES {mockClient.payments.filter(p => p.status === "PENDING").reduce((s, p) => s + p.amount, 0).toLocaleString()}
                  </span>
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
                {mockClient.documents.map((doc, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-700 truncate">{doc.name}</div>
                      <div className="text-xs text-gray-400">{doc.type} • {doc.size}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-navy-900 mb-4">Actions</h2>
              <div className="space-y-2">
                <button className="w-full py-2 bg-navy-900 text-white text-sm font-medium rounded-lg hover:bg-navy-800">
                  Create New Case
                </button>
                <button className="w-full py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Send Invoice
                </button>
                <button className="w-full py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
