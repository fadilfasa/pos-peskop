"use client";

import Link from "next/link";
import {
  LogOut,
  ChevronRight,
  Wallet,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";


type StockItem = {
  id: string;
  initialQty: number;
  soldQty: number;
  remainingQty: number;
  product: { id: string; name: string; price: number; unit: string };
};

type DashboardData = {
  hasStock: boolean;
  isClosed: boolean;
  stockItems: StockItem[];
  totalSales: number;
  cashSales: number;
  qrisSales: number;
  totalExpenses: number;
  transactionCount: number;
};



export default function RiderDashboardClient({
  data,
}: {
  data: DashboardData;
}) {
  const card = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  const btnStyle = (bg: string, color: string = "#fff") => ({
    backgroundColor: bg,
    color,
    borderRadius: "12px",
    padding: "0 20px",
    height: "40px",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
    gap: "8px",
    textDecoration: "none",
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            Ringkasan penjualan hari ini
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#9CA3AF", backgroundColor: "#fff", padding: "6px 12px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
          <span>
            {new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date())}
          </span>
        </div>
      </div>

      {/* Status Banner */}
      {!data.hasStock && (
        <div style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#92400E", fontWeight: 500, fontSize: "14px", margin: 0 }}>
              Anda belum menginput stok awal hari ini
            </p>
            <p style={{ color: "#D97706", fontSize: "12px", marginTop: "2px", margin: 0 }}>
              Input stok awal sebelum mulai berjualan
            </p>
          </div>
          <Link href="/rider/stock" style={btnStyle("#dc2626")}>
            Input Stok
            <ArrowRight style={{ width: "12px", height: "12px" }} />
          </Link>
        </div>
      )}

      {data.isClosed && (
        <div style={{ padding: "20px", borderRadius: "16px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div>
            <p style={{ color: "#065F46", fontWeight: 500, fontSize: "14px", margin: 0 }}>
              Hari ini sudah di-closing
            </p>
            <p style={{ color: "#059669", fontSize: "12px", marginTop: "2px", margin: 0 }}>
              Terima kasih atas kerja keras hari ini!
            </p>
          </div>
        </div>
      )}

      {/* Floating Action: Tambah Transaksi */}
      {data.hasStock && !data.isClosed && (
        <Link
          href="/rider/sales"
          style={{
            ...btnStyle("#dc2626"),
            position: "fixed",
            bottom: "24px",
            right: "32px",
            zIndex: 30,
            height: "48px",
            borderRadius: "24px",
            boxShadow: "0 10px 15px -3px rgba(220, 38, 38, 0.3)",
          }}
        >
          <Plus style={{ width: "20px", height: "20px" }} />
          Tambah Transaksi
        </Link>
      )}

      {/* Quick Actions */}
      {data.hasStock && !data.isClosed && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            { href: "/rider/stock", label: "Stok Awal" },
            { href: "/rider/sales", label: "Catat Penjualan" },
            { href: "/rider/expenses", label: "Pengeluaran" },
            { href: "/rider/closing", label: "Closing" },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{
                ...card,
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#374151" }}>
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ ...card, padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Total Penjualan</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            {formatCurrency(data.totalSales)}
          </p>
        </div>
        <div style={{ ...card, padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Transaksi</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>{data.transactionCount}</p>
        </div>
        <div style={{ ...card, padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Cash</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            {formatCurrency(data.cashSales)}
          </p>
        </div>
        <div style={{ ...card, padding: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>QRIS</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#111827", margin: 0 }}>
            {formatCurrency(data.qrisSales)}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
        {/* Stock Status */}
        {data.stockItems.length > 0 && (
          <div style={{ ...card, padding: "24px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Status Stok</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", margin: 0 }}>Sisa stok hari ini</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {Object.entries(
                data.stockItems.reduce((acc, item) => {
                  const unit = item.product.unit || "Lainnya";
                  if (!acc[unit]) acc[unit] = [];
                  acc[unit].push(item);
                  return acc;
                }, {} as Record<string, typeof data.stockItems>)
              ).map(([unit, items]) => (
                <div key={unit} style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", margin: "0 0 8px", textTransform: "capitalize" }}>Ukuran {unit}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {items.map((item) => {
                      const pct = item.initialQty > 0 ? (item.remainingQty / item.initialQty) * 100 : 0;
                      return (
                        <div key={item.id} style={{ padding: "12px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                            <span style={{ fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                              {item.product.name}
                            </span>
                            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                              {item.remainingQty}/{item.initialQty}
                            </span>
                          </div>
                          <div style={{ height: "8px", borderRadius: "4px", backgroundColor: "#E5E7EB", overflow: "hidden" }}>
                            <div
                              style={{
                                height: "100%",
                                borderRadius: "4px",
                                transition: "all 0.3s ease",
                                width: `${pct}%`,
                                backgroundColor: pct > 50 ? "#10B981" : pct > 20 ? "#F59E0B" : "#EF4444",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
