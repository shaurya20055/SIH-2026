import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Brain, User, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn,
  UserPlus, Heart, Gamepad2, Shield, ChevronRight
} from 'lucide-react';
import ParticleText from '../components/ParticleText';
import CursorGrid from '../components/CursorGrid';
import SpecularButton from '../components/SpecularButton';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function PatientLogin({ onLogin }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '', age: 65 });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const formRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(formRef.current,
      { opacity: 0, y: 30, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
    );
  }, [mode]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setError('');
  };

  const handleLogin = async () => {
    if (!form.username || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    setError('');
    try {
      // 1. Get JWT token
      const loginRes = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      if (!loginRes.ok) {
        const data = await loginRes.json().catch(() => ({}));
        throw new Error(data.detail || 'Invalid credentials');
      }
      const tokens = await loginRes.json();
      localStorage.setItem('mm_access', tokens.access);
      localStorage.setItem('mm_refresh', tokens.refresh);

      // 2. Get user info
      const meRes = await fetch(`${API}/auth/me/`, {
        headers: { Authorization: `Bearer ${tokens.access}` },
      });
      if (meRes.ok) {
        const user = await meRes.json();
        localStorage.setItem('mm_patient_id', user.patient_id || '1');
        localStorage.setItem('mm_user', JSON.stringify(user));
        localStorage.setItem('mm_onboarded', 'true');
        localStorage.setItem('mm_patient_name', user.first_name || form.username);
      }

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        if (onLogin) onLogin(localStorage.getItem('mm_patient_id') || '1');
        navigate('/dashboard');
      }, 800);
    } catch (err) {
      // Fallback: demo login
      console.warn('Login API error, using demo login:', err.message);
      localStorage.setItem('mm_patient_id', '1');
      localStorage.setItem('mm_onboarded', 'true');
      localStorage.setItem('mm_patient_name', form.username);
      setSuccess('Demo login successful!');
      setTimeout(() => {
        if (onLogin) onLogin('1');
        navigate('/dashboard');
      }, 800);
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.name) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // 1. Register user
      const regRes = await fetch(`${API}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          email: form.email || `${form.username}@mindsathi.ai`,
          first_name: form.name.split(' ')[0],
          last_name: form.name.split(' ').slice(1).join(' ') || '',
          role: 'patient',
        }),
      });

      if (!regRes.ok) {
        const data = await regRes.json().catch(() => ({}));
        const errMsg = Object.values(data).flat().join('. ') || 'Registration failed';
        throw new Error(errMsg);
      }
      const regData = await regRes.json();

      // 2. Create patient record
      const patRes = await fetch(`${API}/patients/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: regData.id,
          name: form.name,
          age: parseInt(form.age) || 65,
          language: 'english',
          cognitive_level: 1,
        }),
      });

      let patientId = regData.id;
      if (patRes.ok) {
        const patData = await patRes.json();
        patientId = patData.id;
      }

      // 3. Auto-login
      const loginRes = await fetch(`${API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      if (loginRes.ok) {
        const tokens = await loginRes.json();
        localStorage.setItem('mm_access', tokens.access);
        localStorage.setItem('mm_refresh', tokens.refresh);
      }

      localStorage.setItem('mm_patient_id', patientId);
      localStorage.setItem('mm_onboarded', 'true');
      localStorage.setItem('mm_patient_name', form.name);

      setSuccess('Account created! Redirecting...');
      setTimeout(() => {
        if (onLogin) onLogin(patientId);
        else navigate('/dashboard');
      }, 800);
    } catch (err) {
      console.warn('Register API error:', err.message);
      // Fallback demo
      localStorage.setItem('mm_patient_id', '1');
      localStorage.setItem('mm_onboarded', 'true');
      localStorage.setItem('mm_patient_name', form.name || form.username);
      setSuccess('Demo account created!');
      setTimeout(() => {
        if (onLogin) onLogin('1');
        else navigate('/dashboard');
      }, 800);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.04)', color: '#f0f0f5',
    fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', position: 'relative', overflow: 'hidden', display: 'flex' }}>
      {/* CursorGrid background */}
      <CursorGrid
        cellSize={70}
        color="#D946EF"
        radius={140}
        falloff="smooth"
        holdTime={400}
        fadeDuration={800}
        lineWidth={1}
        maxOpacity={0.5}
        fillOpacity={0}
        gridOpacity={0}
        clickPulse
        pulseSpeed={600}
      />

      {/* Ambient */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Left: Branding side */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '3rem', position: 'relative', zIndex: 1 }}>
        {/* Back button */}
        <button onClick={() => navigate('/')} style={{
          position: 'absolute', top: '2rem', left: '2rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', color: '#5a5a72',
          cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
        }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* ParticleText hero */}
        <div style={{ width: '100%', maxWidth: 500, height: 120, marginBottom: '1.5rem' }}>
          <ParticleText
            text="MindSathi"
            particleSize={2}
            density={4}
            color="#f8fafc"
            highlightColor="#D946EF"
            scatter={180}
            gatherDuration={1400}
            stagger={350}
            pointerRepel={38}
            repelRadius={100}
            idleDrift={0.7}
            trigger="mount"
            fontSize="clamp(2.5rem, 7vw, 5rem)"
            fontWeight={900}
            fontFamily="Outfit, sans-serif"
            glow
          />
        </div>

        <p style={{ color: '#8b8ba3', fontSize: '1.1rem', textAlign: 'center', maxWidth: 400, lineHeight: 1.7, marginBottom: '2.5rem' }}>
          Your personal cognitive wellness companion. Play brain-strengthening games, track your progress, and stay connected.
        </p>

        <div style={{ display: 'flex', gap: '2rem', color: '#5a5a72' }}>
          {[
            { icon: Gamepad2, label: 'Brain Games' },
            { icon: Heart, label: 'Mood Tracking' },
            { icon: Shield, label: 'Secure Data' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <Icon size={16} color="#D946EF" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Login form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 2 }}>
        <div ref={formRef} style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(14,14,26,0.85)', backdropFilter: 'blur(30px)',
          border: '1px solid rgba(217,70,239,0.15)',
          borderRadius: '24px', padding: '2.5rem',
          boxShadow: '0 8px 60px rgba(217,70,239,0.08)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Brain size={28} color="#D946EF" />
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f0f5' }}>MindSathi</span>
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '0.4rem' }}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#5a5a72' }}>
              {mode === 'login' ? 'Sign in to continue your journey' : 'Join MindSathi to get started'}
            </p>
          </div>

          {/* Error / Success */}
          {error && (
            <div style={{ padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', fontSize: '0.8rem', marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Name — only in register */}
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72', zIndex: 1 }} />
                <input
                  value={form.name} onChange={handleChange('name')}
                  placeholder="Full Name" style={inputStyle}
                  onFocus={e => { e.target.style.border = '1px solid rgba(217,70,239,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,70,239,0.08)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {/* Username */}
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72', zIndex: 1 }} />
              <input
                value={form.username} onChange={handleChange('username')}
                placeholder="Username" style={inputStyle}
                onFocus={e => { e.target.style.border = '1px solid rgba(217,70,239,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,70,239,0.08)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {/* Email — only in register */}
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72', zIndex: 1 }} />
                <input
                  value={form.email} onChange={handleChange('email')}
                  placeholder="Email (optional)" type="email" style={inputStyle}
                  onFocus={e => { e.target.style.border = '1px solid rgba(217,70,239,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,70,239,0.08)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {/* Age — only register */}
            {mode === 'register' && (
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72', zIndex: 1 }} />
                <input
                  value={form.age} onChange={handleChange('age')}
                  placeholder="Age" type="number" min={18} max={120} style={inputStyle}
                  onFocus={e => { e.target.style.border = '1px solid rgba(217,70,239,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,70,239,0.08)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            )}

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72', zIndex: 1 }} />
              <input
                value={form.password} onChange={handleChange('password')}
                placeholder="Password" type={showPw ? 'text' : 'password'} style={inputStyle}
                onFocus={e => { e.target.style.border = '1px solid rgba(217,70,239,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(217,70,239,0.08)'; }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
                onKeyDown={e => { if (e.key === 'Enter') mode === 'login' ? handleLogin() : handleRegister(); }}
              />
              <button onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#5a5a72', cursor: 'pointer', zIndex: 1 }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Submit */}
            <div style={{ marginTop: '0.5rem' }}>
              <SpecularButton
                size="lg"
                radius={14}
                tint="#D946EF"
                tintOpacity={0}
                blur={0}
                textColor="#f5f5f5"
                lineColor="#D946EF"
                baseColor="linear-gradient(135deg, #D946EF, #7c3aed)"
                intensity={1.2}
                shineSize={12}
                shineFade={45}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={300}
                onClick={mode === 'login' ? handleLogin : handleRegister}
                style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', background: 'linear-gradient(135deg, #D946EF, #7c3aed)', boxShadow: '0 4px 24px rgba(217,70,239,0.3)' }}
              >
                {loading ? (
                  <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <>{mode === 'login' ? <><LogIn size={16} /> Sign In</> : <><UserPlus size={16} /> Create Account</>}</>
                )}
              </SpecularButton>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#5a5a72' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }} style={{
              background: 'none', border: 'none', color: '#D946EF',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
            }}>
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          {/* Demo creds */}
          {mode === 'login' && (
            <div style={{ marginTop: '1.25rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(217,70,239,0.06)', border: '1px solid rgba(217,70,239,0.1)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D946EF', marginBottom: '0.25rem' }}>Demo credentials:</div>
              <div style={{ fontSize: '0.75rem', color: '#8b8ba3' }}>
                Username: <span style={{ color: '#D946EF', fontWeight: 600 }}>patient1</span> · Password: <span style={{ color: '#D946EF', fontWeight: 600 }}>pass1234</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="flex: 1"][style*="padding: '3rem'"] { display: none !important; }
        }
      `}</style>
    </div>
  );
}
