import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const BrainScene = lazy(() => import('../components/3d/BrainScene'));

const HOLO_LABELS = [
  { text: 'MEMORY', top: '18%', left: '58%', delay: 0 },
  { text: 'FOCUS', top: '30%', left: '78%', delay: 0.8 },
  { text: 'RECOGNITION', top: '55%', left: '82%', delay: 1.6 },
  { text: 'ATTENTION', top: '70%', left: '65%', delay: 2.4 },
  { text: 'CONNECTION', top: '42%', left: '52%', delay: 3.2 },
];

export default function HeroLanding({ onStart }) {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    if (onStart) onStart();
    else navigate('/dashboard');
  };

  return (
    <section className="hero-section">
      {/* 3D Brain */}
      <div className="hero-3d">
        <Suspense fallback={null}>
          <BrainScene />
        </Suspense>
        {/* Floating holographic labels */}
        {HOLO_LABELS.map((label) => (
          <motion.div
            key={label.text}
            className="holo-label"
            style={{ top: label.top, left: label.left }}
            initial={{ opacity: 0, y: 10 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.5 + label.delay * 0.3, duration: 0.8 }}
          >
            {label.text}
          </motion.div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <motion.p
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            AI-Powered Cognitive Wellness
          </motion.p>

          <h1 className="hero-title">
            <motion.span
              style={{ display: 'block' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              Keep Exploring.
            </motion.span>
            <motion.span
              className="text-gradient"
              style={{ display: 'block' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
            >
              Keep Smiling.
            </motion.span>
          </h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.7 }}
          >
            An intelligent companion for memory, meaningful routines
            and brighter everyday moments.
          </motion.p>

          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.7 }}
          >
            <button className="btn btn-glow" onClick={handleStart}>
              Start Your Brain Journey →
            </button>
            <a href="#features" className="btn btn-secondary">
              How MindSathi Helps
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
