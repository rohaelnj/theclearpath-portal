// app/booking/[slug]/page.tsx
export const dynamic = 'force-dynamic';

type Search = Record<string, string | string[] | undefined>;

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const search = await searchParams;

  const cancelled = typeof search.payment === 'string' && search.payment === 'cancelled';

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Booking {slug}</h1>
      {cancelled && <p className="mt-2 text-orange-700">Payment cancelled.</p>}
      <a className="mt-6 inline-block underline" href="/">
        Back to home
      </a>
    </main>
  );
}
