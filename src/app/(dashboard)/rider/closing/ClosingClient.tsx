"use client";

import { useState } from "react";
import { createClosing } from "@/actions/closings";
import {
  ChevronLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Loader2,
  Lock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type StockItem = {
  id: string;
  initialQty: number;
  soldQty: number;
  remainingQty: number;
  product: { name: string; price: number; unit: string };
};

type Transaction = {
  id: string;
  totalAmount: number;
  paymentMethod: string;
};

type Expense = {
  id: string;
  amount: number;
  category: string;
};

export default function ClosingClient({
  dailyStockId,
  stockItems,
  transactions,
  expenses,
}: {
  dailyStockId: string;
  stockItems: StockItem[];
  transactions: Transaction[];
  expenses: Expense[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [actualDeposit, setActualDeposit] = useState("");
  const [notes, setNotes] = useState("");

  const totalSalesCash = transactions
    .filter((t) => t.paymentMethod === "CASH")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalSalesQris = transactions
    .filter((t) => t.paymentMethod === "QRIS")
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const totalSales = totalSalesCash + totalSalesQris;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expectedDeposit = totalSalesCash - totalExpenses;

  const depositValue = parseInt(actualDeposit) || 0;
  const difference = depositValue - expectedDeposit;

  const handleSubmit = async () => {
    if (!actualDeposit) {
      toast.error("Masukkan jumlah setoran");
      return;
    }

    if (Math.abs(difference) > 0 && !notes) {
      toast.error("Berikan catatan jika ada selisih setoran");
      return;
    }

    setLoading(true);
    try {
      await createClosing({
        dailyStockId,
        actualDeposit: depositValue,
        notes: notes || undefined,
      });
      toast.success("Closing berhasil! Terima kasih atas kerja keras hari ini 🎉");
      router.push("/rider");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
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
    width: "100%",
  });

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Closing Harian
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Ringkasan dan setoran akhir hari
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="lg:grid-cols-3">
        {/* Left Column (Summaries) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }} className="lg:col-span-2">
          {/* Sales Summary */}
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Ringkasan Penjualan</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", margin: 0 }}>{transactions.length} transaksi hari ini</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#F8FAFC", textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>{formatCurrency(totalSales)}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px", margin: 0 }}>Total Penjualan</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#F8FAFC", textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>{formatCurrency(totalSalesCash)}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px", margin: 0 }}>Cash</p>
              </div>
              <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#F8FAFC", textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "#111827", margin: 0 }}>{formatCurrency(totalSalesQris)}</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px", margin: 0 }}>QRIS</p>
              </div>
            </div>
          </div>

          {/* Expenses Summary */}
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Total Pengeluaran</p>
            </div>
            <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "14px", color: "#374151" }}>
                {expenses.length} pengeluaran
              </span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#D97706" }}>
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          {/* Stock Summary */}
          <div style={{ ...card, padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Sisa Stok</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(
                stockItems.reduce((acc, item) => {
                  const unit = item.product.unit || "Lainnya";
                  if (!acc[unit]) acc[unit] = [];
                  acc[unit].push(item);
                  return acc;
                }, {} as Record<string, typeof stockItems>)
              ).map(([unit, items]) => (
                <div key={unit} style={{ marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", margin: "0 0 8px", textTransform: "capitalize" }}>Ukuran {unit}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                        <span style={{ fontSize: "14px", color: "#111827" }}>{item.product.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "14px" }}>
                          <span style={{ color: "#9CA3AF" }}>{item.initialQty} awal</span>
                          <ArrowRight style={{ width: "12px", height: "12px", color: "#9CA3AF" }} />
                          <span style={{ color: "#D97706" }}>{item.soldQty} terjual</span>
                          <ArrowRight style={{ width: "12px", height: "12px", color: "#9CA3AF" }} />
                          <span style={{ fontWeight: 700, color: "#059669" }}>
                            {item.remainingQty} sisa
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Deposit Calculation) */}
        <div>
          <div style={{ ...card, padding: "24px", border: "2px solid #FECACA", position: "sticky", top: "80px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Setoran</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>Penjualan Cash</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                  {formatCurrency(totalSalesCash)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                <span style={{ fontSize: "14px", color: "#374151" }}>Pengeluaran</span>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#D97706" }}>
                  - {formatCurrency(totalExpenses)}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderRadius: "12px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#B91C1C" }}>
                  Expected Setoran
                </span>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#B91C1C" }}>
                  {formatCurrency(expectedDeposit)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Jumlah Setoran Aktual (Rp)</label>
                <input
                  type="number"
                  style={{ ...inputStyle, height: "64px", fontSize: "24px", fontWeight: 700, textAlign: "center" }}
                  value={actualDeposit}
                  onChange={(e) => setActualDeposit(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>

              {actualDeposit && (
                <div
                  style={{
                    padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px",
                    border: difference === 0 ? "1px solid #A7F3D0" : difference > 0 ? "1px solid #BFDBFE" : "1px solid #FECACA",
                    backgroundColor: difference === 0 ? "#ECFDF5" : difference > 0 ? "#EFF6FF" : "#FEF2F2"
                  }}
                >
                  {difference === 0 ? (
                    <CheckCircle style={{ width: "20px", height: "20px", color: "#10B981", flexShrink: 0 }} />
                  ) : difference > 0 ? (
                    <TrendingUp style={{ width: "20px", height: "20px", color: "#3B82F6", flexShrink: 0 }} />
                  ) : (
                    <AlertTriangle style={{ width: "20px", height: "20px", color: "#EF4444", flexShrink: 0 }} />
                  )}
                  <div>
                    <p
                      style={{
                        fontSize: "14px", fontWeight: 600, margin: 0,
                        color: difference === 0 ? "#047857" : difference > 0 ? "#1D4ED8" : "#B91C1C"
                      }}
                    >
                      {difference === 0 ? "Seimbang" : difference > 0 ? `Lebih ${formatCurrency(difference)}` : `Kurang ${formatCurrency(Math.abs(difference))}`}
                    </p>
                    <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", margin: 0 }}>
                      {difference === 0 ? "Setoran sesuai dengan expected" : "Berikan catatan di bawah ini"}
                    </p>
                  </div>
                </div>
              )}

              {actualDeposit && difference !== 0 && (
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                    Catatan / Alasan Selisih
                  </label>
                  <textarea
                    style={{ ...inputStyle, minHeight: "80px", paddingTop: "12px", resize: "none" }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jelaskan alasan selisih setoran..."
                    required
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !actualDeposit}
                style={{ ...btnStyle("#dc2626"), height: "48px", opacity: (loading || !actualDeposit) ? 0.5 : 1 }}
              >
                {loading ? (
                  <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <Lock style={{ width: "20px", height: "20px" }} />
                )}
                {loading ? "Memproses..." : "Submit Closing Hari Ini"}
              </button>

              <p style={{ fontSize: "12px", color: "#9CA3AF", textAlign: "center", margin: 0 }}>
                ⚠️ Setelah closing, data hari ini tidak bisa diubah
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
