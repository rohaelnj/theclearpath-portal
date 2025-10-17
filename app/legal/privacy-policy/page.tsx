import type { Metadata } from 'next';
import { BRAND } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Privacy Policy — The Clear Path',
  description: 'How The Clear Path collects, uses, shares, and protects personal data for therapy services delivered via the secure portal.',
};

const sections: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: 'Who we are',
    paragraphs: [
      'The Clear Path (“we”, “us”) provides online therapy coordination and delivery for clients primarily located in the Gulf region. We process personal data to create accounts, run intake, match you with clinicians, schedule sessions, and take payments.',
    ],
  },
  {
    title: 'What we collect',
    paragraphs: [
      'Identity and contact: name, email address, phone number, country, and date of birth.',
      'Intake profile: answers to onboarding questions including goals, preferences, health screeners, and availability notes.',
      'Usage and technical: device and browser information, IP address, cookies, and session logs for security and troubleshooting.',
      'Payments: tokenised references supplied by our PCI-compliant payment provider. We do not store complete card numbers.',
    ],
  },
  {
    title: 'Why we use it',
    paragraphs: [
      'To deliver the service you request: account creation, therapist matching, scheduling, billing, and session reminders.',
      'To triage safety risks identified in intake screeners and coordinate urgent reviews when appropriate.',
      'To provide customer support, service notices, and change alerts.',
      'To comply with legal obligations, prevent fraud, and maintain platform integrity.',
    ],
  },
  {
    title: 'Legal bases',
    paragraphs: [
      'Contract: to perform the services you request.',
      'Consent: for sensitive health-related intake data. You can withdraw consent, but doing so may limit your ability to receive care through the platform.',
      'Legitimate interests: service quality, security monitoring, analytics, and fraud prevention.',
      'Legal obligation: responding to regulatory or lawful government requests where required.',
    ],
  },
  {
    title: 'Sharing',
    paragraphs: [
      'Therapists receive only the data necessary to provide your care.',
      'Processors (for example, secure cloud hosting, email/SMS delivery, payments, and analytics) operate under written data-processing agreements and follow our security requirements.',
      'Regulators or authorities receive data only when required by applicable law or to protect vital interests.',
      'We never sell personal data.',
    ],
  },
  {
    title: 'Storage and security',
    paragraphs: [
      'Data is stored on secure cloud infrastructure with encryption in transit and at rest.',
      'Access is role-based, logged, and limited to personnel who need it to perform their duties.',
      'We retain data only as long as needed for service delivery, legal, or regulatory purposes. Afterwards we delete or anonymise it.',
    ],
  },
  {
    title: 'Minors and emergencies',
    paragraphs: [
      'The service is designed for adults (18+). Where local law allows a minor to receive care, we require verifiable guardian consent before creating an account.',
      'If we believe there is a risk of serious harm, we may contact the emergency details you provide or alert local services. The platform is not a substitute for emergency care; in the UAE please contact 999 (Police) or 998 (Ambulance).',
    ],
  },
  {
    title: 'International transfers',
    paragraphs: [
      'Where personal data is transferred across borders, we use contractual safeguards or other recognised transfer mechanisms to maintain equivalent protection.',
    ],
  },
  {
    title: 'Your rights',
    paragraphs: [
      'Depending on your jurisdiction you may have the right to access, correct, delete, restrict, or object to processing of your personal data, and to request portability.',
      `To exercise your rights or withdraw consent, email privacy@theclearpath.ae or ${BRAND.supportEmail}.`,
    ],
  },
  {
    title: 'Cookies',
    paragraphs: [
      'We use essential cookies for security and session continuity. Optional analytics cookies help us understand usage; you can control cookies through your browser settings.',
    ],
  },
  {
    title: 'Marketing',
    paragraphs: [
      'Marketing communications are optional. You can opt in or out at any time without affecting access to therapy services.',
    ],
  },
  {
    title: 'Contact',
    paragraphs: [
      'Privacy enquiries: privacy@theclearpath.ae.',
      `Support enquiries: ${BRAND.supportEmail}.`,
      'Emergency (UAE): 999 Police, 998 Ambulance.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-stone-100/60">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-lg shadow-primary/10">
          <header className="border-b border-primary/15 pb-6">
            <p className="text-sm uppercase tracking-wide text-primary/70">Privacy Policy — The Clear Path</p>
            <h1 className="mt-2 text-3xl font-bold text-primary">Your privacy, our responsibility</h1>
            <p className="mt-3 text-sm text-primary/80">Effective date: 9 October 2025 · Applies to services delivered via portal.theclearpath.ae</p>
          </header>

          <div className="mt-8 space-y-8 text-neutral-700">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-xl font-semibold text-primary">{section.title}</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed md:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <li key={paragraph} className="flex items-start gap-2">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                      <span>{paragraph}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
