import React from 'react'
import '../styles/coming-soon.css'

const teaserLines = [
  'A new way to discover value is almost here.',
  'We are crafting something bold, useful, and delightfully unexpected.',
  'Early visitors will get first access when the curtain lifts.'
]

const ComingSoon = () => {
  return (
    <section className="cs-page" aria-label="Coming soon teaser page">
      <div className="cs-noise" aria-hidden="true" />
      <div className="cs-orb cs-orb-1" aria-hidden="true" />
      <div className="cs-orb cs-orb-2" aria-hidden="true" />
      <div className="cs-grid" aria-hidden="true" />

      <div className="cs-content">
        <p className="cs-kicker">Something intriguing is on the way</p>
        <h1 className="cs-title">
          We are building
          <span>the next chapter.</span>
        </h1>

        <p className="cs-subtitle">
          Not ready to reveal. Definitely ready to impress.
        </p>

        <ul className="cs-teasers" aria-label="Teaser details">
          {teaserLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        <div className="cs-pulse-wrap" aria-hidden="true">
          <span className="cs-pulse-dot" />
          <span className="cs-pulse-line" />
          <span className="cs-pulse-dot" />
        </div>
      </div>
    </section>
  )
}

export default ComingSoon
