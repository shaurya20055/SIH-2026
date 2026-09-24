import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  Shield, Users, Stethoscope, UserCheck, LogOut, Plus, Search,
  MoreVertical, TrendingUp, Activity, Bell, Settings, X,
  CheckCircle, AlertTriangle, Edit2, Trash2, ChevronRight, BarChart3,
  Brain, Calendar, Phone, Mail
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Ananya Mehta', specialty: 'Neurology', email: 'ananya@ms.ai', phone: '+91 98765 43210', patients: 24, status: 'active', joined: 'Jan 2026', avatar: 'AM' },
  { id: 2, name: 'Dr. Rohan Kapoor', specialty: 'Psychiatry', email: 'rohan@ms.ai', phone: '+91 87654 32109', patients: 18, status: 'active', joined: 'Mar 2026', avatar: 'RK' },
  { id: 3, name: 'Dr. Priya Singh', specialty: 'Geriatrics', email: 'priya@ms.ai', phone: '+91 76543 21098', patients: 31, status: 'on-leave', joined: 'Feb 2026', avatar: 'PS' },
  { id: 4, name: 'Dr. Sameer Bose', specialty: 'Cognitive Science', email: 'sameer@ms.ai', phone: '+91 65432 10987', patients: 15, status: 'active', joined: 'Apr 2026', avatar: 'SB' },
];

const MOCK_CARETAKERS = [
  { id: 1, name: 'Priya Sharma', email: 'priya.s@ms.ai', phone: '+91 91234 56789', patients: 4, shift: 'Morning', status: 'active', avatar: 'PS' },
  { id: 2, name: 'Vikram Nair', email: 'vikram@ms.ai', phone: '+91 92345 67890', patients: 3, shift: 'Evening', status: 'active', avatar: 'VN' },
  { id: 3, name: 'Sunita Rao', email: 'sunita@ms.ai', phone: '+91 93456 78901', patients: 5, shift: 'Night', status: 'active', avatar: 'SR' },
  { id: 4, name: 'Deepak Verma', email: 'deepak@ms.ai', phone: '+91 94567 89012', patients: 2, shift: 'Morning', status: 'inactive', avatar: 'DV' },
];

const WEEKLY_DATA = [
  { day: 'Mon', sessions: 45, alerts: 3 },
  { day: 'Tue', sessions: 52, alerts: 5 },
  { day: 'Wed', sessions: 48, alerts: 2 },
  { day: 'Thu', sessions: 61, alerts: 4 },
  { day: 'Fri', sessions: 55, alerts: 3 },
  { day: 'Sat', sessions: 38, alerts: 1 },
  { day: 'Sun', sessions: 29, alerts: 2 },
];

const PIE_DATA = [
  { name: 'Stable', value: 65, color: '#10b981' },
  { name: 'Improving', value: 20, color: '#0ea5e9' },
  { name: 'Warning', value: 10, color: '#fbbf24' },
  { name: 'Critical', value: 5, color: '#f87171' },
];

