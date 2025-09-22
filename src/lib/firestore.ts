import { cert, getApps, initializeApp, type App, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore, type Firestore, FieldValue } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let cachedDb: Firestore | null = null;

function decodeKey(): string {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;
  if (b64) {
    return Buffer.from(b64, 'base64').toString('utf8');
  }
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (raw) {
    return raw.replace(/\\n/g, '\n');
  }
  throw new Error('Missing Firebase admin private key');
}

export function getDb(): Firestore {
  if (cachedDb) return cachedDb;

  const apps = getApps();
  if (apps.length) {
    adminApp = apps[0];
  } else {
    const projectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      '';
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || '';
    const privateKey = decodeKey();

    if (!projectId) throw new Error('Admin project ID missing');
    if (!clientEmail) throw new Error('Admin client email missing');

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      } as ServiceAccount),
    });
  }

  cachedDb = getFirestore(adminApp!);
  return cachedDb;
}

export { FieldValue };
