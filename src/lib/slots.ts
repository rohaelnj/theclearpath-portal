import { getDb, slotId as makeSlotId, FieldValue } from './firestore';
import { Timestamp, type DocumentData } from 'firebase-admin/firestore';
import { buildIcs } from './ics';
import { sendEmail } from './email';

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
  uid?: string;
  status?: string;
  payment?: {
    status?: string;
    amountFils?: number;
    amountAED?: number;
    currency?: string;
    stripeId?: string;
  };
  start?: Timestamp;
  end?: Timestamp;
  jitsi?: {
    room?: string;
    url?: string;
  } | null;
  email?: string;
  clientEmail?: string;
  userEmail?: string;
  patientEmail?: string;
  reminders?: {
    h24?: boolean;
    h2?: boolean;
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

  const jitsi = {
    room: `tcp-${bookingId}`,
    url: `https://meet.jit.si/tcp-${bookingId}`,
  } as const;

  await db.runTransaction(async (tx) => {
    tx.update(bookingRef, {
      status: 'confirmed',
      priceAED: amountAED,
      'payment.status': 'paid',
      'payment.amountFils': amountFils,
      'payment.amountAED': amountAED,
      'payment.stripeId': stripeId,
      paymentStatus: 'paid',
      jitsi,
      updatedAt: FieldValue.serverTimestamp(),
    });

    tx.update(slotRef, {
      status: 'booked',
      heldUntil: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  // Fire-and-forget email with calendar invite
  const startIso = booking.start instanceof Timestamp ? booking.start.toDate().toISOString() : undefined;
  const endIso = booking.end instanceof Timestamp ? booking.end.toDate().toISOString() : undefined;

  if (startIso && endIso) {
    const possibleEmails = [
      booking.email,
      booking.clientEmail,
      booking.userEmail,
      booking.patientEmail,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    let recipientEmail = possibleEmails[0];
    let patientName: string | undefined;

    if (!recipientEmail && booking.uid) {
      try {
        const userSnap = await db.collection('users').doc(booking.uid).get();
        if (userSnap.exists) {
          const userData = userSnap.data() as { email?: string; name?: string; displayName?: string };
          if (typeof userData?.email === 'string') recipientEmail = userData.email;
          patientName = typeof userData?.name === 'string' ? userData.name : userData?.displayName;
        }
      } catch (error) {
        console.error('Failed to load user for booking email', error);
      }
    }

    if (recipientEmail) {
      const joinUrl = jitsi.url;
      const ics = buildIcs({
        uid: bookingId,
        startIso,
        endIso,
        summary: 'The Clear Path — Therapy Session',
        description: `Join link: ${joinUrl}`,
        url: joinUrl,
      });

      const friendlyStart = new Date(startIso).toLocaleString('en-GB', {
        timeZone: 'Asia/Dubai',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      try {
        await sendEmail({
          to: recipientEmail,
          subject: 'Your session is booked — calendar invite attached',
          text: [
            `Hi ${patientName || ''}`.trim(),
            '',
            'Your therapy session is confirmed.',
            `Start time: ${friendlyStart}`,
            `Join link: ${joinUrl}`,
          ].join('\n'),
          attachments: [
            {
              name: 'session.ics',
              type: 'text/calendar',
              content: Buffer.from(ics, 'utf8').toString('base64'),
            },
          ],
          tags: ['booking_confirmation'],
        });
      } catch (error) {
        console.error('Failed to send booking confirmation email', error);
      }
    }
  }
}
