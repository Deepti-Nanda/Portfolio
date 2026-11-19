"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PointerEvent } from "react";
import { useResume } from "@/components/resume-context";
import { SKILL_LOGOS, type SkillLogo } from "@/components/skill-logos";
import {
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

// Where a skill was used. Internal links jump to a project card or section;
// entries without a link are shown as plain text.
const PLACES = {
  "opensource-radar": {
    label: "OpenSource-Radar",
    href: "#project-opensource-radar",
  },
  raksha: { label: "Raksha", href: "#project-raksha" },
  "pinch-of-memories": {
    label: "A Pinch of Memories",
    href: "#project-a-pinch-of-memories",
  },
  internships: { label: "Data & ML internships", href: "#experience" },
  leetcode: {
    label: "238 LeetCode problems",
    href: "https://leetcode.com/u/Deepti_Nanda/",
  },
  coursework: { label: "DBMS coursework" },
} satisfies Record<string, { label: string; href?: string }>;

type PlaceId = keyof typeof PLACES;

/** Projects that can be shown as a constellation of the skills they used. */
const CONSTELLATIONS = [
  {
    id: "opensource-radar",
    label: "OpenSource-Radar",
    summary:
      "GitHub issue discovery platform with GitHub sign-in, saved issues synced across devices, and CI on every pull request.",
  },
  {
    id: "raksha",
    label: "Raksha",
    summary:
      "Offline AI health guardian for Android that warns about heat, flood and smog risks, with an emergency SOS.",
  },
  {
    id: "internships",
    label: "Internships",
    summary:
      "Data Analyst (Edunet Foundation – VOIS) and Machine Learning (YHills) virtual internships.",
  },
] as const satisfies readonly { id: PlaceId; label: string; summary: string }[];

type ConstellationId = (typeof CONSTELLATIONS)[number]["id"];

interface Skill {
  name: string;
  category: string;
  description: string;
  color: string;
  /** 0 = inner ring (languages), 1 = outer ring (frameworks & tools). */
  ring: 0 | 1;
  usedIn: PlaceId[];
}

const RING_LABELS = ["LANGUAGES", "FRAMEWORKS & TOOLS"] as const;

const SKILLS: Skill[] = [
  // Inner ring: languages.
  {
    name: "Java",
    category: "Language",
    description:
      "My main language for data structures and algorithms: 238 LeetCode problems solved in Java.",
    color: "#F89820",
    ring: 0,
    usedIn: ["leetcode"],
  },
  {
    name: "JavaScript",
    category: "Language",
    description:
      "My everyday web language (ES6+), from OpenSource-Radar's search and filters to a LocalStorage-powered recipe site.",
    color: "#F7DF1E",
    ring: 0,
    usedIn: ["opensource-radar", "pinch-of-memories"],
  },
  {
    name: "TypeScript",
    category: "Language",
    description:
      "Typed, predictable code. Raksha is written in TypeScript and checked by 1,450+ automated tests.",
    color: "#3178C6",
    ring: 0,
    usedIn: ["raksha"],
  },
  {
    name: "Python",
    category: "Language",
    description:
      "Cleaning, exploring and modelling data across HR, agriculture and business datasets in two internships.",
    color: "#FFD43B",
    ring: 0,
    usedIn: ["internships"],
  },
  {
    name: "SQL",
    category: "Database",
    description:
      "Querying and designing relational databases, grounded in DBMS coursework.",
    color: "#E58C39",
    ring: 0,
    usedIn: ["coursework"],
  },
  {
    name: "HTML & CSS",
    category: "Frontend",
    description:
      "Responsive, accessible layouts and styling, including light and dark themes.",
    color: "#E98B52",
    ring: 0,
    usedIn: ["opensource-radar", "pinch-of-memories"],
  },
  // Outer ring: frameworks & tools.
  {
    name: "React",
    category: "Frontend",
    description:
      "Component-based interfaces. OpenSource-Radar is a React + Vite app with 9 search filters, live suggestions and shareable searches.",
    color: "#61DAFB",
    ring: 1,
    usedIn: ["opensource-radar"],
  },
  {
    name: "React Native",
    category: "Mobile",
    description:
      "Built Raksha with React Native and Expo: an Android app combining wearable vitals with live weather and air quality.",
    color: "#C4B5FD",
    ring: 1,
    usedIn: ["raksha"],
  },
  {
    name: "Node.js",
    category: "Backend",
    description:
      "Server-side JavaScript, including the serverless functions behind OpenSource-Radar's GitHub sign-in.",
    color: "#83CD29",
    ring: 1,
    usedIn: ["opensource-radar"],
  },
  {
    name: "Redis",
    category: "Database",
    description:
      "Upstash Redis keeps OpenSource-Radar users' saved issues in sync across their devices.",
    color: "#FF4438",
    ring: 1,
    usedIn: ["opensource-radar"],
  },
  {
    name: "REST APIs",
    category: "Backend",
    description:
      "Integrating APIs: the GitHub API for OpenSource-Radar, and live weather and air-quality data for Raksha.",
    color: "#A78BFA",
    ring: 1,
    usedIn: ["opensource-radar", "raksha"],
  },
  {
    name: "Git & GitHub",
    category: "Tools",
    description:
      "Version control and collaboration, with GitHub Actions running tests on every pull request.",
    color: "#F08C55",
    ring: 1,
    usedIn: ["opensource-radar"],
  },
  {
    name: "Pandas / ML",
    category: "Data & ML",
    description:
      "Pandas, NumPy, Matplotlib and Scikit-learn for analysing datasets, charting trends and building supervised learning models.",
    color: "#F472B6",
    ring: 1,
    usedIn: ["internships"],
  },
];

interface OrbitAsteroid {
  angle: number;
  ring: number;
  radius: number;
  speed: number;
  /** Offset so the logos float up and down out of step with each other. */
  bobPhase: number;
}

interface OrbitLogo {
  kind: SkillLogo["kind"];
  paths: Path2D[];
}

interface AsteroidPosition {
  x: number;
  y: number;
  radius: number;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  active: boolean;
}

interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface GameAssets {
  target: {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    radius: number;
    phase: number;
    /** Animation timestamp of the last hit, used for the wobble/flash reaction. */
    hitAt: number;
  };
  projectiles: Projectile[];
  particles: GameParticle[];
  chest: {
    x: number;
    y: number;
    state: "falling" | "landed" | "open";
  } | null;
  drag: {
    x: number;
    y: number;
    active: boolean;
  };
}

interface GameState {
  isOpen: boolean;
  isPaused: boolean;
  shots: number;
  hits: number;
  result: "won" | "lost" | null;
}

const INITIAL_GAME: GameState = {
  isOpen: false,
  isPaused: false,
  shots: 3,
  hits: 0,
  result: null,
};

const TARGET_IMAGE_SRC = "/game/deepti-target.jpg";
const PORTRAIT_IMAGE_SRC = "/game/deepti-portrait.jpg";

// Orbit layout, as fractions of the orbit box's size. The rings sit far
// enough out that the logos and their labels clear the centre portrait.
const PORTRAIT_SIZE_RATIO = 0.165;
const INNER_ORBIT_RATIO = 0.285;
const OUTER_ORBIT_RATIO = 0.405;
const HIT_REACTION_MS = 450;

// Slingshot game tuning.
const SLING_X_RATIO = 0.16;
const SLING_Y_RATIO = 0.65;
const TARGET_X_RATIO = 0.78;
const TARGET_Y_RATIO = 0.43;
const GRAVITY = 0.32;
const MAX_DRAG = 85;
const MIN_DRAG = 10;
const MAX_POWER = 17;
const GRAB_RADIUS = 70;
const HIT_PADDING = 3;
const HITS_TO_WIN = 2;

type Point = { x: number; y: number };

function getSlingPosition(width: number, height: number): Point {
  return { x: Math.max(45, width * SLING_X_RATIO), y: height * SLING_Y_RATIO };
}

/** Big enough for her face to read clearly, while staying a fair target. */
function getTargetRadius(width: number, height: number) {
  return Math.max(26, Math.min(42, Math.min(width, height) * 0.105));
}

/** The cartoon portrait in the middle of the orbit. */
function getCharacterRadius(size: number) {
  return Math.max(36, size * PORTRAIT_SIZE_RATIO);
}

/** The skill logo badges on the orbit rings. */
function getLogoRadius(size: number) {
  return Math.max(12, Math.min(26, size * 0.04));
}

/** Indexes into SKILLS of the skills each constellation connects. */
const CONSTELLATION_MEMBERS = Object.fromEntries(
  CONSTELLATIONS.map((constellation) => [
    constellation.id,
    SKILLS.flatMap((skill, index) =>
      skill.usedIn.includes(constellation.id) ? [index] : [],
    ),
  ]),
) as Record<ConstellationId, number[]>;

function clampDrag(sling: Point, x: number, y: number): Point {
  const dx = x - sling.x;
  const dy = y - sling.y;
  const distance = Math.hypot(dx, dy);
  const scale = distance > MAX_DRAG ? MAX_DRAG / distance : 1;

  return { x: sling.x + dx * scale, y: sling.y + dy * scale };
}

function getLaunchVelocity(sling: Point, drag: Point) {
  const dx = sling.x - drag.x;
  const dy = sling.y - drag.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= MIN_DRAG) return null;

  const power = Math.min(distance / MAX_DRAG, 1) * MAX_POWER;

  return { vx: (dx / distance) * power, vy: (dy / distance) * power };
}

