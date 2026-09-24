import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Stethoscope, Brain, LogOut, Bell, Activity, TrendingUp, Users,
  ChevronRight, BarChart3, FileText, Star, Award, Calendar,
  Clock, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Eye,
  User, Phone, Mail, Clipboard, BookOpen, Search, Filter
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const MY_PATIENTS = [
  { id: 1, name: 'Kamala Devi', age: 72, condition: 'stable', cognitive: 72, sessions: 48, lastVisit: '2 days ago', diagnosis: 'Mild Cognitive Impairment', progress: '+5% this month', avatar: 'KD', history: [{ date: 'Sep 20', note: 'Patient showing improvement in face recall. Increased sessions.' }, { date: 'Sep 15', note: 'Adjusted Donepezil dosage. Monitoring cognitive stability.' }] },
  { id: 2, name: 'Rina Bora', age: 68, condition: 'improving', cognitive: 65, sessions: 32, lastVisit: '5 days ago', diagnosis: "Early Alzheimer's", progress: '+8% this month', avatar: 'RB', history: [{ date: 'Sep 18', note: 'Significant improvement in memory games. Family reported positive changes.' }] },
  { id: 3, name: 'Dipak Saikia', age: 75, condition: 'warning', cognitive: 45, sessions: 16, lastVisit: '10 days ago', diagnosis: 'Moderate Cognitive Decline', progress: '-3% this month', avatar: 'DS', history: [{ date: 'Sep 22', note: 'Concerning decline. Recommend increased monitoring and family intervention.' }] },
];

const PAST_PATIENTS = [
  { id: 10, name: 'Geeta Narayan', age: 69, sessions: 120, discharged: 'Jul 2026', outcome: 'Improved', diagnosis: 'MCI', avatar: 'GN' },
  { id: 11, name: 'Ratan Das', age: 74, sessions: 85, discharged: 'May 2026', outcome: 'Stable', diagnosis: "Mild Alzheimer's", avatar: 'RD' },
  { id: 12, name: 'Lata Mishra', age: 71, sessions: 200, discharged: 'Mar 2026', outcome: 'Significantly Improved', diagnosis: 'Dementia', avatar: 'LM' },
];

const PERFORMANCE_DATA = [
  { month: 'Apr', patients: 8, accuracy: 78 },
  { month: 'May', patients: 10, accuracy: 80 },
  { month: 'Jun', patients: 12, accuracy: 82 },
  { month: 'Jul', patients: 11, accuracy: 85 },
  { month: 'Aug', patients: 13, accuracy: 83 },
  { month: 'Sep', patients: MY_PATIENTS.length, accuracy: 87 },
];

const RADAR_DATA = [
  { skill: 'Diagnosis', value: 88 },
  { skill: 'Treatment', value: 92 },
  { skill: 'Patient Eng.', value: 85 },
  { skill: 'Outcomes', value: 79 },
  { skill: 'Documentation', value: 95 },
  { skill: 'Research', value: 72 },
];

