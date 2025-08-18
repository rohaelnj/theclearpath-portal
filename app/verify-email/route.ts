import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // Use apiKey from URL if present, else fall back to env
  let apiKey =
    url.searchParams.get("apiKey") ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.FIREBASE_WEB_API_KEY;

  // Try to recover nested verify URL if a tracker wrapped it
  const recover = () => {
    for (const [, v] of url.searchParams) {
      const d1 = decodeURIComponent(v);
      const d2 = decodeURIComponent(d1);
      const cand = [v, d1, d2].find(
        (s) => s.includes("oobCode=") && s.includes("mode=verifyEmail")
      );
      if (cand) {
        const u = new URL(cand);
        for (const k of ["mode", "oobCode", "apiKey", "continueUrl"]) {
          const val = u.searchParams.get(k);
          if (val && !url.searchParams.get(k)) url.searchParams.set(k, val);
        }
        if (!apiKey) apiKey = u.searchParams.get("apiKey") || apiKey;
        break;
      }
    }
  };
  recover();

  const mode = url.searchParams.get("mode");
  const oobCode = url.searchParams.get("oobCode");
  const next = url.searchParams.get("continueUrl") || "/portal";
  const debug = url.searchParams.get("debug") === "1";

  if (!mode || mode !== "verifyEmail" || !oobCode || !apiKey) {
    return NextResponse.redirect(new URL("/login?verify=fail", req.url), 307);
  }

  // Apply verification with Firebase REST
  const applyRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${encodeURIComponent(
      apiKey
    )}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oobCode }),
    }
  );

  const applyJson = (await applyRes.json().catch(() => ({}))) as
    | { email?: string; localId?: string; error?: unknown }
    | any;

  if (!applyRes.ok || !applyJson?.localId) {
    if (debug) {
      return NextResponse.json(
        { ok: false, stage: "applyOobCode", status: applyRes.status, body: applyJson },
        { status: 400 }
      );
    }
    return NextResponse.redirect(new URL("/login?verify=fail", req.url), 307);
  }

  // Issue custom token and redirect to client auto-login
  const uid = applyJson.localId as string;
  const token = await adminAuth.createCustomToken(uid);

  const cb = new URL("/auth/callback", req.url);
  cb.searchParams.set("t", token);
  cb.searchParams.set("next", next);

  if (debug) {
    return NextResponse.json({ ok: true, stage: "issueCustomToken", uid, next, redirect: cb.toString() });
  }

  return NextResponse.redirect(cb, 302);
}
