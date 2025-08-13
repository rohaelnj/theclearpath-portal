import { NextResponse } from "next/server";
import * as admin from "firebase-admin";

function getCred() {
    const b64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 || "";
    const pem = Buffer.from(b64, "base64").toString("utf8");
    return {
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: pem,
    };
}

// make sure we don't re-init on hot reloads
function ensureAdmin() {
    if (admin.apps.length) return admin.app();
    const { projectId, clientEmail, privateKey } = getCred();
    if (!projectId || !clientEmail || !privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
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
        // a harmless call that forces credentials to be used
        await app.auth().listUsers(1);
        return NextResponse.json({ ok: true, msg: "admin OK" });
    } catch (err: any) {
        // Log everything server-side
        console.error("ADMIN_HEALTH_FAIL", {
            code: err?.code,
            status: err?.status,
            message: err?.message,
            name: err?.name,
        });
        // return a safe summary to the browser (no secrets)
        return NextResponse.json(
            { ok: false, reason: "admin_init_failed", detail: err?.message ?? String(err) },
            { status: 500 }
        );
    }
}
