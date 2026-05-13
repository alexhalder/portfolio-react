import React, { useEffect, useRef } from 'react'

export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const rafRef = useRef(null)
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, tx: window.innerWidth / 2, ty: window.innerHeight / 2 })

  useEffect(() => {
    // disable on touch devices
    if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    function onMove(e) {
      const cx = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || pos.current.tx
      const cy = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || pos.current.ty
      // immediate dot
      dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`
      // target for ring lerp
      pos.current.tx = cx
      pos.current.ty = cy
    }

    function onDown() {
      dot.classList.add('cursor-down')
      ring.classList.add('cursor-down')
    }
    function onUp() {
      dot.classList.remove('cursor-down')
      ring.classList.remove('cursor-down')
    }

    function onHover(e) {
      const target = e.target
      const isInteractive = target.closest && target.closest('a, button, input, textarea, .btn, [data-cursor]')
      if (isInteractive) {
        dot.classList.add('cursor-hover')
        ring.classList.add('cursor-hover')
      } else {
        dot.classList.remove('cursor-hover')
        ring.classList.remove('cursor-hover')
      }
    }

    function loop() {
      pos.current.x += (pos.current.tx - pos.current.x) * 0.14
      pos.current.y += (pos.current.ty - pos.current.y) * 0.14
      ring.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`
      rafRef.current = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mouseover', onHover)

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mouseover', onHover)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="custom-cursor" aria-hidden>
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  )
}
