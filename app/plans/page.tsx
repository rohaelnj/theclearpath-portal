import Link from 'next/link';
import { getDb, getCurrentUserServer } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

const PLANS = [
  { name: 'Essential', blurb: 'Four 50-minute sessions each month', price: 'AED 1,600 / month' },
  { name: 'Premium', blurb: 'Essential plus weekday secure messaging', price: 'AED 1,990 / month' },
  { name: 'Executive', blurb: 'Priority scheduling & monthly extras', price: 'AED 2,490 / month' },
];

function recommend(intake: any) {
  if (!intake) return 'Essential';
  if (intake?.budget === 'Essential') return 'Essential';
  if (['4', '5'].includes(intake?.severity) || intake?.schedule === 'Evenings') return 'Premium';
  if (intake?.budget === 'Executive') return 'Executive';
  return 'Essential';
}

export default async function PlansPage() {
  const user = await getCurrentUserServer();
  let intake: any = null;

  if (user) {
    try {
      const db = getDb();
      const userSnap = await db.collection('users').doc(user.uid).get();
      intake = userSnap.data()?.intake ?? null;
    } catch (error) {
      console.error('Failed to load intake for recommendation', error);
    }
  }

  const recommended = recommend(intake);

  return (
    <main className="min-h-screen bg-[#EDE6DC]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-[#1F4142]">Choose your plan</h1>
        <p className="mt-2 text-[#365b5a]">Confidential, flexible, and online. You can adjust or pause later.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isRecommended = plan.name === recommended;
            return (
              <div key={plan.name} className="rounded-2xl border border-[#d6cec1] bg-white p-6 shadow-sm">
                {isRecommended ? (
                  <span className="inline-flex rounded-full bg-[#1F4142] px-3 py-1 text-xs font-medium text-white">
                    Recommended
                  </span>
                ) : null}
                <h2 className="mt-3 text-xl font-semibold text-[#1F4142]">{plan.name}</h2>
                <p className="mt-2 text-sm text-[#365b5a]">{plan.blurb}</p>
                <p className="mt-4 text-sm font-medium text-[#1F4142]">{plan.price}</p>
                <Link
                  href="/signup"
                  className="mt-6 inline-block rounded-full bg-[#1F4142] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Continue
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-[#1F4142]/80">Transparent pricing. No hidden fees. Pause or change anytime.</p>
      </div>
    </main>
  );
}
