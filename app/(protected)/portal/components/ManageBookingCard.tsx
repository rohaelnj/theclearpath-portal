'use client';

import React, { useState } from 'react';
import { BRAND, POLICY, SESSION } from '@/lib/brand';

type ManageBookingCardProps = {
  bookingId: string;
  therapistName: string;
  startIso: string; // UTC ISO
  onReschedule: (bookingId: string) => void;
};

function fmt(dtIso: string) {
  const d = new Date(dtIso);
  return `${d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export default function ManageBookingCard(props: ManageBookingCardProps) {
  const { bookingId, therapistName, startIso, onReschedule } = props;
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

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
    } catch (e: any) {
      setErr(e.message || 'Failed to submit request');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600">Upcoming session</div>
          <div className="mt-1 text-lg font-semibold" style={{ color: BRAND.colors.teal }}>
            {fmt(startIso)} · {SESSION.minutes} min
          </div>
          <div className="text-sm text-gray-700">With {therapistName}</div>
        </div>
        <button
          onClick={() => onReschedule(bookingId)}
          className="rounded-xl px-4 py-2 text-white"
          style={{ backgroundColor: BRAND.colors.teal }}
        >
          Reschedule
        </button>
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
    </div>
  );
}