const SUMMARY_STATS = [
  { label: 'Total Doctors', value: 4, icon: Stethoscope, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', delta: '+2 this month' },
  { label: 'Caretakers', value: 4, icon: UserCheck, color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', delta: '+1 this month' },
  { label: 'Total Patients', value: 88, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.15)', delta: '+6 this week' },
  { label: 'Active Alerts', value: 3, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', delta: '-2 from yesterday' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(10,10,20,0.95)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
      <p style={{ color: '#f0f0f5', fontWeight: 700, marginBottom: '0.3rem' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddCaretaker, setShowAddCaretaker] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [patientsCount, setPatientsCount] = useState(0);
  const [notification, setNotification] = useState(null);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialty: '', email: '', phone: '' });
  const [newCaretaker, setNewCaretaker] = useState({ name: '', email: '', phone: '', shift: 'Morning' });
  const containerRef = useRef(null);
  const staffName = localStorage.getItem('staff_name') || 'Admin';

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.adm-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo('.adm-stat', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, '-=0.4')
      .fromTo('.adm-main', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

    // Fetch actual data from backend
    const fetchData = async () => {
      try {
        const [docsRes, caresRes, patsRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/users/?role=doctor').then(r => r.json()),
          fetch('http://127.0.0.1:8000/api/users/?role=caregiver').then(r => r.json()),
          fetch('http://127.0.0.1:8000/api/patients/').then(r => r.json())
        ]);
        
        if (Array.isArray(docsRes)) {
          setDoctors(docsRes.map(d => ({
            id: d.id,
            name: `Dr. ${d.first_name} ${d.last_name}`.trim() || d.username,
            specialty: 'Neurology', // Defaulting as backend doesn't have specialty field
            email: d.email || 'No email',
            phone: 'N/A',
            patients: patsRes.filter(p => p.doctor === d.id).length || 0,
            status: 'active',
            joined: 'Recent',
            avatar: d.first_name ? `${d.first_name[0]}${d.last_name[0]}` : d.username.substring(0,2).toUpperCase()
          })));
        }
        
        if (Array.isArray(caresRes)) {
          setCaretakers(caresRes.map(c => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`.trim() || c.username,
            email: c.email || 'No email',
            phone: 'N/A',
            shift: 'Morning',
            patients: patsRes.filter(p => p.caregiver === c.id).length || 0,
            status: 'active',
            avatar: c.first_name ? `${c.first_name[0]}${c.last_name[0]}` : c.username.substring(0,2).toUpperCase()
          })));
        }
        
        if (Array.isArray(patsRes)) setPatientsCount(patsRes.length);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    gsap.fromTo('.adm-row',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
    );
  }, [tab, doctors, caretakers]);

  const showNotif = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addDoctor = () => {
    if (!newDoctor.name || !newDoctor.email) return;
    const initials = newDoctor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    setDoctors(prev => [...prev, { ...newDoctor, id: Date.now(), patients: 0, status: 'active', joined: 'Sep 2026', avatar: initials }]);
    setNewDoctor({ name: '', specialty: '', email: '', phone: '' });
    setShowAddDoctor(false);
    showNotif(`Dr. ${newDoctor.name} added successfully!`);
  };

  const addCaretaker = () => {
    if (!newCaretaker.name || !newCaretaker.email) return;
    const initials = newCaretaker.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    setCaretakers(prev => [...prev, { ...newCaretaker, id: Date.now(), patients: 0, status: 'active', avatar: initials }]);
    setNewCaretaker({ name: '', email: '', phone: '', shift: 'Morning' });
    setShowAddCaretaker(false);
    showNotif('Caretaker added successfully!');
  };

  const removeDoctor = (id) => {
    setDoctors(prev => prev.filter(d => d.id !== id));
    showNotif('Doctor removed from system.', 'warning');
  };

  const removeCaretaker = (id) => {
    setCaretakers(prev => prev.filter(c => c.id !== id));
    showNotif('Caretaker removed from system.', 'warning');
  };

  const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));
  const filteredCaretakers = caretakers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const TABS = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'doctors', label: 'Doctors', icon: Stethoscope, count: doctors.length },
    { key: 'caretakers', label: 'Caretakers', icon: UserCheck, count: caretakers.length },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const inputStyle = { width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#f0f0f5', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif', outline: 'none', transition: 'border 0.2s' };

  return (
    <div style={{ minHeight: '100vh', background: '#06060e', color: '#f0f0f5', fontFamily: 'Inter, sans-serif' }}>
      {/* Ambient */}
      <div style={{ position: 'fixed', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(76,29,149,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: notification.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
          borderRadius: '12px', padding: '1rem 1.5rem',
          color: notification.type === 'success' ? '#34d399' : '#fbbf24',
          fontSize: '0.9rem', fontWeight: 600, backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          animation: 'slideInRight 0.3s ease',
        }}>
          {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {notification.msg}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 240,
        background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 100,
        display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>MindSathi</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(124,58,237,0.12)', borderRadius: '8px', padding: '0.4rem 0.75rem' }}>
            <Shield size={14} color="#7c3aed" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>ADMIN PANEL</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0 0.75rem' }}>
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
                color: active ? '#a78bfa' : '#5a5a72', fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem', fontWeight: active ? 700 : 500, marginBottom: '0.25rem',
                transition: 'all 0.2s', textAlign: 'left',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b8ba3'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#5a5a72'; } }}
              >
                <Icon size={18} />
                <span style={{ flex: 1 }}>{t.label}</span>
                {t.count !== undefined && (
                  <span style={{ background: active ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.08)', borderRadius: '999px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    {t.count}
                  </span>
                )}
                {active && <ChevronRight size={14} />}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: '0 0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
              {staffName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f0f5' }}>{staffName}</div>
              <div style={{ fontSize: '0.7rem', color: '#5a5a72' }}>System Administrator</div>
            </div>
          </div>
          <button onClick={() => { localStorage.removeItem('staff_role'); navigate('/staff'); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', borderRadius: '8px', border: 'none', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.08)'}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: 240, padding: '2rem', minHeight: '100vh', position: 'relative', zIndex: 1 }} ref={containerRef}>
        {/* Header */}
        <div className="adm-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#f0f0f5', marginBottom: '0.25rem' }}>
              {tab === 'overview' ? 'System Overview' : tab === 'doctors' ? 'Doctor Management' : tab === 'caretakers' ? 'Caretaker Management' : 'Settings'}
            </h1>
            <p style={{ color: '#5a5a72', fontSize: '0.875rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer' }}>
              <Bell size={18} />
            </button>
            <button style={{ padding: '0.6rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer' }}>
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Summary Stats — always visible */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Doctors', value: doctors.length, icon: Stethoscope, color: '#7c3aed', bg: 'rgba(124,58,237,0.15)', delta: 'Updated' },
            { label: 'Caretakers', value: caretakers.length, icon: UserCheck, color: '#0ea5e9', bg: 'rgba(14,165,233,0.15)', delta: 'Updated' },
            { label: 'Total Patients', value: patientsCount, icon: Users, color: '#10b981', bg: 'rgba(16,185,129,0.15)', delta: 'Updated' },
            { label: 'Active Alerts', value: 3, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', delta: 'Active' },
          ].map((s, i) => {
            const Icon = s.icon; return (
              <div key={i} className="adm-stat" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${s.color}30`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color={s.color} /></div>
                  <TrendingUp size={14} color="#34d399" />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#f0f0f5', marginBottom: '0.2rem' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#5a5a72', fontWeight: 600, marginBottom: '0.3rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.75rem', color: '#34d399' }}>{s.delta}</div>
              </div>
            );
          })}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {tab === 'overview' && (
          <div className="adm-main">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18} color="#7c3aed" /> Weekly Activity</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={WEEKLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#5a5a72' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#5a5a72' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="sessions" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4, fill: '#7c3aed' }} name="Sessions" />
                    <Line type="monotone" dataKey="alerts" stroke="#f87171" strokeWidth={2} dot={{ r: 3, fill: '#f87171' }} name="Alerts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#0ea5e9" /> Patient Status</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val) => [`${val}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {PIE_DATA.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ fontSize: '0.75rem', color: '#5a5a72' }}>{d.name} {d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            <div style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bell size={18} color="#f59e0b" /> Recent System Activity</h3>
              {[
                { msg: 'Dr. Ananya Mehta reviewed patient Kamala Devi\'s report', time: '2 min ago', type: 'info' },
                { msg: 'Caretaker Priya Sharma submitted daily care log', time: '15 min ago', type: 'success' },
                { msg: 'Alert: Patient Dipak Saikia showing cognitive decline', time: '1 hr ago', type: 'warning' },
                { msg: 'New patient Rina Bora onboarded by Dr. Rohan Kapoor', time: '3 hrs ago', type: 'info' },
                { msg: 'System backup completed successfully', time: '6 hrs ago', type: 'success' },
              ].map((act, i) => (
                <div key={i} className="adm-row" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: act.type === 'success' ? '#10b981' : act.type === 'warning' ? '#f59e0b' : '#0ea5e9' }} />
                  <div style={{ flex: 1, fontSize: '0.875rem', color: '#8b8ba3' }}>{act.msg}</div>
                  <div style={{ fontSize: '0.75rem', color: '#5a5a72', whiteSpace: 'nowrap' }}>{act.time}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── DOCTORS TAB ─── */}
        {tab === 'doctors' && (
          <div className="adm-main">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search doctors by name or specialty..."
                  style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(124,58,237,0.4)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <button onClick={() => setShowAddDoctor(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.25rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Plus size={16} /> Add Doctor
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredDoctors.map(doc => (
                <div key={doc.id} className="adm-row" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(124,58,237,0.2)'; e.currentTarget.style.background = 'rgba(20,14,36,0.8)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(14,14,26,0.7)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{doc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f0f5' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>{doc.specialty} · Joined {doc.joined}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5a5a72' }}>
                    <Mail size={13} /> {doc.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5a5a72' }}>
                    <Users size={13} /> {doc.patients} patients
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: doc.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: doc.status === 'active' ? '#34d399' : '#fbbf24' }}>
                    {doc.status}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer' }}><Edit2 size={13} /></button>
                    <button onClick={() => removeDoctor(doc.id)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.06)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── CARETAKERS TAB ─── */}
        {tab === 'caretakers' && (
          <div className="adm-main">
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#5a5a72' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search caretakers..."
                  style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                  onFocus={e => e.target.style.border = '1px solid rgba(14,165,233,0.4)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
              </div>
              <button onClick={() => setShowAddCaretaker(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.25rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6d28d9)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 4px 20px rgba(14,165,233,0.3)', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <Plus size={16} /> Add Caretaker
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredCaretakers.map(ct => (
                <div key={ct.id} className="adm-row" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.border = '1px solid rgba(14,165,233,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>{ct.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f0f0f5' }}>{ct.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>{ct.shift} Shift</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5a5a72' }}>
                    <Mail size={13} /> {ct.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#5a5a72' }}>
                    <Users size={13} /> {ct.patients} patients
                  </div>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, background: ct.status === 'active' ? 'rgba(16,185,129,0.12)' : 'rgba(90,90,114,0.12)', color: ct.status === 'active' ? '#34d399' : '#5a5a72' }}>
                    {ct.status}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)', color: '#5a5a72', cursor: 'pointer' }}><Edit2 size={13} /></button>
                    <button onClick={() => removeCaretaker(ct.id)} style={{ padding: '0.4rem', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.15)', background: 'rgba(248,113,113,0.06)', color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {tab === 'settings' && (
          <div className="adm-main" style={{ maxWidth: 700 }}>
            {[
              { label: 'Platform Name', value: 'MindSathi', desc: 'Displayed across the application' },
              { label: 'Admin Email', value: 'admin@mindsathi.ai', desc: 'Primary contact email' },
              { label: 'Session Timeout', value: '30 minutes', desc: 'Auto-logout after inactivity' },
              { label: 'Max Patients per Doctor', value: '50', desc: 'Limit for doctor assignment' },
            ].map((s, i) => (
              <div key={i} className="adm-row" style={{ background: 'rgba(14,14,26,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#f0f0f5', marginBottom: '0.2rem' }}>{s.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#5a5a72' }}>{s.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: '0.9rem' }}>{s.value}</span>
                  <button style={{ padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(124,58,237,0.2)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'Inter, sans-serif' }}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── ADD DOCTOR MODAL ─── */}
      {showAddDoctor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(14,14,26,0.98)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 8px 60px rgba(124,58,237,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={20} color="#7c3aed" /> Add New Doctor</h3>
              <button onClick={() => setShowAddDoctor(false)} style={{ background: 'none', border: 'none', color: '#5a5a72', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Full Name', 'name', 'Dr. Firstname Lastname'], ['Specialty', 'specialty', 'e.g. Neurology'], ['Email', 'email', 'doctor@mindsathi.ai'], ['Phone', 'phone', '+91 XXXXX XXXXX']].map(([lbl, key, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>{lbl}</label>
                  <input value={newDoctor[key]} onChange={e => setNewDoctor(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(124,58,237,0.4)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowAddDoctor(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#8b8ba3', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                <button onClick={addDoctor} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add Doctor</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ADD CARETAKER MODAL ─── */}
      {showAddCaretaker && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'rgba(14,14,26,0.98)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 8px 60px rgba(14,165,233,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><UserCheck size={20} color="#0ea5e9" /> Add New Caretaker</h3>
              <button onClick={() => setShowAddCaretaker(false)} style={{ background: 'none', border: 'none', color: '#5a5a72', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['Full Name', 'name', 'Firstname Lastname'], ['Email', 'email', 'caretaker@mindsathi.ai'], ['Phone', 'phone', '+91 XXXXX XXXXX']].map(([lbl, key, ph]) => (
                <div key={key}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>{lbl}</label>
                  <input value={newCaretaker[key]} onChange={e => setNewCaretaker(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inputStyle}
                    onFocus={e => e.target.style.border = '1px solid rgba(14,165,233,0.4)'}
                    onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8b8ba3', display: 'block', marginBottom: '0.4rem' }}>Shift</label>
                <select value={newCaretaker.shift} onChange={e => setNewCaretaker(p => ({ ...p, shift: e.target.value }))} style={inputStyle}>
                  <option>Morning</option><option>Evening</option><option>Night</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowAddCaretaker(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#8b8ba3', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancel</button>
                <button onClick={addCaretaker} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0ea5e9, #6d28d9)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Add Caretaker</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        select option { background: #0a0a14; }
      `}</style>
    </div>
  );
}
