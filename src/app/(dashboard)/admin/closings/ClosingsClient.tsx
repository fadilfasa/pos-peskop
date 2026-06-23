"use client";

import React, { useState } from "react";
import { getClosingHistory } from "@/actions/closings";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from "@/lib/utils";
import { History } from "lucide-react";

type Closing = {
  id: string;
  riderId: string;
  date: Date;
  totalSalesCash: number;
  totalSalesQris: number;
  totalExpenses: number;
  expectedDeposit: number;
  actualDeposit: number;
  difference: number;
  notes: string | null;
  status: string;
  closedAt: Date;
  rider: { name: string; username: string };
  dailyStock?: {
    items: {
      productId: string;
      initialQty: number;
      soldQty: number;
      product: { name: string; hpp: number; price: number; unit: string };
    }[];
  };
};

type Rider = {
  id: string;
  name: string;
};

export default function ClosingsClient({
  initialClosings,
  riders,
}: {
  initialClosings: Closing[];
  riders: Rider[];
}) {
  const [closings, setClosings] = useState(initialClosings);
  const [filters, setFilters] = useState({
    riderId: "",
    startDate: "",
    endDate: "",
    productUnit: "",
  });
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const result = await getClosingHistory({
        riderId: filters.riderId || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setClosings(result);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const params = new URLSearchParams();
    if (filters.riderId) params.append("riderId", filters.riderId);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.productUnit) params.append("unit", filters.productUnit);

    window.open(`/api/export/excel?${params.toString()}`, "_blank");
  };

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
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Riwayat Closing
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Histori closing harian semua rider
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
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
            <button
              onClick={handleFilter}
              disabled={loading}
              style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Memuat..." : "Terapkan"}
            </button>
            <button
              onClick={handleExportExcel}
              style={{ ...btnStyle("#059669"), flex: 1 }}
            >
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyItems: "space-between" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0, flex: 1 }}>Data Closing</p>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{closings.length} data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                {["Rider", "Tanggal", "Modal", "Penjualan", "Keuntungan", "Margin"].map((h, i) => (
                  <th key={h} style={{ textAlign: i >= 2 ? "right" : "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const displayClosings = closings.filter((c) => {
                  if (!filters.productUnit) return true;
                  const itemsToConsider = c.dailyStock?.items?.filter(i => i.product.unit === filters.productUnit);
                  return itemsToConsider && itemsToConsider.length > 0;
                });

                return (
                  <>
                    {displayClosings.map((c) => {
                      let modal = 0;
                let penjualan = 0;
                
                const itemsToConsider = filters.productUnit 
                  ? c.dailyStock?.items?.filter(i => i.product.unit === filters.productUnit) 
                  : c.dailyStock?.items;

                itemsToConsider?.forEach((item) => {
                  modal += item.soldQty * (item.product.hpp || 0);
                  penjualan += item.soldQty * (item.product.price || 0);
                });
                
                if (!filters.productUnit) {
                  penjualan = c.totalSalesCash + c.totalSalesQris;
                }

                const keuntungan = penjualan - modal;
                const margin = modal > 0 ? (keuntungan / modal) * 100 : 0;

                return (
                  <React.Fragment key={c.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      style={{ cursor: "pointer", borderBottom: "1px solid #F9FAFB" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{c.rider.name}</td>
                      <td style={{ padding: "16px 24px", fontSize: "13px", color: "#6B7280" }}>{formatDate(c.date)}</td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151", textAlign: "right" }}>{formatCurrency(modal)}</td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151", textAlign: "right" }}>{formatCurrency(penjualan)}</td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: keuntungan >= 0 ? "#059669" : "#DC2626", textAlign: "right" }}>
                        {formatCurrency(keuntungan)}
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#111827", textAlign: "right" }}>
                        {margin.toFixed(2)}%
                      </td>
                    </tr>
                    {expandedId === c.id && (
                      <tr style={{ backgroundColor: "#F8FAFC" }}>
                        <td colSpan={6} style={{ padding: "20px 24px", borderTop: "1px solid #F3F4F6" }}>
                          <div style={{ maxWidth: "800px" }}>
                            <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: "0 0 12px" }}>Detail Stok Produk</h4>
                            <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                                  <th style={{ textAlign: "left", paddingBottom: "8px", fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Produk</th>
                                  <th style={{ textAlign: "center", paddingBottom: "8px", fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Bawa</th>
                                  <th style={{ textAlign: "center", paddingBottom: "8px", fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Laku</th>
                                  <th style={{ textAlign: "center", paddingBottom: "8px", fontSize: "11px", color: "#9CA3AF", textTransform: "uppercase" }}>Sisa</th>
                                </tr>
                              </thead>
                              <tbody>
                                {c.dailyStock?.items?.length ? (
                                  Object.entries(
                                    c.dailyStock.items.reduce((acc, item) => {
                                      const unit = item.product.unit || "Lainnya";
                                      if (!acc[unit]) acc[unit] = [];
                                      acc[unit].push(item);
                                      return acc;
                                    }, {} as Record<string, typeof c.dailyStock.items>)
                                  ).map(([unit, items]) => (
                                    <React.Fragment key={unit}>
                                      <tr>
                                        <td colSpan={4} style={{ padding: "12px 0 4px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "capitalize", borderBottom: "1px solid #E5E7EB" }}>
                                          Ukuran {unit}
                                        </td>
                                      </tr>
                                      {items.map((item) => (
                                        <tr key={item.productId} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                          <td style={{ padding: "8px 0", color: "#111827", paddingLeft: "12px" }}>{item.product.name}</td>
                                          <td style={{ padding: "8px 0", textAlign: "center", color: "#374151" }}>{item.initialQty}</td>
                                          <td style={{ padding: "8px 0", textAlign: "center", fontWeight: 600, color: "#059669" }}>{item.soldQty}</td>
                                          <td style={{ padding: "8px 0", textAlign: "center", color: "#374151" }}>{item.initialQty - item.soldQty}</td>
                                        </tr>
                                      ))}
                                    </React.Fragment>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} style={{ padding: "12px 0", textAlign: "center", color: "#9CA3AF" }}>Data stok tidak tersedia</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {closings.filter((c) => {
                if (!filters.productUnit) return true;
                const itemsToConsider = c.dailyStock?.items?.filter(i => i.product.unit === filters.productUnit);
                return itemsToConsider && itemsToConsider.length > 0;
              }).length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                        <History style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Belum ada riwayat closing</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Data closing akan muncul setelah rider melakukan closing harian.</p>
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })()}
            </tbody>
            {(() => {
              const displayClosings = closings.filter((c) => {
                if (!filters.productUnit) return true;
                const itemsToConsider = c.dailyStock?.items?.filter(i => i.product.unit === filters.productUnit);
                return itemsToConsider && itemsToConsider.length > 0;
              });

              if (displayClosings.length === 0) return null;

              let totalModal = 0;
              let totalPenjualan = 0;
              let totalKeuntungan = 0;

              displayClosings.forEach((c) => {
                let modal = 0;
                let penjualan = 0;
                
                const itemsToConsider = filters.productUnit 
                  ? c.dailyStock?.items?.filter(i => i.product.unit === filters.productUnit) 
                  : c.dailyStock?.items;

                itemsToConsider?.forEach((item) => {
                  modal += item.soldQty * (item.product.hpp || 0);
                  penjualan += item.soldQty * (item.product.price || 0);
                });
                
                if (!filters.productUnit) {
                  penjualan = c.totalSalesCash + c.totalSalesQris;
                }

                const keuntungan = penjualan - modal;

                totalModal += modal;
                totalPenjualan += penjualan;
                totalKeuntungan += keuntungan;
              });

              const rataRataMargin = totalModal > 0 ? (totalKeuntungan / totalModal) * 100 : 0;

              return (
                <tfoot>
                  <tr style={{ backgroundColor: "#F8FAFC", borderTop: "2px solid #E5E7EB" }}>
                    <td colSpan={2} style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#111827", textAlign: "right" }}>Total Keseluruhan:</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#374151", textAlign: "right" }}>{formatCurrency(totalModal)}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#374151", textAlign: "right" }}>{formatCurrency(totalPenjualan)}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: totalKeuntungan >= 0 ? "#059669" : "#DC2626", textAlign: "right" }}>{formatCurrency(totalKeuntungan)}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 700, color: "#111827", textAlign: "right" }}>{rataRataMargin.toFixed(2)}%</td>
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        </div>
      </div>
    </div>
  );
}
