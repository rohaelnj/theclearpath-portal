'use client';

import type { ReactElement } from 'react';
import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { IntakeAnswers } from '@/lib/plans';
import { buildRationale, decodeIntakeCookie, selectPlan } from '@/lib/plans';
import { sanitizeRedirectPath } from '@/lib/urls';

type PlansClientProps = {
  nextPath?: string;
};

export default function PlansClient({ nextPath }: PlansClientProps): ReactElement {
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const router = useRouter();

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((entry) => entry.startsWith('intake='));
      if (cookie) {
        const raw = decodeURIComponent(cookie.split('=').slice(1).join('='));
        const parsed = decodeIntakeCookie(raw);
        setAnswers(parsed);
      }
    } catch {
      setAnswers({});
    }
  }, []);

  const plan = useMemo(() => selectPlan(answers), [answers]);
  const rationale = useMemo(() => buildRationale(plan.name, answers), [plan.name, answers]);
  const destination = useMemo(() => sanitizeRedirectPath(nextPath ?? null, '/portal'), [nextPath]);
  const continueLabel = destination === '/portal' ? 'Enter your portal' : 'Continue';

  return (
    <div>
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-700">Your recommended plan</p>
        <h1 className="text-3xl font-semibold text-neutral-900">{plan.name}</h1>
        <p className="text-neutral-600">
          Based on your intake responses, this plan offers the structure and support that best aligns with your needs.
        </p>
      </div>

      <section className="mt-10 rounded-3xl border border-primary/20 bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-900">{plan.name}</h2>
            <p className="text-sm uppercase tracking-wide text-primary">Recommended</p>
            <h3 className="text-lg font-semibold text-primary">Why this plan</h3>
            <p className="text-neutral-600">{rationale}</p>
          </div>
          <div className="text-right">
            <p className="text-sm uppercase tracking-wide text-neutral-700">Estimated investment</p>
            <p className="text-3xl font-semibold text-neutral-900">AED —</p>
            <p className="text-sm text-neutral-700">Final pricing confirmed at checkout.</p>
          </div>
        </div>

        <ul className="mt-8 grid gap-3 text-sm text-neutral-700">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
          <button
            type="button"
            onClick={() => router.push(destination as Route)}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {continueLabel}
          </button>
          <Link
            href={'/patient/sessions' as Route}
            className="text-sm font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Already subscribed? Go to your portal
          </Link>
        </div>
      </section>
    </div>
  );
}
