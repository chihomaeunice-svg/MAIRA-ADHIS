import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ROLE_LABELS } from '@/lib/permissions';
import { UserRole } from '@/types';

const AccessDenied: React.FC = () => {
  const { user } = useAuthStore();
  const roleLabel = user?.role ? ROLE_LABELS[user.role as UserRole] : 'Unknown';

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <ShieldOff className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-1">
        You don&apos;t have permission to view this page.
      </p>
      {user?.role && (
        <p className="text-gray-400 text-xs mb-6">
          Your current role is{' '}
          <span className="font-semibold text-gray-600">{roleLabel}</span>.
          Contact your administrator if you need access.
        </p>
      )}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        <LayoutDashboard className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </div>
  );
};

export default AccessDenied;
