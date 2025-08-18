import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAuth } from "firebase-admin/auth";
import { cert, getApps, initializeApp } from "firebase-admin/app";

/**
 * POST /api/send-verification
 * Body: { email: string, displayName?: string, next?: string }
 * Looks up UID by email, generates Firebase verify link, sends Brevo template #2.
 */

function initAdmin() {
  if (getApps().length) return;
  const key =
    process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64
      ? Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64, "base64").toString("utf8")
      : (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: key,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    initAdmin();

    const { email, displayName, next = "/portal" } = await req.json?.() ?? {};
    if (!email) {
      return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
    }

    // Lookup UID by email
    const userRec = await getAuth().getUserByEmail(email);
    const uid = userRec.uid;

    // Generate verify link that lands on your existing /verify-email route
    const rawLink = await getAuth().generateEmailVerificationLink(email, {
      url: "https://portal.theclearpath.ae/verify-email",
      handleCodeInApp: true,
    });

    const u = new URL(rawLink);
    const mode = u.searchParams.get("mode") || "verifyEmail";
    const oob = u.searchParams.get("oobCode");
    const apiKey = u.searchParams.get("apiKey");
    if (!oob || !apiKey) {
      return NextResponse.json({ ok: false, error: "Failed to get oobCode/apiKey" }, { status: 500 });
    }

    const verify_url =
      `https://portal.theclearpath.ae/verify-email?mode=${mode}` +
      `&oobCode=${encodeURIComponent(oob)}` +
      `&apiKey=${encodeURIComponent(apiKey)}` +
      `&next=${encodeURIComponent(next)}`;

    // Send via Brevo template ID 2
    const templateId = 2;
    const apiKeyBrevo = process.env.BREVO_API_KEY!;
    if (!apiKeyBrevo) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY not set" }, { status: 500 });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email, name: displayName || email }],
        templateId,
        params: { displayName: displayName || "", verify_url },
        tags: ["verify"],
      },
      { headers: { "api-key": apiKeyBrevo, "Content-Type": "application/json" } }
    );

    return NextResponse.json({ ok: true, uid, verify_url });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.response?.data || err?.message || "unknown error" },
      { status: 500 }
    );
  }
}
