import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { createPatient } from '../api';
import gsap from 'gsap';

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
  { code: 'mni', native: 'মৈতৈলোন্', english: 'Manipuri' },
  { code: 'mz', native: 'Mizo ṭawng', english: 'Mizo' },
  { code: 'kha', native: 'Ka Ktien Khasi', english: 'Khasi' },
];

export default function Onboarding({ onComplete }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(65);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [step]);

  const selectLanguage = (code) => {
    setLanguage(code);
    if (['en', 'as', 'hi', 'bn'].includes(code)) {
      i18n.changeLanguage(code);
    }
    localStorage.setItem('mm_language', code);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const langMap = { en: 'english', as: 'assamese', hi: 'hindi', bn: 'bengali', mni: 'manipuri', mz: 'mizo', kha: 'khasi' };
      const res = await createPatient({
        name: name.trim(),
        age,
        language: langMap[language] || 'english',
        cognitive_level: 1,
      });
      onComplete(res.data.id);
    } catch (err) {
      console.error('API error, using fallback patient ID:', err);
      onComplete(1);
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-container">
      {/* Brand */}
      <motion.div
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          style={{ marginBottom: '0.75rem', color: 'var(--accent-purple)', display: 'flex', justifyContent: 'center' }}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <Brain size={56} />
        </motion.div>
        <h1 className="onboarding-title">MindSathi</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>
          AI-Powered Cognitive Wellness Companion
        </p>
      </motion.div>

      <div ref={contentRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {/* Step 1: Language */}
        {step === 1 && (
          <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
            <h2 className="gsap-item" style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              Choose Your Language
            </h2>
            <div className="lang-grid" style={{ maxWidth: '480px', gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-btn gsap-item ${language === lang.code ? 'selected' : ''}`}
                  onClick={() => selectLanguage(lang.code)}
                  style={{ opacity: 0 }}
                >
                  <span className="lang-native">{lang.native}</span>
                  <span className="lang-english">{lang.english}</span>
                </button>
              ))}
            </div>
            <div className="gsap-item mt-3">
              <button
                className="btn btn-primary btn-lg w-full"
                onClick={() => setStep(2)}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Name & Age */}
        {step === 2 && (
          <div style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 1 }}>
            <h2 className="gsap-item" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              What is your name?
            </h2>
            <input
              type="text"
              className="gsap-item"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              style={{
                width: '100%', padding: '1.1rem', fontSize: '1.2rem',
                textAlign: 'center', fontWeight: '600',
                marginBottom: '2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-xl)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              autoFocus
            />

            <h3 className="gsap-item" style={{ textAlign: 'center', marginBottom: '1rem' }}>Your age?</h3>
            <div className="flex items-center justify-center gap-3 mb-4 gsap-item">
              <button
                className="btn btn-secondary"
                onClick={() => setAge(Math.max(50, age - 1))}
                style={{ fontSize: '1.5rem', padding: '0.5rem 1.5rem' }}
              >
                −
              </button>
              <span style={{
                fontSize: '2.5rem', fontWeight: '800', minWidth: '80px',
                textAlign: 'center',
                background: 'var(--gradient-neural)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {age}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setAge(Math.min(110, age + 1))}
                style={{ fontSize: '1.5rem', padding: '0.5rem 1.5rem' }}
              >
                +
              </button>
            </div>

            <div className="flex gap-2 gsap-item">
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
                ← Back
              </button>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={!name.trim() || loading}
                style={{ flex: 2, opacity: (!name.trim() || loading) ? 0.5 : 1 }}
              >
                {loading ? 'Starting...' : 'Start Brain Journey'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', opacity: 0.3,
        fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-muted)',
      }}>
        Crafted with care for NER elders
      </div>
    </div>
  );
}
