// app/layout.tsx
'use client';
import SessionWrapper from './components/sessionwrapper'; // Adjust path if needed
import React from "react";
import './globals.css'; // Example global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  )
}