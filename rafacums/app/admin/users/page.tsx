// app/admin/users/page.tsx
'use client';

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { UserRole } from '@prisma/client'; // Import UserRole enum

// Define DisplayUser type
interface DisplayUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role: UserRole;
  createdAt: string; // Dates usually come as strings from JSON
}

// Define type for the data being edited in the modal form
interface EditFormData {
    name: string;
    username: string;
    email: string;
    password?: string; // Password is optional for update
    role: UserRole;
}


export default function AdminUserManagement() {
  // --- Existing State ---
  const [users, setUsers] = useState<DisplayUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // General page/fetch error
  const [filters, setFilters] = useState({ username: '', email: '', role: '' });
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const [addError, setAddError] = useState<string | null>(null); // Error specific to adding
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // --- NEW State for Edit Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<DisplayUser | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
      name: '', username: '', email: '', password: '', role: UserRole.USER
  });
  const [editError, setEditError] = useState<string | null>(null); // Error specific to editing
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  // --- End New State ---


  // --- Reusable Styles ---
  const inputStyle: React.CSSProperties = {
      border: '1px solid #ccc', padding: '8px 10px', borderRadius: '4px',
      fontSize: '0.9rem', marginLeft: '5px', width: 'calc(100% - 95px)' // Adjust width relative to label
  };
  const labelStyle: React.CSSProperties = {
      marginRight: '5px', display: 'inline-block', width: '80px',
      textAlign: 'right', fontSize: '0.9rem', verticalAlign: 'top' // Align top for textarea
  };
   const buttonStyle: React.CSSProperties = {
      padding: '10px 15px', border: '1px solid #007bff', backgroundColor: '#007bff',
      color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem',
      marginLeft: '85px', marginTop: '10px',
  };
   const disabledButtonStyle: React.CSSProperties = {
       ...buttonStyle, backgroundColor: '#a0cfff', borderColor: '#a0cfff', cursor: 'not-allowed',
   };
   const modalOverlayStyle: React.CSSProperties = { /* ... as before ... */
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000,
   };
   const modalContentStyle: React.CSSProperties = { /* ... as before ... */
        backgroundColor: 'white', padding: '25px 30px', borderRadius: '8px',
        minWidth: '400px', maxWidth: '600px', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
   };
    const modalCloseButtonStyle: React.CSSProperties = { /* ... as before ... */
         position: 'absolute', top: '10px', right: '15px', background: 'none',
         border: 'none', fontSize: '1.8rem', cursor: 'pointer', color: '#666', lineHeight: 1
    };
  // --- End Styles ---


  // --- Data Fetching ---
  const fetchUsers = async () => { /* ... same fetch logic as before ... */
     setIsLoading(true); setError(null); const queryParams = new URLSearchParams();
     Object.entries(filters).forEach(([key, value]) => { if (value) { queryParams.append(key, value); }});
     const queryString = queryParams.toString();
     try {
         const response = await fetch(`/api/users?${queryString}`);
         if (!response.ok) { const errData = await response.json().catch(()=>({})); throw new Error(errData.message || `Failed: ${response.statusText}`); }
         const data: DisplayUser[] = await response.json(); setUsers(data);
     } catch (err: any) { setError(err.message); setUsers([]); } finally { setIsLoading(false); }
   };
  useEffect(() => { fetchUsers(); }, [filters]);


  // --- Handlers ---
  const handleFilterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAddUser = async (e: FormEvent<HTMLFormElement>) => { /* ... same add logic as before ... */
      e.preventDefault(); setIsAdding(true); setAddError(null);
      try {
         const response = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newUsername, password: newPassword, name: newName || undefined, email: newEmail || undefined, role: newRole }), });
         const result = await response.json(); if (!response.ok) { throw new Error(result.message || `Error: ${response.statusText}`); }
         setNewUsername(''); setNewPassword(''); setNewName(''); setNewEmail(''); setNewRole(UserRole.USER); fetchUsers(); alert('User added!');
      } catch (err: any) { setAddError(err.message); } finally { setIsAdding(false); }
  };

  const handleDeleteUser = async (userId: string, userIdentifier: string | null) => { /* ... same delete logic as before ... */
      if (!confirm(`Delete user: ${userIdentifier ?? userId}?`)) { return; } setError(null);
      try {
           const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
           if (!response.ok && response.status !== 204) { const result = await response.json().catch(() => ({})); throw new Error(result.message || `Error: ${response.statusText}`); }
           fetchUsers(); alert('User deleted.');
      } catch (err: any) { setError(err.message); }
  };

  const handleEditClick = (user: DisplayUser) => { /* ... opens modal, sets state ... */
      setEditingUser(user);
      setEditFormData({ name: user.name ?? '', username: user.username ?? '', email: user.email ?? '', password: '', role: user.role });
      setEditError(null); setIsModalOpen(true);
  };

  const handleModalClose = () => setIsModalOpen(false); // No need to clear editingUser here, gets cleared on next open

  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setEditFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => { /* ... sends PATCH request ... */
      e.preventDefault(); if (!editingUser) return; setIsUpdating(true); setEditError(null);
      const updatePayload: Partial<EditFormData> = {};
      if (editFormData.name !== (editingUser.name ?? '')) updatePayload.name = editFormData.name;
      if (editFormData.username !== (editingUser.username ?? '')) updatePayload.username = editFormData.username;
      if (editFormData.email !== (editingUser.email ?? '')) updatePayload.email = editFormData.email;
      if (editFormData.password) updatePayload.password = editFormData.password;
      if (editFormData.role !== editingUser.role) updatePayload.role = editFormData.role;

      if (Object.keys(updatePayload).length === 0) { setEditError("No changes detected."); setIsUpdating(false); return; }

      try {
          const response = await fetch(`/api/users/${editingUser.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatePayload) });
          const result = await response.json(); if (!response.ok) { throw new Error(result.message || `Error: ${response.statusText}`); }
          handleModalClose(); fetchUsers(); alert('User updated successfully!');
      } catch (err: any) { setEditError(err.message); } finally { setIsUpdating(false); }
  };
  // --- End Handlers ---


  // --- Render Logic ---
  if (error && users.length === 0 && !isLoading) return <p>Error loading users: {error}</p>;

  return (
    <div>
      <h1>User Management</h1>

       {/* --- Add User Form Section --- */}
       <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
           <h2>Add New User</h2>
           <form onSubmit={handleAddUser}>
                {/* Input divs using labelStyle and inputStyle */}
               <div style={{ marginBottom: '12px' }}><label htmlFor="add-username" style={labelStyle}>Username*:</label><input id="add-username" type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={inputStyle} /></div>
               <div style={{ marginBottom: '12px' }}><label htmlFor="add-password" style={labelStyle}>Password*:</label><input id="add-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={inputStyle} /></div>
               <div style={{ marginBottom: '12px' }}><label htmlFor="add-name" style={labelStyle}>Name:</label><input id="add-name" type="text" value={newName} onChange={e => setNewName(e.target.value)} style={inputStyle} /></div>
               <div style={{ marginBottom: '12px' }}><label htmlFor="add-email" style={labelStyle}>Email:</label><input id="add-email" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={inputStyle} /></div>
               <div style={{ marginBottom: '12px' }}><label htmlFor="add-role" style={labelStyle}>Role*:</label><select id="add-role" value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} required style={inputStyle}><option value={UserRole.USER}>User</option><option value={UserRole.ADMIN}>Admin</option></select></div>
               <button type="submit" disabled={isAdding} style={isAdding ? disabledButtonStyle : buttonStyle}>{isAdding ? 'Adding...' : 'Add User'}</button>
               {addError && <p style={{ color: 'red', marginLeft: '85px' }}>{addError}</p>}
           </form>
       </div>

      {/* --- User List Section --- */}
      <h2>Existing Users</h2>
      {error && <p style={{ color: 'red' }}>Operation Error: {error}</p>}
      {/* Filter Controls */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <input type="text" name="username" placeholder="Filter Username..." value={filters.username} onChange={handleFilterChange} style={{...inputStyle, marginLeft: 0}} />
          <input type="text" name="email" placeholder="Filter Email..." value={filters.email} onChange={handleFilterChange} style={{...inputStyle, marginLeft: 0}}/>
          <select name="role" value={filters.role} onChange={handleFilterChange} style={{...inputStyle, marginLeft: 0}}> <option value="">All Roles</option> <option value={UserRole.USER}>User</option> <option value={UserRole.ADMIN}>Admin</option> </select>
      </div>
      {/* User Table */}
      {isLoading ? <p>Loading users...</p> : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead> <tr style={{ borderBottom: '2px solid #ccc', background: '#f8f8f8' }}> {/* ... th elements with padding ... */}
                    <th style={{ padding: '10px 15px', textAlign: 'left' }}>ID</th><th style={{ padding: '10px 15px', textAlign: 'left' }}>Username</th> <th style={{ padding: '10px 15px', textAlign: 'left' }}>Name</th><th style={{ padding: '10px 15px', textAlign: 'left' }}>Email</th><th style={{ padding: '10px 15px', textAlign: 'left' }}>Role</th><th style={{ padding: '10px 15px', textAlign: 'left' }}>Created At</th><th style={{ padding: '10px 15px', textAlign: 'left' }}>Actions</th>
                 </tr></thead>
                <tbody>
                  {users.length === 0 ? (<tr><td colSpan={7} style={{ padding: '10px 15px', textAlign: 'center' }}>No users found matching filters.</td></tr>) : (
                      users.map((user) => (
                        <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                          {/* ... td elements with padding ... */}
                          <td style={{ padding: '10px 15px' }}>{user.id}</td><td style={{ padding: '10px 15px' }}>{user.username ?? 'N/A'}</td><td style={{ padding: '10px 15px' }}>{user.name ?? 'N/A'}</td><td style={{ padding: '10px 15px' }}>{user.email ?? 'N/A'}</td><td style={{ padding: '10px 15px' }}>{user.role}</td><td style={{ padding: '10px 15px' }}>{new Date(user.createdAt).toLocaleString()}</td>
                          <td style={{ padding: '10px 15px' }}>
                            {/* Edit Button */}
                            <button onClick={() => handleEditClick(user)} style={{ marginRight: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }} > Edit </button>
                             {/* Delete Button */}
                            <button onClick={() => handleDeleteUser(user.id, user.username ?? user.email ?? null)} style={{ color: 'red', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }} > Delete </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
          </div>
      )}


      {/* --- Edit User Modal --- */}
      {isModalOpen && editingUser && (
          <div style={modalOverlayStyle}>
              <div style={modalContentStyle}>
                   <button onClick={handleModalClose} style={modalCloseButtonStyle} title="Close">&times;</button>
                   <h2>Edit User: {editingUser.username ?? editingUser.email ?? editingUser.id}</h2>
                   <form onSubmit={handleUpdateUser}>
                        {/* Inputs using labelStyle and inputStyle */}
                        <div style={{ marginBottom: '12px' }}>
                             <label htmlFor="edit-name" style={labelStyle}>Name:</label>
                             <input id="edit-name" type="text" name="name" value={editFormData.name} onChange={handleEditFormChange} style={inputStyle}/>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                             <label htmlFor="edit-username" style={labelStyle}>Username:</label>
                             <input id="edit-username" type="text" name="username" value={editFormData.username} onChange={handleEditFormChange} style={inputStyle}/>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label htmlFor="edit-email" style={labelStyle}>Email:</label>
                            <input id="edit-email" type="email" name="email" value={editFormData.email} onChange={handleEditFormChange} style={inputStyle}/>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                             <label htmlFor="edit-password" style={labelStyle}>New Password:</label>
                             <input id="edit-password" type="password" name="password" placeholder="Leave blank to keep unchanged" value={editFormData.password ?? ''} onChange={handleEditFormChange} style={inputStyle}/> {/* Controlled input needs value or defaultValue */}
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                             <label htmlFor="edit-role" style={labelStyle}>Role*:</label>
                             <select id="edit-role" name="role" value={editFormData.role} onChange={handleEditFormChange} required style={inputStyle}>
                                 <option value={UserRole.USER}>User</option>
                                 <option value={UserRole.ADMIN}>Admin</option>
                            </select>
                        </div>
                        <button type="submit" disabled={isUpdating} style={isUpdating ? disabledButtonStyle : buttonStyle}>
                            {isUpdating ? 'Saving...' : 'Save Changes'}
                        </button>
                         {editError && <p style={{ color: 'red', marginLeft: '85px' }}>{editError}</p>}
                    </form>
              </div>
          </div>
      )}
      {/* --- End Edit User Modal --- */}

    </div> // End main div
  );
}