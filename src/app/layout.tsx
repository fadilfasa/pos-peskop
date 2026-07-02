import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PESKOP — Pesan Kopi",
  description:
    "Jangan sampai lupa diri, apalagi lupa PESAN KOPI. Platform manajemen penjualan kopi keliling.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              color: "#111827",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            },
          }}
        />
      </body>
    </html>
  );
}
