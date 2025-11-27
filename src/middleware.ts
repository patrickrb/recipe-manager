import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

// Force Node.js runtime instead of Edge runtime
export const runtime = 'nodejs';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Public routes that don't require authentication
  const publicRoutes = ["/auth/signin", "/auth/signup", "/auth/error"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Allow all NextAuth API routes to pass through
  const isNextAuthRoute = pathname.startsWith("/api/auth/");
  const isPublicApiRoute = pathname === "/api/auth/signup" || isNextAuthRoute;

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute && !isPublicApiRoute) {
    // Allow viewing recipes (GET requests to /api/recipes)
    if (pathname.startsWith("/api/recipes") && req.method === "GET") {
      return NextResponse.next();
    }

    // Allow the root path for viewing recipes
    if (pathname === "/") {
      return NextResponse.next();
    }

    // Allow viewing individual recipe pages
    if (pathname.startsWith("/recipe/") && req.method === "GET") {
      return NextResponse.next();
    }

    // Redirect to sign in for other protected routes
    if (pathname.startsWith("/api/") || pathname.startsWith("/profile") || pathname.startsWith("/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Protect super admin routes
  const superAdminRoutes = ["/admin/users", "/api/admin"];
  const isSuperAdminRoute = superAdminRoutes.some((route) => pathname.startsWith(route));

  if (isSuperAdminRoute && session) {
    const isSuperAdmin = session.user.role === UserRole.SUPER_ADMIN;
    if (!isSuperAdmin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
