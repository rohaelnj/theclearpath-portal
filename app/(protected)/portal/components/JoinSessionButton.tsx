'use client';

import { useEffect, useMemo, useState } from 'react';

type Props = {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  startIso: string;
  endIso: string;
  jitsiUrl?: string;
  preMinutes?: number;
  postMinutes?: number;
  className?: string;
};

const REFRESH_MS = 15_000;

function formatCountdown(msUntil: number): string {
  const minutes = Math.max(0, Math.ceil(msUntil / 60_000));
  if (minutes <= 1) return 'under 1 min';
  return `${minutes} min`;
}

export default function JoinSessionButton({
  status,
  startIso,
  endIso,
  jitsiUrl,
  preMinutes = 10,
  postMinutes = 15,
  className,
}: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const state = useMemo(() => {
    const startMs = new Date(startIso).getTime();
    const endMs = new Date(endIso).getTime();

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return {
        inWindow: false,
        notYet: false,
        expired: false,
        windowOpensAt: Number.NaN,
        windowClosesAt: Number.NaN,
      };
    }

    const opens = startMs - preMinutes * 60_000;
    const closes = endMs + postMinutes * 60_000;

    return {
      inWindow: now >= opens && now <= closes,
      notYet: now < opens,
      expired: now > closes,
      windowOpensAt: opens,
      windowClosesAt: closes,
    };
  }, [startIso, endIso, preMinutes, postMinutes, now]);

  const baseClass = `w-full rounded-xl px-4 py-2 ${className ?? ''}`;
  const disabledProps = {
    type: 'button' as const,
    disabled: true,
    className: `${baseClass} opacity-60`,
    'aria-disabled': 'true',
  };

  if (status !== 'confirmed') {
    return (
      <button {...disabledProps} title="Waiting for confirmation">
        Waiting for confirmation
      </button>
    );
  }

  if (!jitsiUrl) {
    return (
      <button {...disabledProps} title="Join link unavailable">
        Join link unavailable
      </button>
    );
  }

  if (state.inWindow) {
    return (
      <a
        href={jitsiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} inline-block text-center bg-[#1F4142] text-white`}
      >
        Join session
      </a>
    );
  }

  if (state.notYet) {
    return (
      <button {...disabledProps} title="Join window not open yet">
        Join opens in {formatCountdown(state.windowOpensAt - now)}
      </button>
    );
  }

  if (state.expired) {
    return (
      <button {...disabledProps} title="Join window closed">
        Session window closed
      </button>
    );
  }

  return (
    <button {...disabledProps} title="Join window unavailable">
      Join window unavailable
    </button>
  );
}
