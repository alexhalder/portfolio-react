import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'
import { useNavigate } from 'react-router-dom'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/admin')
        } catch (err) {
            setError('Invalid email or password')
        }
    }

    return (
        <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0d1b2a' }}>
            <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', width: '100%', maxWidth: '400px' }}>
                <h2 style={{ color: '#3498db', marginBottom: '20px', textAlign: 'center' }}>Admin Login</h2>
                {error && <p style={{ color: '#e74c3c', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}
                <div className="form-group">
                    <label style={{ color: '#ecf0f1' }}>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', marginTop: '5px' }} 
                        required 
                    />
                </div>
                <div className="form-group" style={{ marginTop: '20px' }}>
                    <label style={{ color: '#ecf0f1' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: 'white', marginTop: '5px' }} 
                        required 
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '12px', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', marginTop: '30px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Login
                </button>
            </form>
        </div>
    )
}

export default Login
