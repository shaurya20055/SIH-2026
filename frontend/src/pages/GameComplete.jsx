import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Zap, Star, ArrowRight } from 'lucide-react';

export default function GameComplete({ patientId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { score = 80, xp = 25, game = 'Brain Game', correct = 4, total = 5 } = location.state || {};

  const messages = [
    'Wonderful! Your brain journey continues.',
    'Amazing effort! Keep it up!',
    'Brilliant! Your mind is getting sharper.',
    'Great work! Every game strengthens your brain.',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <motion.div
        className="glass-card glow-indigo"
        style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '450px', width: '100%' }}
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Celebration */}
        <motion.div
          style={{ fontSize: '4rem', marginBottom: '1rem' }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          🎉
        </motion.div>

        <motion.h1
          className="text-gradient"
          style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {game} Complete!
        </motion.h1>

        <motion.p
          style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {message}
        </motion.p>

        {/* Score */}
        <motion.div
          className="flex justify-center gap-3 mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              <Star size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> {score}%
            </div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, #F59E0B, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <Zap size={18} style={{ display: 'inline', verticalAlign: 'middle' }} /> +{xp}
            </div>
            <div className="stat-label">XP Earned</div>
          </div>
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{correct}/{total}</div>
            <div className="stat-label">Correct</div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex flex-col gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/games')}>
            Play Another Game <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary w-full" onClick={() => navigate('/dashboard')}>
            <Home size={18} /> Go Home
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
