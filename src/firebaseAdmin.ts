// src/firebaseAdmin.ts
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Ensure all required env variables exist
const required = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
}

// Pull from env
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!;

// Convert literal \n back into actual newlines
const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

const app: App = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

export const adminAuth = getAuth(app);
export default app;
