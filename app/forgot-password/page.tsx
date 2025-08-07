'use client';

import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <main
      style={{
        backgroundColor: "#DFD6C7",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Playfair Display', serif",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <style>{`
        input {
          padding: 10px;
          font-size: 16px;
          margin-top: 1rem;
          border-radius: 6px;
          border: 1px solid #ccc;
          width: 100%;
          max-width: 300px;
        }
        button {
          margin-top: 1.5rem;
          padding: 10px 20px;
          background-color: #1F4142;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>

      <h1 style={{ color: "#1F4142" }}>Forgot Your Password?</h1>
      <p style={{ color: "#1F4140", marginTop: "0.5rem" }}>
        Enter your email and we’ll send you a reset link.
      </p>

      {status === "sent" && (
        <p style={{ color: "#1F4140", marginTop: "2rem" }}>
          ✅ Reset link sent! Check your inbox.
        </p>
      )}

      {status !== "sent" && (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <button type="submit">Send Reset Link</button>
          {status === "error" && (
            <p style={{ color: "#b00020", marginTop: "1rem" }}>
              ❌ Error sending reset link. Try again.
            </p>
          )}
        </form>
      )}
    </main>
  );
}
