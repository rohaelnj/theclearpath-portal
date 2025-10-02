import { NextRequest, NextResponse } from 'next/server';
import { getDb, FieldValue } from '@/lib/firestore';
import { sendEmail } from '@/lib/email';
import { Timestamp } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WINDOW_24H_LOW = 23.83;
const WINDOW_24H_HIGH = 24.17;
const WINDOW_2H_LOW = 1.8;
const WINDOW_2H_HIGH = 2.2;

function hoursUntil(start: Date, now: Date): number {
  return (start.getTime() - now.getTime()) / 3_600_000;
}

function toIso(start: Timestamp | Date | undefined): string | null {
  if (!start) return null;
  if (start instanceof Timestamp) return start.toDate().toISOString();
  if (start instanceof Date) return start.toISOString();
  return null;
}

export async function POST(req: NextRequest) {
  const sharedKey = req.headers.get('x-shared-key') ?? '';
  if (!sharedKey || sharedKey !== process.env.REFUND_SHARED_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const now = new Date();

  const snap = await db
    .collection('bookings')
    .where('status', '==', 'confirmed')
    .where('paymentStatus', '==', 'paid')
    .get();

  type ReminderBooking = {
    start?: Timestamp | Date;
    jitsi?: { url?: string } | null;
    email?: string;
    clientEmail?: string;
    userEmail?: string;
    patientEmail?: string;
    uid?: string;
    reminders?: { h24?: boolean; h2?: boolean };
  };

  let sent24 = 0;
  let sent2 = 0;

  for (const doc of snap.docs) {
    const data = doc.data() as ReminderBooking;
    const startIso = toIso(data.start);
    if (!startIso) continue;

    const startDate = new Date(startIso);
    if (Number.isNaN(startDate.getTime())) continue;

    const diffHours = hoursUntil(startDate, now);
    const joinUrl: string | undefined = data.jitsi?.url;

    const candidateEmails = [
      data.email,
      data.clientEmail,
      data.userEmail,
      data.patientEmail,
    ].filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    let recipient = candidateEmails[0];
    if (!recipient && typeof data.uid === 'string') {
      try {
        const userSnap = await db.collection('users').doc(data.uid).get();
        if (userSnap.exists) {
          const userData = userSnap.data() as { email?: string };
          if (typeof userData?.email === 'string' && userData.email.trim().length > 0) {
            recipient = userData.email;
          }
        }
      } catch (error) {
        console.error('reminders: failed to load user', error);
      }
    }

    if (!recipient || !joinUrl) continue;

    if (diffHours > WINDOW_24H_LOW && diffHours < WINDOW_24H_HIGH && !data.reminders?.h24) {
      try {
        await sendEmail({
          to: recipient,
          subject: 'Reminder: your session is tomorrow',
          text: `Hi, your session is in about 24 hours.\nStart: ${startDate.toISOString()}\nJoin: ${joinUrl}`,
          tags: ['reminder_24h'],
        });
        await doc.ref.update({ 'reminders.h24': true, updatedAt: FieldValue.serverTimestamp() });
        sent24 += 1;
      } catch (error) {
        console.error('reminders: failed to send 24h email', error);
      }
    }

    if (diffHours > WINDOW_2H_LOW && diffHours < WINDOW_2H_HIGH && !data.reminders?.h2) {
      try {
        await sendEmail({
          to: recipient,
          subject: 'Reminder: your session starts in 2 hours',
          text: `Hi, your session starts in about 2 hours.\nStart: ${startDate.toISOString()}\nJoin: ${joinUrl}`,
          tags: ['reminder_2h'],
        });
        await doc.ref.update({ 'reminders.h2': true, updatedAt: FieldValue.serverTimestamp() });
        sent2 += 1;
      } catch (error) {
        console.error('reminders: failed to send 2h email', error);
      }
    }
  }

  return NextResponse.json({ ok: true, sent24, sent2 });
}

export function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
