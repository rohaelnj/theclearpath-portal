'use client';

import { useState } from 'react';
import { auth } from '@/firebaseClient';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

function isMobileSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua);
}

/**
 * Google Sign-In button (popup with redirect fallback).
 * Usage (from app/login or app/signup):  import GoogleButton from '../components/button'
 */
export default function GoogleButton({ redirectTo = '/portal' }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (isMobileSafari()) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
      window.location.replace(redirectTo);
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }
      console.error('Google sign-in failed:', err);
      alert('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
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
