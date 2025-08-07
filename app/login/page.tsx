'use client';

import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (!result.user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      router.push("/portal");
    } catch (err: any) {
      setError("Google sign-in failed. Try again.");
      if (process.env.NODE_ENV === "development") {
        console.error("Google Sign-In Error:", err?.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      router.push("/portal");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
      if (process.env.NODE_ENV === "development") {
        console.error("Login Error:", err.message);
      }
    } finally {
      setLoading(false);
    }
  };

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
      {/* Logo */}
      <div style={{ marginBottom: "2rem" }}>
        <Image src="/logo.png" alt="The Clear Path logo" width={100} height={100} priority />
      </div>

      {/* Heading */}
      <h1 style={{ color: "#1F4142", fontSize: "2.1rem", marginBottom: "1rem", textAlign: "center" }}>
        Log In to Your Account
      </h1>

      {/* Login Form */}
      <form onSubmit={handleLogin} style={{ width: "100%", maxWidth: "400px" }}>
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
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "10px", // less space
            fontSize: "1.06rem",
          }}
        >
          {loading ? "Logging In..." : "Log In"}
        </button>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '6px 0 10px 0' // much closer now
        }}>
          <div style={{ flex: 1, height: 1, background: '#ddd' }}></div>
          <span style={{
            margin: '0 14px',
            color: '#444',
            fontWeight: 700,
            fontSize: '1.08rem',
            letterSpacing: '0.5px'
          }}>
            or
          </span>
          <div style={{ flex: 1, height: 1, background: '#ddd' }}></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          style={{
            width: "100%",
            padding: "0.7rem 0",
            background: "#fff",
            border: "1.5px solid #ddd",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "1rem",
            color: "#444",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 1px 4px rgba(60,60,60,0.04)",
            marginBottom: "6px",
            gap: "14px"
          }}
          disabled={loading}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            width={28} // slightly bigger
            height={28}
            style={{ display: "inline-block" }}
          />
          Sign in with Google
        </button>

        {/* Forgot password */}
        <div style={{ marginTop: "0.8rem", textAlign: "right" }}>
          <a href="/forgot-password" style={{ fontSize: "14px", color: "#1F4142", textDecoration: "underline" }}>
            Forgot password?
          </a>
        </div>

        {/* Error message */}
        {error && (
          <p style={{ marginTop: "1rem", color: "#B00020", textAlign: "center" }}>{error}</p>
        )}
      </form>

      <p style={{ marginTop: "2.2rem", color: "#1F4140" }}>
        Don’t have an account?{" "}
        <a href="/signup" style={{ color: "#1F4142", fontWeight: "bold" }}>
          Sign up
        </a>
      </p>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "0.75rem",
  marginBottom: "1rem",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
};
