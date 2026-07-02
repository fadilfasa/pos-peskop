"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: "48px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    padding: "0 16px",
    fontSize: "14px",
    color: "#111827",
    backgroundColor: "#F9FAFB",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, background-color 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6",
        padding: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/peskop-logo.png"
            alt="Logo PESKOP"
            style={{
              display: "inline-block",
              width: "100px",
              height: "auto",
              objectFit: "contain",
              marginBottom: "16px",
            }}
          />
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 8px 0",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.025em",
            }}
          >
            PESKOP
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
            Sistem Manajemen Penjualan Kopi Keliling
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "24px",
            padding: "32px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            border: "1px solid #F3F4F6",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: "0 0 24px 0", textAlign: "center" }}>
            Masuk ke Akun Anda
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {error && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#DC2626",
                  fontSize: "13px",
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Username / Rider ID / Nama Franchise
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                placeholder="Masukkan Username, ID, atau Nama Franchise"
                required
                autoComplete="username"
                onFocus={(e) => {
                  e.target.style.borderColor = "#dc2626";
                  e.target.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.backgroundColor = "#F9FAFB";
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "8px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#dc2626";
                    e.target.style.backgroundColor = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.backgroundColor = "#F9FAFB";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9CA3AF",
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: "18px", height: "18px" }} />
                  ) : (
                    <Eye style={{ width: "18px", height: "18px" }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                height: "48px",
                borderRadius: "12px",
                border: "none",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "4px",
                opacity: loading ? 0.7 : 1,
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#b91c1c")}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#dc2626")}
            >
              {loading ? (
                <Loader2 style={{ width: "20px", height: "20px", animation: "spin 1s linear infinite" }} />
              ) : (
                <LogIn style={{ width: "20px", height: "20px" }} />
              )}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "12px", color: "#9CA3AF", marginTop: "24px" }}>
          &copy; {new Date().getFullYear()} PESKOP. All rights reserved.
        </p>
      </div>
    </div>
  );
}
