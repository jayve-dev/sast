import { NextRequest, NextResponse } from "next/server";
import { auth } from "../lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Allow auth routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public create endpoints used by auth callbacks (e.g. /api/create/user)
  if (pathname.startsWith("/api/create")) {
    return NextResponse.next();
  }

  // Get session
  const session = await auth();
  const isLoggedIn = !!session?.user;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/signin",
    "/auth/signin",
    "/auth/error",
    "/signup",
    "/auth/signup",
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Root path handling
  if (pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If user is not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is logged in and trying to access public route (like signin)
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin-only route protection
  const adminRoutes = ["/(admin)/dashboard"];
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // API route protection
  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!isLoggedIn) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Admin API routes
    if (pathname.startsWith("/api/admin") && session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
    "/api/:path*",
  ],
};
