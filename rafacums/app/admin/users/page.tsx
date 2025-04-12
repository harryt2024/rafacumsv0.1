// app/admin/users/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { UserRole } from '@prisma/client'; // Import UserRole enum

// Define a type for the user data we expect from the API
interface DisplayUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role: UserRole;
  createdAt: string; // Dates usually come as strings from JSON
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Filter State ---
  const [filters, setFilters] = useState({
      username: '',
      email: '',
      role: '', // Empty string means 'All Roles'
  });

  // --- Add Form state ---
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // --- Define some basic styles for the Add User Form ---
  const inputStyle: React.CSSProperties = {
      border: '1px solid #ccc',
      padding: '8px 10px',
      borderRadius: '4px',
      // ***** UPDATED FONT SIZE *****
      fontSize: '0.9rem', // Made font smaller
      marginLeft: '5px',
  };

  const labelStyle: React.CSSProperties = {
      marginRight: '5px',
      display: 'inline-block',
      width: '80px',
      textAlign: 'right',
      // ***** ADDED FONT SIZE *****
      fontSize: '0.9rem', // Make label font size match inputs
  };

   const buttonStyle: React.CSSProperties = {
      padding: '10px 15px',
      border: '1px solid #007bff',
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '4px',
      cursor: 'pointer',
      // ***** UPDATED FONT SIZE *****
      fontSize: '0.9rem', // Made font smaller
      marginLeft: '85px', // Align with inputs based on label width + margin
      marginTop: '10px',
  };

   const disabledButtonStyle: React.CSSProperties = {
       ...buttonStyle, // Inherit base styles (including updated font size)
       backgroundColor: '#a0cfff',
       borderColor: '#a0cfff',
       cursor: 'not-allowed',
   };

  // --- Fetch users function (updated for filtering) ---
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value) { queryParams.append(key, value); }
    });
    const queryString = queryParams.toString();

    try {
      const response = await fetch(`/api/users?${queryString}`);
      if (!response.ok) {
        const errData = await response.json().catch(()=>({}));
        throw new Error(errData.message || `Failed to fetch users: ${response.statusText}`);
      }
      const data: DisplayUser[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users initially and when filters change
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // --- Filter Input Handler ---
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Handle adding a new user
  const handleAddUser = async (e: FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsAdding(true);
     setAddError(null);
     try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: newUsername, password: newPassword, name: newName || undefined,
                email: newEmail || undefined, role: newRole,
            }),
        });
         const result = await response.json();
        if (!response.ok) { throw new Error(result.message || `Error: ${response.statusText}`); }
        setNewUsername(''); setNewPassword(''); setNewName(''); setNewEmail(''); setNewRole(UserRole.USER);
        fetchUsers();
     } catch (err: any) { setAddError(err.message); } finally { setIsAdding(false); }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string, userIdentifier: string | null) => {
     if (!confirm(`Are you sure you want to delete user: ${userIdentifier ?? userId}?`)) { return; }
     setError(null);
     try {
          const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
          if (!response.ok && response.status !== 204) {
                const result = await response.json().catch(() => ({}));
                throw new Error(result.message || `Error: ${response.statusText}`);
           }
          fetchUsers();
     } catch (err: any) { setError(err.message); }
  };


  // --- Render Logic ---
  if (error && users.length === 0 && !isLoading) return <p>Error loading users: {error}</p>;

  return (
    <div>
      <h1>User Management</h1>

       {/* --- Styled Add User Form Section --- */}
       <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
           <h2>Add New User</h2>
           <form onSubmit={handleAddUser}>
               <div style={{ marginBottom: '12px' }}>
                   <label htmlFor="add-username" style={labelStyle}>Username*:</label>
                   <input id="add-username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={inputStyle} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                   <label htmlFor="add-password" style={labelStyle}>Password*:</label>
                   <input id="add-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={inputStyle} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                   <label htmlFor="add-name" style={labelStyle}>Name:</label>
                   <input id="add-name" type="text" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                   <label htmlFor="add-email" style={labelStyle}>Email:</label>
                   <input id="add-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} />
               </div>
               <div style={{ marginBottom: '12px' }}>
                   <label htmlFor="add-role" style={labelStyle}>Role*:</label>
                   <select id="add-role" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} required style={inputStyle}>
                       <option value={UserRole.USER}>User</option>
                       <option value={UserRole.ADMIN}>Admin</option>
                   </select>
               </div>
               <button
                  type="submit"
                  disabled={isAdding}
                  style={isAdding ? disabledButtonStyle : buttonStyle} // Apply conditional button style
               >
                   {isAdding ? 'Adding...' : 'Add User'}
               </button>
               {addError && <p style={{ color: 'red', marginLeft: '85px' }}>{addError}</p>}
           </form>
       </div>

      {/* --- User List --- */}
      <h2>Existing Users</h2>
      {error && <p style={{ color: 'red' }}>Operation Error: {error}</p>}

      {/* --- Filter Controls --- */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          {/* Filter inputs also use inputStyle now */}
          <input type="text" name="username" placeholder="Filter by Username..." value={filters.username} onChange={handleFilterChange} style={inputStyle} />
          <input type="text" name="email" placeholder="Filter by Email..." value={filters.email} onChange={handleFilterChange} style={inputStyle} />
          <select name="role" value={filters.role} onChange={handleFilterChange} style={inputStyle}>
               <option value="">All Roles</option>
               <option value={UserRole.USER}>User</option>
               <option value={UserRole.ADMIN}>Admin</option>
           </select>
      </div>

      {/* --- User Table with Increased Spacing --- */}
      {isLoading ? <p>Loading users...</p> : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ccc', background: '#f8f8f8' }}>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Username</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Role</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Created At</th>
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                      <tr><td colSpan={7} style={{ padding: '10px 15px', textAlign: 'center' }}>No users found matching filters.</td></tr>
                  ) : (
                      users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '10px 15px' }}>{user.id}</td>
                          <td style={{ padding: '10px 15px' }}>{user.username ?? 'N/A'}</td>
                          <td style={{ padding: '10px 15px' }}>{user.name ?? 'N/A'}</td>
                          <td style={{ padding: '10px 15px' }}>{user.email ?? 'N/A'}</td>
                          <td style={{ padding: '10px 15px' }}>{user.role}</td>
                          <td style={{ padding: '10px 15px' }}>{new Date(user.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '10px 15px' }}>
                            <button
                              onClick={() => handleDeleteUser(user.id, user.username ?? user.email ?? null)}
                              style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            >
                                Delete
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
          </div>
      )}
    </div>
  );
}