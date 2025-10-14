import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-[#d6cec1] bg-[#EDE6DC]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-[#1F4142]/80 md:flex-row md:items-center md:justify-between">
        <p>© 2026 The Clear Path. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/legal/privacy-policy" className="transition hover:text-[#1F4142]">
            Privacy
          </Link>
          <a href="mailto:support@theclearpath.ae" className="transition hover:text-[#1F4142]">
            support@theclearpath.ae
          </a>
        </div>
      </div>
    </footer>
  );
}
