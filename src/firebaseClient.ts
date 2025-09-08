'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import config from '@/firebaseConfig';

type FirebaseClient = { app: FirebaseApp; auth: Auth };

let cached: FirebaseClient | null = null;

/** Call only in Client Components. */
export function getFirebaseClient(): FirebaseClient {
    if (typeof window === 'undefined') {
        throw new Error('getFirebaseClient() used on the server');
    }
    if (cached) return cached;
    const app = getApps().length ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    cached = { app, auth };
    return cached;
}

export function getAuthClient(): Auth {
    return getFirebaseClient().auth;
}
