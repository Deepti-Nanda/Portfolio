"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import { useResume } from "@/components/resume-context";
import {
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle,
  AlertCircle,
  Code2,
  Database,
  Globe,
  Layers,
  Terminal,
  GitBranch,
  Server,
  Braces,
} from "lucide-react";

const SKILLS = [
  {
    name: "React",
    category: "Frontend",
    description:
      "Building interactive, component-based user interfaces with React and reusable UI patterns.",
    icon: Layers,
    color: "#61DAFB",
  },
  {
    name: "JavaScript",
    category: "Language",
    description:
      "Using JavaScript to build dynamic web applications and handle application logic.",
    icon: Braces,
    color: "#F7DF1E",
  },
  {
    name: "HTML & CSS",
    category: "Frontend",
    description:
      "Creating responsive, accessible layouts and styling polished web experiences.",
    icon: Globe,
    color: "#E98B52",
  },
  {
    name: "Node.js",
    category: "Backend",
    description:
      "Building server-side functionality and backend services with Node.js.",
    icon: Server,
    color: "#83CD29",
  },
  {
    name: "Python",
    category: "Language",
    description:
      "Using Python for programming, data processing, automation, and problem solving.",
    icon: Terminal,
    color: "#FFD43B",
  },
  {
    name: "TypeScript",
    category: "Language",
    description:
      "Writing more predictable JavaScript applications with static typing.",
    icon: Code2,
    color: "#3178C6",
  },
  {
    name: "MongoDB",
    category: "Database",
    description:
      "Working with document-oriented databases to store and manage application data.",
    icon: Database,
    color: "#47A248",
  },
  {
    name: "SQL",
    category: "Database",
    description:
      "Querying and managing structured data using relational database concepts.",
    icon: Database,
    color: "#E58C39",
  },
  {
    name: "Git & GitHub",
    category: "Tools",
    description:
      "Managing source code, tracking changes, and collaborating through Git and GitHub.",
    icon: GitBranch,
    color: "#F08C55",
  },
  {
    name: "REST APIs",
    category: "Backend",
    description:
      "Connecting applications with backend services through RESTful API endpoints.",
    icon: Server,
    color: "#A78BFA",
  },
];

interface OrbitAsteroid {
  angle: number;
  ring: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  speed: number;
  vertices: { x: number; y: number }[];
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

const COLORS = [
  "#8B7355",
  "#A08A6B",
  "#C9B896",
  "#B8956C",
  "#8B6914",
  "#B8860B",
  "#967B5C",
  "#A58A72",
  "#B7A58D",
  "#C8B99E",
];

export function Skills() {
  const { openResume } = useResume();
  const orbitCanvasRef = useRef<HTMLCanvasElement>(null);
  const orbitAnimationRef = useRef<number | null>(null);
  const orbitDataRef = useRef<OrbitAsteroid[]>([]);
  const asteroidPositionsRef = useRef<AsteroidPosition[]>([]);

  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameAnimationRef = useRef<number | null>(null);
  const gameAssetsRef = useRef<GameAssets | null>(null);
  const gameStateRef = useRef<GameState>(INITIAL_GAME);

  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME);

  const updateGame = useCallback((next: GameState) => {
    gameStateRef.current = next;
    setGameState(next);
  }, []);

  // Create evenly distributed asteroid data.
  useEffect(() => {
    orbitDataRef.current = SKILLS.map((_, index) => {
      const vertexCount = 8 + (index % 4);
      const vertices = Array.from({ length: vertexCount }, (_, i) => {
        const angle = (i / vertexCount) * Math.PI * 2;
        const variation = 0.78 + Math.random() * 0.3;

        return {
          x: Math.cos(angle) * variation,
          y: Math.sin(angle) * variation,
        };
      });

      return {
        angle:
          (index % 5) * ((Math.PI * 2) / 5) + (index >= 5 ? Math.PI / 5 : 0),
        ring: index < 5 ? 0 : 1,
        radius: 1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.0015,
        speed: index < 5 ? 0.00016 : -0.00012,
        vertices,
      };
    });
  }, []);

