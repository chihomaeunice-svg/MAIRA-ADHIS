import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, ChevronDown, Settings, LogOut, User, MessageSquare, Info, AlertTriangle, Check } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'message' | 'alert';
  read: boolean;
  createdAt: Date;
  link?: string;
}

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { pageTitle, toggleMobileSidebar } = useUIStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    setLoadingNotif(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20))
      );
      setNotifications(snap.docs.map(d => ({
        id: d.id,
        title: d.data().title || '',
        message: d.data().message || '',
        type: d.data().type || 'info',
        read: d.data().read ?? false,
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(),
        link: d.data().link,
      })));
    } catch { /* ignore */ } finally {
      setLoadingNotif(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (!unread.length) return;
    try {
      const batch = writeBatch(db);
      unread.forEach(n => batch.update(doc(db, 'notifications', n.id), { read: true }));
      await batch.commit();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch { /* ignore */ }
  };

  const handleBellClick = () => {
    setShowNotifications(v => {
      if (!v) fetchNotifications();
      return !v;
    });
    setShowDropdown(false);
  };

  const typeIcon = (type: string) => {
    if (type === 'message') return <MessageSquare className="h-4 w-4 text-blue-500" />;
    if (type === 'alert') return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <Info className="h-4 w-4 text-gray-400" />;
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

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

      {/* Notification Bell */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={handleBellClick}
          className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotif ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={clsx(
                        'flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer',
                        !n.read && 'bg-blue-50/40'
                      )}
                      onClick={async () => {
                        if (!n.read) {
                          await updateDoc(doc(db, 'notifications', n.id), { read: true });
                          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                        }
                        if (n.link) { navigate(n.link); setShowNotifications(false); }
                      }}
                    >
                      <div className="mt-0.5 flex-shrink-0">{typeIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <button
                    onClick={() => { fetchNotifications(); }}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => { setShowDropdown(!showDropdown); setShowNotifications(false); }}
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
