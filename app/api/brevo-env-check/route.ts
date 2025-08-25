// app/api/brevo-env-check/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    const canonVerify = process.env.BREVO_VERIFY_TEMPLATE_ID;
    const canonWelcome = process.env.BREVO_WELCOME_TEMPLATE_ID;
    const legacyVerify = process.env.BREVO_TEMPLATE_ID_VERIFY;
    const legacyWelcome = process.env.BREVO_TEMPLATE_ID_WELCOME;

    const verifyRaw = canonVerify ?? legacyVerify ?? "";
    const welcomeRaw = canonWelcome ?? legacyWelcome ?? "";

    const verify = Number.isFinite(Number(verifyRaw)) ? Number(verifyRaw) : null;
    const welcome = Number.isFinite(Number(welcomeRaw)) ? Number(welcomeRaw) : null;

    return NextResponse.json({
        ok: !!process.env.BREVO_API_KEY && verify !== null && welcome !== null,
        hasKey: !!process.env.BREVO_API_KEY,
        present: {
            BREVO_VERIFY_TEMPLATE_ID: !!canonVerify,
            BREVO_WELCOME_TEMPLATE_ID: !!canonWelcome,
            BREVO_TEMPLATE_ID_VERIFY: !!legacyVerify,
            BREVO_TEMPLATE_ID_WELCOME: !!legacyWelcome,
        },
        resolved: {
            verifyTemplateId: verify,
            welcomeTemplateId: welcome,
            source: {
                verify: canonVerify ? "BREVO_VERIFY_TEMPLATE_ID" : legacyVerify ? "BREVO_TEMPLATE_ID_VERIFY" : null,
                welcome: canonWelcome ? "BREVO_WELCOME_TEMPLATE_ID" : legacyWelcome ? "BREVO_TEMPLATE_ID_WELCOME" : null,
            },
        },
        senderEmail: process.env.BREVO_SENDER_EMAIL || null,
    });
}
