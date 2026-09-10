import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { logMood } from '../api';

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
      >
        {!saved ? (
          <>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
            >
              💭
            </motion.div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>How are you feeling today?</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Tap the emoji that matches your mood</p>

            <div className="mood-picker">
              {MOODS.map((mood, i) => (
                <motion.button
                  key={mood.score}
                  className={`mood-btn ${selected === mood.score ? 'selected' : ''}`}
                  onClick={() => handleSelect(mood)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {mood.emoji}
                </motion.button>
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
            <h2 className="text-gradient" style={{ marginBottom: '0.5rem' }}>Thank you for sharing 💛</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your feelings matter. We're here for you.</p>
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🏠 Go Home
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
