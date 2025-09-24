import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { initFirebaseAdmin } from '../../../src/firebaseAdmin';
import type {
  BookingMetadata,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  StripeEnv,
} from '@/lib/stripeTypes';

interface BookingDocument {
  clientEmail?: string;
  clientId?: string;
  therapistId?: string;
  slotId?: string;
  status?: string;
  paid?: boolean;
  paymentStatus?: string;
  userId?: string;
  priceAED?: number;
  title?: string;
  description?: string;
}

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function parseRequest(req: NextRequest): Promise<CheckoutSessionRequest> {
  let body: unknown;
  try {
    body = await req.json();
  } catch (error) {
    throw new Error('Invalid JSON body');
  }

  if (!isRecord(body)) {
    throw new Error('Invalid request body. Expecting JSON object.');
  }

  const { bookingId, amountAED, currency, successUrl, cancelUrl } = body;

  if (typeof bookingId !== 'string' || bookingId.trim() === '') {
    throw new Error('bookingId is required.');
  }

  if (typeof amountAED !== 'number' || !Number.isInteger(amountAED) || amountAED <= 0) {
    throw new Error('amountAED must be a positive integer representing minor units.');
  }

  if (currency !== undefined && typeof currency !== 'string') {
    throw new Error('currency must be a string when provided.');
  }

  if (successUrl !== undefined && typeof successUrl !== 'string') {
    throw new Error('successUrl must be a string when provided.');
  }

  if (cancelUrl !== undefined && typeof cancelUrl !== 'string') {
    throw new Error('cancelUrl must be a string when provided.');
  }

  return {
    bookingId: bookingId.trim(),
    amountAED,
    currency,
    successUrl,
    cancelUrl,
  };
}

function readEnv(): StripeEnv {
  const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_BASE_URL } = process.env;
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY env');
  }
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET env');
  }

  return {
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_BASE_URL: NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, ''),
  };
}

function coerceCurrency(value?: string): string {
  return value ? value.toLowerCase() : 'aed';
}

function buildMetadata(bookingId: string, booking: BookingDocument): BookingMetadata {
  const metadata: Mutable<BookingMetadata> = {
    bookingId,
  };

  if (booking.slotId) metadata.slotId = String(booking.slotId);
  if (booking.clientId) metadata.clientId = String(booking.clientId);
  if (!metadata.clientId && booking.userId) metadata.clientId = String(booking.userId);
  if (booking.therapistId) metadata.therapistId = String(booking.therapistId);

  return metadata;
}

function resolveBaseUrl(req: NextRequest, env: StripeEnv): string {
  if (env.NEXT_PUBLIC_BASE_URL && env.NEXT_PUBLIC_BASE_URL.trim().length > 0) {
    return env.NEXT_PUBLIC_BASE_URL;
  }
  const originHeader = req.headers.get('origin') ?? undefined;
  if (originHeader && originHeader.trim().length > 0) {
    return originHeader;
  }
  return 'http://localhost:3000';
}

function toStripeMetadata(metadata: BookingMetadata): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let payload: CheckoutSessionRequest;
  try {
    payload = await parseRequest(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid request';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  let env: StripeEnv;
  try {
    env = readEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Missing Stripe env';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const db = initFirebaseAdmin();
    const bookingRef = db.collection('bookings').doc(payload.bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingSnap.data() as BookingDocument;
    if (booking.paid || booking.paymentStatus === 'paid' || booking.status === 'confirmed') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    const currency = coerceCurrency(payload.currency);
    const baseUrl = resolveBaseUrl(req, env);

    const metadata = toStripeMetadata(buildMetadata(payload.bookingId, booking));
    const productName = booking.title || 'Therapy Session';
    const productDescription = booking.description || 'Therapy session booking';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      success_url:
        payload.successUrl || `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}&booking=${payload.bookingId}`,
      cancel_url: payload.cancelUrl || `${baseUrl}/booking/${payload.bookingId}?payment=cancelled`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: payload.amountAED,
            product_data: {
              name: productName,
              description: productDescription,
            },
          },
        },
      ],
      metadata,
      client_reference_id: payload.bookingId,
      customer_email: typeof booking.clientEmail === 'string' ? booking.clientEmail : undefined,
    });

    const responsePayload: CheckoutSessionResponse = {
      id: session.id,
      url: session.url,
    };

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe error';
    console.error('create-session handler error', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
