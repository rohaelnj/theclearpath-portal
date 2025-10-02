import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firestore';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Result = { scanned: number; updated: number };

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-shared-key') ?? '';
  if (!process.env.REFUND_SHARED_KEY || key !== process.env.REFUND_SHARED_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const now = Timestamp.now();

  const query = await db
    .collection('bookings')
    .where('status', '==', 'confirmed')
    .where('payment.status', '==', 'paid')
    .where('start', '>', now)
    .limit(200)
    .get();

  let scanned = 0;
  let updated = 0;

  if (query.empty) {
    return NextResponse.json({ scanned, updated } satisfies Result);
  }

  const batch = db.batch();

  query.docs.forEach((doc) => {
    scanned++;
    const data = doc.data() as Record<string, unknown>;
    const jitsi = (data?.jitsi as Record<string, unknown> | undefined) ?? null;
    if (!jitsi || typeof jitsi !== 'object' || typeof jitsi['url'] !== 'string') {
      const bookingId = doc.id;
      const room = `tcp-${bookingId}`;
      const url = `https://meet.jit.si/${room}`;
      batch.update(doc.ref, {
        jitsi: { room, url },
        updatedAt: FieldValue.serverTimestamp(),
      });
      updated++;
    }
  });

  if (updated > 0) {
    await batch.commit();
  }

  return NextResponse.json({ scanned, updated } satisfies Result);
}

export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
