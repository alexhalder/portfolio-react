import React, { useRef, useEffect } from 'react'
import AdminParticles from './AdminParticles'

export default function Splash({ message = 'Welcome', subtitle = 'Opening portfolio…' }) {
  const cardRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    function onMove(e) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      const rotX = (-dy * 6).toFixed(2)
      const rotY = (dx * 8).toFixed(2)
      el.style.transform = `translateZ(24px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`
    }

    function onLeave() { el.style.transform = 'translateZ(0) rotateX(0) rotateY(0) scale(1)' }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseout', onLeave)
    window.addEventListener('touchend', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseout', onLeave)
      window.removeEventListener('touchend', onLeave)
    }
  }, [])

  return (
    <div className="splash-overlay" role="status" aria-live="polite">
      <AdminParticles count={60} color="200,220,255" />
      <div className="splash-card" ref={cardRef}>
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


