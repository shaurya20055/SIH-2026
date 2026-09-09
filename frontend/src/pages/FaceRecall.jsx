import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateGame, saveSession } from '../api';

export default function FaceRecall({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRounds] = useState(5);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => { loadRound(); }, [round]);

  const loadRound = async () => {
    if (round >= totalRounds) {
      finishGame();
      return;
    }
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const res = await generateGame(patientId, 'face_recall');
      setGameData(res.data);
    } catch {
      // Fallback data
      setGameData({
        question: 'Who is this?',
        photo_url: `https://picsum.photos/seed/face${round}/400/400`,
        correct_answer: 'Bihu Festival',
        options: ['Bihu Festival', 'Kaziranga Park', 'Gamocha'],
        difficulty: 1,
      });
    }
    setLoading(false);
  };

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = option === gameData.correct_answer;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      // Voice reward
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(t('correct'));
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
    }
    setTimeout(() => setRound(r => r + 1), 1500);
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctCount / totalRounds) * 100);
    try {
      const res = await saveSession({
        patient: patientId,
        game_type: 'face_recall',
        score,
        accuracy,
        duration_seconds: duration,
        difficulty_level: gameData?.difficulty || 1,
      });
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: res.data.stars, xp_earned: res.data.xp_earned, game_type: 'face_recall', streak: res.data.streak, total_xp: res.data.total_xp, level: res.data.level, level_title: res.data.level_title },
      });
    } catch {
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1, xp_earned: 20, game_type: 'face_recall' },
      });
    }
  };

  if (loading) {
    return (
      <div className="game-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>🧓</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      {/* Header */}
      <div className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>← {t('back')}</button>
          <span style={{ fontWeight: 700, color: 'var(--teal)' }}>{round + 1} / {totalRounds}</span>
          <span style={{ fontWeight: 700, color: 'var(--saffron)' }}>⭐ {score}</span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', background: 'var(--light-gray)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${((round) / totalRounds) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--sage))', borderRadius: '4px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question */}
      <div className="animate-fadeInUp">
        <h2 className="game-question">{gameData?.question || t('who_is_this')}</h2>
        <img
          src={gameData?.photo_url}
          alt="Memory"
          className="game-image"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/fallback${round}/400/400`; }}
        />
      </div>

      {/* Options */}
      <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {gameData?.options?.map((option, i) => (
          <button
            key={i}
            className={`option-btn ${selected === option ? (option === gameData.correct_answer ? 'correct' : 'wrong') : ''} ${selected && option === gameData.correct_answer ? 'correct' : ''}`}
            onClick={() => handleAnswer(option)}
            disabled={!!selected}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {isCorrect !== null && (
        <div className="text-center mt-2 animate-fadeInUp" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          {isCorrect ? (
            <span className="text-success">✅ {t('correct')}</span>
          ) : (
            <span className="text-danger">❌ {t('try_again')} — {gameData.correct_answer}</span>
          )}
        </div>
      )}
    </div>
  );
}
