import { NextRequest, NextResponse } from 'next/server';
import { holdSlotAndDraftBooking } from '@/lib/slots';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  bookingId?: string;
  uid?: string;
  tid?: string;
  startIso?: string;
  priceAED?: number;
  durationMin?: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const bookingId = body.bookingId?.trim();
    const uid = body.uid?.trim();
    const tid = body.tid?.trim();
    const startIso = body.startIso?.trim();
    const durationMin = body.durationMin ?? 60;
    const priceAED = body.priceAED;

    if (!bookingId || !uid || !tid || !startIso || typeof priceAED !== 'number') {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    if (!Number.isFinite(priceAED) || priceAED <= 0) {
      return NextResponse.json({ error: 'invalid_price' }, { status: 400 });
    }

    const booking = await holdSlotAndDraftBooking({
      bookingId,
      uid,
      tid,
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
