export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebaseAdmin';

export async function GET() {
  try {
    const auth = getAdminAuth();              // forces Admin SDK init
    await auth.listUsers(1).catch(() => null); // minimal noop call
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'init_failed' },
      { status: 500 }
    );
  }
}

