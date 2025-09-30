import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPaid } from '../../../../src/lib/slots';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = { bookingId: string; amountAED: number };

export async function POST(req: NextRequest) {
  const key = req.headers.get('x-shared-key') || '';
  if (!process.env.REFUND_SHARED_KEY || key !== process.env.REFUND_SHARED_KEY) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { bookingId, amountAED } = body;
  if (!bookingId || typeof amountAED !== 'number' || amountAED <= 0) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  try {
    await confirmBookingPaid(bookingId, 'simulated', amountAED);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 400 });
  }
}
