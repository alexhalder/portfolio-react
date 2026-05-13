import React, { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import useProtection from './useProtection'

const Portfolio = () => {
    useProtection();
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [submitting, setSubmitting] = useState(false)
    const [submitMsg, setSubmitMsg] = useState('')

    const handleMsgSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await addDoc(collection(db, "messages"), {
                ...formData,
                timestamp: serverTimestamp()
            });
            setSubmitMsg("Message sent successfully! I'll get back to you soon.");
            setFormData({ name: '', email: '', message: '' });
        } catch (err) {
            console.error("Error sending message:", err);
            setSubmitMsg("Error sending message. Please try again later.");
        } finally {
            setSubmitting(false);
            setTimeout(() => setSubmitMsg(''), 5000);
        }
    }

    // Fetch portfolio data on mount and preload key assets before showing UI
    useEffect(() => {
        let mounted = true;

        const preloadImage = (src) => new Promise((resolve) => {
            if (!src) return resolve();
            const img = new Image();
            img.src = src;
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
        });

        const fetchData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "portfolioData"));
                const docData = {};
                if (!querySnapshot.empty) {
                    querySnapshot.forEach((doc) => {
                        docData[doc.id] = doc.data();
                    });
                    if (!mounted) return;
                    setData(docData);

                    // Update browser tab title and favicon
                    if (docData.hero?.tabTitle) document.title = docData.hero.tabTitle;
                    if (docData.hero?.faviconUrl) {
                        let link = document.querySelector("link[rel~='icon']");
                        if (!link) {
                            link = document.createElement('link');
                            link.rel = 'icon';
                            document.getElementsByTagName('head')[0].appendChild(link);
                        }
                        link.href = docData.hero.faviconUrl;
                    }

                    // Preload hero image to avoid flash of layout when image appears
                    const heroImg = docData.hero?.imageUrl || docData.hero?.mobileBgUrl || docData.hero?.bgUrl;
                    await preloadImage(heroImg);
                }
            } catch (error) {
                console.error("Firebase fetch error:", error);
            } finally {
                if (!mounted) return;
                setLoading(false);
            }
        }

        fetchData();

        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        return () => {
            mounted = false;
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    // After data has loaded, enable particles and scroll reveal observers
    useEffect(() => {
        if (loading) return;

        // Initial particles attached to DOM (CSS particles already reference .particles)
        // Reveal Animation Observer
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
                else entry.target.classList.remove('active');
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => {
            revealElements.forEach(el => observer.unobserve(el));
            observer.disconnect();
        };
    }, [loading])

    const createParticles = () => {
        const particleCount = 50;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                id: i,
                size: Math.random() * 5 + 2,
                left: Math.random() * 100,
                duration: Math.random() * 20 + 10,
                delay: Math.random() * 5
            });
        }
        return particles;
    }

    const particles = createParticles();

    if (loading) {
        return <div className="loading">Loading Portfolio...</div>
    }

    const { hero, about, education, skills, contact, socials, projects } = data || {};
    const effectiveBg = (isMobile && hero?.mobileBgUrl) ? hero.mobileBgUrl : hero?.bgUrl;

    return (
        <div className="container">
            {/* Floating 3D Elements */}
            <div className="floating-element" style={{ top: '10%', left: '5%', animationDelay: '0s' }}></div>
            <div className="floating-element" style={{ top: '20%', right: '10%', animationDelay: '-5s', width: '80px', height: '80px' }}></div>
            <div className="floating-element" style={{ bottom: '30%', left: '15%', animationDelay: '-10s', width: '120px', height: '120px' }}></div>
            <div className="floating-element" style={{ bottom: '10%', right: '5%', animationDelay: '-15s' }}></div>

            {/* Navigation */}
            <nav>
                <div className="logo">{hero?.siteName || "Portfolio"}</div>
                <div className="nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#3498db' }}>
                    <i className={isMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                </div>
                <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <a href="#home" onClick={() => setIsMenuOpen(false)}>Home</a>
                    <a href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
                    <a href="#education" onClick={() => setIsMenuOpen(false)}>Education</a>
                    <a href="#skills" onClick={() => setIsMenuOpen(false)}>Skills</a>
                    <a href="#projects" onClick={() => setIsMenuOpen(false)}>Projects</a>
                    <a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a>
                </div>
            </nav>

            {/* Home Section */}
            <section id="home" className="reveal fade-bottom">
                <div className="section-content">
                    <div className="hero-text reveal fade-bottom">
                        <h1>Hi, I'm {hero?.name || "ALEX"}</h1>
                        <p><b>{hero?.headline || "I'm a passionate static web Developer..."}</b></p>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <a href="#contact" className="btn">Get In Touch</a>
                            {hero?.cvUrl && (
                                <a href={hero.cvUrl} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'transparent', borderColor: '#3498db', color: '#3498db' }}>
                                    View CV
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="hero-image reveal fade-bottom">
                        <div className="profile-card">
                            <div className="profile-img">
                                <img src={hero?.imageUrl || "/Ax.jpg"} alt="Profile" />
                            </div>
                            <div className="profile-info">
                                <h3>{hero?.name || "ALEX"}</h3>
                                <p>{hero?.jobTitle || "Static Developer"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="reveal fade-bottom">
                <div className="section-content">
                    <div className="about-content">
                        <div className="about-cube" style={{ justifyContent: 'flex-start', flex: '1' }}>
                            <div className="model-float">
                                {(!data.settings || data.settings.showModel) && (
                                    <>
                                        <div style={{ width: '520px', height: '560px', transform: 'scale(1) translateX(0px)' }}>
                                            <ModelTyper />
                                        </div>
                                        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
                                            {(!data.settings || data.settings.showTechCube) && (
                                                <div className="tech-cube" aria-hidden>
                                        <div className="cube-face front"><i className="fab fa-react" style={{ color: '#61DAFB', fontSize: '28px' }}></i></div>
                                        <div className="cube-face right"><i className="fab fa-js-square" style={{ color: '#F7DF1E', fontSize: '28px' }}></i></div>
                                        <div className="cube-face left"><i className="fab fa-node" style={{ color: '#68A063', fontSize: '28px' }}></i></div>
                                        <div className="cube-face top"><i className="fas fa-database" style={{ color: '#9AD3E7', fontSize: '22px' }}></i></div>
                                        <div className="cube-face back"><i className="fab fa-github" style={{ color: '#fff', fontSize: '24px' }}></i></div>
                                        <div className="cube-face bottom"><i className="fab fa-css3-alt" style={{ color: '#1572B6', fontSize: '24px' }}></i></div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="about-text" style={{ flex: '1.5', paddingLeft: '40px' }}>
                            <h2>About Me</h2>
                            <p><b>{about?.text1 || "I'm a dedicated static web developer..."}</b></p>
                            <p><b>{about?.text2 || "When I'm not coding..."}</b></p>
                            <p><b>{about?.text3 || "I believe in..."}</b></p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Education Section */}
            <section id="education" className="reveal fade-bottom">
                <div className="section-content">
                    <div className="education-content">
                        <h2 className="section-title">Education</h2>
                        <div className="timeline">
                            {education?.items?.map((item, index) => (
                                <div key={index} className="timeline-item reveal fade-bottom">
                                    <div className="timeline-content">
                                        <h3>{item.title}</h3>
                                        <p>{item.institution}</p>
                                        <p>{item.dateRange}</p>
                                        <p>{item.description}</p>
                                    </div>
                                </div>
                            )) || <p>Education details coming soon.</p>}
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="reveal fade-bottom">
                <div className="particles" id="particles-container">
                    {particles.map(p => (
                        <div key={p.id} className="particle" style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }} />
                    ))}
                </div>
                <div className="section-content">
                    <div className="skills-content">
                        <h2 className="section-title">Skills</h2>
                        <div className="skills-container">
                            {skills?.items?.map((skill, index) => {
                                const iconMap = { 'css': 'css3-alt', 'js': 'js-square', 'html': 'html5', 'db': 'database', 'mongodb': 'envira', 'sql': 'database', 'wordpress': 'wordpress' };
                                const iconName = iconMap[skill.icon.toLowerCase()] || skill.icon.toLowerCase();
                                const brandColors = {
                                    'python': '#306998', 'js-square': '#F7DF1E', 'html5': '#E34F26', 'css3-alt': '#1572B6', 'java': '#007396', 'react': '#61DAFB', 'php': '#777BB4', 'node-js': '#339933', 'github': '#181717', 'aws': '#FF9900', 'docker': '#2496ED', 'git': '#F05032', 'npm': '#CB3837', 'figma': '#F24E1E', 'sass': '#CC6699', 'bootstrap': '#7952B3', 'vuejs': '#4FC08D', 'angular': '#DD0031', 'wordpress': '#21759B', 'android': '#3DDC84', 'swift': '#F05138', 'cloudflare': '#F38020', 'mongodb': '#47A248', 'database': '#4169E1'
                                };
                                const iconColor = skill.color || brandColors[iconName] || '#3498db';
                                const brandIcons = ['python', 'js-square', 'html5', 'css3-alt', 'java', 'react', 'php', 'node-js', 'github', 'aws', 'docker', 'git', 'npm', 'facebook', 'twitter', 'instagram', 'linkedin', 'envira', 'google', 'apple', 'ubuntu', 'linux', 'figma', 'sass', 'bootstrap', 'vuejs', 'angular', 'wordpress', 'android', 'swift', 'cloudflare', 'slack', 'skype', 'spotify', 'pinterest', 'medium', 'whatsapp', 'telegram', 'twitch', 'reddit', 'tiktok', 'discord'];
                                const category = brandIcons.includes(iconName) ? 'fab' : 'fas';

                                return (
                                    <div key={index} className={`skill-card ${skill.class} reveal fade-bottom`}>
                                        <div className="skill-icon" style={{ color: iconColor }}>
                                            <i className={`${category} fa-${iconName}`}></i>
                                        </div>
                                        <h3>{skill.name}</h3>
                                        <div className="skill-level">{skill.level}</div>
                                        <div className="skill-bar-container">
                                            <div className="skill-bar" style={{ width: `${skill.percent}%`, background: `linear-gradient(90deg, ${iconColor}, ${iconColor}cc)` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Section */}
            <section id="projects" className="reveal fade-bottom">
                <div className="section-content" style={{ flexDirection: 'column' }}>
                    <h2 className="section-title">My Projects</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', width: '100%' }}>
                        {projects?.items?.map((project, index) => (
                            <div key={index} className="skill-card reveal fade-bottom" style={{ padding: '0', overflow: 'hidden', textAlign: 'left' }}>
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ color: '#3498db' }}>{project.title}</h3>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '20px', opacity: 0.8 }}>{project.description}</p>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>Live Demo</a>
                                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="btn" style={{ padding: '8px 20px', fontSize: '0.8rem', background: 'transparent', borderColor: '#3498db', color: '#3498db' }}>GitHub</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="reveal fade-bottom">
                <div className="section-content">
                    <div className="contact-content">
                        <div className="contact-info">
                            <h2 className="section-title">Contact Me</h2>
                            <ContactItem icon="envelope" title="Email" value={contact?.email || "alexhalder2007@gmail.com"} />
                            <ContactItem icon="phone" title="Phone" value={contact?.phone || "+880 1913520955"} />
                            <ContactItem icon="map-marker-alt" title="Location" value={contact?.location || "Khulna, G.P.O-9000"} />
                        </div>
                        <div className="contact-form">
                            <form onSubmit={handleMsgSubmit}>
                                <div className="form-group"><label>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                                <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
                                <div className="form-group"><label>Message</label><textarea rows="5" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required></textarea></div>
                                <button type="submit" className="btn" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
                                {submitMsg && <p style={{ marginTop: '10px', color: submitMsg.includes('Error') ? '#e74c3c' : '#2ecc71' }}>{submitMsg}</p>}
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="reveal fade-bottom">
                <div className="social-links">
                    {socials?.items?.map((item, index) => {
                        const brandColors = { 'facebook': '#1877F2', 'twitter': '#1DA1F2', 'instagram': '#E4405F', 'linkedin': '#0A66C2', 'github': '#181717', 'youtube': '#FF0000', 'discord': '#5865F2', 'whatsapp': '#25D366', 'telegram': '#26A5E4', 'tiktok': '#000000', 'twitch': '#9146FF', 'reddit': '#FF4500' };
                        const color = brandColors[item.icon.toLowerCase()] || 'rgba(255, 255, 255, 0.1)';
                        return (
                            <a key={index} href={item.url} className="social-link" target="_blank" rel="noopener noreferrer" style={{ background: color, color: '#fff' }}>
                                <i className={`fab fa-${item.icon}`}></i>
                            </a>
                        );
                    })}
                </div>
                <p>&copy; 2023 Alex. All Rights Reserved.</p>
            </footer>
        </div>
    )
}

const ContactItem = ({ icon, title, value }) => (
    <div className="contact-info-item">
        <div className="contact-icon"><i className={`fas fa-${icon}`}></i></div>
        <div>
            <h3>{title}</h3>
            <p>{value}</p>
        </div>
    </div>
)

export default Portfolio;

/* ModelTyper component: shows a terminal-like typing animation */
function ModelTyper() {
    const [display, setDisplay] = React.useState('');
    const lines = [
        "const name = 'Alex Halder'",
        "const role = 'Frontend Engineer'",
        "const focus = ['React', 'Vite', 'Firebase', 'CSS']",
        "// Building clean, fast UI & delightful UX"
    ];

    React.useEffect(() => {
        let lineIndex = 0;
        let charIndex = 0;
        let forward = true;
        let timeout;

        function tick() {
            const current = lines[lineIndex];
            if (forward) {
                charIndex++;
                setDisplay(current.slice(0, charIndex));
                if (charIndex === current.length) {
                    forward = false;
                    timeout = setTimeout(tick, 1000);
                    return;
                }
            } else {
                charIndex--;
                setDisplay(current.slice(0, charIndex));
                if (charIndex === 0) {
                    forward = true;
                    lineIndex = (lineIndex + 1) % lines.length;
                }
            }
            timeout = setTimeout(tick, forward ? 40 : 20);
        }

        tick();
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', justifyContent: 'center' }}>
            <div className="terminal" style={{ width: '100%', maxWidth: '520px', padding: '18px', borderRadius: '12px', background: 'linear-gradient(180deg, rgba(4,10,20,0.85), rgba(2,6,12,0.6))', border: '1px solid rgba(255,255,255,0.04)', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }}></span>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f', display: 'inline-block' }}></span>
                </div>
                <pre style={{ color: '#bfe9ff', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontSize: '16px', lineHeight: 1.35, margin: 0, minHeight: '78px' }}>{display}<span className="typer-cursor">|</span></pre>
            </div>
            <div style={{ width: '100%', maxWidth: '520px', textAlign: 'center', opacity: 0.9 }}>
                <h3 style={{ margin: '8px 0', color: 'var(--primary)' }}>{/* name shown in hero already */}Frontend • UI-focused</h3>
                <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>Crafting responsive interfaces and performant web apps — clean code and great UX.</p>
            </div>
        </div>
    );
}
