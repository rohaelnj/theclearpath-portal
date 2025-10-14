import type { Metadata } from 'next';
import { BRAND, POLICY } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — The Clear Path',
  description: 'Detailed policy covering payments, cancellations, refunds, and clinical boundaries for The Clear Path portal.',
};

const POLICY_SECTIONS: Array<{ title: string; items: string[] }> = [
  {
    title: '1) Payments',
    items: [
      'All sessions and subscriptions are paid in advance.',
      'Prices are listed in AED and include VAT where applicable.',
      'Chargebacks or payment disputes may pause access until resolved.',
    ],
  },
  {
    title: '2) Cancellations and Refunds (Client-initiated)',
    items: [
      'Cancel 24 hours or more before your start time to receive a 100% refund to the original payment method.',
      'Cancel within 24 hours or arrive 15 minutes late (no-show) and the session is non-refundable.',
      'Completed sessions are final and cannot be refunded.',
      'Refund requests must be emailed within 30 days of the session date or original charge; requests after 30 days are not reviewed.',
    ],
  },
  {
    title: '3) Rescheduling and Missed Sessions',
    items: [
      'Each session includes one complimentary reschedule when requested 24+ hours before the start time.',
      'Late cancellations and no-shows are not refundable and must be rebooked at the prevailing rate.',
      `Subscription sessions must be rebooked within ${POLICY.subscriptionCarryForwardDays} days of the original appointment or within the same billing cycle (whichever comes first), otherwise they are forfeited.`,
    ],
  },
  {
    title: '4) Subscriptions',
    items: [
      'You can cancel your plan anytime to stop future renewals.',
      'Weeks already delivered are not refundable.',
      'If a renewal is billed and no sessions have been delivered in that new period, we will pro-rate and refund unused weeks when requested within 30 days.',
    ],
  },
  {
    title: '5) Provider Cancellations',
    items: [
      'If your therapist cancels, you can reschedule at no cost or request a full refund for that session.',
    ],
  },
  {
    title: '6) Exceptional Circumstances',
    items: [
      'Documented emergencies (for example, hospitalisation or bereavement) may qualify for a refund.',
      'Requests must be emailed to support within 30 days of the session date or charge.',
      'Approved refunds are issued minus a 10% administrative fee to the original payment method.',
    ],
  },
  {
    title: '7) Clinical Boundaries',
    items: [
      'Messaging support (when included) is non-urgent and limited to one therapist reply per weekday. It does not replace emergency care.',
      'Sessions may be ended without refund in cases of intoxication, abusive conduct, or safety risks.',
    ],
  },
  {
    title: '8) Processing Times',
    items: ['Approved refunds are processed within 7–10 business days. Bank posting times may vary.'],
  },
  {
    title: '9) Contact',
    items: [
      `Cancellations, rescheduling, and refund requests: ${BRAND.supportEmail}.`,
      'Emergency (UAE): 999 Police, 998 Ambulance.',
    ],
  },
];

export default function RefundAndCancellationPolicyPage() {
  return (
    <main className="bg-[#DED4C8]/40">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-[#1F4142]/10">
          <header className="border-b border-[#1F4142]/15 pb-6">
            <p className="text-sm uppercase tracking-wide text-[#1F4140]/70">Refund & Cancellation Policy — The Clear Path</p>
            <h1 className="mt-2 text-3xl font-bold text-[#1F4142]">Transparent care, clear expectations</h1>
            <p className="mt-3 text-sm text-[#1F4140]/80">Effective date: 9 October 2025 · Scope: All services delivered via portal.theclearpath.ae</p>
            <p className="mt-3 text-sm text-[#1F4140]/80">Messaging replies are limited to one per weekday between 10:00 and 18:00 Gulf time. Please reserve the service for non-urgent matters.</p>
          </header>

          <div className="mt-8 space-y-8 text-[#1F4140]">
            {POLICY_SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-[#1F4142]">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed md:text-base">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#1F4142]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="mt-10 rounded-2xl bg-[#DFD6C7]/60 p-4 text-sm text-[#1F4142]/90">
            Card processing fees from the original transaction are non-refundable when a client initiates the cancellation. Approved refunds are released within 7–10 business days; downstream bank timelines may vary.
          </p>
        </div>
      </div>
    </main>
  );
}
