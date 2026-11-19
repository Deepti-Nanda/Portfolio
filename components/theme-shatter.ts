/**
 * "Shatter" theme switch: the page as it looked before the switch cracks
 * into glass shards that fly out from the toggle and fall away, revealing
 * the new theme underneath. The navbar stays live above it.
 *
 * Each shard is a copy of the on-screen sections clipped to a triangle. The
 * copies sit inside an element that keeps the old `data-theme`, so they keep
 * the old colors while the real page switches.
 */

type Vec = [number, number];

interface Shard {
  points: Vec[];
  cx: number;
  cy: number;
  // Bounding box: each shard is only as large as its triangle.
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  vx: number;
  vy: number;
  spin: number;
}

const CRACK_MS = 160;
const SPREAD_MS = 220;
const FALL_MS = 1100;
const GRAVITY = 2600; // px/s²
const SPOKES = 8;
const RINGS = 3;

let running = false;

export async function shatterThemeSwitch(origin: Vec, applyTheme: () => void) {
  if (running) return;

  const oldTheme = document.documentElement.getAttribute("data-theme");

  if (
    !oldTheme ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    applyTheme();
    return;
  }

  running = true;

  try {
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    const shards = buildShards(width, height, origin);
    const overlay = createOverlay(oldTheme, width, height, shards);

    document.body.appendChild(overlay);

    // The overlay now hides the page, so the theme can change underneath.
    applyTheme();

    await animateShards(overlay, shards);
    overlay.remove();
  } catch (error) {
    console.error("Theme shatter failed:", error);
    applyTheme();
  } finally {
    running = false;
  }
}

/** A copy of what's on screen: the page background and visible sections. */
function cloneScene(width: number, height: number) {
  const scene = document.createElement("div");

  Object.assign(scene.style, {
    position: "absolute",
    width: `${width}px`,
    height: `${height}px`,
    overflow: "hidden",
    background: getComputedStyle(document.documentElement).background,
  });

  // The animated gradient behind the page, frozen where it is right now.
  const ambient = getComputedStyle(document.body, "::before");
  const backdrop = document.createElement("div");

  Object.assign(backdrop.style, {
    position: "absolute",
    inset: "-25%",
    backgroundImage: ambient.backgroundImage,
    backgroundSize: ambient.backgroundSize,
    backgroundPosition: ambient.backgroundPosition,
  });
  scene.appendChild(backdrop);

  for (const section of document.querySelectorAll<HTMLElement>("main > *")) {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > height) continue;

    const copy = section.cloneNode(true) as HTMLElement;

    Object.assign(copy.style, {
      position: "absolute",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
    });

    // Copies must not clash with the real page's ids or start media loads.
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    copy.querySelectorAll("video").forEach((video) => video.remove());

    copyCanvasPixels(section, copy);
    scene.appendChild(copy);
  }

  return scene;
}

/** Cloning a canvas copies the element but not its drawing. */
function copyCanvasPixels(source: ParentNode, copy: ParentNode) {
  const sources = source.querySelectorAll("canvas");
  const copies = copy.querySelectorAll("canvas");

  sources.forEach((canvas, index) => {
    const target = copies[index];
    if (!target || !canvas.width || !canvas.height) return;

    target.width = canvas.width;
    target.height = canvas.height;
    target.getContext("2d")?.drawImage(canvas, 0, 0);
  });
}

function createOverlay(
  theme: string,
  width: number,
  height: number,
  shards: Shard[],
) {
  const overlay = document.createElement("div");

  overlay.setAttribute("data-theme", theme);
  overlay.setAttribute("aria-hidden", "true");
  overlay.inert = true;

  Object.assign(overlay.style, {
    position: "fixed",
    inset: "0",
    // Above the page, below the navbar (z-40).
    zIndex: "30",
    overflow: "hidden",
    pointerEvents: "none",
    contain: "strict",
  });

  const scene = cloneScene(width, height);

  shards.forEach((shard, index) => {
    const piece = document.createElement("div");
    const content =
      index === 0 ? scene : (scene.cloneNode(true) as HTMLElement);

    if (index > 0) copyCanvasPixels(scene, content);

    Object.assign(piece.style, {
      position: "absolute",
      left: `${shard.x}px`,
      top: `${shard.y}px`,
      width: `${shard.w}px`,
      height: `${shard.h}px`,
      overflow: "hidden",
      clipPath: `polygon(${shard.points
        .map(([px, py]) => `${px - shard.x}px ${py - shard.y}px`)
        .join(",")})`,
      transformOrigin: `${shard.cx - shard.x}px ${shard.cy - shard.y}px`,
      willChange: "transform",
    });

    content.style.left = `${-shard.x}px`;
    content.style.top = `${-shard.y}px`;

    piece.appendChild(content);
    overlay.appendChild(piece);
  });

  overlay.appendChild(createCracks(width, height, shards));
  return overlay;
}

