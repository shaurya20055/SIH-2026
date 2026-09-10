import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Plus, Clock, AlertTriangle, Check, X } from 'lucide-react';

const MEDICINES = [
  { id: 1, name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily', total: 30, remaining: 18, times: ['08:00', '20:00'], taken: [true, false] },
  { id: 2, name: 'Donepezil 10mg', dosage: '1 tablet', frequency: 'Once daily', total: 30, remaining: 24, times: ['09:00'], taken: [true] },
  { id: 3, name: 'Vitamin D3', dosage: '1 capsule', frequency: 'Once daily', total: 60, remaining: 8, times: ['08:00'], taken: [true] },
  { id: 4, name: 'Amlodipine 5mg', dosage: '1 tablet', frequency: 'Once daily', total: 30, remaining: 22, times: ['08:00'], taken: [false] },
];

export default function Medicines({ patientId }) {
  const [medicines, setMedicines] = useState(MEDICINES);
  const [showReminder, setShowReminder] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState('schedule');

  const takeMedicine = (medId, timeIdx) => {
    setMedicines(prev => prev.map(m => {
      if (m.id === medId) {
        const taken = [...m.taken];
        taken[timeIdx] = true;
        return { ...m, taken, remaining: m.remaining - 1 };
      }
      return m;
    }));
    setShowReminder(null);
  };

  const nextDue = medicines.find(m => m.taken.includes(false));

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">💊 Medicines</h1>
        <p className="page-subtitle">Track your medications and stay on schedule</p>
      </motion.div>

      {/* Medicine Reminder */}
      {nextDue && (
        <motion.div
          className="medicine-reminder mb-3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="pill-icon">💊</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Time for your medicine</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {nextDue.name} — {nextDue.dosage}
          </p>
          <div className="flex gap-2 justify-center">
            <motion.button
              className="btn btn-success btn-lg"
              onClick={() => takeMedicine(nextDue.id, nextDue.taken.indexOf(false))}
              whileTap={{ scale: 0.95 }}
              style={{ gap: '0.5rem' }}
            >
              <Check size={20} /> Taken
            </motion.button>
            <button className="btn btn-secondary btn-lg">
              <Clock size={20} /> Snooze
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div className="tab-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <button className={`tab-btn ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>📋 Schedule</button>
        <button className={`tab-btn ${tab === 'inventory' ? 'active' : ''}`} onClick={() => setTab('inventory')}>📦 Inventory</button>
        <button className={`tab-btn ${tab === 'prescription' ? 'active' : ''}`} onClick={() => setTab('prescription')}>📄 Prescription</button>
      </motion.div>

      {/* Schedule Tab */}
      {tab === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {medicines.map((med, i) => (
            <motion.div
              key={med.id}
              className="glass-card mb-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 style={{ fontSize: '1.05rem' }}>{med.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{med.dosage} · {med.frequency}</p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>💊</span>
              </div>
              <div className="flex gap-2">
                {med.times.map((time, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      background: med.taken[idx] ? 'var(--success-bg)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${med.taken[idx] ? 'rgba(52,211,153,0.3)' : 'var(--glass-border)'}`,
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <Clock size={14} />
                    <span>{time}</span>
                    {med.taken[idx] && <Check size={14} color="var(--success)" />}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Inventory Tab */}
      {tab === 'inventory' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {medicines.map((med, i) => {
            const pct = (med.remaining / med.total) * 100;
            const isLow = pct < 30;
            return (
              <motion.div
                key={med.id}
                className="medicine-card mb-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 style={{ fontSize: '1.05rem' }}>{med.name}</h3>
                  {isLow && (
                    <span className="badge badge-warning">
                      <AlertTriangle size={12} /> Refill soon
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {med.total} tablets total
                </p>
                <div className="medicine-progress">
                  <div className={`medicine-progress-fill ${isLow ? 'low' : ''}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between" style={{ fontSize: '0.85rem' }}>
                  <span style={{ color: isLow ? 'var(--warning)' : 'var(--text-secondary)' }}>
                    {med.remaining} remaining
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    ~{Math.ceil(med.remaining / (med.times.length || 1))} days left
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Prescription Tab */}
      {tab === 'prescription' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Upload Prescription</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Upload or scan your prescription and our AI will extract medicine details for caregiver confirmation.
            </p>

            <div style={{
              padding: '2rem', border: '2px dashed var(--glass-border)',
              borderRadius: 'var(--radius-xl)', marginBottom: '1.5rem',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Drag & drop or click to upload
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              <button className="btn btn-primary">
                <Upload size={18} /> Upload Image
              </button>
              <button className="btn btn-secondary">
                <Camera size={18} /> Scan Prescription
              </button>
            </div>

            <div className="alert-banner info mt-3" style={{ textAlign: 'left' }}>
              <span>ℹ️</span>
              <span>AI extracts medicine details but requires caregiver confirmation before adding to your schedule. AI never independently prescribes medication.</span>
            </div>

            {/* OCR Flow Preview */}
            <div className="flex items-center justify-center gap-1 mt-3" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span className="badge badge-info">Upload</span>
              <span>→</span>
              <span className="badge badge-info">OCR Extract</span>
              <span>→</span>
              <span className="badge badge-warning">Caregiver Confirm</span>
              <span>→</span>
              <span className="badge badge-success">Schedule Added</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
