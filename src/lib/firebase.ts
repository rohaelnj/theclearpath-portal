// src/lib/firebase.ts
// Client-only Firebase helpers (never call on the server)

import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import firebaseConfig from '@/firebaseConfig';

function ensureBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('getAuthClient() used on the server');
  }
}

/** Get (or init) the client Firebase App */
export function getFirebaseAppClient(): FirebaseApp {
  ensureBrowser();
  const { initializeApp, getApps, getApp } = require('firebase/app') as typeof import('firebase/app');
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Get client Auth (browser-local persistence) */
export function getAuthClient(): Auth {
  ensureBrowser();
  const { getAuth, setPersistence, browserLocalPersistence } =
    require('firebase/auth') as typeof import('firebase/auth');
  const app = getFirebaseAppClient();
  const auth = getAuth(app);
  // Best effort; don't block UI if it fails
  void setPersistence(auth, browserLocalPersistence).catch(() => {});
  return auth;
}
