import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Icon = ({ name }) => {
  switch (name) {
    case 'home':
      return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    case 'user':
      return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    case 'projects':
      return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg>)
    case 'message':
      return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    case 'admin':
      return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06A2 2 0 0 1 2.28 16.9l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09c.7 0 1.27-.43 1.51-1a1.65 1.65 0 0 0-.33-1.82L4.3 3.7A2 2 0 0 1 7.13.87l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V.09A2 2 0 0 1 14 0v.09c.3.2.6.3 1 .3h.09a1.65 1.65 0 0 0 1.51 1c.7 0 1.27.43 1.51 1a1.65 1.65 0 0 0 .33 1.82l.06.06A2 2 0 0 1 21.73 7.13l-.06.06a1.65 1.65 0 0 0-.33 1.82c.2.5.3 1 .3 1.51V11c0 .5-.1 1-.3 1.51z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>)
    default:
      return null
  }
}

const BottomNav = () => {
  const location = useLocation()
  const active = (path) => {
    if (path === '/') return location.pathname === '/' && !location.hash
    return location.pathname === '/' && location.hash === path
  }

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <Link to="/" className={`bn-item ${active('/') ? 'active' : ''}`}>
        <Icon name="home" />
        <span>Home</span>
      </Link>
      <a href="/#about" className={`bn-item ${active('#about') ? 'active' : ''}`}>
        <Icon name="user" />
        <span>About</span>
      </a>
      <a href="/#projects" className={`bn-item ${active('#projects') ? 'active' : ''}`}>
        <Icon name="projects" />
        <span>Work</span>
      </a>
      <a href="/#contact" className={`bn-item ${active('#contact') ? 'active' : ''}`}>
        <Icon name="message" />
        <span>Contact</span>
      </a>
      <Link to="/admin" className={`bn-item ${location.pathname === '/admin' ? 'active' : ''}`}>
        <Icon name="admin" />
        <span>Admin</span>
      </Link>
    </nav>
  )
}

export default BottomNav
