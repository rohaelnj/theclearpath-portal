import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    pid: process.env.FIREBASE_PROJECT_ID,
    email: process.env.FIREBASE_CLIENT_EMAIL,
    hasRaw: !!process.env.FIREBASE_PRIVATE_KEY,
    hasB64: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY_B64,
  });
}
