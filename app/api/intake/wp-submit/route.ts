import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  email?: string;
  answers?: Record<string, string>;
  notes?: string;
};

export async function POST(req: NextRequest) {
  const sharedKey = req.headers.get('x-shared-key') ?? '';
  const expected = process.env.REFUND_SHARED_KEY;
  if (!expected || sharedKey !== expected) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as Body;
    const email = body.email?.trim();
    const answers = body.answers;

    if (!email || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }

    const db = getDb();
    await db.collection('leads').add({
      email: email.toLowerCase(),
      answers,
      notes: body.notes ?? '',
      source: 'wordpress_homepage',
      createdAt: new Date(),
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? 'https://portal.theclearpath.ae';
    const next = `${baseUrl}/signup?email=${encodeURIComponent(email)}`;
    return NextResponse.json({ ok: true, next });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
