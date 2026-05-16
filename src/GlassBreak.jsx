import React, { useEffect, useState, useMemo } from 'react'

/* ─── Generate random cracks radiating from impact point ─── */
function generateCracks(count = 14, cx = 50, cy = 45) {
  const cracks = []
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
    const len = 30 + Math.random() * 45
    const bend = (Math.random() - 0.5) * 18
    const ex = cx + Math.cos(angle) * len
    const ey = cy + Math.sin(angle) * len
    const mx = (cx + ex) / 2 + Math.cos(angle + Math.PI / 2) * bend
    const my = (cy + ey) / 2 + Math.sin(angle + Math.PI / 2) * bend
    // secondary crack
    const secAngle = angle + (Math.random() - 0.5) * 1.2
    const secLen = 10 + Math.random() * 25
    cracks.push({
      path: `M${cx},${cy} Q${mx},${my} ${ex},${ey}`,
      delay: i * 35,
      ex, ey,
      sec: `M${ex},${ey} L${ex + Math.cos(secAngle)*secLen},${ey + Math.sin(secAngle)*secLen}`
    })
  }
  return cracks
}

/* ─── Generate Voronoi-like shards ─── */
function generateShards(cracks, cx, cy) {
  const pts = cracks.map(c => ({ x: c.ex, y: c.ey }))
  pts.push({ x: cx, y: cy })
  const shards = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % (pts.length - 1)]
    const jitter = () => (Math.random() - 0.5) * 6
    shards.push({
      points: `${cx},${cy} ${a.x + jitter()},${a.y + jitter()} ${b.x + jitter()},${b.y + jitter()}`,
      angle: Math.atan2((a.y + b.y) / 2 - cy, (a.x + b.x) / 2 - cx),
      dist: 55 + Math.random() * 80,
      rotSpeed: (Math.random() - 0.5) * 600,
      delay: 0.05 + Math.random() * 0.3,
    })
  }
  return shards
}

