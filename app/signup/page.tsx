'use client';

import React, { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { auth } from '@/firebaseClient';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  getRedirectResult,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
  type UserCredential,
} from 'firebase/auth';

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  try { return JSON.stringify(e); } catch { return String(e); }
}

export default function Signup(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [gLoading, setGLoading] = useState<boolean>(false);

  useEffect(() => {
    // Ensure session persists locally across redirects (Google)
    setPersistence(auth, browserLocalPersistence).catch(() => { });

    // If already signed in, go to dashboard
    const unsub = onAuthStateChanged(auth, (u) => { if (u) router.replace('/portal'); });

    // Complete Google redirect sign-in
    getRedirectResult(auth)
      .then((res: UserCredential | null) => { if (res?.user) router.replace('/portal'); })
      .catch(() => { });

    return () => unsub();
  }, [router]);

  const handleGoogle = async (): Promise<void> => {
    try {
      setError('');
      setGLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (e: unknown) {
      setError('Google sign-in failed: ' + errMsg(e));
      setGLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
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
      if (trimmedName) await updateProfile(user, { displayName: trimmedName });

      // Send Firebase verification email that targets /verify-email
      await sendEmailVerification(user, {
        url: 'https://portal.theclearpath.ae/verify-email',
        handleCodeInApp: true,
      });

      setSuccess('Account created. Check your email to verify.');
      // Stay signed in so /verify-email can take user straight to /portal
      setTimeout(() => router.push('/verify-email/sent'), 1200);
    } catch (e: unknown) {
      const msg = errMsg(e);
      if (msg.includes('auth/email-already-in-use')) {
        setError('This email is already registered. Please sign in instead.');
        setTimeout(() => router.push('/login'), 1200);
      } else if (msg.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password must be at least 8 characters.');
      } else {
        setError('Signup failed: ' + msg);
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

      <form onSubmit={handleSignup}
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
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.35rem', borderRadius: 6, border: '1px solid #aaa', fontSize: '1rem' }}
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
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.35rem', borderRadius: 6, border: '1px solid #aaa', fontSize: '1rem' }}
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
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.35rem', borderRadius: 6, border: '1px solid #aaa', fontSize: '1rem' }}
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

        <button
          type="button"
          onClick={handleGoogle}
          disabled={gLoading}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '0.85rem',
            backgroundColor: gLoading ? '#999' : '#FFFFFF',
            color: '#1F4142',
            fontWeight: 700,
            border: '1px solid #1F4142',
            borderRadius: 6,
            cursor: gLoading ? 'not-allowed' : 'pointer',
            fontSize: '1.05rem',
          }}
        >
          {gLoading ? 'Please wait…' : 'Continue with Google'}
        </button>
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
