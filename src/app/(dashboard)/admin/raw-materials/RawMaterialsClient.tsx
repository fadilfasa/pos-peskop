"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRawMaterial, updateRawMaterial, deleteRawMaterial } from "@/actions/raw-materials";
import { Plus, Edit2, Trash2, Download, X, Database } from "lucide-react";
import * as XLSX from "xlsx";

type RawMaterial = {
  id: string;
  merk: string;
  stockAwal: number;
  tambahan: number;
  terpakai: number;
};

export default function RawMaterialsClient({
  initialData,
}: {
  initialData: RawMaterial[];
}) {
  const router = useRouter();
  const [materials, setMaterials] = useState<RawMaterial[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    merk: "",
    stockAwal: 0,
    tambahan: 0,
    terpakai: 0,
  });
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = materials.filter(
    (m) => m.merk.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenModal = (material?: RawMaterial) => {
    if (material) {
      setEditingId(material.id);
      setFormData({
        merk: material.merk,
        stockAwal: material.stockAwal,
        tambahan: material.tambahan,
        terpakai: material.terpakai,
      });
    } else {
      setEditingId(null);
      setFormData({ merk: "", stockAwal: 0, tambahan: 0, terpakai: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await updateRawMaterial(editingId, formData);
      } else {
        await createRawMaterial(formData);
      }
      
      // Update local state for immediate feedback
      if (editingId) {
        setMaterials(materials.map(m => m.id === editingId ? { ...m, ...formData } : m));
      } else {
        router.refresh(); 
        setTimeout(() => {
            window.location.reload();
        }, 500);
      }
      
      handleCloseModal();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRawMaterial(id);
      setMaterials(materials.filter(m => m.id !== id));
      setDeleteConfirm(null);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Gagal menghapus data");
    }
  };

  const handleExportExcel = () => {
    const dataToExport = materials.map((m) => ({
      MERK: m.merk,
      "STOCK AWAL": m.stockAwal,
      TAMBAHAN: m.tambahan,
      TERPAKAI: m.terpakai,
      "SISA STOCK": m.stockAwal + m.tambahan - m.terpakai,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Bahan Baku");

    const wscols = [
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    worksheet["!cols"] = wscols;

    XLSX.writeFile(workbook, "Laporan_Stock_Bahan_Baku.xlsx");
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
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
            Daftar Stock Bahan Baku
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            Kelola inventaris dan stok bahan baku Anda
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={handleExportExcel} style={btnStyle("#16a34a")}>
            <Download size={16} style={{ marginRight: "8px" }} />
            Export Excel
          </button>
          <button onClick={() => handleOpenModal()} style={btnStyle("#dc2626")}>
            <Plus size={16} style={{ marginRight: "8px" }} />
            Tambah Data
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          Pencarian
        </p>
        <input
          type="text"
          placeholder="Cari merk / nama barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "400px" }}
        />
      </div>

      {/* Desktop Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0 }}>Stock Bahan Baku</p>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{filtered.length} data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                {["Merk", "Stock Awal", "Tambahan", "Terpakai", "Sisa Stock", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const sisaStock = m.stockAwal + m.tambahan - m.terpakai;
                return (
                  <tr 
                    key={m.id} 
                    style={{ borderBottom: "1px solid #F9FAFB" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{m.merk}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{m.stockAwal}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{m.tambahan}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{m.terpakai}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: sisaStock <= 0 ? "#DC2626" : "#16A34A" }}>
                      {sisaStock}
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenModal(m)}
                          style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", border: "none", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(m.id)}
                          style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", border: "none", cursor: "pointer" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 24px", textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#6B7280" }}>
                      <Database size={48} style={{ color: "#D1D5DB", marginBottom: "16px" }} />
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#111827", margin: "0 0 4px" }}>Belum ada data</p>
                      <p style={{ fontSize: "12px", margin: 0 }}>Klik "Tambah Data" untuk mulai mencatat stok.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalContentStyle, maxWidth: "320px", textAlign: "center" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Hapus Data</h3>
            <p style={{ fontSize: "14px", color: "#6B7280", margin: "0 0 24px" }}>
              Yakin ingin menghapus data stok ini?
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #E5E7EB", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", backgroundColor: "#DC2626", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isModalOpen && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>
                {editingId ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
              </h3>
              <button
                onClick={handleCloseModal}
                style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", padding: "4px" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Merk / Nama Barang</label>
                  <input
                    type="text"
                    required
                    value={formData.merk}
                    onChange={(e) => setFormData({ ...formData, merk: e.target.value })}
                    style={inputStyle}
                    placeholder="Contoh: Susu UHT Diamond"
                  />
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Stock Awal</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stockAwal}
                      onChange={(e) => setFormData({ ...formData, stockAwal: parseInt(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Tambahan</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.tambahan}
                      onChange={(e) => setFormData({ ...formData, tambahan: parseInt(e.target.value) || 0 })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Terpakai</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.terpakai}
                    onChange={(e) => setFormData({ ...formData, terpakai: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "12px", border: "1px solid #F3F4F6", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280" }}>Estimasi Sisa Stock:</span>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    {formData.stockAwal + formData.tambahan - formData.terpakai}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #E5E7EB", backgroundColor: "#fff", color: "#374151", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", backgroundColor: "#dc2626", color: "#fff", fontSize: "14px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
