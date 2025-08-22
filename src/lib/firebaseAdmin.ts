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

// Declare variables at top level
let adminAuth: Auth;
let adminDb: Firestore;
let app: App | null = null;

if (!projectId || !clientEmail || (!keyB64 && !keyPemRaw)) {
  console.warn("Missing FIREBASE_ADMIN_* environment variables. Firebase Admin SDK will not be initialized.");
  // Create a mock implementation for development
  const mockAuth = {
    generateEmailVerificationLink: () => Promise.reject(new Error("Firebase Admin not configured")),
    getUser: () => Promise.reject(new Error("Firebase Admin not configured")),
    setCustomUserClaims: () => Promise.reject(new Error("Firebase Admin not configured"))
  };
  const mockDb = {};
  
  adminAuth = mockAuth as any;
  adminDb = mockDb as any;
  app = null;
} else {
  // Prefer raw PEM if present, else decode base64 → PEM
  let privateKey = keyPemRaw || Buffer.from(keyB64, "base64").toString("utf8");
  
  // Normalize common pitfalls
  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) privateKey = privateKey.slice(1, -1);
  // Fix escaped newlines from some CI UIs
  privateKey = privateKey.replace(/\\n/g, "\n");
  
  app = getApps().length > 0
    ? getApp()
    : initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  
  adminAuth = getAuth(app);
  adminDb = getFirestore(app);
}

// Export at top level
export { adminAuth, adminDb };
export default app;