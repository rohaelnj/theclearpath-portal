"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebaseClient";

function Inner() {
    const sp = useSearchParams();
    const router = useRouter();
    const token = sp.get("token");
    const next = sp.get("next") || "/portal";
    const [msg, setMsg] = useState("Signing you in…");

    useEffect(() => {
        const run = async () => {
            if (!token) {
                router.replace("/login?autologin=missing");
                return;
            }
            try {
                await signInWithCustomToken(auth, token);
                router.replace(next);
            } catch {
                setMsg("Auto-login failed. Redirecting to login…");
                setTimeout(() => router.replace("/login?autologin=fail"), 600);
            }
        };
        run();
    }, [token, next, router]);

    return (
        <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", color: "#1F4142" }}>
            <div>{msg}</div>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
            <Inner />
        </Suspense>
    );
}
