// app/api/env-check/route.ts
import { NextResponse } from "next/server";

function has(v?: string) { return v != null && v !== ""; }

export async function GET() {
    const adminKeyB64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 || "";
    let adminKeyDecodes = false;
    try {
        const dec = Buffer.from(adminKeyB64, "base64").toString("utf8");
        adminKeyDecodes = dec.includes("BEGIN PRIVATE KEY") && dec.includes("END PRIVATE KEY");
    } catch { adminKeyDecodes = false; }

    return NextResponse.json({
        // Public
        NEXT_PUBLIC_APP_URL: has(process.env.NEXT_PUBLIC_APP_URL),
        NEXT_PUBLIC_FIREBASE_API_KEY: has(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: has(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: has(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: has(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: has(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
        NEXT_PUBLIC_FIREBASE_APP_ID: has(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: has(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),

        // Server
        FIREBASE_ADMIN_PROJECT_ID: has(process.env.FIREBASE_ADMIN_PROJECT_ID),
        FIREBASE_ADMIN_CLIENT_EMAIL: has(process.env.FIREBASE_ADMIN_CLIENT_EMAIL),
        FIREBASE_ADMIN_PRIVATE_KEY_B64: has(process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64),
        FIREBASE_ADMIN_PRIVATE_KEY_B64_decodes: adminKeyDecodes,

        // Brevo
        BREVO_API_KEY: has(process.env.BREVO_API_KEY),
        BREVO_SENDER_EMAIL: has(process.env.BREVO_SENDER_EMAIL),
        BREVO_SENDER_NAME: has(process.env.BREVO_SENDER_NAME),
        BREVO_TEMPLATE_ID_VERIFY: has(process.env.BREVO_TEMPLATE_ID_VERIFY),
        BREVO_TEMPLATE_ID_WELCOME: has(process.env.BREVO_TEMPLATE_ID_WELCOME),
        WELCOME_PDF_URL: has(process.env.WELCOME_PDF_URL),
    });
}
