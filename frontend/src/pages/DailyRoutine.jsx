import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, PartyPopper, ThumbsUp } from 'lucide-react';
import { saveSession } from '../api';
import gsap from 'gsap';

const ROUTINE_ITEMS = [
  { id: 1, icon: '🌅', label: 'Wake up' },
  { id: 2, icon: '🪥', label: 'Brush teeth' },
  { id: 3, icon: '🚿', label: 'Take a bath' },
  { id: 4, icon: '🍳', label: 'Eat breakfast' },
  { id: 5, icon: '💊', label: 'Take medicine' },
  { id: 6, icon: '🚶', label: 'Morning walk' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function DailyRoutine({ patientId }) {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => shuffleArray(ROUTINE_ITEMS));
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [startTime] = useState(Date.now());
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current && !checked) {
      gsap.fromTo(listRef.current.querySelectorAll('.routine-item'),
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [checked]);

  const handleDragStart = (idx) => setDragIdx(idx);

  const handleDrop = (targetIdx) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    setItems(newItems);
    setDragIdx(null);
  };

  const checkOrder = () => {
    let correct = 0;
    items.forEach((item, i) => {
      if (item.id === ROUTINE_ITEMS[i].id) correct++;
    });
    const accuracy = Math.round((correct / items.length) * 100);
    setResult({ correct, total: items.length, accuracy });
    setChecked(true);

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    try {
      saveSession({ patient: patientId, game_type: 'daily_routine', score: accuracy, accuracy, duration_seconds: elapsed, cognitive_level: 1 });
    } catch {}

    if ('speechSynthesis' in window) {
      const msg = accuracy >= 80 ? 'Excellent! You arranged the routine correctly!' : 'Good try! Let\'s practice again.';
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="game-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard/games')}>
            <ArrowLeft size={18} /> Back
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daily Routine</span>
        </div>
      </motion.div>

      <h2 className="game-question">Arrange your morning routine in the right order</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Drag items to rearrange them
      </p>

      <div style={{ maxWidth: '500px', margin: '0 auto' }} ref={listRef}>
        {items.map((item, i) => {
          const isCorrect = checked && item.id === ROUTINE_ITEMS[i].id;
          const isWrong = checked && item.id !== ROUTINE_ITEMS[i].id;

          return (
            <div
              key={item.id}
              className="routine-item"
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              style={{
                borderColor: isCorrect ? 'var(--success)' : isWrong ? 'var(--danger)' : undefined,
                background: isCorrect ? 'var(--success-bg)' : isWrong ? 'var(--danger-bg)' : undefined,
              }}
            >
              <span className="routine-order">{i + 1}</span>
              <span className="routine-icon">{item.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
              {isCorrect && <Check size={18} color="var(--success)" />}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <motion.button
          className="btn btn-primary btn-lg w-full mt-3"
          onClick={checkOrder}
          style={{ maxWidth: '500px', margin: '1.5rem auto', display: 'flex' }}
          whileTap={{ scale: 0.95 }}
        >
          <Check size={18} /> Check Order
        </motion.button>
      ) : (
        <motion.div
          className="glass-card mt-3"
          style={{ maxWidth: '500px', margin: '1.5rem auto', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', color: 'var(--accent-purple)' }}>
            {result.accuracy >= 80 ? <PartyPopper size={48} /> : <ThumbsUp size={48} />}
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {result.correct} / {result.total} correct
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            {result.accuracy >= 80 ? 'Wonderful! Your brain journey continues.' : 'Good effort! Practice makes perfect.'}
          </p>
          <div className="flex gap-2 justify-center">
            <button className="btn btn-primary" onClick={() => {
              setItems(shuffleArray(ROUTINE_ITEMS));
              setChecked(false);
              setResult(null);
            }}>
              Try Again
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard/games')}>
              More Games
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
