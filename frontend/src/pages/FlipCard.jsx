import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateGame, saveSession } from '../api';

export default function FlipCard({ patientId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [numPairs, setNumPairs] = useState(4);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    setLoading(true);
    try {
      const res = await generateGame(patientId, 'flip_card');
      setCards(res.data.pairs);
      setNumPairs(res.data.num_pairs);
    } catch {
      // Fallback
      const fallback = [];
      const items = ['Bihu 🎊', 'Rhino 🦏', 'Tea 🍵', 'Jaapi 🎩'];
      items.forEach((item, i) => {
        fallback.push({ id: i * 2, pair_id: i, type: 'text', content: item, label: item });
        fallback.push({ id: i * 2 + 1, pair_id: i, type: 'text', content: item, label: item });
      });
      fallback.sort(() => Math.random() - 0.5);
      setCards(fallback);
      setNumPairs(4);
    }
    setLoading(false);
  };

  const handleFlip = (index) => {
    if (disabled || flipped.includes(index) || matched.includes(cards[index].pair_id)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setDisabled(true);
      const [first, second] = newFlipped;

      if (cards[first].pair_id === cards[second].pair_id) {
        setMatched(m => [...m, cards[first].pair_id]);
        setFlipped([]);
        setDisabled(false);

        // Check win
        if (matched.length + 1 === numPairs) {
          setTimeout(() => finishGame(), 500);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const accuracy = Math.round(Math.max(0, 100 - (moves - numPairs) * 5));
    const score = numPairs * 10 + Math.max(0, 50 - moves);
    try {
      const res = await saveSession({
        patient: patientId, game_type: 'flip_card', score, accuracy,
        duration_seconds: duration, difficulty_level: numPairs <= 4 ? 1 : numPairs <= 6 ? 2 : 3,
      });
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: res.data.stars, xp_earned: res.data.xp_earned, game_type: 'flip_card', streak: res.data.streak, total_xp: res.data.total_xp },
      });
    } catch {
      navigate('/game-complete', {
        state: { score, accuracy, duration, stars: accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1, xp_earned: 20, game_type: 'flip_card' },
      });
    }
  };

  if (loading) {
    return (
      <div className="game-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>🃏</div>
      </div>
    );
  }

  const gridCols = numPairs <= 4 ? 4 : 4;

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>← {t('back')}</button>
          <span style={{ fontWeight: 700 }}>🃏 {t('flip_card')}</span>
          <span style={{ fontWeight: 700, color: 'var(--saffron)' }}>{t('moves')}: {moves}</span>
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{t('matches_found')}: {matched.length} / {numPairs}</span>
        </div>
      </div>

      <div className={`flip-grid pairs-${numPairs <= 4 ? 4 : numPairs <= 6 ? 4 : 4}`}
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(card.pair_id);
          const isMatched = matched.includes(card.pair_id);
          return (
            <div
              key={card.id}
              className={`flip-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleFlip(index)}
            >
              <div className="flip-card-front">❓</div>
              <div className="flip-card-back">
                {card.type === 'image' ? (
                  <img src={card.content} alt={card.label} onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.textContent = card.label; }} />
                ) : (
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, padding: '0.5rem' }}>{card.content}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
