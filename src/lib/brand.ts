// The Clear Path — brand + pricing + refund policy (single source of truth)
// Paste-ready. TS strict. No placeholders.

export type Hex = `#${string}`;
export type Url = `http${'s' | ''}://${string}`;
export type AED = number; // whole AED
export type Fils = number; // AED * 100 integer

// ===== Brand =====
export const BRAND = {
  name: 'The Clear Path',
  shortName: 'Clear Path',
  domain: 'portal.theclearpath.ae',
  marketingSite: 'https://theclearpath.ae' as Url,
  appUrl: 'https://portal.theclearpath.ae' as Url,
  supportEmail: 'support@theclearpath.ae',
  colors: {
    // Primary palette (provided)
    linen: '#DFD6C7' as Hex,
    seashell: '#DED4C8' as Hex,
    teal: '#1F4142' as Hex,
    // Derivatives
    tealHover: '#183536' as Hex,
    tealMuted: '#376265' as Hex,
    error: '#B3261E' as Hex,
    success: '#1B5E20' as Hex,
    surface: '#FFFFFF' as Hex,
    text: '#0B0F10' as Hex,
    textMuted: '#5B6366' as Hex,
  },
  fonts: {
    heading: `'Playfair Display', ui-serif, Georgia, 'Times New Roman', serif`,
    body: `'Inter', 'Geist Sans', ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'`,
  },
  logo: {
    // Ensure these assets exist in /public
    light: '/logo.png',
    dark: '/logo.png',
    // BIMI is hosted on marketing site, not used here.
  },
  email: {
    // Brevo transactional: keep click tracking OFF for verify and welcome
    clickTrackingEnabled: false,
    primaryCtaColor: '#1F4142' as Hex,
    ctaTextColor: '#FFFFFF' as Hex,
  },
} as const;

// ===== Sessions & Plans =====
export const SESSION = {
  minutes: 50,
  singlePriceAED: 300 as AED, // single 50-min session
} as const;

export type PlanKey = 'essential' | 'premium' | 'executive';

export interface Plan {
  key: PlanKey;
  name: string;
  monthlyAED: AED;
  sessionsIncluded: number;
  perks: string[];
}

export const PLANS: Record<PlanKey, Plan> = {
  essential: {
    key: 'essential',
    name: 'Essential Plan',
    monthlyAED: 1200,
    sessionsIncluded: 4,
    perks: ['4× 50-min sessions/month'],
  },
  premium: {
    key: 'premium',
    name: 'Premium Plan',
    monthlyAED: 2200,
    sessionsIncluded: 8,
    perks: ['8× 50-min sessions/month', 'Emergency call access'],
  },
  executive: {
    key: 'executive',
    name: 'Executive Plan',
    monthlyAED: 3500,
    sessionsIncluded: 8,
    perks: ['8× sessions', 'Unlimited chat/text support', 'Same-day emergency calls'],
  },
} as const;

// ===== Fees & Refund Policy =====
// Stripe does not return original processing fees on refunds.
// Keep fee model configurable. Defaults reflect common UAE card pricing.
export interface FeeModel {
  percentage: number; // e.g., 0.029 for 2.9%
  fixedAED: AED; // e.g., 1.00 per charge
}
export const DEFAULT_FEE: FeeModel = {
  percentage: 0.029,
  fixedAED: 1.0,
} as const;

export type RefundReason =
  | 'client_cancel_early' // ≥24h before start
  | 'client_cancel_late' // <24h before start
  | 'no_show'
  | 'provider_fault' // therapist/admin cancellation
  | 'emergency_exception'; // discretionary

export const POLICY = {
  // Windows
  refundWindowHours: 24,
  rescheduleWindowHours: 12,

  // Text blocks for Terms & Conditions (paste-ready)
  terms: {
    headline: 'Refunds & Cancellations',
    body: [
      'Bookings may be rescheduled up to 24 hours before the session at no cost.',
      'Client-initiated cancellations ≥24 hours before start: refund to the original payment method minus non-refundable card processing fees.',
      'Late cancellations (<24h) and no-shows: non-refundable.',
      'Provider-initiated cancellations: full refund to the original payment method.',
      'Packages: refunds are pro-rated for unused sessions minus processing fees; unused sessions expire after 6 months.',
      'Exceptions: documented emergencies may receive one courtesy reschedule or refund at our discretion.',
    ],
    feeLine:
      'Card processing fees from the original transaction are non-refundable. For client-initiated cancellations we refund the session amount less the non-refundable processing fees. For provider-caused cancellations, we refund in full.',
  },
} as const;

