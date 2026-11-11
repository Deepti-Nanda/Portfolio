"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { PointerEvent, MouseEvent } from "react";
import { useResume } from "@/components/resume-context";
import {
  Pause,
  RotateCcw,
  X,
  ChevronDown,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Play,
} from "lucide-react";

const SKILLS = [
  { name: "React", weight: 10, category: "Frontend" },
  { name: "JavaScript", weight: 9, category: "Languages" },
  { name: "HTML & CSS", weight: 8, category: "Frontend" },
  { name: "Node.js", weight: 9, category: "Backend" },
  { name: "Python", weight: 8, category: "Languages" },
  { name: "Django", weight: 6, category: "Backend" },
  { name: "Full-Stack Development", weight: 10, category: "Core" },
  { name: "MongoDB", weight: 7, category: "Database" },
  { name: "PostgreSQL", weight: 7, category: "Database" },
  { name: "SQL", weight: 7, category: "Database" },
  { name: "Data Structures", weight: 8, category: "Core" },
  { name: "Machine Learning", weight: 6, category: "AI & Data" },
  { name: "Data Visualization", weight: 6, category: "AI & Data" },
  { name: "Data Analytics", weight: 6, category: "AI & Data" },
];

interface Asteroid {
  name: string;
  angle: number;
  distance: number;
  radius: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  vertices: { x: number; y: number }[];
  baseDistance: number;
  wobblePhase: number;
  wobbleSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  active: boolean;
  asteroidIndex: number;
}

interface GameAssets {
  slingshot: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  target: {
    x: number;
    y: number;
    radius: number;
    baseX: number;
    baseY: number;
    bobPhase: number;
  };
  projectiles: Projectile[];
  wind: number;
  dragStart: { x: number; y: number } | null;
  isDragging: boolean;
  particles: Particle[];
  chest: {
    x: number;
    y: number;
    radius: number;
    state: "falling" | "landed" | "open";
    bouncePhase: number;
  } | null;
}

interface GameState {
  isOpen: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  shotsRemaining: number;
  hits: number;
  gameResult: "playing" | "won" | "lost" | null;
  showSkillList: boolean;
}

const INITIAL_GAME_STATE: GameState = {
  isOpen: false,
  isPlaying: false,
  isPaused: false,
  shotsRemaining: 3,
  hits: 0,
  gameResult: null,
  showSkillList: false,
};

