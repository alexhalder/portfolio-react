import React, { useEffect, useRef, useState } from 'react'

export default function VideoIntro({ onDone }) {
  const videoRef = useRef(null)
  const overlayRef = useRef(null)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Trigger fade-in animation after component mounts
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoEnd = () => {
      if (onDone) onDone()
    }

    const handleTimeUpdate = () => {
      // Get fade duration (0.8 seconds)
      const fadeDuration = 0.8
      const fadeStartTime = video.duration - fadeDuration

      // Start fade-out when 0.8 seconds remain
      if (video.currentTime >= fadeStartTime && !isFadingOut) {
        setIsFadingOut(true)
      }
    }

    video.addEventListener('ended', handleVideoEnd)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.play()

    return () => {
      video.removeEventListener('ended', handleVideoEnd)
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [onDone, isFadingOut])

  return (
    <div 
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        overflow: 'hidden',
        background: '#000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: isFadingOut ? 0 : (isMounted ? 1 : 0),
        transition: 'opacity 0.8s ease-out',
      }}>
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
        autoPlay
        muted
      >
        <source src="/alex-animation.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
