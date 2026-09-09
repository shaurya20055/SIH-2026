import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Confetti from 'react-confetti';

export default function GameComplete() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const { score = 0, accuracy = 0, duration = 0, stars = 1, xp_earned = 0, game_type = '', streak = 0, total_xp = 0, level = 1, level_title = '' } = data;

  const [showConfetti, setShowConfetti] = useState(stars >= 2);

  const gameNames = { face_recall: '🧓 Face Recall', flip_card: '🃏 Flip Card', sound_match: '🔊 Sound Match', daily_routine: '📋 Daily Routine' };

  const formatDuration = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const getMessage = () => {
    if (accuracy >= 90) return t('wonderful');
    if (accuracy >= 60) return t('great_job');
    return t('keep_going');
  };

  return (
    <div className="game-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={200} onConfettiComplete={() => setShowConfetti(false)} />}

      <div className="animate-fadeInUp text-center" style={{ width: '100%', maxWidth: '450px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉 {t('game_complete')}</h1>
        <p className="text-gray mb-3">{gameNames[game_type] || game_type}</p>

        {/* Stars */}
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem', letterSpacing: '0.5rem' }}>
          {[1, 2, 3].map(s => (
            <span key={s} style={{ opacity: s <= stars ? 1 : 0.2 }}>⭐</span>
          ))}
        </div>

        <h2 style={{ fontSize: '1.5rem', color: accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--saffron)' : 'var(--coral)' }}>
          {getMessage()}
        </h2>

        {/* Stats Grid */}
        <div className="grid-2 mt-3 mb-3">
          <div className="stat-card">
            <div className="stat-value">{score}</div>
            <div className="stat-label">{t('score')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">{t('accuracy')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--saffron)' }}>+{xp_earned}</div>
            <div className="stat-label">{t('xp')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatDuration(duration)}</div>
            <div className="stat-label">{t('time_taken')}</div>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="badge-streak mb-3" style={{ display: 'inline-flex' }}>
            🔥 {streak} {t('streak')}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-3">
          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate(`/game/${game_type.replace('_', '-')}`)}>
            🔄 {t('play_again')}
          </button>
          <button className="btn btn-outline w-full" onClick={() => navigate('/mood')}>
            😊 {t('mood_check')}
          </button>
          <button className="btn btn-ghost w-full" onClick={() => navigate('/')}>
            🏠 {t('go_home')}
          </button>
        </div>
      </div>
    </div>
  );
}
