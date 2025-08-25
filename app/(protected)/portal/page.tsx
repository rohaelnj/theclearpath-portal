// app/(protected)/portal/page.tsx
"use client";
import { useEffect, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!,
};

export default function PortalPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getApps().length) initializeApp(firebaseConfig);
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { router.replace("/login?next=/portal"); return; }
      if (!u.emailVerified) { router.replace("/verify-email/sent"); return; }
      setReady(true);
      // Fire-and-forget Welcome; server enforces one-time
      fetch("/api/send-welcome", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: u.email }),
      }).catch(() => { });
    });
    return () => unsub();
  }, [router]);

  if (!ready) return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Portal</h1>
      <p>Welcome to The Clear Path.</p>
    </div>
  );
}
