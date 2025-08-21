'use client';

import { useEffect, useState } from "react";
import { getAuth, confirmPasswordReset } from "firebase/auth";

export default function ResetPassword() {
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"verifying" | "ready" | "success" | "error" | "expired">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("oobCode");

    if (code) {
      setOobCode(code);
      setStatus("ready");
    } else {
      setStatus("expired");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!oobCode) return;

    setStatus("verifying");
    const auth = getAuth();
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2500);
    } catch (err: unknown) {
      setStatus("ready");
      const message =
        err instanceof Error && err.message.includes("weak-password")
          ? "Password must be at least 8 characters."
          : "❌ Failed to reset password. Try again.";
      setErrorMsg(message);
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

      <h1 style={{ color: "#1F4142", marginBottom: "1rem" }}>Reset Your Password</h1>

      {/* Show loading if verifying */}
      {status === "verifying" && <p>Setting...</p>}

      {/* Show form only if ready */}
      {status === "ready" && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 350 }}>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              value={newPassword}
              minLength={8}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ paddingRight: 65 }}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: 0,
                top: 11,
                background: "none",
                color: "#1F4142",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "2px 10px",
              }}
              aria-label="Show or hide password"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            style={{ width: "100%" }}
          >
            Set New Password
          </button>
          {errorMsg && (
            <p style={{ color: "#B00020", marginTop: "1rem", fontWeight: "500" }}>{errorMsg}</p>
          )}
        </form>
      )}

      {status === "success" && <p style={{ color: "#1F4142" }}>✅ Password reset successful! Redirecting to login...</p>}
      {status === "error" && <p style={{ color: "darkred" }}>❌ Failed to reset password. Try again.</p>}
      {status === "expired" && <p style={{ color: "darkred" }}>❌ Invalid or expired password reset link.</p>}
    </main>
  );
}
