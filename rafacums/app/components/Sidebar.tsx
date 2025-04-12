// app/components/Sidebar.tsx
'use client'; // <--- Make it a Client Component

import Link from 'next/link';
import React from 'react';
import { useSession } from 'next-auth/react'; // <--- Import useSession
import { UserRole } from '@prisma/client'; // <--- Import UserRole enum
// import { usePathname } from 'next/navigation'; // Keep if using for active links

// Basic styles - replace with your actual CSS/Tailwind classes
const sidebarStyle: React.CSSProperties = {
  width: '240px', // Example fixed width
  flexShrink: 0, // Prevent shrinking
  backgroundColor: '#f4f4f4', // Example background
  padding: '20px',
  height: '100vh',
  borderRight: '1px solid #e0e0e0',
  overflowY: 'auto', // Add scroll if content overflows
};

const navLinkStyle: React.CSSProperties = {
    display: 'block',
    padding: '10px 15px',
    textDecoration: 'none',
    color: '#333',
    borderRadius: '4px',
    marginBottom: '5px',
};

// Example active style (only works if 'use client' and usePathname are enabled)
// const activeStyle: React.CSSProperties = { /* ... */ };

export default function Sidebar() {
  const { data: session, status } = useSession(); // <--- Get session data
  // const pathname = usePathname(); // Keep if using active links

  // Optional: Show loading state or nothing while session is loading
  // if (status === 'loading') {
  //   return <aside style={sidebarStyle}>Loading Nav...</aside>;
  // }

  return (
    <aside style={sidebarStyle}>
      <h2>RAFAC UMS</h2> {/* Or your logo */}
      <nav>
        {/* Use list for semantics */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li>
            <Link href="/dashboard" style={navLinkStyle /* active link style */}>
                Dashboard
            </Link>
          </li>
          <li>
            <Link href="/uniform" style={navLinkStyle /* active link style */}>
                Uniform Items
            </Link>
          </li>
           <li>
             <Link href="/uniform/add" style={navLinkStyle}>
                 Add Uniform Item
             </Link>
           </li>
           <li>
             <Link href="/uniform/bulk-add" style={navLinkStyle}>
                 Bulk Add Items
             </Link>
           </li>

          {/* --- Conditional Rendering for Admin Link --- */}
          {session?.user?.role === UserRole.ADMIN && (
            <li>
              <Link href="/admin/users" style={navLinkStyle /* active link style */}>
                  Manage Users
              </Link>
            </li>
          )}
          {/* --- End Conditional Rendering --- */}

          {/* Add links to other functions/pages here */}
        </ul>
      </nav>
    </aside>
  );
}