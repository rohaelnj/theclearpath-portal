import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    keyTail: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(-8) ?? null,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? null,
  });
}
