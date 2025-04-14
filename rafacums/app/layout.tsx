// app/layout.tsx
import React from "react";
import SessionWrapper from './components/sessionwrapper'; // Assuming path is correct
import Sidebar from './components/Sidebar';           // Assuming path is correct
import Header from './components/Header';             // Assuming path is correct
import './globals.css';                               // Assuming path is correct

// Your metadata (ensure this is present and correct)
export const metadata = {
  title: 'RAFAC Uniform System',
  description: 'Uniform Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This should remain a Server Component (no 'use client' at the top)
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {/* Main container for Flexbox layout, added ID for potential print styling */}
          <div id="app-container" style={{ display: 'flex', height: '100vh' }}>

            {/* Sidebar: Add id="sidebar" */}
            {/* Make sure your Sidebar component applies this id to its root element, */}
            {/* or wrap it like: <div id="sidebar"><Sidebar /></div> */}
            <Sidebar id="sidebar" />

            {/* Container for Header and Main Content */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}> {/* Added overflow: hidden */}

              {/* Header: Add id="app-header" */}
              {/* Make sure your Header component applies this id to its root element, */}
              {/* or wrap it like: <div id="app-header"><Header /></div> */}
              <Header id="app-header" />

              {/* Main Content Area: Add id="main-content" */}
              <main id="main-content" style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}> {/* Ensure scrolling is possible */}
                {children}
              </main>

            </div>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}