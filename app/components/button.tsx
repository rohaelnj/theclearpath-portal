'use client';

import { useState } from 'react';
import { auth } from '@/firebaseClient';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

export default function GoogleButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async (): Promise<void> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Try popup first (works on Vercel, no /__/auth/handler needed)
      await signInWithPopup(auth, provider);
      // success → auth state listener on the page will route to /portal
    } catch (e: any) {
      // Fallback to redirect for browsers that block popups
      if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/cancelled-popup-request') {
        await signInWithRedirect(auth, provider);
      } else {
        console.error('Google sign-in failed:', e);
        alert('Google sign-in failed. Please try again.');
        setLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      style={{
        width: '100%',
        padding: '0.85rem',
        backgroundColor: '#fff',
        color: '#1F4142',
        fontWeight: 'bold',
        border: '1.5px solid #1F4142',
        borderRadius: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '1.05rem',
        marginTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.7rem',
        opacity: loading ? 0.7 : 1,
      }}
    >
      <img src="/google.svg" alt="Google Logo" style={{ width: 24, height: 24 }} />
      {loading ? 'Please wait…' : 'Continue with Google'}
    </button>
  );
}
