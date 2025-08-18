// app/api/admin-debug/route.ts
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/firebaseAdmin";

/** Admin SDK healthcheck: verifies FIREBASE_ADMIN_* envs + private key */
export async function GET() {
    try {
        const auth = getAdminAuth(); // lazily initializes
        // lightweight call to ensure key parses and project/email match
        await auth.listUsers(1);
        return NextResponse.json({
            ok: true,
            pid: process.env.FIREBASE_PROJECT_ID,
            email: process.env.FIREBASE_CLIENT_EMAIL,
            hasB64: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64,
        });
    } catch (e: unknown) {
        return NextResponse.json(
            { ok: false, error: e instanceof Error ? e.message : String(e) },
            { status: 500 }
        );
    }
}
