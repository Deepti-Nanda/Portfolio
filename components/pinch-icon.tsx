"use client";

import { useEffect, useRef } from "react";
import { getImageProps } from "next/image";

/**
 * A Pinch of Memories: the hand gently rubs and dips while spice falls from
 * the fingertips onto the dish, with golden sparkles for a touch of magic.
 *
 * The photo is a single image, so the hand moves by bending the photo around
 * it: the soft background behind the hand stretches unnoticed.
 */

// A resized, optimized copy of the photo, sized for the card thumbnail.
const { props: photo } = getImageProps({
  src: "/projects/pinch-of-memories.webp",
  alt: "",
  width: 400,
  height: 400,
});

// Positions are fractions of the (square) photo.
const TIP = { x: 0.458, y: 0.44 };
const DISH = { top: 0.5, bottom: 0.58 };
const FOCUS_Y = 0.48; // vertical centre of the crop shown in the thumbnail
const SPICE = ["#E8A317", "#D9781E", "#C2451E", "#F2C14E", "#B8611A"];

interface Grain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  land: number;
  delay: number;
  settled: number;
}

interface Sparkle {
  x: number;
  y: number;
  age: number;
  life: number;
  size: number;
}

interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Warp {
  width: number;
  height: number;
  source: ImageData;
  output: ImageData;
  x0: number;
  y0: number;
  w: number;
  h: number;
  weights: Float32Array;
}

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** 1 on the hand and fingers, fading to 0 before the dish and the edges. */
const handWeight = (x: number, y: number) =>
  smooth(0.263, 0.364, x) *
  (1 - smooth(0.686, 0.788, x)) *
  (1 - smooth(0.424, 0.5, y));

/** The hand rubs side to side while gently lifting and dipping. */
const handOffset = (t: number) => ({
  x: 0.0068 * Math.sin(t * Math.PI * 4.4),
  y: 0.0119 * Math.sin(t * Math.PI * 2.2),
});

/** Show the full width of the photo, centred on the hand and dish. */
function cropFor(width: number, height: number): Crop {
  const w = Math.min(1, width / height);
  const h = Math.min(1, height / width);
  const y = Math.min(1 - h, Math.max(0, FOCUS_Y - h / 2));
  return { x: (1 - w) / 2, y, w, h };
}

