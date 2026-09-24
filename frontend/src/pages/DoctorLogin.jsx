import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Stethoscope, Brain, Eye, EyeOff, ArrowLeft, Lock, Mail, AlertCircle, Activity } from 'lucide-react';

export default function DoctorLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.dlog-left', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9 })
      .fromTo('.dlog-right', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.9 }, '-=0.7')
      .fromTo('.dlog-field', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, '-=0.4');
    gsap.to('.dlog-orb-1', { x: 15, y: -20, repeat: -1, yoyo: true, duration: 5, ease: 'power1.inOut' });
    gsap.to('.dlog-orb-2', { x: -20, y: 15, repeat: -1, yoyo: true, duration: 7, ease: 'power1.inOut', delay: 1 });
    gsap.to('.dlog-pulse', { scale: 1.3, opacity: 0, repeat: -1, duration: 1.5, ease: 'power1.out' });
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const xO = (mousePos.x - window.innerWidth / 2) * 0.01;
    const yO = (mousePos.y - window.innerHeight / 2) * 0.01;
    gsap.to('.dlog-card-inner', { rotateY: xO, rotateX: -yO, duration: 1, ease: 'power1.out' });
  }, [mousePos]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    if (email.includes('@') && password.length >= 4) {
      localStorage.setItem('staff_role', 'doctor');
      localStorage.setItem('staff_name', 'Dr. Ananya Mehta');
      gsap.to('.dlog-right', { opacity: 0, scale: 0.95, duration: 0.4, onComplete: () => navigate('/doctor-dashboard') });
    } else {
      setError('Invalid credentials. Use any valid email + password (min 4 chars).');
      gsap.to('.dlog-form', { keyframes: [{ x: -8 }, { x: 8 }, { x: -6 }, { x: 6 }, { x: 0 }], duration: 0.4 });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', display: 'flex', overflow: 'hidden', position: 'relative' }}>
      <div className="dlog-orb-1" style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div className="dlog-orb-2" style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      {/* Left panel */}
      <div className="dlog-left" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem', position: 'relative', opacity: 0 }}>
        <button onClick={() => navigate('/staff')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#5a5a72', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', marginBottom: '3rem', transition: 'color 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.color = '#10b981'}
        onMouseLeave={e => e.currentTarget.style.color = '#5a5a72'}>
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 60, height: 60, borderRadius: '16px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 24px rgba(16,185,129,0.4)', position: 'relative' }}>
            <Stethoscope size={30} color="white" />
            <div className="dlog-pulse" style={{ position: 'absolute', inset: 0, borderRadius: '16px', border: '2px solid rgba(16,185,129,0.6)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 900, color: '#f0f0f5' }}>Doctor Portal</div>
            <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Medical Records & Analytics</div>
          </div>
        </div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 3vw, 3rem)', fontWeight: 900, color: '#f0f0f5', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Heal with<br />
          <span style={{ background: 'linear-gradient(135deg, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>data-driven insight.</span>
        </h1>
        <p style={{ color: '#5a5a72', fontSize: '1rem', lineHeight: 1.7, maxWidth: 400, marginBottom: '2.5rem' }}>
          Access comprehensive patient records, review cognitive health trends, and manage your professional portfolio.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['Patient medical records & history', 'Cognitive performance analytics', 'Treatment plans & notes', 'Personal performance metrics'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
              <span style={{ fontSize: '0.9rem', color: '#8b8ba3' }}>{item}</span>
            </div>
          ))}
        </div>
        {/* EKG decorative */}
        <div style={{ marginTop: '3rem', opacity: 0.3 }}>
          <Activity size={100} color="#10b981" strokeWidth={1} />
        </div>
      </div>

      {/* Right panel */}
      <div className="dlog-right" style={{ width: '45%', minWidth: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', opacity: 0, perspective: 1000 }}>
        <div className="dlog-card-inner" style={{ width: '100%', maxWidth: 440, transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'relative', background: 'rgba(14,14,26,0.8)', backdropFilter: 'blur(30px)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 8px 60px rgba(16,185,129,0.1)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '24px 24px 0 0', background: 'linear-gradient(135deg, #10b981, #0ea5e9)' }} />
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Brain size={20} color="#10b981" />
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: '#f0f0f5' }}>MindSathi</span>
              </div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5' }}>Doctor Sign In</h2>
              <p style={{ color: '#5a5a72', fontSize: '0.85rem', marginTop: '0.4rem' }}>Access your medical dashboard</p>
            </div>
            <form className="dlog-form" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="dlog-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@mindsathi.ai"
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(16,185,129,0.5)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>
              <div className="dlog-field">
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.border = '1px solid rgba(16,185,129,0.5)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
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
              <button type="submit" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.9rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', color: 'white', fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.3s', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    Signing in...
                  </span>
                ) : 'Sign in to Doctor Portal'}
              </button>
            </form>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', fontSize: '0.78rem', color: '#5a5a72' }}>
              <div style={{ fontWeight: 700, color: '#8b8ba3', marginBottom: '0.3rem' }}>Demo: any valid email + 4+ char password</div>
              <div>e.g. doctor@test.com / pass1234</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @media(max-width:768px){.dlog-left{display:none}.dlog-right{width:100%!important;min-width:unset!important}}`}</style>
    </div>
  );
}
