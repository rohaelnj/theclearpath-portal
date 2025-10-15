import { NextResponse } from 'next/server';

const ALLOWED_KEYS = [
  'anxiety',
  'sleep',
  'country',
  'language',
  'therapistGender',
  'dob',
  'priorTherapy',
  'risk',
  'goal',
] as const;

type AllowedKey = (typeof ALLOWED_KEYS)[number];

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => null) as { key?: string; value?: unknown } | null;
  if (!body || typeof body.key !== 'string' || !ALLOWED_KEYS.includes(body.key as AllowedKey)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const key = body.key as AllowedKey;
  const cookieHeader = request.headers.get('cookie') ?? '';
  const current = deserializeCookie(cookieHeader);
  const nextValue = { ...current, [key]: body.value };

  const response = NextResponse.json({ ok: true });
  response.cookies.set('intake', JSON.stringify(nextValue), {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  });
  return response;
}

function deserializeCookie(cookieHeader: string): Record<string, unknown> {
  const cookies = Object.fromEntries(
    cookieHeader
      .split(';')
      .map((segment) => segment.trim().split('=')) as Array<[string, string]>,
  );

  const intake = cookies.intake;
  if (!intake) return {};

  try {
    return JSON.parse(decodeURIComponent(intake)) as Record<string, unknown>;
  } catch {
    return {};
  }
}
