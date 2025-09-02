// app/components/Button.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import type { UrlObject } from 'url';
import type { Route } from 'next';

type HrefInput = Route | UrlObject | string;

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: HrefInput;
};

function toHref(href: HrefInput): Route | UrlObject {
  if (typeof href === 'string') {
    const path = href.startsWith('/') ? href : `/${href}`;
    return path as Route;
  }
  return href;
}

export default function Button({
  href,
  className = '',
  children,
  ...rest
}: ButtonProps): React.ReactElement {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-4 py-2 font-medium disabled:opacity-50';

  if (href) {
    return (
      <Link href={toHref(href)} className={`${base} ${className}`}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...btnProps } = rest;

  return (
    <button type={type} className={`${base} ${className}`} {...btnProps}>
      {children}
    </button>
  );
}
