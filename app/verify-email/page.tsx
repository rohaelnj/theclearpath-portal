"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkActionCode, applyActionCode } from "firebase/auth";
import { auth } from "@/firebaseClient";

function VerifyInner() {
    const sp = useSearchParams();
    const router = useRouter();
    const mode = sp.get("mode");
    const oobCode = sp.get("oobCode");
    const [state, setState] = useState<"idle" | "ok" | "err" | "wait">("wait");
    const [msg, setMsg] = useState("Verifying…");

    useEffect(() => {
        const run = async () => {
            if (mode !== "verifyEmail" || !oobCode) {
                setState("err");
                setMsg("Invalid verification link.");
                return;
            }
            try {
                await checkActionCode(auth, oobCode);
                await applyActionCode(auth, oobCode);
                setState("ok");
                setMsg("Email verified. Redirecting to your portal…");
                setTimeout(() => router.replace("/portal"), 800);
            } catch {
                setState("err");
                setMsg("Link expired or invalid. Please request a new one.");
            }
        };
        run();
    }, [mode, oobCode, router]);

    return (
        <main>
            <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div>
                    <div style={{ textAlign: "center", fontFamily: "system-ui, sans-serif", color: "#1F4142" }}>
                        <p>{msg}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
            <VerifyInner />
        </Suspense>
    );
}
