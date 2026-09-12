import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { generateGame, saveSession } from '../api';
import gsap from 'gsap';

// ADDED: 'audio' property pointing to files in your public folder
const SOUNDS = [
  { id: 1, label: 'Bird Chirping', emoji: '🐦', correct: 'Bird', audio: '/sounds/bird.mp3' },
  { id: 2, label: 'Temple Bell', emoji: '🛕', correct: 'Bell', audio: '/sounds/bell.mp3' },
  { id: 3, label: 'Rain', emoji: '🌧️', correct: 'Rain', audio: '/sounds/rain.mp3' },
  { id: 4, label: 'Dog Barking', emoji: '🐕', correct: 'Dog', audio: '/sounds/dog.mp3' },
  { id: 5, label: 'Whistle', emoji: '🎵', correct: 'Whistle', audio: '/sounds/whistle.mp3' },
];

const QUESTIONS = SOUNDS.map(s => ({
  ...s,
  question: `What sound is this?`,
  options: ['Bird', 'Bell', 'Rain', 'Dog', 'Whistle'].sort(() => Math.random() - 0.5).slice(0, 4),
}));

// Ensure correct answer is always in options
QUESTIONS.forEach(q => {
  if (!q.options.includes(q.correct)) {
    q.options[Math.floor(Math.random() * q.options.length)] = q.correct;
  }
});

export default function SoundMatch({ patientId }) {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const contentRef = useRef(null);

  // ADDED: Ref to keep track of the currently playing audio
  const audioRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }

    // Stop any playing audio when the component unmounts or question changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [idx]);

  // REPLACED: speak() function with actual audio player
  const playSound = () => {
    // Stop currently playing sound if user taps repeatedly
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const newAudio = new Audio(QUESTIONS[idx].audio);
    audioRef.current = newAudio;

    newAudio.play().catch(err => {
      console.error("Audio playback failed. Please ensure the audio file exists at the correct path.", err);
    });
  };

  const handleAnswer = (opt) => {
    setSelected(opt);
    const correct = opt === QUESTIONS[idx].correct;
    if (correct) setScore(s => s + 1);
    setShowResult(true);

    // Optional: Stop the sound as soon as they guess, or let it finish playing.
    // Uncomment the next two lines if you want it to stop immediately upon guessing.
    // if (audioRef.current) audioRef.current.pause();

    setTimeout(() => {
      if (idx + 1 < QUESTIONS.length) {
        setIdx(i => i + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const accuracy = Math.round((score + (correct ? 1 : 0)) / QUESTIONS.length * 100);
        try {
          saveSession({ patient: patientId, game_type: 'sound_match', score: accuracy, accuracy, duration_seconds: elapsed, cognitive_level: 1 });
        } catch { }
        navigate('/game-complete', { state: { score: accuracy, xp: 25, game: 'Sound Match', correct: score + (correct ? 1 : 0), total: QUESTIONS.length } });
      }
    }, 1500);
  };

  return (
    <div className="game-container">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="game-header">
        <div className="flex items-center justify-between mb-2">
          <button className="btn btn-ghost" onClick={() => navigate('/games')}>
            <ArrowLeft size={18} /> Back
          </button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{idx + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${((idx + 1) / QUESTIONS.length) * 100}%` }} />
        </div>
      </motion.div>

      <div key={idx} ref={contentRef}>
        <h2 className="game-question gsap-item">{QUESTIONS[idx].question}</h2>

        {/* Sound Player */}
        <motion.div
          className="glass-card gsap-item"
          style={{ textAlign: 'center', padding: '2rem', marginBottom: '1.5rem', cursor: 'pointer' }}
          onClick={playSound}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {QUESTIONS[idx].emoji}
          </motion.div>
          <div className="flex items-center justify-center gap-2" style={{ color: 'var(--accent-cyan)' }}>
            <Volume2 size={20} />
            <span style={{ fontWeight: 600 }}>Tap to Play Sound</span>
          </div>
        </motion.div>

        {QUESTIONS[idx].options.map((opt, i) => (
          <button
            key={i}
            className={`option-btn gsap-item ${showResult ? (opt === QUESTIONS[idx].correct ? 'correct' : opt === selected ? 'wrong' : '') : ''}`}
            onClick={() => !showResult && handleAnswer(opt)}
            disabled={showResult}
            style={{ opacity: 0 }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}