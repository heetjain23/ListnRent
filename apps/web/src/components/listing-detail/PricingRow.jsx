import React from 'react'

// ─── Pricing row helper ────────────────────────────────────────────────────
const PricingRow = ({ label, amount, underline = false, bold = false }) => (
  <div className="flex justify-between text-sm">
    <span
      className={underline ? 'underline decoration-dotted cursor-help' : ''}
      style={{ color: '#4A4A3A' }}
    >
      {label}
    </span>
    <span
      className={bold ? 'font-bold' : 'font-semibold'}
      style={{ color: '#1A1A14' }}
    >
      ₹{amount}
    </span>
  </div>
)

export default PricingRow
