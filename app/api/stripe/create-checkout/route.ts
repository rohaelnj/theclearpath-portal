import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { aedToFils, PLANS, SESSION } from '@/lib/brand';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

type Body =
  | { mode: 'payment'; bookingId: string; amountAED?: number; successUrl?: string; cancelUrl?: string }
  | { mode: 'subscription'; plan: keyof typeof PLANS; customerEmail: string; successUrl?: string; cancelUrl?: string };

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;
    const successUrl = (body as any).successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = (body as any).cancelUrl || `${baseUrl}/cancel`;

    if (body.mode === 'payment') {
      const amountAED = body.amountAED ?? SESSION.singlePriceAED;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        currency: 'aed',
        line_items: [
          {
            price_data: {
              currency: 'aed',
              product_data: { name: `Single Therapy Session (${SESSION.singlePriceAED} AED, ${SESSION.minutes} min)` },
              unit_amount: aedToFils(amountAED),
            },
            quantity: 1,
          },
        ],
        metadata: { kind: 'single_session', bookingId: body.bookingId },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return NextResponse.json({ url: session.url, id: session.id });
    }

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

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 400 });
  }
}
