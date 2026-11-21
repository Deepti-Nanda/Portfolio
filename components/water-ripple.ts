"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A light "stone in water" ripple drawn on a transparent canvas. Only the
 * light and shadow of the wave crests are painted, so the page background
 * (and its drifting gradient) shows through underneath.
 */

const STRENGTH = 300;
const DROP_RADIUS = 2; // in simulation cells
const DAMPING = 0.955;
const EDGE_WIDTH = 14; // cells near the edge that absorb waves
const MIN_ENERGY = 30;

interface Simulation {
  width: number;
  height: number;
  scale: number;
  current: Float32Array;
  previous: Float32Array;
  damping: Float32Array;
  image: ImageData;
}

interface RippleState {
  ctx: CanvasRenderingContext2D | null;
  sim: Simulation | null;
  frame: number | null;
  brightness: number;
}

/** Simulate at a lower resolution; the canvas is scaled up smoothly. */
function getScale(cssWidth: number) {
  return Math.max(2, Math.ceil(cssWidth / 800));
}

function createSimulation(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
): Simulation {
  const scale = getScale(cssWidth);
  const width = Math.max(3, Math.ceil(cssWidth / scale));
  const height = Math.max(3, Math.ceil(cssHeight / scale));

  canvas.width = width;
  canvas.height = height;

  // Waves fade out near the edges instead of bouncing back.
  const damping = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const edge = Math.min(x, y, width - 1 - x, height - 1 - y);
      damping[y * width + x] =
        edge < EDGE_WIDTH
          ? DAMPING * (0.82 + (0.18 * edge) / EDGE_WIDTH)
          : DAMPING;
    }
  }

  return {
    width,
    height,
    scale,
    current: new Float32Array(width * height),
    previous: new Float32Array(width * height),
    damping,
    image: ctx.createImageData(width, height),
  };
}

/** Average channel value of the theme background, used to scale shading. */
function backgroundBrightness() {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--background")
    .trim();
  const match = /^#([0-9a-f]{6})$/i.exec(value);
  if (!match) return 200;

  const hex = match[1];
  return (
    (parseInt(hex.slice(0, 2), 16) +
      parseInt(hex.slice(2, 4), 16) +
      parseInt(hex.slice(4, 6), 16)) /
    3
  );
}

function step(state: RippleState) {
  const { ctx, sim } = state;

  if (!ctx || !sim) {
    state.frame = null;
    return;
  }

  const { width, height, damping } = sim;
  const { current, previous } = sim;
  let energy = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const value =
        ((previous[i - 1] +
          previous[i + 1] +
          previous[i - width] +
          previous[i + width]) *
          0.5 -
          current[i]) *
        damping[i];

      current[i] = value;
      energy += value < 0 ? -value : value;
    }
  }

  // The newest heights become the "previous" frame for the next step.
  sim.current = previous;
  sim.previous = current;

  // Light on one side of each crest, shadow on the other. On a light page a
  // white highlight barely shows (and on a dark page a shadow), so the other
  // side is boosted to keep every ripple visible.
  const brightness = state.brightness;
  const shade = brightness > 128 ? 0.16 : 0.2;
  const lightDivisor = Math.min(255 - brightness, 110);
  const darkDivisor = Math.min(brightness, 120);
  const data = sim.image.data;
  const heights = current;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const slope =
        (heights[i - 1] -
          heights[i + 1] -
          (heights[i - width] - heights[i + width])) *
        shade;
      const o = i * 4;

      if (slope > 0) {
        data[o] = data[o + 1] = data[o + 2] = 255;
        data[o + 3] = Math.min(1, slope / lightDivisor) * 255;
      } else {
        data[o] = data[o + 1] = data[o + 2] = 0;
        data[o + 3] = Math.min(1, -slope / darkDivisor) * 255;
      }
    }
  }

  ctx.putImageData(sim.image, 0, 0);

  if (energy > MIN_ENERGY) {
    state.frame = requestAnimationFrame(() => step(state));
  } else {
    // The water is still: clear it and stop until the next drop.
    sim.current.fill(0);
    sim.previous.fill(0);
    ctx.clearRect(0, 0, width, height);
    state.frame = null;
  }
}

export function useWaterRipple() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<RippleState>({
    ctx: null,
    sim: null,
    frame: null,
    brightness: 200,
  });

  useEffect(() => {
    const state = stateRef.current;

    return () => {
      if (state.frame !== null) cancelAnimationFrame(state.frame);
      state.frame = null;
    };
  }, []);

  /** Drop a stone at a point relative to the canvas, in CSS pixels. */
  const drop = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (canvas) dropStone(stateRef.current, canvas, x, y);
  }, []);

  return { canvasRef, drop };
}

function dropStone(
  state: RippleState,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const rect = canvas.getBoundingClientRect();
  const scale = getScale(rect.width);
  let sim = state.sim;

  // (Re)create the simulation when the hero has changed size.
  if (
    !sim ||
    sim.scale !== scale ||
    sim.width !== Math.max(3, Math.ceil(rect.width / scale)) ||
    sim.height !== Math.max(3, Math.ceil(rect.height / scale))
  ) {
    sim = createSimulation(canvas, ctx, rect.width, rect.height);
    state.sim = sim;
  }

  state.ctx = ctx;
  state.brightness = backgroundBrightness();

  const cx = Math.round(x / scale);
  const cy = Math.round(y / scale);

  for (let dy = -DROP_RADIUS; dy <= DROP_RADIUS; dy++) {
    for (let dx = -DROP_RADIUS; dx <= DROP_RADIUS; dx++) {
      if (dx * dx + dy * dy > DROP_RADIUS * DROP_RADIUS) continue;

      const px = cx + dx;
      const py = cy + dy;

      if (px > 0 && py > 0 && px < sim.width - 1 && py < sim.height - 1) {
        sim.previous[py * sim.width + px] += STRENGTH;
      }
    }
  }

  if (state.frame === null) {
    state.frame = requestAnimationFrame(() => step(state));
  }
}
