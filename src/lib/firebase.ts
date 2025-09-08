// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import firebaseConfig from '@/firebaseConfig';

let clientApp: FirebaseApp | null = null;

function getAppClient(): FirebaseApp | null {
  if (typeof window === 'undefined') return null; // SSR/build path
  if (!clientApp) clientApp = getApps()[0] ?? initializeApp(firebaseConfig);
  return clientApp;
}

export function getAuthClient(): Auth {
  if (typeof window === 'undefined') {
    // Return a typed no-op on the server; client code will re-call on mount/handlers.
    return {} as Auth;
  }
  const app = getAppClient()!;
  return getAuth(app);
}
// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import firebaseConfig from '@/firebaseConfig';

let clientApp: FirebaseApp | null = null;

export function getAuthClient(): Auth {
  if (typeof window === 'undefined') {
    // SSR/build path: return a typed no-op. Real auth is obtained on the client.
    return {} as Auth;
  }
  clientApp ||= getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(clientApp);
  void setPersistence(auth, browserLocalPersistence).catch(() => {});
  return auth;
}
