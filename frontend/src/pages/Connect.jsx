import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mic, Cake, PartyPopper, MessageCircle, Info } from 'lucide-react';
import gsap from 'gsap';

const FAMILY_MEMBERS = [
  { id: 1, name: 'Priya', relation: 'Granddaughter', photo: 'https://i.pravatar.cc/200?img=1' },
  { id: 2, name: 'Rahul', relation: 'Son', photo: 'https://i.pravatar.cc/200?img=3' },
  { id: 3, name: 'Meena', relation: 'Daughter', photo: 'https://i.pravatar.cc/200?img=5' },
  { id: 4, name: 'Arjun', relation: 'Grandson', photo: 'https://i.pravatar.cc/200?img=7' },
  { id: 5, name: 'Lakshmi', relation: 'Sister', photo: 'https://i.pravatar.cc/200?img=9' },
  { id: 6, name: 'Bimal', relation: 'Friend', photo: 'https://i.pravatar.cc/200?img=11' },
];

const BIRTHDAYS = [
  { name: 'Priya', date: 'Sep 15', relation: 'Granddaughter', days: 5 },
  { name: 'Rahul', date: 'Oct 2', relation: 'Son', days: 22 },
];

export default function Connect({ patientId }) {
  const [tab, setTab] = useState('family');
  const [gameActive, setGameActive] = useState(false);
  const [currentPerson, setCurrentPerson] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(contentRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [tab]);

  const startWhoIsThis = () => {
    const person = FAMILY_MEMBERS[Math.floor(Math.random() * FAMILY_MEMBERS.length)];
    setCurrentPerson(person);
    setGameActive(true);
    setGameResult(null);
  };

  const handleGuess = (relation) => {
    const correct = relation === currentPerson.relation;
    setGameResult(correct ? 'correct' : 'wrong');
    if ('speechSynthesis' in window) {
      const msg = correct
        ? `That's right! This is ${currentPerson.name}, your ${currentPerson.relation}.`
        : `That's ${currentPerson.name}, your ${currentPerson.relation}. Let's try another!`;
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><Users size={22} /></span>
          Connect
        </h1>
        <p className="page-subtitle">Stay connected with family and loved ones</p>
      </motion.div>

      {/* Tabs */}
      <motion.div className="tab-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <button className={`tab-btn ${tab === 'family' ? 'active' : ''}`} onClick={() => setTab('family')}>Family</button>
        <button className={`tab-btn ${tab === 'game' ? 'active' : ''}`} onClick={() => { setTab('game'); startWhoIsThis(); }}>Who Is This?</button>
        <button className={`tab-btn ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>Messages</button>
        <button className={`tab-btn ${tab === 'birthdays' ? 'active' : ''}`} onClick={() => setTab('birthdays')}>Birthdays</button>
      </motion.div>

      <div ref={contentRef}>
        {/* Family Tab */}
        {tab === 'family' && (
          <div>
            <h3 className="mb-2">Family Memories</h3>
            <div className="grid-3">
              {FAMILY_MEMBERS.map((person, i) => (
                <motion.div
                  key={person.id}
                  className="glass-card gsap-item"
                  style={{ textAlign: 'center', padding: '1.25rem' }}
                  whileHover={{ scale: 1.03 }}
                >
                  <img
                    src={person.photo}
                    alt={person.name}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      objectFit: 'cover', margin: '0 auto 0.75rem',
                      border: '2px solid var(--glass-border)',
                    }}
                    onError={(e) => { e.target.src = `https://i.pravatar.cc/200?u=${person.id}`; }}
                  />
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{person.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{person.relation}</div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Who Is This Game */}
        {tab === 'game' && currentPerson && (
          <div className="gsap-item" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="glass-card" style={{ textAlign: 'center', padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Who is this?</h2>
              <motion.img
                key={currentPerson.id}
                src={currentPerson.photo}
                alt="Who is this?"
                style={{
                  width: '160px', height: '160px', borderRadius: '50%',
                  objectFit: 'cover', margin: '0 auto 1.5rem',
                  border: '3px solid var(--glass-border)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.2)',
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onError={(e) => { e.target.src = `https://i.pravatar.cc/200?u=${currentPerson.id}`; }}
              />

              {!gameResult ? (
                <div className="grid-2" style={{ gap: '0.75rem' }}>
                  {['Son', 'Daughter', 'Granddaughter', 'Grandson', 'Sister', 'Friend'].map(rel => (
                    <button
                      key={rel}
                      className="option-btn"
                      onClick={() => handleGuess(rel)}
                      style={{ textAlign: 'center' }}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <div style={{
                    padding: '1.5rem', borderRadius: 'var(--radius-xl)',
                    background: gameResult === 'correct' ? 'var(--success-bg)' : 'var(--warning-bg)',
                    border: `1px solid ${gameResult === 'correct' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                    marginBottom: '1.5rem',
                  }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                      {gameResult === 'correct' 
                        ? <PartyPopper size={32} color="var(--success)" />
                        : <MessageCircle size={32} color="var(--warning)" />
                      }
                    </div>
                    <p style={{ fontWeight: 600, color: gameResult === 'correct' ? 'var(--success)' : 'var(--warning)' }}>
                      {gameResult === 'correct' ? 'Wonderful!' : 'Almost!'}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      This is {currentPerson.name}, your {currentPerson.relation}.
                    </p>
                  </div>
                  <button className="btn btn-primary btn-lg w-full" onClick={startWhoIsThis}>
                    Try Another →
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Voice Messages */}
        {tab === 'messages' && (
          <div className="gsap-item">
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ color: 'var(--accent-purple)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <Mic size={48} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Voice Messages</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Record and listen to voice messages from family members
              </p>
              <button className="btn btn-primary btn-lg">
                <Mic size={20} /> Record a Message
              </button>
            </div>
          </div>
        )}

        {/* Birthdays */}
        {tab === 'birthdays' && (
          <div>
            <h3 className="mb-2 flex items-center gap-2">
              <Cake size={20} /> Upcoming Birthdays
            </h3>
            {BIRTHDAYS.map((b, i) => (
              <div key={i} className="glass-card mb-2 gsap-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'rgba(244,114,182,0.15)',
                      color: 'var(--warm-rose)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Cake size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.relation} · {b.date}</div>
                    </div>
                  </div>
                  <span className="badge badge-warning">In {b.days} days</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
