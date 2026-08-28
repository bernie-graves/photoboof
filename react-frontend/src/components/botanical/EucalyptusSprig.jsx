function EucalyptusSprig({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M60 196C60 150 58 96 44 46" />
      <ellipse cx="42" cy="42" rx="13" ry="17" transform="rotate(-22 42 42)" />
      <ellipse cx="76" cy="62" rx="13" ry="17" transform="rotate(28 76 62)" />
      <ellipse cx="36" cy="86" rx="14" ry="18" transform="rotate(-18 36 86)" />
      <ellipse cx="82" cy="108" rx="14" ry="18" transform="rotate(24 82 108)" />
      <ellipse cx="38" cy="134" rx="13" ry="17" transform="rotate(-14 38 134)" />
      <ellipse cx="80" cy="158" rx="12" ry="16" transform="rotate(20 80 158)" />
      <path d="M52 52 44 44M64 66 76 62M50 92 38 86M68 114 82 108M52 138 40 134M68 160 80 158" />
    </svg>
  )
}

export default EucalyptusSprig
