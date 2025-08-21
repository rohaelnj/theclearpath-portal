export async function sendWelcome(email?: string | null, displayName?: string | null): Promise<void> {
  const e = (email || '').trim();
  if (!e) return;
  const key = `welcome-sent:${e}`;
  try {
    if (typeof window !== 'undefined' && localStorage.getItem(key)) return;
    await fetch('/api/send-welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': key,
      },
      body: JSON.stringify({ email: e, displayName: displayName || undefined }),
    });
    if (typeof window !== 'undefined') localStorage.setItem(key, '1');
  } catch {
    // ignore errors
  }
}
