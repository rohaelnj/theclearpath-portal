import { NextRequest, NextResponse } from 'next/server';
import { holdSlotAndDraftBooking } from '@/lib/slots';
import { getDb } from '@/lib/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  bookingId?: string;
  uid?: string;
  startIso?: string;
  priceAED?: number;
  durationMin?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const bookingId = body.bookingId?.trim();
    const uid = body.uid?.trim();
    const startIso = body.startIso?.trim();
    const durationMin = body.durationMin ?? 60;
    const priceAED = body.priceAED;

    if (!bookingId || !uid || !startIso || typeof priceAED !== 'number') {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    if (!Number.isFinite(priceAED) || priceAED <= 0) {
      return NextResponse.json({ error: 'invalid_price' }, { status: 400 });
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

    const booking = await holdSlotAndDraftBooking({
      bookingId,
      uid,
      tid: assignedTid,
      startIso,
      durationMin,
      priceAED,
    });

    return NextResponse.json({ ok: true, booking }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'hold_failed';
    const status = message === 'slot_not_found' ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
