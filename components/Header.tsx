import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import type { Route } from 'next';
import dynamic from 'next/dynamic';

const MainNav = dynamic(() => import('./MainNav'), { ssr: false });

export default async function Header() {
  const jar = await cookies();
  const authed = Boolean(jar.get('auth_jwt'));
  const ctaHref = (authed ? '/patient/sessions' : '/login') as Route;
  const ctaLabel = authed ? 'Portal' : 'Login';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Clear Path" width={200} height={55} className="h-14 w-auto" priority />
          <span className="sr-only">Clear Path Home</span>
        </Link>
        <MainNav authed={authed} ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </div>
    </header>
  );
}
