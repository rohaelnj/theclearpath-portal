// app/api/send-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "../../../src/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export async function POST(req: NextRequest) {
  try {
    const { email, displayName } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Determine base site URL (env > request origin)
    const origin = (() => {
      try {
        return new URL(req.url).origin;
      } catch {
        return "";
      }
    })();
    const base = (process.env.PUBLIC_BASE_URL || origin || "").replace(/\/$/, "");

    // Use a public logo URL if provided, else fall back to site logo
    // NOTE: while on localhost, email clients cannot fetch /logo.png
    // so EMAIL_LOGO_URL is recommended in dev.
    const logoUrl = process.env.EMAIL_LOGO_URL || `${base}/logo.png`;

    // Create Firebase email verification link
    const verifyUrl = await adminAuth.generateEmailVerificationLink(email, {
      url: `${base}/verify-email?from=cta`,
      handleCodeInApp: true,
    });

    // Send via Brevo
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing BREVO_API_KEY" }, { status: 500 });
    }

    const html = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#DFD6C7;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center">
            <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden">
              <tr>
                <td style="background:#DED4C8;padding:28px 24px" align="center">
                  <img src="${logoUrl}" alt="The Clear Path" width="64" height="64" style="display:block;margin-bottom:10px"/>
                  <div style="color:#1F4142;font-weight:700;font-size:18px">Verify your email</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px;color:#1F4140;font-size:15px;line-height:1.6">
                  Hi${displayName ? " " + displayName : ""},<br/><br/>
                  Please confirm your email address to activate your account.
                  <br/><br/>
                  <a href="${verifyUrl}" style="display:inline-block;background:#1F4142;color:#DFD6C7;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:700">
                    Verify my email
                  </a>
                  <br/><br/>
                  If the button doesn't work, copy and paste this link into your browser:<br/>
                  <span style="word-break:break-all;color:#1F4142">${verifyUrl}</span>
                  <br/><br/>
                  Warm regards,<br/>The Clear Path Team
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>`;

    const brevoPayload = {
      sender: { name: "The Clear Path", email: "noreply@theclearpath.ae" },
      to: [{ email, name: displayName || email }],
      subject: "Verify your email for The Clear Path",
      htmlContent: html,
    };

    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Brevo send failed", details: text || res.statusText },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected server error", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
