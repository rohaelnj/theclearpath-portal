'use client';

import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';

type PlanName = 'Intensive Weekly' | 'Weekly' | 'Bi-weekly';

type IntakeAnswers = {
  anxiety?: string;
  sleep?: string;
  risk?: string;
  goal?: string;
  therapistGender?: string;
};

export default function PlansClient(): ReactElement {
  const [answers, setAnswers] = useState<IntakeAnswers>({});

  useEffect(() => {
    try {
      const cookie = document.cookie
        .split(';')
        .map((item) => item.trim())
        .find((entry) => entry.startsWith('intake='));
      if (cookie) {
        const raw = decodeURIComponent(cookie.split('=').slice(1).join('='));
        const parsed = JSON.parse(raw) as IntakeAnswers;
        setAnswers(parsed);
      }
    } catch {
      setAnswers({});
    }
  }, []);

  const plan = useMemo(() => selectPlan(answers), [answers]);
  const rationale = useMemo(() => buildRationale(plan.name, answers), [plan.name, answers]);

  return (
    <div>
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Your recommended plan</p>
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
            <p className="text-sm uppercase tracking-wide text-neutral-500">Estimated investment</p>
            <p className="text-3xl font-semibold text-neutral-900">AED —</p>
            <p className="text-sm text-neutral-500">Final pricing confirmed at checkout.</p>
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
            onClick={() => alert('Proceed to checkout')}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Continue to checkout
          </button>
          <a href="/patient/sessions" className="text-sm font-medium text-primary hover:underline">
            Already subscribed? Go to your Portal
          </a>
        </div>
      </section>
    </div>
  );
}

function selectPlan(answers: IntakeAnswers): { name: PlanName; features: string[] } {
  if (answers.risk === 'yes' || ['often', 'always'].includes(answers.anxiety ?? '')) {
    return {
      name: 'Intensive Weekly',
      features: [
        '1:1 therapy sessions every week',
        'Dedicated clinician for high-support concerns',
        'Priority messaging between sessions',
        'Weekly progress tracking and adjustments',
      ],
    };
  }

  if (['poor', 'very_poor'].includes(answers.sleep ?? '')) {
    return {
      name: 'Weekly',
      features: [
        'Four sessions per month with flexible scheduling',
        'Personalised sleep hygiene guidance',
        'Goal tracking dashboard inside the portal',
        'Therapist check-ins to keep momentum',
      ],
    };
  }

  return {
    name: 'Bi-weekly',
    features: [
      'Two sessions per month focused on steady progress',
      'Action plans between sessions',
      'Self-guided resources aligned with your goals',
      'Easy rescheduling inside the portal',
    ],
  };
}

function buildRationale(planName: PlanName, answers: IntakeAnswers): string {
  const reasons: string[] = [];

  if (answers.anxiety && ['often', 'always'].includes(answers.anxiety)) {
    reasons.push('you noted experiencing frequent anxiety');
  }
  if (answers.sleep && ['poor', 'very_poor'].includes(answers.sleep)) {
    reasons.push('your sleep quality could use structured support');
  }
  if (answers.risk === 'yes') {
    reasons.push('we prioritised high-touch care to keep you safe and supported');
  }
  if (answers.therapistGender && answers.therapistGender !== 'no_preference') {
    reasons.push(`we will match you with a ${answers.therapistGender} therapist per your preference`);
  }
  if (answers.goal) {
    reasons.push(`and we’ll focus sessions on "${answers.goal}"`);
  }

  if (!reasons.length) {
    return `${planName} balances steady progress with flexibility—ideal for continuing your wellbeing journey.`;
  }

  return `We recommended ${planName.toLowerCase()} care because ${formatReasons(reasons)}.`;
}

function formatReasons(reasons: string[]): string {
  if (reasons.length === 1) {
    return reasons[0];
  }
  const last = reasons.pop();
  return `${reasons.join(', ')} and ${last}`;
}
