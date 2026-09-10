import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, Circle, Droplets, Pill, Activity, Moon, Sun, Coffee } from 'lucide-react';

const DAILY_ITEMS = [
  { id: 1, time: '07:00', label: 'Morning Walk', icon: '🚶', category: 'activity', done: true },
  { id: 2, time: '08:00', label: 'Morning Medicine', icon: '💊', category: 'medicine', done: true },
  { id: 3, time: '09:00', label: 'Breakfast', icon: '🍳', category: 'routine', done: true },
  { id: 4, time: '10:00', label: 'Hydration Check', icon: '💧', category: 'hydration', done: true },
  { id: 5, time: '11:00', label: 'Memory Game', icon: '🧩', category: 'activity', done: true },
  { id: 6, time: '13:00', label: 'Lunch & Rest', icon: '🍚', category: 'routine', done: false },
  { id: 7, time: '14:00', label: 'Afternoon Medicine', icon: '💊', category: 'medicine', done: false },
  { id: 8, time: '15:00', label: 'Hydration Check', icon: '💧', category: 'hydration', done: false },
  { id: 9, time: '16:00', label: 'Focus Challenge', icon: '🎯', category: 'activity', done: false },
  { id: 10, time: '18:00', label: 'Evening Walk', icon: '🌆', category: 'activity', done: false },
  { id: 11, time: '19:00', label: 'Family Time', icon: '👨‍👩‍👧', category: 'social', done: false },
  { id: 12, time: '20:00', label: 'Evening Medicine', icon: '💊', category: 'medicine', done: false },
  { id: 13, time: '21:00', label: 'Relaxation', icon: '🧘', category: 'relaxation', done: false },
];

const CATEGORY_FILTERS = ['All', 'Medicine', 'Hydration', 'Activity', 'Routine', 'Social', 'Relaxation'];

export default function DailyCare({ patientId }) {
  const [items, setItems] = useState(DAILY_ITEMS);
  const [filter, setFilter] = useState('All');

  const toggleDone = (id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const filtered = filter === 'All' ? items : items.filter(i => i.category.toLowerCase() === filter.toLowerCase());
  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">💝 Daily Care</h1>
        <p className="page-subtitle">Your calm daily journey — one step at a time</p>
      </motion.div>

      {/* Progress Summary */}
      <motion.div
        className="glass-card mb-3"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ color: 'var(--text-primary)' }}>Today's Progress</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{doneCount} of {items.length} activities completed</p>
          </div>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--gradient-neural)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem', color: 'white',
          }}>
            {Math.round((doneCount / items.length) * 100)}%
          </div>
        </div>
        <div className="xp-bar" style={{ marginTop: '1rem' }}>
          <div className="xp-bar-fill" style={{ width: `${(doneCount / items.length) * 100}%` }} />
        </div>
      </motion.div>

      {/* Category Filters */}
      <motion.div
        className="tab-group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {CATEGORY_FILTERS.map(cat => (
          <button
            key={cat}
            className={`tab-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Timeline */}
      <div className="timeline">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            className={`timeline-item ${item.done ? 'done' : 'pending'}`}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.03 }}
          >
            <div
              className="glass-card"
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                opacity: item.done ? 0.6 : 1,
                cursor: 'pointer',
              }}
              onClick={() => toggleDone(item.id)}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, minWidth: '50px' }}>
                {item.time}
              </span>
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, color: 'var(--text-primary)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  opacity: item.done ? 0.7 : 1,
                }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {item.category}
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: item.done ? 'var(--success-bg)' : 'rgba(255,255,255,0.04)',
                border: `2px solid ${item.done ? 'var(--success)' : 'var(--glass-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {item.done && <Check size={16} color="var(--success)" />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
