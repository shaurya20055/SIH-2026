import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Zap } from 'lucide-react';
import gsap from 'gsap';

const COLORS = [
  { id: 0, normal: '#ef4444', active: '#fca5a5' }, // Red
  { id: 1, normal: '#3b82f6', active: '#93c5fd' }, // Blue
  { id: 2, normal: '#10b981', active: '#6ee7b7' }, // Green
  { id: 3, normal: '#f59e0b', active: '#fcd34d' }, // Yellow
];

export default function PatternMaster({ patientId }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('intro'); // intro, showing, playing, complete, gameover
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [level, setLevel] = useState(1);
  const [activeTile, setActiveTile] = useState(null);
  const [score, setScore] = useState(0);

  // Audio refs (using synthesized beeps for simplicity)
  const playSound = (id) => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const osc = context.createOscillator();
    const gain = context.createGain();
    const freqs = [261.6, 329.6, 392.0, 523.2]; // C, E, G, C
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[id], context.currentTime);
    gain.gain.setValueAtTime(0.1, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(context.destination);
    
    osc.start();
    osc.stop(context.currentTime + 0.5);
  };

  const nextLevel = () => {
    const newTile = Math.floor(Math.random() * 4);
    setSequence(prev => [...prev, newTile]);
    setPlayerStep(0);
    setGameState('showing');
  };

  const startGame = () => {
    setLevel(1);
    setScore(0);
    setSequence([]);
    setTimeout(nextLevel, 500);
  };

  useEffect(() => {
    if (gameState === 'showing' && sequence.length > 0) {
      let step = 0;
      const interval = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(interval);
          setActiveTile(null);
          setGameState('playing');
          return;
        }
        const tileId = sequence[step];
        setActiveTile(tileId);
        playSound(tileId);
        
        setTimeout(() => {
          setActiveTile(null);
        }, 600); // 600ms active time for slow pacing

        step++;
      }, 1000); // 1000ms delay between tiles

      return () => clearInterval(interval);
    }
  }, [gameState, sequence]);

  const handleTileClick = (id) => {
    if (gameState !== 'playing') return;

    playSound(id);
    setActiveTile(id);
    setTimeout(() => setActiveTile(null), 300);

    if (id === sequence[playerStep]) {
      // Correct!
      if (playerStep === sequence.length - 1) {
        // Level complete
        setScore(s => s + 10 * level);
        if (level === 5) {
          setTimeout(() => setGameState('complete'), 1000);
        } else {
          setGameState('showing'); // temporary state so player can't click
          setTimeout(() => {
            setLevel(l => l + 1);
            nextLevel();
          }, 1000);
        }
      } else {
        setPlayerStep(s => s + 1);
      }
    } else {
      // Wrong!
      setGameState('gameover');
      // Shake animation on error
      gsap.to('.tile-grid', { x: [-10, 10, -10, 10, 0], duration: 0.4 });
    }
  };

  const finishGame = async () => {
    // Optionally update XP/GameSession in backend here
    navigate('/dashboard/game-complete', { state: { score, game: 'Pattern Master', xp: score } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/dashboard/games')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="#fcd34d" /> Level: {level > 5 ? 5 : level} / 5
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6ee7b7' }}>Score: {score}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
        
        {gameState === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 500 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#a78bfa' }}>Pattern Master</h1>
            <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.6 }}>
              Watch the tiles light up and listen to the sounds. 
              Repeat the sequence exactly as shown. 
              This exercises short-term memory and concentration.
            </p>
            <button onClick={startGame} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              <Play fill="currentColor" /> Start Game
            </button>
          </motion.div>
        )}

        {(gameState === 'showing' || gameState === 'playing') && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 600, color: gameState === 'showing' ? '#fcd34d' : '#6ee7b7', minHeight: '2rem' }}>
              {gameState === 'showing' ? 'Watch carefully...' : 'Your turn!'}
            </div>
            
            <div className="tile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {COLORS.map((c) => {
                const isActive = activeTile === c.id;
                return (
                  <motion.div
                    key={c.id}
                    onClick={() => handleTileClick(c.id)}
                    whileHover={gameState === 'playing' ? { scale: 1.02 } : {}}
                    whileTap={gameState === 'playing' ? { scale: 0.95 } : {}}
                    style={{
                      width: '180px', height: '180px',
                      borderRadius: '24px',
                      background: isActive ? c.active : c.normal,
                      cursor: gameState === 'playing' ? 'pointer' : 'default',
                      boxShadow: isActive ? `0 0 30px ${c.normal}` : '0 4px 6px rgba(0,0,0,0.1)',
                      transition: 'background 0.1s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>Oops! That was incorrect.</h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>You made it to Level {level}. Great effort!</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={startGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#3b82f6', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={20} /> Try Again
              </button>
              <button onClick={finishGame} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: '#fff', border: 'none', padding: '1rem 2rem', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer' }}>
                <Trophy size={20} /> Finish
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'complete' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px', maxWidth: 500 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 80, height: 80, background: 'rgba(16,185,129,0.2)', color: '#34d399', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Trophy size={40} />
            </div>
            <h2 style={{ fontSize: '2.5rem', color: '#f8fafc', marginBottom: '1rem' }}>Amazing!</h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>You completed all 5 levels flawlessly. Your memory is very sharp today!</p>
            <button onClick={finishGame} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Claim Rewards
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
