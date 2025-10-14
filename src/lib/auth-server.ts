import type { PortalUser } from './auth';
import { getAdminAuth } from './firebaseAdmin';
import { getDb, FieldValue } from './firestore';

interface CookieLike {
  get: (name: string) => { value: string } | undefined;
}

const SESSION_COOKIE_NAMES = ['__session', 'session', 'firebaseSession', 'token'];

function readSessionCookie(store?: CookieLike): string | null {
  if (!store) return null;
  for (const key of SESSION_COOKIE_NAMES) {
    const cookie = store.get(key);
    if (cookie?.value) {
      return cookie.value;
    }
  }
  return null;
}

export async function resolveUserFromCookies(store?: CookieLike): Promise<PortalUser | null> {
  const sessionCookie = readSessionCookie(store);
  if (!sessionCookie) return null;

  try {
    const auth = getAdminAuth();
    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;
    const email = typeof decoded.email === 'string' ? decoded.email.toLowerCase() : undefined;

    const db = getDb();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const now = FieldValue.serverTimestamp();

    const defaults = {
      surveyCompleted: false,
      planSelected: false,
      subscriptionActive: false,
    } as const;

    if (!snap.exists) {
      await userRef.set(
        {
          uid,
          email: email ?? null,
          ...defaults,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );
      return { uid, email, ...defaults };
    }

    const data = snap.data() ?? {};
    let mutated = false;
    const updates: Record<string, unknown> = {};

    if (email && typeof data.email !== 'string') {
      updates.email = email;
      mutated = true;
    } else if (email && typeof data.email === 'string' && data.email !== email) {
      updates.email = email;
      mutated = true;
    }

    (['surveyCompleted', 'planSelected', 'subscriptionActive'] as const).forEach((key) => {
      if (typeof data[key] !== 'boolean') {
        updates[key] = false;
        data[key] = false;
        mutated = true;
      }
    });

    if (mutated) {
      updates.updatedAt = now;
      await userRef.set(updates, { merge: true });
    }

    return {
      uid,
      email: (data.email as string) || email,
      surveyCompleted: Boolean(data.surveyCompleted),
      planSelected: Boolean(data.planSelected),
      subscriptionActive: Boolean(data.subscriptionActive),
    };
  } catch (error) {
    console.error('resolveUserFromCookies failed', error);
    return null;
  }
}

export async function getUserFromCookie(store?: CookieLike, _origin?: string): Promise<PortalUser | null> {
  return resolveUserFromCookies(store);
}
