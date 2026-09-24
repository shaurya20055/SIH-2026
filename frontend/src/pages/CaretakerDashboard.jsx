import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  UserCheck, Brain, LogOut, Bell, Activity, Heart, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Pill, Droplets, Calendar, ChevronRight,
  BarChart3, Users, ClipboardList, Filter, Search, Eye, ArrowUp, ArrowDown,
  Flame, Star, Zap
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const FALLBACK_PATIENTS = [
  { id: 1, name: 'Kamala Devi', age: 72, condition: 'stable', cognitive: 72, mood: 4, games: 12, streak: 7, lastSeen: '2h ago', doctor: 'Dr. Ananya Mehta', avatar: 'KD', meds: ['Donepezil 10mg', 'Vitamin B12'], alerts: [] },
  { id: 2, name: 'Rina Bora', age: 68, condition: 'improving', cognitive: 65, mood: 3, games: 8, streak: 3, lastSeen: '5h ago', doctor: 'Dr. Rohan Kapoor', avatar: 'RB', meds: ['Memantine 20mg'], alerts: ['Missed morning medicine'] },
  { id: 3, name: 'Dipak Saikia', age: 75, condition: 'warning', cognitive: 45, mood: 2, games: 4, streak: 0, lastSeen: '1d ago', doctor: 'Dr. Ananya Mehta', avatar: 'DS', meds: ['Rivastigmine 6mg', 'Aricept 5mg'], alerts: ['Cognitive decline detected', 'Missed sessions 3 days'] },
  { id: 4, name: 'Meera Pillai', age: 70, condition: 'stable', cognitive: 80, mood: 5, games: 15, streak: 12, lastSeen: '30m ago', doctor: 'Dr. Priya Singh', avatar: 'MP', meds: ['Galantamine 8mg'], alerts: [] },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  kognitiv: 55 + Math.random() * 30,
  mood: 2.5 + Math.random() * 2,
  sessions: 3 + Math.round(Math.random() * 5),
}));

const REMINDERS = [
  { id: 1, patient: 'Kamala Devi', type: 'medicine', label: 'Donepezil 10mg', time: '08:00 AM', done: true },
  { id: 2, patient: 'Rina Bora', type: 'medicine', label: 'Memantine 20mg', time: '09:00 AM', done: false },
  { id: 3, patient: 'Dipak Saikia', type: 'appointment', label: 'Neurology Check-up', time: '11:00 AM', done: false },
  { id: 4, patient: 'Meera Pillai', type: 'activity', label: 'Cognitive Game Session', time: '03:00 PM', done: false },
  { id: 5, patient: 'Kamala Devi', type: 'hydration', label: 'Afternoon water intake', time: '04:00 PM', done: false },
];

const conditionStyles = {
  stable: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Stable' },
  improving: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Improving' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Warning' },
  critical: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Critical' },
};

