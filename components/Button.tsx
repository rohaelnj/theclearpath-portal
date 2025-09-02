'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebaseClient';
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  signOut,
} from 'firebase/auth';

export default function GoogleButton(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const cred = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(cred);

      // If user clicked Google from *Login* but account doesn’t exist yet:
      if (info?.isNewUser) {
        try { await cred.user.delete(); } catch { }
        await signOut(auth);
        router.replace(`/signup?email=${encodeURIComponent(cred.user.email || '')}&from=google`);
        return;
      }

      router.replace('/portal');
    } catch (err) {
      console.error('Google sign-in failed:', err);
      alert('Google sign-in failed. Please try again.');
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
