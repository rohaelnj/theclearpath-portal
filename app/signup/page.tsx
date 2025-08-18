'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { auth } from '@/firebaseClient';
import { createUserWithEmailAndPassword, getRedirectResult, updateProfile } from 'firebase/auth';

import GoogleButton from '../components/button';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Complete Google redirect if arriving from it
  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) router.push('/portal');
      })
      .catch(() => { });
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Your password needs to be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      const trimmedName = name.trim();
      if (trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }

      // Optional: send branded verification email (non-blocking)
      try {
        await fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            displayName: trimmedName || user.email?.split('@')[0] || 'there',
          }),
        });
      } catch { }

      setSuccess('Account created! Please check your email to verify.');
      await auth.signOut();
      setTimeout(() => router.push('/verify-email?status=sent'), 1500);
    } catch (err: any) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in instead.');
        setTimeout(() => router.push('/login'), 1500);
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setError('Password must be at least 8 characters.');
      } else {
        setError('Oops! Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        backgroundColor: '#DFD6C7',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Playfair Display', serif",
        padding: '2rem',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Image src="/logo.png" alt="The Clear Path Logo" width={180} height={180} />
        <h1 style={{ color: '#1F4142', marginTop: '1rem', fontSize: '3rem', fontWeight: 'bold' }}>
          Start Your Journey
        </h1>
        <p style={{ color: '#1F4140', marginTop: '0.75rem', fontSize: '1.25rem', fontWeight: 500 }}>
          This is your first step to becoming the best version of yourself.
        </p>
      </div>

      <form
        onSubmit={handleSignup}
        style={{
          backgroundColor: '#DED4C8',
          padding: '2.25rem',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {success && <p style={{ color: '#1F4142', marginBottom: '1rem', fontWeight: 'bold' }}>{success}</p>}
        {error && <p style={{ color: '#B00020', marginBottom: '1rem', fontWeight: 500 }}>{error}</p>}

        <label style={{ display: 'block', marginBottom: '1rem', color: '#1F4140', fontWeight: 'bold' }}>
          Full name (optional)
          <input
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            autoComplete="name"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.35rem',
              borderRadius: 6,
              border: '1px solid #aaa',   // <-- fixed quotes here
              fontSize: '1rem',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1rem', color: '#1F4140', fontWeight: 'bold' }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.35rem',
              borderRadius: 6,
              border: '1px solid #aaa',
              fontSize: '1rem',
            }}
          />
        </label>

        <label style={{ display: 'block', marginBottom: '1.25rem', color: '#1F4140', fontWeight: 'bold' }}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.35rem',
              borderRadius: 6,
              border: '1px solid #aaa',
              fontSize: '1rem',
            }}
          />
          <small style={{ display: 'block', color: '#666', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Must be at least 8 characters.
          </small>
        </label>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.85rem',
            backgroundColor: loading ? '#999' : '#1F4142',
            color: '#DFD6C7',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: 6,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1.05rem',
            letterSpacing: '0.5px',
          }}
        >
          {loading ? 'Creating Account...' : 'Create My Account'}
        </button>

        <GoogleButton redirectTo="/portal" />
      </form>

      <p style={{ marginTop: '2rem', color: '#1F4140', textAlign: 'center' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#1F4142', fontWeight: 'bold' }}>
          Log in
        </Link>
      </p>
    </main>
  );
}
