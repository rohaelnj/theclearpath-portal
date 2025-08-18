'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function VerifySent(): React.ReactElement {
    return (
        <main
            style={{
                backgroundColor: '#DFD6C7',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                padding: '2rem',
                textAlign: 'center',
            }}
        >
            <Image src="/logo.png" alt="The Clear Path Logo" width={140} height={140} />
            <h1 style={{ color: '#1F4142', marginTop: '1rem', fontSize: '2.4rem', fontWeight: 'bold' }}>
                Check your email
            </h1>
            <p style={{ color: '#1F4140', marginTop: '0.75rem', fontSize: '1.15rem', maxWidth: 520 }}>
                We sent a verification email. Open it and click the green button to activate your account.
            </p>
            <div style={{ marginTop: 18, color: '#444' }}>
                Didn’t get it? Check spam, or <Link href="/signup" style={{ color: '#1F4142', fontWeight: 700 }}>try again</Link>.
            </div>
        </main>
    );
}
