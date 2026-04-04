import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

// Components
import Portfolio from './Portfolio'
import Admin from './Admin'
import Login from './Login'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio />} />
        <Route path="/admin" element={user ? <Admin /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
      </Routes>
    </Router>
  )
}

export default App
