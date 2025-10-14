'use client';

import { useEffect, useState } from 'react';

type FormState = {
  reason: string;
  severity: '1' | '2' | '3' | '4' | '5' | '';
  language: 'English' | 'Arabic' | 'Both' | '';
  country: string;
  schedule: 'Weekdays' | 'Evenings' | 'Weekends' | 'Flexible' | '';
  genderPref: 'No preference' | 'Female' | 'Male' | "I'm not sure yet" | '';
  budget: 'Essential' | 'Premium' | 'Executive' | 'Not sure' | '';
  priorTherapy: 'Yes' | 'No' | '';
  riskNow: 'Yes' | 'No' | '';
  dob: string;
};

const initialForm: FormState = {
  reason: '',
  severity: '',
  language: '',
  country: '',
  schedule: '',
  genderPref: '',
  budget: '',
  priorTherapy: '',
  riskNow: '',
  dob: '',
};

export const dynamic = 'force-dynamic';

export default function IntakePage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const crisis = form.riskNow === 'Yes';

  const allAnswered =
    form.reason.trim().length > 2 &&
    Boolean(form.severity) &&
    Boolean(form.language) &&
    Boolean(form.country.trim()) &&
    Boolean(form.schedule) &&
    Boolean(form.genderPref) &&
    Boolean(form.budget) &&
    Boolean(form.priorTherapy) &&
    Boolean(form.riskNow) &&
    /^\d{4}-\d{2}-\d{2}$/.test(form.dob);

  async function submit() {
    setErr(null);
    if (crisis) {
      setErr('We are not an emergency service. If you are in immediate danger in the UAE, call 999 or 998.');
      return;
    }
    if (!allAnswered || submitting) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ intake: form }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'submit_failed');

      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'intake_completed');
      }

      setOk(true);
      window.location.replace('/plans');
    } catch (error: any) {
      setErr(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'intake_started');
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#EDE6DC]">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold text-[#1F4142] md:text-4xl">Two minutes to tailor your plan</h1>
        <p className="mt-2 text-[#365b5a]">Short, confidential, and required before choosing a plan.</p>

        {crisis ? (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            <strong>Emergency help</strong>: If you’re in immediate danger in the UAE, call <span className="font-semibold">999</span>{' '}
            or <span className="font-semibold">998</span>. We’re a non-urgent service.
          </div>
        ) : null}

        {err && !crisis ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{err}</div>
        ) : null}

        <div className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#1F4142]">What brings you here?</label>
            <textarea
              className="mt-2 w-full rounded-xl border border-[#d6cec1] bg-white p-3 outline-none focus:ring-2 focus:ring-[#1F4142]/20"
              rows={3}
              value={form.reason}
              onChange={(event) => setForm({ ...form, reason: event.target.value })}
              placeholder="I’m feeling overwhelmed with work… relationship difficulties… sleep challenges…"
            />
          </div>

          <Fieldset
            label="How intense is this right now?"
            value={form.severity}
            onChange={(value) => setForm({ ...form, severity: value as FormState['severity'] })}
            options={['1', '2', '3', '4', '5']}
            renderLabel={(value) => value}
          />

          <Fieldset
            label="Preferred language"
            value={form.language}
            onChange={(value) => setForm({ ...form, language: value as FormState['language'] })}
            options={['English', 'Arabic', 'Both']}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Which country are you in?"
              value={form.country}
              onChange={(value) => setForm({ ...form, country: value })}
              placeholder="United Arab Emirates"
            />
            <Input
              label="Date of birth"
              type="date"
              value={form.dob}
              onChange={(value) => setForm({ ...form, dob: value })}
            />
          </div>

          <Fieldset
            label="When can you meet?"
            value={form.schedule}
            onChange={(value) => setForm({ ...form, schedule: value as FormState['schedule'] })}
            options={['Weekdays', 'Evenings', 'Weekends', 'Flexible']}
          />

          <Fieldset
            label="Therapist gender preference"
            value={form.genderPref}
            onChange={(value) => setForm({ ...form, genderPref: value as FormState['genderPref'] })}
            options={['No preference', 'Female', 'Male', "I'm not sure yet"]}
          />

           <Fieldset
            label="Budget comfort"
            value={form.budget}
            onChange={(value) => setForm({ ...form, budget: value as FormState['budget'] })}
            options={['Essential', 'Premium', 'Executive', 'Not sure']}
          />

          <Fieldset
            label="Have you been to therapy before?"
            value={form.priorTherapy}
            onChange={(value) => setForm({ ...form, priorTherapy: value as FormState['priorTherapy'] })}
            options={['Yes', 'No']}
          />

          <Fieldset
            label="Are you at risk of harming yourself or others right now?"
            value={form.riskNow}
            onChange={(value) => setForm({ ...form, riskNow: value as FormState['riskNow'] })}
            options={['No', 'Yes']}
          />
        </div>

        <div className="mt-8">
          <button
            onClick={submit}
            disabled={!allAnswered || submitting || crisis}
            className="inline-flex items-center rounded-full bg-[#1F4142] px-6 py-3 text-white transition disabled:opacity-40"
          >
            {submitting ? 'Saving…' : 'Continue (≈2 min)'}
          </button>
          {ok ? <span className="ml-3 text-[#1F4142]">Saved.</span> : null}
        </div>

        <p className="mt-6 text-xs text-[#1F4142]/70">
          Private &amp; encrypted. We only use this to safely match you. You can update it later.
        </p>
      </div>
    </main>
  );
}

function Fieldset({
  label,
  value,
  onChange,
  options,
  renderLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  renderLabel?: (value: string) => string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#1F4142]">{label}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <label
              key={option}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                active ? 'border-[#1F4142] bg-white' : 'border-[#d6cec1] bg-white/80 hover:bg-white'
              }`}
            >
              <input type="radio" className="mr-2" checked={active} onChange={() => onChange(option)} />
              <span className="text-[#1F4142]">{renderLabel ? renderLabel(option) : option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F4142]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-[#d6cec1] bg-white p-3 outline-none focus:ring-2 focus:ring-[#1F4142]/20"
      />
    </div>
  );
}
