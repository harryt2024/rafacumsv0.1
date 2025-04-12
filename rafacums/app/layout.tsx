// app/layout.tsx
import React from "react";
import SessionWrapper from './components/sessionwrapper'; // Assuming this is still wrapping the session
import Sidebar from './components/Sidebar'; // Import Sidebar component
import Header from './components/Header';   // Import Header component
import './globals.css'; // Your global styles

export const metadata = { // Optional: Add metadata
  title: 'RAFAC Uniform System',
  description: 'Uniform Management Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* SessionWrapper provides session context to components inside */}
        <SessionWrapper>
          <div style={{ display: 'flex', height: '100vh' }}> {/* Main Flex Container */}

            {/* Sidebar Component */}
            <Sidebar />

            {/* Main Content Area (Header + Page Content) */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

              {/* Header Component */}
              <Header />

              {/* Page Content */}
              <main style={{ flexGrow: 1, padding: '20px', overflowY: 'auto' }}> {/* Add padding and scroll */}
                {children}
              </main>

            </div>
          </div>
        </SessionWrapper>
      </body>
    </html>
  )
}