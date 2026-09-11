import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Home } from 'lucide-react';
import { logMood } from '../api';
import gsap from 'gsap';

const MOODS = [
  { score: 5, emoji: '🙂', label: 'Happy' },
  { score: 4, emoji: '😌', label: 'Calm' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 2, emoji: '😟', label: 'Worried' },
  { score: 1, emoji: '😔', label: 'Sad' },
];

export default function MoodCheckin({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && !saved) {
      gsap.fromTo(containerRef.current.querySelectorAll('.mood-btn'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(1.5)', delay: 0.2 }
      );
    }
  }, [saved]);

  const handleSelect = async (mood) => {
    setSelected(mood.score);
    try {
      await logMood({ patient: patientId, mood_score: mood.score });
    } catch (err) {
      console.error('Mood save error:', err);
    }
    setSaved(true);

    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('Thank you for sharing how you feel.');
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}
        ref={containerRef}
      >
        {!saved ? (
          <>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--accent-purple)' }}
            >
              <MessageCircle size={48} />
            </motion.div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>How are you feeling today?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Tap the emoji that matches your mood</p>

            <div className="mood-picker">
              {MOODS.map((mood, i) => (
                <button
                  key={mood.score}
                  className={`mood-btn ${selected === mood.score ? 'selected' : ''}`}
                  onClick={() => handleSelect(mood)}
                  style={{ opacity: 0 }}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3 mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {MOODS.map(m => (
                <span key={m.score} style={{ minWidth: '60px', textAlign: 'center' }}>{m.label}</span>
              ))}
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {MOODS.find(m => m.score === selected)?.emoji}
            </div>
            <h2 className="text-gradient flex items-center justify-center gap-2" style={{ marginBottom: '0.5rem' }}>
              Thank you for sharing <Heart size={24} color="var(--accent-purple)" />
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your feelings matter. We're here for you.</p>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home size={18} /> Go Home
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
