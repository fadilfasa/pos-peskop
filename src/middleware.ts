import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes
  if (pathname === "/login" || pathname === "/") {
    if (isLoggedIn) {
      const redirectUrl =
        role === "ADMIN" ? "/admin" :
        role === "FRANCHISE_OWNER" ? "/franchise" :
        "/rider";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Admin routes — only ADMIN
  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const redirectUrl = role === "FRANCHISE_OWNER" ? "/franchise" : "/rider";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Franchise routes — only FRANCHISE_OWNER
  if (pathname.startsWith("/franchise") && role !== "FRANCHISE_OWNER") {
    const redirectUrl = role === "ADMIN" ? "/admin" : "/rider";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Rider routes — only RIDER
  if (pathname.startsWith("/rider") && role !== "RIDER") {
    const redirectUrl = role === "ADMIN" ? "/admin" : "/franchise";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  // Tambahkan header anti-cache agar browser selalu cek session terbaru
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
