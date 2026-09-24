import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Shield, Brain, Eye, EyeOff, ArrowLeft, Lock, Mail, AlertCircle } from 'lucide-react';

const ADMIN_CREDENTIALS = { email: 'admin@mindsathi.ai', password: 'admin123' };

export default function AdminLogin() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.alog-left', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9 })
      .fromTo('.alog-right', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.7')
      .fromTo('.alog-field', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.4');

    gsap.to('.alog-orb-1', { x: 15, y: -20, repeat: -1, yoyo: true, duration: 5, ease: 'power1.inOut' });
    gsap.to('.alog-orb-2', { x: -20, y: 15, repeat: -1, yoyo: true, duration: 7, ease: 'power1.inOut', delay: 1 });

    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const xO = (mousePos.x - window.innerWidth / 2) * 0.01;
    const yO = (mousePos.y - window.innerHeight / 2) * 0.01;
    gsap.to('.alog-card-inner', { rotateY: xO, rotateX: -yO, duration: 1, ease: 'power1.out' });
  }, [mousePos]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem('staff_role', 'admin');
      localStorage.setItem('staff_name', 'Dr. System Admin');
      gsap.to('.alog-right', { opacity: 0, scale: 0.95, duration: 0.4, onComplete: () => navigate('/admin-dashboard') });
    } else {
      setError('Invalid credentials. Try admin@mindsathi.ai / admin123');
      gsap.fromTo('.alog-form', { x: -10 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)', from: { x: 10 } });
      gsap.to('.alog-form', { x: [0, -8, 8, -6, 6, 0], duration: 0.4, ease: 'power2.out' });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <div className="alog-orb-1" style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="alog-orb-2" style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,29,149,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(124,58,237,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Left panel */}
      <div className="alog-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', position: 'relative', opacity: 0 }}>
        <button onClick={() => navigate('/staff')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#5a5a72', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', marginBottom: '3rem', transition: 'color 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#5a5a72'; }}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(124,58,237,0.4)' }}>
            <Shield size={30} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: '#f0f0f5' }}>Admin Portal</div>
            <div style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 600 }}>System Administration</div>
          </div>
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 900, color: '#f0f0f5', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Take full<br />
          <span style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>control.</span>
        </h1>
        <p style={{ color: '#5a5a72', fontSize: '1rem', lineHeight: 1.7, maxWidth: 400, marginBottom: '2.5rem' }}>
          Manage your entire healthcare network — doctors, caretakers, patients — from one powerful dashboard.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['Manage doctors & caretakers', 'View system-wide reports', 'Control access permissions', 'Configure platform settings'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 8px rgba(124,58,237,0.6)' }} />
              <span style={{ fontSize: '0.9rem', color: '#8b8ba3' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="alog-right" style={{ width: '45%', minWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', opacity: 0, perspective: 1000 }}>
        <div className="alog-card-inner" style={{ width: '100%', maxWidth: 440, transformStyle: 'preserve-3d' }}>
          <div style={{ background: 'rgba(14,14,26,0.8)', backdropFilter: 'blur(30px)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 60px rgba(124,58,237,0.15)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '24px 24px 0 0', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)' }} />
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Brain size={20} color="#7c3aed" />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#f0f0f5' }}>MindSathi</span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5' }}>Sign in as Admin</h2>
              <p style={{ color: '#5a5a72', fontSize: '0.85rem', marginTop: '0.4rem' }}>Enter your admin credentials to continue</p>
            </div>

            <form className="alog-form" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="alog-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@mindsathi.ai"
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(124,58,237,0.5)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
                  />
                </div>
              </div>
              <div className="alog-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(124,58,237,0.5)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a5a72', cursor: 'pointer', padding: 0 }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#f87171' }}>
                  <AlertCircle size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white', fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Signing in...
                  </span>
                ) : 'Sign in to Admin Portal'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px', fontSize: '0.78rem', color: '#5a5a72' }}>
              <div style={{ fontWeight: 700, color: '#8b8ba3', marginBottom: '0.3rem' }}>Demo credentials:</div>
              <div>Email: <span style={{ color: '#a78bfa' }}>admin@mindsathi.ai</span></div>
              <div>Password: <span style={{ color: '#a78bfa' }}>admin123</span></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .alog-left { display: none; }
          .alog-right { width: 100% !important; min-width: unset !important; }
        }
      `}</style>
    </div>
  );
}
