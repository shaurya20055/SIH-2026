import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Shield, UserCheck, Stethoscope, ArrowRight, Brain, Activity,
  BarChart3, Users, Lock, ChevronDown, Star, Zap, Heart,
  ClipboardList, Bell, Eye
} from 'lucide-react';
import ParticleText from '../components/ParticleText';
import CursorGrid from '../components/CursorGrid';
import SpecularButton from '../components/SpecularButton';
import BrainModel3D from '../components/BrainModel3D';

gsap.registerPlugin(ScrollTrigger);

const ROLES = [
  {
    id: 'admin',
    title: 'Admin',
    subtitle: 'System Management',
    description: 'Manage doctors, caretakers, and oversee the entire healthcare network with complete administrative control.',
    icon: Shield,
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)',
    glow: 'rgba(124,58,237,0.4)',
    features: ['Manage Staff', 'System Config', 'Reports Overview', 'Access Control'],
    loginPath: '/admin-login',
    accent: '#7c3aed',
  },
  {
    id: 'caretaker',
    title: 'Caretaker',
    subtitle: 'Patient Care',
    description: 'Receive real-time patient reports, monitor vital analytics, and coordinate care activities seamlessly.',
    icon: UserCheck,
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #6d28d9 100%)',
    glow: 'rgba(14,165,233,0.4)',
    features: ['Patient Reports', 'Health Analytics', 'Care Reminders', 'Alerts & Flags'],
    loginPath: '/caretaker-login',
    accent: '#0ea5e9',
  },
  {
    id: 'doctor',
    title: 'Doctor',
    subtitle: 'Medical Records',
    description: 'Access patient medical records, review treatment history, and track your professional performance metrics.',
    icon: Stethoscope,
    gradient: 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
    glow: 'rgba(16,185,129,0.4)',
    features: ['Patient Records', 'Medical History', 'Treatment Plans', 'My Analytics'],
    loginPath: '/doctor-login',
    accent: '#10b981',
  },
];

// Admin is hidden from public-facing homepage — accessible only via direct URL
const VISIBLE_ROLES = ROLES.filter(r => r.id !== 'admin');

const STATS = [
  { value: '2,400+', label: 'Patients Monitored', icon: Users },
  { value: '98.7%', label: 'Uptime Reliability', icon: Activity },
  { value: '350+', label: 'Medical Professionals', icon: Stethoscope },
  { value: '24/7', label: 'Real-time Monitoring', icon: Eye },
];

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Advanced cognitive pattern recognition with machine learning.', color: '#7c3aed' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Instant notifications for critical patient condition changes.', color: '#f59e0b' },
  { icon: ClipboardList, title: 'Comprehensive Records', desc: 'Secure, HIPAA-compliant medical record management.', color: '#10b981' },
  { icon: BarChart3, title: 'Deep Analytics', desc: 'Rich dashboards with trend analysis and predictive insights.', color: '#0ea5e9' },
  { icon: Lock, title: 'Enterprise Security', desc: 'Multi-layer encryption protecting every piece of patient data.', color: '#c026d3' },
  { icon: Zap, title: 'Real-time Sync', desc: 'Instant data synchronization across all connected devices.', color: '#fb923c' },
];

function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

