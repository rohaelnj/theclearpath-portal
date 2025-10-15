import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import PlansClient from './PlansClient';

export const metadata: Metadata = {
  title: 'Recommended Plan | Clear Path Online Therapy',
  description: 'Review your personalised Clear Path therapy recommendation and see why it matches your goals before continuing.',
};

export default function PlansPage(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <PlansClient />
    </div>
  );
}
