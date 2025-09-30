// Usage:
//   node scripts/refund_legacy_booking.mjs <bookingId> <reason> [--pi pi_123] [--amount 300]
// Requires env: STRIPE_SECRET_KEY, REFUND_SHARED_KEY, NEXT_PUBLIC_BASE_URL (or BASE_URL),
// FIREBASE_ADMIN_PROJECT_ID|FIREBASE_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY_B64

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ---- env
const {
  STRIPE_SECRET_KEY,
  REFUND_SHARED_KEY,
  NEXT_PUBLIC_BASE_URL,
  BASE_URL,
  FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY_B64,
} = process.env;

function reqEnv(name, val) {
  if (!val) {
    console.error(`Missing env ${name}`);
    process.exit(1);
  }
}

reqEnv('STRIPE_SECRET_KEY', STRIPE_SECRET_KEY);
reqEnv('REFUND_SHARED_KEY', REFUND_SHARED_KEY);
reqEnv('FIREBASE_ADMIN_CLIENT_EMAIL', FIREBASE_ADMIN_CLIENT_EMAIL);
reqEnv('FIREBASE_ADMIN_PRIVATE_KEY_B64', FIREBASE_ADMIN_PRIVATE_KEY_B64);

const PROJECT_ID = FIREBASE_ADMIN_PROJECT_ID || FIREBASE_PROJECT_ID;
reqEnv('FIREBASE_ADMIN_PROJECT_ID|FIREBASE_PROJECT_ID', PROJECT_ID);

const BASE = NEXT_PUBLIC_BASE_URL || BASE_URL || 'https://portal.theclearpath.ae';

// ---- args
const [,, bookingId, reason, ...rest] = process.argv;
if (!bookingId || !reason) {
  console.error('Usage: node scripts/refund_legacy_booking.mjs <bookingId> <reason> [--pi pi_123] [--amount 300]');
  process.exit(1);
}
const args = {};
for (let i = 0; i < rest.length; i += 2) {
  const k = rest[i];
  const v = rest[i + 1];
  if (!k?.startsWith('--')) continue;
  args[k.slice(2)] = v;
}
const optPi = args.pi || null;
const optAmountAED = args.amount ? Number(args.amount) : null;

// ---- init admin
if (!getApps().length) {
  const pk = Buffer.from(FIREBASE_ADMIN_PRIVATE_KEY_B64, 'base64').toString('utf8');
  initializeApp({ credential: cert({ projectId: PROJECT_ID, clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL, privateKey: pk }) });
}
const db = getFirestore();

// ---- helpers
async function stripe(path, searchParams) {
  const url = new URL(`https://api.stripe.com/v1/${path}`);
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) url.searchParams.append(k, v);
  }
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe ${path} ${res.status}: ${text}`);
  }
  return res.json();
}

function aedToFils(aed) {
  return Math.round(Number(aed) * 100);
}

// ---- find PI and amount
async function resolvePayment(bookingId) {
  // 1) Try Checkout Sessions by metadata.bookingId
  try {
    const data = await stripe('checkout/sessions', {
      payment_status: 'paid',
      limit: '100',
      'expand[]': 'data.payment_intent',
    });
    const hit = data.data.find((s) => s?.metadata?.bookingId === bookingId);
    if (hit?.payment_intent?.id) {
      return { pi: hit.payment_intent.id, amountFils: hit.amount_total, currency: hit.currency?.toUpperCase() || 'AED' };
    }
  } catch (e) {
    // continue
  }

  // 2) Try PaymentIntents search by metadata
  try {
    const sr = await stripe('payment_intents/search', {
      query: `metadata['bookingId']:'${bookingId}' AND status:'succeeded'`,
    });
    if (sr.data?.length) {
      const pi = sr.data[0];
      return { pi: pi.id, amountFils: pi.amount_received || pi.amount, currency: (pi.currency || 'aed').toUpperCase() };
    }
  } catch (e) {
    // continue
  }

  return { pi: null, amountFils: null, currency: null };
}

// ---- main
(async () => {
  let { pi, amountFils, currency } = await resolvePayment(bookingId);

  if (!pi && optPi) pi = optPi;
  if (!amountFils && optAmountAED) amountFils = aedToFils(optAmountAED);
  if (!currency) currency = 'AED';

  if (!pi) {
    console.error('No Payment Intent found. Provide --pi pi_... or ensure the Checkout had metadata.bookingId and is paid.');
    process.exit(2);
  }
  if (!amountFils) {
    console.error('No amount found. Provide --amount <AED> (e.g., --amount 300).');
    process.exit(2);
  }

  // 1) Backfill Firestore booking.payment.*
  const ref = db.collection('bookings').doc(bookingId);
  const snap = await ref.get();
  if (!snap.exists) {
    console.error(`Booking not found: ${bookingId}`);
    process.exit(2);
  }
  await ref.set(
    {
      payment: {
        status: 'paid',
        amount: amountFils,
        currency,
        stripePaymentIntentId: pi,
      },
    },
    { merge: true },
  );

  console.log(`Backfilled booking ${bookingId}: payment.status=paid, amount=${amountFils} ${currency}, pi=${pi}`);

  // 2) Call refund endpoint
  const res = await fetch(`${BASE}/api/stripe/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-refund-key': REFUND_SHARED_KEY,
    },
    body: JSON.stringify({ bookingId, reason }),
  });
  const body = await res.text();
  console.log(`Refund response ${res.status}: ${body}`);
  if (!res.ok) process.exit(3);
})();
