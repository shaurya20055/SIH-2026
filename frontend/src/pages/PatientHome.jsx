import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, Brain, Trophy, Zap, ArrowRight, Volume2, Gamepad2, Flame, Star, Bell, Clock } from 'lucide-react';
import { getPatient, getTodayReminders } from '../api';
import ProgressRing from '../components/ProgressRing';
import gsap from 'gsap';
import ParticleText from '../components/ParticleText';

const ACTIVITIES = [
  { id: 1, label: 'Memory Game', done: true },
  { id: 2, label: 'Morning Medicine', done: true },
  { id: 3, label: 'Hydration Check', done: true },
  { id: 4, label: 'Focus Challenge', done: false },
  { id: 5, label: 'Evening Activity', done: false },
];

const QUICK_GAMES = [
  { id: 'face-recall', title: 'Face Recall', gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.1))' },
  { id: 'flip-card', title: 'Flip Card', gradient: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(59,130,246,0.1))' },
  { id: 'sound-match', title: 'Sound Match', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,146,60,0.1))' },
  { id: 'daily-routine', title: 'Daily Routine', gradient: 'linear-gradient(135deg, rgba(244,114,182,0.12), rgba(192,38,211,0.1))' },
];

export default function PatientHome({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [activities, setActivities] = useState(ACTIVITIES);
  const pageRef = useRef(null);

  useEffect(() => { loadData(); }, [patientId]);

  useEffect(() => {
    if (patient && pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll('.gsap-section'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, [patient]);

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
        <div style={{ color: 'var(--accent-violet)' }}><Brain size={48} /></div>
      </div>
    );
  }

  const xp = xpForNextLevel();
  const doneCount = activities.filter(a => a.done).length;
  const pendingReminders = reminders.filter(r => !r.is_done);
  const reminderIcons = { medicine: '💊', hydration: '💧', appointment: '🏥', activity: '🚶' };

  return (
    <div className="page-container" ref={pageRef}>
      {/* Greeting */}
      <div className="gsap-section" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{getGreeting()}</p>
            <div style={{ width: '300px', height: '48px', position: 'relative', left: '-12px', marginTop: '-4px' }}>
              <ParticleText
                text={patient.name?.split(' ')[0] || 'Patient'}
                particleSize={1.5}
                density={2}
                color="#f0f0f5"
                highlightColor="#D946EF"
                scatter={80}
                gatherDuration={1200}
                stagger={300}
                pointerRepel={30}
                repelRadius={80}
                idleDrift={0.6}
                trigger="mount"
                fontSize="clamp(2rem, 5vw, 3rem)"
                fontWeight={800}
                fontFamily="Outfit, sans-serif"
                textAlign="left"
              />
            </div>
          </div>
          <button
            className="btn btn-icon btn-secondary"
            onClick={() => speak(`${getGreeting()}, ${patient.name}. Let's continue your brain journey today!`)}
            aria-label="Read aloud"
          >
            <Volume2 size={20} />
          </button>
        </div>
      </div>

      {/* Brain Journey Progress */}
      <div className="glass-card gsap-section" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>Your Brain Journey</h2>
        
        <div className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
          <ProgressRing value={doneCount} max={activities.length} size={140} strokeWidth={10} label="Activities" />
          
          <div style={{ textAlign: 'left' }}>
            {activities.map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.35rem 0', fontSize: '0.95rem',
                  color: a.done ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                <span>{a.done ? '✓' : '○'}</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.button
          className="btn btn-primary btn-lg"
          onClick={() => navigate('/dashboard/games')}
          style={{ marginTop: '1.5rem' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue Journey <ArrowRight size={18} />
        </motion.button>
      </div>

      {/* Streak & XP */}
      <div className="glass-card gsap-section" style={{ marginBottom: '2rem' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="badge-streak"><Flame size={16} /> {patient.current_streak || 0} Day Streak</div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 700, color: 'var(--warm-amber)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Star size={16} /> Level {patient.level}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{patient.level_title}</p>
          </div>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${xp.pct}%` }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          {patient.total_xp || 0} XP — {Math.round(xp.pct)}% to next level
        </p>
      </div>

      {/* Quick Games */}
      <div className="gsap-section">
        <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gamepad2 size={22} />
          Play Now
        </h2>
        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {QUICK_GAMES.map((game) => (
            <motion.div
              key={game.id}
              className="game-card"
              onClick={() => navigate(`/dashboard/game/${game.id}`)}
              style={{ background: game.gradient, alignItems: 'center', textAlign: 'center', padding: '1.75rem 1rem' }}
              whileHover={{ y: -2, boxShadow: '0 0 20px rgba(124,58,237,0.12)' }}
            >
              <span className="game-title">{game.title}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reminders Preview */}
      {pendingReminders.length > 0 && (
        <div className="gsap-section">
          <div className="flex items-center justify-between mb-2">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={20} /> Today's Reminders
            </h2>
            <button className="btn btn-ghost text-accent" onClick={() => navigate('/dashboard/reminders')}>
              View all
            </button>
          </div>
          {pendingReminders.slice(0, 3).map((r) => (
            <div key={r.id} className={`reminder-card ${r.reminder_type}`}>
              <span className="reminder-icon">{reminderIcons[r.reminder_type] || '•'}</span>
              <div className="reminder-info">
                <div className="reminder-label">{r.label}</div>
                <div className="reminder-time">{r.scheduled_time}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid-3 mt-3 gsap-section">
        <div className="stat-card">
          <div className="stat-value">{patient.total_xp || 0}</div>
          <div className="stat-label">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{patient.current_streak || 0}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, #F59E0B, #c026d3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{patient.level}</div>
          <div className="stat-label">Level</div>
        </div>
      </div>
    </div>
  );
}
