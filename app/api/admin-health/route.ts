// app/api/admin-health/route.ts
import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

// Firebase Admin must run on Node, not Edge
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getPrivateKey(): string {
    // Preferred: base64-encoded PEM
    const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 || "";
    if (b64) return Buffer.from(b64, "base64").toString("utf8");

    // Fallback: plain key with \n escapes
    const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
    return raw.replace(/\\n/g, "\n");
}

function ensureAdmin() {
    if (admin.apps.length) return admin.app();

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = getPrivateKey();

    if (
        !projectId ||
        !clientEmail ||
        !privateKey ||
        !privateKey.startsWith("-----BEGIN PRIVATE KEY-----")
    ) {
        throw new Error("Missing/invalid Firebase Admin env vars");
    }

    return admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

export async function GET() {
    try {
        const app = ensureAdmin();
        // harmless call that exercises the creds
        await app.auth().listUsers(1);
        return NextResponse.json({ ok: true, msg: "admin OK" });
    } catch (err: any) {
        console.error("ADMIN_HEALTH_FAIL", {
            code: err?.code,
            status: err?.status,
            message: err?.message,
            name: err?.name,
        });
        return NextResponse.json(
            { ok: false, error: err?.code || "admin_init_failed", detail: err?.message },
            { status: 500 }
        );
    }
}
