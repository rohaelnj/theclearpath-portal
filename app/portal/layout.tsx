"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useRouter } from "next/navigation";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.emailVerified) {
        router.replace("/login");
      } else {
        setIsAuthed(true);
      }
      setChecking(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  if (checking) {
    return (
      <div style={{
        textAlign: "center",
        paddingTop: "4rem",
        fontFamily: "'Playfair Display', serif",
        color: "#1F4142"
      }}>
        Checking authentication...
      </div>
    );
  }

  return <>{isAuthed && children}</>;
}
