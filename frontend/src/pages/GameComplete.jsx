import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Zap, Star, ArrowRight, PartyPopper } from 'lucide-react';
import gsap from 'gsap';

export default function GameComplete({ patientId }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { score = 80, xp = 25, game = 'Brain Game', correct = 4, total = 5 } = location.state || {};
  const cardRef = useRef(null);

  const messages = [
    'Wonderful! Your brain journey continues.',
    'Amazing effort! Keep it up!',
    'Brilliant! Your mind is getting sharper.',
    'Great work! Every game strengthens your brain.',
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];

  useEffect(() => {
    if (cardRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(cardRef.current, 
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' }
      )
      .fromTo(cardRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out' },
        "-=0.2"
      );
    }
  }, []);

  return (
    <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div
        ref={cardRef}
        className="glass-card glow-indigo"
        style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: '450px', width: '100%' }}
      >
        {/* Celebration */}
        <div className="gsap-item" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-purple)' }}>
          <PartyPopper size={64} />
        </div>

        <h1 className="text-gradient gsap-item" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
          {game} Complete!
        </h1>

        <p className="gsap-item" style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
          {message}
        </p>

        {/* Score */}
        <div className="flex justify-center gap-3 mb-4 gsap-item">
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              <Star size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {score}%
            </div>
            <div className="stat-label">Score</div>
          </div>
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem', background: 'linear-gradient(135deg, #F59E0B, #FB923C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <Zap size={18} color="#F59E0B" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              +{xp}
            </div>
            <div className="stat-label">XP Earned</div>
          </div>
          <div className="stat-card" style={{ padding: '1rem 1.5rem' }}>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{correct}/{total}</div>
            <div className="stat-label">Correct</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 gsap-item">
          <button className="btn btn-primary btn-lg w-full" onClick={() => navigate('/dashboard/games')}>
            Play Another Game <ArrowRight size={18} />
          </button>
          <button className="btn btn-secondary w-full" onClick={() => navigate('/dashboard')}>
            <Home size={18} /> Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
