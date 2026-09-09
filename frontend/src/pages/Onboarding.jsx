import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createPatient } from '../api';

const LANGUAGES = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali' },
];

export default function Onboarding({ onComplete }) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState(65);
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);

  const selectLanguage = (code) => {
    setLanguage(code);
    i18n.changeLanguage(code);
    localStorage.setItem('mm_language', code);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const langMap = { en: 'english', as: 'assamese', hi: 'hindi', bn: 'bengali' };
      const res = await createPatient({
        name: name.trim(),
        age,
        language: langMap[language] || 'english',
        cognitive_level: 1,
      });
      onComplete(res.data.id);
    } catch (err) {
      // Fallback: use patient ID 1 if API fails (offline mode)
      console.error('API error, using fallback patient ID:', err);
      onComplete(1);
    }
    setLoading(false);
  };

  return (
    <div className="onboarding-container">
      <div className="animate-float" style={{ textAlign: 'center' }}>
        <div className="onboarding-logo">🪞</div>
        <h1 className="onboarding-title">Memory Mirror</h1>
        <p className="text-gray mb-4" style={{ fontSize: '1.1rem' }}>
          AI-Powered Cognitive Care for NER Elders
        </p>
      </div>

      {step === 1 && (
        <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: '450px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {t('language')} / ভাষা বাছনি কৰক
          </h2>
          <div className="lang-grid">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`lang-btn ${language === lang.code ? 'selected' : ''}`}
                onClick={() => selectLanguage(lang.code)}
              >
                <span className="lang-native">{lang.native}</span>
                <span className="lang-english">{lang.english}</span>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg w-full mt-3" onClick={() => setStep(2)}>
            {t('next')} →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fadeInUp" style={{ width: '100%', maxWidth: '450px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {language === 'as' ? 'আপোনাৰ নাম কি?' : language === 'hi' ? 'आपका नाम क्या है?' : 'What is your name?'}
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={language === 'as' ? 'নাম লিখক...' : language === 'hi' ? 'नाम लिखें...' : 'Enter your name...'}
            style={{
              width: '100%', padding: '1.2rem', fontSize: '1.3rem',
              border: '2px solid #DFE6E9', borderRadius: '1rem',
              textAlign: 'center', fontWeight: '600',
              marginBottom: '1.5rem',
            }}
            autoFocus
          />

          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>
            {language === 'as' ? 'আপোনাৰ বয়স?' : language === 'hi' ? 'आपकी उम्र?' : 'Your age?'}
          </h3>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button className="btn btn-outline" onClick={() => setAge(Math.max(50, age - 1))} style={{ fontSize: '1.5rem', padding: '0.5rem 1.5rem' }}>−</button>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', minWidth: '80px', textAlign: 'center', color: 'var(--teal)' }}>{age}</span>
            <button className="btn btn-outline" onClick={() => setAge(Math.min(110, age + 1))} style={{ fontSize: '1.5rem', padding: '0.5rem 1.5rem' }}>+</button>
          </div>

          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>
              ← {t('back')}
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!name.trim() || loading}
              style={{ flex: 2 }}
            >
              {loading ? t('loading') : `${t('lets_play')} 🎮`}
            </button>
          </div>
        </div>
      )}

      {/* NER cultural decoration */}
      <div style={{
        position: 'fixed', bottom: '2rem', opacity: 0.15,
        fontSize: '1rem', textAlign: 'center', color: 'var(--gray)',
      }}>
        🪷 Crafted with love for NER elders 🎋
      </div>
    </div>
  );
}
