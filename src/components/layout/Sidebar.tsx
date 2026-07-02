"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Coffee,
  LayoutDashboard,
  UserCog,
  Bike,
  Package,
  BarChart3,
  History,
  Boxes,
  ShoppingCart,
  Receipt,
  ClipboardCheck,
  ClipboardList,
  Database,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/admins", label: "Admin", icon: UserCog },
  { href: "/admin/franchises", label: "Franchise", icon: Store },
  { href: "/admin/riders", label: "Rider", icon: Bike },
  { href: "/admin/products", label: "Produk", icon: Package },
  { href: "/admin/stocks", label: "Stok Rider", icon: ClipboardList },
  { href: "/admin/raw-materials", label: "Stok Bahan Baku", icon: Database },
  { href: "/admin/reports/sales", label: "Laporan Penjualan", icon: BarChart3 },
  { href: "/admin/closings", label: "Riwayat Closing", icon: History },
];

const franchiseLinks = [
  { href: "/franchise", label: "Dashboard", icon: LayoutDashboard },
  { href: "/franchise/riders", label: "Rider", icon: Bike },
  { href: "/franchise/stocks", label: "Stok Rider", icon: ClipboardList },
  { href: "/franchise/reports/sales", label: "Laporan Penjualan", icon: BarChart3 },
  { href: "/franchise/closings", label: "Riwayat Closing", icon: History },
];

const riderLinks = [
  { href: "/rider", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rider/stock", label: "Stok Awal", icon: Boxes },
  { href: "/rider/sales", label: "Catat Penjualan", icon: ShoppingCart },
  { href: "/rider/expenses", label: "Pengeluaran", icon: Receipt },
  { href: "/rider/closing", label: "Closing Harian", icon: ClipboardCheck },
];

export default function Sidebar({
  collapsed,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
}: {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const links = role === "ADMIN" ? adminLinks : role === "FRANCHISE_OWNER" ? franchiseLinks : riderLinks;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed lg:relative top-0 left-0 h-screen bg-white border-r border-surface-200 flex flex-col transition-all duration-300 z-50 flex-shrink-0 shadow-sm lg:shadow-none",
          collapsed ? "w-[88px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "72px",
            flexShrink: 0,
            borderBottom: "1px solid #E5E7EB",
            padding: collapsed ? "0 8px" : "0 32px",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "12px",
            transition: "all 0.3s",
          }}
        >
          <button
            onClick={toggleSidebar}
            className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-sm hover:opacity-90 transition-opacity"
          >
            <Coffee className="w-5 h-5 text-white" />
            {/* <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /> */}
          </button>
          {!collapsed && (
            <span
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                fontSize: "24px",
                color: "#111827",
                letterSpacing: "-0.025em",
                whiteSpace: "nowrap",
              }}
            >
              PESKOP
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "16px 0" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: collapsed ? "0 16px" : "0 24px", display: "flex", flexDirection: "column", gap: "4px", transition: "padding 0.3s" }}>
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" &&
                  link.href !== "/rider" &&
                  link.href !== "/franchise" &&
                  pathname.startsWith(link.href));

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? link.label : undefined}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: "52px",
                      padding: collapsed ? "14px 12px" : "14px 16px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 500,
                      textDecoration: "none",
                      position: "relative",
                      overflow: "hidden",
                      gap: "12px",
                      justifyContent: collapsed ? "center" : "flex-start",
                      backgroundColor: isActive ? "#1a2332" : "transparent",
                      color: isActive ? "#fff" : "#6b7280",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "#fef2f2";
                        (e.currentTarget as HTMLElement).style.color = "var(--color-brand-600, #dc2626)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#6b7280";
                      }
                    }}
                  >
                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: "4px",
                          backgroundColor: "#dc2626",
                          borderRadius: "0 4px 4px 0",
                        }}
                      />
                    )}

                    <link.icon
                      style={{
                        width: "20px",
                        height: "20px",
                        flexShrink: 0,
                        position: "relative",
                        zIndex: 10,
                        color: isActive ? "#dc2626" : "#9ca3af",
                      }}
                    />
                    {!collapsed && (
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", position: "relative", zIndex: 10 }}>
                        {link.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}