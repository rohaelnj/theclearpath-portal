'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getAuth,
  applyActionCode,
  reload,
  type Auth,
  type User,
} from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function auth(): Auth {
  const app = getApps().length ? getApp() : initializeApp(cfg);
  return getAuth(app);
}

export default function VerifyEmailPage() {
  const [msg, setMsg] = useState('Verifying your email…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    if (!code) { setMsg('Missing verification code.'); return; }

    const a = auth();
    applyActionCode(a, code)
      .then(async () => {
        const u: User | null = a.currentUser;
        if (u) await reload(u);
        setMsg('Verified. Taking you to your dashboard…');
        window.location.replace('/portal'); // direct to dashboard
      })
      .catch((e) => {
        setMsg(`Verification failed: ${e instanceof Error ? e.message : String(e)}`);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center text-base">{msg}</div>
    </main>
  );
}
