import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firestore';
import { computeRefundForSingle, DEFAULT_FEE, RefundReason, filsToAED } from '@/lib/brand';
import { ga4AdminEvent } from '@/lib/ga4';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

function isAuthorized(req: NextRequest) {
  const hdr = req.headers.get('x-internal-refund-key');
  const expected = process.env.REFUND_SHARED_KEY;
  return !!expected && hdr === expected;
}

type Body = {
  bookingId: string;
  reason: RefundReason;
  overrideAED?: number;
};

export async function POST(req: NextRequest) {
  let body: Body | null = null;
  try {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    body = (await req.json()) as Body;
    const { bookingId, reason, overrideAED } = body;
    if (!bookingId || !reason) return NextResponse.json({ error: 'Missing bookingId|reason' }, { status: 400 });

    const snap = await db.collection('bookings').doc(bookingId).get();
    if (!snap.exists) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    const booking = snap.data() as any;
    const pi: string | undefined = booking?.payment?.stripePaymentIntentId;
    const paidFils: number | undefined = booking?.payment?.amount;
    if (!pi || !paidFils) return NextResponse.json({ error: 'No payment intent/amount' }, { status: 400 });

    const paidAED = filsToAED(paidFils);
    const { refundAED, note } =
      typeof overrideAED === 'number'
        ? { refundAED: overrideAED, note: 'Manual override' }
        : computeRefundForSingle(paidAED, reason, DEFAULT_FEE);

    if (refundAED <= 0) {
      await snap.ref.update({ refundNote: `No refund per policy: ${note}` });
      await ga4AdminEvent('refund_denied', { booking_id: bookingId, note });
      return NextResponse.json({ ok: true, refundAED: 0, note });
    }

    const refund = await stripe.refunds.create({
      payment_intent: pi,
      amount: Math.round(refundAED * 100),
      metadata: { bookingId, reason, note },
    });

    await snap.ref.update({
      'payment.status': 'refunded',
      paymentStatus: 'refunded',
      refundId: refund.id,
      refundNote: note,
    });
    await ga4AdminEvent('refund_approved', { booking_id: bookingId, amount_aed: refundAED });
    return NextResponse.json({ ok: true, refundId: refund.id, refundAED, note });
  } catch (err: any) {
    const message = err?.message || 'Refund failed';
    if (body?.bookingId) {
      await ga4AdminEvent('refund_failed', { booking_id: body.bookingId });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
