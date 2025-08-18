'use client';
import { useEffect, useState } from 'react';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, applyActionCode } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

function getFirebaseAuth() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export default function VerifyEmailPage() {
  const [msg, setMsg] = useState('Verifying your email…');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('oobCode');
    if (!code) {
      setMsg('Missing verification code.');
      return;
    }
    const auth = getFirebaseAuth();
    applyActionCode(auth, code)
      .then(() => {
        setMsg('Email verified. Redirecting…');
        window.location.replace('/login?verified=1');
      })
      .catch((err) => {
        setMsg(`Verification failed: ${err?.message || 'unknown error'}`);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center text-base">{msg}</div>
    </main>
  );
}
