// src/lib/firebaseAdmin.ts
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

/** Decode Admin private key from B64 or plain env. */
function readPrivateKey(): string {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;
  if (b64 && b64.trim() !== '') {
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    return decoded.replace(/\\n/g, '\n');
  }
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  return raw.replace(/\\n/g, '\n');
}

/** Create Admin app on first use only. */
function getFirebaseAdminApp(): App {
  const apps = getApps();
  if (apps.length) return getApp();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = readPrivateKey();

  if (!projectId) throw new Error('FIREBASE_ADMIN_PROJECT_ID missing');
  if (!clientEmail) throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL missing');
  if (!privateKey) throw new Error('Admin private key missing');

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

/** Preferred getter. Use this in all server files. */
export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}
