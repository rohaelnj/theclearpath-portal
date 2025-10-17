'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function VerifySent(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-6 py-12 text-center">
      <div className="flex w-full max-w-lg flex-col items-center space-y-6 rounded-3xl bg-white p-8 shadow-lg">
        <Image src="/logo.png" alt="The Clear Path logo" width={140} height={140} className="h-24 w-auto" priority />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-primary">Check your email</h1>
          <p className="mx-auto max-w-md text-base text-neutral-600">
            We sent a verification email. Open it and tap the confirm button to activate your account.
          </p>
          <p className="text-sm text-neutral-500">
            Didn’t get it? Check spam, or{' '}
            <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
              try again
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
