'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';
import { persistSessionCookie, clearSessionCookie } from '@/lib/session';

function normalizeNext(raw: string | null): string {
  const fallback = '/portal';
  if (!raw) return fallback;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return fallback;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path.replace(/[/\\]+/g, '/');
}

export default function CallbackClient(): React.ReactElement {
  const params = useSearchParams();
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const token = params.get('t');
    const next = normalizeNext(params.get('next'));
    const fallback = '/login?verify=fail';
    if (!token) {
      window.location.replace(fallback);
      return;
    }

    (async () => {
      try {
        const auth = getAuthClient();
        await signInWithCustomToken(auth, token);
        if (auth.currentUser) {
          await persistSessionCookie(auth.currentUser);
        }
        window.location.replace(next);
      } catch (e) {
        setErr((e as Error).message);
        await clearSessionCookie();
        window.location.replace(fallback);
      }
    })();
  }, [params]);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui' }}>
      <p>{err ? 'Verification failed.' : 'Finishing sign-in…'}</p>
    </main>
  );
}