function createGameAssets(width: number, height: number): GameAssets {
  const sling = getSlingPosition(width, height);

  return {
    target: {
      x: width * TARGET_X_RATIO,
      y: height * TARGET_Y_RATIO,
      baseX: width * TARGET_X_RATIO,
      baseY: height * TARGET_Y_RATIO,
      radius: getTargetRadius(width, height),
      phase: 0,
      hitAt: -Infinity,
    },
    projectiles: [],
    particles: [],
    chest: null,
    drag: { x: sling.x, y: sling.y, active: false },
  };
}

export function Skills() {
  const { openResume } = useResume();
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbitDataRef = useRef<OrbitAsteroid[]>([]);
  const asteroidPositionsRef = useRef<AsteroidPosition[]>([]);
  const selectedSkillRef = useRef<number | null>(null);
  const activeConstellationRef = useRef<ConstellationId | null>(null);

  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameAssetsRef = useRef<GameAssets | null>(null);
  const gameStateRef = useRef<GameState>(INITIAL_GAME);
  // Her cartoon: a face close-up for the slingshot target, and the full
  // picture for the orbit's centre.
  const targetImageRef = useRef<HTMLImageElement | null>(null);
  const portraitImageRef = useRef<HTMLImageElement | null>(null);
  const chestTimeoutRef = useRef<number | null>(null);

  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [activeConstellation, setActiveConstellation] =
    useState<ConstellationId | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME);

  const updateGame = useCallback((next: GameState) => {
    gameStateRef.current = next;
    setGameState(next);
  }, []);

  const clearChestTimeout = useCallback(() => {
    if (chestTimeoutRef.current !== null) {
      window.clearTimeout(chestTimeoutRef.current);
      chestTimeoutRef.current = null;
    }
  }, []);

  const openGame = () => {
    clearChestTimeout();
    // The game loop creates fresh assets once the canvas has a size.
    gameAssetsRef.current = null;
    updateGame({ ...INITIAL_GAME, isOpen: true });
  };

  const closeGame = useCallback(() => {
    clearChestTimeout();
    gameAssetsRef.current = null;
    updateGame(INITIAL_GAME);
  }, [clearChestTimeout, updateGame]);

  const resetGame = () => {
    clearChestTimeout();

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (rect) {
      gameAssetsRef.current = createGameAssets(rect.width, rect.height);
    }

    updateGame({ ...INITIAL_GAME, isOpen: true });
  };

  // Let the orbit loop read the selection without restarting the animation.
  useEffect(() => {
    selectedSkillRef.current = selectedSkill;
  }, [selectedSkill]);

  useEffect(() => {
    activeConstellationRef.current = activeConstellation;
  }, [activeConstellation]);

  // Preload both cartoon images so they are ready before they're drawn.
  useEffect(() => {
    const load = (src: string) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
      return image;
    };

    targetImageRef.current = load(TARGET_IMAGE_SRC);
    portraitImageRef.current = load(PORTRAIT_IMAGE_SRC);
  }, []);

  // Cancel a pending "open resume" timer if the section unmounts.
  useEffect(() => clearChestTimeout, [clearChestTimeout]);

  // Spread each ring's skills evenly around it.
  useEffect(() => {
    const ringCounts = [0, 1].map(
      (ring) => SKILLS.filter((skill) => skill.ring === ring).length,
    );
    const placed = [0, 0];

    orbitDataRef.current = SKILLS.map((skill, index) => {
      const slot = placed[skill.ring]++;
      const step = (Math.PI * 2) / ringCounts[skill.ring];

      return {
        // Offset the outer ring by half a step so logos don't line up.
        angle: slot * step + (skill.ring === 1 ? step / 2 : 0),
        ring: skill.ring,
        radius: 1,
        speed: skill.ring === 0 ? 0.00016 : -0.00012,
        bobPhase: index * 1.7,
      };
    });
  }, []);

  // Orbit animation. Starts once, and skips drawing while the orbit is
  // scrolled off-screen or covered by the game.
  useEffect(() => {
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let isOnScreen = true;
    let lastTime = 0;
    let frameId: number | null = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
    });
    visibilityObserver.observe(canvas);

    // Parse each skill's SVG logo once, not every frame.
    const logos: (OrbitLogo | null)[] = SKILLS.map((skill) => {
      const logo = SKILL_LOGOS[skill.name];
      return logo
        ? { kind: logo.kind, paths: logo.paths.map((d) => new Path2D(d)) }
        : null;
    });

    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);

      if (!isOnScreen || !width || !height || gameStateRef.current.isOpen) {
        // Reset the clock so asteroids don't jump when drawing resumes.
        lastTime = 0;
        return;
      }

      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      const innerOrbit = size * INNER_ORBIT_RATIO;
      const outerOrbit = size * OUTER_ORBIT_RATIO;
      const characterRadius = getCharacterRadius(size);
      const logoRadius = getLogoRadius(size);
      const selectedIndex = selectedSkillRef.current;
      const activeId = activeConstellationRef.current;
      const members = activeId ? CONSTELLATION_MEMBERS[activeId] : null;

      ctx.clearRect(0, 0, width, height);
      drawNightBackground(ctx, width, height, time);

      // Orbit paths, each labelled with what it holds.
      const ringRadii = [innerOrbit, outerOrbit];

      ctx.strokeStyle = "rgba(147, 197, 253, 0.13)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 7]);
      ringRadii.forEach((radius) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Ring labels sit in gaps the logos never cross: just inside the bottom
      // of the inner ring, and just outside the top of the outer ring (the
      // logos' own name labels hang below them, toward those other sides).
      const ringFont = Math.max(8, Math.min(11, size * 0.017));
      const labelGap = logoRadius + Math.max(8, size * 0.016);
      drawRingLabel(
        ctx,
        centerX,
        centerY,
        innerOrbit - labelGap,
        RING_LABELS[0],
        ringFont,
        "bottom",
      );
      drawRingLabel(
        ctx,
        centerX,
        centerY,
        outerOrbit + labelGap,
        RING_LABELS[1],
        ringFont,
        "top",
      );

      // Move every logo first, so constellation lines can be drawn beneath them.
      const positions = asteroidPositionsRef.current;

      orbitDataRef.current.forEach((asteroid, index) => {
        asteroid.angle += asteroid.speed * dt;
        asteroid.radius = logoRadius;

        const orbitRadius = asteroid.ring === 0 ? innerOrbit : outerOrbit;
        const bob =
          Math.sin(time * 0.0015 + asteroid.bobPhase) * logoRadius * 0.12;

        positions[index] = {
          x: centerX + Math.cos(asteroid.angle) * orbitRadius,
          y: centerY + Math.sin(asteroid.angle) * orbitRadius + bob,
          radius: logoRadius,
        };
      });

      if (members) {
        drawConstellation(ctx, centerX, centerY, members, positions, time);
      }

      const labelFont = `${Math.max(9, Math.min(13, size * 0.022))}px system-ui`;

      SKILLS.forEach((skill, index) => {
        const position = positions[index];
        if (!position) return;

        const { x, y } = position;
        const isMember = members ? members.includes(index) : false;
        const isDimmed = members !== null && !isMember;

        drawSkillLogo(
          ctx,
          x,
          y,
          logoRadius,
          logos[index],
          skill.color,
          selectedIndex === index,
          isMember,
          isDimmed,
        );

        // Skill label.
        ctx.save();
        ctx.globalAlpha = isDimmed ? 0.3 : 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = labelFont;
        ctx.fillStyle = "#E2E8F0";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 5;
        ctx.fillText(
          skill.name,
          x,
          y + logoRadius + Math.max(10, size * 0.026),
          size * 0.2,
        );
        ctx.restore();
      });

      drawCenterPortrait(
        ctx,
        centerX,
        centerY,
        characterRadius,
        time,
        portraitImageRef.current,
      );
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  // Handle orbit clicks: asteroids show details; only the center character opens the game.
  const handleOrbitClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const characterRadius = getCharacterRadius(
      Math.min(rect.width, rect.height),
    );

    const centerDistance = Math.hypot(x - centerX, y - centerY);

    if (centerDistance < characterRadius + 8) {
      openGame();
      return;
    }

    const positions = asteroidPositionsRef.current;

    for (let index = 0; index < positions.length; index++) {
      const asteroid = positions[index];
      if (!asteroid) continue;

      const distance = Math.hypot(x - asteroid.x, y - asteroid.y);

      if (distance < asteroid.radius + 13) {
        setSelectedSkill(index);
        return;
      }
    }
  };

  // Close the game with Escape and stop the page scrolling behind it.
  useEffect(() => {
    if (!gameState.isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeGame();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState.isOpen, closeGame]);

  // Game animation.
  useEffect(() => {
    if (!gameState.isOpen) return;

    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let lastTime = 0;
    let frameId: number | null = null;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const animate = (time: number) => {
      frameId = requestAnimationFrame(animate);

      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      if (!width || !height) return;

      if (!gameAssetsRef.current) {
        gameAssetsRef.current = createGameAssets(width, height);
      }

      const assets = gameAssetsRef.current;
      const state = gameStateRef.current;
      const step = dt / 16;
      const sling = getSlingPosition(width, height);
      const target = assets.target;

      // Follow the canvas size, so a resize or phone rotation never strands
      // the target off-screen.
      target.radius = getTargetRadius(width, height);
      target.baseX = width * TARGET_X_RATIO;
      target.baseY = height * TARGET_Y_RATIO;

      if (!state.isPaused && !state.result) {
        target.phase += dt * 0.0028;
        target.x = target.baseX + Math.cos(target.phase) * 26;
        target.y = target.baseY + Math.sin(target.phase) * 34;

        for (const projectile of assets.projectiles) {
          projectile.vy += GRAVITY * step;
          projectile.x += projectile.vx * step;
          projectile.y += projectile.vy * step;

          const distance = Math.hypot(
            projectile.x - target.x,
            projectile.y - target.y,
          );

          if (distance < target.radius + HIT_PADDING) {
            projectile.active = false;
            target.hitAt = time;

            const latest = gameStateRef.current;
            const hits = latest.hits + 1;
            const won = hits >= HITS_TO_WIN;

            updateGame({
              ...latest,
              hits,
              result: won ? "won" : null,
            });

            if (won) {
              assets.chest = {
                x: target.x,
                y: target.y - 30,
                state: "falling",
              };
            }

            createGameParticles(assets, projectile.x, projectile.y);
          } else if (
            projectile.x > width + 40 ||
            projectile.y > height + 40 ||
            projectile.x < -40
          ) {
            projectile.active = false;
          }
        }

        // Drop finished shots instead of keeping them around forever.
        assets.projectiles = assets.projectiles.filter((p) => p.active);
      }

      if (!state.isPaused && assets.chest) {
        const groundY = height - 65;
        assets.chest.x = Math.min(assets.chest.x, width - 40);

        if (assets.chest.state === "falling") {
          assets.chest.y += 6 * step;

          if (assets.chest.y >= groundY) {
            assets.chest.y = groundY;
            assets.chest.state = "landed";
            createGameParticles(assets, assets.chest.x, assets.chest.y);
          }
        } else {
          assets.chest.y = groundY;
        }
      }

      // Update particles in place to avoid allocating new objects every frame.
      if (!state.isPaused && assets.particles.length) {
        let alive = 0;

        for (const particle of assets.particles) {
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
          particle.life -= step;

          if (particle.life > 0) {
            assets.particles[alive++] = particle;
          }
        }

        assets.particles.length = alive;
      }

      ctx.clearRect(0, 0, width, height);
      drawNightBackground(ctx, width, height, time);

      drawSlingshot(ctx, sling.x, sling.y, assets.drag);

      if (assets.drag.active) {
        drawAimPreview(ctx, sling, assets.drag);
      }

      drawGameTarget(
        ctx,
        target.x,
        target.y,
        target.radius,
        time,
        targetImageRef.current,
        target.hitAt,
      );

      for (const projectile of assets.projectiles) {
        drawGameAsteroid(ctx, projectile.x, projectile.y, 10);
      }

      if (assets.chest) {
        drawGameChest(
          ctx,
          assets.chest.x,
          assets.chest.y,
          assets.chest.state,
          time,
        );
      }

      if (assets.particles.length) {
        ctx.fillStyle = "#FBBF24";

        for (const particle of assets.particles) {
          ctx.globalAlpha = Math.max(0, particle.life / 35);
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      drawGameScore(ctx, width, gameStateRef.current);

      const latest = gameStateRef.current;

      if (
        latest.shots === 0 &&
        assets.projectiles.length === 0 &&
        latest.hits < HITS_TO_WIN &&
        !latest.result
      ) {
        updateGame({
          ...latest,
          result: "lost",
        });
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [gameState.isOpen, updateGame]);

  const getGamePoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      sling: getSlingPosition(rect.width, rect.height),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    const state = gameStateRef.current;

    if (
      !assets ||
      state.isPaused ||
      state.result ||
      state.shots === 0 ||
      assets.projectiles.length > 0
    ) {
      return;
    }

    const point = getGamePoint(event);
    if (!point) return;

    if (
      Math.hypot(point.x - point.sling.x, point.y - point.sling.y) <
      GRAB_RADIUS
    ) {
      event.currentTarget.setPointerCapture(event.pointerId);

      assets.drag = {
        ...clampDrag(point.sling, point.x, point.y),
        active: true,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    if (!assets?.drag.active) return;

    const point = getGamePoint(event);
    if (!point) return;

    const clamped = clampDrag(point.sling, point.x, point.y);
    assets.drag.x = clamped.x;
    assets.drag.y = clamped.y;
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    if (!assets?.drag.active) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const point = getGamePoint(event);
    if (!point) return;

    const velocity = getLaunchVelocity(point.sling, assets.drag);

    if (velocity) {
      assets.projectiles.push({
        x: point.sling.x,
        y: point.sling.y,
        vx: velocity.vx,
        vy: velocity.vy,
        active: true,
      });

      updateGame({
        ...gameStateRef.current,
        shots: gameStateRef.current.shots - 1,
      });
    }

    assets.drag.active = false;
    assets.drag.x = point.sling.x;
    assets.drag.y = point.sling.y;
  };

  const handleChestClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    if (!assets?.chest || assets.chest.state !== "landed") return;

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (Math.hypot(x - assets.chest.x, y - assets.chest.y) < 45) {
      assets.chest.state = "open";

      clearChestTimeout();
      chestTimeoutRef.current = window.setTimeout(() => {
        chestTimeoutRef.current = null;
        closeGame();
        openResume();
      }, 650);
    }
  };

  const selected = selectedSkill === null ? null : SKILLS[selectedSkill];
  const constellation =
    CONSTELLATIONS.find((item) => item.id === activeConstellation) ?? null;

  const toggleConstellation = (id: ConstellationId) => {
    setActiveConstellation((current) => (current === id ? null : id));
    setSelectedSkill(null);
  };

  return (
    <section
      id="skills"
      className="reveal relative overflow-hidden bg-[var(--background)] py-16 text-[var(--foreground)] sm:py-20 lg:py-24"
      aria-labelledby="skills-heading"
    >
      <div className="container relative z-10">
        <div className="mb-10 text-center sm:mb-14">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            What I Work With
          </span>

          <h2 id="skills-heading" className="section-title mb-4">
            Skills & Technologies
          </h2>

          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            The technologies and tools I use to build, explore, and solve
            real-world problems.
          </p>
        </div>

        {/* Text version of the orbit, for screen readers and search engines. */}
        <ul className="sr-only">
          {SKILLS.map((skill) => (
            <li key={skill.name}>
              {skill.name} ({skill.category}): {skill.description} Used in:{" "}
              {skill.usedIn.map((id) => PLACES[id].label).join(", ")}.
            </li>
          ))}
        </ul>

        <div className="grid min-w-0 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          {/* Orbit */}
          <div className="min-w-0 overflow-hidden rounded-3xl border border-slate-700/70 bg-[#050510] p-3 shadow-xl shadow-black/10 sm:p-5">
            <div
              className="mb-3 flex flex-wrap items-center justify-center gap-2"
              role="group"
              aria-label="Show the skills a project used"
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">
                Constellations
              </span>

              {CONSTELLATIONS.map((item) => {
                const isActive = activeConstellation === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleConstellation(item.id)}
                    aria-pressed={isActive}
                    className={`min-h-9 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isActive
                        ? "border-sky-300/70 bg-sky-400/15 text-sky-100 shadow-[0_0_16px_rgba(56,189,248,0.35)]"
                        : "border-slate-700 bg-slate-950/70 text-slate-300 hover:border-sky-400/50 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[760px] overflow-hidden rounded-2xl">
              <canvas
                ref={orbitCanvasRef}
                className="block h-full w-full cursor-pointer"
                onClick={handleOrbitClick}
                aria-label={`Interactive orbit of ${SKILLS.length} skill logos: languages on the inner ring, frameworks and tools on the outer ring. Select a logo to see where it was used, or select the portrait in the centre to open the game.`}
              />

              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-300/10" />
            </div>
          </div>

          {/* Details */}
          <aside
            className="min-w-0 rounded-3xl border border-slate-700/70 bg-[#050510] p-5 shadow-xl shadow-black/10"
            aria-live="polite"
          >
            {selected ? (
              <div>
                {constellation && (
                  <button
                    type="button"
                    onClick={() => setSelectedSkill(null)}
                    className="mb-3 text-xs font-medium text-sky-300 transition hover:text-white"
                  >
                    ← {constellation.label}
                  </button>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: selected.color }}
                  />
                  <h3 className="text-lg font-semibold text-white">
                    {selected.name}
                  </h3>
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-blue-300">
                    {selected.category}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {selected.description}
                </p>

                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Used in
                </h4>

                <ul className="mt-2 flex flex-wrap gap-2">
                  {selected.usedIn.map((id) => {
                    const place: { label: string; href?: string } = PLACES[id];
                    const isExternal = place.href?.startsWith("http");

                    return (
                      <li key={id}>
                        {place.href ? (
                          <a
                            href={place.href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-sky-200 transition hover:border-sky-400/60 hover:text-white"
                          >
                            {place.label}
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="inline-flex min-h-9 items-center rounded-full border border-slate-800 px-3 py-1.5 text-xs text-slate-300">
                            {place.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : constellation ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sky-300">
                  Constellation
                </p>
                <h3 className="mt-1 text-lg font-semibold text-white">
                  {constellation.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {constellation.summary}
                </p>

                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Skills used
                </h4>

                <ul className="mt-2 flex flex-wrap gap-2">
                  {CONSTELLATION_MEMBERS[constellation.id].map((index) => (
                    <li key={SKILLS[index].name}>
                      <button
                        type="button"
                        onClick={() => setSelectedSkill(index)}
                        className="inline-flex min-h-9 items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-400/60 hover:text-white"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: SKILLS[index].color }}
                        />
                        {SKILLS[index].name}
                      </button>
                    </li>
                  ))}
                </ul>

                <a
                  href={PLACES[constellation.id].href}
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-sky-300 transition hover:text-white"
                >
                  {constellation.id === "internships"
                    ? "See my experience"
                    : `See the ${constellation.label} project`}
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Explore my skills
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Click any logo to see where I&apos;ve used it. Pick a
                  constellation to light up the skills behind a project, or
                  click my portrait to play a quick game.
                </p>
              </div>
            )}

            <dl className="mt-6 space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
              <div className="flex items-center justify-between gap-3">
                <dt>Inner ring</dt>
                <dd className="text-slate-300">Languages</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>Outer ring</dt>
                <dd className="text-slate-300">Frameworks & tools</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt>In orbit</dt>
                <dd className="text-slate-300">
                  {SKILLS.length} technologies
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>

      {/* Slingshot game. Rendered on <body> so the section's reveal
          transform can't trap it underneath the fixed navbar. */}
      {gameState.isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm sm:p-4"
            onClick={closeGame}
          >
            <div
              className="flex max-h-[92dvh] min-h-[360px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#050510] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="slingshot-title"
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-3 py-3 sm:px-5">
                <div>
                  <h3
                    id="slingshot-title"
                    className="text-sm font-bold text-white sm:text-base"
                  >
                    Asteroid Slingshot
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-400 sm:text-xs">
                    Hit the moving target twice to unlock the chest.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() =>
                      updateGame({
                        ...gameStateRef.current,
                        isPaused: !gameStateRef.current.isPaused,
                      })
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    aria-label={gameState.isPaused ? "Resume game" : "Pause game"}
                  >
                    {gameState.isPaused ? (
                      <Play className="h-4 w-4" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                  </button>

                  <button
                    onClick={resetGame}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Restart game"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>

                  <button
                    onClick={closeGame}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    aria-label="Close game"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative min-h-0 flex-1 touch-none">
                <canvas
                  ref={gameCanvasRef}
                  className="block h-full min-h-[280px] w-full cursor-crosshair"
                  aria-label="Slingshot game. Drag back from the slingshot and release to hit the moving cartoon target."
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onClick={handleChestClick}
                />

                {gameState.isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-xl font-bold tracking-widest text-white">
                      PAUSED
                    </span>
                  </div>
                )}

                {gameState.result === "won" && (
                  <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-xl border border-emerald-400/30 bg-slate-950/90 p-3 text-center shadow-xl sm:p-4">
                    <CheckCircle className="mx-auto h-6 w-6 text-emerald-400" />
                    <h4 className="mt-1 font-bold text-white">Target Hit! 2/2</h4>
                    <p className="mt-1 text-xs text-slate-300">
                      The chest is on the ground. Tap it to reveal your resume.
                    </p>
                  </div>
                )}

                {gameState.result === "lost" && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 p-4 text-center">
                    <AlertCircle className="h-12 w-12 text-rose-400" />
                    <h4 className="mt-3 text-xl font-bold text-white">
                      Try Again!
                    </h4>
                    <p className="mt-2 text-sm text-slate-300">
                      You scored {gameState.hits}/2 hits.
                    </p>
                    <button
                      onClick={resetGame}
                      className="mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Play Again
                    </button>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-slate-800 bg-slate-950 px-3 py-2 text-center text-[10px] text-slate-400 sm:text-xs">
                Drag the asteroid backwards from the slingshot and release to
                launch it. Press Esc to close.
              </div>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

// --------------------------------------------------
// Orbit drawing helpers
// --------------------------------------------------

function drawNightBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#080D20");
  gradient.addColorStop(0.55, "#10172D");
  gradient.addColorStop(1, "#050510");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 65; i++) {
    const x = (i * 137.5) % width;
    const y = (i * 83.7) % height;
    const twinkle = 0.35 + Math.sin(time * 0.001 + i) * 0.25;

    ctx.fillStyle = `rgba(219, 234, 254, ${twinkle})`;
    ctx.beginPath();
    ctx.arc(x, y, i % 5 === 0 ? 1.4 : 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Faint text curved along a circle, e.g. "LANGUAGES". Centred on the top or
 * bottom of the circle, and always upright, reading left to right.
 */
function drawRingLabel(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  text: string,
  fontSize: number,
  side: "top" | "bottom",
) {
  ctx.save();
  ctx.font = `600 ${fontSize}px system-ui`;
  ctx.fillStyle = "rgba(147, 197, 253, 0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const letterSpacing = fontSize * 0.3;
  const widths = Array.from(
    text,
    (char) => ctx.measureText(char).width + letterSpacing,
  );
  const totalAngle = widths.reduce((sum, w) => sum + w, 0) / radius;

  // Along the top, left to right is clockwise; along the bottom it's the reverse.
  const direction = side === "top" ? 1 : -1;
  const middle = side === "top" ? -Math.PI / 2 : Math.PI / 2;
  let angle = middle - (direction * totalAngle) / 2;

  Array.from(text).forEach((char, i) => {
    const half = widths[i] / radius / 2;
    angle += direction * half;

    ctx.save();
    ctx.translate(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
    );
    ctx.rotate(angle + (direction * Math.PI) / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();

    angle += direction * half;
  });

  ctx.restore();
}

/**
 * Glowing, slowly flowing lines joining the skills a project used, linked in
 * order around the orbit so they form a clean outline rather than a tangle.
 */
function drawConstellation(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  members: number[],
  positions: AsteroidPosition[],
  time: number,
) {
  const points = members
    .map((index) => positions[index])
    .filter((point): point is AsteroidPosition => Boolean(point))
    .sort(
      (a, b) =>
        Math.atan2(a.y - centerY, a.x - centerX) -
        Math.atan2(b.y - centerY, b.x - centerX),
    );

  if (points.length < 2) return;

  ctx.save();
  ctx.beginPath();
  points.forEach((point, i) => {
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  if (points.length > 2) ctx.closePath();

  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(56, 189, 248, 0.9)";
  ctx.shadowBlur = 12;
  ctx.strokeStyle = "rgba(125, 211, 252, 0.85)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 7]);
  ctx.lineDashOffset = -time * 0.03;
  ctx.stroke();
  ctx.restore();
}

/** A skill's logo on a small dark badge, ringed in the skill's colour. */
function drawSkillLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  logo: OrbitLogo | null,
  color: string,
  isSelected: boolean,
  isLit: boolean,
  isDimmed: boolean,
) {
  const alpha = isDimmed ? 0.28 : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;

  // Badge, glowing in its colour when part of the active constellation.
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";

  if (isLit) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();
  } else {
    ctx.fill();
  }

  const isStrong = isSelected || isLit;
  ctx.globalAlpha = alpha * (isStrong ? 1 : 0.55);
  ctx.strokeStyle = color;
  ctx.lineWidth = isStrong ? 2 : 1.25;
  ctx.stroke();
  ctx.globalAlpha = alpha;

  // Selection halo.
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Logo, scaled from its 24x24 box to fit inside the badge.
  if (logo) {
    const box = radius * 1.15;
    const scale = box / 24;

    ctx.translate(-box / 2, -box / 2);
    ctx.scale(scale, scale);

    if (logo.kind === "fill") {
      ctx.fillStyle = color;
      for (const path of logo.paths) ctx.fill(path);
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const path of logo.paths) ctx.stroke(path);
    }
  }

  ctx.restore();
}

/** Her cartoon in the middle of the orbit; the old drawn character until it loads. */
function drawCenterPortrait(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  image: HTMLImageElement | null,
) {
  if (!image || !image.complete || image.naturalWidth === 0) {
    drawDeveloperCharacter(ctx, x, y, radius * 0.55, time);
    return;
  }

  const bob = Math.sin(time * 0.002) * radius * 0.03;
  const pulse = 1 + Math.sin(time * 0.003) * 0.025;

  ctx.save();
  ctx.translate(x, y + bob);

  // Soft blue glow, kept inside the inner ring.
  const glow = ctx.createRadialGradient(0, 0, radius * 0.9, 0, 0, radius * 1.4);
  glow.addColorStop(0, "rgba(59, 130, 246, 0.35)");
  glow.addColorStop(1, "rgba(59, 130, 246, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Portrait, cropped to a circle.
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.clip();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);
  ctx.restore();

  ctx.strokeStyle = "rgba(96, 165, 250, 0.95)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Pulsing ring hints that she can be clicked to start the game.
  ctx.strokeStyle = "rgba(96, 165, 250, 0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.1 * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawDeveloperCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
) {
  const bob = Math.sin(time * 0.002) * radius * 0.07;

  ctx.save();
  ctx.translate(x, y + bob);

  // Outer glow.
  const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, radius * 1.9);
  glow.addColorStop(0, "rgba(59, 130, 246, 0.38)");
  glow.addColorStop(1, "rgba(59, 130, 246, 0)");

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.9, 0, Math.PI * 2);
  ctx.fill();

  // Body.
  ctx.fillStyle = "#3B82F6";
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.55, radius * 0.62, radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head.
  ctx.fillStyle = "#F2CFB9";
  ctx.beginPath();
  ctx.arc(0, -radius * 0.45, radius * 0.58, 0, Math.PI * 2);
  ctx.fill();

  // Hair.
  ctx.fillStyle = "#28201F";
  ctx.beginPath();
  ctx.arc(0, -radius * 0.57, radius * 0.6, Math.PI, Math.PI * 2);
  ctx.lineTo(radius * 0.52, -radius * 0.35);
  ctx.quadraticCurveTo(0, -radius * 0.75, -radius * 0.52, -radius * 0.35);
  ctx.fill();

  // Eyes.
  ctx.fillStyle = "#1E293B";
  ctx.beginPath();
  ctx.arc(-radius * 0.2, -radius * 0.42, radius * 0.055, 0, Math.PI * 2);
  ctx.arc(radius * 0.2, -radius * 0.42, radius * 0.055, 0, Math.PI * 2);
  ctx.fill();

  // Smile.
  ctx.strokeStyle = "#8B5149";
  ctx.lineWidth = Math.max(1, radius * 0.045);
  ctx.beginPath();
  ctx.arc(0, -radius * 0.28, radius * 0.17, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Laptop.
  ctx.fillStyle = "#CBD5E1";
  ctx.fillRect(-radius * 0.48, radius * 0.4, radius * 0.96, radius * 0.42);

  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(-radius * 0.4, radius * 0.45, radius * 0.8, radius * 0.29);

  // Interactive hint ring.
  ctx.strokeStyle = "rgba(96, 165, 250, 0.75)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 1.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Slingshot game drawing helpers
function drawSlingshot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  drag: GameAssets["drag"],
) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.strokeStyle = "#A78B65";
  ctx.lineWidth = 7;

  ctx.beginPath();
  ctx.moveTo(x, y + 45);
  ctx.lineTo(x, y);
  ctx.lineTo(x - 15, y - 22);

  ctx.moveTo(x, y);
  ctx.lineTo(x + 15, y - 22);
  ctx.stroke();

  ctx.strokeStyle = "#D6A77A";
  ctx.lineWidth = 3;

  ctx.beginPath();

  if (drag.active) {
    ctx.moveTo(x - 15, y - 22);
    ctx.lineTo(drag.x, drag.y);
    ctx.lineTo(x + 15, y - 22);
  } else {
    ctx.moveTo(x - 15, y - 22);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 15, y - 22);
  }

  ctx.stroke();

  drawGameAsteroid(ctx, drag.active ? drag.x : x, drag.active ? drag.y : y, 10);

  ctx.restore();
}

/**
 * Dotted preview of the first part of the shot's real (curved) path.
 * Only the start is shown, so aiming still takes some skill.
 */
function drawAimPreview(
  ctx: CanvasRenderingContext2D,
  sling: Point,
  drag: Point,
) {
  const velocity = getLaunchVelocity(sling, drag);
  if (!velocity) return;

  const { vx } = velocity;
  let { vy } = velocity;
  let x = sling.x;
  let y = sling.y;

  const dots = 6;
  const framesPerDot = 3;

  ctx.save();
  ctx.fillStyle = "#FFFFFF";

  for (let i = 1; i <= dots; i++) {
    // Same integration order as the game loop, so the dots match the shot.
    for (let frame = 0; frame < framesPerDot; frame++) {
      vy += GRAVITY;
      x += vx;
      y += vy;
    }

    ctx.globalAlpha = 0.6 * (1 - i / (dots + 1));
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawGameTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
  image: HTMLImageElement | null,
  hitAt: number,
) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = 1 + Math.sin(time * 0.004) * 0.06;

  // Hit reaction: a quick wobble and pop that fades out.
  const sinceHit = time - hitAt;
  const hitStrength =
    sinceHit >= 0 && sinceHit < HIT_REACTION_MS
      ? 1 - sinceHit / HIT_REACTION_MS
      : 0;

  if (hitStrength > 0) {
    ctx.rotate(Math.sin(sinceHit * 0.05) * 0.35 * hitStrength);
    const pop = 1 + 0.18 * hitStrength;
    ctx.scale(pop, pop);
  }

  if (image && image.complete && image.naturalWidth > 0) {
    // Soft red glow behind the badge.
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.shadowColor = "rgba(248, 113, 113, 0.7)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#0F172A";
    ctx.fill();
    ctx.restore();

    // Cartoon, cropped to a circle.
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, -radius, -radius, radius * 2, radius * 2);

    if (hitStrength > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * hitStrength})`;
      ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    }

    ctx.restore();

    // Target ring around the badge, plus a pulsing outer ring.
    ctx.strokeStyle = "rgba(248, 113, 113, 0.95)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(248, 113, 113, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, radius * pulse + 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // Fallback while the image loads (or if it fails): the original rings.
  ctx.strokeStyle = "rgba(248, 113, 113, 0.85)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(0, 0, radius * pulse, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(248, 113, 113, 0.45)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#F87171";
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawGameAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#A08A6B";
  ctx.strokeStyle = "#E5D5B8";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(-radius, -radius * 0.3);
  ctx.lineTo(-radius * 0.4, -radius);
  ctx.lineTo(radius * 0.5, -radius * 0.8);
  ctx.lineTo(radius, 0);
  ctx.lineTo(radius * 0.45, radius * 0.8);
  ctx.lineTo(-radius * 0.6, radius);
  ctx.closePath();

  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawGameChest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  state: "falling" | "landed" | "open",
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);

  if (state === "landed") {
    const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 48);
    glow.addColorStop(0, "rgba(245, 158, 11, 0.35)");
    glow.addColorStop(1, "rgba(245, 158, 11, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 48, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#8B5A2B";
  ctx.fillRect(-20, -12, 40, 25);

  ctx.strokeStyle = "#FBBF24";
  ctx.lineWidth = 3;
  ctx.strokeRect(-20, -12, 40, 25);

  ctx.fillStyle = "#FBBF24";
  ctx.fillRect(-3, -6, 6, 12);

  if (state === "open") {
    ctx.fillStyle = "#FDE68A";
    ctx.fillRect(-17, -38, 34, 27);

    ctx.fillStyle = "#92400E";
    ctx.font = "bold 8px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("RESUME", 0, -22);
  } else if (state === "landed") {
    ctx.fillStyle = `rgba(251, 191, 36, ${0.7 + Math.sin(time * 0.008) * 0.3})`;
    ctx.font = "bold 10px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("TAP TO OPEN", 0, -23);
  }

  ctx.restore();
}

function drawGameScore(
  ctx: CanvasRenderingContext2D,
  width: number,
  state: GameState,
) {
  ctx.save();

  ctx.font = "bold 12px system-ui";
  ctx.fillStyle = "#E2E8F0";
  ctx.textBaseline = "middle";

  ctx.textAlign = "left";
  ctx.fillText(`Shots: ${state.shots}/3`, 14, 22);

  ctx.textAlign = "center";
  ctx.fillText(`Hits: ${state.hits}/2`, width / 2, 22);

  ctx.restore();
}

function createGameParticles(assets: GameAssets, x: number, y: number) {
  for (let i = 0; i < 22; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;

    assets.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 35,
    });
  }
}
