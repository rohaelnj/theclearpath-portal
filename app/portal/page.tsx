'use client';

import type { ReactElement } from 'react';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthClient } from '@/lib/firebase';
import type { PlanRecommendation } from '@/lib/plans';
import { buildRationale, decodeIntakeCookie, selectPlan } from '@/lib/plans';

type PlanSummary = PlanRecommendation & { rationale: string };

export default function Portal(): ReactElement {
  const [email, setEmail] = useState<string | null>(null);
  const [surveyComplete, setSurveyComplete] = useState<boolean | null>(null);
  const [planSummary, setPlanSummary] = useState<PlanSummary | null>(null);

  useEffect(() => {
    const auth = getAuthClient();
    if (!auth.currentUser) {
      window.location.replace('/login');
      return;
    }
    setEmail(auth.currentUser.email ?? null);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('surveyCompleted');
      setSurveyComplete(stored === 'true');
    } catch {
      setSurveyComplete(null);
    }
  }, []);

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((entry) => entry.startsWith('intake='));
      if (!cookie) return;

      const raw = decodeURIComponent(cookie.split('=').slice(1).join('='));
      const answers = decodeIntakeCookie(raw);
      if (Object.keys(answers).length === 0) return;

      const plan = selectPlan(answers);
      const rationale = buildRationale(plan.name, answers);
      setPlanSummary({ ...plan, rationale });
    } catch {
      setPlanSummary(null);
    }
  }, []);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-neutral-600">Dashboard</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Welcome{email ? `, ${email}` : ''}</h1>
        <p className="text-sm text-neutral-600">
          Track your sessions, keep your intake details current, and jump back into your recommended plan.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Upcoming sessions</h2>
          <p className="mt-2 text-neutral-700">No upcoming sessions yet.</p>
          <Link
            href="/plans"
            className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Book a session
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Intake status</h2>
          {surveyComplete === true ? (
            <>
              <p className="mt-2 text-neutral-700">
                Thanks for sharing your goals. Update your answers anytime to refresh your recommendations.
              </p>
              <Link
                href="/intake"
                className="mt-4 inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Review intake
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-neutral-700">
                Complete the nine-question intake so we can match you with the right therapist and plan.
              </p>
              <Link
                href="/intake"
                className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Complete intake
              </Link>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900">Recommended plan</h2>
          {planSummary ? (
            <>
              <p className="mt-2 text-neutral-700">
                {planSummary.rationale}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-700">
                {planSummary.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/plans"
                className="mt-4 inline-flex items-center rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium transition hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Review full plan
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-neutral-700">
                Finish your intake to unlock a personalised recommendation and session cadence.
              </p>
              <Link
                href="/intake"
                className="mt-4 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Start intake
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-white p-6 shadow-sm md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Need a hand?</h2>
          <p className="mt-2 max-w-2xl text-neutral-700">
            Our support team can help with scheduling, billing, or finding the right therapist fit. We typically reply
            within one business day.
          </p>
        </div>
        <Link
          href={'/support' as Route}
          className="mt-4 inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:mt-0"
        >
          Visit support
        </Link>
      </div>
    </section>
  );
}
