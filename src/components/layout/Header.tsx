import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { pageTitle, toggleMobileSidebar } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-100 text-red-700',
    MANAGING_PARTNER: 'bg-purple-100 text-purple-700',
    ADVOCATE: 'bg-blue-100 text-blue-700',
    SECRETARY: 'bg-green-100 text-green-700',
    ACCOUNTANT: 'bg-yellow-100 text-yellow-700',
    PROCUREMENT_OFFICER: 'bg-orange-100 text-orange-700',
  };

  const roleLabels: Record<string, string> = {
    ADMIN: 'Admin',
    MANAGING_PARTNER: 'Managing Partner',
    ADVOCATE: 'Advocate',
    SECRETARY: 'Secretary',
    ACCOUNTANT: 'Accountant',
    PROCUREMENT_OFFICER: 'Procurement',
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20">
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-gray-900">{pageTitle}</h1>
      </div>
      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-60">
        <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search cases, clients..."
          className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder-gray-400"
        />
      </div>
      <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
          3
        </span>
      </button>
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name || 'User'}</p>
            {user?.role && (
              <span className={clsx('text-xs px-1.5 py-0.5 rounded-full font-medium', roleColors[user.role] || 'bg-gray-100 text-gray-600')}>
                {roleLabels[user.role] || user.role}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
        </button>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
