"use client";

import { Bell, Search, User, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";

interface HeaderProps {
  onMenuToggle?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ onMenuToggle, breadcrumbs }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as
    | { name?: string; email?: string; role?: string }
    | undefined;

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGING_PARTNER: "bg-purple-100 text-purple-700",
    ADVOCATE: "bg-blue-100 text-blue-700",
    SECRETARY: "bg-green-100 text-green-700",
    ACCOUNTANT: "bg-yellow-100 text-yellow-700",
    PROCUREMENT_OFFICER: "bg-orange-100 text-orange-700",
  };

  const roleLabel: Record<string, string> = {
    ADMIN: "Admin",
    MANAGING_PARTNER: "Managing Partner",
    ADVOCATE: "Advocate",
    SECRETARY: "Secretary",
    ACCOUNTANT: "Accountant",
    PROCUREMENT_OFFICER: "Procurement",
  };

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-4 gap-4">
      <button
        onClick={onMenuToggle}
        className="text-gray-400 hover:text-gray-600 lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {breadcrumbs && (
        <nav className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center">
              {index > 0 && <span className="mx-1">/</span>}
              <span
                className={
                  index === breadcrumbs.length - 1
                    ? "text-navy-900 font-medium"
                    : "hover:text-navy-900 cursor-pointer"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="flex-1" />

      <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 w-64">
        <Search className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full text-gray-600 placeholder-gray-400"
        />
      </div>

      <button className="relative text-gray-500 hover:text-navy-900 transition-colors">
        <Bell className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          3
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors">
            <div className="w-8 h-8 bg-navy-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gold-400" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-medium text-gray-900 leading-tight">
                {user?.name || "User"}
              </div>
              {user?.role && (
                <div
                  className={`text-xs px-1.5 py-0.5 rounded-full inline-block ${roleBadgeColor[user.role] || "bg-gray-100 text-gray-600"}`}
                >
                  {roleLabel[user.role] || user.role}
                </div>
              )}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
