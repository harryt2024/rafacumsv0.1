// components/UserInfoClient.tsx
'use client'

import { useSession } from 'next-auth/react';
import React, { JSX } from 'react';

export default function UserInfoClient(): JSX.Element | null {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Loading session...</p>;
  }

  if (status === "authenticated") {
    // Access user data safely using optional chaining
    const userName = session.user?.name ?? 'No name provided';
    const userEmail = session.user?.email ?? 'No email provided';
    // const userId = (session.user as any)?.id ?? 'No ID found'; // If you added custom ID

    return (
        <div>
            <h3>Client Component Info:</h3>
            <p>Signed in as: {userEmail}</p>
            <p>Name: {userName}</p>
            {/* <p>ID: {userId}</p> */}
        </div>
    );
  }

  // status === "unauthenticated"
  return <p>You are not signed in (Client Component).</p>;
}