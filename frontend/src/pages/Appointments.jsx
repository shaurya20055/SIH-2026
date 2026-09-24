import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Bell, User, Plus, X } from 'lucide-react';
import gsap from 'gsap';

export default function Appointments({ patientId }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBook, setShowBook] = useState(false);
  const [newApt, setNewApt] = useState({ doctorId: '', dateTime: '', issue: '' });
  const pageRef = useRef(null);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/appointments/?patient_id=${patientId}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error('Failed to fetch appointments', e); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/?role=doctor`);
      if (res.ok) {
        const data = await res.json();
        setDoctors(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error('Failed to fetch doctors', e); }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [patientId]);

  useEffect(() => {
    if (pageRef.current && appointments.length > 0) {
      gsap.fromTo(pageRef.current.querySelectorAll('.gsap-card'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, [appointments]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!newApt.doctorId || !newApt.dateTime || !newApt.issue) return;
    try {
      const res = await fetch('http://127.0.0.1:8000/api/appointments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: patientId,
          doctor: newApt.doctorId,
          date_time: newApt.dateTime,
          issue_description: newApt.issue,
          status: 'pending'
        })
      });
      if (res.ok) {
        setShowBook(false);
        setNewApt({ doctorId: '', dateTime: '', issue: '' });
        fetchAppointments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Currently we just treat any future date as upcoming based on simple string logic, or just show all
  // For simplicity, just show all appointments fetched from backend.
  return (
    <div className="page-container" ref={pageRef}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">
            <span className="title-icon"><Calendar size={22} /></span>
            Appointments
          </h1>
          <p className="page-subtitle">Stay on top of your healthcare visits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBook(true)} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={18} /> Book Doctor
        </button>
      </motion.div>

      {/* Appointment List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {appointments.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            No appointments booked yet. Click "Book Doctor" to schedule one.
          </div>
        ) : appointments.map((apt, i) => (
          <div key={apt.id} className="glass-card gsap-card" style={{ padding: '1.5rem', borderLeft: `4px solid ${apt.status === 'pending' ? '#f59e0b' : '#10b981'}` }}>
            <div className="flex items-center gap-4 mb-3">
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="var(--accent-purple)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{apt.doctor_name}</h3>
                <span className={`badge badge-${apt.status === 'pending' ? 'warning' : 'success'}`} style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                  {apt.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              <div className="flex items-center gap-2">
                <Calendar size={16} color="var(--accent-cyan)" />
                <span>{new Date(apt.date_time).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} color="var(--accent-cyan)" />
                <span>City Hospital, Online Consultation</span>
              </div>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <strong>Issue:</strong> {apt.issue_description}
            </p>
          </div>
        ))}
      </div>

      {/* Book Modal */}
      <AnimatePresence>
        {showBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }} className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
              <button onClick={() => setShowBook(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
              <h2 style={{ marginBottom: '1.5rem', color: '#f0f0f5' }}>Book Appointment</h2>
              
              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Select Doctor</label>
                  <select className="form-input" required value={newApt.doctorId} onChange={e => setNewApt({...newApt, doctorId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                    <option value="">-- Choose --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.first_name} {d.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Date & Time</label>
                  <input type="datetime-local" required className="form-input" value={newApt.dateTime} onChange={e => setNewApt({...newApt, dateTime: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Describe Issue / Symptoms</label>
                  <textarea required rows="4" className="form-input" value={newApt.issue} onChange={e => setNewApt({...newApt, issue: e.target.value})} placeholder="e.g. Memory lapses getting more frequent..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}>Confirm Booking</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
