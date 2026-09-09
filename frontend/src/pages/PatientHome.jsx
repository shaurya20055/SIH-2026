import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPatient, getTodayReminders } from '../api';

export default function PatientHome({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        getPatient(patientId),
        getTodayReminders(patientId),
      ]);
      setPatient(pRes.data);
      setReminders(Array.isArray(rRes.data) ? rRes.data : rRes.data.results || []);
    } catch (err) {
      console.error(err);
      // Fallback for offline/demo
      setPatient({ name: 'Kamala Devi', age: 72, total_xp: 450, current_streak: 3, level: 3, level_title: 'Champion', cognitive_level: 1 });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting_morning');
    if (hour < 17) return t('greeting_afternoon');
    return t('greeting_evening');
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8;
      u.pitch = 1;
      window.speechSynthesis.speak(u);
    }
  };

  const xpForNextLevel = () => {
    if (!patient) return { current: 0, needed: 300, pct: 0 };
    const thresholds = [0, 300, 800, 2000, 5000, 10000];
    const lvl = patient.level || 1;
    const cur = patient.total_xp || 0;
    const prevT = thresholds[lvl - 1] || 0;
    const nextT = thresholds[lvl] || thresholds[thresholds.length - 1];
    const pct = Math.min(100, ((cur - prevT) / (nextT - prevT)) * 100);
    return { current: cur - prevT, needed: nextT - prevT, pct };
  };

  if (!patient) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>🪞</div>
      </div>
    );
  }

  const xp = xpForNextLevel();
  const pendingReminders = reminders.filter(r => !r.is_done);

  return (
    <div className="page-container">
      {/* ─── Greeting Header ─── */}
      <div className="animate-fadeInUp" style={{ marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray" style={{ fontSize: '1rem' }}>{getGreeting()}</p>
            <h1 style={{ fontSize: '1.8rem' }}>
              {patient.name?.split(' ')[0]} 👋
            </h1>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => speak(`${getGreeting()}, ${patient.name}. ${t('lets_play')}`)}
            style={{ fontSize: '1.5rem' }}
            title="Read aloud"
          >
            🔊
          </button>
        </div>
      </div>

      {/* ─── Streak & XP Bar ─── */}
      <div className="card animate-fadeInUp" style={{ marginBottom: '1.5rem', animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="badge-streak">
            🔥 {patient.current_streak || 0} {t('streak')}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: 'var(--saffron)' }}>⭐ {t('level')} {patient.level}</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray)' }}>{patient.level_title}</p>
          </div>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xp.pct}%` }} />
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray)', textAlign: 'center' }}>
          {patient.total_xp || 0} {t('xp')} — {Math.round(xp.pct)}% to next level
        </p>
      </div>

      {/* ─── Quick Game Cards ─── */}
      <h2 className="mb-2" style={{ animationDelay: '0.2s' }}>{t('lets_play')} 🎮</h2>
      <div className="grid-2 mb-3" style={{ animationDelay: '0.2s' }}>
        <div className="card card-game" onClick={() => navigate('/game/face-recall')} style={{ background: 'linear-gradient(135deg, #e8f5e1, #fff)' }}>
          <span className="game-icon">🧓</span>
          <span className="game-title">{t('face_recall')}</span>
        </div>
        <div className="card card-game" onClick={() => navigate('/game/flip-card')} style={{ background: 'linear-gradient(135deg, #e3f2fd, #fff)' }}>
          <span className="game-icon">🃏</span>
          <span className="game-title">{t('flip_card')}</span>
        </div>
        <div className="card card-game" onClick={() => navigate('/game/sound-match')} style={{ background: 'linear-gradient(135deg, #fff3e0, #fff)' }}>
          <span className="game-icon">🔊</span>
          <span className="game-title">{t('sound_match')}</span>
        </div>
        <div className="card card-game" onClick={() => navigate('/game/daily-routine')} style={{ background: 'linear-gradient(135deg, #fce4ec, #fff)' }}>
          <span className="game-icon">📋</span>
          <span className="game-title">{t('daily_routine')}</span>
        </div>
      </div>

      {/* ─── Today's Reminders Preview ─── */}
      {pendingReminders.length > 0 && (
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <h2>⏰ {t('today_reminders')}</h2>
            <button className="btn btn-ghost text-teal" onClick={() => navigate('/reminders')}>
              View all →
            </button>
          </div>
          {pendingReminders.slice(0, 3).map((r) => {
            const icons = { medicine: '💊', hydration: '💧', appointment: '🏥', activity: '🚶' };
            return (
              <div key={r.id} className={`reminder-card ${r.reminder_type}`}>
                <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
                <div className="reminder-info">
                  <div className="reminder-label">{r.label}</div>
                  <div className="reminder-time">{r.scheduled_time}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Quick Stats ─── */}
      <div className="grid-3 mt-3 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        <div className="stat-card">
          <div className="stat-value">{patient.total_xp || 0}</div>
          <div className="stat-label">{t('xp')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">🔥 {patient.current_streak || 0}</div>
          <div className="stat-label">{t('streak')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--saffron)' }}>⭐ {patient.level}</div>
          <div className="stat-label">{t('level')}</div>
        </div>
      </div>
    </div>
  );
}
