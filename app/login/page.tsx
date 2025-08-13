"use client";

import React, { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";
import { auth } from "@/firebaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function isMobileSafari() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iP(hone|ad|od)/.test(ua) && /Safari/.test(ua) && !/Chrome/.test(ua);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Handle result after a redirect sign-in (iOS Safari, popup-blocked, etc.)
  useEffect(() => {
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) router.push("/portal");
      })
      .catch(() => { });
  }, [router]);

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      if (isMobileSafari()) {
        await signInWithRedirect(auth, provider);
        return;
      }
      await signInWithPopup(auth, provider);
      router.push("/portal");
    } catch (err: any) {
      if (
        err?.code === "auth/popup-blocked" ||
        err?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, provider);
        return;
      }
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }
      router.push("/portal");
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/user-not-found") setError("No account found with this email.");
      else if (code === "auth/wrong-password") setError("Incorrect password. Please try again.");
      else if (code === "auth/invalid-email") setError("Please enter a valid email address.");
      else setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        backgroundColor: "#DFD6C7",
        minHeight: "100vh",
        fontFamily: "'Playfair Display', serif",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <Image src="/logo.png" alt="The Clear Path logo" width={100} height={100} priority />
      </div>

      <h1 style={{ color: "#1F4142", fontSize: "2.1rem", marginBottom: "1rem", textAlign: "center" }}>
        Log In to Your Account
      </h1>

      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: 400 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#1F4142",
            color: "#DFD6C7",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: 10,
            fontSize: "1.06rem",
          }}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        <div style={{ display: "flex", alignItems: "center", margin: "6px 0 10px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#ddd" }} />
          <span style={{ margin: "0 14px", color: "#444", fontWeight: 700, fontSize: "1.08rem", letterSpacing: "0.5px" }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: "#ddd" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem 0",
            background: "#fff",
            border: "1.5px solid #ddd",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "1rem",
            color: "#444",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
            marginBottom: 6,
            gap: 14,
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={28}
            height={28}
            style={{ display: "inline-block" }}
          />
          Sign in with Google
        </button>

        <div style={{ marginTop: "0.8rem", textAlign: "right" }}>
          <a href="/forgot-password" style={{ fontSize: 14, color: "#1F4142", textDecoration: "underline" }}>
            Forgot password?
          </a>
        </div>

        {error && <p style={{ marginTop: "1rem", color: "#B00020", textAlign: "center" }}>{error}</p>}
      </form>

      <p style={{ marginTop: "2.2rem", color: "#1F4140" }}>
        Don’t have an account?{" "}
        <Link href="/signup" style={{ color: "#1F4142", fontWeight: "bold" }}>
          Sign up
        </Link>
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: "1rem",
};
