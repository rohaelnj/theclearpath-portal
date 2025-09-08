// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import firebaseConfig from '@/firebaseConfig';

let clientApp: FirebaseApp | null = null;

export function getAuthClient(): Auth {
  if (typeof window === 'undefined') {
    // SSR/build: return a typed no-op; real auth is acquired in effects/handlers.
    return {} as Auth;
  }
  clientApp ||= (getApps()[0] ?? initializeApp(firebaseConfig));
  const auth = getAuth(clientApp);
  void setPersistence(auth, browserLocalPersistence).catch(() => {});
  return auth;
}
