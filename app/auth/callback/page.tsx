import React, { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page(): React.ReactElement {
    return (
        <Suspense
            fallback={
                <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", fontFamily: "system-ui" }}>
                    <p>Loading…</p>
                </main>
            }
        >
            <CallbackClient />
        </Suspense>
    );
}
