// app/api/env-check/route.ts
import { NextResponse } from "next/server";

function present(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(process.env, key) && !!process.env[key as keyof NodeJS.ProcessEnv];
}
function asNumber(x: unknown): number | null {
    const n = Number(x);
    return Number.isFinite(n) ? n : null;
}

export async function GET() {
    const CANON = { VERIFY_ID: "BREVO_VERIFY_TEMPLATE_ID", WELCOME_ID: "BREVO_WELCOME_TEMPLATE_ID" } as const;
    const LEGACY = { VERIFY_ID: "BREVO_TEMPLATE_ID_VERIFY", WELCOME_ID: "BREVO_TEMPLATE_ID_WELCOME" } as const;

    const verifyRaw = process.env[CANON.VERIFY_ID] ?? process.env[LEGACY.VERIFY_ID] ?? "";
    const welcomeRaw = process.env[CANON.WELCOME_ID] ?? process.env[LEGACY.WELCOME_ID] ?? "";

    const RESOLVED = {
        verifyTemplateId: asNumber(verifyRaw),
        welcomeTemplateId: asNumber(welcomeRaw),
        source: {
            verify: process.env[CANON.VERIFY_ID]
                ? CANON.VERIFY_ID
                : process.env[LEGACY.VERIFY_ID]
                    ? LEGACY.VERIFY_ID
                    : null,
            welcome: process.env[CANON.WELCOME_ID]
                ? CANON.WELCOME_ID
                : process.env[LEGACY.WELCOME_ID]
                    ? LEGACY.WELCOME_ID
                    : null,
        },
    };

    return NextResponse.json({
        NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,

        NEXT_PUBLIC_FIREBASE_API_KEY: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: !!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

        FIREBASE_ADMIN_PROJECT_ID: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
        FIREBASE_ADMIN_CLIENT_EMAIL: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        FIREBASE_ADMIN_PRIVATE_KEY_B64: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64,
        FIREBASE_ADMIN_PRIVATE_KEY_B64_decodes:
            !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64 &&
            (() => {
                try {
                    Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64!, "base64").toString("utf8");
                    return true;
                } catch {
                    return false;
                }
            })(),

        BREVO_API_KEY: !!process.env.BREVO_API_KEY,
        BREVO_SENDER_EMAIL: !!process.env.BREVO_SENDER_EMAIL,
        BREVO_SENDER_NAME: !!process.env.BREVO_SENDER_NAME,

        CANONICAL: {
            BREVO_VERIFY_TEMPLATE_ID: present(CANON.VERIFY_ID),
            BREVO_WELCOME_TEMPLATE_ID: present(CANON.WELCOME_ID),
        },
        LEGACY: {
            BREVO_TEMPLATE_ID_VERIFY: present(LEGACY.VERIFY_ID),
            BREVO_TEMPLATE_ID_WELCOME: present(LEGACY.WELCOME_ID),
        },

        RESOLVED,

        WELCOME_PDF_URL: !!process.env.WELCOME_PDF_URL,
        EMAIL_LOGO_URL: !!process.env.EMAIL_LOGO_URL,
    });
}