export function Skills() {
  const { openResume, downloadResume } = useResume();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const asteroidsRef = useRef<Asteroid[]>([]);

  const gameCanvasRef = useRef<HTMLCanvasElement>(null);
  const gameAnimationRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);

  const gameStateRef = useRef<GameState>(INITIAL_GAME_STATE);

  const [gameAssets, setGameAssets] = useState<GameAssets | null>(null);

  const gameAssetsRef = useRef<GameAssets | null>(null);

  const updateGameState = useCallback((nextState: GameState) => {
    gameStateRef.current = nextState;
    setGameState(nextState);
  }, []);

  const updateGameAssets = useCallback((nextAssets: GameAssets) => {
    gameAssetsRef.current = nextAssets;
    setGameAssets(nextAssets);
  }, []);

  // Initialize asteroid data.
  useEffect(() => {
    const colors = [
      "#8B7355",
      "#A08A6B",
      "#C9B896",
      "#D4C4A8",
      "#B8956C",
      "#8B6914",
      "#A67C00",
      "#B8860B",
      "#DAA520",
      "#CD950C",
      "#967B5C",
      "#A58A72",
      "#B7A58D",
      "#C8B99E",
    ];

    asteroidsRef.current = SKILLS.map((skill, index) => {
      const baseDistance = 110 + (index % 3) * 75 + skill.weight * 4;

      const radius = Math.max(18, Math.min(42, 14 + skill.weight * 2.5));

      const vertexCount = 8 + Math.floor(Math.random() * 4);
      const vertices: { x: number; y: number }[] = [];

      for (let i = 0; i < vertexCount; i++) {
        const angle = (i / vertexCount) * Math.PI * 2;
        const variance = 0.75 + Math.random() * 0.35;

        vertices.push({
          x: Math.cos(angle) * variance,
          y: Math.sin(angle) * variance,
        });
      }

      return {
        name: skill.name,
        angle: (index / SKILLS.length) * Math.PI * 2,
        distance: baseDistance,
        radius,
        speed: 0.00025 + Math.random() * 0.0004,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.002,
        color: colors[index % colors.length],
        vertices,
        baseDistance,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.001 + Math.random() * 0.002,
      };
    });
  }, []);

  // Main asteroid belt animation.
  useEffect(() => {
    const canvas = canvasRef.current;
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

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const animate = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;
      lastTime = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (!width || !height) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const currentAsteroids = asteroidsRef.current;

      const maxBaseDistance = Math.max(
        ...currentAsteroids.map((asteroid) => asteroid.baseDistance),
      );

      const maxAsteroidRadius = Math.max(
        ...currentAsteroids.map((asteroid) => asteroid.radius),
      );

      // Keep asteroids and their labels inside the canvas.
      const availableRadius = Math.max(
        40,
        Math.min(width, height) * 0.44 - maxAsteroidRadius - 36,
      );

      const orbitScale = Math.min(1, availableRadius / maxBaseDistance);

      ctx.clearRect(0, 0, width, height);

      drawStarfield(ctx, width, height, time);

      const orbits = Array.from(
        new Set(
          currentAsteroids.map((asteroid) =>
            Math.round(asteroid.baseDistance * orbitScale),
          ),
        ),
      );

      orbits.forEach((distance) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, distance, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      currentAsteroids.forEach((asteroid) => {
        asteroid.angle += asteroid.speed * dt;

        const wobble =
          Math.sin(time * asteroid.wobbleSpeed + asteroid.wobblePhase) * 6;

        asteroid.distance = asteroid.baseDistance + wobble;
        asteroid.rotation += asteroid.rotationSpeed * dt;

        const scaledDistance = asteroid.distance * orbitScale;

        const x = centerX + Math.cos(asteroid.angle) * scaledDistance;

        const y = centerY + Math.sin(asteroid.angle) * scaledDistance;

        drawAsteroid(
          ctx,
          x,
          y,
          asteroid.radius,
          asteroid.rotation,
          asteroid.vertices,
          asteroid.color,
          asteroid.name,
        );
      });

      drawCentralFigure(ctx, centerX, centerY, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();

      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  // Initialize or reset the game.
  const initGame = useCallback(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    if (!width || !height) return;

    const slingshotX = Math.min(100, Math.max(65, width * 0.23));
    const slingshotY = height / 2 + 20;

    const targetRadius = Math.min(
      50,
      Math.max(30, Math.min(width, height) * 0.11),
    );

    const targetBaseX = Math.max(slingshotX + 100, width - targetRadius - 65);

    const targetBaseY = height / 2;

    const initialAssets: GameAssets = {
      slingshot: {
        x: slingshotX,
        y: slingshotY,
        width: 24,
        height: 110,
      },
      target: {
        x: targetBaseX,
        y: targetBaseY,
        radius: targetRadius,
        baseX: targetBaseX,
        baseY: targetBaseY,
        bobPhase: 0,
      },
      projectiles: [],
      wind: (Math.random() - 0.5) * 1.2,
      dragStart: null,
      isDragging: false,
      particles: [],
      chest: null,
    };

    const initialState: GameState = {
      ...gameStateRef.current,
      isPlaying: true,
      isPaused: false,
      shotsRemaining: 3,
      hits: 0,
      gameResult: null,
    };

    updateGameAssets(initialAssets);
    updateGameState(initialState);
  }, [updateGameAssets, updateGameState]);

  // Main game animation loop.
  const startGameLoop = useCallback(() => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = 0;

    const animate = (time: number) => {
      const dt = lastTime ? Math.min(time - lastTime, 40) : 16;

      lastTime = time;

      const assets = gameAssetsRef.current;
      const state = gameStateRef.current;
      const currentAsteroids = asteroidsRef.current;

      if (!assets) {
        gameAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (!width || !height) {
        gameAnimationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, width, height);

      drawStarfield(ctx, width, height, time);

      // Move the target and projectiles only during active play.
      if (!state.isPaused && !state.gameResult) {
        assets.target.bobPhase += dt * 0.0025;

        const bobY = Math.sin(assets.target.bobPhase) * 35;
        const driftX = Math.cos(assets.target.bobPhase * 0.8) * 25;

        assets.target.x = assets.target.baseX + driftX;
        assets.target.y = assets.target.baseY + bobY;

        assets.projectiles = assets.projectiles.map((projectile) => {
          if (!projectile.active) return projectile;

          const frameScale = dt / 16;

          const newVy = projectile.vy + 0.35 * frameScale;
          const newVx = projectile.vx + assets.wind * 0.12 * frameScale;

          const newX = projectile.x + newVx * frameScale;
          const newY = projectile.y + newVy * frameScale;
          const newRotation = projectile.rotation + 0.05;

          // Target collision detection.
          const dx = newX - assets.target.x;
          const dy = newY - assets.target.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < assets.target.radius + projectile.radius) {
            createHitParticles(assets, newX, newY);

            const updatedHits = gameStateRef.current.hits + 1;
            const won = updatedHits >= 2;

            const nextState: GameState = {
              ...gameStateRef.current,
              hits: updatedHits,
              gameResult: won ? "won" : gameStateRef.current.gameResult,
            };

            updateGameState(nextState);

            if (won) {
              assets.chest = {
                x: assets.target.x,
                y: assets.target.y - 40,
                radius: 36,
                state: "falling",
                bouncePhase: 0,
              };
            }

            return { ...projectile, active: false };
          }

          // Remove projectiles outside the canvas.
          if (
            newX > width + 60 ||
            newY > height + 60 ||
            newX < -60 ||
            newY < -60
          ) {
            return { ...projectile, active: false };
          }

          return {
            ...projectile,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            rotation: newRotation,
          };
        });
      }

      // Chest animation continues even after winning.
      // This is intentionally outside the active-game condition.
      if (!state.isPaused && assets.chest) {
        if (assets.chest.state === "falling") {
          const nextY = assets.chest.y + 7 * (dt / 16);

          if (nextY >= height - 90) {
            assets.chest = {
              ...assets.chest,
              y: height - 90,
              state: "landed",
              bouncePhase: 0,
            };

            createHitParticles(assets, assets.chest.x, assets.chest.y);
          } else {
            assets.chest = {
              ...assets.chest,
              y: nextY,
            };
          }
        } else if (assets.chest.state === "landed") {
          assets.chest = {
            ...assets.chest,
            bouncePhase: assets.chest.bouncePhase + dt * 0.015,
          };
        }
      }

      // Particle animation also continues after winning.
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

      // Draw the scene.
      drawSlingshot(ctx, assets.slingshot, assets.dragStart, assets.isDragging);

      drawTarget(
        ctx,
        assets.target.x,
        assets.target.y,
        assets.target.radius,
        time,
      );

      assets.projectiles.forEach((projectile) => {
        if (!projectile.active) return;

        const asteroid = currentAsteroids[projectile.asteroidIndex];

        drawProjectile(
          ctx,
          projectile.x,
          projectile.y,
          projectile.radius,
          projectile.rotation,
          asteroid?.color || "#8B7355",
          asteroid?.vertices,
        );
      });

      if (assets.chest) {
        drawChest(
          ctx,
          assets.chest.x,
          assets.chest.y,
          assets.chest.radius,
          assets.chest.state,
          assets.chest.bouncePhase,
          time,
        );
      }

      assets.particles.forEach((particle) => {
        const alpha = Math.max(0, particle.life / particle.maxLife);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3 * alpha, 0, Math.PI * 2);

        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      drawWindIndicator(ctx, width, height, assets.wind);

      drawGameHUD(ctx, width, height, gameStateRef.current);

      // Check whether the player has run out of shots.
      const latestState = gameStateRef.current;

      if (
        latestState.shotsRemaining === 0 &&
        assets.projectiles.every((projectile) => !projectile.active) &&
        latestState.hits < 2 &&
        !latestState.gameResult
      ) {
        updateGameState({
          ...latestState,
          gameResult: "lost",
        });
      }

      gameAnimationRef.current = requestAnimationFrame(animate);
    };

    gameAnimationRef.current = requestAnimationFrame(animate);
  }, [updateGameState]);

  // Set the game canvas dimensions before starting the game loop.
  useEffect(() => {
    if (!gameState.isOpen || !gameState.isPlaying) return;

    const canvas = gameCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeGameCanvas = () => {
      const rect = canvas.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const pixelWidth = Math.round(rect.width * dpr);
      const pixelHeight = Math.round(rect.height * dpr);

      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeGameCanvas();

    const resizeObserver = new ResizeObserver(resizeGameCanvas);
    resizeObserver.observe(canvas);

    initGame();
    startGameLoop();

    return () => {
      resizeObserver.disconnect();

      if (gameAnimationRef.current !== null) {
        cancelAnimationFrame(gameAnimationRef.current);
        gameAnimationRef.current = null;
      }
    };
  }, [gameState.isOpen, gameState.isPlaying, initGame, startGameLoop]);

  // Slingshot pointer interactions.
  const handlePointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    const state = gameStateRef.current;

    if (
      !assets ||
      state.isPaused ||
      state.gameResult ||
      state.shotsRemaining === 0
    ) {
      return;
    }

    if (assets.projectiles.some((projectile) => projectile.active)) {
      return;
    }

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - assets.slingshot.x;
    const dy = y - assets.slingshot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 90) {
      e.currentTarget.setPointerCapture(e.pointerId);

      updateGameAssets({
        ...assets,
        dragStart: { x, y },
        isDragging: true,
      });
    }
  };

  const handlePointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;

    if (!assets || !assets.isDragging || !assets.dragStart) return;

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - assets.slingshot.x;
    const dy = y - assets.slingshot.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDrag = 110;

    let dragStart = { x, y };

    if (distance > maxDrag) {
      const angle = Math.atan2(dy, dx);

      dragStart = {
        x: assets.slingshot.x + Math.cos(angle) * maxDrag,
        y: assets.slingshot.y + Math.sin(angle) * maxDrag,
      };
    }

    updateGameAssets({
      ...assets,
      dragStart,
    });
  };

  const handlePointerUp = (e?: PointerEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;
    const state = gameStateRef.current;

    if (!assets || !assets.isDragging || !assets.dragStart) return;

    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const dx = assets.slingshot.x - assets.dragStart.x;
    const dy = assets.slingshot.y - assets.dragStart.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 15) {
      const angle = Math.atan2(dy, dx);
      const power = Math.min(distance / 110, 1) * 21;

      const vx = Math.cos(angle) * power;
      const vy = Math.sin(angle) * power;

      const asteroidIndex =
        asteroidsRef.current.length > 0
          ? (3 - state.shotsRemaining) % asteroidsRef.current.length
          : 0;

      const updatedAssets: GameAssets = {
        ...assets,
        projectiles: [
          ...assets.projectiles,
          {
            x: assets.slingshot.x,
            y: assets.slingshot.y,
            vx,
            vy,
            radius: 18,
            rotation: 0,
            active: true,
            asteroidIndex,
          },
        ],
        wind: (Math.random() - 0.5) * 1.4,
        dragStart: null,
        isDragging: false,
      };

      updateGameAssets(updatedAssets);

      updateGameState({
        ...state,
        shotsRemaining: state.shotsRemaining - 1,
      });
    } else {
      updateGameAssets({
        ...assets,
        dragStart: null,
        isDragging: false,
      });
    }
  };

  const handlePause = () => {
    const currentState = gameStateRef.current;

    updateGameState({
      ...currentState,
      isPaused: !currentState.isPaused,
    });
  };

  const handleScatter = () => {
    const assets = gameAssetsRef.current;
    if (!assets) return;

    createHitParticles(assets, assets.target.x, assets.target.y);
  };

  const handleReset = () => {
    initGame();
  };

  const handleChestClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const assets = gameAssetsRef.current;

    if (!assets?.chest || assets.chest.state !== "landed") return;

    const rect = gameCanvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - assets.chest.x;
    const dy = y - assets.chest.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50) {
      const updatedAssets: GameAssets = {
        ...assets,
        chest: {
          ...assets.chest,
          state: "open",
        },
      };

      updateGameAssets(updatedAssets);

      window.setTimeout(() => {
        openResume();
      }, 600);
    }
  };

  const closeGame = () => {
    updateGameState({
      ...gameStateRef.current,
      isOpen: false,
      isPlaying: false,
    });

    if (gameAnimationRef.current !== null) {
      cancelAnimationFrame(gameAnimationRef.current);
      gameAnimationRef.current = null;
    }
  };

  const openGame = () => {
    updateGameState({
      ...gameStateRef.current,
      isOpen: true,
      isPlaying: true,
    });
  };

  return (
    <section
      id="skills"
      className="reveal relative overflow-hidden py-16 sm:py-20 lg:py-28"
      aria-labelledby="skills-heading"
    >
      <div className="absolute inset-0 bg-[#050510]" aria-hidden="true" />

      <div
        className="starfield absolute inset-0 opacity-80"
        aria-hidden="true"
      />

      <div className="container relative z-10">
        <div className="mb-10 text-center">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-blue-400">
            Interactive Orbit
          </span>

          <h2 id="skills-heading" className="section-title mb-4 text-white">
            Skills Asteroid Belt
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-300">
            14 core technologies represented as tumbling rocky asteroids
            orbiting Deepti.
            <br />
            <span className="font-medium text-blue-400">
              Tap the figure in the center
            </span>{" "}
            to launch the Slingshot Challenge!
          </p>
        </div>

        {/* Main asteroid belt */}
        <div className="group relative mx-auto mb-8 aspect-square w-full min-w-0 max-w-[580px] touch-none sm:mb-10">
          <canvas
            ref={canvasRef}
            className="block h-full w-full cursor-pointer rounded-full"
            onClick={openGame}
            aria-label="Asteroid belt with skills orbiting Deepti. Click to play the game."
          />

          <div className="pointer-events-none absolute inset-0 rounded-full border border-blue-500/20 transition-colors group-hover:border-blue-500/50" />

          <button
            onClick={openGame}
            className="absolute bottom-4 left-1/2 flex min-h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-blue-600/90 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 hover:bg-blue-500 sm:bottom-6"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Play Asteroid Challenge</span>
          </button>
        </div>

        {/* Recruiter skill matrix toggle */}
        <div className="text-center">
          <button
            onClick={() =>
              updateGameState({
                ...gameStateRef.current,
                showSkillList: !gameStateRef.current.showSkillList,
              })
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/60 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-gray-700 hover:text-white"
          >
            <span>
              {gameState.showSkillList
                ? "Hide Full Skill Matrix"
                : "View Full Skill Matrix (for recruiters)"}
            </span>

            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${
                gameState.showSkillList ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Skill matrix */}
        {gameState.showSkillList && (
          <div className="mx-auto mt-8 max-w-4xl animate-fade-in-up rounded-2xl border border-gray-800 bg-gray-900/80 p-4 sm:p-6 md:p-8">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
              <Sparkles className="h-5 w-5 shrink-0 text-blue-400" />
              Technical Competencies (14 Skills)
            </h3>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {SKILLS.map((skill) => (
                <div
                  key={skill.name}
                  className="flex flex-col justify-between rounded-xl border border-gray-800 bg-gray-950/60 p-3 transition-colors hover:border-blue-500/50"
                >
                  <span className="text-sm font-medium text-gray-200">
                    {skill.name}
                  </span>

                  <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-800/60 pt-2 text-xs text-gray-400">
                    <span>{skill.category}</span>

                    <span className="whitespace-nowrap font-mono text-blue-400">
                      Weight: {skill.weight}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game modal */}
      {gameState.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-2 backdrop-blur-md animate-fade-in-up sm:p-4"
          onClick={closeGame}
        >
          <div
            className="relative flex h-[min(82dvh,680px)] max-h-[calc(100dvh-1rem)] min-h-[min(360px,calc(100dvh-1rem))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#050510] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative z-20 flex min-h-[56px] shrink-0 items-center justify-between gap-2 border-b border-gray-800 bg-gray-950/95 p-3 sm:min-h-[64px] sm:px-6">
              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                <h3 className="text-sm font-bold text-white sm:text-base">
                  Asteroid Slingshot
                </h3>

                <span className="hidden rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 sm:inline">
                  Target Radius: 50px
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1 sm:gap-3">
                <button
                  onClick={handlePause}
                  className="min-h-10 min-w-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title={gameState.isPaused ? "Resume" : "Pause"}
                  aria-label={gameState.isPaused ? "Resume game" : "Pause game"}
                >
                  {gameState.isPaused ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Pause className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={handleScatter}
                  className="min-h-10 min-w-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title="Scatter particles"
                  aria-label="Scatter particles"
                >
                  <Sparkles className="h-4 w-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="min-h-10 min-w-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title="Reset Game"
                  aria-label="Reset game"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                <button
                  onClick={closeGame}
                  className="min-h-10 min-w-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  title="Close"
                  aria-label="Close game"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Game canvas */}
            <div className="relative z-0 min-h-0 flex-1 touch-none overflow-hidden">
              <canvas
                ref={gameCanvasRef}
                className="block h-full w-full cursor-crosshair"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={handleChestClick}
              />

              {gameState.isPaused && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-xl font-bold uppercase tracking-widest text-white">
                    Paused
                  </span>
                </div>
              )}

              {/* Win overlay */}
              {gameState.gameResult === "won" && (
                <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 rounded-xl border border-emerald-400/30 bg-gray-950/90 p-3 text-center shadow-xl backdrop-blur-md animate-fade-in-up sm:top-4 sm:p-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                    <h4 className="text-base font-bold text-white sm:text-lg">
                      Target Hit! (2/2)
                    </h4>
                  </div>

                  <p className="mt-1 text-xs text-gray-300 sm:text-sm">
                    Awesome shooting! The chest has landed on Earth. Tap the
                    glowing chest or use the buttons below to view the resume.
                  </p>

                  <div className="pointer-events-auto mt-3 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        openResume();
                        closeGame();
                      }}
                      className="btn-primary flex min-h-10 items-center gap-2 px-3 py-2 text-xs sm:text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      View Resume
                    </button>

                    <button
                      onClick={downloadResume}
                      className="btn-secondary flex min-h-10 items-center gap-2 border-gray-700 px-3 py-2 text-xs text-white sm:text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Download PDF
                    </button>
                  </div>
                </div>
              )}

              {gameState.gameResult === "lost" && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 p-4 text-center animate-fade-in-up sm:p-6">
                  <AlertCircle className="mb-3 h-12 w-12 text-rose-500 sm:h-16 sm:w-16" />

                  <h4 className="text-xl font-bold text-white sm:text-2xl">
                    Try Again!
                  </h4>

                  <p className="mt-2 max-w-md text-xs text-gray-300 sm:text-sm">
                    You scored {gameState.hits}/2 hits. You need 2 hits to
                    unlock the chest resume.
                  </p>

                  <button
                    onClick={handleReset}
                    className="btn-primary mt-6 flex min-h-11 items-center gap-2 px-6 py-2.5 text-sm"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Play Again
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-gray-800 bg-gray-950/80 px-3 py-2 text-center text-[10px] text-gray-400 sm:px-4 sm:text-xs">
              Drag backward from the slingshot on the left and release. Gravity,
              shifting wind, and target bobbing are active!
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// Drawing routines.

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
) {
  if (!width || !height) return;

  for (let i = 0; i < 70; i++) {
    const x = (i * 137 + time * 0.02) % width;
    const y = (i * 269) % height;
    const alpha = 0.2 + ((i * 17) % 80) / 100;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, (i % 2) + 1, (i % 2) + 1);
  }
}

function drawAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  vertices: { x: number; y: number }[],
  color: string,
  name: string,
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
    -radius * 0.3,
    -radius * 0.3,
    2,
    0,
    0,
    radius,
  );

  gradient.addColorStop(0, "#D4C4A8");
  gradient.addColorStop(0.6, color);
  gradient.addColorStop(1, "#3A2A1A");

  ctx.fillStyle = gradient;
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Skill label.
  ctx.save();

  ctx.fillStyle = "#E2E8F0";
  ctx.font = `${Math.max(
    10,
    Math.min(13, radius * 0.45),
  )}px system-ui, sans-serif`;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
  ctx.shadowBlur = 4;

  ctx.fillText(name, x, y + radius + 12, radius * 4.2);

  ctx.restore();
}

function drawCentralFigure(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const bob = Math.sin(time * 0.0025) * 5;

  ctx.save();
  ctx.translate(x, y + bob);

  // Glowing aura.
  const aura = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);

  aura.addColorStop(0, "rgba(59, 130, 246, 0.35)");
  aura.addColorStop(1, "rgba(59, 130, 246, 0)");

  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 45, 0, Math.PI * 2);
  ctx.fill();

  // Torso.
  ctx.fillStyle = "#2563EB";
  ctx.beginPath();
  ctx.ellipse(0, 10, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head.
  ctx.fillStyle = "#F3D2C1";
  ctx.beginPath();
  ctx.arc(0, -18, 16, 0, Math.PI * 2);
  ctx.fill();

  // Hair.
  ctx.fillStyle = "#1E1B18";
  ctx.beginPath();
  ctx.arc(0, -20, 17, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Eyes.
  ctx.fillStyle = "#0F172A";
  ctx.beginPath();
  ctx.arc(-5, -18, 2.2, 0, Math.PI * 2);
  ctx.arc(5, -18, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Smile.
  ctx.strokeStyle = "#0F172A";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -14, 5, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  // Laptop.
  ctx.fillStyle = "#94A3B8";
  ctx.fillRect(-12, 2, 24, 12);

  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(-10, 4, 20, 8);

  ctx.restore();
}

function drawSlingshot(
  ctx: CanvasRenderingContext2D,
  slingshot: GameAssets["slingshot"],
  dragStart: GameAssets["dragStart"],
  isDragging: boolean,
) {
  const { x, y, height } = slingshot;

  ctx.save();

  // Y-shaped wooden frame.
  ctx.strokeStyle = "#64748B";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(x, y + height / 2);
  ctx.lineTo(x, y);
  ctx.lineTo(x - 20, y - 30);

  ctx.moveTo(x, y);
  ctx.lineTo(x + 20, y - 30);
  ctx.stroke();

  // Slingshot bands.
  ctx.strokeStyle = isDragging ? "#EF4444" : "#A1A1AA";
  ctx.lineWidth = 3;

  ctx.beginPath();

  if (dragStart && isDragging) {
    ctx.moveTo(x - 20, y - 30);
    ctx.lineTo(dragStart.x, dragStart.y);
    ctx.lineTo(x + 20, y - 30);
  } else {
    ctx.moveTo(x - 20, y - 30);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 20, y - 30);
  }

  ctx.stroke();

  // Draw the asteroid ammunition.
  if (!isDragging) {
    drawProjectile(ctx, x, y, 15, 0, "#A08A6B", [
      { x: -0.8, y: -0.3 },
      { x: -0.3, y: -0.9 },
      { x: 0.5, y: -0.8 },
      { x: 0.9, y: -0.1 },
      { x: 0.5, y: 0.8 },
      { x: -0.4, y: 0.9 },
      { x: -0.9, y: 0.3 },
    ]);
  } else if (dragStart) {
    // Keep the asteroid attached to the pulled band.
    drawProjectile(ctx, dragStart.x, dragStart.y, 15, 0, "#A08A6B", [
      { x: -0.8, y: -0.3 },
      { x: -0.3, y: -0.9 },
      { x: 0.5, y: -0.8 },
      { x: 0.9, y: -0.1 },
      { x: 0.5, y: 0.8 },
      { x: -0.4, y: 0.9 },
      { x: -0.9, y: 0.3 },
    ]);
  }

  // Aim helper line.
  if (dragStart && isDragging) {
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * 3, y + dy * 3);
    ctx.stroke();

    ctx.setLineDash([]);
  }

  ctx.restore();
}

