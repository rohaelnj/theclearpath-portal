import Stripe from 'stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Search = Promise<{ session_id?: string; booking?: string }>; 

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id;
  const booking = sp.booking ?? '';

  if (!sessionId) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-semibold">Payment received</h1>
        <p className="mt-2">Missing session_id. If you paid successfully, you can close this tab.</p>
      </main>
    );
  }

  const sk = process.env.STRIPE_SECRET_KEY!;
  const stripe = new Stripe(sk, {});

  let status = 'unknown';
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    status = session.payment_status ?? 'unknown';
  } catch {
    status = 'unknown';
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Payment status</h1>
      <p className="mt-2">
        Booking: <strong>{booking || 'n/a'}</strong>
      </p>
      <p className="mt-2">
        Stripe session: <code>{sessionId}</code>
      </p>
      <p className="mt-2">
        Status: <strong>{status}</strong>
      </p>
      <a className="mt-6 inline-block underline" href="/">
        Back to home
      </a>
    </main>
  );
}
