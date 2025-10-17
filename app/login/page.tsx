'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { persistSessionCookie, clearSessionCookie } from '@/lib/session';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import { sanitizeRedirectPath } from '@/lib/urls';

function mapError(code?: string): string {
  switch (code) {
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rawRedirect, setRawRedirect] = useState<string | null>(null);
  const redirectPath = useMemo(() => sanitizeRedirectPath(rawRedirect, '/portal'), [rawRedirect]);
  const signupHref = useMemo(() => {
    if (!rawRedirect) return '/signup';
    return { pathname: '/signup', query: { redirect: redirectPath } } as const;
  }, [rawRedirect, redirectPath]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setRawRedirect(params.get('redirect'));
  }, []);

  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await persistSessionCookie(user);
        window.location.replace(redirectPath);
      } else {
        await clearSessionCookie().catch(() => {});
      }
    });
    return () => unsub();
  }, [redirectPath]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const auth = getAuthClient();
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!user.emailVerified) {
        const displayName = user.displayName || user.email?.split('@')[0] || '';
        await clearSessionCookie().catch(() => {});
        void fetch('/api/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email ?? '', displayName }),
        });
        window.location.replace('/verify-email/sent');
        return;
      }

      await persistSessionCookie(user);
      window.location.replace(redirectPath);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
      setError(mapError(typeof code === 'string' ? code : undefined));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-neutral-900">Welcome back</h1>
        <p className="text-sm text-neutral-600">Sign in to continue to your portal.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
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
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:opacity-80">
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-primary px-5 py-3 font-medium text-white transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <GoogleSignInButton className="mt-6" redirectPath={redirectPath} />

      <p className="mt-8 text-sm text-neutral-600">
        New here?{' '}
        <Link href={signupHref} className="font-medium text-primary underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