// ===== Utilities =====
export function aedToFils(aed: AED): Fils {
  return Math.round(aed * 100);
}
export function filsToAED(fils: Fils): AED {
  return Math.round(fils) / 100;
}

export function estimateProcessorFee(aed: AED, fee: FeeModel = DEFAULT_FEE): AED {
  return Math.round((aed * fee.percentage + fee.fixedAED) * 100) / 100;
}

/**
 * Compute refund for a single paid item.
 * Returns the refund amount to send to Stripe and the absorbed fee.
 */
export function computeRefundForSingle(
  paidAED: AED,
  reason: RefundReason,
  fee: FeeModel = DEFAULT_FEE,
): { refundAED: AED; absorbedFeeAED: AED; note: string } {
  const feeAED = estimateProcessorFee(paidAED, fee);

  switch (reason) {
    case 'provider_fault':
      return { refundAED: paidAED, absorbedFeeAED: feeAED, note: 'Provider fault → full refund, business absorbs fees.' };
    case 'client_cancel_early':
    case 'emergency_exception':
      return {
        refundAED: round2(paidAED - feeAED),
        absorbedFeeAED: 0,
        note: 'Client early cancel/emergency → refund minus non-refundable processing fees.',
      };
    case 'client_cancel_late':
    case 'no_show':
      return { refundAED: 0, absorbedFeeAED: 0, note: 'Late cancel/no-show → non-refundable.' };
    default:
      return { refundAED: 0, absorbedFeeAED: 0, note: 'Unknown reason.' };
  }
}

/**
 * Pro-rate package refunds:
 * usedSessions: number actually consumed in current billing period.
 * Returns refund AED for the unused portion minus fees if client-initiated,
 * or full unused value with fees absorbed if provider fault.
 */
export function computeProRatedPackageRefund(
  plan: Plan,
  usedSessions: number,
  reason: RefundReason,
  fee: FeeModel = DEFAULT_FEE,
): { refundAED: AED; absorbedFeeAED: AED; perSessionAED: AED; unusedSessions: number; note: string } {
  const perSessionAED = round2(plan.monthlyAED / plan.sessionsIncluded);
  const unused = Math.max(plan.sessionsIncluded - usedSessions, 0);
  const unusedValue = round2(unused * perSessionAED);

  if (unused === 0) return { refundAED: 0, absorbedFeeAED: 0, perSessionAED, unusedSessions: 0, note: 'No unused sessions.' };

  const feeAED = estimateProcessorFee(plan.monthlyAED, fee);

  if (reason === 'provider_fault') {
    return {
      refundAED: unusedValue,
      absorbedFeeAED: feeAED, // business absorbs initial fee
      perSessionAED,
      unusedSessions: unused,
      note: 'Provider fault → refund unused value, business absorbs fees.',
    };
  }

  if (reason === 'client_cancel_early' || reason === 'emergency_exception') {
    return {
      refundAED: Math.max(round2(unusedValue - feeAED), 0),
      absorbedFeeAED: 0,
      perSessionAED,
      unusedSessions: unused,
      note: 'Client early cancel → refund unused value minus non-refundable fees.',
    };
  }

  // Late/no-show: non-refundable
  return {
    refundAED: 0,
    absorbedFeeAED: 0,
    perSessionAED,
    unusedSessions: unused,
    note: 'Late cancel/no-show → non-refundable.',
  };
}

// Email CTA generator for Brevo HTML templates
export function renderEmailCTA(label: string, href: Url) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
  <tr>
    <td bgcolor="${BRAND.email.primaryCtaColor}" style="border-radius:8px;">
      <a href="${href}" style="display:inline-block;padding:12px 20px;text-decoration:none;font-weight:600;font-family:${BRAND.fonts.body};color:${BRAND.email.ctaTextColor}">
        ${escapeHtml(label)}
      </a>
    </td>
  </tr>
</table>`.trim();
}

// Minimal HTML wrapper for transactional emails
export function renderEmailShell(title: string, contentHtml: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width"/>
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.colors.seashell};font-family:${BRAND.fonts.body};color:${BRAND.colors.text}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:${BRAND.colors.surface};border-radius:16px;padding:24px;">
            <tr>
              <td style="text-align:center;padding-bottom:8px;">
                <img src="${BRAND.logo.light}" alt="${BRAND.shortName}" style="height:40px"/>
              </td>
            </tr>
            <tr>
              <td>
                ${contentHtml}
              </td>
            </tr>
            <tr>
              <td style="padding-top:24px;font-size:12px;color:${BRAND.colors.textMuted};text-align:center">
                © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Escape utility
function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
