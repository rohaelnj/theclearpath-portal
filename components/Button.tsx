'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

const baseClasses =
  'relative inline-flex min-w-[152px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60';

const BRAND_GREEN = '#006F6A';
const BRAND_GREEN_HOVER = '#004E4A';
const BRAND_SHADOW_CLASS = 'shadow-[0_8px_30px_rgba(0,111,106,0.45)]';

const variantClasses = {
  solid:
    `bg-[${BRAND_GREEN}] text-white hover:bg-[${BRAND_GREEN_HOVER}] focus-visible:ring-[${BRAND_GREEN}] ${BRAND_SHADOW_CLASS}`,
  outline:
    `border border-[${BRAND_GREEN}] text-[${BRAND_GREEN}] hover:bg-[rgba(0,111,106,0.06)] focus-visible:ring-[${BRAND_GREEN}]`,
  ghost:
    `text-[${BRAND_GREEN}] hover:bg-[rgba(0,111,106,0.06)] focus-visible:ring-[${BRAND_GREEN}]`,
  cta:
    `bg-[${BRAND_GREEN}] text-white hover:bg-[${BRAND_GREEN_HOVER}] focus-visible:ring-[${BRAND_GREEN}] ${BRAND_SHADOW_CLASS}`,
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
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="absolute h-24 w-24 rounded-full blur-2xl"
          style={{ background: BRAND_GREEN, opacity: 0.6 }}
        />
      </span>
    ) : null;

  if (href) {
    const content = (
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    );
    return (
      <a href={href} className={classes} {...rest}>
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
