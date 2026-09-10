import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Check, Clock } from 'lucide-react';
import { getReminders, markReminderDone, createReminder } from '../api';

export default function RemindersPage({ patientId }) {
  const { t } = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState({ label: '', reminder_type: 'medicine', scheduled_time: '08:00' });

  useEffect(() => { loadReminders(); }, []);

  const loadReminders = async () => {
    try {
      const res = await getReminders(patientId);
      setReminders(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setReminders([
        { id: 1, label: 'Morning Medicine', reminder_type: 'medicine', scheduled_time: '08:00', is_done: false },
        { id: 2, label: 'Drink Water 💧', reminder_type: 'hydration', scheduled_time: '10:00', is_done: false },
        { id: 3, label: 'Morning Walk', reminder_type: 'activity', scheduled_time: '07:00', is_done: true },
        { id: 4, label: 'Afternoon Medicine', reminder_type: 'medicine', scheduled_time: '14:00', is_done: false },
        { id: 5, label: 'Evening Walk', reminder_type: 'activity', scheduled_time: '18:00', is_done: false },
      ]);
    }
  };

  const handleDone = async (id) => {
    try { await markReminderDone(id); } catch {}
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_done: true } : r));
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance('Done! Great job!');
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const handleAdd = async () => {
    if (!newReminder.label.trim()) return;
    try { await createReminder({ ...newReminder, patient: patientId }); } catch {}
    setShowAdd(false);
    setNewReminder({ label: '', reminder_type: 'medicine', scheduled_time: '08:00' });
    loadReminders();
  };

  const icons = { medicine: '💊', hydration: '💧', appointment: '🏥', activity: '🚶' };
  const pending = reminders.filter(r => !r.is_done);
  const done = reminders.filter(r => r.is_done);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-3">
        <div>
          <h1 className="page-title">⏰ Reminders</h1>
          <p className="page-subtitle">{pending.length} pending today</p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setShowAdd(!showAdd)}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} /> Add
        </motion.button>
      </motion.div>

      {/* Add Form */}
      {showAdd && (
        <motion.div className="glass-card mb-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="mb-2">New Reminder</h3>
          <input
            type="text" value={newReminder.label}
            onChange={(e) => setNewReminder({ ...newReminder, label: e.target.value })}
            placeholder="Reminder label..."
            style={{ marginBottom: '0.75rem' }}
          />
          <div className="flex gap-2 mb-2">
            <select value={newReminder.reminder_type}
              onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value })}
              style={{ flex: 1 }}>
              <option value="medicine">💊 Medicine</option>
              <option value="hydration">💧 Hydration</option>
              <option value="appointment">🏥 Appointment</option>
              <option value="activity">🚶 Activity</option>
            </select>
            <input type="time" value={newReminder.scheduled_time}
              onChange={(e) => setNewReminder({ ...newReminder, scheduled_time: e.target.value })}
              style={{ width: 'auto' }} />
          </div>
          <button className="btn btn-success w-full" onClick={handleAdd}>
            <Check size={16} /> Save Reminder
          </button>
        </motion.div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <h3 className="mb-2" style={{ color: 'var(--text-secondary)' }}>📌 Pending ({pending.length})</h3>
          {pending.map((r, i) => (
            <motion.div
              key={r.id}
              className={`reminder-card ${r.reminder_type}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
              <div className="reminder-info">
                <div className="reminder-label">{r.label}</div>
                <div className="reminder-time flex items-center gap-1">
                  <Clock size={12} /> {r.scheduled_time}
                </div>
              </div>
              <motion.button
                className="btn btn-success btn-sm"
                onClick={() => handleDone(r.id)}
                whileTap={{ scale: 0.9 }}
              >
                <Check size={14} /> Done
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Done */}
      {done.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 className="mb-2 mt-3" style={{ color: 'var(--text-muted)' }}>✅ Completed ({done.length})</h3>
          {done.map(r => (
            <div key={r.id} className={`reminder-card ${r.reminder_type} done`}>
              <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
              <div className="reminder-info">
                <div className="reminder-label">{r.label}</div>
                <div className="reminder-time">{r.scheduled_time}</div>
              </div>
              <Check size={18} color="var(--success)" />
            </div>
          ))}
        </motion.div>
      )}

      {reminders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.5 }}>
          <div style={{ fontSize: '3rem' }}>📭</div>
          <p style={{ color: 'var(--text-muted)' }}>No reminders yet</p>
        </div>
      )}
    </div>
  );
}