export default function StaffHomepage() {
  const navigate = useNavigate();
  const bgRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    // Hero animations
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .fromTo('.hp-hero-line', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.15 }, '+=0.2')
      .fromTo('.hp-hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo('.hp-hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo('.hp-hero-model', { opacity: 0, scale: 0.9, x: 30 }, { opacity: 1, scale: 1, x: 0, duration: 1 }, '-=0.8')
      .fromTo('.hp-hero-scroll', { opacity: 0 }, { opacity: 1, duration: 0.6 }, '-=0.2');

    gsap.to('.hp-hero-scroll', { y: 12, repeat: -1, yoyo: true, duration: 1.2, ease: 'power1.inOut' });
    gsap.to('.hp-orb-1', { x: 20, y: -30, repeat: -1, yoyo: true, duration: 6, ease: 'power1.inOut' });
    gsap.to('.hp-orb-2', { x: -25, y: 20, repeat: -1, yoyo: true, duration: 8, ease: 'power1.inOut', delay: 1 });
    gsap.to('.hp-orb-3', { x: 15, y: 25, repeat: -1, yoyo: true, duration: 7, ease: 'power1.inOut', delay: 2 });

    // Background color journey
    ScrollTrigger.create({
      trigger: '.hp-root',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        let r, g, b;
        if (p < 0.2) {
          const t = p / 0.2;
          r = lerp(6, 20, t); g = lerp(6, 8, t); b = lerp(14, 28, t);
        } else if (p < 0.4) {
          const t = (p - 0.2) / 0.2;
          r = lerp(20, 120, t); g = lerp(8, 40, t); b = lerp(28, 180, t);
        } else if (p < 0.55) {
          const t = (p - 0.4) / 0.15;
          r = lerp(120, 245, t); g = lerp(40, 235, t); b = lerp(180, 255, t);
        } else if (p < 0.7) {
          const t = (p - 0.55) / 0.15;
          r = lerp(245, 80, t); g = lerp(235, 20, t); b = lerp(255, 140, t);
        } else {
          const t = (p - 0.7) / 0.3;
          r = lerp(80, 6, t); g = lerp(20, 6, t); b = lerp(140, 14, t);
        }
        if (bgRef.current) bgRef.current.style.background = `rgb(${r},${g},${b})`;
      },
    });

    // Stats
    ScrollTrigger.create({
      trigger: '.hp-stats-section', start: 'top 80%', once: true,
      onEnter: () => gsap.fromTo('.hp-stat-item',
        { opacity: 0, y: 40, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.12, ease: 'back.out(1.4)' }
      ),
    });

    // Role cards left/right
    document.querySelectorAll('.hp-role-card').forEach((card, i) => {
      gsap.fromTo(card,
        { opacity: 0, x: i % 2 === 0 ? -80 : 80 },
        { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 80%', once: true } }
      );
    });

    // Features
    ScrollTrigger.create({
      trigger: '.hp-features-section', start: 'top 75%', once: true,
      onEnter: () => {
        gsap.fromTo('.hp-section-heading', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 });
        gsap.fromTo('.hp-feature-card', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.2 });
      },
    });

    // CTA
    ScrollTrigger.create({
      trigger: '.hp-cta-section', start: 'top 80%', once: true,
      onEnter: () => gsap.fromTo('.hp-cta-inner',
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' }
      ),
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    const xOffset = (mousePos.x - window.innerWidth / 2) * 0.015;
    const yOffset = (mousePos.y - window.innerHeight / 2) * 0.015;
    gsap.to('.hp-orb-1', { x: xOffset * 1.5, y: yOffset * 1.5, duration: 1.5, ease: 'power1.out' });
    gsap.to('.hp-orb-2', { x: -xOffset * 2, y: -yOffset * 2, duration: 2, ease: 'power1.out' });
  }, [mousePos]);

  return (
    <div className="hp-root" ref={bgRef} style={{ background: '#06060e', minHeight: '100vh', position: 'relative', overflow: 'hidden', transition: 'background 0.1s' }}>
      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(6,6,14,0.75)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#f0f0f5', letterSpacing: '-0.02em' }}>MindSathi</span>
          <span style={{ background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Staff Portal</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {VISIBLE_ROLES.map(r => (
            <button key={r.id} onClick={() => navigate(r.loginPath)} style={{
              padding: '0.4rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#8b8ba3', fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = 'rgba(124,58,237,0.2)'; e.target.style.color = '#a78bfa'; }}
            onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#8b8ba3'; }}
            >{r.title}</button>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
          <button onClick={() => navigate('/patient-login')} style={{
            padding: '0.4rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.08)', color: '#34d399', fontSize: '0.8rem', cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', fontWeight: 600, transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.18)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; }}
          >Patient Login</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '6rem 2rem 4rem' }}>
        {/* CursorGrid behind hero */}
        <CursorGrid
          cellSize={70}
          color="#D946EF"
          radius={140}
          falloff="smooth"
          holdTime={400}
          fadeDuration={800}
          lineWidth={1}
          maxOpacity={0.4}
          fillOpacity={0}
          gridOpacity={0}
          clickPulse
          pulseSpeed={600}
        />
        <div className="hp-orb-1" style={{ position: 'absolute', top: '10%', right: '15%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="hp-orb-2" style={{ position: 'absolute', bottom: '15%', left: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="hp-orb-3" style={{ position: 'absolute', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,29,149,0.06) 0%, transparent 70%)', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div className="hp-hero-grid" style={{ maxWidth: 1200, width: '100%', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', alignItems: 'center', gap: '2rem', position: 'relative', zIndex: 1 }}>
          <div className="hp-hero-text-container" style={{ textAlign: 'left' }}>
            {/* ParticleText for the main hero headline */}
            <div style={{ width: '100%', height: 'clamp(60px, 10vw, 120px)', marginBottom: '0.5rem' }}>
              <ParticleText
                text="MindSathi"
                particleSize={2.2}
                density={3}
                color="#f0f0f5"
                highlightColor="#8b5cf6"
                scatter={220}
                gatherDuration={1600}
                stagger={420}
                pointerRepel={42}
                repelRadius={120}
                idleDrift={0.8}
                trigger="mount"
                fontSize="clamp(3rem, 7vw, 6rem)"
                fontWeight={900}
                fontFamily="Outfit, sans-serif"
                textAlign="left"
                glow
              />
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem', color: '#f0f0f5' }}>
              <span className="hp-hero-line" style={{ display: 'block', opacity: 0 }}>Unified Care.</span>
              <span className="hp-hero-line" style={{ display: 'block', opacity: 0, background: 'linear-gradient(135deg, #7c3aed, #a78bfa, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Smarter Decisions.</span>
              <span className="hp-hero-line" style={{ display: 'block', opacity: 0 }}>Better Outcomes.</span>
            </h1>
            <p className="hp-hero-sub" style={{ opacity: 0, fontSize: '1.1rem', color: '#8b8ba3', maxWidth: 550, marginBottom: '2.5rem', lineHeight: 1.7 }}>
              The all-in-one healthcare management platform for administrators, caretakers, and doctors. AI-powered insights for every role.
            </p>
            <div className="hp-hero-cta" style={{ opacity: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {VISIBLE_ROLES.map(r => { const Icon = r.icon; return (
              <SpecularButton
                key={r.id}
                size="lg"
                radius={14}
                textColor="#f5f5f5"
                lineColor={r.accent}
                baseColor={r.gradient}
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={200}
                onClick={() => navigate(r.loginPath)}
                style={{ background: r.gradient, boxShadow: `0 4px 24px ${r.glow}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Icon size={18} />{r.title} Login
              </SpecularButton>
            ); })}
            <SpecularButton
              size="lg"
              radius={14}
              textColor="#34d399"
              lineColor="#10b981"
              baseColor="rgba(16,185,129,0.08)"
              intensity={0.8}
              shineSize={8}
              shineFade={30}
              thickness={1}
              speed={0.3}
              followMouse
              proximity={200}
              onClick={() => navigate('/patient-login')}
              style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}
            >
              I'm a Patient
            </SpecularButton>
          </div>
        </div>

        <div className="hp-hero-model" style={{ position: 'relative', width: '100%', height: '500px', opacity: 0, zIndex: 2 }}>
          <BrainModel3D />
        </div>
      </div>
        <div className="hp-hero-scroll" style={{ opacity: 0, position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: '#5a5a72', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <span>Scroll to explore</span><ChevronDown size={20} />
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="hp-stats-section" style={{ padding: '5rem 2rem', position: 'relative' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {STATS.map((stat, i) => { const Icon = stat.icon; return (
              <div key={i} className="hp-stat-item" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'rgba(14,14,26,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '16px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(124,58,237,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(124,58,237,0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color="#7c3aed" /></div>
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#5a5a72', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ─── ROLE CARDS ─── */}
      <section style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1rem', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Who uses MindSathi</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, color: '#f0f0f5', marginBottom: '1rem' }}>A Platform Built for Every Role</h2>
            <p style={{ color: '#5a5a72', maxWidth: 500, margin: '0 auto', fontSize: '1rem' }}>Tailored dashboards and tools designed specifically for how each team member works.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {VISIBLE_ROLES.map((role, i) => { const Icon = role.icon; const isEven = i % 2 === 0; return (
              <div key={role.id} className="hp-role-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', opacity: 0 }}>
                <div style={{ order: isEven ? 0 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '14px', background: role.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 20px ${role.glow}` }}><Icon size={26} color="white" /></div>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5' }}>{role.title}</div>
                      <div style={{ fontSize: '0.8rem', color: role.accent, fontWeight: 600, letterSpacing: '0.05em' }}>{role.subtitle}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: '1rem', color: '#8b8ba3', lineHeight: 1.7, marginBottom: '1.5rem' }}>{role.description}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                    {role.features.map(f => <span key={f} style={{ padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: `${role.accent}18`, color: role.accent, border: `1px solid ${role.accent}30` }}>{f}</span>)}
                  </div>
                  <SpecularButton
                    size="md"
                    radius={10}
                    textColor="#ffffff"
                    lineColor={role.accent}
                    baseColor={role.gradient}
                    intensity={1}
                    followMouse
                    proximity={180}
                    onClick={() => navigate(role.loginPath)}
                    style={{ background: role.gradient, boxShadow: `0 4px 20px ${role.glow}`, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Access {role.title} Portal <ArrowRight size={16} />
                  </SpecularButton>
                </div>
                <div style={{ order: isEven ? 1 : 0 }}>
                  <div style={{ background: 'rgba(14,14,26,0.8)', backdropFilter: 'blur(20px)', border: `1px solid ${role.accent}20`, borderRadius: '20px', padding: '2rem', boxShadow: `0 8px 40px ${role.glow}20`, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: role.gradient }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }} />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }} />
                      <div style={{ flex: 1, height: 24, borderRadius: '6px', background: 'rgba(255,255,255,0.04)', marginLeft: '0.5rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      {[82, 94, 67, 91].map((val, j) => (
                        <div key={j} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: role.accent }}>{val}%</div>
                          <div style={{ fontSize: '0.7rem', color: '#5a5a72', marginTop: '0.15rem' }}>{['Accuracy', 'Uptime', 'Compliance', 'Coverage'][j]}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#5a5a72', marginBottom: '0.75rem', fontWeight: 600 }}>7-Day Overview</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: 60 }}>
                        {[40, 65, 50, 80, 70, 90, 85].map((h, j) => <div key={j} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: role.gradient, opacity: 0.7 + j * 0.04 }} />)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="hp-features-section" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="hp-section-heading" style={{ textAlign: 'center', marginBottom: '3.5rem', opacity: 0 }}>
            <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', padding: '0.3rem 1rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Platform Features</div>
            {/* ParticleText for features section heading */}
            <div style={{ width: '100%', height: 'clamp(56px, 8vw, 96px)', margin: '0 auto 0.75rem' }}>
              <ParticleText
                text="Everything You Need"
                particleSize={1.8}
                density={4}
                color="#f0f0f5"
                highlightColor="#7c3aed"
                scatter={160}
                gatherDuration={1400}
                stagger={280}
                pointerRepel={35}
                repelRadius={90}
                idleDrift={0.6}
                trigger="mount"
                fontSize="clamp(1.6rem, 4vw, 2.8rem)"
                fontWeight={800}
                fontFamily="Outfit, sans-serif"
                glow
              />
            </div>
            <p style={{ color: '#5a5a72', maxWidth: 500, margin: '0 auto' }}>Powerful tools built for modern healthcare, wrapped in an intuitive interface.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {FEATURES.map((feat, i) => { const Icon = feat.icon; return (
              <div key={i} className="hp-feature-card" style={{ padding: '1.75rem', borderRadius: '16px', background: 'rgba(14,14,26,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.35s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${feat.color}30`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${feat.color}15`; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: '12px', marginBottom: '1rem', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={24} color={feat.color} /></div>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1rem', fontWeight: 700, color: '#f0f0f5', marginBottom: '0.5rem' }}>{feat.title}</h4>
                <p style={{ fontSize: '0.85rem', color: '#5a5a72', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ); })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="hp-cta-section" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="hp-cta-inner" style={{ opacity: 0, textAlign: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(76,29,149,0.1) 100%)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '24px', padding: '4rem 3rem', boxShadow: '0 0 80px rgba(124,58,237,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[0,1,2,3,4].map(i => <Star key={i} size={18} color="#fbbf24" fill="#fbbf24" />)}
            </div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '1rem' }}>Ready to Transform Care?</h2>
            <p style={{ color: '#8b8ba3', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: 1.7 }}>Sign in to your role-specific portal and unlock the full power of intelligent healthcare management.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {VISIBLE_ROLES.map(r => { const Icon = r.icon; return (
                <SpecularButton
                  key={r.id}
                  size="md"
                  radius={10}
                  textColor="#f5f5f5"
                  lineColor={r.accent}
                  baseColor={r.gradient}
                  intensity={1}
                  followMouse
                  proximity={180}
                  onClick={() => navigate(r.loginPath)}
                  style={{ background: r.gradient, boxShadow: `0 4px 20px ${r.glow}`, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Icon size={16} />{r.title}
                </SpecularButton>
              ); })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '2rem', textAlign: 'center', color: '#5a5a72', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Brain size={16} color="#7c3aed" />
          <span style={{ fontWeight: 700, color: '#8b8ba3' }}>MindSathi Staff Portal</span>
        </div>
        <p>© 2026 MindSathi. All rights reserved. Built for SIH 2026.</p>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hp-hero-grid { grid-template-columns: 1fr !important; text-align: center !important; }
          .hp-hero-text-container { text-align: center !important; }
          .hp-hero-cta { justify-content: center !important; }
          .hp-hero-model { height: 350px !important; margin-top: 2rem; }
        }
        @media (max-width: 768px) {
          .hp-role-card { grid-template-columns: 1fr !important; }
          .hp-role-card > div { order: unset !important; }
        }
      `}</style>
    </div>
  );
}
