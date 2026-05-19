import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard, Briefcase, Users, FileText, Mail, ShoppingCart,
  UserCog, Calendar, BarChart3, Settings, LogOut, Scale, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'MAIN',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CASE MANAGEMENT',
    items: [
      { label: 'Cases', path: '/cases', icon: Briefcase },
      { label: 'Clients', path: '/clients', icon: Users },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { label: 'Documents', path: '/documents', icon: FileText },
      { label: 'Correspondence', path: '/correspondence', icon: Mail },
      { label: 'Procurement', path: '/procurement', icon: ShoppingCart },
      { label: 'Employees', path: '/employees', icon: UserCog },
    ],
  },
  {
    title: 'TOOLS',
    items: [
      { label: 'Calendar', path: '/calendar', icon: Calendar },
      { label: 'Reports', path: '/reports', icon: BarChart3 },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 bottom-0 z-30 hidden lg:flex flex-col bg-primary-600 transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-primary-700">
        <div className={clsx('flex items-center gap-3 overflow-hidden', !sidebarOpen && 'justify-center w-full')}>
          <div className="w-8 h-8 flex-shrink-0 bg-accent-500 rounded-lg flex items-center justify-center">
            <Scale className="h-5 w-5 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">MAIRA &amp; ADHIS</p>
              <p className="text-primary-200 text-xs whitespace-nowrap">ADVOCATES</p>
            </div>
          )}
        </div>
        {sidebarOpen ? (
          <button
            onClick={toggleSidebar}
            className="flex-shrink-0 p-1 rounded-lg text-primary-300 hover:text-white hover:bg-primary-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center shadow-md"
          >
            <ChevronRight className="h-3 w-3 text-white" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-5">
        {navSections.map((section) => (
          <div key={section.title}>
            {sidebarOpen && (
              <p className="px-4 mb-2 text-[10px] font-semibold text-primary-300 tracking-widest uppercase">
                {section.title}
              </p>
            )}
            {!sidebarOpen && <div className="mx-3 border-t border-primary-700 mb-2" />}
            <ul className="space-y-0.5 px-2">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/dashboard'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative',
                        !sidebarOpen && 'justify-center',
                        isActive
                          ? 'bg-accent-500 text-white shadow-md'
                          : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                      )
                    }
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={clsx(
                            'h-5 w-5 flex-shrink-0',
                            isActive ? 'text-white' : 'text-primary-200 group-hover:text-white'
                          )}
                        />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                        {!sidebarOpen && (
                          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                            {item.label}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="border-t border-primary-700 p-3">
        <div className={clsx('flex items-center gap-3', !sidebarOpen && 'justify-center flex-col')}>
          <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-primary-300 text-xs truncate">{user?.role?.replace('_', ' ') || 'ADVOCATE'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-1.5 rounded-lg text-primary-300 hover:text-red-400 hover:bg-primary-700 transition-colors"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
