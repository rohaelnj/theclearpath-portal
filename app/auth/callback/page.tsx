import React, { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function Page(): React.ReactElement {
    return (
        <Suspense
            fallback={
                <main className="grid min-h-[60vh] place-items-center font-sans">
                    <p>Loading…</p>
                </main>
            }
        >
            <CallbackClient />
        </Suspense>
    );
}
