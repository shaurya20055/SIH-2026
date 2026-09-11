import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mic, Send, Brain } from 'lucide-react';

const SUGGESTIONS = [
  'Remind me to take my medicine.',
  'What is my next activity?',
  'When is my appointment?',
  'How did I perform today?',
];

const INITIAL_MESSAGES = [
  { role: 'assistant', text: 'Hello! I\'m MindSathi, your cognitive wellness companion. How can I help you today?' },
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');

    // Simulated AI response
    setTimeout(() => {
      const responses = {
        medicine: 'Your next medicine, Metformin 500mg, is scheduled at 2:00 PM. I\'ll remind you when it\'s time.',
        activity: 'Your next activity is the Focus Challenge game. Would you like to start it now?',
        appointment: 'Your next appointment is with Dr. Sharma on Monday at 11:00 AM at City Hospital.',
        perform: 'Today you\'ve completed 3 out of 5 activities with 78% accuracy. Your memory scores are improving.',
      };

      const key = Object.keys(responses).find(k => msg.toLowerCase().includes(k));
      const response = key ? responses[key] : 'I understand. Let me help you with that. You can ask me about your medicines, activities, appointments, or daily progress.';

      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    }, 800);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.start();
    }
  };

  return (
    <>
      {/* Orb Button */}
      <motion.button
        className="ai-assistant-orb"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.9 }}
        aria-label="Open AI Assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} color="white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <MessageCircle size={24} color="white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="ai-panel-header">
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-neural)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>MindSathi</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Online</div>
              </div>
            </div>

            {/* Messages */}
            <div className="ai-panel-body">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-message ${msg.role}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {msg.text}
                </motion.div>
              ))}

              {/* Quick suggestions */}
              {messages.length <= 1 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--glass-border)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-accent)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={(e) => e.target.style.background = 'rgba(124,58,237,0.1)'}
                      onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="ai-panel-input">
              <button
                className="btn btn-icon btn-ghost"
                onClick={handleVoiceInput}
                style={{ minWidth: 40, minHeight: 40, color: 'var(--accent-violet)' }}
                aria-label="Voice input"
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '0.6rem 0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <button
                className="btn btn-icon btn-primary"
                onClick={() => handleSend()}
                style={{ minWidth: 40, minHeight: 40 }}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
