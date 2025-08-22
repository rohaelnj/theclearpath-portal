'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, applyActionCode, reload, onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function auth() {
  const app = getApps().length ? getApp() : initializeApp(cfg);
  return getAuth(app);
}

export default function VerifyEmailPage() {
  const [msg, setMsg] = useState('Verifying your email…');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('oobCode');
    const continueUrl = searchParams.get('continueUrl') || '/portal';
    
    if (!code) { setMsg('Missing verification code.'); return; }

    const a = auth();
    applyActionCode(a, code)
      .then(async () => {
        setMsg('Email verified! Sending welcome email...');
        
        // Wait for auth state to update
        const unsubscribe = onAuthStateChanged(a, async (user) => {
          if (user) {
            await reload(user);
            
            // Send welcome email
            try {
              await fetch('/api/send-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: user.uid }),
              });
            } catch (err) {
              console.error('Failed to send welcome email:', err);
            }
            
            setMsg('Welcome! Taking you to your dashboard...');
            setTimeout(() => router.replace(continueUrl), 1500);
            unsubscribe();
          } else {
            setMsg('Verified. Please sign in.');
            setTimeout(() => router.replace('/login?verified=1'), 1500);
            unsubscribe();
          }
        });
      })
      .catch((e) => {
        const t = e instanceof Error ? e.message : String(e);
        setMsg(`Verification failed: ${t}`);
      });
  }, [searchParams, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center text-base">{msg}</div>
    </main>
  );
}
