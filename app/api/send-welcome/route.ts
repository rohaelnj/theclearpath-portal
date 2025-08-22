import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { adminAuth } from "@/lib/firebaseAdmin";

/**
 * POST /api/send-welcome
 * Body: { uid: string }
 * Sends welcome email via Brevo if not already sent (idempotent via custom claim)
 */

export async function POST(req: NextRequest) {
  try {
    console.log("[brevo] welcome.send start");
    
    const { uid } = await req.json?.() ?? {};
    if (!uid) {
      return NextResponse.json({ ok: false, error: "uid required" }, { status: 400 });
    }

    // Get user and check if welcome already sent
    const userRecord = await adminAuth.getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    if (customClaims.welcomeSent === true) {
      console.log("[brevo] welcome.skip - already sent");
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Send welcome email via Brevo
    const templateId = Number(process.env.BREVO_WELCOME_TEMPLATE_ID || "1");
    const apiKeyBrevo = process.env.BREVO_API_KEY!;
    
    if (!apiKeyBrevo) {
      return NextResponse.json({ ok: false, error: "BREVO_API_KEY not set" }, { status: 500 });
    }

    const displayName = userRecord.displayName || userRecord.email?.split("@")[0] || "";
    const email = userRecord.email;
    
    if (!email) {
      return NextResponse.json({ ok: false, error: "User has no email" }, { status: 400 });
    }

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        to: [{ email, name: displayName || email }],
        templateId,
        params: { 
          displayName,
          portal_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal`,
          logoUrl: process.env.EMAIL_LOGO_URL,
          welcomePdfUrl: process.env.WELCOME_PDF_URL
        },
        tags: ["welcome"],
      },
      { 
        headers: { 
          "api-key": apiKeyBrevo, 
          "Content-Type": "application/json" 
        } 
      }
    );

    // Set custom claim to prevent duplicate sends
    await adminAuth.setCustomUserClaims(uid, { 
      ...customClaims, 
      welcomeSent: true 
    });

    console.log("[brevo] welcome.send done");
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[brevo] welcome.send error:", err?.response?.data || err?.message);
    return NextResponse.json(
      { ok: false, error: err?.response?.data || err?.message || "unknown error" },
      { status: 500 }
    );
  }
}