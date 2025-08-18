"use client";

import { useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseClient";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace(`/login?next=${encodeURIComponent(pathname || "/portal")}`);
        return;
      }
      const needsVerify =
        user.providerData.some((p) => p.providerId === "password") && !user.emailVerified;
      if (needsVerify) {
        router.replace(`/login?verify=1&next=${encodeURIComponent(pathname || "/portal")}`);
        return;
      }
      setReady(true);
    });
    return () => unsub();
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-[#1F4142] border-t-transparent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
