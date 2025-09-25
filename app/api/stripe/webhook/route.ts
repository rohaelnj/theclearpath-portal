import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const sig = (await headers()).get('stripe-signature');
  const sk = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !sk || !whsec) {
    return new Response('Missing Stripe config', { status: 400 });
  }

  const stripe = new Stripe(sk, { apiVersion: '2024-06-20' });

  // IMPORTANT: use raw body for signature verification
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err: any) {
    return new Response(`Invalid signature: ${err.message}`, { status: 400 });
  }

  // Handle events you care about
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: use session.metadata.bookingId, etc. to fulfill
      break;
    }
    // add more cases as needed
    default:
      break;
  }

  return new Response('ok', { status: 200 });
}

// Optional: fast fail non-POST
export async function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
