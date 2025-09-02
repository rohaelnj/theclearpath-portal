// app/components/Button.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';

type Props = {
  href?: string;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: React.ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  disabled?: boolean;
};

const base =
  'inline-flex items-center justify-center rounded-md px-5 py-3 font-semibold transition ' +
  'bg-[#1F4142] text-[#DFD6C7] hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none';

export default function Button({
  href,
  children,
  className = '',
  type = 'button',
  onClick,
  disabled,
}: Props) {
  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`}>
      {children}
    </button>
  );
}
