import { UserRole } from '@/types';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  label: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ['dashboard', 'cases', 'clients', 'documents', 'correspondence', 'procurement', 'employees', 'calendar', 'reports', 'settings', 'users'],
  MANAGING_PARTNER: ['dashboard', 'cases', 'clients', 'documents', 'correspondence', 'employees', 'calendar', 'reports', 'settings'],
  ADVOCATE: ['dashboard', 'cases', 'clients', 'documents', 'calendar', 'settings'],
  SECRETARY: ['dashboard', 'cases', 'clients', 'correspondence', 'documents', 'calendar', 'settings'],
  ACCOUNTANT: ['dashboard', 'procurement', 'reports', 'settings'],
  PROCUREMENT_OFFICER: ['dashboard', 'procurement', 'settings'],
  EMPLOYEE: ['dashboard'],
};

export function canAccess(role: UserRole | undefined, page: string): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(page) ?? false;
}

export function isAdmin(role: UserRole | undefined): boolean {
  return role === 'ADMIN';
}

export function isAdminOrPartner(role: UserRole | undefined): boolean {
  return role === 'ADMIN' || role === 'MANAGING_PARTNER';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrator',
  MANAGING_PARTNER: 'Managing Partner',
  ADVOCATE: 'Advocate',
  SECRETARY: 'Secretary',
  ACCOUNTANT: 'Accountant',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  EMPLOYEE: 'Employee',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  MANAGING_PARTNER: 'bg-purple-100 text-purple-800',
  ADVOCATE: 'bg-blue-100 text-blue-800',
  SECRETARY: 'bg-green-100 text-green-800',
  ACCOUNTANT: 'bg-yellow-100 text-yellow-800',
  PROCUREMENT_OFFICER: 'bg-orange-100 text-orange-800',
  EMPLOYEE: 'bg-gray-100 text-gray-800',
};
