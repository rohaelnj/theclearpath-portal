'use client';

import Image from 'next/image';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, signOut } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { persistSessionCookie, clearSessionCookie } from '@/lib/session';
import { sanitizeRedirectPath } from '@/lib/urls';

type Props = {
  className?: string;
  redirectPath?: string | null;
};

export default function GoogleSignInButton({ className = '', redirectPath }: Props): React.ReactElement {
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

      const targetPath = sanitizeRedirectPath(redirectPath ?? null, '/portal');

      if (info?.isNewUser) {
        try {
          await cred.user.delete();
        } catch {
          /* noop */
        }
        await signOut(auth);
        await clearSessionCookie();
        const params = new URLSearchParams();
        if (cred.user.email) {
          params.set('email', cred.user.email);
        }
        params.set('from', 'google');
        params.set('redirect', targetPath);
        router.replace(`/signup?${params.toString()}`);
        return;
      }

      await persistSessionCookie(cred.user);
      window.location.replace(targetPath);
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
      className={`flex w-full items-center justify-center gap-3 rounded-full border border-primary px-5 py-3 text-sm font-medium text-primary transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Image src="/google.svg" alt="Google" width={24} height={24} />
      {loading ? 'Please wait…' : 'Continue with Google'}
    </button>
  );
}
