'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { signInWithCustomToken } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase';

function normalizeNext(raw: string | null): Route {
  const fallback: Route = '/portal';
  if (!raw) return fallback;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return fallback;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return path.replace(/[/\\]+/g, '/') as Route;
}

export default function CallbackClient(): React.ReactElement {
  const router = useRouter();
  const params = useSearchParams();
  const [err, setErr] = useState<string>('');

  useEffect(() => {
    const token = params.get('t');
    const next = normalizeNext(params.get('next'));
    const fail: Route = '/login?verify=fail';
    if (!token) { router.replace(fail); return; }

    (async () => {
      try {
        const auth = getAuthClient();
        await signInWithCustomToken(auth, token);
        router.replace(next);
      } catch (e) {
        setErr((e as Error).message);
        router.replace(fail);
      }
    })();
  }, [params, router]);

  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui' }}>
      <p>{err ? 'Verification failed.' : 'Finishing sign-in…'}</p>
    </main>
  );
}
