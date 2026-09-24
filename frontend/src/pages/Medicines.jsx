import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, Check, Pill, FileText, Info, Camera, Upload } from 'lucide-react';
import gsap from 'gsap';

export default function Medicines({ patientId }) {
  const [medicines, setMedicines] = useState([]);
  const [tab, setTab] = useState('schedule');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: '', time: '08:00 AM', dosage: '1 tablet', instructions: '' });
  const containerRef = useRef(null);

  const fetchMedicines = async () => {
    if (!patientId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/medicines/?patient_id=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setMedicines(Array.isArray(data) ? data : data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, [patientId]);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.querySelectorAll('.gsap-item'),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
      );
    }
  }, [tab, medicines]);

  const takeMedicine = async (med) => {
    try {
      const res = await fetch(`http://localhost:8000/api/medicines/${med.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taken: true })
      });
      if (res.ok) {
        setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, taken: true } : m));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/medicines/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMed, patient: patientId })
      });
      if (res.ok) {
        const data = await res.json();
        setMedicines([data, ...medicines]);
        setNewMed({ name: '', time: '08:00 AM', dosage: '1 tablet', instructions: '' });
        setShowAddForm(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const nextDue = medicines.find(m => !m.taken);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><Pill size={22} /></span>
          Medicines
        </h1>
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
          <div className="pill-icon"><Pill size={48} /></div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Time for your medicine</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {nextDue.name} — {nextDue.dosage} at {nextDue.time}
          </p>
          <div className="flex gap-2 justify-center">
            <motion.button
              className="btn btn-success btn-lg"
              onClick={() => takeMedicine(nextDue)}
              whileTap={{ scale: 0.95 }}
              style={{ gap: '0.5rem' }}
            >
              <Check size={20} /> Taken
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div className="tab-group flex justify-between items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        <div>
          <button className={`tab-btn ${tab === 'schedule' ? 'active' : ''}`} onClick={() => setTab('schedule')}>Schedule</button>
          <button className={`tab-btn ${tab === 'prescription' ? 'active' : ''}`} onClick={() => setTab('prescription')}>Prescription</button>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} /> Add Medicine
        </button>
      </motion.div>

      {showAddForm && (
        <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleAddMedicine} className="glass-card mb-3 p-4">
          <h3 className="mb-2">Add New Medicine</h3>
          <div className="grid-2 mb-2">
            <div>
              <label className="form-label">Medicine Name</label>
              <input type="text" className="form-input" required value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} placeholder="e.g. Paracetamol" />
            </div>
            <div>
              <label className="form-label">Time</label>
              <input type="text" className="form-input" required value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} placeholder="e.g. 08:00 AM" />
            </div>
            <div>
              <label className="form-label">Dosage</label>
              <input type="text" className="form-input" required value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} placeholder="e.g. 1 tablet" />
            </div>
            <div>
              <label className="form-label">Instructions (optional)</label>
              <input type="text" className="form-input" value={newMed.instructions} onChange={e => setNewMed({...newMed, instructions: e.target.value})} placeholder="e.g. After meal" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-full">Save Medicine</button>
        </motion.form>
      )}

      <div ref={containerRef}>
        {tab === 'schedule' && (
          <div>
            {medicines.map((med) => (
              <div key={med.id} className="glass-card mb-2 gsap-item">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 style={{ fontSize: '1.05rem', textDecoration: med.taken ? 'line-through' : 'none' }}>{med.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{med.dosage} {med.instructions ? `· ${med.instructions}` : ''}</p>
                  </div>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: med.taken ? 'var(--success-bg)' : 'rgba(124,58,237,0.1)', 
                    color: med.taken ? 'var(--success)' : 'var(--accent-violet)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {med.taken ? <Check size={20} /> : <Pill size={20} />}
                  </div>
                </div>
                <div className="flex gap-2">
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      background: med.taken ? 'var(--success-bg)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${med.taken ? 'rgba(52,211,153,0.3)' : 'var(--glass-border)'}`,
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      fontSize: '0.9rem',
                      color: med.taken ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}
                  >
                    <Clock size={14} />
                    <span>{med.time}</span>
                    {med.taken && <Check size={14} color="var(--success)" />}
                  </div>
                  {!med.taken && (
                    <button className="btn btn-success btn-sm" onClick={() => takeMedicine(med)}>Mark Taken</button>
                  )}
                </div>
              </div>
            ))}
            {medicines.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No medicines found. Add one above.</p>}
          </div>
        )}

        {tab === 'prescription' && (
          <div className="gsap-item">
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ color: 'var(--accent-purple)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                <FileText size={48} />
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>Upload Prescription</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Upload or scan your prescription and our AI will extract medicine details.
              </p>

              <div className="flex gap-2 justify-center">
                <button className="btn btn-primary"><Upload size={18} /> Upload Image</button>
                <button className="btn btn-secondary"><Camera size={18} /> Scan</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