function drawTarget(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);

  // Outer ring.
  ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  // Inner rings.
  ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.6, 0, Math.PI * 2);
  ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
  ctx.stroke();

  // Figure inside the target.
  drawCentralFigure(ctx, 0, 0, time);

  ctx.restore();
}

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
  color: string,
  vertices?: { x: number; y: number }[],
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  if (vertices?.length) {
    ctx.beginPath();

    vertices.forEach((vertex, index) => {
      const vx = vertex.x * radius;
      const vy = vertex.y * radius;

      if (index === 0) ctx.moveTo(vx, vy);
      else ctx.lineTo(vx, vy);
    });

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawChest(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  state: "falling" | "landed" | "open",
  bouncePhase: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);

  const bounce = state === "landed" ? Math.sin(bouncePhase * 10) * 4 : 0;

  ctx.translate(0, bounce);

  // Glow when ready to open.
  if (state === "landed") {
    const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, radius + 20);

    glow.addColorStop(0, "rgba(245, 158, 11, 0.35)");
    glow.addColorStop(1, "rgba(245, 158, 11, 0)");

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius + 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // Chest body.
  ctx.fillStyle = "#8B5A2B";
  ctx.fillRect(-22, -14, 44, 28);

  ctx.strokeStyle = "#F59E0B";
  ctx.lineWidth = 3;
  ctx.strokeRect(-22, -14, 44, 28);

  // Lock.
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  if (state === "landed") {
    const pulse = Math.sin(time * 0.008) * 0.3 + 0.7;

    ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.font = "bold 11px system-ui";
    ctx.textAlign = "center";

    ctx.fillText("TAP CHEST TO OPEN RESUME", 0, -24);
  }

  if (state === "open") {
    ctx.fillStyle = "#FDE68A";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("UNLOCKED!", 0, -28);
  }

  ctx.restore();
}

function drawWindIndicator(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  wind: number,
) {
  ctx.save();

  ctx.fillStyle = "#94A3B8";
  ctx.font = width < 360 ? "11px system-ui" : "12px system-ui";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  ctx.fillText(
    `Wind: ${wind > 0 ? "→" : "←"} ${Math.abs(wind).toFixed(1)}`,
    width - 16,
    26,
  );

  ctx.restore();
}

function drawGameHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gameState: GameState,
) {
  ctx.save();

  const fontSize = width < 360 ? 11 : 13;

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${fontSize}px system-ui`;
  ctx.textBaseline = "middle";

  ctx.textAlign = "left";
  ctx.fillText(`Shots: ${gameState.shotsRemaining}/3`, 16, 26);

  ctx.textAlign = "center";
  ctx.fillText(`Hits: ${gameState.hits}/2`, width / 2, 26);

  ctx.restore();
}

function createHitParticles(gameAssets: GameAssets, x: number, y: number) {
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;

    gameAssets.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 45,
      maxLife: 45,
      color: `hsl(${200 + Math.random() * 60}, 100%, 65%)`,
    });
  }
}
