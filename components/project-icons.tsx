/**
 * Animated project icons for the project card thumbnails. The radar and the
 * heartbeat line animate themselves with SVG animation, so they need no
 * JavaScript or global CSS.
 */

const ECG_PATH = "M194 512 H385 L435 580 L498 320 L575 705 L638 512 H830";

/** OpenSource Radar: the sweep turns clockwise, one turn every 3 seconds. */
export function RadarIcon() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className="h-full w-full"
      role="img"
      aria-label="OpenSource Radar icon"
    >
      <circle
        cx="512"
        cy="512"
        r="272"
        fill="none"
        stroke="#86C095"
        strokeWidth="62"
      />
      <g>
        <path
          d="M512 512 L512 78 A434 434 0 0 1 818.9 205.1 Z"
          fill="#20873B"
          fillOpacity=".35"
        />
        <line
          x1="512"
          y1="512"
          x2="840"
          y2="184"
          stroke="#20873B"
          strokeWidth="62"
        />
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 512 512"
          to="360 512 512"
          dur="3s"
          repeatCount="indefinite"
        />
      </g>
      <circle
        cx="512"
        cy="512"
        r="465"
        fill="none"
        stroke="#20873B"
        strokeWidth="62"
      />
      <circle cx="512" cy="512" r="77" fill="#20873B" />
    </svg>
  );
}

/**
 * Raksha: the heartbeat line draws across, holds, then clears from the left,
 * like an ECG monitor. A faint copy keeps the icon readable between beats.
 */
export function RakshaIcon() {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className="h-full w-full"
      role="img"
      aria-label="Raksha icon"
    >
      <path
        d={ECG_PATH}
        fill="none"
        stroke="#fff"
        strokeOpacity=".28"
        strokeWidth="64"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ECG_PATH}
        pathLength={1}
        fill="none"
        stroke="#fff"
        strokeWidth="64"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 1"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="1;0;0;-1"
          keyTimes="0;0.45;0.7;1"
          calcMode="spline"
          keySplines="0.42 0 0.58 1;0 0 1 1;0.42 0 0.58 1"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
