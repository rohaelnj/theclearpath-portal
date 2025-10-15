'use client';

import type { ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type QuestionKey =
  | 'anxiety'
  | 'sleep'
  | 'country'
  | 'language'
  | 'therapistGender'
  | 'dob'
  | 'priorTherapy'
  | 'risk'
  | 'goal';

type Answers = Record<QuestionKey, string>;

const QUESTION_META: Array<{
  key: QuestionKey;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'radio';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}> = [
  {
    key: 'anxiety',
    label: 'How often have you felt anxious or on edge recently?',
    type: 'select',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'rarely', label: 'Rarely' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'often', label: 'Often' },
      { value: 'always', label: 'Always' },
    ],
  },
  {
    key: 'sleep',
    label: 'How would you rate your recent sleep quality?',
    type: 'select',
    options: [
      { value: 'very_good', label: 'Very good' },
      { value: 'good', label: 'Good' },
      { value: 'fair', label: 'Fair' },
      { value: 'poor', label: 'Poor' },
      { value: 'very_poor', label: 'Very poor' },
    ],
  },
  {
    key: 'country',
    label: 'Where are you located?',
    type: 'text',
    placeholder: 'Country of residence',
  },
  {
    key: 'language',
    label: 'Preferred language for sessions',
    type: 'text',
    placeholder: 'e.g. English, Arabic',
  },
  {
    key: 'therapistGender',
    label: 'Do you have a therapist gender preference?',
    type: 'select',
    options: [
      { value: 'no_preference', label: 'No preference' },
      { value: 'female', label: 'Female therapist' },
      { value: 'male', label: 'Male therapist' },
    ],
  },
  {
    key: 'dob',
    label: 'Date of birth',
    type: 'date',
  },
  {
    key: 'priorTherapy',
    label: 'Have you attended therapy before?',
    type: 'radio',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'risk',
    label: 'Are you currently experiencing thoughts of self-harm or harm to others?',
    type: 'radio',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
    ],
  },
  {
    key: 'goal',
    label: 'What is your main goal for therapy?',
    type: 'textarea',
    placeholder: 'Share a short summary of what you hope to work on.',
  },
];

const REQUIRED_KEYS = ['anxiety', 'sleep', 'country', 'language', 'therapistGender', 'dob', 'priorTherapy', 'risk', 'goal'] as const;
type Key = (typeof REQUIRED_KEYS)[number];

function ga(event: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  w.gtag?.('event', event, params);
}

export default function IntakeForm(): ReactElement {
  const router = useRouter();
  const [answers, setAnswers] = useState<Partial<Answers>>({});
const [saving, setSaving] = useState<Record<QuestionKey, boolean>>({} as Record<QuestionKey, boolean>);
const [saved, setSaved] = useState<Record<QuestionKey, boolean>>({} as Record<QuestionKey, boolean>);
const completionLogged = useRef(false);
const formRef = useRef<HTMLFormElement>(null);
const [complete, setComplete] = useState(false);

  const handleSave = useCallback(async (key: QuestionKey, value: string) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved((prev) => ({ ...prev, [key]: true }));
      ga('survey_question_answered', { question: key, value });
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [key]: false }));
      }, 1500);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  }, []);

  const handleChange = useCallback(
    (key: QuestionKey, value: string) => {
      setAnswers((prev) => ({ ...prev, [key]: value }));
      if (value) {
        void handleSave(key, value);
      }
    },
    [handleSave],
  );

  useEffect(() => {
    if (complete && !completionLogged.current) {
      window.localStorage.setItem('surveyCompleted', 'true');
      ga('survey_completed', { stage: 'survey' });
      completionLogged.current = true;
    }
    if (!complete) {
      completionLogged.current = false;
    }
  }, [complete]);

  useEffect(() => {
    const stored = window.localStorage.getItem('surveyAnswers');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<Answers>;
        setAnswers(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('surveyAnswers', JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const evaluate = () => setComplete(form.checkValidity());
    evaluate();
    form.addEventListener('input', evaluate);
    form.addEventListener('change', evaluate);
    return () => {
      form.removeEventListener('input', evaluate);
      form.removeEventListener('change', evaluate);
    };
  }, []);

  useEffect(() => {
    setComplete(
      REQUIRED_KEYS.every((key) => {
        const value = (answers as Record<Key, string | undefined>)[key];
        return typeof value === 'string' && value.trim() !== '';
      }),
    );
  }, [answers]);


  return (
    <form ref={formRef} className="space-y-8" aria-describedby="intake-help">
      <p id="intake-help" className="text-sm text-neutral-500">
        All questions are required. Your responses save automatically.
      </p>
      {QUESTION_META.map((question) => (
        <div key={question.key} className="space-y-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <label htmlFor={question.key} className="text-sm font-medium text-neutral-900">
            {question.label}
          </label>
          {renderField(question, answers[question.key] ?? '', handleChange)}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{saving[question.key] ? 'Saving…' : saved[question.key] ? 'Saved ✓' : 'Autosaves'}</span>
          </div>
        </div>
      ))}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-neutral-600">When every answer is complete, continue to see your recommended plan.</p>
        <button
          type="button"
          disabled={!complete}
          onClick={() => complete && router.push('/plans')}
          className={`mt-4 ${
            complete
              ? 'rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary'
              : 'rounded-full bg-black/10 px-6 py-3 text-sm font-semibold text-black/50 cursor-not-allowed'
          }`}
          aria-disabled={!complete}
        >
          See your recommended plan
        </button>
      </div>
    </form>
  );
}

function renderField(
  question: (typeof QUESTION_META)[number],
  value: string,
  onChange: (key: QuestionKey, value: string) => void,
): ReactElement {
  const isRequired = REQUIRED_KEYS.includes(question.key as Key);
  const base =
    'w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  switch (question.type) {
    case 'select':
      return (
        <select
          id={question.key}
          name={question.key}
          required={isRequired}
          value={value}
          onChange={(event) => onChange(question.key, event.target.value)}
          className={base}
        >
          <option value="" disabled>
            Select an option
          </option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'textarea':
      return (
        <textarea
          id={question.key}
          name={question.key}
          required={isRequired}
          rows={4}
          value={value}
          placeholder={question.placeholder}
          onChange={(event) => onChange(question.key, event.target.value)}
          className={`${base} resize-none`}
        />
      );
    case 'date':
      return (
        <input
          id={question.key}
          name={question.key}
          required={isRequired}
          type="date"
          value={value}
          onChange={(event) => onChange(question.key, event.target.value)}
          className={base}
        />
      );
    case 'radio':
      return (
        <div className="flex items-center gap-4">
          {question.options?.map((option, index) => {
            const inputId = `${question.key}-${option.value}`;
            return (
              <label key={option.value} htmlFor={inputId} className="inline-flex items-center gap-2 text-sm text-neutral-700">
                <input
                  id={inputId}
                  type="radio"
                  name={question.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(event) => onChange(question.key, event.target.value)}
                  className="h-4 w-4 border-neutral-300 text-primary focus:ring-primary/50"
                  required={isRequired && index === 0}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      );
    case 'text':
    default:
      return (
        <input
          id={question.key}
          name={question.key}
          required={isRequired}
          type="text"
          value={value}
          placeholder={question.placeholder}
          onChange={(event) => onChange(question.key, event.target.value)}
          className={base}
        />
      );
  }
}
