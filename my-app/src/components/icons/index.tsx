type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function UploadIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 4v9" />
      <path d="M8.5 8L12 4l3.5 4" />
      <path d="M4.5 16.5v2a2 2 0 002 2h11a2 2 0 002-2v-2" />
    </svg>
  );
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v10H8l-4 4V5z" />
      <path d="M8 8.5h8M8 11.5h5" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3h7l4 4v14H7V3z" />
      <path d="M14 3v4h4" />
      <path d="M9.5 13.5l2 2 4-4.5" />
    </svg>
  );
}

export function SmallArmIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 19h4" />
      <path d="M7 19V13l6-3" />
      <circle cx="7" cy="19" r="1" />
      <circle cx="13" cy="10" r="1.2" />
      <path d="M13 10l4-2" />
      <circle cx="17" cy="8" r="1" />
    </svg>
  );
}

export function LargeArmIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="18" width="6" height="2.5" rx="0.5" />
      <path d="M7 18v-5" />
      <circle cx="7" cy="12" r="1.3" />
      <path d="M7 12l5-2" />
      <circle cx="12" cy="10" r="1.3" />
      <path d="M12 10l5-1" />
      <circle cx="17" cy="9" r="1" />
    </svg>
  );
}
