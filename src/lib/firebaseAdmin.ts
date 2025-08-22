import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Required envs:
 *  - FIREBASE_ADMIN_PROJECT_ID
 *  - FIREBASE_ADMIN_CLIENT_EMAIL
 *  - one of:
 *      FIREBASE_ADMIN_PRIVATE_KEY_B64  (base64 of PEM)
 *      FIREBASE_ADMIN_PRIVATE_KEY      (raw PEM with header/footer)
 */

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const keyB64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;
const keyPemRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (!projectId || !clientEmail || (!keyB64 && !keyPemRaw)) {
  console.warn("Missing FIREBASE_ADMIN_* environment variables. Firebase Admin SDK will not be initialized.");
  // Create a mock implementation for development
  const mockAuth = {
    generateEmailVerificationLink: () => Promise.reject(new Error("Firebase Admin not configured")),
    getUser: () => Promise.reject(new Error("Firebase Admin not configured")),
    setCustomUserClaims: () => Promise.reject(new Error("Firebase Admin not configured"))
  };
  const mockDb = {};
  
  export const adminAuth = mockAuth as any;
  export const adminDb = mockDb as any;
  export default null as any;
} else {
  // Prefer raw PEM if present, else decode base64 → PEM
  let privateKey = keyPemRaw || Buffer.from(keyB64, "base64").toString("utf8");
  
  // Normalize common pitfalls
  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  // Fix escaped newlines from some CI UIs
  privateKey = privateKey.replace(/\\n/g, "\n");
  
  const app: App =
    getApps().length > 0
      ? getApp()
      : initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
  
  export const adminAuth: Auth = getAuth(app);
  export const adminDb: Firestore = getFirestore(app);
  export default app;
}