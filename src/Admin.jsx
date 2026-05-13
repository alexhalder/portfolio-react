import React, { useState, useEffect } from 'react'
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "portfolioData"));
                const docData = {};
                
                const defaultData = {
                    hero: { name: "ALEX", headline: "I'm a passionate static web Developer...", jobTitle: "Static Developer", siteName: "Portfolio", tabTitle: "Alex | Portfolio" },
                    about: { text1: "I'm a dedicated...", text2: "When I'm not coding...", text3: "I believe in..." },
                    settings: { showModel: true, showTechCube: true, enableRain: true },
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

    if (loading) return <div style={loadingStyle}>Loading Dashboard...</div>
    if (!data) return <div style={loadingStyle}>Error loading data.</div>

    return (
        <div style={adminContainerStyle}>
            {/* Minimal Mobile Header */}
            <div className="mobile-header" style={mobileHeaderStyle}>Admin Dashboard</div>

            {/* Main Wrapper */}
            <div style={wrapperStyle}>
                {/* Sidebar */}
                <div style={sidebarStyle}>
                    <div style={logoAreaStyle}>
                        <h2 style={{fontSize: '1.4rem', color: '#3498db', marginBottom: '5px'}}>Admin Panel</h2>
                        <span style={{fontSize: '0.7rem', opacity: 0.5, letterSpacing: '1px'}}>DASHBOARD V2.0</span>
                    </div>
                    <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <a href="/" target="_blank" style={viewSiteStyle}>🌐 View Live Portfolio</a>
                        <button onClick={() => signOut(auth)} style={logoutBtnStyle}>🚪 Logout Session</button>
                    </div>
                </div>

                {/* Content Area */}
                <div style={contentAreaStyle}>
                    {message && <div style={{...toastStyle, background: message.includes('Error') ? '#e74c3c' : '#2ecc71'}}>{message}</div>}

                    <form onSubmit={handleSave}>
                        {/* 1. Identity Card */}
                        <AdminCard title="Identity & Branding">
                            <div style={grid2ColStyle}>
                                <InputField label="Site Name (Logo Text)" value={data.hero?.siteName} onChange={(v) => updateNestedData('hero', 'siteName', v)} />
                                <InputField label="Browser Tab Title" value={data.hero?.tabTitle} onChange={(v) => updateNestedData('hero', 'tabTitle', v)} />
                                <InputField label="Favicon URL" value={data.hero?.faviconUrl} onChange={(v) => updateNestedData('hero', 'faviconUrl', v)} placeholder="Tab icon link..." />
                            </div>
                        </AdminCard>

                        {/* 2. Hero Component */}
                        <AdminCard title="Hero Section & Profile">
                            <div style={grid2ColStyle}>
                                <InputField label="Profile Name" value={data.hero?.name} onChange={(v) => updateNestedData('hero', 'name', v)} />
                                <InputField label="Current Job Title" value={data.hero?.jobTitle} onChange={(v) => updateNestedData('hero', 'jobTitle', v)} />
                                <InputField label="Profile Image URL" value={data.hero?.imageUrl} onChange={(v) => updateNestedData('hero', 'imageUrl', v)} />
                                <InputField label="CV / Resume Link" value={data.hero?.cvUrl} onChange={(v) => updateNestedData('hero', 'cvUrl', v)} />
                            </div>
                            <div style={{marginTop: '15px'}}>
                                <label style={labelStyle}>Intro Headline</label>
                                <textarea style={textareaStyle} rows="3" value={data.hero?.headline} onChange={(e) => updateNestedData('hero', 'headline', e.target.value)} />
                            </div>
                        </AdminCard>


                        {/* 4. About Details */}
                        <AdminCard title="About Story">
                            <div style={{display: 'grid', gap: '15px'}}>
                                <textarea style={textareaStyle} rows="2" value={data.about?.text1} onChange={(e) => updateNestedData('about', 'text1', e.target.value)} placeholder="Paragraph 1..." />
                                <textarea style={textareaStyle} rows="2" value={data.about?.text2} onChange={(e) => updateNestedData('about', 'text2', e.target.value)} placeholder="Paragraph 2..." />
                                <textarea style={textareaStyle} rows="2" value={data.about?.text3} onChange={(e) => updateNestedData('about', 'text3', e.target.value)} placeholder="Paragraph 3..." />
                            </div>
                        </AdminCard>

                        {/* Site Settings (toggles) */}
                        <AdminCard title="Site Settings">
                            <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
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
                        </AdminCard>

                        {/* Repeatable Sections */}
                        <DynamicEditor title="My Skills" section="skills" items={data.skills.items} updateListItem={updateListItem} removeItem={removeItem} addItem={() => addItem('skills', { name: "", level: "Intermediate", percent: 50, icon: "code" })} />
                        <DynamicEditor title="Showcase Projects" section="projects" items={data.projects.items} updateListItem={updateListItem} removeItem={removeItem} addItem={() => addItem('projects', { title: "", description: "", imageUrl: "", link: "", github: "" })} />
                        <DynamicEditor title="Educational Background" section="education" items={data.education.items} updateListItem={updateListItem} removeItem={removeItem} addItem={() => addItem('education', { title: "", institution: "", dateRange: "", description: "" })} />
                        <DynamicEditor title="Social Presence" section="socials" items={data.socials.items} updateListItem={updateListItem} removeItem={removeItem} addItem={() => addItem('socials', { name: "", icon: "", url: "" })} />

                        {/* 5. Messages / Inbox */}
                        <AdminCard title={`Inbox Messages (${messages.length})`} color="#e67e22">
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

                        {/* Save Trigger */}
                        <div style={footerBtnArea}>
                            <button type="submit" disabled={saving} style={saveBtnStyle}>
                                {saving ? '🚀 SYNCING...' : 'SAVE ALL PORFOLIO DATA'}
                            </button>
                        </div>
                    </form>
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
const AdminCard = ({ title, children, color = '#3498db' }) => (
    <div style={cardStyle}>
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
    <AdminCard title={title}>
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
                            <InputField key={key} label={key.toUpperCase()} value={item[key]} onChange={(val) => updateListItem(section, idx, key, val)} />
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
const inboxItemStyle = { borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '15px', marginBottom: '15px' };
const mssagesGridStyle = 'grid';
const delBtnStyle = { color: '#e74c3c', background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 };

export default Admin;
