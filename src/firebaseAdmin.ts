import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function decodeKey(raw?: string): string {
  if (!raw) throw new Error('Missing Firebase admin private key');
  // supports both raw PEM and base64
  try {
    const b = Buffer.from(raw, 'base64').toString('utf8');
    if (b.includes('BEGIN PRIVATE KEY')) return b;
  } catch {}
  return raw.replace(/\\n/g, '\n');
}

let db: Firestore | null = null;

export function initFirebaseAdmin(): Firestore {
  if (db) return db;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const keyB64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;

  if (!projectId || !clientEmail || !keyB64) {
    throw new Error('Missing Firebase admin env vars');
  }

  const privateKey = decodeKey(keyB64);

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });

  db = getFirestore(app);
  return db;
}
