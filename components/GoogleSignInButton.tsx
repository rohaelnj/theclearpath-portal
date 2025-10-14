'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, signOut } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { persistSessionCookie, clearSessionCookie } from '@/lib/session';

type Props = {
  className?: string;
};

export default function GoogleSignInButton({ className = '' }: Props): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const auth = getAuthClient();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const cred = await signInWithPopup(auth, provider);
      const info = getAdditionalUserInfo(cred);

      if (info?.isNewUser) {
        try {
          await cred.user.delete();
        } catch {
          /* noop */
        }
        await signOut(auth);
        await clearSessionCookie();
        router.replace(`/signup?email=${encodeURIComponent(cred.user.email || '')}&from=google`);
        return;
      }

      await persistSessionCookie(cred.user);
      window.location.replace('/portal');
    } catch (err) {
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
      className={`flex w-full items-center justify-center gap-3 rounded-full border border-[#1F4142] px-5 py-3 text-sm font-medium text-[#1F4142] transition hover:bg-[#1F4142]/5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <img src="/google.svg" alt="Google" className="h-6 w-6" />
      {loading ? 'Please wait…' : 'Continue with Google'}
    </button>
  );
}