  // Orbit animation.
  useEffect(() => {
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const animate = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (!width || !height) {
        orbitAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;

      const scale = Math.min(size / 460, 1.25);
      const innerOrbit = size * 0.25;
      const outerOrbit = size * 0.39;
      const characterRadius = Math.max(17, size * 0.075);

      ctx.clearRect(0, 0, width, height);
      drawNightBackground(ctx, width, height, time);

      // Orbit paths.
      [innerOrbit, outerOrbit].forEach((radius) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(147, 197, 253, 0.13)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 7]);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      asteroidPositionsRef.current = [];

      orbitDataRef.current.forEach((asteroid, index) => {
        asteroid.angle += asteroid.speed * dt;
        asteroid.rotation += asteroid.rotationSpeed * dt;

        const orbitRadius = asteroid.ring === 0 ? innerOrbit : outerOrbit;

        const x = centerX + Math.cos(asteroid.angle) * orbitRadius;
        const y = centerY + Math.sin(asteroid.angle) * orbitRadius;

        const radius = Math.max(8, Math.min(16, size * 0.034));

        asteroid.radius = radius;

        asteroidPositionsRef.current[index] = {
          x,
          y,
          radius,
        };

        drawOrbitAsteroid(
          ctx,
          x,
          y,
          radius,
          asteroid.rotation,
          asteroid.vertices,
          COLORS[index],
        );

        // Skill label.
        const labelY = y + radius + Math.max(10, size * 0.025);

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.max(8, Math.min(11, size * 0.024))}px system-ui`;
        ctx.fillStyle = "#E2E8F0";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 5;

        const label =
          SKILLS[index].name.length > 14
            ? SKILLS[index].name.slice(0, 13) + "…"
            : SKILLS[index].name;

        ctx.fillText(label, x, labelY, size * 0.2);
        ctx.restore();

        // Highlight selected asteroid.
        if (selectedSkill === index) {
          ctx.beginPath();
          ctx.arc(x, y, radius + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "#60A5FA";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      drawDeveloperCharacter(ctx, centerX, centerY, characterRadius, time);

      orbitAnimationRef.current = requestAnimationFrame(animate);
    };

    orbitAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();

      if (orbitAnimationRef.current !== null) {
        cancelAnimationFrame(orbitAnimationRef.current);
        orbitAnimationRef.current = null;
      }
    };
  }, [selectedSkill]);

  // Handle orbit clicks: asteroids show details; only the center character opens the game.
  const handleOrbitClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = orbitCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const characterRadius = Math.min(rect.width, rect.height) * 0.075;

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

  // Initialize the slingshot game.
  const initGame = useCallback(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (!width || !height) return;

    const slingX = Math.max(45, width * 0.16);
    const slingY = height * 0.65;
    const targetRadius = Math.max(20, Math.min(34, height * 0.09));

    gameAssetsRef.current = {
      target: {
        x: width * 0.78,
        y: height * 0.43,
        baseX: width * 0.78,
        baseY: height * 0.43,
        radius: targetRadius,
        phase: 0,
      },
      projectiles: [],
      particles: [],
      chest: null,
      drag: {
        x: slingX,
        y: slingY,
        active: false,
      },
    };

    updateGame({
      ...INITIAL_GAME,
      isOpen: true,
    });
  }, [updateGame]);

  const openGame = () => {
    updateGame({
      ...INITIAL_GAME,
      isOpen: true,
    });
  };

  const closeGame = () => {
    updateGame(INITIAL_GAME);
    gameAssetsRef.current = null;

    if (gameAnimationRef.current !== null) {
      cancelAnimationFrame(gameAnimationRef.current);
      gameAnimationRef.current = null;
    }
  };

  const resetGame = () => {
    initGame();
  };

  // Game animation.
  useEffect(() => {
    if (!gameState.isOpen) return;

    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    initGame();

    let lastTime = 0;

    const animate = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      const assets = gameAssetsRef.current;
      const state = gameStateRef.current;

      if (!assets) {
        gameAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);
      drawNightBackground(ctx, width, height, time);

      if (!state.isPaused && !state.result) {
        assets.target.phase += dt * 0.002;
        assets.target.x =
          assets.target.baseX + Math.cos(assets.target.phase) * 18;
        assets.target.y =
          assets.target.baseY + Math.sin(assets.target.phase) * 24;

        assets.projectiles.forEach((projectile) => {
          if (!projectile.active) return;

          projectile.vy += 0.32 * (dt / 16);
          projectile.x += projectile.vx * (dt / 16);
          projectile.y += projectile.vy * (dt / 16);

          const distance = Math.hypot(
            projectile.x - assets.target.x,
            projectile.y - assets.target.y,
          );

          if (distance < assets.target.radius + 10) {
            projectile.active = false;

            const hits = gameStateRef.current.hits + 1;
            const won = hits >= 2;

            updateGame({
              ...gameStateRef.current,
              hits,
              result: won ? "won" : null,
            });

            if (won) {
              assets.chest = {
                x: assets.target.x,
                y: assets.target.y - 30,
                state: "falling",
              };
            }

            createGameParticles(assets, projectile.x, projectile.y);
          }

          if (
            projectile.x > width + 40 ||
            projectile.y > height + 40 ||
            projectile.x < -40
          ) {
            projectile.active = false;
          }
        });
      }

      if (!state.isPaused && assets.chest) {
        if (assets.chest.state === "falling") {
          assets.chest.y += 6 * (dt / 16);

          if (assets.chest.y >= height - 65) {
            assets.chest.y = height - 65;
            assets.chest.state = "landed";
            createGameParticles(assets, assets.chest.x, assets.chest.y);
          }
        }
      }

      if (!state.isPaused) {
        assets.particles = assets.particles
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx * (dt / 16),
            y: particle.y + particle.vy * (dt / 16),
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0);
      }

      drawSlingshot(ctx, width * 0.16, height * 0.65, assets.drag);

      drawGameTarget(
        ctx,
        assets.target.x,
        assets.target.y,
        assets.target.radius,
        time,
      );

      assets.projectiles.forEach((projectile) => {
        if (!projectile.active) return;
        drawGameAsteroid(ctx, projectile.x, projectile.y, 10);
      });

      if (assets.chest) {
        drawGameChest(
          ctx,
          assets.chest.x,
          assets.chest.y,
          assets.chest.state,
          time,
        );
      }

      assets.particles.forEach((particle) => {
        ctx.globalAlpha = Math.max(0, particle.life / 35);
        ctx.fillStyle = "#FBBF24";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      drawGameScore(ctx, width, gameStateRef.current);

      const latest = gameStateRef.current;

      if (
        latest.shots === 0 &&
        assets.projectiles.every((projectile) => !projectile.active) &&
        latest.hits < 2 &&
        !latest.result
      ) {
        updateGame({
          ...latest,
          result: "lost",
        });
      }

      gameAnimationRef.current = requestAnimationFrame(animate);
    };

    gameAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      observer.disconnect();

      if (gameAnimationRef.current !== null) {
        cancelAnimationFrame(gameAnimationRef.current);
        gameAnimationRef.current = null;
      }
    };
  }, [gameState.isOpen, initGame, updateGame]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    const state = gameStateRef.current;

    if (
      !assets ||
      state.isPaused ||
      state.result ||
      state.shots === 0 ||
      assets.projectiles.some((projectile) => projectile.active)
    ) {
      return;
    }

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const slingX = rect.width * 0.16;
    const slingY = rect.height * 0.65;

    if (Math.hypot(x - slingX, y - slingY) < 65) {
      event.currentTarget.setPointerCapture(event.pointerId);

      assets.drag = {
        x,
        y,
        active: true,
      };
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    if (!assets?.drag.active) return;

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const slingX = rect.width * 0.16;
    const slingY = rect.height * 0.65;

    const dx = x - slingX;
    const dy = y - slingY;
    const distance = Math.hypot(dx, dy);
    const maxDrag = 85;

    const scale = distance > maxDrag ? maxDrag / distance : 1;

    assets.drag.x = slingX + dx * scale;
    assets.drag.y = slingY + dy * scale;
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    if (!assets?.drag.active) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const slingX = rect.width * 0.16;
    const slingY = rect.height * 0.65;

    const dx = slingX - assets.drag.x;
    const dy = slingY - assets.drag.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 10) {
      const power = Math.min(distance / 85, 1) * 17;

      assets.projectiles.push({
        x: slingX,
        y: slingY,
        vx: (dx / distance) * power,
        vy: (dy / distance) * power,
        active: true,
      });

      updateGame({
        ...gameStateRef.current,
        shots: gameStateRef.current.shots - 1,
      });
    }

    assets.drag.active = false;
    assets.drag.x = slingX;
    assets.drag.y = slingY;
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

      window.setTimeout(() => {
        closeGame();
        openResume();
      }, 650);
    }
  };

  const selected = selectedSkill === null ? null : SKILLS[selectedSkill];

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

        <div className="grid min-w-0 grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-10">
          {/* LEFT: Skills showcase */}
          <div className="min-w-0">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  My Toolkit
                </h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  10 frequently used technologies
                </p>
              </div>

              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
                10 Skills
              </span>
            </div>

            <div className="space-y-3">
              {SKILLS.map((skill, index) => {
                const Icon = skill.icon;

                return (
                  <div
                    key={skill.name}
                    className="group flex min-w-0 items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] sm:p-4"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${skill.color}18`,
                        color: skill.color,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] sm:text-base">
                          {skill.name}
                        </h4>

                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted)] sm:text-xs">
                          {skill.category}
                        </span>
                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--card-border)]">
                        <div
                          className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                          style={{
                            width: `${100 - index * 3}%`,
                            backgroundColor: skill.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Always-visible night-sky asteroid box */}
          <div className="min-w-0">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-[var(--foreground)]">
                Interactive Skill Orbit
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Explore the orbit. Select an asteroid to learn about a skill.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-700/70 bg-[#050510] p-3 shadow-xl shadow-black/10 sm:p-5">
              <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-2xl">
                <canvas
                  ref={orbitCanvasRef}
                  className="block h-full w-full cursor-pointer"
                  onClick={handleOrbitClick}
                  aria-label="Interactive orbit of ten skills. Select an asteroid to see its description, or select the central character to open the game."
                />

                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-300/10" />

                <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 whitespace-nowrap rounded-full border border-blue-400/20 bg-slate-950/70 px-3 py-1 text-[10px] font-medium tracking-wider text-blue-200 sm:text-xs">
                  DEVELOPER UNIVERSE
                </div>

                <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/75 px-3 py-1.5 text-center text-[10px] text-slate-300 sm:text-xs">
                  Tap an asteroid or the character
                </div>
              </div>

              {/* Selected skill details */}
              <div className="mt-4 min-h-[112px] rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4">
                {selected ? (
                  <div className="flex items-start gap-3">
                    <div
                      className="mt-0.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: selected.color }}
                    />

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white">
                          {selected.name}
                        </h4>

                        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-blue-300">
                          {selected.category}
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">
                        {selected.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[76px] flex-col justify-center">
                    <p className="text-sm font-semibold text-white">
                      Explore my skills
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
                      Click any orbiting asteroid to see how I use that
                      technology. Click the character in the centre to launch
                      the challenge.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>10 technologies in orbit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slingshot game */}
      {gameState.isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-2 backdrop-blur-sm sm:p-4"
          onClick={closeGame}
        >
          <div
            className="flex max-h-[92dvh] min-h-[360px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#050510] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-3 py-3 sm:px-5">
              <div>
                <h3 className="text-sm font-bold text-white sm:text-base">
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
              launch it.
            </div>
          </div>
        </div>
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

function drawOrbitAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  vertices: { x: number; y: number }[],
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.beginPath();

  vertices.forEach((vertex, index) => {
    const vx = vertex.x * radius;
    const vy = vertex.y * radius;

    if (index === 0) ctx.moveTo(vx, vy);
    else ctx.lineTo(vx, vy);
  });

  ctx.closePath();

  const gradient = ctx.createRadialGradient(
    -radius * 0.35,
    -radius * 0.35,
    1,
    0,
    0,
    radius,
  );

  gradient.addColorStop(0, "#E5D5B8");
  gradient.addColorStop(0.55, color);
  gradient.addColorStop(1, "#332719");

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Small crater details.
  ctx.fillStyle = "rgba(30, 25, 20, 0.3)";
  ctx.beginPath();
  ctx.arc(-radius * 0.25, radius * 0.15, radius * 0.16, 0, Math.PI * 2);
  ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.11, 0, Math.PI * 2);
  ctx.fill();

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

  if (drag.active) {
    ctx.setLineDash([4, 5]);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (x - drag.x) * 2, y + (y - drag.y) * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawGameTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);

  const pulse = 1 + Math.sin(time * 0.004) * 0.06;

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
