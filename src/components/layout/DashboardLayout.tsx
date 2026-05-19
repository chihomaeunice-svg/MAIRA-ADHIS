import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileSidebar from './MobileSidebar';
import { useUIStore } from '@/stores/uiStore';
import { clsx } from 'clsx';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/cases': 'Cases',
  '/clients': 'Clients',
  '/documents': 'Documents',
  '/correspondence': 'Correspondence',
  '/procurement': 'Procurement & Expenses',
  '/employees': 'Employees',
  '/calendar': 'Calendar',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarOpen, setPageTitle } = useUIStore();
  const location = useLocation();

  useEffect(() => {
    // Handle dynamic routes like /cases/:id
    const basePath = '/' + location.pathname.split('/')[1];
    const title = pageTitles[basePath] || pageTitles[location.pathname] || 'MAIRA & ADHIS ADVOCATES';
    setPageTitle(title);
    document.title = `${title} | MAIRA & ADHIS ADVOCATES`;
  }, [location.pathname, setPageTitle]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <MobileSidebar />
      <div
        className={clsx(
          'flex-1 flex flex-col min-w-0 transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
        )}
      >
        <Header />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
