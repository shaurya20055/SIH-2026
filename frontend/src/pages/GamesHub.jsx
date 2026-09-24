import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Clock, Star, Zap, ArrowRight, Gamepad2 } from 'lucide-react';
import gsap from 'gsap';

const CATEGORIES = ['All', 'Memory', 'Attention', 'Pattern', 'Recognition', 'Language', 'Logic', 'Daily Recall', 'Social', 'Emotions'];

const GAMES = [
  { id: 'face-recall', title: 'Who Is This?', desc: 'Recognize faces from your memories', category: 'Recognition', difficulty: 'Easy', duration: '3 min', xp: 25, progress: 60, gradient: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(139,92,246,0.08))' },
  { id: 'flip-card', title: 'Memory Match', desc: 'Match pairs of cards by flipping them', category: 'Memory', difficulty: 'Easy', duration: '5 min', xp: 30, progress: 45, gradient: 'linear-gradient(135deg, rgba(34,211,238,0.15), rgba(59,130,246,0.08))' },
  { id: 'sound-match', title: 'Sound Match', desc: 'Listen to sounds and identify them', category: 'Recognition', difficulty: 'Medium', duration: '3 min', xp: 25, progress: 30, gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.08))' },
  { id: 'daily-routine', title: 'Daily Routine Recall', desc: 'Arrange daily activities in the right order', category: 'Daily Recall', difficulty: 'Easy', duration: '2 min', xp: 20, progress: 75, gradient: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(192,38,211,0.08))' },
  { id: 'pattern-master', title: 'Pattern Master', desc: 'Complete the sequence pattern', category: 'Pattern', difficulty: 'Medium', duration: '3 min', xp: 30, progress: 0, gradient: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(34,211,238,0.1))' },
  { id: 'word-memory', title: 'Word Memory', desc: 'Remember and recall words', category: 'Language', difficulty: 'Easy', duration: '3 min', xp: 20, progress: 0, gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(192,38,211,0.08))' }
];

export default function GamesHub({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const gridRef = useRef(null);

  const filtered = activeCategory === 'All' ? GAMES : GAMES.filter(g => g.category === activeCategory);

  useEffect(() => {
    if (gridRef.current) {
      gsap.fromTo(gridRef.current.querySelectorAll('.game-card'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power3.out', delay: 0.15 }
      );
    }
  }, [activeCategory]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><Gamepad2 size={22} /></span>
          Brain Games
        </h1>
        <p className="page-subtitle">Train your mind with fun, personalized challenges</p>
      </div>

      {/* Category Tabs */}
      <div className="tab-group">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`tab-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="grid-2" ref={gridRef}>
        {filtered.map((game) => {
          return (
            <motion.div
              key={game.id}
              className="game-card"
              onClick={() => navigate(`/dashboard/game/${game.id}`)}
              style={{
                background: game.gradient,
                cursor: 'pointer',
                opacity: 1,
              }}
              whileHover={{ y: -2, boxShadow: '0 0 20px rgba(124,58,237,0.12)' }}
            >
              <div>
                <div className="game-title">{game.title}</div>
                <div className="game-desc">{game.desc}</div>
              </div>

              {/* Progress bar */}
              {game.progress > 0 && (
                <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
