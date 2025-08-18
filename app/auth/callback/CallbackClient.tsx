'use client';

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/firebaseClient";

export default function CallbackClient(): React.ReactElement {
    const router = useRouter();
    const params = useSearchParams();
    const [err, setErr] = useState<string>("");

    useEffect(() => {
        const token = params.get("t");
        const next = params.get("next") || "/portal";

        if (!token) {
            router.replace("/login?verify=fail");
            return;
        }

        (async () => {
            try {
                await signInWithCustomToken(auth, token);
                router.replace(next);
            } catch (e) {
                setErr((e as Error).message);
                router.replace("/login?verify=fail");
            }
        })();
    }, [params, router]);

    return (
        <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
            <p>{err ? "Verification failed." : "Finishing sign-in…"}</p>
        </main>
    );
}
