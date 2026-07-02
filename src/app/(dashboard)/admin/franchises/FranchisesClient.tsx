"use client";

import { useState } from "react";
import { createFranchise, updateFranchise, deleteFranchise } from "@/actions/franchises";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Store } from "lucide-react";

type FranchiseOwner = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
};

type Franchise = {
  id: string;
  name: string;
  location: string | null;
  isActive: boolean;
  createdAt: Date;
  users: FranchiseOwner[];
  _count: { users: number };
};

export default function FranchisesClient({ franchises }: { franchises: Franchise[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    ownerName: "",
    ownerNik: "",
    ownerPassword: "",
    ownerPhone: "",
  });

  const filtered = franchises.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingFranchise(null);
    setForm({ name: "", ownerName: "", ownerNik: "", ownerPassword: "", ownerPhone: "" });
    setShowModal(true);
  };

  const openEdit = (franchise: Franchise) => {
    setEditingFranchise(franchise);
    setForm({
      name: franchise.name,
      ownerName: "",
      ownerNik: "",
      ownerPassword: "",
      ownerPhone: "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingFranchise) {
        await updateFranchise(editingFranchise.id, {
          name: form.name,
        });
        toast.success("Franchise berhasil diperbarui");
      } else {
        if (!form.ownerPassword) {
          toast.error("Password pemilik wajib diisi");
          setLoading(false);
          return;
        }
        await createFranchise({
          name: form.name,
          ownerName: form.ownerName,
          ownerNik: form.ownerNik,
          ownerPassword: form.ownerPassword,
          ownerPhone: form.ownerPhone || undefined,
        });
        toast.success("Franchise berhasil ditambahkan");
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
      await deleteFranchise(id);
      toast.success("Franchise berhasil dihapus");
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
    maxWidth: "480px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    maxHeight: "90vh",
    overflowY: "auto" as const,
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
            Kelola Franchise
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            {franchises.length} franchise terdaftar
          </p>
        </div>
        <button onClick={openCreate} style={btnStyle("#dc2626")}>
          Tambah Franchise
        </button>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          Pencarian
        </p>
        <input
          type="text"
          placeholder="Cari nama franchise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "400px" }}
        />
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyItems: "space-between" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0, flex: 1 }}>Daftar Franchise</p>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{filtered.length} data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                {["Nama Franchise", "Pemilik", "Username", "Jml Rider", "Terdaftar", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((franchise) => {
                const owner = franchise.users[0];
                return (
                  <tr 
                    key={franchise.id} 
                    style={{ borderBottom: "1px solid #F9FAFB" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "10px", backgroundColor: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Store style={{ width: "16px", height: "16px", color: "#DC2626" }} />
                        </div>
                        {franchise.name}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{owner?.name || "-"}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{owner?.username || "-"}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, backgroundColor: "#EFF6FF", color: "#2563EB" }}>
                        {franchise._count.users} rider
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "#6B7280" }}>{formatDate(franchise.createdAt)}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => openEdit(franchise)}
                          style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", border: "none", cursor: "pointer" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(franchise.id)}
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
                  <td colSpan={7}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                        <Store style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Belum ada franchise</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Tambahkan franchise pertama Anda.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Hapus Franchise?</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Franchise beserta akun pemilik dan rider di dalamnya akan dihapus permanen dari sistem.</p>
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

      {/* Modal Form */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: 0 }}>
                {editingFranchise ? "Edit Franchise" : "Tambah Franchise Baru"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ fontSize: "13px", fontWeight: 500, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer" }}
              >
                Tutup
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Franchise Info Section */}
              <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0", borderBottom: "1px solid #F3F4F6", paddingBottom: "8px" }}>
                Info Franchise
              </p>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Nama Franchise</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Kopi Keliling Bandung"
                />
                <p style={{ fontSize: "11px", color: "#6B7280", marginTop: "6px", marginBottom: 0 }}>*Nama ini akan digunakan sebagai Username untuk login pemilik.</p>
              </div>

              {/* Owner Info Section (only for create) */}
              {!editingFranchise && (
                <>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "8px 0 0", borderBottom: "1px solid #F3F4F6", paddingBottom: "8px" }}>
                    Akun Pemilik Franchise
                  </p>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Nama Pemilik</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={form.ownerName}
                      onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                      required
                      placeholder="Nama lengkap pemilik"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>NIK Pemilik</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={form.ownerNik}
                      onChange={(e) => setForm({ ...form, ownerNik: e.target.value })}
                      required
                      placeholder="16 digit NIK"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Password</label>
                    <input
                      type="password"
                      style={inputStyle}
                      value={form.ownerPassword}
                      onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })}
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>No. Telepon Pemilik</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={form.ownerPhone}
                      onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                      placeholder="08xx-xxxx-xxxx"
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle("#F3F4F6", "#374151"), flex: 1 }}>
                  Batal
                </button>
                <button type="submit" disabled={loading} style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {editingFranchise ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
