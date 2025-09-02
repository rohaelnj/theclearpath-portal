// app/api/env-check/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
    const clientProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || null;
    const adminProject = process.env.FIREBASE_ADMIN_PROJECT_ID || null;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || null;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || null;

    const apiKeyTail =
        apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-6)}` : null;

    const out = {
        clientProject,                 // must equal adminProject
        adminProject,                  // must equal clientProject
        sameProject: clientProject && adminProject ? clientProject === adminProject : false,
        authDomain,                    // should be <project>.firebaseapp.com or your custom domain
        apiKeyTail,                    // public key, redacted for display
        adminEnv: {
            clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKeyB64: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64,
            privateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
        },
        brevoEnv: {
            apiKey: !!process.env.BREVO_API_KEY,
            senderEmail: !!process.env.BREVO_SENDER_EMAIL,
            senderName: !!process.env.BREVO_SENDER_NAME,
            templateVerify: !!process.env.BREVO_TEMPLATE_ID_VERIFY,
            templateWelcome: !!process.env.BREVO_TEMPLATE_ID_WELCOME,
        },
    };

    return NextResponse.json(out, { status: 200 });
}
