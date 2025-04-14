// middleware.ts
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import { UserRole } from "@prisma/client"; // Adjust import if needed

export default withAuth(
  // `withAuth` augments `req` with `nextauth.token` object
  function middleware(req: NextRequestWithAuth) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // --- Protect /admin routes for ADMIN only ---
    if (pathname.startsWith("/admin")) {
      // If user is not an admin (or not logged in), redirect/rewrite
      if (token?.role !== UserRole.ADMIN) {
         return NextResponse.rewrite(new URL("/forbidden", req.url)); // Or redirect elsewhere
      }
    }

    // --- For /uniform routes, the basic login check is enough ---
    // The `authorized` callback below ensures the user is logged in.
    // No additional role checks needed here for /uniform based on your request.
    // If accessing /uniform requires login, the authorized callback handles it.

    // Allow the request to proceed if no specific rule has blocked it
    // (withAuth handles this automatically if we don't return a response)
  },
  {
    callbacks: {
      // This runs *first*. If it returns false (user not logged in),
      // it redirects to the signIn page *before* the main middleware function runs.
      authorized: ({ token, req }) => {
        // !!token checks if the user is logged in at all.
        // This protects all routes listed in the matcher below that don't have
        // more specific checks in the main middleware function above.
        return !!token;
      },
    },
    // Optional: Define login page if not default
    // pages: {
    //   signIn: '/auth/signin',
    // }
  }
);

// Apply middleware to the routes you want to protect
export const config = {
  matcher: [
    // Routes listed here require login (checked by callbacks.authorized)
    // Specific role checks are done inside the main middleware function above
    "/uniform/:path*",   // Requires login
    "/admin/:path*",     // Requires login AND Admin role (checked above)
    "/dashboard/:path*",
    // Add other protected routes
  ],
};