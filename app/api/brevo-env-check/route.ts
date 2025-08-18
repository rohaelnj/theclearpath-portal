// app/api/brevo-env-check/route.ts
import { NextResponse } from "next/server";

export async function GET() {
    const key = process.env.BREVO_API_KEY?.trim() || "";
    const verifyId = process.env.BREVO_TEMPLATE_ID_VERIFY;
    const welcomeId = process.env.BREVO_TEMPLATE_ID_WELCOME;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const ok =
        key.startsWith("xkeysib-") &&
        /^\d+$/.test(verifyId || "") &&
        /^\d+$/.test(welcomeId || "") &&
        !!senderEmail;

    return NextResponse.json({
        ok,
        hasKey: key.length > 20,
        keyPrefix: key ? key.slice(0, 12) : null,
        verifyId,
        welcomeId,
        senderEmail,
    });
}
