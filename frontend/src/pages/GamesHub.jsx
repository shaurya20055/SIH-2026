import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Star, Zap, ArrowRight } from 'lucide-react';

const CATEGORIES = ['All', 'Memory', 'Attention', 'Pattern', 'Recognition', 'Language', 'Logic', 'Daily Recall', 'Social', 'Emotions'];

const GAMES = [
  { id: 'face-recall', icon: '🧓', title: 'Who Is This?', desc: 'Recognize faces from your memories', category: 'Recognition', difficulty: 'Easy', duration: '3 min', xp: 25, progress: 60, gradient: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))' },
  { id: 'flip-card', icon: '🃏', title: 'Memory Match', desc: 'Match pairs of cards by flipping them', category: 'Memory', difficulty: 'Easy', duration: '5 min', xp: 30, progress: 45, gradient: 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(59,130,246,0.15))' },
  { id: 'sound-match', icon: '🔊', title: 'Sound Match', desc: 'Listen to sounds and identify them', category: 'Recognition', difficulty: 'Medium', duration: '3 min', xp: 25, progress: 30, gradient: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,146,60,0.15))' },
  { id: 'daily-routine', icon: '📋', title: 'Daily Routine Recall', desc: 'Arrange daily activities in the right order', category: 'Daily Recall', difficulty: 'Easy', duration: '2 min', xp: 20, progress: 75, gradient: 'linear-gradient(135deg, rgba(244,114,182,0.25), rgba(217,70,239,0.15))' },
  { id: 'odd-one-out', icon: '🔍', title: 'Find the Odd One Out', desc: 'Sharpen your observation skills', category: 'Attention', difficulty: 'Medium', duration: '2 min', xp: 20, progress: 0, gradient: 'linear-gradient(135deg, rgba(52,211,153,0.25), rgba(20,184,166,0.15))' },
  { id: 'pattern-master', icon: '🔷', title: 'Pattern Master', desc: 'Complete the sequence pattern', category: 'Pattern', difficulty: 'Medium', duration: '3 min', xp: 30, progress: 0, gradient: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))' },
  { id: 'word-memory', icon: '📝', title: 'Word Memory', desc: 'Remember and recall words', category: 'Language', difficulty: 'Easy', duration: '3 min', xp: 20, progress: 0, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(217,70,239,0.15))' },
  { id: 'object-recognition', icon: '🏺', title: 'Object Recognition', desc: 'Identify everyday objects', category: 'Recognition', difficulty: 'Easy', duration: '2 min', xp: 15, progress: 0, gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(244,114,182,0.15))' },
  { id: 'emotion-match', icon: '😊', title: 'Emotion Match', desc: 'Match emotions with expressions', category: 'Emotions', difficulty: 'Easy', duration: '2 min', xp: 20, progress: 0, gradient: 'linear-gradient(135deg, rgba(251,146,60,0.25), rgba(248,113,113,0.15))' },
  { id: 'family-connection', icon: '👨‍👩‍👧‍👦', title: 'Family Connection', desc: 'Connect with your family memories', category: 'Social', difficulty: 'Easy', duration: '5 min', xp: 25, progress: 0, gradient: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(6,182,212,0.2))' },
];

const PLAYABLE = ['face-recall', 'flip-card', 'sound-match', 'daily-routine'];

export default function GamesHub({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' ? GAMES : GAMES.filter(g => g.category === activeCategory);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">🧩 Brain Games</h1>
        <p className="page-subtitle">Train your mind with fun, personalized challenges</p>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        className="tab-group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Game Grid */}
      <div className="grid-2">
        {filtered.map((game, i) => {
          const playable = PLAYABLE.includes(game.id);
          return (
            <motion.div
              key={game.id}
              className="game-card"
              onClick={() => playable ? navigate(`/game/${game.id}`) : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              style={{
                background: game.gradient,
                cursor: playable ? 'pointer' : 'default',
                opacity: playable ? 1 : 0.7,
              }}
              whileHover={playable ? { y: -4, boxShadow: '0 0 25px rgba(99,102,241,0.2)' } : {}}
            >
              <div className="flex items-center gap-3">
                <div className="game-icon" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {game.icon}
                </div>
                <div>
                  <div className="game-title">{game.title}</div>
                  <div className="game-desc">{game.desc}</div>
                </div>
              </div>

              {/* Progress bar */}
              {game.progress > 0 && (
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${game.progress}%`, height: '100%', background: 'var(--gradient-accent)', borderRadius: '2px' }} />
                </div>
              )}

              <div className="game-meta">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {game.duration}
                </span>
                <span className="badge badge-info">{game.difficulty}</span>
                <span className="game-xp flex items-center gap-1">
                  <Zap size={12} /> +{game.xp} XP
                </span>
              </div>

              {!playable && (
                <span className="badge badge-warning" style={{ alignSelf: 'flex-start' }}>Coming Soon</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
