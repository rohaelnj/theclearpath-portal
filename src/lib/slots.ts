import { getDb, slotId as makeSlotId, FieldValue } from './firestore';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';

export const SLOT_HOLD_MINUTES = 15;
const MAX_HOLD_WINDOW_DAYS = 30;

interface SlotDoc extends DocumentData {
  slotId?: string;
  tid?: string;
  status?: 'open' | 'held' | 'booked' | string;
  heldUntil?: Timestamp | null;
}

interface BookingDoc extends DocumentData {
  bookingId?: string;
  slotId?: string;
  status?: string;
  payment?: {
    status?: string;
    amountFils?: number;
    amountAED?: number;
    currency?: string;
    stripeId?: string;
  };
}

function parseIsoStrict(iso: string): Date {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error('invalid_iso');
  }
  return date;
}

export const slotIdFrom = makeSlotId;

type HoldParams = {
  bookingId: string;
  uid: string;
  tid: string;
  startIso: string;
  durationMin?: number;
  priceAED: number;
};

export async function holdSlotAndDraftBooking(params: HoldParams) {
  const { bookingId, uid, tid, startIso, priceAED } = params;
  const durationMin = params.durationMin ?? 60;

  if (!Number.isFinite(priceAED) || priceAED <= 0) {
    throw new Error('invalid_price');
  }

  const startDate = parseIsoStrict(startIso);
  const now = new Date();
  if (startDate.getTime() < now.getTime()) {
    throw new Error('start_in_past');
  }

  const maxDate = new Date(now.getTime() + MAX_HOLD_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  if (startDate.getTime() > maxDate.getTime()) {
    throw new Error('start_too_far');
  }

  const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

  const db = getDb();
  const slotId = slotIdFrom(tid, startIso);
  const slotRef = db.collection('slots').doc(slotId);
  const bookingRef = db.collection('bookings').doc(bookingId);

  await db.runTransaction(async (tx) => {
    const [slotSnap, bookingSnap] = await Promise.all([tx.get(slotRef), tx.get(bookingRef)]);

    if (bookingSnap.exists) {
      const existing = bookingSnap.data() as BookingDoc;
      if (existing.slotId === slotId && existing.status === 'pending') {
        return;
      }
      throw new Error('booking_conflict');
    }

    if (!slotSnap.exists) {
      throw new Error('slot_not_found');
    }

    const slot = slotSnap.data() as SlotDoc;
    const heldUntil = slot.heldUntil?.toMillis();
    const holdExpired = slot.status === 'held' && heldUntil !== undefined && heldUntil < Date.now();
    const slotStatus = holdExpired ? 'open' : slot.status;

    if (slotStatus !== 'open') {
      throw new Error(`slot_not_open:${slot.status ?? 'unknown'}`);
    }

    const holdExpiryTs = Timestamp.fromDate(new Date(Date.now() + SLOT_HOLD_MINUTES * 60 * 1000));

    tx.update(slotRef, {
      status: 'held',
      heldUntil: holdExpiryTs,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const amountFils = Math.round(priceAED * 100);

    tx.set(bookingRef, {
      bookingId,
      uid,
      tid,
      slotId,
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(endDate),
      minutes: durationMin,
      status: 'pending',
      priceAED,
      payment: {
        status: 'pending',
        amountFils,
        amountAED: priceAED,
        currency: 'AED',
      },
      paymentStatus: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  const created = await bookingRef.get();
  return created.data() as BookingDoc;
}

export async function confirmBookingPaid(bookingId: string, stripeId: string, amountAED: number) {
  const db = getDb();
  const bookingRef = db.collection('bookings').doc(bookingId);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    throw new Error('booking_not_found');
  }

  const booking = bookingSnap.data() as BookingDoc;
  if (!booking.slotId) {
    throw new Error('booking_slot_missing');
  }

  const slotRef = db.collection('slots').doc(booking.slotId);
  const amountFils = Math.round(amountAED * 100);

  await db.runTransaction(async (tx) => {
    tx.update(bookingRef, {
      status: 'confirmed',
      priceAED: amountAED,
      'payment.status': 'paid',
      'payment.amountFils': amountFils,
      'payment.amountAED': amountAED,
      'payment.stripeId': stripeId,
      paymentStatus: 'paid',
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.update(slotRef, {
      status: 'booked',
      heldUntil: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}
