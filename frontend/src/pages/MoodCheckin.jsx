import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { logMood } from '../api';

const MOODS = [
  { score: 1, emoji: '😢', label: 'Very Sad' },
  { score: 2, emoji: '😟', label: 'Sad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '😊', label: 'Happy' },
  { score: 5, emoji: '😄', label: 'Very Happy' },
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
      const u = new SpeechSynthesisUtterance(t('mood_saved'));
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className="animate-fadeInUp text-center" style={{ width: '100%', maxWidth: '500px' }}>
        {!saved ? (
          <>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{t('mood_check')}</h1>
            <p className="text-gray mb-4">Tap the emoji that matches how you feel</p>

            <div className="mood-picker">
              {MOODS.map((mood) => (
                <button
                  key={mood.score}
                  className={`mood-btn ${selected === mood.score ? 'selected' : ''}`}
                  onClick={() => handleSelect(mood)}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="animate-fadeInUp">
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>
              {MOODS.find(m => m.score === selected)?.emoji}
            </div>
            <h2 style={{ color: 'var(--teal)' }}>{t('mood_saved')}</h2>
            <p className="text-gray mb-3">Thank you for sharing how you feel.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/')}>
              🏠 {t('go_home')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
