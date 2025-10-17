export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Stripe from 'stripe';

type Search = Record<string, string | string[] | undefined>;

type Props = {
  searchParams: Promise<Search>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const booking = (sp.booking as string) ?? 'unknown';
  const sessionId = (sp.session_id as string) ?? 'unknown';

  let status = 'unknown';
  if (
    sessionId !== 'unknown' &&
    sessionId.startsWith('cs_') &&
    process.env.STRIPE_SECRET_KEY
  ) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-08-27.basil',
      });
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      status = session.payment_status ?? 'unknown';
    } catch {
      status = 'unknown';
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-6 text-primary">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-lg ring-1 ring-black/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-stone-100 ring-1 ring-primary/10">
            <img src="/logo.png" alt="The Clear Path" width={40} height={40} />
          </div>
          <h1 className="text-xl font-semibold">Payment status</h1>
        </div>

        <p className="text-sm text-primary/70">
          Thank you for choosing <span className="font-medium">The Clear Path</span>.
        </p>

        <div className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between border-b pb-2 text-sm">
            <span className="text-primary/60">Booking</span>
            <span className="font-medium">{booking}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-primary/60">Stripe session</span>
            <span className="font-mono text-xs truncate max-w-[60%]">{sessionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-primary/60">Status</span>
            <span className="font-semibold capitalize">
              {status === 'paid' ? 'Paid' : status}
            </span>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
          >
            Back to home
          </a>
          <a
            href={`/booking/${booking}`}
            className="text-primary underline underline-offset-4 hover:opacity-80"
          >
            Manage booking
          </a>
        </div>
      </div>
    </div>
  );
}
