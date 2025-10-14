import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firestore';
import { assignTherapist } from '@/lib/match';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  uid?: string;
  answers?: Record<string, string>;
  notes?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const uid = body.uid?.trim();
    const answers = body.answers;

    if (!uid || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }

    const db = getDb();
    const tid = await assignTherapist(db);

    const now = new Date();
    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      {
        assignedTid: tid,
        surveyCompleted: true,
        surveyCompletedAt: now,
        intake: {
          answers,
          notes: body.notes ?? '',
          completedAt: now,
        },
        updatedAt: now,
      },
      { merge: true },
    );

    return NextResponse.json({ ok: true, assignedTid: tid });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error';
    const status = message === 'no_active_therapist' ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
