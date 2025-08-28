'use client';

import React, { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  getAdditionalUserInfo,
  signOut,
} from 'firebase/auth';
import { auth } from '@/firebaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import GoogleButton from '../components/button';

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { if (u) router.replace('/portal'); });

    (async () => {
      try {
        const res = await getRedirectResult(auth);
        if (!res) return;

        const info = getAdditionalUserInfo(res);
        const em = res.user.email ?? '';

        if (info?.isNewUser) {
          try { await res.user.delete(); } catch { }
          await signOut(auth);
          setError('Please sign up first.');
          router.replace(`/signup?email=${encodeURIComponent(em)}&from=google`);
          return;
        }

        router.replace('/portal');
      } catch (e: any) {
        const code = e?.code as string | undefined;
        if (code === 'auth/account-exists-with-different-credential') {
          setError('This email is registered with a different sign-in method. Use email/password, then link Google from settings.');
        } else if (code === 'auth/unauthorized-domain') {
          setError('This domain is not authorized for Google sign-in.');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      }
    })();

    return () => unsub();
  }, [router]);

  function mapError(code?: string): string {
    switch (code) {
      case 'auth/user-not-found': return 'No account found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Incorrect password. Please try again.';
      case 'auth/invalid-email': return 'Please enter a valid email address.';
      case 'auth/too-many-requests': return 'Too many attempts. Try again later.';
      default: return 'Something went wrong. Please try again.';
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!user.emailVerified) {
        const displayName = user.displayName || (user.email ? user.email.split('@')[0] : '') || '';
        void fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email || '', displayName }),
        });
        router.replace('/verify-email/sent');
        return;
      }
      router.push('/portal');
    } catch (err) {
      const code = (err as { code?: string })?.code;
      setError(mapError(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        backgroundColor: '#DFD6C7',
        minHeight: '100vh',
        fontFamily: "'Playfair Display', serif",
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <Image src="/logo.png" alt="The Clear Path logo" width={100} height={100} priority />
      </div>

      <h1 style={{ color: '#1F4142', fontSize: '2.1rem', marginBottom: '1rem', textAlign: 'center' }}>
        Log In to Your Account
      </h1>

      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 400 }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#1F4142',
            color: '#DFD6C7',
            border: 'none',
            borderRadius: 6,
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 10,
            fontSize: '1.06rem',
          }}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '6px 0 10px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#ddd' }} />
          <span style={{ margin: '0 14px', color: '#444', fontWeight: 700, fontSize: '1.08rem', letterSpacing: '0.5px' }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        </div>

        <GoogleButton />

        <div style={{ marginTop: '0.8rem', textAlign: 'right' }}>
          <a href="/forgot-password" style={{ fontSize: 14, color: '#1F4142', textDecoration: 'underline' }}>
            Forgot password?
          </a>
        </div>

        {error && <p style={{ marginTop: '1rem', color: '#B00020', textAlign: 'center' }}>{error}</p>}
      </form>

      <p style={{ marginTop: '2.2rem', color: '#1F4140' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#1F4142', fontWeight: 'bold' }}>
          Sign up
        </Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: 6,
  border: '1px solid #ccc',
  fontSize: '1rem',
};
