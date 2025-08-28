// app/api/send-welcome/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { email } = (await req.json()) as { email?: string };
    const norm = email?.trim().toLowerCase() || "";
    if (!norm) return NextResponse.json({ error: "email-required" }, { status: 400 });

    // Optional referer guard to reduce abuse
    const referer = req.headers.get("referer") || "";
    if (!referer.includes("/portal")) {
      return NextResponse.json({ error: "bad-referer" }, { status: 400 });
    }

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(norm).catch((e: any) => {
      const code = e?.code || e?.errorInfo?.code;
      if (code === "auth/user-not-found") return null;
      return Promise.reject(e);
    });
    if (!user) return NextResponse.json({ error: "user-not-found" }, { status: 404 });
    if (!user.emailVerified) return NextResponse.json({ error: "not-verified" }, { status: 409 });

    const claims = (user.customClaims as Record<string, unknown>) || {};
    if (claims.welcomeSent === true) return NextResponse.json({ ok: true, alreadySent: true });

    const appUrl = process.env.PORTAL_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "https://portal.theclearpath.ae";
    const apiKey = process.env.BREVO_API_KEY || "";
    const templateId =
      Number(process.env.BREVO_WELCOME_TEMPLATE_ID ?? process.env.BREVO_TEMPLATE_ID_WELCOME ?? NaN);
    if (!apiKey || !Number.isFinite(templateId)) {
      return NextResponse.json({ error: "brevo-env-missing" }, { status: 500 });
    }

    const portal = `${appUrl}/portal`;
    const logoUrl = process.env.MAIL_LOGO_URL || `${appUrl}/logo.png`;
    const onboarding = process.env.WELCOME_PDF_URL; // optional

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email: norm, name: user.displayName || norm.split("@")[0] }],
        templateId,
        params: {
          displayName: user.displayName || norm.split("@")[0],
          portal_url: portal,
          logoUrl,
          brand_color: "#1F4142",
          onboarding_url: onboarding,
        },
        headers: { "X-Mail-Tag": "welcome-email" },
      },
      { headers: { "api-key": apiKey, "content-type": "application/json" }, timeout: 15000 }
    );

    await auth.setCustomUserClaims(user.uid, { ...claims, welcomeSent: true });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: "internal", detail: String(e?.response?.data || e?.message || e) }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method-not-allowed" }, { status: 405 });
}
