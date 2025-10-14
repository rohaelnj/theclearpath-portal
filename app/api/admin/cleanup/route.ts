import { NextRequest, NextResponse } from 'next/server';
import type { Firestore, Query } from 'firebase-admin/firestore';
import { getDb } from '@/lib/auth-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // visible probe: proves the route exists
  return NextResponse.json({ ok: false, error: 'method_not_allowed' }, { status: 405 });
}

function isAuthorized(req: NextRequest): boolean {
  const provided = req.headers.get('x-admin-key');
  const expected = process.env.REFUND_SHARED_KEY;
  return Boolean(expected && provided && provided === expected);
}

async function deleteByQuery(db: Firestore, baseQuery: Query, batchSize = 400): Promise<number> {
  let deleted = 0;
  // batch-delete in pages to avoid 500s on large collections
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const snap = await baseQuery.limit(batchSize).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.size;
  }
  return deleted;
}

type CleanupRequestBody = {
  uid?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as CleanupRequestBody;
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';

    const db = getDb();

    const pendingDeleted = await deleteByQuery(db, db.collection('bookings').where('status', '==', 'pending'));

    let userDeleted = 0;
    if (uid) {
      userDeleted = await deleteByQuery(db, db.collection('bookings').where('userId', '==', uid));
    }

    let userDocDeleted = 0;
    if (uid) {
      const userRef = db.collection('users').doc(uid);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.delete();
        userDocDeleted = 1;
      }
    }

    return NextResponse.json({
      ok: true,
      deleted: {
        pendingBookings: pendingDeleted,
        bookingsByUser: userDeleted,
        userDoc: userDocDeleted,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'cleanup_failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
