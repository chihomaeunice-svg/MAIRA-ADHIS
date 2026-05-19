"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Plus, Eye, Edit, Trash2, Users, Phone, Mail, Building } from "lucide-react";
import Link from "next/link";

const mockClients = [
  {
    id: "1",
    fullName: "John Kamau",
    phone: "+254 722 345 678",
    email: "john.kamau@email.com",
    address: "Westlands, Nairobi",
    type: "Individual",
    activeCases: 2,
    totalCases: 3,
    joinDate: "2023-06-15",
    status: "Active",
  },
  {
    id: "2",
    fullName: "TechCorp Limited",
    phone: "+254 20 123 4567",
    email: "legal@techcorp.co.ke",
    address: "Upper Hill, Nairobi",
    type: "Corporate",
    activeCases: 1,
    totalCases: 2,
    joinDate: "2023-08-20",
    status: "Active",
  },
  {
    id: "3",
    fullName: "Fatuma Hassan",
    phone: "+254 711 234 567",
    email: "fatuma.hassan@gmail.com",
    address: "South C, Nairobi",
    type: "Individual",
    activeCases: 0,
    totalCases: 1,
    joinDate: "2023-09-10",
    status: "Active",
  },
  {
    id: "4",
    fullName: "Robert Njoroge",
    phone: "+254 733 456 789",
    email: "r.njoroge@yahoo.com",
    address: "Kiambu County",
    type: "Individual",
    activeCases: 1,
    totalCases: 2,
    joinDate: "2023-10-05",
    status: "Active",
  },
  {
    id: "5",
    fullName: "ABC Limited",
    phone: "+254 20 567 8901",
    email: "info@abcltd.co.ke",
    address: "Industrial Area, Nairobi",
    type: "Corporate",
    activeCases: 1,
    totalCases: 1,
    joinDate: "2023-11-15",
    status: "Active",
  },
  {
    id: "6",
    fullName: "Grace Mwangi",
    phone: "+254 722 987 654",
    email: "grace.mwangi@email.com",
    address: "Karen, Nairobi",
    type: "Individual",
    activeCases: 0,
    totalCases: 2,
    joinDate: "2022-03-20",
    status: "Inactive",
  },
  {
    id: "7",
    fullName: "Sunshine Real Estate Ltd",
    phone: "+254 20 234 5678",
    email: "legal@sunshine.co.ke",
    address: "Kilimani, Nairobi",
    type: "Corporate",
    activeCases: 2,
    totalCases: 4,
    joinDate: "2022-07-10",
    status: "Active",
  },
  {
    id: "8",
    fullName: "David Omondi",
    phone: "+254 745 678 901",
    email: "d.omondi@gmail.com",
    address: "Kisumu City",
    type: "Individual",
    activeCases: 1,
    totalCases: 1,
    joinDate: "2024-01-10",
    status: "Active",
  },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    type: "Individual",
    idNumber: "",
    companyDetails: "",
  });

  const filtered = mockClients.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesType = typeFilter === "ALL" || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Clients" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage client profiles and relationships
            </p>
          </div>
          <button
            onClick={() => setShowNewClientModal(true)}
            className="flex items-center space-x-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Client</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Clients", value: mockClients.length, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Active Clients", value: mockClients.filter(c => c.status === "Active").length, color: "text-green-600", bg: "bg-green-50" },
            { label: "Corporate", value: mockClients.filter(c => c.type === "Corporate").length, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Individual", value: mockClients.filter(c => c.type === "Individual").length, color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
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
                placeholder="Search clients by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <div className="flex gap-2">
              {["ALL", "Individual", "Corporate"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === type
                      ? "bg-navy-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      client.type === "Corporate"
                        ? "bg-purple-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {client.type === "Corporate" ? (
                      <Building className="w-5 h-5 text-purple-600" />
                    ) : (
                      <Users className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">
                      {client.fullName}
                    </div>
                    <div
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        client.type === "Corporate"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {client.type}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    client.status === "Active"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {client.status}
                </span>
              </div>

              <div className="space-y-1.5 mb-4">
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{client.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{client.activeCases} active cases</span>
                <span>{client.totalCases} total cases</span>
              </div>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/clients/${client.id}`}
                  className="flex-1 py-1.5 bg-navy-900 text-white text-xs font-medium rounded-lg hover:bg-navy-800 text-center"
                >
                  View Profile
                </Link>
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No clients found</p>
          </div>
        )}
      </div>

      {/* New Client Modal */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-navy-900">Add New Client</h2>
              <button
                onClick={() => setShowNewClientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Type
                </label>
                <div className="flex gap-3">
                  {["Individual", "Corporate"].map((type) => (
                    <label key={type} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={newClient.type === type}
                        onChange={(e) => setNewClient({ ...newClient, type: e.target.value })}
                        className="text-navy-900"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClient.fullName}
                  onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newClient.type === "Corporate" ? "Company Registration No." : "ID / Passport No."}
                </label>
                <input
                  type="text"
                  value={newClient.idNumber}
                  onChange={(e) => setNewClient({ ...newClient, idNumber: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowNewClientModal(false);
                    alert("Client added successfully! (Demo mode)");
                  }}
                  className="px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
