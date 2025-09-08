'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthClient } from '@/lib/firebase';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const auth = getAuthClient();
        const unsub = onAuthStateChanged(auth, (u) => {
            const ok = !!u && (u.emailVerified || u.providerData.some((p) => p.providerId === 'google.com'));
            if (!ok) {
                if (pathname !== '/login') router.replace('/login');
            } else {
                setReady(true);
            }
        });
        return () => unsub();
    }, [router, pathname]);

    if (!ready) {
        return (
            <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui' }}>
                <span>Loading…</span>
            </div>
        );
    }
    return <>{children}</>;
}
