// src/lib/firebaseAdmin.ts
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let _app: App | undefined;

function readPrivateKey(): string {
  const raw = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").trim();
  const b64 = (process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 ?? "").trim();
  const pem = raw || (b64 ? Buffer.from(b64, "base64").toString("utf8") : "");
  if (!pem) throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY[_B64]");

  const normalized = pem.replace(/^"|"$/g, "").replace(/\\n/g, "\n").trim();
  if (!/BEGIN (RSA )?PRIVATE KEY/.test(normalized)) {
    throw new Error("Invalid Firebase Admin private key");
  }
  return normalized;
}

function ensureApp(): App {
  if (_app) return _app;

  const projectId = (process.env.FIREBASE_ADMIN_PROJECT_ID ?? "").trim();
  const clientEmail = (process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "").trim();
  if (!projectId || !clientEmail) {
    throw new Error("Missing FIREBASE_ADMIN projectId/clientEmail");
  }

  const privateKey = readPrivateKey();
  _app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return _app;
}

export function getAdminApp(): App { return ensureApp(); }
export function getAdminAuth(): Auth { return getAuth(ensureApp()); }
