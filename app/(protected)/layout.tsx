'use client';

import type { ReactNode } from 'react';
import { useRequireVerified } from '@/hooks/useRequireVerified';

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    const ready = useRequireVerified();
    if (!ready) return null; // Show nothing until auth check finishes
    return <>{children}</>;
}