/** Thin bright lines along every shard edge, shown just before they fall. */
function createCracks(width: number, height: number, shards: Shard[]) {
  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");

  svg.setAttribute("width", `${width}`);
  svg.setAttribute("height", `${height}`);
  svg.style.position = "absolute";
  svg.style.inset = "0";
  svg.style.opacity = "0";

  const path = document.createElementNS(svgNs, "path");

  path.setAttribute(
    "d",
    shards
      .map(({ points }) => `M${points.map((point) => point.join(",")).join("L")}Z`)
      .join(""),
  );
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "rgba(255, 255, 255, 0.7)");
  path.setAttribute("stroke-width", "1.5");

  svg.appendChild(path);
  return svg;
}

/**
 * Cracks radiate from the impact point: spokes crossed by rings, each cell
 * split into two triangles, so shards are small near the toggle and larger
 * further away.
 */
function buildShards(width: number, height: number, origin: Vec): Shard[] {
  const [ox, oy] = origin;
  const reach = Math.hypot(
    Math.max(ox, width - ox),
    Math.max(oy, height - oy),
  );

  const angles = Array.from(
    { length: SPOKES },
    (_, i) => ((i + 0.3 + Math.random() * 0.4) / SPOKES) * Math.PI * 2,
  );

  const grid: Vec[][] = Array.from({ length: RINGS }, (_, ring) => {
    // The outer ring reaches past the farthest corner.
    const base =
      reach *
      Math.pow((ring + 1) / RINGS, 1.5) *
      (ring === RINGS - 1 ? 1.25 : 1);

    return angles.map((angle) => {
      const r =
        ring === RINGS - 1 ? base : base * (1 + (Math.random() - 0.5) * 0.3);
      return [ox + Math.cos(angle) * r, oy + Math.sin(angle) * r];
    });
  });

  const triangles: Vec[][] = [];

  for (let spoke = 0; spoke < SPOKES; spoke++) {
    const next = (spoke + 1) % SPOKES;

    triangles.push([origin, grid[0][spoke], grid[0][next]]);

    for (let ring = 0; ring < RINGS - 1; ring++) {
      const a = grid[ring][spoke];
      const b = grid[ring][next];
      const c = grid[ring + 1][next];
      const d = grid[ring + 1][spoke];

      if (Math.random() < 0.5) {
        triangles.push([a, b, c], [a, c, d]);
      } else {
        triangles.push([a, b, d], [b, c, d]);
      }
    }
  }

  return triangles.flatMap((points) => {
    const xs = points.map(([px]) => px);
    const ys = points.map(([, py]) => py);
    const x = Math.floor(Math.max(0, Math.min(...xs)));
    const y = Math.floor(Math.max(0, Math.min(...ys)));
    const w = Math.ceil(Math.min(width, Math.max(...xs))) - x;
    const h = Math.ceil(Math.min(height, Math.max(...ys))) - y;

    // Skip shards that are entirely off screen.
    if (w <= 0 || h <= 0) return [];

    const cx = xs.reduce((sum, value) => sum + value, 0) / 3;
    const cy = ys.reduce((sum, value) => sum + value, 0) / 3;
    const distance = Math.hypot(cx - ox, cy - oy) || 1;
    const push = 120 + Math.random() * 220;

    return [
      {
        points,
        cx,
        cy,
        x,
        y,
        w,
        h,
        delay: CRACK_MS + (distance / reach) * SPREAD_MS,
        vx: ((cx - ox) / distance) * push,
        // A small upward pop before gravity takes over.
        vy: ((cy - oy) / distance) * push - 150,
        spin: (Math.random() - 0.5) * 6,
      },
    ];
  });
}

async function animateShards(overlay: HTMLElement, shards: Shard[]) {
  const pieces = Array.from(overlay.children).slice(0, shards.length);
  const cracks = overlay.lastElementChild;
  const steps = 12;

  cracks?.animate(
    [{ opacity: 0 }, { opacity: 1, offset: 0.6 }, { opacity: 0 }],
    { duration: CRACK_MS + 200, fill: "forwards" },
  );

  // Gravity as a curve sampled into keyframes, so the browser can run it
  // off the main thread.
  const animations = pieces.map((piece, index) => {
    const shard = shards[index];
    const keyframes = Array.from({ length: steps + 1 }, (_, step) => {
      const seconds = ((step / steps) * FALL_MS) / 1000;
      const dx = shard.vx * seconds;
      const dy = shard.vy * seconds + 0.5 * GRAVITY * seconds * seconds;
      const angle = shard.spin * seconds;

      return { transform: `translate(${dx}px, ${dy}px) rotate(${angle}rad)` };
    });

    return piece.animate(keyframes, {
      duration: FALL_MS,
      delay: shard.delay,
      fill: "forwards",
    });
  });

  // Animations don't run in a hidden tab; never leave the overlay stuck.
  const longestDelay = Math.max(0, ...shards.map((shard) => shard.delay));

  await Promise.race([
    Promise.all(animations.map((animation) => animation.finished)),
    new Promise((resolve) =>
      window.setTimeout(resolve, longestDelay + FALL_MS + 500),
    ),
  ]);
}
