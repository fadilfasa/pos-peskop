"use client";

import { useState } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";
import { Coffee, Package } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  price: number;
  hpp: number;
  unit: string;
  isActive: boolean;
  createdAt: Date;
};

export default function ProductsClient({
  products,
}: {
  products: Product[];
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    hpp: "",
    unit: "150 ml",
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ name: "", price: "", hpp: "", unit: "150 ml" });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price?.toString() || "0",
      hpp: product.hpp?.toString() || "0",
      unit: product.unit,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const price = parseInt(form.price);
      const hpp = parseInt(form.hpp) || 0;
      if (isNaN(price) || price <= 0) {
        toast.error("Harga harus berupa angka positif");
        setLoading(false);
        return;
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: form.name,
          price,
          hpp,
          unit: form.unit,
          isActive: editingProduct.isActive,
        });
        toast.success("Produk berhasil diperbarui");
      } else {
        await createProduct({ name: form.name, price, hpp, unit: form.unit });
        toast.success("Produk berhasil ditambahkan");
      }
      setShowModal(false);
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
      await deleteProduct(id);
      toast.success("Produk berhasil dihapus");
      setDeleteConfirm(null);
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap" as const,
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
            Kelola Produk
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            {products.length} produk
          </p>
        </div>
        <button onClick={openCreate} style={btnStyle("#dc2626")}>
          Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          Pencarian
        </p>
        <input
          type="text"
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "400px" }}
        />
      </div>

      {/* Product Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {filtered.map((product) => (
          <div key={product.id} style={{ ...card, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Coffee style={{ width: "24px", height: "24px", color: "#DC2626" }} />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => openEdit(product)}
                  style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", border: "none", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(product.id)}
                  style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", border: "none", cursor: "pointer" }}
                >
                  Hapus
                </button>
              </div>
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>{product.name}</h3>
            <p style={{ fontSize: "20px", fontWeight: 700, color: "#DC2626", margin: 0 }}>
              {formatCurrency(product.price)}
            </p>
            <p style={{ fontSize: "13px", color: "#6B7280", margin: "4px 0 0 0" }}>
              HPP: {formatCurrency(product.hpp || 0)}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>per {product.unit}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ ...card, gridColumn: "1 / -1", padding: "64px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
              <Package style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Tidak ada produk ditemukan</p>
            <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Coba ubah kata kunci pencarian.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Hapus Produk?</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Produk akan dihapus dari daftar.</p>
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

      {/* Modal */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Nama Produk</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Es Kopi Susu"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Harga Jual (Rp)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  placeholder="15000"
                  min="0"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>HPP (Harga Pokok Penjualan) (Rp)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={form.hpp}
                  onChange={(e) => setForm({ ...form, hpp: e.target.value })}
                  required
                  placeholder="10000"
                  min="0"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Jenis / Ukuran</label>
                <select
                  style={inputStyle}
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="150 ml">150 ml</option>
                  <option value="250 ml">250 ml</option>
                  <option value="1 L">1 L</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle("#F3F4F6", "#374151"), flex: 1 }}>
                  Batal
                </button>
                <button type="submit" disabled={loading} style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {editingProduct ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
