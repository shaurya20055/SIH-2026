import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { generateGame, saveSession } from '../api';

const FALLBACK_QUESTIONS = [
  { question: 'Who is this person?', image: 'https://i.pravatar.cc/400?img=3', options: ['Son', 'Nephew', 'Friend', 'Doctor'], correct: 0 },
  { question: 'What is this object?', image: 'https://i.pravatar.cc/400?img=12', options: ['Cup', 'Bowl', 'Plate', 'Glass'], correct: 0 },
  { question: 'Where is this place?', image: 'https://picsum.photos/seed/temple/400', options: ['Temple', 'Market', 'Hospital', 'School'], correct: 0 },
  { question: 'Who is this?', image: 'https://i.pravatar.cc/400?img=5', options: ['Daughter', 'Neighbor', 'Sister', 'Cousin'], correct: 0 },
  { question: 'What do you see?', image: 'https://picsum.photos/seed/garden/400', options: ['Garden', 'Kitchen', 'Road', 'River'], correct: 0 },
];

export default function FaceRecall({ patientId }) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    try {
      const res = await generateGame(patientId, 'face_recall');
      setQuestions(res.data.questions || FALLBACK_QUESTIONS);
    } catch {
      setQuestions(FALLBACK_QUESTIONS);
    }
  };

  const handleAnswer = (optIdx) => {
    setSelected(optIdx);
    const correct = optIdx === questions[idx].correct;
    if (correct) setScore(s => s + 1);
    setShowResult(true);

    if ('speechSynthesis' in window) {
      const msg = correct ? 'Correct! Well done!' : `That's okay. The answer is ${questions[idx].options[questions[idx].correct]}.`;
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }

    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx(i => i + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const accuracy = Math.round((score + (correct ? 1 : 0)) / questions.length * 100);
        try {
          saveSession({ patient: patientId, game_type: 'face_recall', score: accuracy, accuracy, duration_seconds: elapsed, cognitive_level: 1 });
        } catch {}
        navigate('/game-complete', { state: { score: accuracy, xp: 25, game: 'Face Recall', correct: score + (correct ? 1 : 0), total: questions.length } });
      }
    }, 1500);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="game-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '3rem' }}>🧠</motion.div>
      </div>
    );
  }

  const q = questions[idx];

  return (
    <div className="game-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>
            <ArrowLeft size={18} /> Back
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {idx + 1} / {questions.length}
          </span>
          <button className="btn btn-ghost" onClick={() => speak(q.question)}>
            <Volume2 size={18} />
          </button>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
        </div>
      </motion.div>

      {/* Question */}
      <motion.div
        key={idx}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="game-question">{q.question}</h2>

        <img
          src={q.image}
          alt="Question"
          className="game-image"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/q${idx}/400`; }}
        />

        {q.options.map((opt, i) => (
          <motion.button
            key={i}
            className={`option-btn ${showResult ? (i === q.correct ? 'correct' : i === selected ? 'wrong' : '') : ''}`}
            onClick={() => !showResult && handleAnswer(i)}
            disabled={showResult}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={!showResult ? { scale: 1.01 } : {}}
          >
            {opt}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
