import { NextRequest, NextResponse } from 'next/server';
import { getDb, getCurrentUserServer } from '@/lib/auth-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserServer(req);
    if (!user) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const intake = body?.intake;
    if (!intake || typeof intake !== 'object') {
      return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    }

    if (intake?.riskNow === 'Yes') {
      return NextResponse.json({ ok: false, error: 'crisis_flagged' }, { status: 400 });
    }

    const db = getDb();
    const userRef = db.collection('users').doc(user.uid);
    const now = new Date();

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) {
        throw new Error('user_missing');
      }
      tx.set(
        userRef,
        {
          surveyCompleted: true,
          surveyCompletedAt: now,
          intake,
          updatedAt: now,
        },
        { merge: true },
      );
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    const message = error?.message || 'server_error';
    const status = message === 'user_missing' ? 404 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
