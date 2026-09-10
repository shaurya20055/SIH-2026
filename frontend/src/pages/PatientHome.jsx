import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Droplets, Brain, Trophy, Zap, ArrowRight, Volume2, Gamepad2 } from 'lucide-react';
import { getPatient, getTodayReminders } from '../api';
import ProgressRing from '../components/ProgressRing';

const ACTIVITIES = [
  { id: 1, label: 'Memory Game', icon: '🧩', done: true },
  { id: 2, label: 'Morning Medicine', icon: '💊', done: true },
  { id: 3, label: 'Hydration Check', icon: '💧', done: true },
  { id: 4, label: 'Focus Challenge', icon: '🎯', done: false },
  { id: 5, label: 'Evening Activity', icon: '🌙', done: false },
];

const QUICK_GAMES = [
  { id: 'face-recall', icon: '🧓', title: 'Face Recall', gradient: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' },
  { id: 'flip-card', icon: '🃏', title: 'Flip Card', gradient: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.2))' },
  { id: 'sound-match', icon: '🔊', title: 'Sound Match', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,146,60,0.2))' },
  { id: 'daily-routine', icon: '📋', title: 'Daily Routine', gradient: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(217,70,239,0.2))' },
];

export default function PatientHome({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [activities, setActivities] = useState(ACTIVITIES);

  useEffect(() => { loadData(); }, [patientId]);

  const loadData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        getPatient(patientId),
        getTodayReminders(patientId),
      ]);
      setPatient(pRes.data);
      setReminders(Array.isArray(rRes.data) ? rRes.data : rRes.data.results || []);
    } catch {
      setPatient({ name: 'Kamala Devi', age: 72, total_xp: 450, current_streak: 3, level: 3, level_title: 'Champion', cognitive_level: 1 });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8;
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
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '3rem' }}>🧠</motion.div>
      </div>
    );
  }

  const xp = xpForNextLevel();
  const doneCount = activities.filter(a => a.done).length;
  const pendingReminders = reminders.filter(r => !r.is_done);

  return (
    <div className="page-container">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{getGreeting()}</p>
            <h1 style={{ fontSize: '2rem' }}>
              {patient.name?.split(' ')[0]} <span style={{ display: 'inline-block' }}>🌷</span>
            </h1>
          </div>
          <button
            className="btn btn-icon btn-secondary"
            onClick={() => speak(`${getGreeting()}, ${patient.name}. Let's continue your brain journey today!`)}
            aria-label="Read aloud"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </motion.div>

      {/* Brain Journey Progress */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{ marginBottom: '2rem', textAlign: 'center' }}
      >
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Your Brain Journey</h2>
        
        <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
          <ProgressRing value={doneCount} max={activities.length} size={140} strokeWidth={10} label="Activities" />
          
          <div style={{ textAlign: 'left' }}>
            {activities.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.35rem 0', fontSize: '0.95rem',
                  color: a.done ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                <span>{a.done ? '✓' : '○'}</span>
                <span>{a.icon}</span>
                <span style={{ textDecoration: a.done ? 'none' : 'none' }}>{a.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/games')}
          style={{ marginTop: '1.5rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Journey <ArrowRight size={18} />
        </motion.button>
      </motion.div>

      {/* Streak & XP */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{ marginBottom: '2rem' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="badge-streak">🔥 {patient.current_streak || 0} Day Streak</div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: 'var(--warm-amber)' }}>⭐ Level {patient.level}</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patient.level_title}</p>
          </div>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xp.pct}%` }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {patient.total_xp || 0} XP — {Math.round(xp.pct)}% to next level
        </p>
      </motion.div>

      {/* Quick Games */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <h2 style={{ marginBottom: '1rem' }}>
          <Gamepad2 size={22} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Play Now
        </h2>
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {QUICK_GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              className="game-card"
              onClick={() => navigate(`/game/${game.id}`)}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              style={{ background: game.gradient, alignItems: 'center', textAlign: 'center', padding: '1.75rem 1rem' }}
              whileHover={{ y: -4, boxShadow: '0 0 25px rgba(99,102,241,0.2)' }}
            >
              <span style={{ fontSize: '2.5rem' }}>{game.icon}</span>
              <span className="game-title">{game.title}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Reminders Preview */}
      {pendingReminders.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <div className="flex items-center justify-between mb-2">
            <h2>⏰ Today's Reminders</h2>
            <button className="btn btn-ghost text-cyan" onClick={() => navigate('/reminders')}>
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
        </motion.div>
      )}

      {/* Quick Stats */}
      <motion.div
        className="grid-3 mt-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="stat-card">
          <div className="stat-value">{patient.total_xp || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🔥 {patient.current_streak || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #D946EF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⭐ {patient.level}</div>
          <div className="stat-label">Level</div>
        </div>
      </motion.div>
    </div>
  );
}
