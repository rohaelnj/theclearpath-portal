'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebaseClient';
import { getRedirectResult, onAuthStateChanged, type UserCredential } from 'firebase/auth';

export default function AuthCallback() {
    const router = useRouter();
    const [msg, setMsg] = useState('Finishing sign-in…');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.replace('/portal');
        });

        const run = async () => {
            try {
                const result: UserCredential | null = await getRedirectResult(auth);
                if (result?.user) {
                    setMsg('Signed in. Redirecting…');
                    router.replace('/portal');
                    return;
                }
                if (auth.currentUser) {
                    setMsg('Session found. Redirecting…');
                    router.replace('/portal');
                    return;
                }
                setMsg('No session found. Returning to login…');
                router.replace('/login');
            } catch (e) {
                console.error('Redirect error:', e);
                setMsg('Sign-in failed. Returning to login…');
                router.replace('/login');
            }
        };

        run();
        return () => unsub();
    }, [router]);

    return <div className="p-6 text-center">{msg}</div>;
}
