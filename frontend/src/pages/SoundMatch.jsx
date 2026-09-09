import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateGame, saveSession } from '../api';

export default function SoundMatch({ patientId }) {
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
  const audioRef = useRef(null);

  useEffect(() => { loadRound(); }, [round]);

  const loadRound = async () => {
    if (round >= totalRounds) { finishGame(); return; }
    setLoading(true);
    setSelected(null);
    setIsCorrect(null);
    try {
      const res = await generateGame(patientId, 'sound_match');
      setGameData(res.data);
    } catch {
      setGameData({
        audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        question: 'What is this sound?',
        correct_answer: 'Dhol (Drum)',
        options: [
          { label: 'Dhol (Drum)', image: `https://picsum.photos/seed/dhol${round}/300/300`, correct: true },
          { label: 'Flute', image: `https://picsum.photos/seed/flute${round}/300/300`, correct: false },
          { label: 'Rain', image: `https://picsum.photos/seed/rain${round}/300/300`, correct: false },
        ],
      });
    }
    setLoading(false);
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (gameData && audioRef.current) {
      setTimeout(playAudio, 300);
    }
  }, [gameData]);

  const handleAnswer = (option) => {
    if (selected) return;
    setSelected(option.label);
    const correct = option.correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
    setTimeout(() => setRound(r => r + 1), 1500);
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round((correctCount / totalRounds) * 100);
    try {
      const res = await saveSession({
        patient: patientId, game_type: 'sound_match', score, accuracy,
        duration_seconds: duration, difficulty_level: 1,
      });
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: res.data.stars, xp_earned: res.data.xp_earned, game_type: 'sound_match', streak: res.data.streak },
      });
    } catch {
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1, xp_earned: 20, game_type: 'sound_match' },
      });
    }
  };

  if (loading) {
    return (
      <div className="game-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>🔊</div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>← {t('back')}</button>
          <span style={{ fontWeight: 700, color: 'var(--teal)' }}>{round + 1} / {totalRounds}</span>
          <span style={{ fontWeight: 700, color: 'var(--saffron)' }}>⭐ {score}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: 'var(--light-gray)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${(round / totalRounds) * 100}%`, height: '100%', background: 'linear-gradient(90deg, var(--saffron), var(--coral))', borderRadius: '4px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {gameData?.audio_url && (
        <audio ref={audioRef} src={gameData.audio_url} preload="auto" />
      )}

      <div className="text-center animate-fadeInUp">
        <h2 className="game-question">{gameData?.question || t('what_sound')}</h2>
        <button className="btn btn-secondary btn-lg" onClick={playAudio} style={{ marginBottom: '2rem' }}>
          {t('listen_again')}
        </button>
      </div>

      <div className="grid-3 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
        {gameData?.options?.map((option, i) => (
          <div
            key={i}
            className={`card card-game ${selected === option.label ? (option.correct ? 'correct' : '') : ''}`}
            onClick={() => handleAnswer(option)}
            style={{
              minHeight: '150px',
              cursor: selected ? 'default' : 'pointer',
              borderColor: selected === option.label
                ? (option.correct ? 'var(--success)' : 'var(--danger)')
                : (selected && option.correct ? 'var(--success)' : 'transparent'),
              background: selected === option.label
                ? (option.correct ? '#e8f5e1' : '#fde8e7')
                : (selected && option.correct ? '#e8f5e1' : 'white'),
            }}
          >
            <img
              src={option.image}
              alt={option.label}
              style={{ width: '80px', height: '80px', borderRadius: '0.75rem', objectFit: 'cover' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{option.label}</span>
          </div>
        ))}
      </div>

      {isCorrect !== null && (
        <div className="text-center mt-3 animate-fadeInUp" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
          {isCorrect ? (
            <span className="text-success">✅ {t('correct')}</span>
          ) : (
            <span className="text-danger">❌ {gameData.correct_answer}</span>
          )}
        </div>
      )}
    </div>
  );
}
