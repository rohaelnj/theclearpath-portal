export function sanitizeRedirectPath(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;

  const trimmed = raw.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback;
  }

  try {
    const url = new URL(trimmed, 'https://example.com');
    const path = url.pathname || '/';
    const query = url.search || '';
    const hash = url.hash || '';
    return `${path}${query}${hash}`;
  } catch {
    return fallback;
  }
}
