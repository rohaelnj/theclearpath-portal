// app/verify-email/page.tsx
"use client";
import { Suspense, useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, applyActionCode, onAuthStateChanged } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
          Loading…
        </main>
      }
    >
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [state, setState] = useState<"verifying" | "ok" | "error">("verifying");

  useEffect(() => {
    if (!getApps().length) initializeApp(firebaseConfig);
    const oob = sp.get("oobCode");
    const next = sp.get("next") || "/portal";
    const auth = getAuth();

    if (!oob) {
      setState("error");
      router.replace("/login?error=missing-oob");
      return;
    }

    (async () => {
      try {
        await applyActionCode(auth, oob);
        setState("ok");
        const unsub = onAuthStateChanged(auth, (u) => {
          if (u) router.replace("/portal");
          else router.replace(`/login?verified=1&next=${encodeURIComponent(next)}`);
        });
        setTimeout(() => unsub(), 3000);
      } catch {
        setState("error");
        router.replace("/login?error=verify-failed");
      }
    })();
  }, [sp, router]);

  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
      {state === "verifying" && <p>Verifying your email…</p>}
      {state === "ok" && <p>Verified. Redirecting…</p>}
      {state === "error" && <p>Verification failed. Redirecting…</p>}
    </main>
  );
}
