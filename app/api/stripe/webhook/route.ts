import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, FieldValue } from '@/lib/firestore';
import { Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const db = getDb();

async function readRawBody(req: NextRequest): Promise<Buffer> {
  if (!req.body) {
    const text = await req.text();
    return Buffer.from(text || '', 'utf8');
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

async function markPaid({
  bookingId,
  pi,
  amount,
  currency,
  sessionId,
}: {
  bookingId: string;
  pi: string;
  amount: number;
  currency: string;
  sessionId?: string;
}) {
  const ref = db.collection('bookings').doc(bookingId);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;

    const data = snap.data() as Record<string, any>;
    const existing = data?.payment?.status;
    if (existing === 'paid' || existing === 'refunded') return;

    const payment = {
      amount,
      currency: currency.toUpperCase(),
      status: 'paid',
      stripePaymentIntentId: pi,
      ...(sessionId ? { stripeCheckoutSessionId: sessionId } : {}),
    };

    const updates: Record<string, any> = {
      payment,
      paymentStatus: 'paid',
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (currency.toLowerCase() === 'aed') {
      updates.priceAED = Math.round(amount) / 100;
    } else if (data?.priceAED !== undefined) {
      updates.priceAED = data.priceAED;
    }

    if (!data?.status || data.status === 'pending') {
      updates.status = 'confirmed';
    }

    const slotId = data?.slotId as string | undefined;
    if (slotId) {
      const slotRef = db.collection('slots').doc(slotId);
      const slotSnap = await tx.get(slotRef);
      if (slotSnap.exists) {
        const slot = slotSnap.data() as Record<string, any>;
        if (slot?.status !== 'booked') {
          tx.update(slotRef, { status: 'booked', heldUntil: null });
        }
      }

      const room = `tcp-${bookingId}`;
      const jitsi = {
        room,
        url: `https://meet.jit.si/${room}`,
      };

      if (!data?.jitsi) {
        updates.jitsi = jitsi;
      }
    }

    tx.update(ref, updates);
  });
}

async function saveAudit(event: Stripe.Event) {
  const auditRef = db.collection('audit_webhooks').doc(event.id);
  await auditRef.set(
    {
      created: FieldValue.serverTimestamp(),
      type: event.type,
      livemode: event.livemode,
      data: event.data,
    },
    { merge: true },
  );
}

async function ensureSubscriptionMetadata(session: Stripe.Checkout.Session) {
  if (!session.subscription) return;

  const plan = session.metadata?.plan || null;
  const customerId = session.customer as string | null;
  const subId = session.subscription as string;
  const subscription = (await stripe.subscriptions.retrieve(subId)) as Stripe.Subscription & {
    current_period_end?: number | null;
  };
  const periodEnd = subscription.current_period_end
    ? Timestamp.fromMillis(subscription.current_period_end * 1000)
    : null;

  if (!session.customer_email) return;

  const userQ = await db.collection('users').where('email', '==', session.customer_email).limit(1).get();
  if (userQ.empty) return;

  const doc = userQ.docs[0];
  const userRef = doc.ref;
  const status =
    subscription.status === 'active'
      ? 'active'
      : subscription.status === 'trialing'
      ? 'trialing'
      : subscription.status === 'incomplete'
      ? 'incomplete'
      : subscription.status ?? 'unknown';

  const isActive = status === 'active' || status === 'trialing';
  const now = FieldValue.serverTimestamp();

  const updates: Record<string, unknown> = {
    subscription: {
      plan,
      status,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subId,
      currentPeriodEnd: periodEnd,
    },
    subscriptionActive: isActive,
    planSelected: true,
    updatedAt: now,
  };

  const data = doc.data();
  if (plan && data?.planKey !== plan) {
    updates.planKey = plan;
  }
  if (!data?.planSelectedAt) {
    updates.planSelectedAt = now;
  }
  if (isActive) {
    updates.subscriptionActivatedAt = now;
  }

  await userRef.set(updates, { merge: true });
}

export async function POST(req: NextRequest) {
  try {
    const sig = req.headers.get('stripe-signature') || '';
    const whsec = process.env.STRIPE_WEBHOOK_SECRET;
    if (!whsec) {
      return NextResponse.json({ error: 'Missing STRIPE_WEBHOOK_SECRET' }, { status: 500 });
    }

    const raw = await readRawBody(req);

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, whsec);
    } catch (err: any) {
      return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
    }

    await saveAudit(event);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = (session.client_reference_id || session.metadata?.bookingId || '') as string;
        const pi = (session.payment_intent as string) || '';
        const amount = session.amount_total ?? 0;
        const currency = session.currency ?? 'aed';

        if (bookingId && pi && amount > 0) {
          await markPaid({ bookingId, pi, amount, currency, sessionId: session.id });
        }

        if (session.metadata?.kind === 'subscription') {
          await ensureSubscriptionMetadata(session);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice & {
          payment_intent?: string | Stripe.PaymentIntent | null;
        };
        if (invoice.parent?.type === 'subscription_details') break; // handled in subscription flow

        const paymentIntentRef = invoice.payment_intent;
        const pi =
          typeof paymentIntentRef === 'string'
            ? paymentIntentRef
            : paymentIntentRef?.id || '';
        const amount = invoice.amount_paid ?? 0;
        const currency = invoice.currency ?? 'aed';

        let bookingId = invoice.metadata?.bookingId as string | undefined;
        if (!bookingId && pi) {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 });
          const session = sessions.data[0];
          bookingId = (session?.client_reference_id || session?.metadata?.bookingId) as string | undefined;
        }

        if (bookingId && pi && amount > 0) {
          await markPaid({ bookingId, pi, amount, currency });
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const pi = intent.id;
        const amount = intent.amount_received ?? intent.amount ?? 0;
        const currency = intent.currency ?? 'aed';

        let bookingId = intent.metadata?.bookingId as string | undefined;
        if (!bookingId) {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: pi, limit: 1 });
          const session = sessions.data[0];
          bookingId = (session?.client_reference_id || session?.metadata?.bookingId) as string | undefined;
        }

        if (bookingId && amount > 0) {
          await markPaid({ bookingId, pi, amount, currency });
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
        if (pi) {
          const q = await db.collection('bookings').where('payment.stripePaymentIntentId', '==', pi).limit(1).get();
          if (!q.empty) {
            await q.docs[0].ref.update({
              'payment.status': 'refunded',
              paymentStatus: 'refunded',
              refundId: charge.refunds?.data?.[0]?.id ?? null,
              refundNote: 'Stripe refund webhook',
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'webhook error' }, { status: 500 });
  }
}
