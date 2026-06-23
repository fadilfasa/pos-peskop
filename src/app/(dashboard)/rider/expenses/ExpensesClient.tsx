"use client";

import { useState } from "react";
import { createExpense, deleteExpense } from "@/actions/expenses";
import {
  Receipt,
  Plus,
  Trash2,
  Fuel,
  UtensilsCrossed,
  ParkingCircle,
  MoreHorizontal,
  Loader2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency, formatDateTime, getExpenseCategoryLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Expense = {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: Date;
};

const categories = [
  { value: "FUEL", label: "Bensin", icon: Fuel, iconBg: "bg-orange-50", iconColor: "text-orange-600" },
  { value: "FOOD", label: "Makan", icon: UtensilsCrossed, iconBg: "bg-green-50", iconColor: "text-green-600" },
  { value: "PARKING", label: "Parkir", icon: ParkingCircle, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
  { value: "OTHER", label: "Lainnya", icon: MoreHorizontal, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
];

export default function ExpensesClient({
  dailyStockId,
  expenses,
}: {
  dailyStockId: string;
  expenses: Expense[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    category: "FUEL",
    amount: "",
    description: "",
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(form.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Masukkan nominal yang valid");
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        dailyStockId,
        category: form.category as "FUEL" | "FOOD" | "PARKING" | "OTHER",
        amount,
        description: form.description || undefined,
      });
      toast.success("Pengeluaran berhasil dicatat");
      setForm({ category: "FUEL", amount: "", description: "" });
      setShowForm(false);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success("Pengeluaran dihapus");
      setDeleteConfirm(null);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    if (!cat) return MoreHorizontal;
    return cat.icon;
  };

  const getCategoryStyle = (category: string) => {
    const cat = categories.find((c) => c.value === category);
    return { iconBg: cat?.iconBg || "bg-slate-50", iconColor: cat?.iconColor || "text-surface-600" };
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
  });

  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  };

  const modalContentStyle = {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "24px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
            Pengeluaran Harian
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            Catat semua pengeluaran operasional hari ini
          </p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle("#dc2626")}>
          <Plus style={{ width: "16px", height: "16px" }} />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Total */}
      <div style={{ ...card, padding: "20px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 8px" }}>Total Pengeluaran</p>
          <p style={{ fontSize: "24px", fontWeight: 700, color: "#D97706", margin: 0 }}>
            {formatCurrency(totalExpenses)}
          </p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px", margin: 0 }}>
            {expenses.length} pengeluaran hari ini
          </p>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ ...card, padding: "24px", marginBottom: "24px" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "16px" }}>
            Tambah Pengeluaran Baru
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Kategori</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "8px" }}>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = form.category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.value })}
                      style={{
                        padding: "12px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 500, transition: "all 0.2s", cursor: "pointer",
                        border: isSelected ? "1px solid #FCA5A5" : "1px solid #E5E7EB",
                        backgroundColor: isSelected ? "#FEF2F2" : "#fff",
                        color: isSelected ? "#DC2626" : "#9CA3AF"
                      }}
                    >
                      <Icon style={{ width: "20px", height: "20px" }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Nominal (Rp)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                placeholder="10000"
                min="0"
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Keterangan (opsional)</label>
              <input
                type="text"
                style={inputStyle}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Bensin pertamax 1 liter"
              />
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ ...btnStyle("#F3F4F6", "#374151"), flex: 1 }}>
                Batal
              </button>
              <button type="submit" disabled={loading} style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}>
                {loading && <Loader2 style={{ width: "16px", height: "16px", animation: "spin 1s linear infinite" }} />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {expenses.map((expense) => {
          const Icon = getCategoryIcon(expense.category);
          const style = getCategoryStyle(expense.category);
          
          let bgColor = "#F8FAFC";
          let color = "#475569";
          if (style.iconBg.includes("orange")) { bgColor = "#FFF7ED"; color = "#EA580C"; }
          if (style.iconBg.includes("green")) { bgColor = "#F0FDF4"; color = "#16A34A"; }
          if (style.iconBg.includes("blue")) { bgColor = "#EFF6FF"; color = "#2563EB"; }
          if (style.iconBg.includes("purple")) { bgColor = "#FAF5FF"; color = "#9333EA"; }

          return (
            <div key={expense.id} style={{ ...card, padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon style={{ width: "20px", height: "20px", color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", margin: 0 }}>
                  {getExpenseCategoryLabel(expense.category)}
                </p>
                {expense.description && (
                  <p style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                    {expense.description}
                  </p>
                )}
                <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", margin: 0 }}>
                  {formatDateTime(expense.createdAt)}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#D97706" }}>
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  onClick={() => setDeleteConfirm(expense.id)}
                  style={{ padding: "8px", borderRadius: "12px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
                >
                  <Trash2 style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            </div>
          );
        })}
        {expenses.length === 0 && !showForm && (
          <div style={{ ...card, padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Receipt style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Belum ada pengeluaran hari ini</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>
              Klik "Tambah Pengeluaran" untuk mencatat
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle style={{ width: "20px", height: "20px", color: "#DC2626" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>Hapus Pengeluaran?</h3>
                <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Data pengeluaran ini akan dihapus permanen.</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ ...btnStyle("#F3F4F6", "#374151"), flex: 1 }}>
                Batal
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ ...btnStyle("#dc2626"), flex: 1 }}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
