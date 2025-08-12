// src/firebaseAdmin.ts
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let app: App;

// Pull from .env (you already set these)
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!;

// Convert literal \n back to newlines
const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} else {
  app = getApps()[0]!;
}

export const adminAuth = getAuth(app);
export default app;
