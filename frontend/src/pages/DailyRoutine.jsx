import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateGame, saveSession } from '../api';

export default function DailyRoutine({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    setLoading(true);
    try {
      const res = await generateGame(patientId, 'daily_routine');
      setActivities(res.data.activities);
    } catch {
      const fallback = [
        { id: 1, label: 'Wake Up', icon: '🌅', correct_order: 1 },
        { id: 2, label: 'Brush Teeth', icon: '🪥', correct_order: 2 },
        { id: 3, label: 'Drink Tea', icon: '☕', correct_order: 3 },
        { id: 4, label: 'Take Medicine', icon: '💊', correct_order: 4 },
      ].sort(() => Math.random() - 0.5);
      setActivities(fallback);
    }
    setLoading(false);
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const newItems = [...activities];
    const [moved] = newItems.splice(dragIndex, 1);
    newItems.splice(dropIndex, 0, moved);
    setActivities(newItems);
    setDragIndex(null);
  };

  // Touch drag support
  const moveItem = (from, to) => {
    if (to < 0 || to >= activities.length) return;
    const newItems = [...activities];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setActivities(newItems);
  };

  const handleSubmit = async () => {
    let correct = 0;
    activities.forEach((act, i) => {
      if (act.correct_order === i + 1) correct++;
    });
    const accuracy = Math.round((correct / activities.length) * 100);
    const score = correct * 10;
    const duration = Math.round((Date.now() - startTime) / 1000);
    setResult({ correct, total: activities.length, accuracy, score });
    setSubmitted(true);

    try {
      const res = await saveSession({
        patient: patientId, game_type: 'daily_routine', score, accuracy,
        duration_seconds: duration, difficulty_level: activities.length <= 4 ? 1 : activities.length <= 6 ? 2 : 3,
      });
      setTimeout(() => {
        navigate('/game-complete', {
          state: { score, accuracy, duration, stars: res.data.stars, xp_earned: res.data.xp_earned, game_type: 'daily_routine', streak: res.data.streak },
        });
      }, 2000);
    } catch {
      setTimeout(() => {
        navigate('/game-complete', {
          state: { score, accuracy, duration, stars: accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1, xp_earned: 20, game_type: 'daily_routine' },
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="game-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>📋</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>← {t('back')}</button>
          <span style={{ fontWeight: 700 }}>📋 {t('daily_routine')}</span>
          <div style={{ width: 60 }} />
        </div>
      </div>

      <h2 className="game-question">{t('arrange_order')}</h2>
      <p className="text-center text-gray mb-3">{t('drag_hint')}</p>

      <div>
        {activities.map((act, index) => (
          <div
            key={act.id || index}
            className={`routine-item ${dragIndex === index ? 'dragging' : ''} ${submitted && act.correct_order === index + 1 ? 'correct' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
            style={submitted ? {
              borderColor: act.correct_order === index + 1 ? 'var(--success)' : 'var(--danger)',
              background: act.correct_order === index + 1 ? '#e8f5e1' : '#fde8e7',
            } : {}}
          >
            <span className="routine-order">{index + 1}</span>
            <span className="routine-icon">{act.icon}</span>
            <span style={{ flex: 1, fontWeight: 500 }}>{act.label}</span>
            <div className="flex flex-col gap-1">
              <button className="btn btn-ghost" onClick={() => moveItem(index, index - 1)} style={{ padding: '0.2rem 0.5rem', minHeight: 'auto', fontSize: '1.2rem' }}>▲</button>
              <button className="btn btn-ghost" onClick={() => moveItem(index, index + 1)} style={{ padding: '0.2rem 0.5rem', minHeight: 'auto', fontSize: '1.2rem' }}>▼</button>
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button className="btn btn-primary btn-lg w-full mt-3" onClick={handleSubmit}>
          ✅ {t('submit')}
        </button>
      ) : (
        <div className="text-center mt-3 animate-fadeInUp">
          <h2 style={{ color: result.accuracy >= 80 ? 'var(--success)' : 'var(--saffron)' }}>
            {result.correct} / {result.total} {t('correct').split('!')[0]}!
          </h2>
          <p className="text-gray">{t('loading')}</p>
        </div>
      )}
    </div>
  );
}
