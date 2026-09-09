import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPatientDashboard, getMemoryItems, createMemoryItem } from '../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function CaregiverDashboard({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [tab, setTab] = useState('stats');
  const [showUpload, setShowUpload] = useState(false);
  const [newMemory, setNewMemory] = useState({ label: '', item_type: 'person', photo_url: '' });

  useEffect(() => { loadDashboard(); }, [patientId]);

  const loadDashboard = async () => {
    try {
      const [dRes, mRes] = await Promise.all([
        getPatientDashboard(patientId),
        getMemoryItems(patientId),
      ]);
      setData(dRes.data);
      setMemories(Array.isArray(mRes.data) ? mRes.data : mRes.data.results || []);
    } catch {
      // Fallback demo data
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

  if (!data) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>📊</div>
      </div>
    );
  }

  const p = data.patient;
  const declineColors = { alert: 'var(--danger)', warning: 'var(--saffron)', improving: 'var(--success)', stable: 'var(--teal)', insufficient_data: 'var(--gray)' };

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ padding: 0, marginBottom: '0.25rem' }}>← {t('back')}</button>
          <h1>📊 {t('dashboard')}</h1>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/doctor')} style={{ fontSize: '0.9rem' }}>
          🩺 {t('doctor_dashboard')}
        </button>
      </div>

      {/* Patient Summary Card */}
      <div className="card mb-3" style={{ background: 'linear-gradient(135deg, #e8f5e1, #e3f2fd)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white', fontWeight: 700 }}>
            {p.name?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.3rem' }}>{p.name}</h2>
            <p className="text-gray">Age {p.age} · Level {p.level} {p.level_title} · {p.total_xp} XP</p>
          </div>
          <div className={`grade-circle grade-${data.weekly_grade}`}>
            {data.weekly_grade}
          </div>
        </div>
      </div>

      {/* Decline Alert */}
      {data.decline_status && data.decline_status.status !== 'stable' && (
        <div className={`alert-banner ${data.decline_status.status}`}>
          <span>{data.decline_status.status === 'alert' ? '🚨' : data.decline_status.status === 'warning' ? '⚠️' : '📈'}</span>
          <span>{data.decline_status.message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-3" style={{ borderBottom: '2px solid var(--light-gray)', paddingBottom: '0.5rem' }}>
        {['stats', 'memory', 'reminders'].map(tb => (
          <button key={tb} className={`btn btn-ghost ${tab === tb ? 'text-teal' : 'text-gray'}`}
            onClick={() => setTab(tb)}
            style={{ fontWeight: tab === tb ? 700 : 400, borderBottom: tab === tb ? '3px solid var(--teal)' : 'none' }}>
            {tb === 'stats' ? '📈 Stats' : tb === 'memory' ? '🖼️ Memory Bank' : '⏰ Reminders'}
          </button>
        ))}
      </div>

      {/* Stats Tab */}
      {tab === 'stats' && (
        <div className="animate-fadeInUp">
          {/* Quick Stats */}
          <div className="grid-4 mb-3">
            <div className="stat-card">
              <div className="stat-value">{data.games_this_week}</div>
              <div className="stat-label">Games/Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.avg_accuracy_week}%</div>
              <div className="stat-label">Avg Accuracy</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">🔥 {p.streak}</div>
              <div className="stat-label">Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: declineColors[data.decline_status?.status] || 'var(--teal)', fontSize: '1rem' }}>
                {data.decline_status?.status === 'alert' ? '🚨' : data.decline_status?.status === 'improving' ? '📈' : '✅'}
              </div>
              <div className="stat-label">{data.decline_status?.status || 'stable'}</div>
            </div>
          </div>

          {/* Accuracy Chart */}
          <div className="chart-container">
            <h3 className="mb-2">📈 {t('accuracy_trend')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.accuracy_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#2A9D8F" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Mood Chart */}
          <div className="chart-container">
            <h3 className="mb-2">😊 {t('mood_trend')}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.mood_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#F4A825" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Games by Type */}
          <div className="chart-container">
            <h3 className="mb-2">🎮 Games by Type</h3>
            {data.games_by_type?.map(g => (
              <div key={g.game_type} className="flex items-center gap-2 mb-2">
                <span style={{ width: '120px', fontWeight: 500, fontSize: '0.9rem' }}>{g.game_type.replace('_', ' ')}</span>
                <div style={{ flex: 1, height: '24px', background: 'var(--light-gray)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ width: `${g.avg_accuracy || 0}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--sage))', borderRadius: '12px', transition: 'width 0.5s', display: 'flex', alignItems: 'center', paddingLeft: '8px', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                    {Math.round(g.avg_accuracy || 0)}%
                  </div>
                </div>
                <span className="text-gray" style={{ fontSize: '0.85rem' }}>{g.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Bank Tab */}
      {tab === 'memory' && (
        <div className="animate-fadeInUp">
          <button className="btn btn-secondary w-full mb-3" onClick={() => setShowUpload(!showUpload)}>
            + {t('upload_memory')}
          </button>

          {showUpload && (
            <div className="card mb-3">
              <h3 className="mb-2">{t('upload_memory')}</h3>
              <input type="text" value={newMemory.label}
                onChange={(e) => setNewMemory({ ...newMemory, label: e.target.value })}
                placeholder="Label (e.g. Granddaughter Priya)"
                style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', marginBottom: '0.75rem', fontSize: '1rem' }} />
              <input type="url" value={newMemory.photo_url}
                onChange={(e) => setNewMemory({ ...newMemory, photo_url: e.target.value })}
                placeholder="Photo URL (optional)"
                style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', marginBottom: '0.75rem', fontSize: '1rem' }} />
              <select value={newMemory.item_type}
                onChange={(e) => setNewMemory({ ...newMemory, item_type: e.target.value })}
                style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', marginBottom: '0.75rem', fontSize: '1rem' }}>
                <option value="person">Person</option>
                <option value="place">Place</option>
                <option value="event">Event</option>
                <option value="object">Object</option>
              </select>
              <button className="btn btn-primary w-full" onClick={handleUploadMemory}>✅ Save</button>
            </div>
          )}

          <div className="grid-3">
            {memories.map(m => (
              <div key={m.id} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
                <img src={m.photo_url || `https://picsum.photos/seed/${m.label}/200/200`} alt={m.label}
                  style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '0.75rem', marginBottom: '0.5rem' }}
                  onError={(e) => { e.target.src = `https://picsum.photos/seed/${m.id}/200/200`; }} />
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.label}</p>
                <p className="text-gray" style={{ fontSize: '0.75rem' }}>{m.item_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {tab === 'reminders' && (
        <div className="animate-fadeInUp">
          {data.reminders_today?.length > 0 ? (
            data.reminders_today.map(r => {
              const icons = { medicine: '💊', hydration: '💧', appointment: '🏥', activity: '🚶' };
              return (
                <div key={r.id} className={`reminder-card ${r.reminder_type} ${r.is_done ? 'done' : ''}`}>
                  <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
                  <div className="reminder-info">
                    <div className="reminder-label">{r.label}</div>
                    <div className="reminder-time">{r.scheduled_time}</div>
                  </div>
                  <span>{r.is_done ? '✅' : '⏳'}</span>
                </div>
              );
            })
          ) : (
            <div className="text-center mt-4" style={{ opacity: 0.5 }}>
              <p style={{ fontSize: '3rem' }}>✅</p>
              <p>All reminders done for today!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