const reminderIcons = {
  medicine: <Pill size={16} color="#a78bfa" />,
  appointment: <Calendar size={16} color="#0ea5e9" />,
  activity: <Activity size={16} color="#10b981" />,
  hydration: <Droplets size={16} color="#22d3ee" />,
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#f0f0f5', fontWeight: 700, marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color ?? p.stroke }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

export default function CaretakerDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const [reminders, setReminders] = useState(REMINDERS);
  const [apiPatients, setApiPatients] = useState(FALLBACK_PATIENTS);
  const staffName = localStorage.getItem('staff_name') || 'Caretaker';

  useEffect(() => {
    fetch('http://localhost:8000/api/patients/')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        if (list.length > 0) {
          const formatted = list.map(p => {
             let initials = "PA";
             if (p.name) initials = p.name.split(' ').map(n=>n[0]).join('').toUpperCase().substring(0,2);
             return {
                id: p.id,
                name: p.name,
                age: p.age || 65,
                condition: p.cognitive_level >= 3 ? 'warning' : p.cognitive_level === 1 ? 'stable' : 'improving',
                cognitive: p.total_xp > 0 ? Math.min(100, Math.round((p.total_xp / 1000) * 100)) : 60,
                mood: 4,
                games: p.current_streak || 0,
                streak: p.current_streak || 0,
                lastSeen: p.last_played || 'Just now',
                doctor: p.doctor_name || 'Dr. Assigned',
                avatar: initials,
                meds: [], 
                alerts: (p.current_streak === 0) ? ['Missed recent sessions'] : []
             };
          });
          setApiPatients(formatted);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const PATIENTS = apiPatients;

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.ct-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo('.ct-stat', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
      .fromTo('.ct-main', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
  }, []);

  useEffect(() => {
    gsap.fromTo('.ct-patient-card',
      { opacity: 0, x: tab === 'patients' ? -30 : 30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
    );
  }, [tab]);

  const toggleReminder = (id) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  };

  const filteredPatients = PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'patients', label: 'Patients', icon: Users, count: PATIENTS.length },
    { key: 'reminders', label: 'Reminders', icon: Bell, count: reminders.filter(r => !r.done).length },
    { key: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const SUMMARY = [
    { label: 'My Patients', value: PATIENTS.length, icon: Users, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', delta: 'Under your care' },
    { label: 'Alerts Today', value: PATIENTS.flatMap(p => p.alerts).length, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', delta: '2 critical' },
    { label: 'Reminders Done', value: reminders.filter(r => r.done).length, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)', delta: `of ${reminders.length} total` },
    { label: 'Avg Cognitive', value: Math.round(PATIENTS.reduce((s, p) => s + p.cognitive, 0) / PATIENTS.length) + '%', icon: Brain, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', delta: '+3% this week' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', color: '#f0f0f5', fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Sidebar */}
      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #0ea5e9, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={20} color="white" /></div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>MindSathi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(14,165,233,0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
            <UserCheck size={14} color="#0ea5e9" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0ea5e9' }}>CARETAKER PANEL</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {TABS.map(t => { const Icon = t.icon; const active = tab === t.key; return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: active ? 'rgba(14,165,233,0.15)' : 'transparent', color: active ? '#0ea5e9' : '#5a5a72', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: active ? 700 : 500, marginBottom: '0.25rem', transition: 'all 0.2s', textAlign: 'left' }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b8ba3'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a72'; } }}>
              <Icon size={18} /><span style={{ flex: 1 }}>{t.label}</span>
              {t.count !== undefined && <span style={{ background: active ? 'rgba(14,165,233,0.25)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{t.count}</span>}
              {active && <ChevronRight size={14} />}
            </button>
          ); })}
        </nav>
        <div style={{ padding: '0 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>{staffName.charAt(0)}</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f0f5' }}>{staffName}</div>
              <div style={{ fontSize: '0.7rem', color: '#5a5a72' }}>Caretaker · Morning</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('staff_role'); navigate('/staff'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', borderRadius: '8px', border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 240, padding: '2rem', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="ct-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '0.25rem' }}>
              {tab === 'overview' ? `Good morning, ${staffName.split(' ')[0]}! 👋` : tab === 'patients' ? 'Patient Reports' : tab === 'reminders' ? 'Care Reminders' : 'Health Analytics'}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <p style={{ color: '#5a5a72', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <div style={{ padding: '0.2rem 0.6rem', background: 'rgba(217,70,239,0.1)', border: '1px solid rgba(217,70,239,0.2)', borderRadius: '6px', fontSize: '0.75rem', color: '#D946EF', fontWeight: 700 }}>
                Your Caretaker ID: {localStorage.getItem('caretaker_id') || 'N/A'}
              </div>
            </div>
          </div>
          <button style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer', position: 'relative' }}>
            <Bell size={18} />
            <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#f87171', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>3</span>
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {SUMMARY.map((s, i) => { const Icon = s.icon; return (
            <div key={i} className="ct-stat" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={s.color} /></div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f0f0f5', marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#5a5a72', fontWeight: 600, marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: s.color }}>{s.delta}</div>
            </div>
          ); })}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {tab === 'overview' && (
          <div className="ct-main">
            {/* Alerts */}
            {PATIENTS.flatMap(p => p.alerts.map(a => ({ patient: p.name, alert: a }))).length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                  <AlertTriangle size={18} /> Active Alerts
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {PATIENTS.flatMap(p => p.alerts.map(a => ({ patient: p.name, alert: a }))).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px' }}>
                      <AlertTriangle size={16} color="#f87171" />
                      <span style={{ fontSize: '0.875rem', color: '#f0f0f5' }}><strong style={{ color: '#f87171' }}>{item.patient}:</strong> {item.alert}</span>
                      <ChevronRight size={14} color="#5a5a72" style={{ marginLeft: 'auto' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Patient quick grid */}
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} color="#0ea5e9" /> Patient Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {PATIENTS.map(p => {
                const cond = conditionStyles[p.condition];
                return (
                  <div key={p.id} className="ct-patient-card" onClick={() => { setSelectedPatient(p); setTab('patients'); }} style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${cond.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg, ${cond.color}80, ${cond.color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: 'white' }}>{p.avatar}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f0f0f5' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#5a5a72' }}>Age {p.age} · {p.lastSeen}</div>
                      </div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: cond.bg, color: cond.color }}>{cond.label}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { label: 'Cognitive', value: `${p.cognitive}%`, icon: Brain },
                        { label: 'Games', value: p.games, icon: Zap },
                        { label: 'Streak', value: `${p.streak}d`, icon: Flame },
                      ].map(m => { const Icon = m.icon; return (
                        <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f5' }}>{m.value}</div>
                          <div style={{ fontSize: '0.65rem', color: '#5a5a72' }}>{m.label}</div>
                        </div>
                      ); })}
                    </div>
                    {p.alerts.length > 0 && (
                      <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#f87171' }}>
                        <AlertTriangle size={12} /> {p.alerts.length} alert{p.alerts.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Today's reminders preview */}
            <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#fbbf24" /> Today's Reminders
            </h3>
            <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
              {reminders.slice(0, 3).map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: r.done ? 0.5 : 1 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {reminderIcons[r.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f0f0f5', textDecoration: r.done ? 'line-through' : 'none' }}>{r.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#5a5a72' }}>{r.patient} · {r.time}</div>
                  </div>
                  <button onClick={() => toggleReminder(r.id)} style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${r.done ? '#10b981' : 'rgba(255,255,255,0.15)'}`, background: r.done ? 'rgba(16,185,129,0.15)' : 'transparent', color: r.done ? '#10b981' : '#5a5a72', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {r.done ? <CheckCircle size={14} /> : <Clock size={14} />}
                  </button>
                </div>
              ))}
              <button onClick={() => setTab('reminders')} style={{ width: '100%', padding: '0.875rem', border: 'none', background: 'rgba(14,165,233,0.05)', color: '#0ea5e9', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                View all reminders <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ─── PATIENTS TAB ─── */}
        {tab === 'patients' && (
          <div className="ct-main">
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.border = '1px solid rgba(14,165,233,0.4)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredPatients.map(p => {
                const cond = conditionStyles[p.condition];
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div key={p.id} className="ct-patient-card">
                    <div onClick={() => setSelectedPatient(isSelected ? null : p)} style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: `1px solid ${isSelected ? cond.color + '40' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${cond.color}80, ${cond.color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{p.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f0f5' }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>Age {p.age} · {p.doctor} · Last seen: {p.lastSeen}</div>
                        </div>
                        <span style={{ padding: '0.3rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, background: cond.bg, color: cond.color, border: `1px solid ${cond.color}30` }}>{cond.label}</span>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', transform: isSelected ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                          <ChevronRight size={12} color="#5a5a72" />
                        </div>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isSelected && (
                      <div style={{ background: 'rgba(14,14,26,0.5)', border: `1px solid ${cond.color}20`, borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                          {[
                            { label: 'Cognitive Score', value: `${p.cognitive}%`, color: cond.color },
                            { label: 'Mood Score', value: `${p.mood}/5`, color: '#a78bfa' },
                            { label: 'Games This Week', value: p.games, color: '#0ea5e9' },
                            { label: 'Current Streak', value: `${p.streak} days`, color: '#f59e0b' },
                          ].map((m, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: m.color }}>{m.value}</div>
                              <div style={{ fontSize: '0.75rem', color: '#5a5a72', marginTop: '0.2rem' }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b8ba3', marginBottom: '0.5rem' }}>Current Medications</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {p.meds.map(m => (
                              <span key={m} style={{ padding: '0.3rem 0.75rem', borderRadius: '999px', fontSize: '0.78rem', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Pill size={11} />{m}
                              </span>
                            ))}
                          </div>
                        </div>
                        {p.alerts.length > 0 && (
                          <div style={{ marginTop: '1rem' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem' }}>⚠ Active Alerts</div>
                            {p.alerts.map((a, i) => (
                              <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)', borderRadius: '8px', fontSize: '0.8rem', color: '#f87171', marginBottom: '0.4rem' }}>{a}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── REMINDERS TAB ─── */}
        {tab === 'reminders' && (
          <div className="ct-main">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reminders.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: `1px solid ${r.done ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '14px', opacity: r.done ? 0.55 : 1, transition: 'all 0.2s' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {reminderIcons[r.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f0f5', textDecoration: r.done ? 'line-through' : 'none', marginBottom: '0.2rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5a5a72', display: 'flex', gap: '0.75rem' }}>
                      <span>{r.patient}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} />{r.time}</span>
                    </div>
                  </div>
                  <button onClick={() => toggleReminder(r.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '999px', border: `1px solid ${r.done ? '#10b981' : 'rgba(255,255,255,0.12)'}`, background: r.done ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', color: r.done ? '#10b981' : '#8b8ba3', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}>
                    {r.done ? <><CheckCircle size={14} /> Done</> : <><Clock size={14} /> Mark Done</>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ANALYTICS TAB ─── */}
        {tab === 'analytics' && (
          <div className="ct-main">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Brain size={18} color="#7c3aed" /> Cognitive Trends</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient id="cogGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5a5a72' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#5a5a72' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="kognitiv" stroke="#7c3aed" fill="url(#cogGrad)" strokeWidth={2} name="Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} color="#0ea5e9" /> Daily Sessions</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={TREND_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#5a5a72' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#5a5a72' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="sessions" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Sessions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Per-patient summary */}
            <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={18} color="#10b981" /> Patient Comparative Analysis</h3>
              {PATIENTS.map(p => {
                const cond = conditionStyles[p.condition];
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: cond.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: cond.color, flexShrink: 0 }}>{p.avatar}</div>
                    <div style={{ width: 130, fontSize: '0.85rem', color: '#8b8ba3', fontWeight: 600 }}>{p.name.split(' ')[0]}</div>
                    <div style={{ flex: 1, height: 28, background: 'rgba(255,255,255,0.04)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${p.cognitive}%`, height: '100%', background: `linear-gradient(90deg, ${cond.color}80, ${cond.color})`, borderRadius: '999px', display: 'flex', alignItems: 'center', paddingLeft: 10, fontSize: '0.7rem', fontWeight: 700, color: 'white', transition: 'width 0.6s ease' }}>{p.cognitive}%</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: cond.color, fontWeight: 700, width: 70, textAlign: 'right' }}>{cond.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
