import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/send-verification
 * Body: { email: string, displayName?: string }
 * Generates Firebase verify link and sends via Brevo template
 */

export async function POST(req: NextRequest) {
  try {
    console.log("[brevo] verify.send start");
    
    const { email, displayName } = await req.json?.() ?? {};
    if (!email) {
      return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
    }

    // Generate Firebase verification link
    const rawLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email`,
      handleCodeInApp: true,
    });

    // Parse the link to rebuild it properly
    const u = new URL(rawLink);
    const mode = u.searchParams.get("mode") || "verifyEmail";
    const oobCode = u.searchParams.get("oobCode");
    const apiKey = u.searchParams.get("apiKey");
    
    if (!oobCode || !apiKey) {
      return NextResponse.json({ ok: false, error: "Failed to get oobCode/apiKey" }, { status: 500 });
    }

    const verifyUrl = 
      `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?mode=${mode}` +
      `&oobCode=${encodeURIComponent(oobCode)}` +
      `&apiKey=${encodeURIComponent(apiKey)}`;

    // Send via Brevo
    const templateId = Number(process.env.BREVO_VERIFY_TEMPLATE_ID || "2");
    const apiKeyBrevo = process.env.BREVO_API_KEY!;
    
    if (!apiKeyBrevo) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY not set" }, { status: 500 });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email, name: displayName || email }],
        templateId,
        params: { 
          displayName: displayName || "", 
          verifyUrl,
          verify_url: verifyUrl // fallback param name
        },
        tags: ["verify"],
      },
      { 
        headers: { 
          "api-key": apiKeyBrevo, 
          "Content-Type": "application/json" 
        } 
      }
    );

    console.log("[brevo] verify.send done");
    return NextResponse.json({ ok: true, verifyUrl });
  } catch (err: any) {
    console.error("[brevo] verify.send error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { ok: false, error: err?.response?.data || err?.message || "unknown error" },
      { status: 500 }
    );
  }
}