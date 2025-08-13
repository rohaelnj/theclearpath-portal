// src/firebaseAdmin.ts
import { App, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// If a string looks base64, try decoding it once more.
function maybeSecondDecode(s: string): string {
  const looksB64 = /^[A-Za-z0-9+/=\r\n]+$/.test(s) && s.length % 4 === 0;
  if (!looksB64) return s;
  try {
    return Buffer.from(s, "base64").toString("utf8");
  } catch {
    return s;
  }
}

function normalizePrivateKey(): string {
  const b64 = (process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 || "").trim();
  if (b64) {
    let decoded = Buffer.from(b64, "base64").toString("utf8").trim();
    if (decoded.includes("\\n")) decoded = decoded.replace(/\\n/g, "\n");
    decoded = maybeSecondDecode(decoded).trim();
    if (!/BEGIN PRIVATE KEY/.test(decoded) || !/END PRIVATE KEY/.test(decoded)) {
      throw new Error("Decoded FIREBASE_ADMIN_PRIVATE_KEY_B64 is not a PEM.");
    }
    return decoded;
  }

  // Fallback: non-B64 env var with \n escapes
  let pk = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").trim();
  if (!pk) throw new Error("Missing FIREBASE_ADMIN_PRIVATE_KEY_B64 or FIREBASE_ADMIN_PRIVATE_KEY.");
  if ((pk.startsWith('"') && pk.endsWith('"')) || (pk.startsWith("'") && pk.endsWith("'"))) {
    pk = pk.slice(1, -1);
  }
  if (pk.includes("\\n")) pk = pk.replace(/\\n/g, "\n");
  if (!/BEGIN PRIVATE KEY/.test(pk) || !/END PRIVATE KEY/.test(pk)) {
    throw new Error("PRIVATE_KEY must include PEM BEGIN/END lines.");
  }
  return pk.trim();
}

// Required envs
const required = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL"] as const;
for (const k of required) {
  if (!process.env[k]) throw new Error(`Missing environment variable: ${k}`);
}

// Create/reuse Admin app
const app: App =
  getApps().length
    ? getApps()[0]!
    : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: normalizePrivateKey(),
      }),
    });

// Export concrete Auth object
export const adminAuth = getAuth(app);
export default app;
