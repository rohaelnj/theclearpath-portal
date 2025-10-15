import type { ReactElement } from 'react';
import IntakeForm from './IntakeForm';

export default function IntakePage(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="space-y-4 text-center">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Survey</p>
        <h1 className="text-3xl font-semibold text-neutral-900">Tell us about your goals</h1>
        <p className="text-neutral-600">
          Answer a few questions so we can match you with the right therapist and plan. Your responses save
          automatically.
        </p>
      </div>
      <div className="mt-10">
        <IntakeForm />
      </div>
    </div>
  );
}
