import React, { useEffect, useState } from 'react'

const CRACKS = [
  // Main crack lines radiating from center
  { x1: 50, y1: 50, x2: 12, y2: 8 },
  { x1: 50, y1: 50, x2: 88, y2: 5 },
  { x1: 50, y1: 50, x2: 98, y2: 45 },
  { x1: 50, y1: 50, x2: 92, y2: 95 },
  { x1: 50, y1: 50, x2: 55, y2: 100 },
  { x1: 50, y1: 50, x2: 20, y2: 98 },
  { x1: 50, y1: 50, x2: 2, y2: 70 },
  { x1: 50, y1: 50, x2: 5, y2: 28 },
  // Secondary cracks branching
  { x1: 30, y1: 28, x2: 8, y2: 8 },
  { x1: 30, y1: 28, x2: 45, y2: 5 },
  { x1: 72, y1: 26, x2: 88, y2: 5 },
  { x1: 72, y1: 26, x2: 98, y2: 20 },
  { x1: 80, y1: 72, x2: 98, y2: 70 },
  { x1: 80, y1: 72, x2: 92, y2: 95 },
  { x1: 35, y1: 78, x2: 20, y2: 98 },
  { x1: 35, y1: 78, x2: 50, y2: 100 },
  { x1: 14, y1: 58, x2: 2, y2: 70 },
  { x1: 14, y1: 58, x2: 5, y2: 42 },
]

// Shatter fragments (glass shards)
const FRAGMENTS = [
  { points: '50,50 12,8 30,28', delay: 0.4 },
  { points: '50,50 30,28 8,8', delay: 0.45 },
  { points: '50,50 8,8 5,28', delay: 0.5 },
  { points: '50,50 5,28 2,70', delay: 0.55 },
  { points: '50,50 2,70 14,58', delay: 0.5 },
  { points: '50,50 14,58 20,98', delay: 0.6 },
  { points: '50,50 20,98 35,78', delay: 0.65 },
  { points: '50,50 35,78 55,100', delay: 0.6 },
  { points: '50,50 55,100 92,95', delay: 0.7 },
  { points: '50,50 92,95 80,72', delay: 0.75 },
  { points: '50,50 80,72 98,70', delay: 0.7 },
  { points: '50,50 98,70 98,45', delay: 0.8 },
  { points: '50,50 98,45 88,5', delay: 0.75 },
  { points: '50,50 88,5 72,26', delay: 0.85 },
  { points: '50,50 72,26 45,5', delay: 0.9 },
  { points: '50,50 45,5 12,8', delay: 0.85 },
]

export default function GlassBreak({ onDone }) {
  const [phase, setPhase] = useState('solid')   // solid -> crack -> shatter -> done
  const [crackCount, setCrackCount] = useState(0)

  useEffect(() => {
    // Phase 1: Start cracking after 0.5s
    const t1 = setTimeout(() => setPhase('crack'), 500)
    // Phase 2: Grow cracks over time
    let i = 0
    const crackInterval = setInterval(() => {
      i++
      setCrackCount(i)
      if (i >= CRACKS.length) clearInterval(crackInterval)
    }, 40)
    // Phase 3: Shatter at ~2s
    const t2 = setTimeout(() => setPhase('shatter'), 1800)
    // Phase 4: Remove at 3s
    const t3 = setTimeout(() => {
      setPhase('done')
      if (onDone) onDone()
    }, 3000)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      clearInterval(crackInterval)
    }
  }, [onDone])

  if (phase === 'done') return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: phase === 'shatter'
        ? 'transparent'
        : 'linear-gradient(135deg, #0a0f1d 0%, #111827 50%, #0d1526 100%)',
      transition: 'background 0.3s',
      overflow: 'hidden',
      pointerEvents: phase === 'shatter' ? 'none' : 'all',
    }}>

      {/* Glass layer */}
      <div style={{
        position: 'absolute', inset: 0,
        backdropFilter: phase === 'shatter' ? 'blur(0px)' : 'blur(14px)',
        background: phase === 'shatter'
          ? 'transparent'
          : 'rgba(255,255,255,0.04)',
        transition: 'all 0.4s ease',
      }} />

      {/* SVG Cracks overlay */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: phase === 'shatter' ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Glass tint */}
        <rect x="0" y="0" width="100" height="100"
          fill="rgba(160,200,255,0.05)" />

        {/* Highlight shimmer */}
        <rect x="0" y="0" width="100" height="50"
          fill="rgba(255,255,255,0.03)" />

        {/* Crack lines */}
        {CRACKS.slice(0, crackCount).map((c, idx) => (
          <line key={idx}
            x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
            stroke="rgba(200,230,255,0.9)"
            strokeWidth="0.35"
            filter="url(#glow)"
            style={{
              animation: 'crackIn 0.12s ease-out forwards',
            }}
          />
        ))}

        {/* Impact point glow */}
        {phase !== 'solid' && (
          <circle cx="50" cy="50" r="1.2"
            fill="rgba(100,180,255,0.9)"
            filter="url(#glow)"
          />
        )}
      </svg>

      {/* Shatter fragments */}
      {phase === 'shatter' && FRAGMENTS.map((f, idx) => {
        const angle = (idx / FRAGMENTS.length) * 360
        const dist = 60 + Math.random() * 80
        return (
          <div key={idx} style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none',
          }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none"
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%',
                animation: `shardFly 0.9s cubic-bezier(0.25,0.46,0.45,0.94) ${f.delay * 0.4}s forwards`,
                '--angle': `${angle}deg`,
                '--dist': `${dist}px`,
              }}>
              <defs>
                <linearGradient id={`fg${idx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(180,220,255,0.4)" />
                  <stop offset="100%" stopColor="rgba(100,160,240,0.15)" />
                </linearGradient>
              </defs>
              <polygon
                points={f.points}
                fill={`url(#fg${idx})`}
                stroke="rgba(200,230,255,0.8)"
                strokeWidth="0.2"
              />
            </svg>
          </div>
        )
      })}

      {/* Center logo / text */}
      {phase !== 'shatter' && (
        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center',
          opacity: phase === 'solid' ? 0 : 1,
          transform: phase === 'solid' ? 'scale(0.8)' : 'scale(1)',
          transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(45,212,191,0.2), rgba(124,58,237,0.2))',
            border: '1.5px solid rgba(200,230,255,0.3)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32, fontWeight: 800, color: 'rgba(255,255,255,0.9)',
            fontFamily: 'Inter, system-ui, sans-serif',
            boxShadow: '0 0 30px rgba(100,180,255,0.2)',
          }}>
            A
          </div>
          <p style={{
            color: 'rgba(200,230,255,0.7)', fontSize: 13,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>Alex Halder</p>
        </div>
      )}

      <style>{`
        @keyframes crackIn {
          from { stroke-dasharray: 200; stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dasharray: 200; stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes shardFly {
          0%   { opacity: 1; transform: translate(0,0) rotate(0deg) scale(1); }
          100% { opacity: 0; transform: 
            translate(calc(cos(var(--angle)) * var(--dist)), calc(sin(var(--angle)) * var(--dist)))
            rotate(calc(var(--angle) * 0.5))
            scale(0.3); }
        }
      `}</style>
    </div>
  )
}
