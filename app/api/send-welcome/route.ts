import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

type Body = { email: string; displayName?: string };

function firstFrom(input?: string | null): string | undefined {
    if (!input) return undefined;
    const t = input.trim();
    if (!t) return undefined;
    const local = t.includes("@") ? t.split("@")[0] : t;
    const first = local.split(/[.\s_-]+/)[0];
    return first ? first[0].toUpperCase() + first.slice(1) : undefined;
}

export async function POST(req: NextRequest) {
    try {
        const { email, displayName }: Body = await req.json();
        if (!email) return NextResponse.json({ ok: false, error: "Missing email" }, { status: 400 });

        const apiKey = (process.env.BREVO_API_KEY || "").trim();
        const templateId = process.env.BREVO_TEMPLATE_ID_WELCOME || "";
        if (!apiKey || !templateId) {
            return NextResponse.json(
                { ok: false, code: "missing-env", error: "Missing BREVO_API_KEY or BREVO_TEMPLATE_ID_WELCOME" },
                { status: 500 }
            );
        }

        const FIRSTNAME = firstFrom(displayName) ?? firstFrom(email) ?? "";

        await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                to: [{ email, name: displayName || email }],
                sender: {
                    email: process.env.BREVO_SENDER_EMAIL || "noreply@theclearpath.ae",
                    name: process.env.BREVO_SENDER_NAME || "The Clear Path",
                },
                templateId: Number(templateId),
                params: {
                    displayName: displayName || FIRSTNAME,
                    FIRSTNAME,
                    NAME: displayName || "",
                    portal_url: "https://portal.theclearpath.ae/login",
                },
                subject: "Welcome to The Clear Path",
            },
            { headers: { "api-key": apiKey, "Content-Type": "application/json" }, timeout: 15000 }
        );

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, code: "internal", error: "Unexpected server error", details: String(err?.message || err) },
            { status: 500 }
        );
    }
}
