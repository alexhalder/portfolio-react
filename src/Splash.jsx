import React from 'react'

export default function Splash({ message = 'Welcome', subtitle = "Welcome to my portfolio" }) {
  return (
    <div className="splash-overlay" role="status" aria-live="polite">
      <div className="splash-inner">
        <h1 className="splash-title">{message}</h1>
        <p className="splash-sub">{subtitle}</p>
        <div className="splash-loader" aria-hidden />
      </div>
    </div>
  )
}
