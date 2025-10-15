import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';

export default async function Header() {
  const cookieStore = await cookies();
  const authed = Boolean(cookieStore.get('auth_jwt')?.value);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Clear Path" width={200} height={55} className="h-14 w-auto" priority />
          <span className="sr-only">Clear Path Home</span>
        </Link>
        <nav className="flex items-center gap-8 text-base">
          <Link
            href="/intake"
            className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Get started
          </Link>
          <Link
            href="/plans"
            className="text-primary transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Plans
          </Link>
          <Link
            href={authed ? '/patient/sessions' : '/login'}
            className="rounded-full bg-primary px-5 py-2 font-semibold text-white hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {authed ? 'Portal' : 'Login'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
