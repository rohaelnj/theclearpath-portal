import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

/**
 * Server-side email verification (no JS needed).
 * Accepts: /verify-email?mode=verifyEmail&oobCode=...
 * Success → 302 /portal
 * Failure → 302 /login?verify=fail
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
    const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`;
    const { data } = await axios.post(endpoint, { oobCode });

    // optional: send welcome
    const email: string | undefined = data?.email;
    if (email) {
      fetch(new URL("/api/send-welcome", req.url).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    }

    return NextResponse.redirect(new URL("/portal", req.url));
  } catch {
    return NextResponse.redirect(new URL("/login?verify=fail", req.url));
  }
}
