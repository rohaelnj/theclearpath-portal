'use client';

import { useEffect, useState } from 'react';

type ApiHealth = { ok: boolean; error?: string };

export default function HealthPage() {
  const [api, setApi] = useState<ApiHealth | null>(null);

  useEffect(() => {
    fetch('/api/admin-health', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: ApiHealth) => setApi(data))
      .catch(() => setApi({ ok: false, error: 'request_failed' }));
  }, []);

  const clientOk =
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID &&
    !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

  return (
    <div className="space-y-4 bg-white p-6 font-sans text-sm text-neutral-700 shadow-sm md:rounded-2xl">
      <h1 className="text-xl font-semibold text-neutral-900">Health check</h1>

      <ul className="space-y-2 leading-relaxed">
        <li>
          Client env present (public) — <strong>{clientOk ? 'OK ✅' : 'Missing ❌'}</strong>
        </li>
        <li>
          Admin init (server) —{' '}
          <strong>
            {api == null ? 'Checking…' : api.ok ? 'OK ✅' : `Fail ❌ (${api.error || 'request_failed'})`}
          </strong>
        </li>
      </ul>

      <p className="text-neutral-500">
        This checks only <code>NEXT_PUBLIC_*</code> vars on the client and that the Admin SDK initializes on the server.
      </p>
    </div>
  );
}
