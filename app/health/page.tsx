// app/health/page.tsx
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/firebaseClient";

type ApiHealth = { ok: boolean; msg?: string; error?: string };

export default function HealthPage() {
  const [api, setApi] = useState<ApiHealth | null>(null);

  useEffect(() => {
    fetch("/api/admin-health", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ApiHealth) => setApi(data))
      .catch(() => setApi({ ok: false, error: "request_failed" }));
  }, []);

  const clientOk =
    !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    !!auth;

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 22, marginBottom: 12 }}>Health Check</h1>

      <ul style={{ lineHeight: 1.8 }}>
        <li>
          Client env present (public) — <strong>{clientOk ? "OK ✅" : "Missing ❌"}</strong>
        </li>
        <li>
          Admin init (server) —{" "}
          <strong>
            {api == null ? "Checking…" : api.ok ? "OK ✅" : `Fail ❌ (${api.error || "request_failed"})`}
          </strong>
        </li>
      </ul>

      <p style={{ marginTop: 16, color: "#666" }}>
        This page only checks <code>NEXT_PUBLIC_*</code> vars on the client and that the Admin SDK
        can initialize on the server. No secrets are shown.
      </p>
    </div>
  );
}
