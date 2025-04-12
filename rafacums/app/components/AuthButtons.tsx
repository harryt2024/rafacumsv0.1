// Example snippet for a login form component (e.g., components/CredentialsForm.tsx)
'use client';
import { signIn } from 'next-auth/react';
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Use App Router's router

export default function CredentialsForm() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                redirect: false, // Prevent auto-redirect, handle manually
                username: username,
                password: password,
            });

            setIsLoading(false);

            if (result?.error) {
                // Error messages often come back in result.error
                // Based on authorize returning null
                setError('Invalid username or password.'); // Customize error message
                console.error("SignIn Error:", result.error);
            } else if (result?.ok) {
                // Sign-in successful
                console.log('Sign in successful');
                // Redirect to dashboard or intended page
                router.push('/dashboard'); // Or use callbackUrl if provided
                router.refresh(); // Refresh server components
            } else {
                 // Handle other potential issues, though less common
                setError('An unknown error occurred during sign in.');
             }

        } catch (err) { // Catch unexpected errors during the signIn call itself
             setIsLoading(false);
             console.error("Credentials Sign In Exception:", err);
             setError('An unexpected error occurred.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h3>Sign In with Credentials</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div>
                <label>Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </label>
            </div>
            <div>
                <label>Password:
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
    );
}