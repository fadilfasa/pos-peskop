"use client";

import { useState } from "react";
import { createAdminDailyStock, addAdminAdditionalStock } from "@/actions/stocks";
import { Coffee, Package, PackageOpen, Plus, Save, Loader2, User } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
};

type Rider = {
  id: string;
  name: string;
  username: string;
};

type StockItem = {
  id: string;
  initialQty: number;
  soldQty: number;
  remainingQty: number;
  product: { id: string; name: string; price: number; unit: string };
};

type DailyStock = {
  id: string;
  riderId: string;
  items: StockItem[];
  closing: any;
};

export default function AdminStocksClient({
  riders,
  products,
  dailyStocks,
}: {
  riders: Rider[];
  products: Product[];
  dailyStocks: DailyStock[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isAddingMore, setIsAddingMore] = useState(false);

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const handleOpenStockForm = (rider: Rider, addMore: boolean) => {
    setSelectedRider(rider);
    setIsAddingMore(addMore);
    const q: Record<string, number> = {};
    products.forEach((p) => {
      q[p.id] = 0;
    });
    setQuantities(q);
  };

  const handleCloseStockForm = () => {
    setSelectedRider(null);
    setIsAddingMore(false);
  };

  const handleSubmit = async () => {
    if (!selectedRider) return;

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([productId, qty]) => ({ productId, addQty: qty, initialQty: qty }));

    if (items.length === 0) {
      toast.error("Masukkan minimal satu produk dengan stok > 0");
      return;
    }

    setLoading(true);
    try {
      const existingStock = dailyStocks.find(s => s.riderId === selectedRider.id);

      if (existingStock && isAddingMore) {
        await addAdminAdditionalStock(
          existingStock.id,
          items.map(i => ({ productId: i.productId, addQty: i.addQty }))
        );
        toast.success("Tambahan stok berhasil disimpan!");
      } else {
        await createAdminDailyStock(
          selectedRider.id,
          items.map(i => ({ productId: i.productId, initialQty: i.initialQty }))
        );
        toast.success("Stok awal berhasil disimpan!");
      }
      handleCloseStockForm();
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
  });

  if (selectedRider) {
    const existingStock = dailyStocks.find(s => s.riderId === selectedRider.id);

    return (
      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
              {isAddingMore ? "Tambah Stok" : "Input Stok Awal"} - {selectedRider.name}
            </h1>
            <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
              {isAddingMore
                ? "Masukkan jumlah stok tambahan per produk"
                : "Masukkan jumlah stok per produk sebelum mulai berjualan"}
            </p>
          </div>

          <button
            onClick={handleCloseStockForm}
            style={{ ...btnStyle("#F3F4F6", "#374151") }}
          >
            Kembali
          </button>
        </div>

        {products.length === 0 ? (
          <div style={{ ...card, padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Package style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Belum ada produk terdaftar</p>
          </div>
        ) : (
          <>
            {Object.entries(
              products.reduce((acc, product) => {
                const unit = product.unit || "Lainnya";
                if (!acc[unit]) acc[unit] = [];
                acc[unit].push(product);
                return acc;
              }, {} as Record<string, typeof products>)
            ).map(([unit, unitProducts]) => (
              <div key={unit} style={{ marginBottom: "32px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "16px", borderBottom: "2px solid #F3F4F6", paddingBottom: "8px", textTransform: "capitalize" }}>
                  Ukuran {unit}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                  {unitProducts.map((product) => {
                    const stockItem = existingStock?.items.find(i => i.product.id === product.id);

                    return (
                      <div key={product.id} style={{ ...card, padding: "24px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                          <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Coffee style={{ width: "20px", height: "20px", color: "#DC2626" }} />
                          </div>
                          <div>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{product.name}</h3>
                            <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
                              {formatCurrency(product.price)}
                            </p>
                            {isAddingMore && stockItem && (
                              <p style={{ fontSize: "11px", color: "#059669", marginTop: "4px", fontWeight: 500 }}>
                                Stok tersisa: {stockItem.remainingQty}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                            {isAddingMore ? "Jumlah Tambahan" : "Jumlah Stok"}
                          </label>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: Math.max(0, (prev[product.id] || 0) - 1),
                                }))
                              }
                              style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#374151", cursor: "pointer" }}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              style={{ ...inputStyle, textAlign: "center", fontSize: "16px", fontWeight: 700 }}
                              value={quantities[product.id] || 0}
                              onChange={(e) =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: Math.max(0, parseInt(e.target.value) || 0),
                                }))
                              }
                              min="0"
                            />
                            <button
                              onClick={() =>
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: (prev[product.id] || 0) + 1,
                                }))
                              }
                              style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#374151", cursor: "pointer" }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ ...btnStyle("#dc2626"), opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (
                  <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
                ) : (
                  <Save style={{ width: "20px", height: "20px" }} />
                )}
                {loading ? "Menyimpan..." : (isAddingMore ? "Simpan Tambahan Stok" : "Simpan Stok Awal")}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Stok Rider Hari Ini
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Kelola stok harian untuk setiap rider
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {riders.map((rider) => {
          const riderStock = dailyStocks.find(s => s.riderId === rider.id);

          return (
            <div key={rider.id} style={{ ...card, padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <User style={{ width: "24px", height: "24px", color: "#6B7280" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>{rider.name}</h3>
                  <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>{rider.username}</p>
                </div>
              </div>

              {riderStock ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: "8px" }}>
                    <PackageOpen style={{ width: "16px", height: "16px", color: "#059669" }} />
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "#065F46" }}>
                      Stok sudah diinput
                    </span>
                  </div>
                  {!riderStock.closing && (
                    <button
                      onClick={() => handleOpenStockForm(rider, true)}
                      style={{ ...btnStyle("#EFF6FF", "#1D4ED8"), width: "100%", border: "1px solid #BFDBFE" }}
                    >
                      <Plus style={{ width: "16px", height: "16px" }} />
                      Tambah Stok
                    </button>
                  )}
                  {riderStock.closing && (
                    <div style={{ fontSize: "12px", color: "#B91C1C", textAlign: "center" }}>
                      Rider sudah closing hari ini
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleOpenStockForm(rider, false)}
                  style={{ ...btnStyle("#dc2626"), width: "100%" }}
                >
                  <Package style={{ width: "16px", height: "16px" }} />
                  Input Stok Awal
                </button>
              )}
            </div>
          );
        })}
        {riders.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "#6B7280" }}>
            Belum ada rider yang aktif.
          </div>
        )}
      </div>
    </div>
  );
}
