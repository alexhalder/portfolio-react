import React, { useState } from 'react'
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth'
import { auth } from './firebase'
import { useNavigate } from 'react-router-dom'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

const Login = () => {
    const [email, setEmail] = useState('alexhalder2007@gmail.com') // Default admin email
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [showPasswordFallback, setShowPasswordFallback] = useState(false)
    const navigate = useNavigate()

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'; // Uses env variable in production

    // Traditional Email/Password Login
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate('/admin')
        } catch (err) {
            setError('Invalid email or password')
        }
    }

    // 1. Passkey Login Flow
    const handlePasskeyLogin = async () => {
        setError('');
        setStatus('Generating login challenge...');
        try {
            const resp = await fetch(`${API_URL}/passkey/login-challenge`);
            if (resp.status === 404) {
                setError('No Passkey is registered yet. Please setup your passkey first.');
                setStatus('');
                return;
            }
            
            const options = await resp.json();
            
            if (options.error) {
                setError(`Backend Error: ${options.error}`);
                setStatus('');
                return;
            }
            
            setStatus('Please scan your fingerprint/FaceID...');
            
            // Trigger native fingerprint/face id prompt
            const authResp = await startAuthentication(options);
            
            setStatus('Verifying signature...');
            const verificationResp = await fetch(`${API_URL}/passkey/login-verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResp)
            });
            
            const verification = await verificationResp.json();
            
            if (verification.verified && verification.token) {
                setStatus('Logging into Firebase...');
                // Use the custom token to log into Firebase Auth!
                await signInWithCustomToken(auth, verification.token);
                navigate('/admin');
            } else {
                setError(verification.error || 'Passkey verification failed.');
                setStatus('');
            }
        } catch (err) {
            console.error(err);
            if (err.name !== 'NotAllowedError') { // User didn't cancel
                setError(err.message || 'Error during passkey login');
            }
            setStatus('');
        }
    }



    return (
        <div className="login-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0f1d' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '50px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', width: '100%', maxWidth: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: '#3498db', marginBottom: '10px' }}><i className="fas fa-fingerprint"></i></div>
                <h2 style={{ color: '#fff', marginBottom: '8px' }}>Admin Access</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginBottom: '30px' }}>Use your Passkey to securely log in.</p>
                
                {error && <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>{error}</div>}
                {status && <div style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>{status}</div>}

                <button 
                    onClick={handlePasskeyLogin} 
                    style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #3498db, #2980b9)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 15px rgba(52, 152, 219, 0.3)' }}
                >
                    <i className="fas fa-fingerprint"></i> Login with Passkey
                </button>

                <div style={{ position: 'relative', margin: '20px 0' }}>
                    <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <span style={{ position: 'relative', background: '#0f1626', padding: '0 15px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>OR</span>
                </div>

                {!showPasswordFallback ? (
                    <button onClick={() => setShowPasswordFallback(true)} style={{ background: 'none', border: 'none', color: '#3498db', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}>
                        Use Email & Password Instead
                    </button>
                ) : (
                    <form onSubmit={handleSubmit} style={{ textAlign: 'left', animation: 'fadeIn 0.3s ease' }}>
                        <div className="form-group">
                            <label style={{ color: '#ecf0f1', fontSize: '0.85rem' }}>Email</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', marginTop: '5px' }} required />
                        </div>
                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label style={{ color: '#ecf0f1', fontSize: '0.85rem' }}>Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white', marginTop: '5px' }} required />
                        </div>
                        <button type="submit" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Login
                        </button>
                    </form>
                )}
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}

export default Login
