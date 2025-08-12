// src/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Optional Analytics (runs only in browser when measurementId exists)
let analytics: import("firebase/analytics").Analytics | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  // this is optional; only used if you enabled Firebase Analytics
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Avoid re-initializing in Next.js dev/hmr
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Core SDK exports you actually use
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export analytics ONLY on client and ONLY if measurementId exists
if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    })
    .catch(() => {
      // analytics is optional; ignore load errors in dev
    });
}

export { app, analytics };
export default app;
