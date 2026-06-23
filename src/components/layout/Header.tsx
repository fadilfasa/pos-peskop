"use client";

import { Menu, ChevronDown, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header({ 
  toggleMobile 
}: { 
  toggleMobile: () => void; 
}) {
  const { data: session } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-[72px] bg-white border-b border-surface-200 flex items-center justify-between px-4 lg:px-8 flex-shrink-0 z-30 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleMobile} 
          className="lg:hidden p-2 rounded-xl text-surface-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 pl-2 sm:pl-5 border-l border-surface-200 transition-opacity hover:opacity-80"
          >
            <div className="hidden sm:block text-right mr-1">
              <p className="text-sm font-semibold text-surface-900 leading-tight truncate max-w-[120px]">
                {session?.user?.name || "User"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm shadow-sm border border-brand-200">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <ChevronDown className="w-4 h-4 text-surface-400 hidden sm:block ml-1" />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-lg border border-surface-100 py-1.5 z-50 animate-fade-in">
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-surface-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
