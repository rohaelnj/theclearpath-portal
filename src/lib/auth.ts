export type PortalUser = {
  uid: string;
  email?: string;
  surveyCompleted: boolean;
  planSelected: boolean;
  subscriptionActive: boolean;
};

interface CookieLike {
  getAll: () => Array<{ name: string; value: string }>;
}

function serializeCookies(store?: CookieLike): string {
  if (!store) return '';
  const entries = store.getAll();
  if (!entries.length) return '';
  return entries.map(({ name, value }) => `${name}=${value}`).join('; ');
}

type Fetcher = typeof fetch;

async function requestSession(fetcher: Fetcher, origin: string, cookieHeader: string): Promise<PortalUser | null> {
  const base = origin.replace(/\/$/, '');
  const res = await fetcher(`${base}/api/auth/session`, {
    headers: { cookie: cookieHeader },
    cache: 'no-store',
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { user?: PortalUser | null };
  return body?.user ?? null;
}

export async function getUserFromCookie(store: CookieLike | undefined, origin: string): Promise<PortalUser | null> {
  const cookieHeader = serializeCookies(store);
  if (!cookieHeader) return null;

  try {
    return await requestSession(fetch, origin, cookieHeader);
  } catch (error) {
    console.error('getUserFromCookie failed', error);
    return null;
  }
}
