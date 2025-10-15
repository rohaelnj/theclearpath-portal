'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

const baseClasses =
  'relative inline-flex min-w-[152px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses = {
  solid: 'bg-primary text-white hover:opacity-90 focus-visible:ring-primary',
  outline: 'border border-primary text-primary hover:bg-primary/5 focus-visible:ring-primary',
  ghost: 'text-primary hover:bg-primary/5 focus-visible:ring-primary',
  cta: 'bg-primary text-white hover:opacity-90 focus-visible:ring-primary shadow-[0_8px_30px_rgba(31,65,66,0.35)]',
} as const;

type Variant = keyof typeof variantClasses;

type ButtonProps =
  | (ButtonHTMLAttributes<HTMLButtonElement> & {
      href?: undefined;
      variant?: Variant;
      children: ReactNode;
    })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & {
      href: string;
      variant?: Variant;
      children: ReactNode;
    });

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  href,
  variant = 'solid',
  className,
  children,
  ...rest
}: ButtonProps): ReactElement {
  const classes = cx(baseClasses, variantClasses[variant], className);
  const halo =
    variant === 'cta' ? (
      <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="absolute h-24 w-24 rounded-full bg-primary opacity-60 blur-2xl" />
      </span>
    ) : null;

  if (href) {
    const content = (
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    );
    const { target, rel, title } = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a href={href} className={classes} target={target} rel={rel} title={title}>
        {halo}
        {content}
      </a>
    );
  }

  const { type = 'button', ...btnProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <button className={classes} type={type} {...btnProps}>
      {halo}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}
