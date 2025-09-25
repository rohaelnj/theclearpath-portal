'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';

export function useRequireVerified() {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const auth = getAuthClient();
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) { router.replace('/login'); return; }
            user.reload()
                .then(() => {
                    const isEmailPwd = user.providerData.some(p => p.providerId === 'password');
                    if (isEmailPwd && !user.emailVerified) {
                        router.replace('/verify-email'); return;
                    }
                    setReady(true);
                })
                .catch(() => router.replace('/login'));
        });
        return () => unsub();
    }, [router]);

    return ready;
}

