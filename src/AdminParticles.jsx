import React, { useRef, useEffect } from 'react'

const rand = (min, max) => Math.random() * (max - min) + min

export default function AdminParticles({ count = 80, color = '255,255,255' }) {
  const ref = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let dpr = window.devicePixelRatio || 1
    let width = 0
    let height = 0
    let particles = []

    function resize() {
      dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function createParticles() {
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: rand(0, width),
          y: rand(0, height),
          vx: rand(-0.06, 0.06),
          vy: rand(-0.02, 0.12),
          r: rand(0.4, 2.4),
          alpha: rand(0.2, 0.95),
          twinkle: Math.random() * Math.PI * 2
        })
      }
    }

    function step() {
      ctx.clearRect(0, 0, width, height)

      // subtle glow overlay
      ctx.fillStyle = 'rgba(10,12,20,0.35)'
      ctx.fillRect(0, 0, width, height)

      for (let p of particles) {
        p.x += p.vx
        p.y += p.vy

        // wrap
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        p.twinkle += 0.02
        const alpha = Math.max(0.07, Math.min(1, p.alpha + Math.sin(p.twinkle) * 0.2))

        ctx.beginPath()
        ctx.fillStyle = `rgba(${color}, ${alpha})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(step)
    }

    function start() {
      resize()
      createParticles()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(step)
    }

    function handleResize() {
      resize()
      createParticles()
    }

    start()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [count, color])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    />
  )
}
