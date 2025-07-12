'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic here
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.detail || "Login failed. Please check your credentials.";
        toast.error(errorMessage); // Display error to user
        console.error("Login failed:", errorMessage);
        setPassword(""); // Clear password on failed attempt
        return; // Stop execution here
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      await login(data.access_token); // Await the login function from AuthContext
      toast.success("Login successful!"); // Display success to user
      console.log("Login successful!");
      router.push("/feed");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Login error: ${error.message}`); // Display error to user
        console.error("Login error:", error.message);
      } else {
        toast.error("An unknown error occurred during login."); // Display error to user
        console.error("An unknown error occurred during login.", error);
      }
      setPassword(""); // Clear password on any error
    } finally {
      // setLoading(false);
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
          <a href="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            fontSize: '1.25rem'
          }}>
            Gratitude Network
          </a>
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
            Login
          </h1>

          <form onSubmit={handleSubmit}>
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
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Login
            </button>
          </form>
          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#4a5568' }}>
            <p>Or login with:</p>
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
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup">
              <span style={{ color: '#3182ce', textDecoration: 'none', fontWeight: '500' }}>
                Sign Up
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}