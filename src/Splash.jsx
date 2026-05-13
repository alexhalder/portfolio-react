import React from 'react'

export default function Splash({ message = 'Welcome', subtitle = 'Opening portfolio…' }) {
  return (
    <div className="splash-overlay" role="status" aria-live="polite">
      <div className="splash-card">
        <div className="splash-brand">
          <svg className="splash-ring" viewBox="0 0 100 100" aria-hidden>
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            <circle className="ring-bg" cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle className="ring" cx="50" cy="50" r="40" fill="none" stroke="url(#g1)" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <div className="splash-logo">A</div>
        </div>

        <h1 className="splash-title">{message}</h1>
        <p className="splash-sub">{subtitle}</p>
      </div>
    </div>
  )
}

