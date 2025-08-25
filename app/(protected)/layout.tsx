// app/(protected)/layout.tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/firebaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname() || "/portal";
    const [ready, setReady] = useState(false);
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const welcomeFired = useRef(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u);
            if (!u) {
                router.replace(`/login?next=${encodeURIComponent(pathname)}`);
                return;
            }
            const isPassword = u.providerData.some((p) => p.providerId === "password");
            if (isPassword && !u.emailVerified) {
                router.replace(`/login?verify=1&next=${encodeURIComponent(pathname)}`);
                return;
            }
            setReady(true);

            // Single source of truth: send Welcome once after verified user lands in protected area.
            if (!welcomeFired.current && u.emailVerified) {
                welcomeFired.current = true;
                try {
                    await fetch("/api/send-welcome", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: u.email }),
                    });
                } catch {
                    /* ignore */
                }
            }
        });
        return () => unsub();
    }, [router, pathname]);

    if (!ready || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-[#1F4142] border-t-transparent animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
