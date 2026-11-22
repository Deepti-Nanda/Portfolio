"use client";

import type { PointerEvent } from "react";
import Image from "next/image";
import { TerminalGreeting } from "@/components/terminal-greeting";
import { useWaterRipple } from "@/components/water-ripple";
import portrait from "@/public/hero/deepti-nanda.jpg";

/**
 * Whether a point is on the words of a heading or paragraph. Their boxes are
 * much wider than the text, and taps beside the words should still ripple.
 */
function isOnText(target: Element, x: number, y: number) {
  const block = target.closest("h1, p");
  if (!block) return false;

  const range = document.createRange();
  range.selectNodeContents(block);

  return Array.from(range.getClientRects()).some(
    (rect) =>
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom,
  );
}

export function Hero() {
  const { canvasRef, drop } = useWaterRipple();

  // Ripple only where the background is visible, not on text, links, the
  // photo or the terminal greeting.
  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    const target = event.target as Element;
    if (target.closest("a, button, img, [data-no-ripple]")) return;
    if (isOnText(target, event.clientX, event.clientY)) return;

    const rect = event.currentTarget.getBoundingClientRect();
    drop(event.clientX - rect.left, event.clientY - rect.top);
  };

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-24 pb-24 sm:px-6 md:pt-20"
      onPointerDown={handlePointerDown}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div className="container relative z-10 mx-auto grid w-full max-w-5xl items-center gap-10 px-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <TerminalGreeting className="mb-5 animate-fade-in-up" />

          <h1
            className="animate-fade-in-up text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.1s" }}
          >
            Deepti <span className="text-[var(--accent)]">Nanda</span>
          </h1>

          <p
            className="mx-auto mt-6 w-full max-w-2xl animate-fade-in-up text-[15px] leading-relaxed text-[var(--muted)] min-[400px]:whitespace-nowrap sm:mt-7 sm:text-lg md:text-xl lg:mx-0"
            style={{ animationDelay: "0.2s" }}
          >
            Building technology that solves real-world problems
          </p>
        </div>

        {/* Portrait card with an offset frame behind it. */}
        <div
          className="relative order-1 w-[min(300px,60vw)] animate-fade-in-up justify-self-center lg:order-2"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-4 translate-y-4 rounded-3xl border-2 border-[var(--logo-accent)]"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl">
            <Image
              src={portrait}
              alt="Deepti Nanda smiling at DevFest Ranchi 2026"
              fill
              sizes="(min-width: 1024px) 300px, 60vw"
              quality={90}
              placeholder="blur"
              loading="eager"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      <a
        href="#about"
        className="absolute bottom-6 left-1/2 flex min-h-11 min-w-11 -translate-x-1/2 animate-float items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--accent)] sm:bottom-8"
        aria-label="Scroll to About section"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </a>
    </section>
  );
}
