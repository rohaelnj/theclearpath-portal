// app/verify-email/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { applyActionCode, checkActionCode, type Auth } from 'firebase/auth';
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
      const target = '/portal';
      setTimeout(() => window.location.replace(target), 800);
    } catch {
      setError('Verification failed. The code may have been used already.');
      setStatus('error');
    }
  }

  return (
    <section className="mx-auto w-full max-w-md py-12">
      <h1 className="text-3xl font-semibold text-neutral-900">Verify your email</h1>
      <p className="mt-2 text-sm text-neutral-600">
        {status === 'idle' && 'Missing verification code.'}
        {status === 'checking' && 'Checking code…'}
        {status === 'ready' && `Code looks valid for ${email || 'this account'}.`}
        {status === 'verifying' && 'Verifying…'}
        {status === 'done' && 'Verified. Redirecting to your portal…'}
        {status === 'error' && error}
      </p>

      <label htmlFor="code" className="mt-6 block text-sm font-medium text-neutral-700">
        Verification code
      </label>
      <input
        id="code"
        value={code}
        onChange={(e) => setCode(e.target.value.trim())}
        className="mt-1 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-neutral-900 outline-none transition focus:border-[#1F4142] focus:ring-2 focus:ring-[#1F4142]/20"
        placeholder="Paste oobCode here"
      />

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => handleCheck(code)}
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          disabled={!code || status === 'checking' || status === 'verifying'}
        >
          Check
        </button>
        <button
          type="button"
          onClick={handleVerify}
          className="rounded-full bg-[#1F4142] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          disabled={status !== 'ready'}
        >
          Verify now
        </button>
      </div>

      <p className="mt-6 text-sm text-neutral-600">
        Didn’t get the email?{' '}
        <a className="font-medium text-[#1F4142] underline" href="/verify-email/sent">
          Resend verification
        </a>
      </p>
    </section>
  );
}
