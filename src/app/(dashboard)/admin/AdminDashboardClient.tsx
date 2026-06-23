"use client";

import React from "react";
import { Coffee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type DashboardData = {
  totalSalesToday: number;
  totalTransactionsToday: number;
  totalExpensesToday: number;
  activeRiders: number;
  ridersStockedToday: number;
  ridersClosedToday: number;
  last7Days: {
    date: string;
    label: string;
    total: number;
    count: number;
  }[];
  dailyRiders: {
    id: string;
    name: string;
    stokAwal: number;
    terjual: number;
    totalPendapatan: number;
    totalExpenses: number;
    cashAmount: number;
    qrisAmount: number;
    products: {
      name: string;
      unit: string;
      stokAwal: number;
      terjual: number;
    }[];
  }[];
  productSales: {
    name: string;
    qty: number;
    subtotal: number;
  }[];
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "12px", fontSize: "13px", border: "1px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <p style={{ color: "#9CA3AF", marginBottom: "4px", margin: "0 0 4px" }}>{label}</p>
        <p style={{ fontWeight: 600, color: "#111827", margin: 0 }}>{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AdminDashboardClient({
  initialData: data,
  period,
}: {
  initialData: DashboardData;
  period: string;
}) {
  const router = useRouter();
  const [expandedRider, setExpandedRider] = useState<string | null>(null);

  const stats = [
    { label: "Total Penjualan", value: formatCurrency(data.totalSalesToday) },
    { label: "Total Transaksi", value: data.totalTransactionsToday.toString() },
    { label: "Total Pengeluaran", value: formatCurrency(data.totalExpensesToday) },
    { label: "Rider Aktif", value: data.activeRiders.toString() },
  ];

  const card = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            Overview penjualan dan performa rider
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "14px", color: "#9CA3AF", backgroundColor: "#fff", padding: "8px 14px", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
            {new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date())}
          </div>
          <select
            value={period}
            onChange={(e) => router.push(`?period=${e.target.value}`)}
            style={{ height: "40px", borderRadius: "12px", border: "1px solid #E5E7EB", padding: "0 12px", fontSize: "14px", color: "#111827", backgroundColor: "#fff", outline: "none", minWidth: "140px", cursor: "pointer" }}
          >
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="all">Keseluruhan</option>
          </select>
        </div>
      </div>

      {/* Stats Cards — 4 kolom */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ ...card, padding: "24px" }}>
            <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", margin: "0 0 10px" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "22px", fontWeight: 700, color: "#111827", margin: 0 }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Row 2: Chart (kiri, 2/3) + Status Rider (kanan, 1/3) */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Sales Chart */}
        <div style={{ ...card, padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Tren Penjualan</p>
          </div>
          <div style={{ height: "220px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="label" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt`
                      : v >= 1000 ? `${(v / 1000).toFixed(0)}rb`
                        : v.toString()
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="url(#brandGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
                <defs>
                  <linearGradient id="brandGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#991B1B" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Rider */}
        <div style={{ ...card, padding: "24px" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Status Rider</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Aktivitas hari ini</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Sudah Input Stok", value: `${data.ridersStockedToday}/${data.activeRiders}`, color: "#059669" },
              { label: "Sudah Closing", value: `${data.ridersClosedToday}/${data.activeRiders}`, color: "#2563EB" },
              { label: "Belum Closing", value: `${data.ridersStockedToday - data.ridersClosedToday}`, color: "#D97706" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>{item.label}</span>
                <span style={{ fontWeight: 700, color: item.color, fontSize: "15px" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Data Penjualan Harian (kiri) + Penjualan Produk (kanan) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

        {/* Data Penjualan Harian */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Data Penjualan Harian</p>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{data.dailyRiders.length} rider</span>
          </div>

          {data.dailyRiders.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Coffee style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Belum ada data</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Data penjualan rider akan muncul setelah ada transaksi.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                    {["Nama Rider", "Total Pendapatan", "Aksi"].map((h) => (
                      <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.dailyRiders.map((rider) => {
                    const isExpanded = expandedRider === rider.id;
                    return (
                      <React.Fragment key={rider.id}>
                        <tr
                          style={{ cursor: "pointer", borderBottom: "1px solid #F9FAFB" }}
                          onClick={() => setExpandedRider(isExpanded ? null : rider.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{rider.name}</td>
                          <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#059669" }}>{formatCurrency(rider.totalPendapatan)}</td>
                          <td style={{ padding: "16px 24px" }}>
                            {isExpanded
                              ? <ChevronUp style={{ width: "20px", height: "20px", color: "#9CA3AF" }} />
                              : <ChevronDown style={{ width: "20px", height: "20px", color: "#9CA3AF" }} />}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr style={{ backgroundColor: "#F8FAFC" }}>
                            <td colSpan={3} style={{ padding: "20px 24px", borderTop: "1px solid #F3F4F6" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                                {[
                                  { label: "Stok Awal", value: `${rider.stokAwal} pcs` },
                                  { label: "Laku", value: `${rider.terjual} pcs` },
                                  { label: "Tunai", value: formatCurrency(rider.cashAmount) },
                                  { label: "QRIS", value: formatCurrency(rider.qrisAmount) },
                                ].map((item, i) => (
                                  <div key={i}>
                                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px" }}>{item.label}</p>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{item.value}</p>
                                  </div>
                                ))}
                                <div style={{ gridColumn: "span 2" }}>
                                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 4px" }}>Total Pengeluaran</p>
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#DC2626", margin: 0 }}>{formatCurrency(rider.totalExpenses)}</p>
                                </div>
                              </div>
                              <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
                                <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 10px" }}>
                                  Detail Produk
                                </p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                                  {Object.entries(
                                    rider.products.reduce((acc, p) => {
                                      const unit = p.unit || "Lainnya";
                                      if (!acc[unit]) acc[unit] = [];
                                      acc[unit].push(p);
                                      return acc;
                                    }, {} as Record<string, typeof rider.products>)
                                  ).map(([unit, unitProducts]) => (
                                    <div key={unit}>
                                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", margin: "0 0 8px", textTransform: "capitalize" }}>Ukuran {unit}</p>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
                                        {unitProducts.map((p, idx) => (
                                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", padding: "10px 14px", borderRadius: "10px", border: "1px solid #F3F4F6" }}>
                                            <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{p.name}</span>
                                            <span style={{ fontSize: "12px", color: "#9CA3AF", display: "flex", gap: "10px" }}>
                                              <span>Bawa: <strong style={{ color: "#111827" }}>{p.stokAwal}</strong></span>
                                              <span>Laku: <strong style={{ color: "#059669" }}>{p.terjual}</strong></span>
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  {(!rider.products || rider.products.length === 0) && (
                                    <p style={{ fontSize: "12px", color: "#9CA3AF", fontStyle: "italic" }}>Tidak ada data produk</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Penjualan Produk */}
        <div style={{ ...card, padding: "24px", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Penjualan Produk</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Berdasarkan jumlah terjual</p>
          </div>

          {data.productSales.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Coffee style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>Belum ada penjualan</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Data penjualan produk akan muncul setelah ada transaksi.</p>
            </div>
          ) : (
            <div style={{ height: "240px", width: "100%", overflowY: "auto", overflowX: "hidden", paddingRight: "8px" }}>
              <div style={{ height: `${Math.max(240, data.productSales.length * 48)}px`, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.productSales} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#4B5563" }} width={120} />
                    <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: "#fff", borderRadius: "12px", padding: "12px", fontSize: "13px", border: "1px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                            <p style={{ fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>{d.name}</p>
                            <p style={{ color: "#374151", margin: "0 0 2px" }}>Terjual: <strong style={{ color: "#111827" }}>{d.qty}</strong></p>
                            <p style={{ color: "#059669", fontWeight: 500, margin: 0 }}>{formatCurrency(d.subtotal)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="qty" fill="url(#brandGradient2)" radius={[0, 4, 4, 0]} maxBarSize={32} />
                  <defs>
                    <linearGradient id="brandGradient2" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#991B1B" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}