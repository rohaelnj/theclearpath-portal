import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const origin = new URL(req.url).origin;
    const res = await fetch(`${origin}/api/admin-health`, { cache: "no-store" });
    const data = await res.json().catch(() => null);
    const ok = !!data?.ok;

    return NextResponse.json(
      ok ? { ok: true } : { ok: false, error: data?.error || data?.reason || "request_failed" },
      { status: ok ? 200 : 500 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "request_failed" }, { status: 500 });
  }
}