export default function GlassBreak({ onDone }) {
  const [phase, setPhase] = useState('hold')      // hold → crack → shatter → done
  const [cracksVisible, setCracksVisible] = useState(0)

  const cracks = useMemo(() => generateCracks(16, 50, 45), [])
  const shards = useMemo(() => generateShards(cracks, 50, 45), [cracks])

  useEffect(() => {
    // Phase 1: impact flash + crack spread
    const t1 = setTimeout(() => setPhase('crack'), 600)

    let i = 0
    const iv = setInterval(() => {
      i++
      setCracksVisible(i)
      if (i >= cracks.length) clearInterval(iv)
    }, 38)

    // Phase 2: shatter
    const t2 = setTimeout(() => setPhase('shatter'), 2000)

    // Phase 3: done
    const t3 = setTimeout(() => {
      setPhase('done')
      if (onDone) onDone()
    }, 3200)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearInterval(iv) }
  }, [onDone, cracks.length])

  if (phase === 'done') return null

  const isShatter = phase === 'shatter'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      overflow: 'hidden',
      background: 'linear-gradient(160deg, #060d1a 0%, #0d1a2f 50%, #060d1a 100%)',
    }}>

      {/* ── Frosted glass panel ── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(180,210,255,0.07) 0%, rgba(100,160,240,0.04) 40%, rgba(200,230,255,0.09) 100%)',
        backdropFilter: isShatter ? 'blur(0px)' : 'blur(18px)',
        WebkitBackdropFilter: isShatter ? 'blur(0px)' : 'blur(18px)',
        transition: 'backdrop-filter 0.2s, opacity 0.4s',
        opacity: isShatter ? 0 : 1,
        pointerEvents: 'none',
      }} />

      {/* ── Reflection shimmer ── */}
      {!isShatter && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(118deg, transparent 30%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 70%)',
          animation: 'shimmerMove 2.5s ease-in-out infinite alternate',
        }} />
      )}

      {/* ── SVG crack layer ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          opacity: isShatter ? 0 : 1,
          transition: 'opacity 0.25s',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="gf" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.25" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
          <filter id="hf" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="0.6"/>
          </filter>

          {/* Glass edge highlight along crack */}
          <linearGradient id="crackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
            <stop offset="50%" stopColor="rgba(180,220,255,0.7)" />
            <stop offset="100%" stopColor="rgba(100,180,255,0.4)" />
          </linearGradient>
        </defs>

        {/* Glass tint */}
        <rect x="0" y="0" width="100" height="100" fill="rgba(140,190,255,0.035)" />

        {/* Main crack lines */}
        {cracks.slice(0, cracksVisible).map((c, i) => (
          <g key={i}>
            {/* Glow halo under crack */}
            <path d={c.path} fill="none"
              stroke="rgba(160,210,255,0.35)" strokeWidth="1.2"
              filter="url(#hf)" strokeLinecap="round"/>
            {/* Main crack - bright edge highlight */}
            <path d={c.path} fill="none"
              stroke="url(#crackGrad)" strokeWidth="0.3"
              filter="url(#gf)" strokeLinecap="round"
              style={{ animation: `crackDraw 0.1s ease-out both` }}
            />
            {/* Dark shadow side of crack */}
            <path d={c.path} fill="none"
              stroke="rgba(0,10,30,0.6)" strokeWidth="0.15"
              strokeLinecap="round"
              strokeDasharray="0.5 0.5"
            />
            {/* Secondary crack */}
            {cracksVisible > i + 4 && (
              <path d={c.sec} fill="none"
                stroke="rgba(220,235,255,0.55)" strokeWidth="0.2"
                strokeLinecap="round"
              />
            )}
          </g>
        ))}

        {/* Impact point - concentric rings */}
        {phase !== 'hold' && (
          <g>
            <circle cx="50" cy="45" r="3"
              fill="none" stroke="rgba(200,230,255,0.4)" strokeWidth="0.4"
              style={{ animation: 'impactRing 0.6s ease-out forwards' }}/>
            <circle cx="50" cy="45" r="1.5"
              fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5"
              style={{ animation: 'impactRing 0.4s 0.1s ease-out forwards' }}/>
            <circle cx="50" cy="45" r="0.7"
              fill="rgba(255,255,255,0.95)" filter="url(#hf)"/>
          </g>
        )}
      </svg>

      {/* ── Shattering shards ── */}
      {isShatter && shards.map((s, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          animation: `shardFall 1.1s cubic-bezier(0.36,0.07,0.19,0.97) ${s.delay}s both`,
          '--tx': `${Math.cos(s.angle) * s.dist}px`,
          '--ty': `${Math.sin(s.angle) * s.dist}px`,
          '--rot': `${s.rotSpeed}deg`,
        }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
            <defs>
              <linearGradient id={`sg${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(220,240,255,0.55)" />
                <stop offset="60%" stopColor="rgba(150,200,255,0.2)" />
                <stop offset="100%" stopColor="rgba(80,150,240,0.08)" />
              </linearGradient>
              <linearGradient id={`sh${i}`} x1="0%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            {/* Shard body */}
            <polygon points={s.points}
              fill={`url(#sg${i})`}
              stroke="rgba(200,230,255,0.8)" strokeWidth="0.25"
            />
            {/* Specular highlight on shard */}
            <polygon points={s.points}
              fill={`url(#sh${i})`}
              opacity="0.6"
            />
          </svg>
        </div>
      ))}

      {/* ── Center logo ── */}
      {!isShatter && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10, textAlign: 'center',
          opacity: phase === 'hold' ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(124,58,237,0.15))',
            border: '1px solid rgba(180,220,255,0.25)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
            fontSize: 28, fontWeight: 800,
            color: 'rgba(220,240,255,0.95)',
            fontFamily: "'Inter', system-ui, sans-serif",
            boxShadow: '0 0 40px rgba(80,160,255,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
            letterSpacing: '-1px',
          }}>A</div>
          <p style={{
            color: 'rgba(180,215,255,0.6)',
            fontSize: 11, letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}>Alex Halder</p>
        </div>
      )}

      {/* ── Impact flash ── */}
      {phase === 'crack' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 45%, rgba(200,230,255,0.3) 0%, transparent 50%)',
          animation: 'impactFlash 0.35s ease-out forwards',
        }} />
      )}

      <style>{`
        @keyframes shimmerMove {
          from { background-position: -200% 0; }
          to   { background-position: 200% 0; }
        }
        @keyframes crackDraw {
          from { stroke-dasharray: 200; stroke-dashoffset: 200; }
          to   { stroke-dasharray: 200; stroke-dashoffset: 0; }
        }
        @keyframes impactRing {
          from { r: 0; opacity: 1; }
          to   { r: 8; opacity: 0; }
        }
        @keyframes impactFlash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes shardFall {
          0%   { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          30%  { opacity: 0.9; }
          100% { transform: translate(var(--tx), var(--ty)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
