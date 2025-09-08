// app/api/send-verification/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getAdminAuth } from '@/lib/firebaseAdmin';

type Body = { email: string; displayName?: string };
type ApiOk = { ok: true; verifyUrl: string; uid: string };
type ApiErr = { ok: false; error: string };

const bad = (m: string, s = 400) => NextResponse.json<ApiErr>({ ok: false, error: m }, { status: s });

export async function POST(req: NextRequest) {
  try {
    const { email, displayName }: Body = await req.json();
    const norm = (email || '').trim().toLowerCase();
    if (!norm || !norm.includes('@')) return bad('invalid-email');

    const auth = getAdminAuth();
    const user = await auth.getUserByEmail(norm).catch(() => null);
    if (!user) return bad('user-not-found', 404);
    if (user.emailVerified) return bad('already-verified', 409);

    const raw = await auth.generateEmailVerificationLink(norm, {
      url: 'https://portal.theclearpath.ae/verify-email',
      handleCodeInApp: true,
    });

    const outer = new URL(raw);
    let oob = outer.searchParams.get('oobCode');
    if (!oob) {
      const cont = outer.searchParams.get('continueUrl');
      if (cont) { try { oob = new URL(cont).searchParams.get('oobCode'); } catch { } }
    }
    if (!oob) return bad('no-oobcode', 500);

    const verifyUrl = `https://portal.theclearpath.ae/verify-email?oobCode=${encodeURIComponent(oob)}`;

    const apiKey = process.env.BREVO_API_KEY || '';
    const templateId = Number(process.env.BREVO_VERIFY_TEMPLATE_ID || '2');
    if (!apiKey || !templateId) return bad('email-config-missing', 500);

    await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        to: [{ email: norm, name: displayName || user.displayName || norm }],
        templateId,
        params: { verifyUrl, verify_url: verifyUrl, displayName: displayName || user.displayName },
        headers: { 'X-Mailin-Tag': 'verify' },
      },
      { headers: { 'api-key': apiKey, 'content-type': 'application/json' }, timeout: 15000 },
    );

    return NextResponse.json<ApiOk>({ ok: true, verifyUrl, uid: user.uid });
  } catch (e: any) {
    return bad(e?.message || 'unknown', 500);
  }
}
