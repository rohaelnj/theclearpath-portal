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
    } catch (err: any) {
      setStatus("ready");
      setErrorMsg(
        err?.message?.includes("weak-password")
          ? "Password must be at least 6 characters."
          : "❌ Failed to reset password. Try again."
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-6 py-12 text-center">
      <section className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-lg">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-primary">Reset your password</h1>
          <p className="text-sm text-neutral-600">
            Choose a new password to secure your Clear Path account.
          </p>
        </div>

        {status === "verifying" && <p className="text-neutral-600">Checking your secure link…</p>}

        {status === "ready" && (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="relative">
              <label htmlFor="new-password" className="sr-only">
                New password
              </label>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a new password"
                value={newPassword}
                minLength={6}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-semibold text-primary transition hover:text-primary/80"
                aria-label="Show or hide password"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Set new password
            </button>
            {errorMsg && (
              <p className="text-sm font-medium text-red-600">{errorMsg}</p>
            )}
          </form>
        )}

        {status === "success" && (
          <p className="text-sm font-medium text-primary">
            ✅ Password reset successful! Redirecting to login…
          </p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium text-red-600">❌ Failed to reset password. Try again.</p>
        )}
        {status === "expired" && (
          <p className="text-sm font-medium text-red-600">❌ Invalid or expired password reset link.</p>
        )}
      </section>
    </main>
  );
}