function startSprinkle(
  container: HTMLElement,
  photoCanvas: HTMLCanvasElement,
  fxCanvas: HTMLCanvasElement,
) {
  const photoCtx = photoCanvas.getContext("2d", { willReadFrequently: true });
  const fxCtx = fxCanvas.getContext("2d");
  if (!photoCtx || !fxCtx) return () => {};

  const image = new Image();
  image.src = photo.src;

  let width = 0;
  let height = 0;
  let crop: Crop = { x: 0, y: 0, w: 1, h: 1 };
  let warp: Warp | null = null;
  let grains: Grain[] = [];
  let sparkles: Sparkle[] = [];
  let frameId: number | null = null;
  let last = 0;
  let nextBurst = 0;

  // Photo fractions to canvas pixels.
  const toX = (x: number) => ((x - crop.x) / crop.w) * width;
  const toY = (y: number) => ((y - crop.y) / crop.h) * height;
  const toSize = (s: number) => (s / crop.w) * width;

  function prepare() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.clientWidth;
    height = container.clientHeight;
    if (!width || !height) return;

    crop = cropFor(width, height);
    fxCanvas.width = Math.round(width * dpr);
    fxCanvas.height = Math.round(height * dpr);
    fxCtx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!image.complete || !image.naturalWidth) return;

    const pw = Math.round(width * dpr);
    const ph = Math.round(height * dpr);
    const n = image.naturalWidth;

    photoCanvas.width = pw;
    photoCanvas.height = ph;
    photoCtx!.drawImage(
      image,
      crop.x * n,
      crop.y * n,
      crop.w * n,
      crop.h * n,
      0,
      0,
      pw,
      ph,
    );

    // Only the area around the hand is ever redrawn.
    const x0 = Math.max(0, Math.floor(((0.263 - crop.x) / crop.w) * pw));
    const x1 = Math.min(pw, Math.ceil(((0.788 - crop.x) / crop.w) * pw));
    const y1 = Math.min(ph, Math.ceil(((0.5 - crop.y) / crop.h) * ph));
    const w = Math.max(0, x1 - x0);
    const h = Math.max(0, y1);
    const weights = new Float32Array(w * h);

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        weights[y * w + x] = handWeight(
          crop.x + ((x0 + x) / pw) * crop.w,
          crop.y + (y / ph) * crop.h,
        );
      }
    }

    warp = {
      width: pw,
      height: ph,
      source: photoCtx!.getImageData(0, 0, pw, ph),
      output: photoCtx!.getImageData(0, 0, pw, ph),
      x0,
      y0: 0,
      w,
      h,
      weights,
    };
  }

  /** Shift the hand by (dx, dy) canvas pixels, fading out around it. */
  function bend(dx: number, dy: number) {
    if (!warp || !warp.w || !warp.h) return;

    const { width: pw, height: ph, x0, y0, w, h, weights } = warp;
    const s = warp.source.data;
    const o = warp.output.data;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const k = weights[y * w + x];
        const X = x0 + x;
        const Y = y0 + y;
        let sx = Math.round(X - dx * k);
        let sy = Math.round(Y - dy * k);
        sx = sx < 0 ? 0 : sx >= pw ? pw - 1 : sx;
        sy = sy < 0 ? 0 : sy >= ph ? ph - 1 : sy;

        const di = (Y * pw + X) * 4;
        const si = (sy * pw + sx) * 4;
        o[di] = s[si];
        o[di + 1] = s[si + 1];
        o[di + 2] = s[si + 2];
        o[di + 3] = 255;
      }
    }

    photoCtx!.putImageData(warp.output, 0, 0, x0, y0, w, h);
  }

  function burst(now: number, hx: number, hy: number) {
    const count = 10 + Math.random() * 6;

    for (let i = 0; i < count; i++) {
      grains.push({
        x: TIP.x + hx + (Math.random() - 0.5) * 0.017,
        y: TIP.y + hy + Math.random() * 0.0085,
        vx: (Math.random() - 0.5) * 0.034,
        vy: 0.034 + Math.random() * 0.068,
        r: 0.0021 + Math.random() * 0.0026,
        color: SPICE[Math.floor(Math.random() * SPICE.length)],
        land: DISH.top + Math.random() * (DISH.bottom - DISH.top),
        delay: Math.random() * 0.22,
        settled: 0,
      });
    }

    for (let i = 0; i < 3; i++) {
      sparkles.push({
        x: TIP.x + hx + (Math.random() - 0.5) * 0.1,
        y: TIP.y + hy + 0.017 + Math.random() * 0.1,
        age: 0,
        life: 0.6 + Math.random() * 0.5,
        size: 0.0102 + Math.random() * 0.0119,
      });
    }

    nextBurst = now + 550 + Math.random() * 200;
  }

  function drawStar(x: number, y: number, size: number, alpha: number) {
    const ctx = fxCtx!;
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#FFF4C7";
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const r = k % 2 === 0 ? size : size * 0.28;
      const a = (k / 8) * Math.PI * 2 - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#F2B632";
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function frame(now: number) {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;

    const hand = handOffset(now / 1000);
    if (warp) {
      bend(
        (hand.x / crop.w) * warp.width,
        (hand.y / crop.h) * warp.height,
      );
    }

    if (now >= nextBurst) burst(now, hand.x, hand.y);

    if (Math.random() < dt * 4) {
      sparkles.push({
        x: 0.3 + Math.random() * 0.4,
        y: 0.46 + Math.random() * 0.17,
        age: 0,
        life: 0.7 + Math.random() * 0.6,
        size: 0.0085 + Math.random() * 0.0102,
      });
    }

    const ctx = fxCtx!;
    ctx.clearRect(0, 0, width, height);

    grains = grains.filter((g) => {
      if (g.delay > 0) {
        g.delay -= dt;
        return true;
      }

      if (g.y < g.land) {
        g.vy += 0.3 * dt;
        g.x += g.vx * dt;
        g.y += g.vy * dt;
      } else {
        g.settled += dt;
        if (g.settled > 0.5) return false;
      }

      ctx.globalAlpha = g.settled ? 1 - g.settled / 0.5 : 1;
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(toX(g.x), toY(g.y), toSize(g.r), 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;

    sparkles = sparkles.filter((p) => {
      p.age += dt;
      if (p.age > p.life) return false;

      const t = p.age / p.life;
      const pulse = Math.sin(t * Math.PI);
      drawStar(
        toX(p.x),
        toY(p.y - t * 0.017),
        toSize(p.size) * (0.5 + pulse * 0.7),
        pulse,
      );
      return true;
    });

    frameId = requestAnimationFrame(frame);
  }

  function play() {
    if (frameId === null) {
      last = 0;
      frameId = requestAnimationFrame(frame);
    }
  }

  function pause() {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  image.onload = prepare;

  const resizeObserver = new ResizeObserver(prepare);
  resizeObserver.observe(container);

  // Only animate while the card is on screen.
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) play();
    else pause();
  });
  visibility.observe(container);

  prepare();

  return () => {
    pause();
    resizeObserver.disconnect();
    visibility.disconnect();
    image.onload = null;
  };
}

export function PinchIcon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const photoCanvas = photoRef.current;
    const fxCanvas = fxRef.current;
    if (!container || !photoCanvas || !fxCanvas) return;

    return startSprinkle(container, photoCanvas, fxCanvas);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      role="img"
      aria-label="A Pinch of Memories icon"
    >
      <canvas ref={photoRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={fxRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
