import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain } from 'lucide-react';
import { generateGame, saveSession } from '../api';
import gsap from 'gsap';

const FALLBACK_PAIRS = [
  { id: 1, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/aG9ybmJpbGxfcWRtcm1y/template_primary', label: 'Hornbill Festival' },
  { id: 2, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/b25lX2hvcm5lZF9yaGlub193dXh5eTE=/template_primary', label: 'One Horned Rhino' },
  { id: 3, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/dGVhX2dhcmRlbl9zd2FnY3Y=/template_primary', label: 'Tea Garden' },
  { id: 4, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/cGl0aGFfa3RicDR6/template_primary', label: 'Pitha' },
  { id: 5, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/bmF0aW9uYWxfcGFya19sYWV4ZXU=/template_primary', label: 'Kaziranga' },
  { id: 6, content: 'https://res-console.cloudinary.com/diqkoqmwh/thumbnails/transform/v1/image/upload/Y19maWxsLGhfMjAwLHdfMjAw/v1/aW1hZ2VzX2hsdGpyOA==/template_primary', label: 'Tawang' },
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
  const gridRef = useRef(null);

  useEffect(() => { loadGame(); }, []);

  useEffect(() => {
    if (gridRef.current && cards.length > 0) {
      gsap.fromTo(gridRef.current.querySelectorAll('.flip-card'),
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.2)' }
      );
    }
  }, [cards]);

  const loadGame = async () => {
    let pairs = FALLBACK_PAIRS;
    try {
      // We still call the API so your backend registers the game start
      const res = await generateGame(patientId, 'flip_card');

      // I HAVE COMMENTED THIS OUT: 
      // This is what was overriding your Cloudinary images with "Majuli Island" text.
      // if (res.data?.pairs) pairs = res.data.pairs; 
    } catch { }

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
            } catch { }
            setTimeout(() => {
              navigate('/dashboard/game-complete', { state: { score: Math.min(accuracy, 100), xp: 30, game: 'Memory Match', correct: cards.length / 2, total: cards.length / 2 } });
            }, 600);
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
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard/games')}>
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

      <div className={`flip-grid ${gridClass}`} ref={gridRef}>
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.uid) || matched.includes(card.uid);
          const isMatched = matched.includes(card.uid);

          const isImage = typeof card.content === 'string' && card.content.startsWith('http');

          return (
            <div
              key={card.uid}
              className={`flip-card ${isMatched ? 'matched' : ''}`}
              onClick={() => handleFlip(card.uid)}
              style={{
                opacity: 0,
                perspective: '1000px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
              }}
            >
              <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: "tween", ease: "easeInOut" }}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* FRONT OF CARD */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--primary, #8b5cf6)',
                    borderRadius: '12px'
                  }}
                >
                  <Brain size={32} color="rgba(255,255,255,0.7)" />
                </div>

                {/* BACK OF CARD */}
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isMatched ? '#f3f4f6' : '#ffffff',
                    borderRadius: '12px',
                    transform: 'rotateY(180deg)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                  }}
                >
                  {isImage ? (
                    <>
                      <img
                        src={card.content}
                        alt={card.label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        draggable={false}
                        onError={(e) => {
                          // Failsafe: Shows text if the image fails to load
                          e.target.style.display = 'none';
                          if (e.target.nextElementSibling) {
                            e.target.nextElementSibling.style.display = 'flex';
                          }
                        }}
                      />
                      <div style={{
                        display: 'none',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        padding: '8px',
                        textAlign: 'center'
                      }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#111827' }}>
                          {card.label}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>{card.content}</span>
                  )}
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
