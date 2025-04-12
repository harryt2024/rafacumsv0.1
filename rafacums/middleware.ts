// middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { UserRole } from "@prisma/client"; // Import UserRole enum

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req: NextRequestWithAuth) {
    // Get token role - ensure it matches the augmented JWT type from authOptions
    const userRole = req.nextauth.token?.role as UserRole | undefined;

    // Redirect admin users trying to access non-admin pages? (Optional)
    // if (req.nextUrl.pathname === "/" && userRole === UserRole.ADMIN) {
    //    return NextResponse.redirect(new URL("/admin/users", req.url))
    // }

    // Protect admin routes
    if (req.nextUrl.pathname.startsWith("/admin") && userRole !== UserRole.ADMIN) {
      // Redirect non-admins trying to access admin pages to a different page or show denied
       console.warn(`Forbidden: Non-admin user ${req.nextauth.token?.email} tried to access ${req.nextUrl.pathname}`);
       return NextResponse.rewrite(new URL("/forbidden", req.url)); // Or redirect to home/login
    }

     // Protect dashboard for any logged-in user (example)
    if (req.nextUrl.pathname.startsWith("/dashboard") && !req.nextauth.token) {
         // This is usually handled by default by withAuth, but explicit check is fine
         return NextResponse.redirect(new URL("/api/auth/signin?callbackUrl="+req.nextUrl.pathname, req.url));
    }

    // Allow request to proceed if no rules matched
    // return NextResponse.next(); // Implicitly handled by withAuth if nothing returned
  },
  {
    callbacks: {
      // authorized callback determines if the user is allowed to access the matched routes
      // It runs BEFORE the main middleware function above if pages are NOT configured.
      // If pages ARE configured, it only runs if the user is already authenticated.
      authorized: ({ req, token }) => {
        // !!token checks if user is logged in at all
        // For specific route checks inside middleware, use the main function above
        return !!token;
      }
    },
     // Optional: Customize pages if using default behavior is not desired
     // pages: {
     //   signIn: "/auth/signin",
     //   error: "/auth/error",
     // },
  }
);

// Apply middleware to protected routes
export const config = {
  matcher: [
    "/admin/:path*",   // Protect all admin routes
    "/dashboard/:path*", // Example: protect dashboard for logged-in users
    /* Add other paths that require authentication or specific roles */
    // '/api/users/:path*', // Protect API routes if needed (often handled within route) - careful not to block auth callbacks
  ],
};