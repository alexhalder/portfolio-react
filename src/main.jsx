import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css'

// mark mobile view early to avoid nav animation/flash on small devices
function setMobileViewClass() {
  try {
    if (window.innerWidth <= 900) document.body.classList.add('mobile-view')
    else document.body.classList.remove('mobile-view')
  } catch (e) {}
}

setMobileViewClass()
window.addEventListener('resize', setMobileViewClass)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
