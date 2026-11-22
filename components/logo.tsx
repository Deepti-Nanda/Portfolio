/**
 * The DN logo: an N inside a D, where the D's straight side is also the N's
 * first stroke. Colours follow the site theme. The N keeps drawing itself,
 * over a faint copy so the logo always reads.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      strokeWidth="7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 22H44A28 28 0 0 1 44 78H22" stroke="var(--logo-accent)" />
      <path d="M22 78V22L60 70V36" stroke="var(--foreground)" opacity="0.25" />
      <path
        d="M22 78V22L60 70V36"
        stroke="var(--foreground)"
        pathLength={1}
        className="logo-draw"
      />
    </svg>
  );
}
