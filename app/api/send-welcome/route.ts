// app/api/send-welcome/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getAdminAuth } from '@/lib/firebaseAdmin';

type Body = { uid?: string; email?: string };
type ApiOk = { ok: true; sent: boolean };
type ApiErr = { ok: false; error: string };

const bad = (m: string, s = 400) => NextResponse.json<ApiErr>({ ok: false, error: m }, { status: s });

export async function POST(req: NextRequest) {
  try {
    const { uid, email }: Body = await req.json();
    if (!uid && !email) return bad('uid-or-email-required');

    const auth = getAdminAuth();
    const user = uid ? await auth.getUser(uid) : await auth.getUserByEmail(String(email).trim().toLowerCase());
    if (!user.email || !user.emailVerified) return bad('not-verified', 409);

    const claims = (user.customClaims as Record<string, unknown>) || {};
    if (claims.welcomeSent === true) return NextResponse.json<ApiOk>({ ok: true, sent: false });

    const apiKey = process.env.BREVO_API_KEY || '';
    const templateId = Number(
      process.env.BREVO_TEMPLATE_ID_WELCOME ??
      process.env.BREVO_WELCOME_TEMPLATE_ID ??
      '1'
    );
    if (!apiKey || !templateId || Number.isNaN(templateId)) return bad('email-config-missing', 500);

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        to: [{ email: user.email!, name: user.displayName || user.email }],
        templateId,
        params: {
          portal_url: 'https://portal.theclearpath.ae/portal',
          logoUrl: 'https://portal.theclearpath.ae/logo.png',
          displayName: user.displayName || user.email.split('@')[0],
        },
        headers: { 'X-Mailin-Tag': 'welcome' },
      },
      { headers: { 'api-key': apiKey, 'content-type': 'application/json' }, timeout: 15000 },
    );

    await auth.setCustomUserClaims(user.uid, { ...claims, welcomeSent: true });
    return NextResponse.json<ApiOk>({ ok: true, sent: true });
  } catch (e: any) {
    return bad(e?.message || 'unknown', 500);
  }
}
