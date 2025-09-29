import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firestore';
import { computeRefundForSingle, DEFAULT_FEE, RefundReason, filsToAED } from '@/lib/brand';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

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
  try {
    if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, reason, overrideAED } = (await req.json()) as Body;
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
      return NextResponse.json({ ok: true, refundAED: 0, note });
    }

    const refund = await stripe.refunds.create({
      payment_intent: pi,
      amount: Math.round(refundAED * 100),
      metadata: { bookingId, reason, note },
    });

    await snap.ref.update({ 'payment.status': 'refunded', refundId: refund.id, refundNote: note });
    return NextResponse.json({ ok: true, refundId: refund.id, refundAED, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Refund failed' }, { status: 400 });
  }
}
