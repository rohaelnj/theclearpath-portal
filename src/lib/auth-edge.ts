import type { NextRequest } from 'next/server';
import type { PortalUser } from './auth';
import { getUserFromCookie } from './auth';

export async function getSessionLite(req: NextRequest): Promise<PortalUser | null> {
  try {
    return await getUserFromCookie(req.cookies, req.nextUrl.origin);
  } catch (error) {
    console.error('getSessionLite failed', error);
    return null;
  }
}
