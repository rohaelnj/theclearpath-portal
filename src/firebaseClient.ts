'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import firebaseConfig from '@/firebaseConfig';

type FirebaseClient = { app: FirebaseApp; auth: Auth };

let cached: FirebaseClient | null = null;

/** Call only inside Client Components. */
export function getFirebaseClient(): FirebaseClient {
    if (typeof window === 'undefined') {
        throw new Error('getFirebaseClient() used on the server');
    }
    if (cached) return cached;

    if (
        !firebaseConfig.apiKey ||
        !firebaseConfig.authDomain ||
        !firebaseConfig.projectId ||
        !firebaseConfig.appId
    ) {
        throw new Error('Missing Firebase client env. Set NEXT_PUBLIC_FIREBASE_* in Vercel Preview.');
    }

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    cached = { app, auth };
    return cached;
}

export function getAuthClient(): Auth {
    return getFirebaseClient().auth;
}
