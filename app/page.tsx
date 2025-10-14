import Link from 'next/link';

export default function Home() {
  return (
    <section className="grid items-center gap-10 md:grid-cols-2">
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#1F4142] md:text-5xl">
          A new beginning, in confidence
        </h1>
        <p className="text-lg text-[#365b5a]">
          Discreet online therapy from licensed UAE clinicians—flexible, affordable, and deeply private.
        </p>
        <div className="flex gap-3">
          <Link
            href="/intake"
            className="rounded-full bg-[#1F4142] px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Start your clear path
          </Link>
          <Link
            href="/plans"
            className="rounded-full border border-neutral-300 px-6 py-3 font-medium transition hover:bg-neutral-50"
          >
            View plans
          </Link>
        </div>
        <div className="flex flex-wrap gap-6 pt-2 text-sm text-neutral-600">
          <span>Private &amp; encrypted</span>
          <span>Licensed UAE therapists</span>
          <span>Online, on your schedule</span>
        </div>
      </div>

      <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100 md:block">
        <img src="/hero.jpg" alt="Calm, private, online therapy" className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-white/10" />
      </div>
    </section>
  );
}
