"use client";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-20 pb-20 sm:px-6 md:pt-16"
    >
      <div className="container relative z-10 mx-auto w-full max-w-5xl px-2 text-center">
        <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl lg:text-7xl">
          Deepti <span className="text-[var(--accent)]">Nanda</span>
        </h1>

        <p
          className="mx-auto mt-6 w-full max-w-2xl animate-fade-in-up text-center text-[15px] leading-relaxed text-[var(--muted)] min-[400px]:whitespace-nowrap sm:mt-7 sm:text-lg md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Building technology that solves real-world problems
        </p>
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
