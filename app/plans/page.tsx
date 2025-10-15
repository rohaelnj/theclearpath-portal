import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import PlansClient from './PlansClient';

export const metadata: Metadata = {
  title: 'Recommended Plan — The Clear Path',
  description:
    'Review your personalised therapy plan recommendation based on your intake responses and continue to checkout when ready.',
};

export default function PlansPage(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PlansClient />
    </div>
  );
}
