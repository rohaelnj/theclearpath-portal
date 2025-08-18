"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebaseClient";

function Inner(): JSX.Element {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token");
  const next = sp.get("next") || "/portal";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        router.replace("/login?autologin=missing");
        return;
      }
      try {
        await signInWithCustomToken(auth, token);
        if (!cancelled) router.replace(next);
      } catch {
        router.replace("/login?autologin=fail");
      }
    })();
    return () => { cancelled = true; };
  }, [token, next, router]);

  return (
    <main style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif",color:"#1F4142"}}>
      <div>Signing you in…</div>
    </main>
  );
}

export default function Page(): JSX.Element {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <Inner />
    </Suspense>
  );
}
