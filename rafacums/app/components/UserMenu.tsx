// app/components/UserMenu.tsx
'use client'; // This component uses hooks, must be a client component

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link'; // Optional: for other links like Profile

// Basic styles - replace with your actual CSS/Tailwind classes
const userMenuStyle: React.CSSProperties = {
    position: 'relative', // Needed for absolute positioning of dropdown
};

const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
};

const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%', // Position below the button
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    minWidth: '150px',
    zIndex: 10, // Ensure it's above other content
    padding: '5px 0',
};

const dropdownItemStyle: React.CSSProperties = {
    display: 'block',
    padding: '8px 15px',
    color: '#333',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
};

const dropdownButtonStyle: React.CSSProperties = {
     ...dropdownItemStyle, // Inherit styles
     background: 'none',
     border: 'none',
     cursor: 'pointer',
     width: '100%',
     textAlign: 'left',
};


export default function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // Ref for detecting outside clicks

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);


  if (status === 'loading') {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  if (!session) {
    return null; // Don't show anything if not logged in (shouldn't happen on protected pages)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' }); // Redirect to home/login after sign out
  };

  return (
    <div style={userMenuStyle} ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} style={buttonStyle}>
        <span>{session.user?.name || session.user?.email}</span>
        {/* Add an icon like a down arrow/avatar here if desired */}
        <span style={{marginLeft: '5px'}}>▼</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
           {/* Optional: Add other links like Profile */}
           {/* <Link href="/profile" style={dropdownItemStyle} onClick={() => setIsOpen(false)}>Profile</Link> */}
           {/* <hr style={{ margin: '5px 0', border: '0', borderTop: '1px solid #eee'}}/> */}
           <button onClick={handleSignOut} style={dropdownButtonStyle}>
             Sign out
           </button>
        </div>
      )}
    </div>
  );
}