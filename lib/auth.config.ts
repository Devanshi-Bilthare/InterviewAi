import type { NextAuthConfig } from "next-auth";

const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

/** Public routes logged-in users may still visit (e.g. password reset from email) */
const loggedInPublicExceptions = ["/reset-password"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );
}

function isProtectedRoute(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/interview") ||
    pathname.startsWith("/progress") ||
    pathname.startsWith("/coding") ||
    pathname.startsWith("/resume") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/profile")
  );
}

function getRoleRedirect(role: string | undefined) {
  return role === "admin" ? "/admin" : "/dashboard";
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const role = auth?.user?.role;

      if (isProtectedRoute(pathname)) {
        if (!isLoggedIn) {
          return false;
        }

        if (pathname.startsWith("/admin") && role !== "admin") {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }

        if (pathname.startsWith("/dashboard") && role === "admin") {
          return Response.redirect(new URL("/admin", nextUrl));
        }

        return true;
      }

      if (isLoggedIn && isPublicRoute(pathname) && pathname !== "/") {
        if (loggedInPublicExceptions.includes(pathname)) {
          return true;
        }
        return Response.redirect(new URL(getRoleRedirect(role), nextUrl));
      }

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;
