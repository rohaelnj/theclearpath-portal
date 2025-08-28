// app/api/send-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const norm = email?.trim().toLowerCase() || "";
    if (!norm) return NextResponse.json({ error: "email-required" }, { status: 400 });

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(norm).catch((e: any) => {
      const code = e?.code || e?.errorInfo?.code;
      const msg: string = e?.message || e?.errorInfo?.message || "";
      if (code === "auth/user-not-found" || /no user record/i.test(msg)) return null;
      return Promise.reject(e);
    });
    if (!user) return NextResponse.json({ error: "user-not-found" }, { status: 404 });
    if (user.emailVerified) return NextResponse.json({ error: "already-verified" }, { status: 409 });

    const appUrl = process.env.PORTAL_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://portal.theclearpath.ae";
    const verifyUrl = await auth.generateEmailVerificationLink(norm, {
      url: `${appUrl}/verify-email`,
      handleCodeInApp: true,
    });

    const apiKey = process.env.BREVO_API_KEY || "";
    const templateId =
      Number(process.env.BREVO_VERIFY_TEMPLATE_ID ?? process.env.BREVO_TEMPLATE_ID_VERIFY ?? NaN);
    if (!apiKey || !Number.isFinite(templateId)) {
      return NextResponse.json({ ok: false, code: "missing-env" }, { status: 500 });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: norm, name: user.displayName || norm.split("@")[0] }],
        templateId,
        params: {
          displayName: user.displayName || norm.split("@")[0],
          verifyUrl,
          verify_url: verifyUrl, // Brevo template fallback
          logoUrl: process.env.MAIL_LOGO_URL || `${appUrl}/logo.png`,
          brand_color: "#1F4142",
        },
      },
      { headers: { "api-key": apiKey, "content-type": "application/json" }, timeout: 15000 }
    );

    return NextResponse.json({ ok: true, uid: user.uid });
  } catch (err: any) {
    console.error("send-verification error:", err?.response?.data || err?.message || err);
    return NextResponse.json({ ok: false, error: String(err?.response?.data || err?.message || err) }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method-not-allowed" }, { status: 405 });
}
