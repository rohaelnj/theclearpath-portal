// app/verify-email/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { applyActionCode, checkActionCode, type Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { getAuthClient } from '@/lib/firebase';

// Initialize client auth only in effects to avoid server rendering issues

function extractOobCode(): string {
  try {
    const sp = new URLSearchParams(window.location.search);
    const direct = sp.get('oobCode');
    if (direct) return direct;
    const cont = sp.get('continueUrl');
    if (cont) {
      try {
        const inner = new URL(cont);
        const nested = inner.searchParams.get('oobCode');
        if (nested) return nested;
      } catch { }
    }
  } catch { }
  return '';
}

export default function VerifyEmailPage(): React.ReactElement {
  const router = useRouter();
  const [auth, setAuth] = React.useState<Auth | null>(null);
  const [code, setCode] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'checking' | 'ready' | 'verifying' | 'done' | 'error'>('idle');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    setAuth(getAuthClient());
    const c = extractOobCode();
    if (!c) {
      setStatus('idle');
      return;
    }
    setCode(c);
    void handleCheck(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCheck(c: string) {
    setError('');
    setStatus('checking');
    try {
      const a = auth ?? getAuthClient();
      const info = await checkActionCode(a, c);
      const em = (info.data?.email as string | undefined) ?? '';
      setEmail(em);
      setStatus('ready');
    } catch {
      setError('Invalid or expired verification link.');
      setStatus('error');
    }
  }

  async function handleVerify() {
    if (!code) return;
    setError('');
    setStatus('verifying');
    try {
      const a = auth ?? getAuthClient();
      await applyActionCode(a, code);

      if (email) {
        fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }).catch(() => void 0);
      }

      setStatus('done');
      const target: Route = '/portal';
      setTimeout(() => router.replace(target), 800);
    } catch {
      setError('Verification failed. The code may have been used already.');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Verify your email</h1>

        <p className="mb-4 text-sm text-gray-600">
          {status === 'idle' && 'Missing verification code.'}
          {status === 'checking' && 'Checking code…'}
          {status === 'ready' && `Code looks valid for ${email || 'your account'}.`}
          {status === 'verifying' && 'Verifying…'}
          {status === 'done' && 'Verified. Redirecting to your portal…'}
          {status === 'error' && error}
        </p>

        <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-900">
          Verification code
        </label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          className="mb-3 w-full rounded-xl border border-gray-300 px-3 py-2"
          placeholder="Paste oobCode here"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleCheck(code)}
            className="rounded-2xl bg-gray-200 px-4 py-2 text-gray-900"
            disabled={!code || status === 'checking' || status === 'verifying'}
          >
            Check
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="rounded-2xl bg-[#1F4142] px-4 py-2 text-white disabled:opacity-50"
            disabled={status !== 'ready'}
          >
            Verify now
          </button>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          Didn’t get the email? <a className="underline" href="/verify-email/sent">Resend verification</a>
        </p>
      </div>
    </main>
  );
}
