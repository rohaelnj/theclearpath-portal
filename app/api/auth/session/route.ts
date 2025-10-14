import { NextRequest, NextResponse } from 'next/server';
import { resolveUserFromCookies } from '@/lib/auth-server';
import { getAdminAuth } from '@/lib/firebaseAdmin';
import { getDb, FieldValue } from '@/lib/firestore';

const SESSION_COOKIE_NAME = '__session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 days

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const resolved = await resolveUserFromCookies(req.cookies);
    if (!resolved) {
      return NextResponse.json({ user: null });
    }

    const safe = {
      ...resolved,
      surveyCompleted: Boolean(resolved.surveyCompleted),
      planSelected: Boolean(resolved.planSelected),
      subscriptionActive: Boolean(resolved.subscriptionActive),
    };

    return NextResponse.json({ user: safe });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'session_error';
    return NextResponse.json({ error: message, user: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { idToken?: string };
    const idToken = body.idToken?.trim();
    if (!idToken) {
      return NextResponse.json({ error: 'missing_id_token' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken, true);
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const db = getDb();
    const uid = decoded.uid;
    const email = typeof decoded.email === 'string' ? decoded.email.toLowerCase() : undefined;
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const now = FieldValue.serverTimestamp();

    if (!snap.exists) {
      await userRef.set(
        {
          uid,
          email: email ?? null,
          surveyCompleted: false,
          planSelected: false,
          subscriptionActive: false,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );
    } else {
      const updates: Record<string, unknown> = { updatedAt: now };
      if (email && snap.data()?.email !== email) updates.email = email;
      if (typeof snap.data()?.surveyCompleted !== 'boolean') updates.surveyCompleted = false;
      if (typeof snap.data()?.planSelected !== 'boolean') updates.planSelected = false;
      if (typeof snap.data()?.subscriptionActive !== 'boolean') updates.subscriptionActive = false;
      if (Object.keys(updates).length > 1) {
        await userRef.set(updates, { merge: true });
      }
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'session_issue';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookie = req.cookies.get(SESSION_COOKIE_NAME);
    if (cookie?.value) {
      try {
        const auth = getAdminAuth();
        const decoded = await auth.verifySessionCookie(cookie.value, true);
        await auth.revokeRefreshTokens(decoded.sub);
      } catch {
        // Ignore revocation errors; cookie will be cleared regardless.
      }
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'session_delete_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
