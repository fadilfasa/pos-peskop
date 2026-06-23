"use client";

import { useState } from "react";
import { getSalesReport } from "@/actions/dashboard";
import {
  formatCurrency,
  formatDateTime,
  getPaymentMethodLabel,
} from "@/lib/utils";
import { BarChart3 } from "lucide-react";

type Transaction = {
  id: string;
  riderId: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  rider: { name: string };
  items: {
    id: string;
    qty: number;
    price: number;
    subtotal: number;
    product: { name: string; unit: string };
  }[];
};

type Summary = {
  totalAmount: number;
  cashAmount: number;
  qrisAmount: number;
  totalCount: number;
};

type Rider = {
  id: string;
  name: string;
  username: string;
};

export default function SalesReportClient({
  initialReport,
  riders,
}: {
  initialReport: { transactions: Transaction[]; summary: Summary };
  riders: Rider[];
}) {
  const [report, setReport] = useState(initialReport);
  const [filters, setFilters] = useState({
    riderId: "",
    startDate: "",
    endDate: "",
    productUnit: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const result = await getSalesReport({
        riderId: filters.riderId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        productUnit: filters.productUnit || undefined,
      });
      setReport(result);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Penjualan",
      value: formatCurrency(report.summary.totalAmount),
    },
    {
      label: "Penjualan Cash",
      value: formatCurrency(report.summary.cashAmount),
    },
    {
      label: "Penjualan QRIS",
      value: formatCurrency(report.summary.qrisAmount),
    },
    {
      label: "Total Transaksi",
      value: report.summary.totalCount.toString(),
    },
  ];

  const card = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  const inputStyle = {
    height: "40px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "0 12px",
    fontSize: "14px",
    color: "#111827",
    backgroundColor: "#fff",
    outline: "none",
    width: "100%",
  };

  const btnStyle = (bg: string) => ({
    backgroundColor: bg,
    color: "#fff",
    borderRadius: "12px",
    padding: "0 20px",
    height: "40px",
    fontSize: "14px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Laporan Penjualan
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Detail transaksi penjualan semua rider
        </p>
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          Filter
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Rider</label>
            <select
              style={inputStyle}
              value={filters.riderId}
              onChange={(e) => setFilters({ ...filters, riderId: e.target.value })}
            >
              <option value="">Semua Rider</option>
              {riders.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Ukuran Produk</label>
            <select
              style={inputStyle}
              value={filters.productUnit}
              onChange={(e) => setFilters({ ...filters, productUnit: e.target.value })}
            >
              <option value="">Semua Ukuran</option>
              <option value="150 ml">150ml</option>
              <option value="250 ml">250ml</option>
              <option value="1 L">1 Liter</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Dari Tanggal</label>
            <input
              type="date"
              style={inputStyle}
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Sampai Tanggal</label>
            <input
              type="date"
              style={inputStyle}
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={handleFilter}
              disabled={loading}
              style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Memuat..." : "Terapkan"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
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

      {/* Desktop Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyItems: "space-between" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0, flex: 1 }}>Daftar Transaksi</p>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{report.transactions.length} data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                {["Waktu", "Rider", "Item", "Metode Bayar", "Total"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.transactions.map((t) => (
                <tr 
                  key={t.id} 
                  style={{ borderBottom: "1px solid #F9FAFB" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#6B7280" }}>{formatDateTime(t.createdAt)}</td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{t.rider.name}</td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#374151" }}>
                    {t.items.map((item) => `${item.product.name} (${item.product.unit}) x${item.qty}`).join(", ")}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, backgroundColor: t.paymentMethod === "CASH" ? "#D1FAE5" : "#EDE9FE", color: t.paymentMethod === "CASH" ? "#047857" : "#6D28D9" }}>
                      {getPaymentMethodLabel(t.paymentMethod)}
                    </span>
                  </td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#059669" }}>{formatCurrency(t.totalAmount)}</td>
                </tr>
              ))}
              {report.transactions.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                        <BarChart3 style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Tidak ada transaksi</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Coba ubah filter untuk melihat data lainnya.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
