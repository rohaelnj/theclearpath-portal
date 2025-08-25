// src/lib/firebaseAdmin.ts
import { cert, getApps, initializeApp, type App as AdminApp } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let adminApp: AdminApp | undefined;
let adminAuth: Auth | undefined;

function getEnv() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() || "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() || "";
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64?.trim() || "";
  let privateKey = "";
  if (b64) {
    try {
      privateKey = Buffer.from(b64, "base64").toString("utf8");
    } catch {
      privateKey = "";
    }
  }
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  const ready = Boolean(projectId && clientEmail && privateKey);
  return { projectId, clientEmail, privateKey, isProd, ready };
}

function initAdmin() {
  if (adminApp && adminAuth) return;
  const { projectId, clientEmail, privateKey, isProd, ready } = getEnv();
  if (!ready) {
    if (isProd) throw new Error("Firebase Admin env missing in production.");
    return;
  }
  if (!getApps().length) {
    adminApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } else {
    adminApp = getApps()[0]!;
  }
  adminAuth = getAuth(adminApp);
}

export function getAdminApp(): AdminApp | undefined {
  if (!adminApp) initAdmin();
  return adminApp;
}

export function getAdminAuth(): Auth | undefined {
  if (!adminAuth) initAdmin();
  return adminAuth;
}
