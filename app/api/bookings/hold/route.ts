import { NextRequest, NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { db, slotId, FieldValue } from '@/lib/firestore';
import { aedToFils, SESSION } from '@/lib/brand';

type Body = {
  tid: string;
  uid: string;
  startIso: string; // ISO in UTC
};

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const { tid, uid, startIso } = body;
    if (!tid || !uid || !startIso) {
      return NextResponse.json({ error: 'Missing tid|uid|startIso' }, { status: 400 });
    }

    const startDate = new Date(startIso);
    if (Number.isNaN(startDate.getTime())) {
      return NextResponse.json({ error: 'Invalid startIso' }, { status: 400 });
    }

    const start = Timestamp.fromDate(startDate);
    const end = Timestamp.fromDate(new Date(startDate.getTime() + SESSION.minutes * 60000));
    const id = slotId(tid, startIso);
    const slotRef = db.collection('slots').doc(id);
    const bookingRef = db.collection('bookings').doc();

    await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(slotRef);
      if (!snapshot.exists) throw new Error('Slot not found');
      const slot = snapshot.data() as any;
      if (slot.status !== 'open') throw new Error('Slot not open');

      const heldUntil = Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));
      tx.update(slotRef, { status: 'held', heldUntil });

      tx.set(bookingRef, {
        tid,
        uid,
        slotId: id,
        start,
        end,
        status: 'pending',
        payment: {
          status: 'pending',
          amount: aedToFils(SESSION.singlePriceAED),
          currency: 'AED',
        },
        createdAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({
      bookingId: bookingRef.id,
      slotId: id,
      amountFils: aedToFils(SESSION.singlePriceAED),
      minutes: SESSION.minutes,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Hold failed' }, { status: 400 });
  }
}
