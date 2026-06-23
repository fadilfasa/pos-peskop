"use client";

import { Coffee, Package, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
};

type StockItem = {
  id: string;
  initialQty: number;
  soldQty: number;
  remainingQty: number;
  product: { id: string; name: string; price: number; unit: string };
};

type TodayStock = {
  id: string;
  items: StockItem[];
  closing: unknown;
} | null;

export default function StockClient({
  todayStock,
}: {
  todayStock: TodayStock;
  products: Product[];
}) {
  const card = {
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  };

  if (!todayStock) {
    return (
      <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
            Stok Hari Ini
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            Ringkasan stok yang telah diinput
          </p>
        </div>

        <div style={{ ...card, padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
            <Package style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
          </div>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Stok belum diinput</p>
          <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "250px", margin: 0 }}>
            Admin belum menginputkan stok Anda hari ini. Silakan hubungi Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Stok Hari Ini
        </h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
          Ringkasan stok yang telah diinput oleh Admin
        </p>
      </div>

      <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "24px" }}>
        <Info style={{ width: "20px", height: "20px", color: "#1D4ED8", flexShrink: 0, marginTop: "2px" }} />
        <div>
          <p style={{ color: "#1E3A8A", fontWeight: 600, fontSize: "14px", margin: "0 0 4px" }}>
            Informasi Stok
          </p>
          <p style={{ color: "#1E40AF", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>
            Stok ini diatur oleh Admin. Jika Anda merasa stok yang ada tidak sesuai atau ingin menambah stok, silakan hubungi Admin.
          </p>
        </div>
      </div>

      {Object.entries(
        todayStock.items.reduce((acc, item) => {
          const unit = item.product.unit || "Lainnya";
          if (!acc[unit]) acc[unit] = [];
          acc[unit].push(item);
          return acc;
        }, {} as Record<string, typeof todayStock.items>)
      ).map(([unit, items]) => (
        <div key={unit} style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#374151", marginBottom: "16px", borderBottom: "2px solid #F3F4F6", paddingBottom: "8px", textTransform: "capitalize" }}>
            Ukuran {unit}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {items.map((item) => {
              const pct = item.initialQty > 0 ? (item.remainingQty / item.initialQty) * 100 : 0;
              return (
                <div key={item.id} style={{ ...card, padding: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "12px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Coffee style={{ width: "20px", height: "20px", color: "#DC2626" }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>{item.product.name}</h3>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", margin: 0 }}>
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px", textAlign: "center" }}>
                    <div style={{ padding: "8px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>{item.initialQty}</p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Awal</p>
                    </div>
                    <div style={{ padding: "8px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "#D97706", margin: 0 }}>{item.soldQty}</p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Terjual</p>
                    </div>
                    <div style={{ padding: "8px", borderRadius: "12px", backgroundColor: "#F8FAFC" }}>
                      <p style={{ fontSize: "16px", fontWeight: 700, color: "#059669", margin: 0 }}>{item.remainingQty}</p>
                      <p style={{ fontSize: "10px", color: "#9CA3AF", margin: 0 }}>Sisa</p>
                    </div>
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
  );
}
