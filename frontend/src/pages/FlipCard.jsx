import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { generateGame, saveSession } from '../api';

const FALLBACK_PAIRS = [
  { id: 1, content: '🌺', label: 'Flower' },
  { id: 2, content: '🍎', label: 'Apple' },
  { id: 3, content: '🏠', label: 'House' },
  { id: 4, content: '☀️', label: 'Sun' },
  { id: 5, content: '🐦', label: 'Bird' },
  { id: 6, content: '🌈', label: 'Rainbow' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlipCard({ patientId }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const lockRef = useRef(false);

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    let pairs = FALLBACK_PAIRS;
    try {
      const res = await generateGame(patientId, 'flip_card');
      if (res.data?.pairs) pairs = res.data.pairs;
    } catch {}

    const numPairs = Math.min(pairs.length, 6);
    const selected = pairs.slice(0, numPairs);
    const deck = shuffleArray([
      ...selected.map((p, i) => ({ ...p, uid: `a${i}`, pairId: p.id })),
      ...selected.map((p, i) => ({ ...p, uid: `b${i}`, pairId: p.id })),
    ]);
    setCards(deck);
  };

  const handleFlip = (uid) => {
    if (lockRef.current) return;
    if (flipped.includes(uid) || matched.includes(uid)) return;

    const next = [...flipped, uid];
    setFlipped(next);

    if (next.length === 2) {
      lockRef.current = true;
      setMoves(m => m + 1);
      const [a, b] = next.map(u => cards.find(c => c.uid === u));

      if (a.pairId === b.pairId) {
        setTimeout(() => {
          setMatched(prev => [...prev, a.uid, b.uid]);
          setFlipped([]);
          lockRef.current = false;

          if (matched.length + 2 === cards.length) {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const accuracy = Math.round((cards.length / 2 / (moves + 1)) * 100);
            try {
              saveSession({ patient: patientId, game_type: 'flip_card', score: accuracy, accuracy: Math.min(accuracy, 100), duration_seconds: elapsed, cognitive_level: 1 });
            } catch {}
            navigate('/game-complete', { state: { score: Math.min(accuracy, 100), xp: 30, game: 'Memory Match', correct: cards.length / 2, total: cards.length / 2 } });
          }

          if ('speechSynthesis' in window) {
            const u = new SpeechSynthesisUtterance('Match found!');
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
          }
        }, 400);
      } else {
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 800);
      }
    }
  };

  const pairCount = cards.length / 2;
  const gridClass = pairCount <= 4 ? 'pairs-4' : pairCount <= 6 ? 'pairs-6' : 'pairs-8';

  return (
    <div className="game-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Moves: {moves}
            </span>
            <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
              Matched: {matched.length / 2}/{pairCount}
            </span>
          </div>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${(matched.length / cards.length) * 100}%` }} />
        </div>
      </motion.div>

      <h2 className="game-question">Find the matching pairs</h2>

      <div className={`flip-grid ${gridClass}`}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.uid) || matched.includes(card.uid);
          const isMatched = matched.includes(card.uid);
          return (
            <motion.div
              key={card.uid}
              className={`flip-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
              onClick={() => handleFlip(card.uid)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.random() * 0.3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flip-card-front">🧠</div>
              <div className="flip-card-back">
                <span style={{ fontSize: '2rem' }}>{card.content}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
