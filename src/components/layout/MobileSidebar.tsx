import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  X, Scale, LayoutDashboard, Briefcase, Users, FileText, Mail,
  ShoppingCart, UserCog, Calendar, BarChart3, Settings, LogOut, UserCog2,
  Building2, Activity,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { canAccess } from '@/lib/permissions';
import { UserRole } from '@/types';
import { clsx } from 'clsx';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { label: 'Cases', path: '/cases', icon: Briefcase, permission: 'cases' },
  { label: 'Clients', path: '/clients', icon: Users, permission: 'clients' },
  { label: 'Corporate Works', path: '/corporate-works', icon: Building2, permission: 'corporate-works' },
  { label: 'Documents', path: '/documents', icon: FileText, permission: 'documents' },
  { label: 'Correspondence', path: '/correspondence', icon: Mail, permission: 'correspondence' },
  { label: 'Procurement', path: '/procurement', icon: ShoppingCart, permission: 'procurement' },
  { label: 'Employees', path: '/employees', icon: UserCog, permission: 'employees' },
  { label: 'Calendar', path: '/calendar', icon: Calendar, permission: 'calendar' },
  { label: 'Reports', path: '/reports', icon: BarChart3, permission: 'reports' },
  { label: 'Settings', path: '/settings', icon: Settings, permission: 'settings' },
  { label: 'User Management', path: '/users', icon: UserCog2, permission: 'users' },
  { label: 'User Activity', path: '/user-activity', icon: Activity, permission: 'user-activity' },
];

const MobileSidebar: React.FC = () => {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const userRole = user?.role as UserRole | undefined;
  const visibleItems = allNavItems.filter((item) => canAccess(userRole, item.permission));

  if (!mobileSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
      <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary-600 flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <img src="/logo-icon.png" alt="M&A" className="w-8 h-8 object-contain rounded-lg bg-white/10" />
            <div>
              <p className="text-white font-bold text-sm">MAIRA &amp; ADHIS</p>
              <p className="text-primary-200 text-xs">COMPANY ADVOCATES</p>
            </div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-accent-500 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-primary-700 p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-primary-300 text-xs">{user?.role?.replace(/_/g, ' ') || 'EMPLOYEE'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary-300 hover:text-red-400 hover:bg-primary-700"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </div>
  );
};

export default MobileSidebar;
