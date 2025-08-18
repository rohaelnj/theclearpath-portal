// app/api/admin-debug/route.ts
import { NextResponse } from "next/server";
import { adminAuth } from "@/firebaseAdmin";

/** Admin SDK healthcheck: verifies FIREBASE_ADMIN_* envs + private key */
export async function GET() {
    try {
        const token = await adminAuth.createCustomToken("admin-debug-healthcheck");
        const ok = typeof token === "string" && token.split(".").length === 3;
        return NextResponse.json({ ok, projectId: process.env.FIREBASE_ADMIN_PROJECT_ID });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
    }
}
