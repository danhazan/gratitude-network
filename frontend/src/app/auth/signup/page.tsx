'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Signup logic here
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Signup failed. Please try again.";
        toast.error(errorMessage); // Display error to user
        console.error("Signup failed:", errorMessage);
        return; // Stop execution here
      }

      toast.success("Signup successful! Please check your email for verification."); // Display success to user
      console.log("Signup successful! Please check your email for verification.");
      setUsername(""); // Clear form fields on success
      setEmail("");
      setPassword("");
      router.push("/auth/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Signup error: ${error.message}`); // Display error to user
        console.error("Signup error:", error.message);
      } else {
        toast.error("An unknown error occurred during signup."); // Display error to user
        console.error("An unknown error occurred during signup.", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f7fafc'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        margin: '0 1rem'
      }}>
        {/* Blue Navigation Bar */}
        <div style={{
          backgroundColor: '#3182ce',
          padding: '1rem',
          borderRadius: '8px 8px 0 0',
          marginBottom: '0'
        }}>
          <Link href="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            Gratitude Network
          </Link>
        </div>

        {/* Form Container */}
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            Sign Up
          </h1>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#4a5568' }}>
            <p>Or sign up with:</p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem', gap: '0.75rem' }}>
              <button style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} disabled>
                Google
              </button>
              <button style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '6px' }} disabled>
                Facebook
              </button>
            </div>
          </div>
          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#4a5568', fontSize: '0.875rem' }}>
            Already have an account?{" "}
            <Link href="/auth/login">
              <span style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '500' }}>
                Login
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}