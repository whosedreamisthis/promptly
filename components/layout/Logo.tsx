interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-8 w-8" }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Promptly logo"
    >
      <defs>
        <linearGradient id="promptly-logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="50%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#a7f3d0" />
        </linearGradient>
      </defs>
      <path
        d="M6 4h20a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H14l-6 5v-5H6a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z"
        fill="url(#promptly-logo)"
        stroke="#292524"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10 14l4 3-4 3M17 20h5"
        fill="none"
        stroke="#292524"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
