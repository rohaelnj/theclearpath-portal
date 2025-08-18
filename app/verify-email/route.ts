// app/verify-email/route.ts
import { NextResponse } from "next/server";

// Avoid static evaluation and edge runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Minimal email verification endpoint.
 * Does NOT touch Firebase Admin at module scope.
 * Lazily imports Admin only when envs are present at runtime.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const oobCode = url.searchParams.get("oobCode");
    const mode = url.searchParams.get("mode"); // e.g., verifyEmail
    if (!oobCode) {
      return NextResponse.json(
        { ok: false, error: "missing oobCode" },
        { status: 400 }
      );
    }

    // Optional: only use Admin if envs are set
    const pid = process.env.FIREBASE_PROJECT_ID;
    const email = process.env.FIREBASE_CLIENT_EMAIL;
    const hasB64 = !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64;

    if (pid && email && hasB64) {
      // Lazy import so build does not require envs
      const { adminAuth } = await import("@/firebaseAdmin");
      // No Admin API to "apply" oobCode; that is client-side.
      // We just log a lightweight call to prove Admin is alive.
      await adminAuth.listUsers(1);
    }

    // Redirect to your app’s client-side handler to apply the code
    const redirect = new URL("/login?verified=1", url.origin);
    return NextResponse.redirect(redirect, 302);
  } catch (e: unknown) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
