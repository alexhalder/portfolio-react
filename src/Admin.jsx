import React, { useState, useEffect } from 'react'
import AdminParticles from './AdminParticles'
import { db, auth } from './firebase'
import { collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'

const Admin = () => {
    const [data, setData] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()

    const handleLogout = async () => {
        try {
            await signOut(auth)
            navigate('/login')
        } catch (err) {
            console.error('Logout failed:', err)
            setMessage('Logout failed. Please try again.')
        }
    }

    // Auto-logout after configured minutes of inactivity
    useEffect(() => {
        let inactivityTimer;
        
        // Default to 30 minutes if not set
        const timeoutMinutes = (data?.settings?.autoLogoutMinutes && !isNaN(data.settings.autoLogoutMinutes)) 
            ? parseInt(data.settings.autoLogoutMinutes, 10) 
            : 30;
        const timeoutMs = timeoutMinutes * 60 * 1000;

        const logoutUser = () => {
            console.log(`User inactive for ${timeoutMinutes}m, logging out...`);
            handleLogout();
        };

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(logoutUser, timeoutMs);
        };

        // Events that indicate activity
        const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => document.addEventListener(event, resetTimer));
        resetTimer(); // Start the timer initially

        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [data?.settings?.autoLogoutMinutes]); // Re-run when setting changes


    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "portfolioData"));
                const docData = {};
                
                const defaultData = {
                    hero: { name: "ALEX", headline: "I'm a passionate static web Developer...", jobTitle: "Static Developer", siteName: "Portfolio", tabTitle: "Alex | Portfolio" },
                    about: { text1: "I'm a dedicated...", text2: "When I'm not coding...", text3: "I believe in..." },
                    settings: { showModel: true, showTechCube: true, enableRain: true, autoLogoutMinutes: 30 },
                    education: { items: [] },
                    skills: { items: [] },
                    projects: { items: [] },
                    socials: { items: [] },
                    contact: { email: "alexhalder2007@gmail.com", phone: "+880 1913520955", location: "Khulna, G.P.O-9000" }
                };

                if (querySnapshot.empty) {
                    setData(defaultData);
                } else {
                    querySnapshot.forEach((doc) => {
                        docData[doc.id] = doc.data();
                    });
                    // Deep protective merge
                    const mergedData = { ...defaultData };
                    Object.keys(docData).forEach(key => {
                        mergedData[key] = { ...defaultData[key], ...docData[key] };
                    });
                    setData(mergedData);
                }
                setLoading(false);
            } catch (err) {
                console.error("Critical error fetching admin data:", err);
                setMessage("Could not connect to Firestore.");
                setLoading(false);
            }
        }
        fetchData();
    }, [])

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const msgSnapshot = await getDocs(collection(db, "messages"));
                const msgList = msgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMessages(msgList);
            } catch (e) { console.error(e); }
        }
        if (data) fetchMessages();
    }, [data]);

    // toggle admin-mode class on body to hide global nav and enable admin-specific styles
    useEffect(() => {
        document.body.classList.add('admin-mode')
        return () => document.body.classList.remove('admin-mode')
    }, [])

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const sections = ['hero', 'about', 'settings', 'education', 'skills', 'contact', 'socials', 'projects'];
            for (const section of sections) {
                if (data[section]) {
                    await setDoc(doc(db, "portfolioData", section), data[section]);
                }
            }
            setMessage('Changes saved successfully! 🎉');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    }

    const updateNestedData = (section, field, value) => {
        setData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    }

    const updateListItem = (section, index, field, value) => {
        const newList = [...(data[section].items || [])];
        newList[index] = { ...newList[index], [field]: value };
        
        // Auto-color skills icon logic
        if (section === 'skills' && field === 'icon') {
            const brandColors = { 'python': '#3776AB', 'js-square': '#F7DF1E', 'react': '#61DAFB', 'html5': '#E34F26', 'css3-alt': '#1572B6', 'php': '#777BB4', 'java': '#ED8B00', 'node-js': '#339933', 'database': '#003B57', 'code': '#3498db', 'terminal': '#000000', 'github': '#181717', 'aws': '#FF9900', 'docker': '#2496ED', 'git': '#F05032', 'npm': '#CB3837' };
            const iconName = (value || '').toLowerCase();
            if (brandColors[iconName]) newList[index].color = brandColors[iconName];
        }

        // Auto-fill skill level based on percent
        if (section === 'skills' && field === 'percent') {
            const pct = parseInt(value, 10);
            if (!isNaN(pct)) {
                if (pct >= 90) newList[index].level = 'Expert';
                else if (pct >= 70) newList[index].level = 'Advanced';
                else if (pct >= 40) newList[index].level = 'Intermediate';
                else newList[index].level = 'Beginner';
            } else if (value === '') {
                newList[index].level = '';
            }
        }
        
        setData(prev => ({ ...prev, [section]: { ...prev[section], items: newList } }));
    }

    const addItem = (section, newItem) => {
        const currentItems = data[section].items || [];
        setData(prev => ({ ...prev, [section]: { ...prev[section], items: [...currentItems, newItem] } }));
    }

    const removeItem = (section, index) => {
        const newList = (data[section].items || []).filter((_, i) => i !== index);
        setData(prev => ({ ...prev, [section]: { ...prev[section], items: newList } }));
    }

    const deleteMessage = async (id) => {
        if (window.confirm("Delete message?")) {
            await deleteDoc(doc(db, "messages", id));
            setMessages(messages.filter(m => m.id !== id));
        }
    }

    // Three-pane UI state
    const [activeSection, setActiveSection] = useState('identity')
    const [selectedItemIndex, setSelectedItemIndex] = useState(0)

    const sectionsMeta = [
        { id: 'identity', label: 'Identity & Branding' },
        { id: 'hero', label: 'Hero' },
        { id: 'about', label: 'About' },
        { id: 'settings', label: 'Settings' },
        { id: 'skills', label: 'Skills' },
        { id: 'projects', label: 'Projects' },
        { id: 'education', label: 'Education' },
        { id: 'socials', label: 'Socials' },
        { id: 'inbox', label: 'Inbox' }
    ];

    const selectSection = (id) => { setActiveSection(id); setSelectedItemIndex(0); }

    const renderDetail = (section) => {
        if (!data) return <div>Loading...</div>

        switch (section) {
            case 'identity':
                return (
                    <>
                        <h4 style={{marginBottom: '12px', color: '#9fb8d9'}}>Identity Preview</h4>
                        <div style={{display: 'grid', gap: '12px'}}>
                            <InputField label="Site Name" value={data.hero?.siteName} onChange={(v) => updateNestedData('hero', 'siteName', v)} />
                            <InputField label="Tab Title" value={data.hero?.tabTitle} onChange={(v) => updateNestedData('hero', 'tabTitle', v)} />
                            <ImageField label="Tab Icon (Favicon URL)" value={data.hero?.faviconUrl} onChange={(v) => updateNestedData('hero', 'faviconUrl', v)} />
                            <ImageField label="Site Logo/Image" value={data.hero?.siteImage} onChange={(v) => updateNestedData('hero', 'siteImage', v)} />
                        </div>
                    </>
                )
            case 'hero':
                return (
                    <>
                        <h4 style={{marginBottom: '12px', color: '#9fb8d9'}}>Hero Preview</h4>
                        <div style={{display: 'grid', gap: '12px'}}>
                            <InputField label="Name" value={data.hero?.name} onChange={(v) => updateNestedData('hero', 'name', v)} />
                            <InputField label="Job Title" value={data.hero?.jobTitle} onChange={(v) => updateNestedData('hero', 'jobTitle', v)} />
                            <label style={labelStyle}>Intro Headline</label>
                            <textarea style={textareaStyle} rows="3" value={data.hero?.headline} onChange={(e) => updateNestedData('hero', 'headline', e.target.value)} />
                            <ImageField label="Hero Background Image (bgUrl)" value={data.hero?.bgUrl} onChange={(v) => updateNestedData('hero', 'bgUrl', v)} />
                            <ImageField label="Hero Mobile Background (mobileBgUrl)" value={data.hero?.mobileBgUrl} onChange={(v) => updateNestedData('hero', 'mobileBgUrl', v)} />
                            <ImageField label="Profile Image (imageUrl)" value={data.hero?.imageUrl} onChange={(v) => updateNestedData('hero', 'imageUrl', v)} />
                        </div>
                    </>
                )
            case 'about':
                return (
                    <>
                        <h4 style={{marginBottom: '12px', color: '#9fb8d9'}}>About</h4>
                        <div style={{display: 'grid', gap: '12px'}}>
                            <textarea style={textareaStyle} rows="2" value={data.about?.text1} onChange={(e) => updateNestedData('about', 'text1', e.target.value)} />
                            <textarea style={textareaStyle} rows="2" value={data.about?.text2} onChange={(e) => updateNestedData('about', 'text2', e.target.value)} />
                            <textarea style={textareaStyle} rows="2" value={data.about?.text3} onChange={(e) => updateNestedData('about', 'text3', e.target.value)} />
                        </div>
                    </>
                )
            case 'settings':
                return (
                    <>
                        <h4 style={{marginBottom: '12px', color: '#9fb8d9'}}>Settings</h4>
                        <div style={{display: 'flex', gap: '12px', flexDirection: 'column'}}>
                            <InputField label="Auto Logout Inactivity Timeout (Minutes)" value={data.settings?.autoLogoutMinutes || 30} onChange={(v) => updateNestedData('settings', 'autoLogoutMinutes', v)} />
                            <label style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <input type="checkbox" checked={!!data.settings?.showModel} onChange={(e) => updateNestedData('settings', 'showModel', e.target.checked)} />
                                <span style={{fontSize: '0.95rem'}}>Show About Model / Terminal</span>
                            </label>
                            <label style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <input type="checkbox" checked={!!data.settings?.showTechCube} onChange={(e) => updateNestedData('settings', 'showTechCube', e.target.checked)} />
                                <span style={{fontSize: '0.95rem'}}>Show Tech Cube</span>
                            </label>
                            <label style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                                <input type="checkbox" checked={!!data.settings?.enableRain} onChange={(e) => updateNestedData('settings', 'enableRain', e.target.checked)} />
                                <span style={{fontSize: '0.95rem'}}>Enable Coding Rain Background</span>
                            </label>
                        </div>
                    </>
                )
            case 'skills':
            case 'projects':
            case 'education':
            case 'socials':
                const defaultItem = (section) => {
                    if (section === 'projects') return { title: '', description: '', link: '', github: '', imageUrl: '' }
                    if (section === 'education') return { title: '', institution: '', dateRange: '', description: '' }
                    if (section === 'skills') return { name: '', level: '', percent: '', icon: '', color: '' }
                    if (section === 'socials') return { platform: '', url: '', icon: '' }
                    return {}
                }
                return (
                    <DynamicEditor 
                        title={section.charAt(0).toUpperCase() + section.slice(1)} 
                        section={section} 
                        items={data[section].items} 
                        updateListItem={updateListItem} 
                        removeItem={removeItem} 
                        addItem={() => addItem(section, defaultItem(section))} 
                    />
                )
            case 'inbox':
                return (
                    <AdminCard id="inbox" title={`Inbox Messages (${messages.length})`} color="#e67e22">
                        <div style={{display: mssagesGridStyle}}>
                            {messages.length === 0 ? <p style={{opacity: 0.4}}>No messages received yet.</p> : messages.map((m, i) => (
                                <div key={i} style={inboxItemStyle}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <strong style={{color: '#3498db'}}>{m.name}</strong>
                                        <button type="button" onClick={() => deleteMessage(m.id)} style={delBtnStyle}>Delete</button>
                                    </div>
                                    <div style={{fontSize: '0.8rem', opacity: 0.5, margin: '5px 0'}}>{m.email}</div>
                                    <p style={{fontSize: '0.9rem', opacity: 0.8, background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '5px'}}>{m.message}</p>
                                    <div style={{fontSize: '0.7rem', opacity: 0.3, marginTop: '5px'}}>{m.timestamp && m.timestamp.toDate ? m.timestamp.toDate().toLocaleString() : 'Recently'}</div>
                                </div>
                            ))}
                        </div>
                    </AdminCard>
                )
            default:
                return <div>Unknown section</div>
        }
    }

    if (loading) return <div style={loadingStyle}>Loading Dashboard...</div>
    if (!data) return <div style={loadingStyle}>Error loading data.</div>

    return (
        <div className="admin-content" style={adminContainerStyle}>
            <AdminParticles count={90} color="220,230,255" />
            {/* Minimal Mobile Header - matches site aesthetic */}
            <div className="mobile-header" style={mobileHeaderStyle}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px'}}>
                    <a href="/" style={{color: 'var(--primary)', textDecoration: 'none', fontWeight: 700}}>← Site</a>
                    <div style={{fontWeight: 700}}>Admin Dashboard</div>
                    <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#e74c3c', fontWeight: 700, cursor: 'pointer'}}>Logout</button>
                </div>
            </div>

            {/* Main Wrapper */}
            <div style={wrapperStyle}>
                {/* Sidebar */}
                <div style={sidebarStyle}>
                    <div style={logoAreaStyle}>
                        <h2 style={{fontSize: '1.4rem', color: '#3498db', marginBottom: '5px'}}>Admin Panel</h2>
                        <span style={{fontSize: '0.7rem', opacity: 0.5, letterSpacing: '1px'}}>DASHBOARD V2.0</span>
                    </div>
                        <nav style={sidebarNavStyle} aria-label="Admin Sections">
                            {sectionsMeta.map(s => (
                                <button key={s.id} onClick={() => selectSection(s.id)} style={{...sidebarNavItemStyle, textAlign: 'left', background: activeSection === s.id ? 'rgba(52,152,219,0.06)' : 'transparent', color: activeSection === s.id ? 'var(--primary)' : 'var(--light)'}}>{s.label}</button>
                            ))}
                        </nav>
                        <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                            <a href="/" target="_blank" style={viewSiteStyle}>🌐 View Live Portfolio</a>
                            <button onClick={handleLogout} style={logoutBtnStyle}>🚪 Logout Session</button>
                        </div>
                </div>

                {/* Content Area */}
                <div style={contentAreaStyle}>
                    {message && <div style={{...toastStyle, background: message.includes('Error') ? '#e74c3c' : '#2ecc71'}}>{message}</div>}

                    <div style={{display: 'flex', gap: '28px', alignItems: 'flex-start'}}>
                        {/* Middle list / feed */}
                        <div style={{width: '360px', maxWidth: '36vw'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {sectionsMeta.map(s => (
                                    <button key={s.id} onClick={() => selectSection(s.id)} style={{textAlign: 'left', padding: '12px 14px', borderRadius: '10px', background: activeSection === s.id ? 'rgba(52,152,219,0.08)' : 'transparent', border: '1px solid rgba(255,255,255,0.02)', color: activeSection === s.id ? 'var(--primary)' : 'var(--light)', cursor: 'pointer'}}>
                                        <div style={{fontWeight: 700}}>{s.label}</div>
                                        <div style={{fontSize: '0.85rem', opacity: 0.6}}>
                                            {s.id === 'skills' && `${data.skills.items.length} items`}
                                            {s.id === 'projects' && `${data.projects.items.length} items`}
                                            {s.id === 'education' && `${data.education.items.length} items`}
                                            {s.id === 'socials' && `${data.socials.items.length} items`}
                                            {s.id === 'inbox' && `${messages.length} messages`}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right detail panel */}
                        <div style={{flex: 1}}>
                            {message && <div style={{...toastStyle, background: message.includes('Error') ? '#e74c3c' : '#2ecc71'}}>{message}</div>}
                            <form onSubmit={handleSave}>
                                <div style={{marginBottom: '18px'}}>{renderDetail(activeSection)}</div>
                                <div style={footerBtnArea}>
                                    <button type="submit" disabled={saving} style={saveBtnStyle}>{saving ? '🚀 SYNCING...' : 'SAVE CHANGES'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .wrapper-flex { flex-direction: column !important; }
                    .sidebar { width: 100% !important; height: auto !important; position: relative !important; padding: 20px !important; }
                    .content-area { padding: 20px !important; }
                    .mobile-header { display: block !important; }
                    .grid-2col { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    )
}

// Helper Components
const AdminCard = ({ id, title, children, color = '#3498db' }) => (
    <div id={id} style={cardStyle}>
        <h3 style={{...sectionTitleStyle, color}}>{title}</h3>
        {children}
    </div>
)

const InputField = ({ label, value, onChange, placeholder = "" }) => (
    <div style={{marginBottom: '10px'}}>
        <label style={labelStyle}>{label}</label>
        <input style={inputStyle} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
)

const ImageField = ({ label, value, onChange }) => {
    const handleLinkChange = (e) => {
        const url = e.target.value
        onChange(url)
    }

    return (
        <div style={{marginBottom: '10px'}}>
            <label style={labelStyle}>{label}</label>
            
            <input 
                type="text" 
                placeholder="https://example.com/image.jpg"
                value={value && !value.startsWith('data:') ? value : ''}
                onChange={handleLinkChange}
                style={{...inputStyle, padding: '12px 16px'}}
            />

            {value && (
                <div style={{marginTop: '12px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', padding: '8px', border: '1px solid rgba(255,255,255,0.1)'}}>
                    <img 
                        src={value} 
                        alt={label} 
                        style={{width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '5px'}}
                        onError={(e) => {
                            e.target.style.display = 'none'
                        }}
                    />
                </div>
            )}
        </div>
    )
}

const IconSuggestions = ({ type }) => {
    const skillsIcons = [
        "python", "js-square", "react", "html5", "css3-alt", "php", "java", "node-js", 
        "database", "code", "bug", "terminal", "aws", "docker", "git", "npm", 
        "ubuntu", "linux", "google", "apple", "figma", "sass", "bootstrap", "vuejs", 
        "angular", "wordpress", "android", "swift", "cloudflare"
    ];
    const socialIcons = [
        "github", "facebook", "twitter", "linkedin", "instagram", "youtube", 
        "discord", "whatsapp", "telegram", "tiktok", "twitch", "reddit", 
        "slack", "skype", "spotify", "pinterest", "medium"
    ];
    const icons = type === 'skills' ? skillsIcons : socialIcons;
    
    return (
        <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: '10px', border: '1px dashed rgba(52, 152, 219, 0.2)' }}>
            <strong style={{ fontSize: '0.75rem', color: '#3498db', display: 'block', marginBottom: '8px' }}>💡 POPULAR ICONS:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {icons.map(icon => (
                    <span key={icon} style={{ fontSize: '0.7rem', opacity: 0.6, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{icon}</span>
                ))}
            </div>
        </div>
    );
}

const DynamicEditor = ({ title, items, updateListItem, removeItem, addItem, section }) => (
    <AdminCard id={section} title={title}>
        <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <span style={{fontSize: '0.8rem', opacity: 0.4}}>Items Count: {items.length}</span>
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                <button type="button" onClick={addItem} style={addBtnStyle}>+ Add New Entry</button>
            </div>
        </div>
        
        {(section === 'skills' || section === 'socials') && <IconSuggestions type={section} />}
        
        <div style={{display: 'grid', gap: '15px', marginTop: '20px'}}>
            {items.map((item, idx) => (
                <div key={idx} style={itemBoxStyle}>
                    <button type="button" onClick={() => removeItem(section, idx)} style={closeBtnStyle}>&times;</button>
                    <div style={grid2ColStyle}>
                        {Object.keys(item).map(key => (
                            key === 'image' || key === 'logo' || key === 'thumbnail' || key === 'imageUrl' ? (
                                <ImageField 
                                    key={key}
                                    label={key.toUpperCase()} 
                                    value={item[key]} 
                                    onChange={(val) => updateListItem(section, idx, key, val)} 
                                />
                            ) : (
                                <InputField 
                                    key={key}
                                    label={key.toUpperCase()} 
                                    value={item[key]} 
                                    onChange={(val) => updateListItem(section, idx, key, val)} 
                                />
                            )
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </AdminCard>
)

// Design System
const adminContainerStyle = { background: '#0a0f1d', minHeight: '100vh', color: '#fff', fontFamily: '-apple-system, system-ui, sans-serif' };
const mobileHeaderStyle = { background: 'rgba(52, 152, 219, 0.1)', padding: '15px', textAlign: 'center', fontWeight: 'bold', display: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const wrapperStyle = { display: 'flex', minHeight: '100vh' };
const sidebarStyle = { width: '280px', padding: '40px 25px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, height: '100vh' };
const logoAreaStyle = { paddingBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.03)' };
const contentAreaStyle = { flex: 1, padding: '40px 60px', maxWidth: '1200px' };
const cardStyle = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '30px', marginBottom: '30px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)', backdropFilter: 'blur(5px)' };
const sectionTitleStyle = { fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '25px', textTransform: 'uppercase', letterSpacing: '1px' };
const labelStyle = { fontSize: '0.75rem', opacity: 0.5, marginBottom: '8px', display: 'block', fontWeight: '600' };
const inputStyle = { width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#fff', outline: 'none', transition: 'border 0.3s' };
const textareaStyle = { ...inputStyle, fontFamily: 'inherit' };
const grid2ColStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' };
const itemBoxStyle = { background: 'rgba(0,0,0,0.15)', padding: '25px', borderRadius: '12px', position: 'relative', border: '1px solid rgba(255,255,255,0.03)' };
const footerBtnArea = { position: 'sticky', bottom: '20px', zIndex: 10, marginTop: '50px' };
const saveBtnStyle = { width: '100%', padding: '20px', background: 'linear-gradient(90deg, #3498db, #2980b9)', color: '#fff', border: 'none', borderRadius: '14px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(52, 152, 219, 0.3)' };
const addBtnStyle = { padding: '8px 16px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', border: '1px solid #2ecc71', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' };
const closeBtnStyle = { position: 'absolute', top: '10px', right: '15px', fontSize: '1.5rem', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' };
const toastStyle = { position: 'fixed', top: '20px', right: '20px', padding: '16px 32px', borderRadius: '12px', zIndex: 1000, fontWeight: 'bold' };
const loadingStyle = { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1d', color: '#3498db', fontSize: '1.2rem' };
const viewSiteStyle = { padding: '12px', textAlign: 'center', background: 'rgba(52, 152, 219, 0.1)', color: '#3498db', borderRadius: '10px', textDecoration: 'none', fontSize: '0.9rem' };
const logoutBtnStyle = { padding: '12px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', borderRadius: '10px', border: '1px solid rgba(231, 76, 60, 0.2)', cursor: 'pointer', fontSize: '0.9rem' };
const sidebarNavStyle = { display: 'flex', flexDirection: 'column', marginTop: '18px', gap: '8px' };
const sidebarNavItemStyle = { color: 'var(--light)', textDecoration: 'none', padding: '8px 10px', borderRadius: '8px', background: 'transparent', transition: 'background 0.12s, color 0.12s', fontSize: '0.95rem' };
const inboxItemStyle = { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '15px' };
const mssagesGridStyle = 'grid';
const delBtnStyle = { color: '#e74c3c', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 };

export default Admin;
