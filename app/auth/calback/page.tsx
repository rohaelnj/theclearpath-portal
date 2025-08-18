'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/firebaseClient';

export default function AuthCallback(): React.ReactElement {
    const sp = useSearchParams();
    const router = useRouter();
    const [err, setErr] = useState<string>('');

    useEffect(() => {
        const t = sp.get('t');
        const next = sp.get('next') || '/portal';
        if (!t) {
            router.replace('/login?verify=fail');
            return;
        }
        (async () => {
            try {
                await signInWithCustomToken(auth, t);
                router.replace(next);
            } catch (e) {
                setErr((e as Error).message);
                router.replace('/login?verify=fail');
            }
        })();
    }, [sp, router]);

    return (
        <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui' }}>
            <p>Finishing sign-in…</p>
        </main>
    );
}
