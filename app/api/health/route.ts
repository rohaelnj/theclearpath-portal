// app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    // Simple public health — no auth wall.
    // (Optionally sanity-check admin health, but keep this endpoint public.)
    const origin = new URL(req.url).origin;

    let adminOk = false;
    try {
      const res = await fetch(`${origin}/api/admin-health`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      adminOk = !!data?.ok;
    } catch {
      adminOk = false;
    }

    return NextResponse.json(
      { ok: true, adminOk },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "request_failed" }, { status: 500 });
  }
}
