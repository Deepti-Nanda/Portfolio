"use client";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pt-20 pb-20 sm:px-6 md:pt-16"
    >
      {/* Starfield background */}
      <div className="starfield absolute inset-0" aria-hidden="true" />

      {/* Shooting stars */}
      <div
        className="shooting-star absolute top-1/4 left-1/4"
        style={{ animationDelay: "0s" }}
        aria-hidden="true"
      />

      <div
        className="shooting-star absolute top-1/3 right-1/4"
        style={{ animationDelay: "2s" }}
        aria-hidden="true"
      />

      <div
        className="shooting-star absolute top-1/2 left-1/2"
        style={{ animationDelay: "4s" }}
        aria-hidden="true"
      />

      {/* Hero content */}
      <div className="container relative z-10 mx-auto w-full max-w-5xl px-2 text-center">
        <h1 className="animate-fade-in-up text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Deepti Nanda
        </h1>

        <p
          className="mx-auto mt-5 max-w-xl animate-fade-in-up text-base leading-relaxed text-[var(--muted)] sm:mt-6 sm:text-lg md:max-w-2xl md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Building technology that solves real-world problems
        </p>

        {/* Call-to-action buttons */}
        <div
          className="mt-8 flex animate-fade-in-up flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
          style={{ animationDelay: "0.4s" }}
        >
          <a
            href="#about"
            className="btn-primary inline-flex min-h-12 items-center justify-center px-7 py-3 text-sm sm:px-8 sm:py-4 sm:text-base"
          >
            Explore My Work
          </a>

          <a
            href="#contact"
            className="btn-secondary inline-flex min-h-12 items-center justify-center px-7 py-3 text-sm sm:px-8 sm:py-4 sm:text-base"
          >
            Get In Touch
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
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
