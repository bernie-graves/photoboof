function WildflowerSprig({ className = '' }) {
  return (
    <svg
      viewBox="0 0 140 160"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M70 158C70 118 68 82 62 48" />
      <path d="M62 48C56 34 44 26 28 24" />
      <path d="M66 74C58 62 44 56 28 56" />
      <path d="M70 104c8-12 22-18 38-18" />
      <path d="M68 130c-8-10-20-15-34-15" />
      <circle cx="62" cy="42" r="4" />
      <circle cx="24" cy="20" r="4" />
      <circle cx="24" cy="52" r="4" />
      <circle cx="112" cy="84" r="4" />
      <circle cx="30" cy="113" r="4" />
      <path d="M62 30v-8M56 34l-6-6M68 34l6-6" />
      <path d="M24 12V4M18 16l-6-5M30 16l6-5" />
      <path d="M112 76v-8M106 80l-6-6M118 80l6-6" />
    </svg>
  )
}

export default WildflowerSprig
