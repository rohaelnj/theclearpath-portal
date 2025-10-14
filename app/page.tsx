import Image from 'next/image';
import Button from '../components/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#DFD6C7]">
      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center md:flex-row md:items-center md:justify-between md:text-left">
        <div className="mx-auto max-w-2xl">
          <div className="flex justify-center md:justify-start">
            <Image
              src="/logo.png"
              alt="The Clear Path logo"
              width={96}
              height={96}
              className="h-20 w-20 md:h-24 md:w-24"
              priority
            />
          </div>
          <h1 className="mt-8 text-4xl font-bold leading-tight text-[#1F4142] md:text-5xl">
            Licensed online therapy rooted in the UAE
          </h1>
          <p className="mt-4 text-lg text-[#1F4140] md:text-xl">
            Three high-touch plans, one private portal. Therapists reply once per weekday inside 24 hours (Mon–Fri
            10:00–18:00 Gulf time). Cancel anytime with 24 hours’ notice.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:items-start">
            <Button
              variant="cta"
              href="https://portal.theclearpath.ae/start"
              aria-label="Begin intake and secure your plan"
            >
              Start your clear path
            </Button>
            <Button variant="ghost" href="/pricing">
              View plans
            </Button>
          </div>
          <p className="mt-3 text-sm text-[#1F4140]/80">
            Licensed UAE therapists. VAT included.
          </p>
          <ul className="mt-8 space-y-3 text-left text-sm text-[#1F4140]/90 md:text-base">
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#1F4142]" aria-hidden />
              <span>Essential Plan · 1,600 AED/month · four 50-min sessions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#1F4142]" aria-hidden />
              <span>Premium Plan (most popular) · adds weekday secure messaging support.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#1F4142]" aria-hidden />
              <span>Executive Only Plan · 2,990 AED/month · emergency call credits, Future-Self Journal, monthly workshop.</span>
            </li>
          </ul>
        </div>
        <div className="mt-14 w-full max-w-md md:mt-0">
          <div className="rounded-3xl bg-white/80 p-8 shadow-xl shadow-[#1F4142]/10 backdrop-blur">
            <h2 className="text-2xl font-semibold text-[#1F4142]">You’re in steady hands</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#1F4140]">
              Every client completes a triage intake so we can match you with the right therapist. Bookings open 72 hours
              after payment so your therapist has time to prepare for you.
            </p>
            <div className="mt-6 rounded-2xl bg-[#DED4C8]/70 p-4 text-left text-sm text-[#1F4140]">
              <p className="font-semibold">Emergency?</p>
              <p className="mt-1">This platform is non-urgent. If you are in immediate danger in the UAE, call 999 or 998.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
