import React, { useEffect, useRef } from 'react'

export default function VideoIntro({ onDone }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoEnd = () => {
      if (onDone) onDone()
    }

    video.addEventListener('ended', handleVideoEnd)
    video.play()

    return () => {
      video.removeEventListener('ended', handleVideoEnd)
    }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      overflow: 'hidden',
      background: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
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
