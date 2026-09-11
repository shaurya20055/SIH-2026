import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Bell, User } from 'lucide-react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

const APPOINTMENTS = [
  { id: 1, doctor: 'Dr. Sharma', specialty: 'Neurologist', date: 'Monday, Sep 15', time: '11:00 AM', location: 'City Hospital, Guwahati', purpose: 'Routine cognitive assessment', upcoming: true },
  { id: 2, doctor: 'Dr. Barua', specialty: 'General Physician', date: 'Thursday, Sep 25', time: '10:30 AM', location: 'Community Health Center', purpose: 'Monthly check-up', upcoming: true },
  { id: 3, doctor: 'Dr. Das', specialty: 'Cardiologist', date: 'Friday, Aug 29', time: '02:00 PM', location: 'GMCH, Guwahati', purpose: 'Blood pressure review', upcoming: false },
];

export default function Appointments({ patientId }) {
  const upcoming = APPOINTMENTS.filter(a => a.upcoming);
  const past = APPOINTMENTS.filter(a => !a.upcoming);
  const pageRef = useRef(null);

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(pageRef.current.querySelectorAll('.gsap-card'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.1 }
      );
    }
  }, []);

  return (
    <div className="page-container" ref={pageRef}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <h1 className="page-title">
          <span className="title-icon"><Calendar size={22} /></span>
          Appointments
        </h1>
        <p className="page-subtitle">Stay on top of your healthcare visits</p>
      </motion.div>

      {/* Next Appointment - Featured */}
      {upcoming[0] && (
        <div className="glass-card glow-indigo mb-3 gsap-card" style={{ padding: '2rem' }}>
          <span className="badge badge-info mb-2" style={{ display: 'inline-flex' }}>Next Appointment</span>
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={24} color="var(--accent-purple)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem' }}>{upcoming[0].doctor}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{upcoming[0].specialty}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Calendar size={16} color="var(--accent-cyan)" />
              <span>{upcoming[0].date}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <Clock size={16} color="var(--accent-cyan)" />
              <span>{upcoming[0].time}</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
              <MapPin size={16} color="var(--accent-cyan)" />
              <span>{upcoming[0].location}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Purpose: {upcoming[0].purpose}
          </p>

          <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ flex: 1, minWidth: '140px' }}>
              <Bell size={16} /> Reminder
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, minWidth: '140px' }}>
              <Calendar size={16} /> Calendar
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, minWidth: '140px' }}>
              <Phone size={16} /> Caregiver
            </button>
          </div>
        </div>
      )}

      {/* Other Upcoming */}
      {upcoming.length > 1 && (
        <div className="gsap-card">
          <h3 className="mb-2">Upcoming</h3>
          {upcoming.slice(1).map((apt, i) => (
            <div key={apt.id} className="glass-card mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: 'rgba(34,211,238,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={18} color="var(--accent-cyan)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{apt.doctor}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {apt.date} · {apt.time}
                    </div>
                  </div>
                </div>
                <span className="badge badge-info">{apt.specialty}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Appointments */}
      {past.length > 0 && (
        <div className="gsap-card">
          <h3 className="mb-2 mt-3" style={{ color: 'var(--text-muted)' }}>Past</h3>
          {past.map((apt) => (
            <div key={apt.id} className="glass-card mb-2" style={{ opacity: 0.5 }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={18} color="var(--text-muted)" />
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{apt.doctor}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {apt.date} · {apt.purpose}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
