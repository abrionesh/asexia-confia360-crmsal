export function AsexiAMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="32" height="32" rx="9" className="fill-accent" />
      <path
        d="M16 7.5 8.8 24h3.15l1.42-3.55h5.26L19.99 24h3.21L16 7.5Zm-.02 5.3 1.86 4.65h-3.74l1.88-4.65Z"
        className="fill-accent-fg"
      />
      <circle cx="24.2" cy="8.2" r="1.35" className="fill-accent-fg" />
    </svg>
  );
}
