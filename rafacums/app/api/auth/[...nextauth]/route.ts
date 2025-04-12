import NextAuth, { NextAuthOptions, User as NextAuthUser, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaClient, User as PrismaUser, UserRole } from "@prisma/client"; // Import Prisma types
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma instance if needed
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/authOptions";

// Augment NextAuth types to include id and role
// IMPORTANT: This declaration merging should happen in a place that's definitely loaded,
// often people create a next-auth.d.ts file in the project root or types folder,
// but placing it here before usage also works.
declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's database id. */
      id: string;
      /** The user's role. */
      role: UserRole;
      // Include other default properties if needed by merging with DefaultSession['user']
      // For simplicity here, we directly list needed fields, assuming NextAuthUser covers base ones
    } & NextAuthUser; // Keep original fields like name, email, image (NextAuthUser is imported)
  }

  // Extend the User type returned by the authorize callback and used in JWT callback
  interface User { // Remove 'extends NextAuthUser'
    // Add all properties expected on the User object returned by authorize/callbacks
    id: string;
    role: UserRole;
    // Explicitly include optional properties from the base NextAuthUser
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    /** User's database id */
    id: string;
    /** User's role */
    role: UserRole;
    // Keep other potential JWT fields added by providers or callbacks
    // name?: string | null;
    // email?: string | null;
    // picture?: string | null;
    // accessToken?: string; // Example if adding access token
  }
}


// Define the authentication options

// Export the handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };