"use client";

import { useEffect } from "react";

/**
 * Animates the browser-tab icon like the navbar logo: the N draws itself,
 * holds, then clears. Browsers don't play animations inside favicons, so the
 * icon is swapped for the next frame several times a second instead.
 */

const CYCLE_MS = 2800; // matches the navbar logo's draw loop
const FPS = 12;
const N_PATH = "M22 78V22L60 70V36";

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Same timing as the logo-draw keyframes: draw, hold, then clear. */
function dashOffset(progress: number) {
  if (progress < 0.45) return 1 - smooth(progress / 0.45);
  if (progress < 0.7) return 0;
  return -smooth((progress - 0.7) / 0.3);
}

function frame(offset: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><style>.c{stroke:#2d703c}.n{stroke:#203128}@media (prefers-color-scheme: dark){.c{stroke:#9CC562}.n{stroke:#E8EDE4}}</style><path class="c" d="M22 22H44A28 28 0 0 1 44 78H22"/><path class="n" opacity="0.25" d="${N_PATH}"/><path class="n" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${offset.toFixed(3)}" d="${N_PATH}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function FaviconAnimation() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;

    const original = link.href;
    const count = Math.round((CYCLE_MS / 1000) * FPS);
    const frames = Array.from({ length: count }, (_, i) =>
      frame(dashOffset(i / count)),
    );

    let index = 0;
    const id = window.setInterval(() => {
      link.href = frames[index];
      index = (index + 1) % frames.length;
    }, 1000 / FPS);

    return () => {
      window.clearInterval(id);
      link.href = original;
    };
  }, []);

  return null;
}