const conditionStyles = {
  stable: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Stable' },
  improving: { color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', label: 'Improving' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Needs Attention' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#f0f0f5', fontWeight: 700, marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color ?? p.stroke }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</p>)}
    </div>
  );
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [search, setSearch] = useState('');
  const staffName = localStorage.getItem('staff_name') || 'Doctor';

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.doc-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo('.doc-stat', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
      .fromTo('.doc-main', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');
  }, []);

  useEffect(() => {
    gsap.fromTo('.doc-row',
      { opacity: 0, x: tab === 'patients' ? -30 : 30 },
      { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' }
    );
  }, [tab]);

  const filteredPatients = MY_PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'patients', label: 'My Patients', icon: Users, count: MY_PATIENTS.length },
    { key: 'past', label: 'Past Patients', icon: BookOpen, count: PAST_PATIENTS.length },
    { key: 'profile', label: 'My Profile', icon: User },
  ];

  const SUMMARY = [
    { label: 'Active Patients', value: MY_PATIENTS.length, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.12)', delta: '+2 this month' },
    { label: 'Avg Cognitive Score', value: '61%', icon: Brain, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', delta: '+4% this month' },
    { label: 'Total Sessions', value: 96, icon: Activity, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)', delta: '8 this week' },
    { label: 'Patient Rating', value: '4.8★', icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', delta: 'Top 10%' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', color: '#f0f0f5', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      <aside style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 240, background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 100, display: 'flex', flexDirection: 'column', padding: '1.5rem 0' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={20} color="white" /></div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>MindSathi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
            <Stethoscope size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>DOCTOR PANEL</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {TABS.map(t => { const Icon = t.icon; const active = tab === t.key; return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0.875rem', borderRadius: '10px', border: 'none', cursor: 'pointer', background: active ? 'rgba(16,185,129,0.15)' : 'transparent', color: active ? '#10b981' : '#5a5a72', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: active ? 700 : 500, marginBottom: '0.25rem', transition: 'all 0.2s', textAlign: 'left' }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b8ba3'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a72'; } }}>
              <Icon size={18} /><span style={{ flex: 1 }}>{t.label}</span>
              {t.count !== undefined && <span style={{ background: active ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>{t.count}</span>}
              {active && <ChevronRight size={14} />}
            </button>
          ); })}
        </nav>
        <div style={{ padding: '0 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              {staffName.split('.').pop()?.trim()?.charAt(0) || 'D'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f0f5' }}>{staffName}</div>
              <div style={{ fontSize: '0.7rem', color: '#5a5a72' }}>Neurology · MBBS, MD</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('staff_role'); navigate('/staff'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', borderRadius: '8px', border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 240, padding: '2rem', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <div className="doc-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '0.25rem' }}>
              {tab === 'overview' ? `Welcome, ${staffName}` : tab === 'patients' ? 'My Active Patients' : tab === 'past' ? 'Patient History' : 'My Profile'}
            </h1>
            <p style={{ color: '#5a5a72', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer' }}>
            <Bell size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {SUMMARY.map((s, i) => { const Icon = s.icon; return (
            <div key={i} className="doc-stat" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', transition: 'all 0.3s' }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}><Icon size={20} color={s.color} /></div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f0f0f5', marginBottom: '0.2rem' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#5a5a72', fontWeight: 600, marginBottom: '0.2rem' }}>{s.label}</div>
              <div style={{ fontSize: '0.75rem', color: s.color }}>{s.delta}</div>
            </div>
          ); })}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div className="doc-main">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18} color="#10b981" /> Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={PERFORMANCE_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5a5a72' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#5a5a72' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="patients" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Patients" />
                    <Line type="monotone" dataKey="accuracy" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} name="Accuracy%" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Award size={18} color="#f59e0b" /> Skills Radar</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={RADAR_DATA}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: '#5a5a72' }} />
                    <Radar name="Skills" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={18} color="#0ea5e9" /> Today's Appointments</h3>
              {[
                { time: '09:00 AM', patient: 'Kamala Devi', type: 'Follow-up Review', status: 'completed' },
                { time: '11:30 AM', patient: 'Dipak Saikia', type: 'Urgent Assessment', status: 'upcoming' },
                { time: '02:00 PM', patient: 'Rina Bora', type: 'Monthly Check-in', status: 'upcoming' },
              ].map((appt, i) => (
                <div key={i} className="doc-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 70, fontSize: '0.8rem', color: '#5a5a72', fontWeight: 600 }}>{appt.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f0f0f5' }}>{appt.patient}</div>
                    <div style={{ fontSize: '0.75rem', color: '#5a5a72' }}>{appt.type}</div>
                  </div>
                  <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: appt.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(14,165,233,0.12)', color: appt.status === 'completed' ? '#10b981' : '#0ea5e9' }}>
                    {appt.status === 'completed' ? '✓ Done' : '● Upcoming'}
                  </span>
                </div>
              ))}
            </div>
            {MY_PATIENTS.filter(p => p.condition === 'warning').map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="#f59e0b" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f5' }}>{p.name} — Needs Attention</div>
                  <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>Cognitive score at {p.cognitive}%. Consider scheduling urgent review.</div>
                </div>
                <button onClick={() => { setSelectedPatient(p); setTab('patients'); }} style={{ padding: '0.4rem 0.875rem', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#fbbf24', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>View</button>
              </div>
            ))}
          </div>
        )}

        {/* Patients */}
        {tab === 'patients' && (
          <div className="doc-main">
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients..."
                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.border = '1px solid rgba(16,185,129,0.4)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredPatients.map(p => {
                const cond = conditionStyles[p.condition];
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <div key={p.id} className="doc-row">
                    <div onClick={() => setSelectedPatient(isSelected ? null : p)} style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: `1px solid ${isSelected ? cond.color + '40' : 'rgba(255,255,255,0.06)'}`, borderRadius: '16px', padding: '1.25rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${cond.color}80, ${cond.color}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{p.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f0f0f5' }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>Age {p.age} · {p.diagnosis} · Last visit: {p.lastVisit}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ padding: '0.3rem 0.875rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700, background: cond.bg, color: cond.color }}>{cond.label}</span>
                          <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: p.progress.startsWith('+') ? '#10b981' : '#f87171', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                            {p.progress.startsWith('+') ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                            {p.progress}
                          </div>
                        </div>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                          <ChevronRight size={12} color="#5a5a72" />
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div style={{ background: 'rgba(14,14,26,0.5)', border: `1px solid ${cond.color}20`, borderTop: 'none', borderRadius: '0 0 16px 16px', padding: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                          {[
                            { label: 'Cognitive Score', value: `${p.cognitive}%`, color: cond.color },
                            { label: 'Sessions Completed', value: p.sessions, color: '#0ea5e9' },
                            { label: 'Progress', value: p.progress, color: p.progress.startsWith('+') ? '#10b981' : '#f87171' },
                          ].map((m, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.875rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: m.color }}>{m.value}</div>
                              <div style={{ fontSize: '0.72rem', color: '#5a5a72', marginTop: '0.2rem' }}>{m.label}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginBottom: '1.25rem' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b8ba3', marginBottom: '0.75rem' }}>Clinical Notes</div>
                          {p.history.map((h, i) => (
                            <div key={i} style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '0.75rem', color: '#5a5a72', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11} /> {h.date}</div>
                              <div style={{ fontSize: '0.85rem', color: '#8b8ba3', lineHeight: 1.5 }}>{h.note}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: `1px solid ${cond.color}30`, background: `${cond.color}10`, color: cond.color, cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Add Note</button>
                          <button style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Schedule Appointment</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Past Patients */}
        {tab === 'past' && (
          <div className="doc-main">
            <div style={{ marginBottom: '1rem', padding: '1rem 1.25rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '12px', fontSize: '0.85rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} />
              {PAST_PATIENTS.length} patients successfully discharged · Total {PAST_PATIENTS.reduce((s, p) => s + p.sessions, 0)} sessions conducted
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {PAST_PATIENTS.map(p => (
                <div key={p.id} className="doc-row" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.85 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#8b8ba3', flexShrink: 0 }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f0f5' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>Age {p.age} · {p.diagnosis} · {p.sessions} sessions</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#5a5a72', marginBottom: '0.25rem' }}>Discharged {p.discharged}</div>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>{p.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="doc-main" style={{ maxWidth: 800 }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(14,165,233,0.05) 100%)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                  {staffName.split('.').pop()?.trim()?.charAt(0) || 'D'}
                </div>
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '2px solid #06060e' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '0.25rem' }}>{staffName}</h2>
                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 600, marginBottom: '0.75rem' }}>Neurologist · MBBS, MD, DM</div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {['Neurology', 'Cognitive Care', 'Dementia'].map(t => (
                    <span key={t} style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#5a5a72' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} />ananya@mindsathi.ai</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} />+91 98765 43210</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={14} />Joined Jan 2026</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { label: 'Total Patients Treated', value: MY_PATIENTS.length + PAST_PATIENTS.length, icon: Users, color: '#10b981' },
                { label: 'Avg Session Accuracy', value: '87%', icon: Activity, color: '#7c3aed' },
                { label: 'Patient Satisfaction', value: '4.8/5', icon: Star, color: '#f59e0b' },
              ].map((s, i) => { const Icon = s.icon; return (
                <div key={i} style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}><Icon size={20} color={s.color} /></div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: '#5a5a72', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ); })}
            </div>
            <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={18} color="#0ea5e9" /> My Performance Over Time</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5a5a72' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#5a5a72' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="accuracy" stroke="#10b981" fill="url(#perfGrad)" strokeWidth={2} name="Accuracy%" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
