import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { canAccess } from '@/lib/permissions';
import { UserRole } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AccessDenied from '@/components/layout/AccessDenied';

// Pages
import LandingPage from '@/pages/public/LandingPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import CasesPage from '@/pages/CasesPage';
import CaseDetailPage from '@/pages/CaseDetailPage';
import ClientsPage from '@/pages/ClientsPage';
import ClientDetailPage from '@/pages/ClientDetailPage';
import DocumentsPage from '@/pages/DocumentsPage';
import CorrespondencePage from '@/pages/CorrespondencePage';
import ProcurementPage from '@/pages/ProcurementPage';
import EmployeesPage from '@/pages/EmployeesPage';
import CalendarPage from '@/pages/CalendarPage';
import ReportsPage from '@/pages/ReportsPage';
import SettingsPage from '@/pages/SettingsPage';
import UserManagementPage from '@/pages/dashboard/UserManagementPage';
import NotFoundPage from '@/pages/NotFoundPage';

function AppInitializer({ children }: { children: React.ReactNode }) {
  useAuth(); // sets up onAuthStateChanged listener
  return <>{children}</>;
}

function ProtectedRoute({ children, page }: { children: React.ReactNode; page?: string }) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (page && !canAccess(user?.role as UserRole, page)) {
    return (
      <DashboardLayout>
        <AccessDenied />
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public website routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute page="dashboard"><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute page="cases"><DashboardLayout><CasesPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/cases/:id" element={<ProtectedRoute page="cases"><DashboardLayout><CaseDetailPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/clients" element={<ProtectedRoute page="clients"><DashboardLayout><ClientsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/clients/:id" element={<ProtectedRoute page="clients"><DashboardLayout><ClientDetailPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute page="documents"><DashboardLayout><DocumentsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/correspondence" element={<ProtectedRoute page="correspondence"><DashboardLayout><CorrespondencePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/procurement" element={<ProtectedRoute page="procurement"><DashboardLayout><ProcurementPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/employees" element={<ProtectedRoute page="employees"><DashboardLayout><EmployeesPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="/calendar" element={<ProtectedRoute page="calendar"><DashboardLayout><CalendarPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute page="reports"><DashboardLayout><ReportsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute page="settings"><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute page="users"><DashboardLayout><UserManagementPage /></DashboardLayout></ProtectedRoute>} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppInitializer>
        <AppRoutes />
      </AppInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px', fontSize: '14px' },
        }}
      />
    </BrowserRouter>
  );
}
