// app/booking/[slug]/page.tsx
export default function BookingPage({ params, searchParams }: { params: { slug: string }; searchParams?: Record<string, string | string[] | undefined> }) {
  const cancelled = typeof searchParams?.payment === 'string' && searchParams?.payment === 'cancelled';

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold">Booking {params.slug}</h1>
      {cancelled && <p className="mt-2 text-orange-700">Payment cancelled.</p>}
      <a className="mt-6 inline-block underline" href="/">
        Back to home
      </a>
    </main>
  );
}
