import { useEffect, useRef } from 'react'

/**
 * useScrollReveal Hook
 * Applies scroll reveal animations to an element
 * 
 * Usage:
 * const ref = useScrollReveal('fade-bottom');
 * <div ref={ref} className="content">...</div>
 */
export default function useScrollReveal(effectClass = 'fade-bottom', threshold = 0.1) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Add the effect class if it doesn't have the reveal class
    if (!element.classList.contains('reveal')) {
      element.classList.add('reveal')
    }

    // Add the effect class (e.g., fade-bottom)
    if (effectClass && !element.classList.contains(effectClass)) {
      element.classList.add(effectClass)
    }

    // Create intersection observer
    const observerOptions = { threshold }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        } else {
          entry.target.classList.remove('active')
        }
      })
    }, observerOptions)

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [effectClass, threshold])

  return ref
}
