// src/firebaseAdmin.ts
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const keyB64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64!;

if (!projectId || !clientEmail || !keyB64) {
  throw new Error("Missing Firebase Admin envs");
}

// Decode base64 → PEM
let privateKey = Buffer.from(keyB64, "base64").toString("utf8");
// Guard against accidental quoting
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();
