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
    <main className="flex min-h-screen flex-col items-center justify-center bg-stone-100 px-6 py-12 text-center">
      <section className="w-full max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-lg">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-primary">Forgot your password?</h1>
          <p className="text-sm text-neutral-600">
            Enter the email address linked to your Clear Path account and we&apos;ll send a reset link.
          </p>
        </div>

        {status === "sent" ? (
          <p className="text-sm font-medium text-primary">✅ Reset link sent! Check your inbox.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <label htmlFor="email" className="text-sm font-medium text-primary">
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Send reset link
            </button>
            {status === "error" && (
              <p className="text-sm font-medium text-red-600">❌ Error sending reset link. Try again.</p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
