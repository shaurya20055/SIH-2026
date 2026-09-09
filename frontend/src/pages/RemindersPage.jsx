import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    try {
      await createReminder({ ...newReminder, patient: patientId });
    } catch {}
    setShowAdd(false);
    setNewReminder({ label: '', reminder_type: 'medicine', scheduled_time: '08:00' });
    loadReminders();
  };

  const icons = { medicine: '💊', hydration: '💧', appointment: '🏥', activity: '🚶' };
  const pending = reminders.filter(r => !r.is_done);
  const done = reminders.filter(r => r.is_done);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-3">
        <h1>⏰ {t('reminders')}</h1>
        <button className="btn btn-secondary" onClick={() => setShowAdd(!showAdd)}>
          + {t('add_reminder')}
        </button>
      </div>

      {/* Add Reminder Form */}
      {showAdd && (
        <div className="card mb-3 animate-fadeInUp">
          <h3 className="mb-2">{t('add_reminder')}</h3>
          <input
            type="text" value={newReminder.label}
            onChange={(e) => setNewReminder({ ...newReminder, label: e.target.value })}
            placeholder="Reminder label..."
            style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', fontSize: '1rem', marginBottom: '0.75rem' }}
          />
          <div className="flex gap-2 mb-2">
            <select value={newReminder.reminder_type}
              onChange={(e) => setNewReminder({ ...newReminder, reminder_type: e.target.value })}
              style={{ flex: 1, padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', fontSize: '1rem' }}>
              <option value="medicine">{t('medicine')}</option>
              <option value="hydration">{t('hydration')}</option>
              <option value="appointment">{t('appointment')}</option>
              <option value="activity">{t('activity')}</option>
            </select>
            <input type="time" value={newReminder.scheduled_time}
              onChange={(e) => setNewReminder({ ...newReminder, scheduled_time: e.target.value })}
              style={{ padding: '0.8rem', border: '2px solid var(--light-gray)', borderRadius: '0.75rem', fontSize: '1rem' }} />
          </div>
          <button className="btn btn-primary w-full" onClick={handleAdd}>✅ {t('submit')}</button>
        </div>
      )}

      {/* Pending */}
      {pending.length > 0 && (
        <>
          <h2 className="mb-2">📌 Pending ({pending.length})</h2>
          {pending.map(r => (
            <div key={r.id} className={`reminder-card ${r.reminder_type}`}>
              <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
              <div className="reminder-info">
                <div className="reminder-label">{r.label}</div>
                <div className="reminder-time">{r.scheduled_time}</div>
              </div>
              <button className="btn btn-primary" onClick={() => handleDone(r.id)} style={{ padding: '0.75rem 1.25rem' }}>
                ✅ {t('done')}
              </button>
            </div>
          ))}
        </>
      )}

      {/* Completed */}
      {done.length > 0 && (
        <>
          <h2 className="mb-2 mt-3" style={{ color: 'var(--gray)' }}>✅ Completed ({done.length})</h2>
          {done.map(r => (
            <div key={r.id} className={`reminder-card ${r.reminder_type} done`}>
              <span className="reminder-icon">{icons[r.reminder_type] || '📌'}</span>
              <div className="reminder-info">
                <div className="reminder-label">{r.label}</div>
                <div className="reminder-time">{r.scheduled_time}</div>
              </div>
              <span style={{ color: 'var(--success)', fontWeight: 700 }}>✓</span>
            </div>
          ))}
        </>
      )}

      {reminders.length === 0 && (
        <div className="text-center mt-4" style={{ opacity: 0.5 }}>
          <p style={{ fontSize: '3rem' }}>📭</p>
          <p>{t('no_data')}</p>
        </div>
      )}
    </div>
  );
}
