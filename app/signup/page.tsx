'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { persistSessionCookie } from '@/lib/session';
import GoogleSignInButton from '../../components/GoogleSignInButton';

const MIN_PASSWORD = 8;

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    setBusy(true);
    try {
      const auth = getAuthClient();
      const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const trimmedName = name.trim();
      if (trimmedName) {
        await updateProfile(user, { displayName: trimmedName });
      }

      await persistSessionCookie(user);

      void fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email ?? '',
          displayName: trimmedName || user.email?.split('@')[0] || '',
        }),
      }).catch(() => {});

      window.location.replace('/portal');
    } catch (err: any) {
      const message = err?.code as string | undefined;
      if (message === 'auth/email-already-in-use') {
        setError('This email is already registered. Try signing in instead.');
      } else if (message === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (message === 'auth/weak-password') {
        setError('Password must be at least 8 characters.');
      } else {
        setError('Signup failed. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl py-12">
      <div className="space-y-3 text-center md:text-left">
        <h1 className="text-4xl font-semibold text-neutral-900">Start your clear path</h1>
        <p className="text-sm text-neutral-600">
          A few quick details and you’ll have a private space to begin therapy on your schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="name" className="text-sm font-medium text-neutral-700">
            Full name
          </label>
          <input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="How should we address you?"
            autoComplete="name"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="md:col-span-2 rounded-full bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <GoogleSignInButton className="mt-6" />

      <p className="mt-8 text-sm text-neutral-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
