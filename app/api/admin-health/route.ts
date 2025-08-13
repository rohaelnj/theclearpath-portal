import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getCred() {
  const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 || "";
  const pem = Buffer.from(b64, "base64").toString("utf8");
  return {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: pem,
  };
}

function ensureAdmin() {
  if (admin.apps.length) return admin.app();
  const { projectId, clientEmail, privateKey } = getCred();
  if (!projectId || !clientEmail || !privateKey?.startsWith("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("Env missing or bad PEM");
  }
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export async function GET() {
  try {
    const app = ensureAdmin();
    await app.auth().listUsers(1);
    return NextResponse.json({ ok: true, msg: "admin OK" });
  } catch (err: any) {
    console.error("ADMIN_HEALTH_FAIL", {
      code: err?.code,
      status: err?.status,
      message: err?.message,
      name: err?.name,
    });
    return NextResponse.json({ ok: false, reason: "admin_init_failed" }, { status: 500 });
  }
}
