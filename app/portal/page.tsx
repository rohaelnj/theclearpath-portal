'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthClient } from '@/lib/firebase';

export default function Portal() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth.currentUser) {
      window.location.replace('/login');
      return;
    }
    setEmail(auth.currentUser.email ?? null);
  }, []);

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-neutral-900">Welcome{email ? `, ${email}` : ''}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">Upcoming</h2>
          <p className="mt-2 text-neutral-700">No upcoming sessions.</p>
          <Link
            href="/plans"
            className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Book a session
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900">Profile</h2>
          <p className="mt-2 text-neutral-700">Manage your details &amp; preferences.</p>
          <Link
            href="#"
            className="mt-4 inline-block rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-50"
          >
            Edit profile
          </Link>
        </div>
      </div>
    </section>
  );
}
