import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-TZ", { year: "numeric", month: "long", day: "numeric" });
}

export function formatCurrency(amount: number): string {
  return `TZS ${new Intl.NumberFormat("en-TZ", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function generateCaseNumber(): string {
  return `MA/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`;
}

export function generateReferenceNumber(prefix: string): string {
  return `${prefix}/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000) + 1000}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    ONGOING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    ARCHIVED: "bg-gray-100 text-gray-800",
    PENDING: "bg-orange-100 text-orange-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function getDaysUntil(date: Date | string): number {
  const target = new Date(date);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
