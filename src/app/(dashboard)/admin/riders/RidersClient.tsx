"use client";

import { useState } from "react";
import { createRider, updateRider, deleteRider } from "@/actions/riders";

import { formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Bike } from "lucide-react";

type Rider = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
};

export default function RidersClient({ riders }: { riders: Rider[] }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingRider, setEditingRider] = useState<Rider | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    phone: "",
  });

  const filtered = riders.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.username.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingRider(null);
    setForm({ name: "", username: "", password: "", phone: "" });
    setShowModal(true);
  };

  const openEdit = (rider: Rider) => {
    setEditingRider(rider);
    setForm({
      name: rider.name,
      username: rider.username,
      password: "",
      phone: rider.phone || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingRider) {
        await updateRider(editingRider.id, {
          name: form.name,
          username: form.username,
          phone: form.phone || undefined,
          password: form.password || undefined,
          isActive: editingRider.isActive,
        });
        toast.success("Rider berhasil diperbarui");
      } else {
        if (!form.password) {
          toast.error("Password wajib diisi");
          setLoading(false);
          return;
        }
        await createRider({
          name: form.name,
          username: form.username,
          password: form.password,
          phone: form.phone || undefined,
        });
        toast.success("Rider berhasil ditambahkan");
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
      await deleteRider(id);
      toast.success("Rider berhasil dihapus");
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
            Kelola Rider
          </h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", marginTop: "4px", marginBottom: 0 }}>
            {riders.length} rider terdaftar
          </p>
        </div>
        <button onClick={openCreate} style={btnStyle("#dc2626")}>
          Tambah Rider
        </button>
      </div>

      {/* Search */}
      <div style={{ ...card, padding: "20px 24px", marginBottom: "24px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 16px" }}>
          Pencarian
        </p>
        <input
          type="text"
          placeholder="Cari nama atau ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: "400px" }}
        />
      </div>

      {/* Desktop Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyItems: "space-between" }}>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#111827", margin: 0, flex: 1 }}>Daftar Rider</p>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{filtered.length} data</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F3F4F6" }}>
                {["Nama", "Rider ID", "Telepon", "Terdaftar", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em", padding: "14px 24px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rider) => (
                <tr 
                  key={rider.id} 
                  style={{ borderBottom: "1px solid #F9FAFB" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F8FAFC")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{rider.name}</td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{rider.username}</td>
                  <td style={{ padding: "16px 24px", fontSize: "14px", color: "#374151" }}>{rider.phone || "-"}</td>
                  <td style={{ padding: "16px 24px", fontSize: "13px", color: "#6B7280" }}>{formatDate(rider.createdAt)}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <button
                        onClick={() => openEdit(rider)}
                        style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#2563EB", backgroundColor: "#EFF6FF", border: "none", cursor: "pointer" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(rider.id)}
                        style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600, color: "#DC2626", backgroundColor: "#FEF2F2", border: "none", cursor: "pointer" }}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", textAlign: "center" }}>
                      <div style={{ width: "48px", height: "48px", borderRadius: "16px", backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                        <Bike style={{ width: "24px", height: "24px", color: "#9CA3AF" }} />
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>Tidak ada rider ditemukan</p>
                      <p style={{ fontSize: "12px", color: "#9CA3AF", maxWidth: "200px", margin: 0 }}>Coba ubah kata kunci pencarian.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={modalOverlayStyle} onClick={() => setDeleteConfirm(null)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", margin: "0 0 4px" }}>Hapus Rider?</h3>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Rider akan dihapus dari sistem.</p>
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
                {editingRider ? "Edit Rider" : "Tambah Rider Baru"}
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
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Nama Lengkap</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Nama rider"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>Rider ID</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  placeholder="rider001"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                  Password {editingRider && <span style={{ color: "#9CA3AF" }}>(kosongkan jika tidak diubah)</span>}
                </label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingRider}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>No. Telepon</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...btnStyle("#F3F4F6", "#374151"), flex: 1 }}>
                  Batal
                </button>
                <button type="submit" disabled={loading} style={{ ...btnStyle("#dc2626"), flex: 1, opacity: loading ? 0.7 : 1 }}>
                  {editingRider ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
