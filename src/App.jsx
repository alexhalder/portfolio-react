import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

// Components
import Portfolio from './Portfolio'
import Admin from './Admin'
import Login from './Login'
import BottomNav from './BottomNav'
import GlassBreak from './GlassBreak'
import Cursor from './Cursor'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showGlass, setShowGlass] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  return (
    <>
      {/* Glass break plays for 3 seconds on every visit */}
      {showGlass && <GlassBreak onDone={() => setShowGlass(false)} />}

      {!loading && (
        <Router>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
          </Routes>
          <BottomNav />
          <Cursor />
        </Router>
      )}
    </>
  )
}

export default App
