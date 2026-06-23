"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden w-full bg-slate-50">
      <Sidebar 
        collapsed={collapsed} 
        toggleSidebar={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header 
          toggleMobile={() => setMobileOpen(!mobileOpen)}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-slate-50/50">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
