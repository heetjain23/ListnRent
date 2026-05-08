import React from 'react'
import '../styles/coming-soon.css'

const teaserLines = [
  'A sharper admin experience is taking shape behind the curtain.',
  'We are building something more focused, faster, and easier to trust.',
  'The first reveal will be worth the wait.'
]

const ComingSoon = () => {
  return (
    <section className="admin-cs-page" aria-label="Coming soon admin page">
      <div className="admin-cs-noise" aria-hidden="true" />
      <div className="admin-cs-orb admin-cs-orb-1" aria-hidden="true" />
      <div className="admin-cs-orb admin-cs-orb-2" aria-hidden="true" />
      <div className="admin-cs-grid" aria-hidden="true" />

      <div className="admin-cs-content">
        <p className="admin-cs-kicker">Admin experience in progress</p>
        <h1 className="admin-cs-title">
          A more powerful
          <span>control center is coming.</span>
        </h1>

        <p className="admin-cs-subtitle">
          We are keeping the details quiet for now, but the direction is clear: cleaner operations, stronger visibility, and a better workflow.
        </p>

        <ul className="admin-cs-teasers" aria-label="Teaser details">
          {teaserLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="admin-cs-pulse-wrap" aria-hidden="true">
          <span className="admin-cs-pulse-dot" />
          <span className="admin-cs-pulse-line" />
          <span className="admin-cs-pulse-dot" />
        </div>
      </div>
    </section>
  )
}

export default ComingSoon
