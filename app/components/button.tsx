// app/components/button.tsx
'use client';

import React, { useState } from 'react';
import { auth } from '@/firebaseClient';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';

export default function GoogleButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);

  async function onClick(): Promise<void> {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      try {
        await signInWithPopup(auth, provider);
        // success → onAuthStateChanged in page redirects to /portal
      } catch (e: any) {
        const code = e?.code ?? '';
        if (code === 'auth/account-exists-with-different-credential') {
          alert('This email already uses password login. Log in with email once, then link Google from your profile.');
          return;
        }
        if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw e;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        padding: '0.85rem',
        backgroundColor: '#FFFFFF',
        color: '#1F4142',
        fontWeight: 700,
        border: '1px solid #1F4142',
        borderRadius: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1.05rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
      }}
      aria-label="Continue with Google"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.088 32.66 28.905 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.156 7.957 3.043l5.657-5.657C33.578 6.053 28.973 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.57 16.009 18.879 12 24 12c3.059 0 5.842 1.156 7.957 3.043l5.657-5.657C33.578 6.053 28.973 4 24 4 15.317 4 7.95 9.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c4.829 0 9.257-1.852 12.566-4.879l-5.799-4.898C28.905 36 24 36 24 36c-4.874 0-8.993-3.284-10.39-7.734l-6.566 5.06C9.55 39.333 16.249 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303C33.88 32.66 29.5 36 24 36v8c8 0 14.5-5.333 15.889-12.25 0 0 2.111-10.027 3.722-11.667z" />
      </svg>
      {loading ? 'Please wait…' : 'Continue with Google'}
    </button>
  );
}
