import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminAuth } from "@/firebaseAdmin";

type Body = { email?: string; uid?: string; displayName?: string };

function firstFrom(input?: string | null): string | undefined {
  if (!input) return undefined;
  const t = input.trim();
  if (!t) return undefined;
  const local = t.includes("@") ? t.split("@")[0] : t;
  const first = local.split(/[.\s_-]+/)[0];
  return first ? first[0].toUpperCase() + first.slice(1) : undefined;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = (process.env.BREVO_API_KEY || "").trim();
    const templateId = process.env.BREVO_TEMPLATE_ID_VERIFY || "";
    if (!apiKey || !templateId) {
      return NextResponse.json(
        { ok: false, code: "missing-env", error: "Missing BREVO_API_KEY or BREVO_TEMPLATE_ID_VERIFY" },
        { status: 500 }
      );
    }

    let { email, uid, displayName }: Body = await req.json().catch(() => ({} as Body));
    if (!email && !uid) {
      return NextResponse.json({ ok: false, code: "bad-request", error: "Provide email or uid" }, { status: 400 });
    }

    if (!email && uid) {
      const u = await adminAuth.getUser(uid);
      email = u.email || undefined;
      displayName = displayName || u.displayName || undefined;
      if (!email) return NextResponse.json({ ok: false, code: "user-has-no-email" }, { status: 409 });
      const pass = u.providerData.some((p) => p.providerId === "password");
      if (!pass) return NextResponse.json({ ok: false, code: "not-password-user" }, { status: 409 });
      if (u.emailVerified) return NextResponse.json({ ok: true, code: "already-verified" });
    }

    const u2 = await adminAuth.getUserByEmail(email!);
    if (u2.emailVerified) return NextResponse.json({ ok: true, code: "already-verified" });
    const pass = u2.providerData.some((p) => p.providerId === "password");
    if (!pass) return NextResponse.json({ ok: false, code: "not-password-user" }, { status: 409 });

    // Link points to in-app verifier, which applies code then redirects to /portal
    const verifyUrl = await adminAuth.generateEmailVerificationLink(email!, {
      url: "https://portal.theclearpath.ae/verify-email",
    });

    const FIRSTNAME = firstFrom(displayName) ?? firstFrom(email!) ?? "";

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email, name: displayName || email }],
        sender: {
          email: process.env.BREVO_SENDER_EMAIL || "noreply@theclearpath.ae",
          name: process.env.BREVO_SENDER_NAME || "The Clear Path",
        },
        templateId: Number(templateId),
        params: {
          displayName: displayName || FIRSTNAME,
          FIRSTNAME,
          NAME: displayName || "",
          verify_url: verifyUrl, // {{ params.verify_url }} in Brevo template
        },
        subject: "Verify your email for The Clear Path",
      },
      { headers: { "api-key": apiKey, "Content-Type": "application/json" }, timeout: 15000 }
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const code = err?.errorInfo?.code || "";
    if (code === "auth/user-not-found") {
      return NextResponse.json({ ok: false, code: "user-not-found", error: "No user record for that email" }, { status: 404 });
    }
    if (code === "auth/too-many-requests") {
      return NextResponse.json({ ok: false, code: "too-many-requests", error: "TOO_MANY_ATTEMPTS_TRY_LATER" }, { status: 429 });
    }
    return NextResponse.json(
      { ok: false, code: "internal", error: "Unexpected server error", details: String(err?.message || err) },
      { status: 500 }
    );
  }
}
