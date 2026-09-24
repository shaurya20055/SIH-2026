import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RefreshCw, Trophy, Zap, Check, X } from 'lucide-react';
import gsap from 'gsap';

const WORD_BANK = [
  "Apple", "River", "Chair", "Ocean", "Guitar",
  "Mirror", "Sunset", "Forest", "Pencil", "Coffee",
  "Bicycle", "Window", "Garden", "Book", "Blanket",
  "Clock", "Candle", "Shoes", "Train", "Kitten"
];

export default function WordMemory({ patientId }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('intro'); // intro, memorize, test, complete, gameover
  const [targetWords, setTargetWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  
  const [testWords, setTestWords] = useState([]);
  const [testIndex, setTestIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  const wordsPerLevel = 3 + level; // Level 1: 4 words, Level 2: 5 words...

  const startGame = () => {
    setLevel(1);
    setScore(0);
    startLevel(1);
  };

  const startLevel = (lvl) => {
    const numWords = 3 + lvl;
    
    // Pick random words for this level to memorize
    const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numWords);
    
    setTargetWords(selected);
    setCurrentWordIndex(0);
    setGameState('memorize');

    // Prepare test array: mixture of seen and unseen words
    const unseen = shuffled.slice(numWords, numWords + numWords); // Same number of unseen
    const mixed = [...selected, ...unseen].sort(() => 0.5 - Math.random());
    setTestWords(mixed);
  };

  useEffect(() => {
    if (gameState === 'memorize') {
      const timer = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= targetWords.length - 1) {
            clearInterval(timer);
            setTimeout(() => setGameState('test'), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 2500); // Show each word for 2.5 seconds
      return () => clearInterval(timer);
    }
  }, [gameState, targetWords]);

  useEffect(() => {
    if (gameState === 'test') {
      setTestIndex(0); // reset test index when entering test phase
    }
  }, [gameState]);

  const handleAnswer = (isSeen) => {
    const currentTestWord = testWords[testIndex];
    const actuallySeen = targetWords.includes(currentTestWord);

    if (isSeen === actuallySeen) {
      // Correct
      gsap.fromTo('.word-card', { scale: 0.9, background: 'rgba(16,185,129,0.2)' }, { scale: 1, background: 'rgba(255,255,255,0.05)', duration: 0.4 });
      setScore(s => s + 10);
      
      if (testIndex >= testWords.length - 1) {
        // Level complete
        if (level >= 3) {
          setGameState('complete');
        } else {
          setLevel(l => l + 1);
          startLevel(level + 1);
        }
      } else {
        setTestIndex(i => i + 1);
      }
    } else {
      // Incorrect
      gsap.fromTo('.word-card', { x: -10, background: 'rgba(239,68,68,0.2)' }, { x: 0, background: 'rgba(255,255,255,0.05)', duration: 0.4, ease: 'bounce.out' });
      setGameState('gameover');
    }
  };

  const finishGame = () => {
    navigate('/dashboard/game-complete', { state: { score, game: 'Word Memory', xp: score } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1e1b4b', color: '#f8fafc', fontFamily: 'Inter, sans-serif', backgroundImage: 'radial-gradient(circle at center, rgba(139,92,246,0.1) 0%, transparent 70%)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/dashboard/games')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="#fcd34d" /> Level: {level > 3 ? 3 : level} / 3
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6ee7b7' }}>Score: {score}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '2rem' }}>
        
        {gameState === 'intro' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 600 }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#a78bfa' }}>Word Memory</h1>
            <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              A series of words will appear on the screen one by one. Try to remember as many as you can. 
              Afterwards, you'll be shown words and asked if they were on the list.
            </p>
            <button onClick={startGame} style={{ background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
              <Play fill="currentColor" /> Start Challenge
            </button>
          </motion.div>
        )}

        {gameState === 'memorize' && targetWords.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '3rem' }}>Memorize this word:</h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={targetWords[currentWordIndex]}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.4 }}
                style={{ fontSize: '4rem', fontWeight: 800, color: '#f8fafc', background: 'rgba(255,255,255,0.05)', padding: '3rem 5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '400px' }}
              >
                {targetWords[currentWordIndex]}
              </motion.div>
            </AnimatePresence>
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {targetWords.map((_, i) => (
                <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: i === currentWordIndex ? '#7c3aed' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>
        )}

        {gameState === 'test' && testWords.length > 0 && (
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <h2 style={{ fontSize: '1.75rem', color: '#cbd5e1', marginBottom: '2rem' }}>Have you seen this word before?</h2>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={testWords[testIndex]}
                className="word-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ fontSize: '3.5rem', fontWeight: 700, color: '#f8fafc', background: 'rgba(255,255,255,0.05)', padding: '2.5rem 4rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '3rem' }}
              >
                {testWords[testIndex]}
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button onClick={() => handleAnswer(false)} style={{ flex: 1, background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', color: '#ef4444', padding: '1.25rem', borderRadius: '16px', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}>
                <X size={24} /> No, I haven't
              </button>
              <button onClick={() => handleAnswer(true)} style={{ flex: 1, background: 'rgba(16,185,129,0.1)', border: '2px solid #10b981', color: '#10b981', padding: '1.25rem', borderRadius: '16px', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                <Check size={24} /> Yes, I have
              </button>
            </div>
            <div style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
              Word {testIndex + 1} of {testWords.length}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', padding: '3rem', borderRadius: '24px' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '1rem' }}>That wasn't right.</h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>You made it to Level {level}. Good job exercising your memory!</p>
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
            <h2 style={{ fontSize: '2.5rem', color: '#f8fafc', marginBottom: '1rem' }}>Excellent!</h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>You completed all memory challenges flawlessly. You recalled the words perfectly.</p>
            <button onClick={finishGame} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '999px', fontSize: '1.25rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}>
              Claim XP
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
