import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, db } from '@/lib/firestore';
import { RefundReason } from '@/lib/brand';

export const dynamic = 'force-dynamic';

type Body = {
  bookingId: string;
  reason: RefundReason;
  message?: string;
};

export async function POST(req: NextRequest) {
  try {
    const auth = (req as any).auth || null;
    const { bookingId, reason, message } = (await req.json()) as Body;

    if (!bookingId || !reason) {
      return NextResponse.json({ error: 'Missing bookingId|reason' }, { status: 400 });
    }

    const doc = {
      kind: 'refund_request' as const,
      bookingId,
      reason,
      message: message || '',
      createdAt: FieldValue.serverTimestamp(),
      requesterUid: auth?.uid || null,
      status: 'new' as const,
    };

    const ref = await db.collection('support_tickets').add(doc);
    return NextResponse.json({ ok: true, ticketId: ref.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create ticket' }, { status: 400 });
  }
}
