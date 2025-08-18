import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminAuth } from "@/firebaseAdmin";

/**
 * Server-side email verification + auto-login redirect.
 * Success: 302 -> /auth/callback?token=...&next=/portal
 * Failure: 302 -> /login?verify=fail
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");
  const oobCode = url.searchParams.get("oobCode");

  const apiKey =
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_WEB_API_KEY ||
    "";

  if (!apiKey || mode !== "verifyEmail" || !oobCode) {
    return NextResponse.redirect(new URL("/login?verify=fail", req.url));
  }

  try {
    // Apply the verification code via REST
    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
    const { data } = await axios.post(endpoint, { oobCode });

    const email: string | undefined = data?.email;
    if (!email) return NextResponse.redirect(new URL("/login?verify=fail", req.url));

    // Lookup UID and mint a single-use custom token
    const user = await adminAuth.getUserByEmail(email);
    const customToken = await adminAuth.createCustomToken(user.uid);

    // Fire-and-forget welcome email (optional)
    fetch(new URL("/api/send-welcome", req.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName: user.displayName || undefined }),
    }).catch(() => { });

    const cb = new URL("/auth/callback", req.url);
    cb.searchParams.set("token", customToken);
    cb.searchParams.set("next", "/portal");
    return NextResponse.redirect(cb);
  } catch {
    return NextResponse.redirect(new URL("/login?verify=fail", req.url));
  }
}
