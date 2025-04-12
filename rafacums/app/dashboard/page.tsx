// app/dashboard/page.tsx
import React, { JSX } from "react";
import { getServerSession } from "next-auth/next";
// Adjust the path based on your actual file structure
// It might be just 'app/api/auth/[...nextauth]/route' if this file is directly under app/
// Or '../api/auth/[...nextauth]/route' if it's like app/dashboard/page.tsx
import { authOptions } from "../api/auth/[...nextauth]/route"; // Ensure this path is correct
import { redirect } from 'next/navigation';
import type { Session } from "next-auth"; // Import Session type

export default async function Dashboard(): Promise<JSX.Element> {
  // session will be Session | null
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
     // Redirect to the sign-in page, passing the current page as the callback URL
     redirect('/api/auth/signin?callbackUrl=/dashboard');
  }

  // Type assertion or checks might be needed if accessing optional user properties
  const userName = session.user?.name ?? session.user?.email ?? 'User';
  // const userId = (session.user as any)?.id ?? 'Unknown ID'; // Example if you added id

  return (
    <div>
      <h1>Protected Dashboard</h1>
      <p>Welcome, {userName}!</p>
      {/* <p>Your ID: {userId}</p> */}
      <p>This content is only visible to logged-in users.</p>
      {/* Add your dashboard components here */}
    </div>
  );
}