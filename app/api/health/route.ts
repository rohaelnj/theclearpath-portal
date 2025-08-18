// app/api/health/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Minimal public healthcheck. No Admin, no internal calls. */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
