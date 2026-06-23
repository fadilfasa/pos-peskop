"use client";

import { useState } from "react";
import { createTransaction } from "@/actions/transactions";
import {
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Smartphone,
  Check,
  Loader2,
  Coffee,
  Clock,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDateTime, getPaymentMethodLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type StockItem = {
  id: string;
  initialQty: number;
  soldQty: number;
  remainingQty: number;
  product: { id: string; name: string; price: number };
  dailyStockId?: string;
  productId?: string;
};

type Transaction = {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  createdAt: Date;
  items: {
    id: string;
    qty: number;
    price: number;
    subtotal: number;
    product: { name: string };
  }[];
};

export default function SalesClient({
  dailyStockId,
  stockItems,
  transactions,
}: {
  dailyStockId: string;
  stockItems: StockItem[];
  transactions: Transaction[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState<
    Record<string, { qty: number; price: number; name: string }>
  >({});
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("CASH");

  const addToCart = (item: StockItem) => {
    const current = cart[item.product.id]?.qty || 0;
    if (current >= item.remainingQty) {
      toast.error(`Stok ${item.product.name} habis`);
      return;
    }
    setCart((prev) => ({
      ...prev,
      [item.product.id]: {
        qty: current + 1,
        price: item.product.price,
        name: item.product.name,
      },
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const current = prev[productId]?.qty || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: { ...prev[productId], qty: current - 1 },
      };
    });
  };

  const clearItem = (productId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const cartItems = Object.entries(cart).filter(([, v]) => v.qty > 0);
  const totalAmount = cartItems.reduce(
    (sum, [, item]) => sum + item.qty * item.price,
    0
  );

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error("Tambahkan minimal satu item");
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        dailyStockId,
        paymentMethod,
        items: cartItems.map(([productId, item]) => ({
          productId,
          qty: item.qty,
          price: item.price,
        })),
      });
      toast.success("Transaksi berhasil dicatat!");
      setCart({});
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
          Catat Penjualan
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Pilih produk dan catat setiap transaksi
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="lg:grid-cols-3">
        {/* Product Selection */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="lg:col-span-2">
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Pilih Produk
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {stockItems.map((item) => {
              const inCart = cart[item.product.id]?.qty || 0;
              const available = item.remainingQty - inCart;
              return (
                <div
                  key={item.id}
                  style={{ ...card, padding: "20px", cursor: "pointer", transition: "transform 0.2s" }}
                  onClick={() => addToCart(item)}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Coffee style={{ width: "20px", height: "20px", color: "#DC2626" }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>
                          {item.product.name}
                        </h3>
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "#DC2626", margin: 0 }}>
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>Sisa</p>
                      <p style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: available <= 0 ? "#EF4444" : available <= 5 ? "#F59E0B" : "#059669" }}>
                        {available}
                      </p>
                    </div>
                  </div>
                  {inCart > 0 && (
                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600, backgroundColor: "#ECFDF5", color: "#047857" }}>
                        {inCart} di keranjang
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(item.product.id);
                          }}
                          style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Minus style={{ width: "12px", height: "12px", color: "#374151" }} />
                        </button>
                        <span style={{ width: "32px", textAlign: "center", fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                          {inCart}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
                          style={{ width: "28px", height: "28px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <Plus style={{ width: "12px", height: "12px", color: "#374151" }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
            Keranjang
          </p>
          <div style={{ ...card, padding: "20px", position: "sticky", top: "80px" }}>
            {cartItems.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 0", textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                  <ShoppingCart style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Keranjang kosong</p>
                <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>
                  Klik produk untuk menambahkan
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                  {cartItems.map(([productId, item]) => (
                    <div key={productId} style={{ display: "flex", alignItems: "center", justifyItems: "space-between", padding: "10px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
                          {item.qty} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#DC2626" }}>
                          {formatCurrency(item.qty * item.price)}
                        </span>
                        <button
                          onClick={() => clearItem(productId)}
                          style={{ padding: "4px", borderRadius: "8px", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF" }}
                        >
                          <Trash2 style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "16px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", color: "#374151" }}>Total</span>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#DC2626" }}>
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Payment Method */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Metode Bayar</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button
                      onClick={() => setPaymentMethod("CASH")}
                      style={{
                        padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, transition: "all 0.2s", cursor: "pointer",
                        border: paymentMethod === "CASH" ? "1px solid #6EE7B7" : "1px solid #E5E7EB",
                        backgroundColor: paymentMethod === "CASH" ? "#ECFDF5" : "#fff",
                        color: paymentMethod === "CASH" ? "#047857" : "#9CA3AF"
                      }}
                    >
                      <CreditCard style={{ width: "16px", height: "16px" }} />
                      Cash
                    </button>
                    <button
                      onClick={() => setPaymentMethod("QRIS")}
                      style={{
                        padding: "12px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "14px", fontWeight: 500, transition: "all 0.2s", cursor: "pointer",
                        border: paymentMethod === "QRIS" ? "1px solid #93C5FD" : "1px solid #E5E7EB",
                        backgroundColor: paymentMethod === "QRIS" ? "#EFF6FF" : "#fff",
                        color: paymentMethod === "QRIS" ? "#1D4ED8" : "#9CA3AF"
                      }}
                    >
                      <Smartphone style={{ width: "16px", height: "16px" }} />
                      QRIS
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{ ...btnStyle("#dc2626"), opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Check style={{ width: "20px", height: "20px" }} />
                  )}
                  {loading ? "Memproses..." : "Simpan Transaksi"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={{ ...card, overflow: "hidden", marginTop: "24px" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Transaksi Hari Ini</p>
            <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{transactions.length} transaksi</span>
          </div>
          <div>
            {transactions.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px",
                  borderBottom: i < transactions.length - 1 ? "1px solid #F9FAFB" : "none",
                  backgroundColor: "transparent"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>
                    {t.items.map((item) => `${item.product.name} x${item.qty}`).join(", ")}
                  </p>
                  <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", margin: 0 }}>
                    {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 600,
                      backgroundColor: t.paymentMethod === "CASH" ? "#ECFDF5" : "#F5F3FF",
                      color: t.paymentMethod === "CASH" ? "#047857" : "#6D28D9"
                    }}
                  >
                    {getPaymentMethodLabel(t.paymentMethod)}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "#059669" }}>
                    {formatCurrency(t.totalAmount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
