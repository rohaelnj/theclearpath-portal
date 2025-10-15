import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Clear Path — Online Therapy in Dubai & UAE',
  description:
    'Confidential, convenient online therapy in Dubai and across the UAE. Licensed therapists provide tailored support for anxiety, depression, couples counseling, and more.',
  alternates: {
    canonical: 'https://portal.theclearpath.ae/',
  },
  openGraph: {
    title: 'Clear Path — Online Therapy in Dubai & UAE',
    description:
      'Confidential, convenient counseling from licensed UAE therapists. Begin your Clear Path intake to receive a personalized therapy plan.',
    url: 'https://portal.theclearpath.ae/',
    siteName: 'The Clear Path',
    type: 'website',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Clear Path — Online Therapy in Dubai & UAE',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clear Path — Online Therapy in Dubai & UAE',
    description:
      'Start your intake to get matched with a licensed therapist in Dubai. Confidential, flexible online therapy tailored to your goals.',
    images: ['/og.jpg'],
  },
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-16 px-6 py-16">
      <section className="grid items-center gap-12 md:grid-cols-2">
        <div className="max-w-xl space-y-6">
          <p className="text-sm tracking-widest text-black/60">YOUR PATH TO CALM</p>
          <h1 className="text-5xl font-bold text-black">Find clarity with online therapy in Dubai</h1>
          <p className="text-lg text-black/70">
            Clear Path connects you with licensed UAE therapists for private, flexible video sessions.
          </p>
          <Link
            href="/intake"
            className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Begin your intake
          </Link>
        </div>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
          <Image
            src="/hero.jpg"
            alt="Clear Path hero"
            width={1600}
            height={900}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="text-3xl font-semibold tracking-tight">Why people choose Clear Path</h2>
        <ul className="grid gap-6 md:grid-cols-2">
          <li className="rounded-2xl bg-surface2/40 p-6 shadow transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-semibold text-neutral-900">Personalized guidance</h3>
            <p className="mt-3 text-neutral-600">
              Your intake survey helps us recommend the right therapist and plan, tailored to your goals and preferences.
            </p>
          </li>
          <li className="rounded-2xl bg-surface2/40 p-6 shadow transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-semibold text-neutral-900">Confidential by design</h3>
            <p className="mt-3 text-neutral-600">
              We prioritise discretion at every step, with secure video sessions and private portal access for clients
              and therapists.
            </p>
          </li>
          <li className="rounded-2xl bg-surface2/40 p-6 shadow transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-semibold text-neutral-900">Specialists across modalities</h3>
            <p className="mt-3 text-neutral-600">
              Access clinicians experienced in CBT, couples therapy, child &amp; teen support, trauma, and more—available
              in English, Arabic, and additional languages.
            </p>
          </li>
          <li className="rounded-2xl bg-surface2/40 p-6 shadow transition hover:-translate-y-1 hover:shadow-md">
            <h3 className="text-xl font-semibold text-neutral-900">Built for the GCC lifestyle</h3>
            <p className="mt-3 text-neutral-600">
              Evening and weekend sessions fit busy schedules in Dubai and across the GCC, with pricing aligned to the
              region.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold tracking-tight">Therapy that meets you where you are</h2>
        <p className="text-lg text-neutral-700">
          Clear Path supports individuals, couples, teens, and families with evidence-based care. Explore a few of the
          areas we help clients navigate:
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            'Anxiety & Panic',
            'Depression',
            'Couples Counseling',
            'Child & Teen Therapy',
            'ADHD & Neurodiversity',
            'Stress & Burnout',
            'Trauma Recovery',
            'Arabic-speaking Therapists',
            'Women’s Mental Health',
            'Executive Coaching',
          ].map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-white p-8 shadow-md md:p-12">
        <h2 className="text-3xl font-semibold tracking-tight">What clients share</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <figure className="space-y-4">
            <blockquote className="text-lg text-neutral-700">
              “My therapist understood my cultural context and made space for real change. Booking sessions around my
              schedule has been a game changer.”
            </blockquote>
            <figcaption className="text-sm font-medium text-neutral-500">— A.S., Dubai</figcaption>
          </figure>
          <figure className="space-y-4">
            <blockquote className="text-lg text-neutral-700">
              “I felt supported from the first intake question. The process was discreet, professional, and uplifting.”
            </blockquote>
            <figcaption className="text-sm font-medium text-neutral-500">— M.K., Abu Dhabi</figcaption>
          </figure>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm md:p-12">
        <h2 className="text-3xl font-semibold tracking-tight">Ready for a calmer, more confident you?</h2>
        <p className="mt-4 text-lg text-neutral-700">
          It starts with a five-minute intake. We’ll recommend the right therapist and plan, then guide you straight into
          your secure portal.
        </p>
        <div className="mt-6 flex justify-center">
          <Link
            href="/intake"
            className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-md transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Begin your intake
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How does Clear Path work?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Start with our secure intake survey, receive a personalized plan, and book confidential online sessions with licensed therapists based in Dubai.',
                },
              },
              {
                '@type': 'Question',
                name: 'Is my information confidential?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Yes. Clear Path uses encrypted systems and strict privacy controls to ensure your therapy journey remains private end-to-end.',
                },
              },
              {
                '@type': 'Question',
                name: 'Which concerns do your therapists support?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Our therapists help with anxiety, depression, burnout, couples counseling, ADHD assessments, child and teen therapy, trauma recovery, and more.',
                },
              },
            ],
          }),
        }}
      />
    </main>
  );
}
