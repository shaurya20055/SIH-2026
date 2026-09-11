import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Upload, BarChart3, Image, Bell, Flame, Activity, Brain, LayoutDashboard, Stethoscope, Clock, Pill, Droplets, Calendar, Pin, CheckCircle, Inbox, AlertTriangle } from 'lucide-react';
import { getPatientDashboard, getMemoryItems, createMemoryItem } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import gsap from 'gsap';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(6,6,14,0.95)', border: '1px solid var(--glass-border)',
      borderRadius: '0.75rem', padding: '0.75rem 1rem', fontSize: '0.8rem',
      boxShadow: 'var(--shadow-md)'
    }}>
      <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? Math.round(p.value) : p.value}</p>
      ))}
    </div>
  );
};

export default function CaregiverDashboard({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [tab, setTab] = useState('stats');
  const [showUpload, setShowUpload] = useState(false);
  const [newMemory, setNewMemory] = useState({ label: '', item_type: 'person', photo_url: '' });
  const containerRef = useRef(null);

  useEffect(() => { loadDashboard(); }, [patientId]);

  useEffect(() => {
    if (data && containerRef.current) {
      gsap.fromTo(containerRef.current.querySelectorAll('.gsap-fade'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [data, tab]);

  const loadDashboard = async () => {
    try {
      const [dRes, mRes] = await Promise.all([
        getPatientDashboard(patientId),
        getMemoryItems(patientId),
      ]);
      setData(dRes.data);
      setMemories(Array.isArray(mRes.data) ? mRes.data : mRes.data.results || []);
    } catch {
      setData({
        patient: { name: 'Kamala Devi', age: 72, cognitive_level: 1, total_xp: 450, level: 3, level_title: 'Champion', streak: 3 },
        accuracy_trend: Array.from({ length: 15 }, (_, i) => ({ date: `Day ${i + 1}`, accuracy: 40 + Math.random() * 50, game_type: 'face_recall' })),
        mood_trend: Array.from({ length: 7 }, (_, i) => ({ date: `Day ${i + 1}`, score: Math.floor(2 + Math.random() * 3) })),
        games_this_week: 12, avg_accuracy_week: 72.5,
        decline_status: { status: 'stable', message: 'Cognitive performance is stable', slope: 0.2 },
        reminders_today: [], weekly_grade: 'B',
        games_by_type: [
          { game_type: 'face_recall', count: 8, avg_accuracy: 75 },
          { game_type: 'flip_card', count: 5, avg_accuracy: 68 },
          { game_type: 'sound_match', count: 4, avg_accuracy: 80 },
          { game_type: 'daily_routine', count: 3, avg_accuracy: 60 },
        ],
      });
    }
  };

  const handleUploadMemory = async () => {
    if (!newMemory.label.trim()) return;
    try {
      await createMemoryItem({ ...newMemory, patient: patientId, photo_url: newMemory.photo_url || `https://picsum.photos/seed/${newMemory.label}/400/400` });
    } catch {}
    setShowUpload(false);
    setNewMemory({ label: '', item_type: 'person', photo_url: '' });
    loadDashboard();
  };

  const renderReminderIcon = (type) => {
    switch(type) {
      case 'medicine': return <Pill size={18} />;
      case 'hydration': return <Droplets size={18} color="var(--accent-cyan)" />;
      case 'appointment': return <Calendar size={18} color="var(--accent-violet)" />;
      case 'activity': return <Activity size={18} color="var(--success)" />;
      default: return <Pin size={18} />;
    }
  };

  const getAlertIcon = (status) => {
    switch(status) {
      case 'alert': return <AlertTriangle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      case 'improving': return <TrendingUp size={18} />;
      default: return <CheckCircle size={18} />;
    }
  };

  if (!data) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ color: 'var(--accent-violet)' }}>
          <BarChart3 size={48} />
        </motion.div>
      </div>
    );
  }

  const p = data.patient;
  const declineColors = { alert: 'var(--danger)', warning: 'var(--warning)', improving: 'var(--success)', stable: 'var(--accent-cyan)', insufficient_data: 'var(--text-muted)' };

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-3">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')} style={{ padding: 0, marginBottom: '0.25rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 size={24} color="var(--accent-purple)" />
            Caregiver Dashboard
          </h1>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/doctor')}>
          <Stethoscope size={16} /> Doctor View
        </button>
      </motion.div>

      {/* Patient Summary */}
      <motion.div
        className="glass-card glow-indigo mb-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--gradient-neural)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: 'white', fontWeight: 700,
          }}>
            {p.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.2rem' }}>{p.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Age {p.age} · Level {p.level} {p.level_title} · {p.total_xp} XP</p>
          </div>
          <div className={`grade-circle grade-${data.weekly_grade}`}>{data.weekly_grade}</div>
        </div>
      </motion.div>

      {/* Decline Alert */}
      {data.decline_status && data.decline_status.status !== 'stable' && (
        <div className={`alert-banner ${data.decline_status.status}`}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {getAlertIcon(data.decline_status.status)}
          </span>
          <span>{data.decline_status.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-group">
        {[['stats', 'Stats', BarChart3], ['memory', 'Memory Bank', Image], ['reminders', 'Reminders', Bell]].map(([key, label, Icon]) => (
          <button key={key} className={`tab-btn ${tab === key ? 'active' : ''} flex items-center gap-2`} onClick={() => setTab(key)}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div ref={containerRef}>
        {/* Stats Tab */}
        {tab === 'stats' && (
          <div>
            <div className="grid-4 mb-3">
              <div className="stat-card gsap-fade">
                <div className="stat-value">{data.games_this_week}</div>
                <div className="stat-label">Games/Week</div>
              </div>
              <div className="stat-card gsap-fade">
                <div className="stat-value">{data.avg_accuracy_week}%</div>
                <div className="stat-label">Avg Accuracy</div>
              </div>
              <div className="stat-card gsap-fade">
                <div className="stat-value flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, #F59E0B, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  <Flame size={18} color="#F59E0B" /> {p.streak}
                </div>
                <div className="stat-label">Streak</div>
              </div>
              <div className="stat-card gsap-fade">
                <div className="stat-value flex items-center justify-center" style={{ color: declineColors[data.decline_status?.status], fontSize: '1rem', minHeight: '34px' }}>
                  {getAlertIcon(data.decline_status?.status)}
                </div>
                <div className="stat-label">{data.decline_status?.status || 'stable'}</div>
              </div>
            </div>

            <div className="chart-container gsap-fade">
              <h3 className="mb-2 flex items-center gap-2"><TrendingUp size={18} /> Accuracy Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.accuracy_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="accuracy" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container gsap-fade">
              <h3 className="mb-2 flex items-center gap-2"><Brain size={18} /> Mood Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.mood_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container gsap-fade">
              <h3 className="mb-2 flex items-center gap-2"><LayoutDashboard size={18} /> Games by Type</h3>
              {data.games_by_type?.map(g => (
                <div key={g.game_type} className="flex items-center gap-2 mb-2">
                  <span style={{ width: '110px', fontWeight: 500, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {g.game_type.replace('_', ' ')}
                  </span>
                  <div style={{ flex: 1, height: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${g.avg_accuracy || 0}%`, height: '100%',
                      background: 'var(--gradient-neural)', borderRadius: '12px',
                      transition: 'width 0.5s', display: 'flex', alignItems: 'center',
                      paddingLeft: '8px', color: 'white', fontSize: '0.7rem', fontWeight: 700,
                    }}>
                      {Math.round(g.avg_accuracy || 0)}%
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{g.count}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Memory Bank Tab */}
        {tab === 'memory' && (
          <div>
            <button className="btn btn-primary w-full mb-3 gsap-fade" onClick={() => setShowUpload(!showUpload)}>
              <Upload size={16} /> Upload Memory
            </button>

            {showUpload && (
              <motion.div className="glass-card mb-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="mb-2">Add Memory</h3>
                <input type="text" value={newMemory.label}
                  onChange={(e) => setNewMemory({ ...newMemory, label: e.target.value })}
                  placeholder="Label (e.g. Granddaughter Priya)"
                  style={{ marginBottom: '0.75rem' }} />
                <input type="url" value={newMemory.photo_url}
                  onChange={(e) => setNewMemory({ ...newMemory, photo_url: e.target.value })}
                  placeholder="Photo URL (optional)"
                  style={{ marginBottom: '0.75rem' }} />
                <select value={newMemory.item_type}
                  onChange={(e) => setNewMemory({ ...newMemory, item_type: e.target.value })}
                  style={{ marginBottom: '0.75rem' }}>
                  <option value="person">Person</option>
                  <option value="place">Place</option>
                  <option value="event">Event</option>
                  <option value="object">Object</option>
                </select>
                <button className="btn btn-success w-full" onClick={handleUploadMemory}><Check size={16}/> Save</button>
              </motion.div>
            )}

            <div className="grid-3">
              {memories.map((m, i) => (
                <div key={m.id} className="glass-card gsap-fade" style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <img src={m.photo_url || `https://picsum.photos/seed/${m.label}/200/200`} alt={m.label}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: '0.5rem', border: '1px solid var(--glass-border)' }}
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${m.id}/200/200`; }} />
                  <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.label}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.item_type}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reminders Tab */}
        {tab === 'reminders' && (
          <div>
            {data.reminders_today?.length > 0 ? (
              data.reminders_today.map((r, i) => {
                return (
                  <div key={r.id} className={`reminder-card gsap-fade ${r.reminder_type} ${r.is_done ? 'done' : ''}`}>
                    <span className="reminder-icon" style={{ display: 'flex' }}>{renderReminderIcon(r.reminder_type)}</span>
                    <div className="reminder-info">
                      <div className="reminder-label">{r.label}</div>
                      <div className="reminder-time">{r.scheduled_time}</div>
                    </div>
                    <span style={{ color: r.is_done ? 'var(--success)' : 'var(--text-muted)' }}>
                      {r.is_done ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </span>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><CheckCircle size={48} /></div>
                <p style={{ color: 'var(--text-muted)' }}>All reminders done for today!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
