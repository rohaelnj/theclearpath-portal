import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const sig = (await headers()).get('stripe-signature');
  const sk = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !sk || !whsec) {
    return new Response('Missing Stripe config or signature', { status: 400 });
  }

  const stripe = new Stripe(sk, {});
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err: any) {
    return new Response(`Invalid signature: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const amount = (session.amount_total ?? 0) / 100;
    const currency = (session.currency ?? '').toUpperCase();
    const bookingId = (session.metadata?.bookingId ?? '') as string;

    let email: string | undefined = session.customer_details?.email ?? undefined;

    if (!email && typeof session.customer === 'string') {
      const maybeCustomer = await stripe.customers.retrieve(session.customer);
      if (!('deleted' in maybeCustomer)) {
        email = maybeCustomer.email ?? undefined;
      }
    }

    const BREVO_KEY = process.env.BREVO_API_KEY;
    const BREVO_FROM_EMAIL = process.env.BREVO_SENDER_EMAIL;
    const BREVO_FROM_NAME = process.env.BREVO_SENDER_NAME;

    if (email && BREVO_KEY && BREVO_FROM_EMAIL && BREVO_FROM_NAME) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': BREVO_KEY },
          body: JSON.stringify({
            sender: { email: BREVO_FROM_EMAIL, name: BREVO_FROM_NAME },
            to: [{ email }],
            subject: 'Your payment receipt — The Clear Path',
            htmlContent: `
              <h2>Thanks for your payment</h2>
              <p><strong>Booking:</strong> ${bookingId || 'n/a'}</p>
              <p><strong>Amount:</strong> ${amount.toFixed(2)} ${currency}</p>
              <p><strong>Status:</strong> ${session.payment_status}</p>
              ${session.invoice ? `<p>Invoice ID: <code>${session.invoice}</code></p>` : ''}
            `,
          }),
        });
      } catch {
        /* ignore email failure */
      }
    }
  }

  return new Response('ok', { status: 200 });
}

export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
