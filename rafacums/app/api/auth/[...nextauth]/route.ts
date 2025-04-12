import NextAuth, { NextAuthOptions, User as NextAuthUser, Account, Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { PrismaClient, User as PrismaUser, UserRole } from "@prisma/client"; // Import Prisma types
import { prisma } from "@/lib/prisma"; // Adjust path to your prisma instance if needed
import bcrypt from "bcrypt";

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
export const authOptions: NextAuthOptions = {
  // Using JWT strategy for sessions is common, especially with Credentials
  session: {
    strategy: "jwt",
  },

  providers: [
    // GitHub Provider Configuration
    GithubProvider({
      clientId: process.env.GITHUB_ID!, // Ensure GITHUB_ID is in .env.local
      clientSecret: process.env.GITHUB_SECRET!, // Ensure GITHUB_SECRET is in .env.local
    }),

    // Google Provider Configuration
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!, // Ensure GOOGLE_CLIENT_ID is in .env.local
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // Ensure GOOGLE_CLIENT_SECRET is in .env.local
    }),

    // Credentials Provider Configuration
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // Fields expected from your login form
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<NextAuthUser | null> { // Return type aligns with NextAuthUser
        // Validate input
        if (!credentials?.username || !credentials.password) {
          console.error("Authorize Error: Missing username or password");
          // Throwing an error here can redirect user to an error page
          // throw new Error("Please enter both username and password.");
          return null; // Returning null shows a generic error message on the client
        }

        try {
          // Find user in the database using Prisma
          const user = await prisma.user.findUnique({
            where: { username: credentials.username },
          });

          // If user not found or doesn't have a password (e.g., OAuth only user)
          if (!user || !user.hashedPassword) {
            console.warn(`Authorize Warning: User not found or no password for username: ${credentials.username}`);
            return null;
          }

          // Validate password using bcrypt
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.hashedPassword
          );

          if (!isValidPassword) {
            console.warn(`Authorize Warning: Invalid password attempt for username: ${credentials.username}`);
            return null;
          }

          console.log(`Authorize Success: User authenticated: ${user.username}`);
          // Return user object that matches the augmented NextAuth 'User' type
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role, // Include the role for the JWT callback
          };

        } catch (error) {
            console.error("Authorize Error: Database or bcrypt error", error);
            return null; // Return null on any unexpected error
        }
      }
    })
  ],

  callbacks: {
    // This callback is called whenever a JWT is created or updated.
    // The `user` object is only passed the first time JWT is created (on sign in).
    async jwt({ token, user, account, profile }) {
      // If 'user' exists, it means it's the sign-in event (either OAuth or Credentials).
      // Persist the necessary user info (id, role) to the token.
      if (user) {
         token.id = user.id;
         token.role = user.role;
         // Persist other fields from user obj if needed (name, email, image are often added by default by providers)
         token.name = user.name;
         token.email = user.email;
         token.picture = user.image;
      }
       // Add access_token to the token right after signin if using OAuth provider
      if (account?.access_token) {
        //  token.accessToken = account.access_token // Uncomment if you need provider access token
      }
      return token; // The token is encrypted and stored in a cookie
    },

    // This callback is called whenever a session is checked.
    // It receives the token from the `jwt` callback.
    async session({ session, token }) {
      // Make the user ID and role available on the session object client-side.
      // Ensure the types align with the augmented Session interface.
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // Assign other properties from token back to session user if needed
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // Map picture back to image
        // (session as any).accessToken = token.accessToken; // Example: expose access token
      }
      return session; // The session object is returned to the client
    }
  },

  // Specify URLs for custom pages if needed (optional)
  // pages: {
  //   signIn: '/auth/signin',
  //   signOut: '/auth/signout',
  //   error: '/auth/error', // Error code passed in query string as ?error=
  //   verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
  //   newUser: null // If set, new users will be directed here on first sign in
  // },

  // Database adapter (optional if using JWT strategy, needed for database sessions)
  // adapter: PrismaAdapter(prisma), // You'd need to install @next-auth/prisma-adapter

  // Secret used to sign and encrypt tokens/cookies
  secret: process.env.NEXTAUTH_SECRET, // Ensure NEXTAUTH_SECRET is in .env.local

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',

};

// Export the handler for GET and POST requests
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };