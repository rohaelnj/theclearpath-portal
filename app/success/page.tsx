export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import Image from 'next/image';
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
  if (sessionId !== 'unknown' && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
    status = session?.payment_status ?? 'unknown';
  }

  return (
    <div className="min-h-screen bg-[#e8e0d5] text-[#1f3a37] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-[#1f3a37]/10 bg-[#e8e0d5] flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="The Clear Path"
              width={40}
              height={40}
              className="object-contain"
              onError={(event) => {
                const target = event.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-xl font-semibold">Payment status</h1>
        </div>

        <p className="text-sm text-[#1f3a37]/70">
          Thank you for choosing <span className="font-medium">The Clear Path</span>. Your payment has been
          processed.
        </p>

        <div className="mt-6 grid gap-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-[#1f3a37]/60">Booking</span>
            <span className="font-medium">{booking}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-[#1f3a37]/60">Stripe session</span>
            <span className="font-mono text-xs truncate max-w-[60%]">{sessionId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#1f3a37]/60">Status</span>
            <span className="font-semibold capitalize">{status === 'paid' ? 'Paid' : status}</span>
          </div>
        </div>

        <p className="mt-4 text-xs text-[#1f3a37]/60">
          A receipt will arrive by email. If you don’t see it, please check spam or promotions.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-[#1f3a37] px-4 py-2 text-white hover:opacity-95 transition"
          >
            Back to home
          </a>
          <a
            href={`/booking/${booking}`}
            className="text-[#1f3a37] underline underline-offset-4 hover:opacity-80"
          >
            Manage booking
          </a>
        </div>
      </div>
    </div>
  );
}
