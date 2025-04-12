// app/components/Header.tsx
import React from 'react';
import UserMenu from './UserMenu'; // Import the UserMenu component

// Basic styles - replace with your actual CSS/Tailwind classes
const headerStyle: React.CSSProperties = {
    height: '60px', // Example fixed height
    backgroundColor: '#ffffff', // Example background
    borderBottom: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end', // Push user menu to the right
    padding: '0 20px',
    flexShrink: 0, // Prevent shrinking
};

export default function Header() {
  return (
    <header style={headerStyle}>
      {/* You could add breadcrumbs or page titles here */}
      <UserMenu /> {/* Render the user menu */}
    </header>
  );
}