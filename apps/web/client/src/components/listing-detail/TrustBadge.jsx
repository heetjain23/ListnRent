import React from 'react'

// ─── Icon helpers (inline SVG keeps zero external deps) ────────────────────────────
const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="#7D6B41" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="#7D6B41" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
)

const ReturnIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="#7D6B41" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

// ─── Trust Badge ───────────────────────────────────────────────────────────────
const TrustBadge = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-1.5 text-center">
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center"
      style={{ backgroundColor: '#F5F2E8' }}
    >
      {icon}
    </div>
    <p
      className="text-[10px] font-semibold uppercase tracking-wide leading-tight"
      style={{ color: '#7D6B41' }}
    >
      {label}
    </p>
  </div>
)

export { TrustBadge, ShieldIcon, SparkleIcon, ReturnIcon }
