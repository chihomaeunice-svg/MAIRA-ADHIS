import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'NEW':
      return 'bg-blue-50 text-blue-700';
    case 'ONGOING':
      return 'bg-amber-50 text-amber-700';
    case 'COMPLETED':
      return 'bg-green-50 text-green-700';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-600';
    case 'APPROVED':
      return 'bg-green-50 text-green-700';
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-700';
    case 'REJECTED':
      return 'bg-red-50 text-red-700';
    case 'DELIVERED':
      return 'bg-teal-50 text-teal-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
}

export function formatCurrency(amount: number, currency = 'TZS'): string {
  return `${currency} ${amount.toLocaleString()}`;
}

export function formatDate(date: Date | string, locale = 'en-TZ'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date | string, locale = 'en-TZ'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

export function truncate(text: string, length = 50): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
