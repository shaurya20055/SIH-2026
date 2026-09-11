import { useEffect, useRef, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const BrainScene = lazy(() => import('../components/3d/BrainScene'));

const HOLO_LABELS = [
  { text: 'MEMORY', top: '18%', left: '58%', delay: 0 },
  { text: 'FOCUS', top: '30%', left: '78%', delay: 0.8 },
  { text: 'RECOGNITION', top: '55%', left: '82%', delay: 1.6 },
  { text: 'ATTENTION', top: '70%', left: '65%', delay: 2.4 },
  { text: 'CONNECTION', top: '42%', left: '52%', delay: 3.2 },
];

export default function HeroLanding({ onStart }) {
  const navigate = useNavigate();
  const contentRef = useRef(null);
  const labelsRef = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(contentRef.current?.querySelector('.hero-tag'),
      { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.3 })
      .fromTo(contentRef.current?.querySelector('.hero-line-1'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo(contentRef.current?.querySelector('.hero-line-2'),
        { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .fromTo(contentRef.current?.querySelector('.hero-subtitle'),
        { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      .fromTo(contentRef.current?.querySelector('.hero-ctas'),
        { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.3');

    // Animate holo labels
    labelsRef.current.forEach((el, i) => {
      if (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.8, delay: 1.5 + i * 0.3, ease: 'power3.out' }
        );
      }
    });
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
        {HOLO_LABELS.map((label, i) => (
          <div
            key={label.text}
            className="holo-label"
            style={{ top: label.top, left: label.left, opacity: 0 }}
            ref={(el) => (labelsRef.current[i] = el)}
          >
            {label.text}
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="hero-content" ref={contentRef}>
        <p className="hero-tag" style={{
          fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-violet)',
          letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', opacity: 0,
        }}>
          AI-Powered Cognitive Wellness
        </p>

        <h1 className="hero-title">
          <span className="hero-line-1" style={{ display: 'block', opacity: 0 }}>
            Keep Exploring.
          </span>
          <span className="hero-line-2 text-gradient" style={{ display: 'block', opacity: 0 }}>
            Keep Smiling.
          </span>
        </h1>

        <p className="hero-subtitle" style={{ opacity: 0 }}>
          An intelligent companion for memory, meaningful routines
          and brighter everyday moments.
        </p>

        <div className="hero-ctas" style={{ opacity: 0 }}>
          <button className="btn btn-glow" onClick={handleStart}>
            Start Your Brain Journey
          </button>
          <a href="#features" className="btn btn-secondary">
            How MindSathi Helps
          </a>
        </div>
      </div>
    </section>
  );
}
