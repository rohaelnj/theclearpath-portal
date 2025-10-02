import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firestore';
import type { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get('uid')?.trim();
    if (!uid) {
      return NextResponse.json({ error: 'missing_uid' }, { status: 400 });
    }

    const db = getDb();
    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: 'user_not_found' }, { status: 404 });
    }

    const { assignedTid } = userSnap.data() as { assignedTid?: string };
    if (!assignedTid) {
      return NextResponse.json({ error: 'no_assigned_therapist' }, { status: 409 });
    }

    const now = new Date();
    const q = await db
      .collection('slots')
      .where('tid', '==', assignedTid)
      .where('status', '==', 'open')
      .where('start', '>', now)
      .orderBy('start', 'asc')
      .limit(100)
      .get();

    type SlotData = {
      tid?: string;
      start?: Timestamp;
      end?: Timestamp;
    };

    const slots = q.docs.map((doc) => {
      const data = doc.data() as SlotData;
      const startIso = data.start ? data.start.toDate().toISOString() : null;
      const endIso = data.end ? data.end.toDate().toISOString() : null;
      return {
        slotId: doc.id,
        tid: data.tid ?? assignedTid,
        startIso,
        endIso,
      };
    });

    return NextResponse.json({ ok: true, assignedTid, slots });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
