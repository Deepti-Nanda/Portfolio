"use client";

import { useEffect, useState } from "react";

const COMMAND = "hello_world";
const TYPE_MS = 110; // per letter
const HOLD_MS = 4000; // before typing it again
const START_MS = 500;

/**
 * A tiny terminal window that types out a greeting, holds, then types it
 * again. Its colours follow the site theme.
 */
export function TerminalGreeting({ className = "" }: { className?: string }) {
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    let count = 0;
    let timeoutId: number;

    const tick = () => {
      count = count >= COMMAND.length ? 0 : count + 1;
      setTyped(count);
      timeoutId = window.setTimeout(
        tick,
        count === COMMAND.length ? HOLD_MS : TYPE_MS,
      );
    };

    timeoutId = window.setTimeout(tick, START_MS);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <span
      data-no-ripple
      className={`inline-flex items-center gap-2 rounded-[10px] border border-[var(--term-border)] bg-[var(--term-bg)] px-3.5 py-1.5 font-mono text-sm font-medium text-[var(--term-fg)] ${className}`}
    >
      <span className="mr-1 inline-flex gap-1" aria-hidden="true">
        <span className="h-[7px] w-[7px] rounded-full bg-[#ff5f57]" />
        <span className="h-[7px] w-[7px] rounded-full bg-[#febc2e]" />
        <span className="h-[7px] w-[7px] rounded-full bg-[#28c840]" />
      </span>
      <span className="text-[var(--term-prompt)]" aria-hidden="true">
        $
      </span>
      <span className="sr-only">{COMMAND}</span>
      <span aria-hidden="true">{COMMAND.slice(0, typed)}</span>
      <span
        aria-hidden="true"
        className="terminal-cursor -ml-1 inline-block h-[15px] w-2 bg-[var(--term-fg)]"
      />
    </span>
  );
}
