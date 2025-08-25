// app/api/send-welcome/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
    if (getApps().length) return;
    const proj = process.env.FIREBASE_ADMIN_PROJECT_ID!;
    const email = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
    const keyB64 = process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64!;
    const privateKey = Buffer.from(keyB64, "base64").toString("utf8");
    initializeApp({ credential: cert({ projectId: proj, clientEmail: email, privateKey }) });
}

export async function POST(req: NextRequest) {
    try {
        const { email } = (await req.json()) as { email?: string };
        if (!email) return NextResponse.json({ error: "email-required" }, { status: 400 });

        // Only accept calls coming from /portal
        const referer = req.headers.get("referer") || "";
        if (!referer.includes("/portal")) {
            return NextResponse.json({ error: "bad-referer" }, { status: 400 });
        }

        initAdmin();
        const auth = getAuth();
        const user = await auth.getUserByEmail(email).catch((e: any) => (e?.code === "auth/user-not-found" ? null : Promise.reject(e)));
        if (!user) return NextResponse.json({ error: "user-not-found" }, { status: 404 });
        if (!user.emailVerified) return NextResponse.json({ error: "not-verified" }, { status: 409 });

        const claims = (user.customClaims as Record<string, unknown>) || {};
        if (claims.welcomeSent === true) return NextResponse.json({ ok: true, alreadySent: true });

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://portal.theclearpath.ae";
        const apiKey = process.env.BREVO_API_KEY!;
        const templateId = Number(process.env.BREVO_WELCOME_TEMPLATE_ID ?? process.env.BREVO_TEMPLATE_ID_WELCOME);
        if (!apiKey || !Number.isFinite(templateId)) return NextResponse.json({ error: "brevo-env-missing" }, { status: 500 });

        const portal = `${appUrl}/portal`;

        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                to: [{ email, name: user.displayName || email.split("@")[0] }],
                templateId,
                params: {
                    displayName: user.displayName || email.split("@")[0],
                    portal_url: portal,
                    logoUrl: `${appUrl}/logo.png`,
                    brand_color: "#1F4142",
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
