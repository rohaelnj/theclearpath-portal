import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import PlansClient from './PlansClient';
import { sanitizeRedirectPath } from '@/lib/urls';

export const metadata: Metadata = {
  title: 'Recommended Plan | Clear Path Online Therapy',
  description: 'Review your personalised Clear Path therapy recommendation and see why it matches your goals before continuing.',
};

export default function PlansPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}): ReactElement {
  const rawNext =
    typeof searchParams?.next === 'string'
      ? searchParams.next
      : Array.isArray(searchParams?.next)
        ? searchParams.next[0]
        : undefined;
  const nextPath = sanitizeRedirectPath(rawNext ?? null, '/portal');
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PlansClient nextPath={nextPath} />
    </div>
  );
}
