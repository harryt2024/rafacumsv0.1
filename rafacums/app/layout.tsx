// app/layout.tsx
import React from "react";
// Make sure these import paths are correct for your project structure
import SessionWrapper from './components/sessionwrapper';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './globals.css';

// Your site metadata
export const metadata = {
  title: 'RAFAC Uniform System',
  description: 'Uniform Management Dashboard',
};

// The RootLayout component (should be a Server Component - no 'use client')
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* SessionProvider wrapper - likely needed for useSession in child components */}
        <SessionWrapper>
          {/* Main container using Flexbox for Sidebar + Main Area layout */}
          {/* Added id="app-container" for potential print styling */}
          <div id="app-container" style={{ display: 'flex', height: '100vh' }}>

            {/* Wrapper div for Sidebar with ID for CSS print targeting */}
            <div id="sidebar">
              <Sidebar />
            </div>

            {/* Container for Header and Main Page Content */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}> {/* Prevents potential double scrollbars */}

              {/* Wrapper div for Header with ID for CSS print targeting */}
              <div id="app-header">
                <Header />
              </div>

              {/* Main content area where page children will be rendered */}
              {/* Added id="main-content" for potential print styling */}
              <main id="main-content" style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}> {/* Allows content to scroll */}
                {children}
              </main>

            </div>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}