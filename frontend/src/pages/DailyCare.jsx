import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, Heart, Pill, Activity, Sun, Moon, Coffee, Users, Target, FileText, Calendar, BarChart3, Bell, User, Plus } from 'lucide-react';
import gsap from 'gsap';

const CATEGORY_FILTERS = ['All', 'Activity', 'Routine', 'Medicine', 'Hydration', 'Social', 'Relaxation'];

const ICONS = {
  activity: <Activity size={20} />,
  medicine: <Pill size={20} />,
  routine: <Coffee size={20} />,
  hydration: <span style={{ color: 'var(--accent-cyan)' }}>💧</span>,
  social: <Users size={20} />,
  relaxation: <Moon size={20} />,
  sun: <Sun size={20} />,
  target: <Target size={20} />
};

export default function DailyCare({ patientId }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', time: '08:00 AM', icon: 'routine' });
  const pageRef = useRef(null);

  const fetchTasks = async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/daily-tasks/?patient_id=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [patientId]);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out' }
      );
    }
  }, [filter, items]);

  const toggleDone = async (id, currentDone) => {
    try {
      const res = await fetch(`http://localhost:8000/api/daily-tasks/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ done: !currentDone })
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, done: !currentDone } : item));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/daily-tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, patient: patientId })
      });
      if (res.ok) {
        const data = await res.json();
        setItems([...items, data]);
        setNewTask({ title: '', time: '08:00 AM', icon: 'routine' });
        setShowAdd(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = filter === 'All' ? items : items.filter(i => (i.icon || 'routine').toLowerCase() === filter.toLowerCase());
  const doneCount = items.filter(i => i.done).length;

  return (
    <div className="page-container" ref={pageRef}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header flex justify-between items-end">
        <div>
          <h1 className="page-title">
            <span className="title-icon"><Heart size={22} /></span>
            Daily Care
          </h1>
          <p className="page-subtitle">Your calm daily journey — one step at a time</p>
        </div>
        <button className="btn btn-primary btn-sm mb-2" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} /> Add Task
        </button>
      </motion.div>

      {showAdd && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddTask} className="glass-card mb-3 p-4">
          <h3 className="mb-2">Add New Daily Task</h3>
          <div className="grid-2 mb-2">
            <div>
              <label className="form-label">Task Title</label>
              <input type="text" className="form-input" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="e.g. Morning Walk" />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input type="text" className="form-input" required value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} placeholder="e.g. 08:00 AM" />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select className="form-input" value={newTask.icon} onChange={e => setNewTask({...newTask, icon: e.target.value})}>
                <option value="routine">Routine</option>
                <option value="activity">Activity</option>
                <option value="medicine">Medicine</option>
                <option value="hydration">Hydration</option>
                <option value="social">Social</option>
                <option value="relaxation">Relaxation</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full">Save Task</button>
        </motion.form>
      )}

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
            {items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0}%
          </div>
        </div>
        <div className="xp-bar" style={{ marginTop: '1rem' }}>
          <div className="xp-bar-fill" style={{ width: items.length > 0 ? `${(doneCount / items.length) * 100}%` : '0%' }} />
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
        {filtered.map((item) => (
          <div key={item.id} className={`timeline-item gsap-item ${item.done ? 'done' : 'pending'}`}>
            <div
              className="glass-card"
              style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.25rem',
                opacity: item.done ? 0.6 : 1,
                cursor: 'pointer',
              }}
              onClick={() => toggleDone(item.id, item.done)}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, minWidth: '50px' }}>
                {item.time}
              </span>
              <span style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)', color: 'var(--text-accent)'
              }}>
                {ICONS[item.icon] || <Check size={20} />}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 600, color: 'var(--text-primary)',
                  textDecoration: item.done ? 'line-through' : 'none',
                  opacity: item.done ? 0.7 : 1,
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {item.icon || 'routine'}
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
        {items.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>No tasks found. Add a task above to get started.</p>}
      </div>
    </div>
  );
}
