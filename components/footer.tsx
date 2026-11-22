"use client";

import { useSyncExternalStore, type ComponentType } from "react";
import { ArrowUp, Clock, Zap } from "lucide-react";
import { SiX } from "@icons-pack/react-simple-icons";
import { GitHubIcon, LinkedInIcon } from "./brand-icons";
import { Logo } from "./logo";

// What you're working on right now, shown in the footer.
const CURRENTLY = "building Raksha";

const socialLinks: {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { label: "GitHub", href: "https://github.com/Deepti-Nanda", icon: GitHubIcon },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/deepti-nanda-271b352a3",
    icon: LinkedInIcon,
  },
  { label: "X", href: "https://x.com/DeeptiNanda", icon: SiX },
];

const subscribeToNothing = () => () => {};

function subscribeToClock(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

const ranchiTime = () =>
  new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });

function CopyrightYear() {
  // Prerender with a fixed year, then show the visitor's current year.
  const year = useSyncExternalStore(
    subscribeToNothing,
    () => new Date().getFullYear(),
    () => 2026,
  );

  return <>{year}</>;
}

function RanchiTime() {
  // Empty while prerendering; the visitor's browser fills in the live time.
  const time = useSyncExternalStore(subscribeToClock, ranchiTime, () => "");

  return <>{time ? `${time} IST` : "IST"}</>;
}

export function Footer() {
  return (
    <footer className="mt-8">
      {/* A slowly drifting wave edge, echoing the water ripple in the hero.
          It's one wavelength wider than the view, so the loop is seamless. */}
      <svg
        viewBox="0 0 600 24"
        preserveAspectRatio="none"
        className="block h-5 w-full overflow-hidden"
        aria-hidden="true"
      >
        <path
          className="footer-wave"
          d="M0 12 Q25 0 50 12 T100 12 T150 12 T200 12 T250 12 T300 12 T350 12 T400 12 T450 12 T500 12 T550 12 T600 12 T650 12 T700 12 V24 H0Z"
          fill="var(--footer-bg)"
        />
      </svg>

      <div className="bg-[var(--footer-bg)]">
        <div className="container grid gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 md:items-center">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10 shrink-0" />
            <div>
              <p className="font-semibold text-[var(--foreground)]">
                Deepti Nanda
              </p>
              <p className="text-sm text-[var(--footer-muted)]">
                Full-Stack Developer
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm text-[var(--footer-muted)]">
            <p className="flex items-center gap-2">
              <Clock
                className="h-4 w-4 shrink-0 text-[var(--accent)]"
                aria-hidden="true"
              />
              <span>
                <RanchiTime /> in Ranchi, India
              </span>
            </p>
            <p className="flex items-center gap-2">
              <Zap
                className="h-4 w-4 shrink-0 text-[var(--accent)]"
                aria-hidden="true"
              />
              <span>Currently: {CURRENTLY}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--footer-border)] text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}

            <a
              href="#home"
              aria-label="Back to top"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              <ArrowUp className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--footer-border)]">
          <div className="container flex flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-[var(--footer-muted)] sm:flex-row sm:px-6">
            <p>
              © <CopyrightYear /> Deepti Nanda
            </p>
            <p>Psst… tap the hero for a surprise</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
