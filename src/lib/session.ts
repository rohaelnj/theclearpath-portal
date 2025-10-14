'use client';

import type { User } from 'firebase/auth';

export async function persistSessionCookie(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken(true);
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to persist session cookie', error);
  }
}

export async function clearSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to clear session cookie', error);
  }
}
