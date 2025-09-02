// src/lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

/** Reads the Admin private key from either B64 or plain env and fixes \n */
function readPrivateKey(): string {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;
  const raw = b64
    ? Buffer.from(b64, 'base64').toString('utf8')
    : (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '');
  return raw.replace(/\\n/g, '\n');
}

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: readPrivateKey(),
    }),
  });

/** Preferred getter. Use this in all server files. */
export function getAdminAuth(): Auth {
  return getAuth(app);
}

/** Back-compat named export for any existing imports. */
export const adminAuth = getAuth(app);
