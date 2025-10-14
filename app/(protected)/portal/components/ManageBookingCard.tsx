'use client';

import { useState } from 'react';
import { BRAND, POLICY, SESSION } from '@/lib/brand';
import JoinSessionButton from './JoinSessionButton';

type TimestampLike = {
  toDate: () => Date;
};

type BookingSummary = {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  start?: string | Date | TimestampLike;
  end?: string | Date | TimestampLike;
  jitsi?: { url?: string } | null;
};

type ManageBookingCardProps = {
  bookingId?: string;
  therapistName?: string;
  startIso?: string; // fallback start
  booking?: BookingSummary;
  onReschedule?: (bookingId: string) => void;
};

type DevBookingResult = {
  bookingId?: string;
  slotId?: string;
};

const HOLD_TEST_ENABLED = process.env.NODE_ENV === 'development';
const HOLD_TEST_WINDOW_MINUTES = 15;

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return `${d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

function toIso(value: string | Date | TimestampLike | undefined): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch (err) {
      console.error('Failed to convert timestamp', err);
      return null;
    }
  }
  return null;
}

function EmptyBookingCard() {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold text-gray-700">No upcoming session yet</div>
      <p className="mt-2 text-sm text-gray-600">
        Once you schedule a session, the details will appear here. In the meantime you can review open plans or request
        a booking.
      </p>
      <a
        href="/plans"
        className="mt-4 inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: BRAND.colors.teal }}
      >
        View plans
      </a>
    </div>
  );
}

export default function ManageBookingCard(props: ManageBookingCardProps) {
  const booking = props.booking;
  const bookingStartIso = toIso(booking?.start) ?? props.startIso ?? null;

  if (!bookingStartIso) {
    return <EmptyBookingCard />;
  }

  const bookingId =
    props.bookingId ?? (booking && 'bookingId' in booking ? String((booking as Record<string, unknown>).bookingId) : null);

  if (!bookingId) {
    return <EmptyBookingCard />;
  }

  const bookingEndIso =
    toIso(booking?.end) ??
    new Date(new Date(bookingStartIso).getTime() + SESSION.minutes * 60 * 1000).toISOString();

  const therapistName = props.therapistName ?? 'Your therapist';
  const bookingStatus = booking?.status ?? 'pending';
  const bookingJitsiUrl = booking?.jitsi?.url ?? undefined;
  const onReschedule = props.onReschedule;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [devBusy, setDevBusy] = useState(false);
  const [devErr, setDevErr] = useState<string | null>(null);
  const [devResult, setDevResult] = useState<DevBookingResult | null>(null);
  const [devCheckoutUrl, setDevCheckoutUrl] = useState<string | null>(null);

  async function submitRefundRequest() {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const res = await fetch('/api/support/refund-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, reason: 'client_cancel_early', message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setOk('Thanks. Our team will review and get back to you shortly.');
      setMessage('');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to submit request');
    } finally {
      setBusy(false);
    }
  }

  async function devHoldThenCheckout() {
    if (!HOLD_TEST_ENABLED) return;
    setDevBusy(true);
    setDevErr(null);
    setDevResult(null);
    setDevCheckoutUrl(null);

    try {
      const testBookingId = `book-${Date.now()}`;
      const tid = 't2';
      const uid = 'manual-test';
      const startTimeIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const priceAED = SESSION.singlePriceAED;

      const holdResponse = await fetch('/api/bookings/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: testBookingId,
          tid,
          uid,
          startIso: startTimeIso,
          priceAED,
        }),
      });
      const holdJson = await holdResponse.json();
      if (!holdResponse.ok || !holdJson?.ok) {
        throw new Error(holdJson?.error || 'Hold failed');
      }

      const bookingData = holdJson.booking as DevBookingResult & { slotId?: string };
      if (!bookingData.slotId) {
        throw new Error('Hold missing slotId');
      }

      setDevResult(bookingData);

      const checkoutResponse = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: testBookingId,
          slotId: bookingData.slotId,
          amountMinor: Math.round(priceAED * 100),
        }),
      });
      const checkoutJson = await checkoutResponse.json();
      if (!checkoutResponse.ok || !checkoutJson?.url) {
        throw new Error(checkoutJson?.error || 'Checkout failed');
      }

      setDevCheckoutUrl(checkoutJson.url as string);
    } catch (error) {
      setDevErr(error instanceof Error ? error.message : 'Hold/checkout failed');
    } finally {
      setDevBusy(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Upcoming session</div>
          <div className="mt-1 text-lg font-semibold" style={{ color: BRAND.colors.teal }}>
            {fmt(bookingStartIso)} ·{' '}
            {Math.max(
              SESSION.minutes,
              Math.round((new Date(bookingEndIso).getTime() - new Date(bookingStartIso).getTime()) / 60000),
            )}{' '}
            min
          </div>
          <div className="text-sm text-gray-700">With {therapistName}</div>
        </div>
        {bookingId && typeof onReschedule === 'function' ? (
          <button
            onClick={() => onReschedule(bookingId)}
            className="rounded-xl px-4 py-2 text-white"
            style={{ backgroundColor: BRAND.colors.teal }}
          >
            Reschedule
          </button>
        ) : null}
      </div>

      <div className="mt-3 text-xs text-gray-600">
        You can reschedule up to {POLICY.rescheduleWindowHours} hours before the session at no cost.
      </div>

      <div className="mt-3 text-right">
        <button
          onClick={() => setOpen(true)}
          className="text-xs underline"
          style={{ color: BRAND.colors.tealMuted }}
          aria-label="Need help with this booking"
        >
          Need help?
        </button>
      </div>

      {bookingStartIso && bookingEndIso && (
        <div className="mt-4">
          <JoinSessionButton
            status={bookingStatus}
            startIso={bookingStartIso}
            endIso={bookingEndIso}
            jitsiUrl={bookingJitsiUrl}
          />
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-lg">
            <div className="mb-2 text-base font-semibold" style={{ color: BRAND.colors.teal }}>
              How can we help?
            </div>
            <p className="text-sm text-gray-700">
              Most requests can be resolved by rescheduling. If you still need assistance, contact support or submit a
              request for our team to review.
            </p>

            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              <div className="font-medium">Policy snapshot</div>
              <ul className="list-disc pl-5">
                <li>Reschedule free up to {POLICY.rescheduleWindowHours}h before start.</li>
                <li>Refunds are considered by support per policy.</li>
              </ul>
            </div>

            <label className="mt-3 block text-xs text-gray-600">Add details for our team (optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:ring-2"
            />

            {ok && <div className="mt-2 text-xs text-green-700">{ok}</div>}
            {err && <div className="mt-2 text-xs text-red-700">{err}</div>}

            <div className="mt-4 flex items-center justify-between">
              <a
                href={`mailto:${BRAND.supportEmail}?subject=Support%20Request%20${encodeURIComponent(bookingId)}`}
                className="text-xs underline"
                style={{ color: BRAND.colors.teal }}
              >
                Contact support
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ color: BRAND.colors.textMuted }}
                >
                  Close
                </button>
                <button
                  disabled={busy}
                  onClick={submitRefundRequest}
                  className="rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60"
                  style={{ backgroundColor: BRAND.colors.teal }}
                >
                  Submit request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {HOLD_TEST_ENABLED && (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-4">
          <div className="text-sm font-semibold text-gray-700">Dev booking flow</div>
          <p className="mt-1 text-xs text-gray-500">
            Quickly exercise the hold → checkout flow. Holds expire after {HOLD_TEST_WINDOW_MINUTES} minutes.
          </p>
          <button
            onClick={devHoldThenCheckout}
            disabled={devBusy}
            className="mt-3 rounded-xl bg-[#1F4142] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {devBusy ? 'Processing…' : 'Test hold → checkout'}
          </button>
          {devErr && <p className="mt-2 text-xs text-red-600">{devErr}</p>}
          {!devErr && devResult && (
            <div className="mt-3 text-xs text-gray-600">
              <div>
                Held booking <code>{String(devResult.bookingId ?? 'n/a')}</code>
              </div>
              <div>Slot ID: <code>{String(devResult.slotId ?? 'n/a')}</code></div>
            </div>
          )}
          {devCheckoutUrl && (
            <div className="mt-3 text-xs">
              <a
                href={devCheckoutUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#1F4142] underline"
              >
                Open Stripe Checkout in new tab
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
