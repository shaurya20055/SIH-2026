import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, Heart, Pill, Activity, Sun, Moon, Coffee, Users, Target, FileText, Calendar, BarChart3, Bell, User } from 'lucide-react';
import gsap from 'gsap';

const DAILY_ITEMS = [
  { id: 1, time: '07:00', label: 'Morning Walk', icon: <Activity size={20} />, category: 'activity', done: true },
  { id: 2, time: '08:00', label: 'Morning Medicine', icon: <Pill size={20} />, category: 'medicine', done: true },
  { id: 3, time: '09:00', label: 'Breakfast', icon: <Coffee size={20} />, category: 'routine', done: true },
  { id: 4, time: '10:00', label: 'Hydration Check', icon: <span style={{ color: 'var(--accent-cyan)' }}>💧</span>, category: 'hydration', done: true },
  { id: 5, time: '11:00', label: 'Memory Game', icon: <Target size={20} />, category: 'activity', done: true },
  { id: 6, time: '13:00', label: 'Lunch & Rest', icon: <Coffee size={20} />, category: 'routine', done: false },
  { id: 7, time: '14:00', label: 'Afternoon Medicine', icon: <Pill size={20} />, category: 'medicine', done: false },
  { id: 8, time: '15:00', label: 'Hydration Check', icon: <span style={{ color: 'var(--accent-cyan)' }}>💧</span>, category: 'hydration', done: false },
  { id: 9, time: '16:00', label: 'Focus Challenge', icon: <Target size={20} />, category: 'activity', done: false },
  { id: 10, time: '18:00', label: 'Evening Walk', icon: <Sun size={20} />, category: 'activity', done: false },
  { id: 11, time: '19:00', label: 'Family Time', icon: <Users size={20} />, category: 'social', done: false },
  { id: 12, time: '20:00', label: 'Evening Medicine', icon: <Pill size={20} />, category: 'medicine', done: false },
  { id: 13, time: '21:00', label: 'Relaxation', icon: <Moon size={20} />, category: 'relaxation', done: false },
];

const CATEGORY_FILTERS = ['All', 'Medicine', 'Hydration', 'Activity', 'Routine', 'Social', 'Relaxation'];

export default function DailyCare({ patientId }) {
  const [items, setItems] = useState(DAILY_ITEMS);
  const [filter, setFilter] = useState('All');
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, [filter]);

  const toggleDone = (id) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const filtered = filter === 'All' ? items : items.filter(i => i.category.toLowerCase() === filter.toLowerCase());
  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="page-container" ref={pageRef}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><Heart size={22} /></span>
          Daily Care
        </h1>
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
          <div key={item.id} className={`timeline-item gsap-item ${item.done ? 'done' : 'pending'}`}>
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
              <span style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-accent)'
              }}>
                {item.icon}
              </span>
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
          </div>
        ))}
      </div>
    </div>
  );
}
