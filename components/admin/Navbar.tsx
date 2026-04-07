"use client";

import React from "react";
import { User as UserIcon, Search, Bell, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const pathname = usePathname();
  const { user, role, loading } = useAuth();
  const pageTitle = pathname.split("/").pop() || "Dashboard";
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <header className="h-20 bg-background border-b border-border px-8 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary capitalize">{formattedTitle}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative pointer-events-none opacity-50">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="h-10 pl-10 pr-4 w-64 bg-surface border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue/40"
          />
        </div>

        <button className="p-2 rounded-lg bg-surface border border-border hover:bg-border transition-colors text-text-secondary hover:text-text-primary relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-blue rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border h-10">
          <div className="text-right hidden sm:block">
            {loading ? (
              <div className="flex items-center justify-end">
                <Loader2 size={14} className="animate-spin text-text-secondary" />
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold text-text-primary">
                  {user?.email?.split('@')[0] || "Admin User"}
                </p>
                <p className="text-xs text-text-secondary capitalize">{role}</p>
              </>
            )}
          </div>
          <div className="h-10 w-10 bg-accent-blue/10 border border-accent-blue/20 rounded-full flex items-center justify-center text-accent-blue cursor-pointer hover:bg-accent-blue/20 transition-colors">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}
