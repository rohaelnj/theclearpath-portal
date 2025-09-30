import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { aedToFils, PLANS, SESSION } from '@/lib/brand';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' });

type PaymentBody = {
  mode?: 'payment';
  bookingId?: string;
  slotId?: string;
  amountMinor?: number;
  successUrl?: string;
  cancelUrl?: string;
};

type SubscriptionBody = {
  mode: 'subscription';
  plan: keyof typeof PLANS;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
};

type Body = PaymentBody | SubscriptionBody;

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const successUrl = body.successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = body.cancelUrl || `${baseUrl}/cancel`;

    if (body.mode === 'subscription') {
      const plan = PLANS[body.plan];
      if (!plan) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 });

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: body.customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'aed',
              product_data: { name: `${plan.name} — ${plan.sessionsIncluded}×/month` },
              unit_amount: aedToFils(plan.monthlyAED),
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ],
        metadata: { kind: 'subscription', plan: plan.key },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return NextResponse.json({ url: session.url, id: session.id });
    }

    const bookingId = body.bookingId?.trim();
    const slotId = body.slotId?.trim();
    const amountMinor = body.amountMinor;

    if (!bookingId || !slotId || typeof amountMinor !== 'number') {
      return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
    }
    if (!Number.isFinite(amountMinor) || amountMinor <= 0) {
      return NextResponse.json({ error: 'invalid_amount' }, { status: 400 });
    }

    const unitAmount = Math.round(amountMinor);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      currency: 'aed',
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: `Therapy Session (${SESSION.minutes} min)`
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        kind: 'single_session',
        bookingId,
        slotId,
      },
      client_reference_id: bookingId,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
