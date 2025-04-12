// app/admin/users/page.tsx
'use client'; // This page needs client-side interactivity

import React, { useState, useEffect, FormEvent } from 'react';
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

  // Form state for adding users
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);


  // Fetch users function
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data: DisplayUser[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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
                username: newUsername,
                password: newPassword,
                name: newName || undefined, // Send undefined if empty
                email: newEmail || undefined, // Send undefined if empty
                role: newRole,
            }),
        });

         const result = await response.json(); // Read body even for errors

        if (!response.ok) {
             throw new Error(result.message || `Error: ${response.statusText}`);
        }

        // Reset form and refresh user list
        setNewUsername('');
        setNewPassword('');
        setNewName('');
        setNewEmail('');
        setNewRole(UserRole.USER);
        await fetchUsers(); // Refresh the list

     } catch (err: any) {
          console.error("Add user error:", err);
          setAddError(err.message);
     } finally {
         setIsAdding(false);
     }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId: string) => {
     if (!confirm('Are you sure you want to delete this user?')) {
         return;
     }
     setError(null); // Clear previous errors

     try {
          const response = await fetch(`/api/users/${userId}`, {
              method: 'DELETE',
          });

           const result = await response.json(); // Read body even for errors

          if (!response.ok) {
               throw new Error(result.message || `Error: ${response.statusText}`);
          }
          // Refresh user list on successful deletion
          await fetchUsers();

     } catch (err: any) {
          console.error("Delete user error:", err);
          setError(err.message); // Show error related to deletion
     }
  };


  if (isLoading) return <p>Loading users...</p>;
  if (error && users.length === 0) return <p>Error loading users: {error}</p>; // Show only loading error if list empty

  return (
    <div>
      <h1>User Management</h1>

       {/* Add User Form */}
       <h2>Add New User</h2>
       <form onSubmit={handleAddUser}>
           <div>
               <label>Username*: <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required /></label>
           </div>
           <div>
               <label>Password*: <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></label>
           </div>
           <div>
               <label>Name: <input type="text" value={newName} onChange={e => setNewName(e.target.value)} /></label>
           </div>
           <div>
               <label>Email: <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></label>
           </div>
           <div>
               <label>Role*:
                   <select value={newRole} onChange={e => setNewRole(e.target.value as UserRole)} required>
                       <option value={UserRole.USER}>User</option>
                       <option value={UserRole.ADMIN}>Admin</option>
                   </select>
               </label>
           </div>
           <button type="submit" disabled={isAdding}>
               {isAdding ? 'Adding...' : 'Add User'}
           </button>
           {addError && <p style={{ color: 'red' }}>{addError}</p>}
       </form>

      <hr style={{margin: '2rem 0'}} />

      {/* User List */}
      <h2>Existing Users</h2>
      {error && <p style={{ color: 'red' }}>Operation Error: {error}</p>} {/* Show general errors */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username ?? 'N/A'}</td>
              <td>{user.name ?? 'N/A'}</td>
              <td>{user.email ?? 'N/A'}</td>
              <td>{user.role}</td>
              <td>{new Date(user.createdAt).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}