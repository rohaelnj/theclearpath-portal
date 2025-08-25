// app/login/page.tsx
export const dynamic = "force-dynamic";
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/firebaseClient";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged,
  type UserCredential,
} from "firebase/auth";

type LogEntry = { ts: string; msg: string; data?: unknown };
declare global { interface Window { __grrLogs?: LogEntry[] } }

function log(msg: string, data?: unknown) {
  const entry: LogEntry = { ts: new Date().toISOString(), msg, data };
  window.__grrLogs = window.__grrLogs || [];
  window.__grrLogs.push(entry);
  try { localStorage.setItem("grrLogs", JSON.stringify(window.__grrLogs)); } catch { }
  // eslint-disable-next-line no-console
  console.log(msg, data);
}

function safeUC(uc: UserCredential | null) {
  if (!uc) return null;
  const u = uc.user;
  return {
    providerId: uc.providerId,
    operationType: uc.operationType,
    user: u ? {
      uid: u.uid, email: u.email, emailVerified: u.emailVerified,
      providers: u.providerData.map(p => p.providerId),
    } : null,
  };
}

async function requestVerification(email: string) {
  try {
    await fetch("/api/send-verification", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch { }
}

export default function Page() {
  return (
    <Suspense fallback={<main style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>Loading…</main>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/portal";

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      await setPersistence(auth, browserLocalPersistence).catch(() => { });
      log("href", location.href);
      try { const rr = await getRedirectResult(auth); log("getRedirectResult", safeUC(rr)); }
      catch (e) { log("getRedirectResult error", String((e as Error)?.message || e)); }
      log("currentUser", auth.currentUser ? {
        email: auth.currentUser.email,
        providers: auth.currentUser.providerData.map(p => p.providerId),
        verified: auth.currentUser.emailVerified,
      } : null);

      const u = auth.currentUser;
      if (u && (u.emailVerified || u.providerData.some(p => p.providerId === "google.com"))) {
        router.replace(next);
      }
    })();

    const unsub = onAuthStateChanged(auth, (u) => {
      log("onAuthStateChanged", u ? {
        email: u.email, verified: u.emailVerified,
        providers: u.providerData.map(p => p.providerId),
      } : null);
      if (u && (u.emailVerified || u.providerData.some(p => p.providerId === "google.com"))) {
        router.replace(next);
      }
    });
    return () => unsub();
  }, [router, next]);

  async function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pw);
      log("emailSignIn", { email: cred.user.email, verified: cred.user.emailVerified });
      if (!cred.user.emailVerified) {
        await requestVerification(email);
        router.replace("/verify-email/sent");
        return;
      }
      router.replace(next);
    } catch (e: any) {
      setErr(e?.message || "Login failed.");
      log("emailSignIn error", String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setErr(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Try popup first for SPA. Fall back to redirect on blockers.
      try {
        log("signInWithPopup start");
        await signInWithPopup(auth, provider);
        return; // onAuthStateChanged will route
      } catch (err: any) {
        const code = err?.code ?? "";
        if (code !== "auth/popup-blocked" && code !== "auth/operation-not-supported-in-this-environment") {
          throw err;
        }
        log("Popup unavailable, falling back to redirect");
      }

      log("signInWithRedirect start");
      await signInWithRedirect(auth, provider);
    } catch (e: any) {
      setErr(e?.message || "Google sign-in failed.");
      log("google sign-in error", String(e?.message || e));
      setBusy(false);
    }
  }

  function downloadLogs() {
    const logs = window.__grrLogs || [];
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `login-google-debug-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
      <h1>Log in</h1>
      {sp.get("verified") && <p>Verified. Please sign in.</p>}
      {err && <p style={{ color: "#b00020" }}>{err}</p>}
      <form onSubmit={onEmail}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required style={{ width: "100%", margin: "8px 0", padding: 10 }} />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" required style={{ width: "100%", margin: "8px 0", padding: 10 }} />
        <button type="submit" disabled={busy} style={{ width: "100%", padding: 12 }}>Continue</button>
      </form>
      <div style={{ height: 12 }} />
      <button type="button" onClick={onGoogle} disabled={busy} style={{ width: "100%", padding: 12 }}>
        Continue with Google
      </button>
      <div style={{ height: 8 }} />
      <button type="button" onClick={downloadLogs} style={{ width: "100%", padding: 10 }}>
        Download debug log
      </button>
    </main>
  );
}
