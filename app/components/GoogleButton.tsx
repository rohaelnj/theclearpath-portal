'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebaseClient';
import {
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
    signOut,
} from 'firebase/auth';

type Props = {
    /** Use "login" on /login so brand-new Google users are redirected to /signup */
    mode?: 'login' | 'signup';
};

export default function GoogleButton({ mode = 'login' }: Props): React.ReactElement {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogle = useCallback(async (): Promise<void> => {
        if (loading) return;
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const res = await signInWithPopup(auth, provider);
            const info = getAdditionalUserInfo(res);
            const email = res.user.email ?? '';

            // If clicked from login and Google just created a new user → force sign up first
            if (mode === 'login' && info?.isNewUser) {
                try { await res.user.delete(); } catch { }
                await signOut(auth);
                router.replace(`/signup?email=${encodeURIComponent(email)}&from=google`);
                return;
            }

            // Existing user (or on signup): go to portal
            router.replace('/portal');
        } catch (err) {
            console.error('Google sign-in failed:', err);
            alert('Google sign-in failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [loading, mode, router]);

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
            <img src="/google.svg" alt="Google" style={{ width: 24, height: 24 }} />
            {loading ? 'Please wait…' : 'Continue with Google'}
        </button>
    );
}
