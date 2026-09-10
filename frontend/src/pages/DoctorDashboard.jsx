import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { getDoctorDashboard } from '../api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await getDoctorDashboard(1);
      setData(res.data);
    } catch {
      setData({
        patients: [
          { id: 1, name: 'Kamala Devi', age: 72, level: 3, total_xp: 450, status: 'stable', accuracy: 72, games: 12 },
          { id: 2, name: 'Rina Bora', age: 68, level: 2, total_xp: 280, status: 'improving', accuracy: 65, games: 8 },
          { id: 3, name: 'Dipak Saikia', age: 75, level: 1, total_xp: 120, status: 'warning', accuracy: 45, games: 4 },
        ],
        total_patients: 3,
        avg_engagement: 8,
        alerts: 1,
      });
    }
  };

  if (!data) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '3rem' }}>🩺</motion.div>
      </div>
    );
  }

  const statusColors = { stable: 'var(--accent-cyan)', improving: 'var(--success)', warning: 'var(--warning)', alert: 'var(--danger)' };
  const statusBadge = { stable: 'badge-info', improving: 'badge-success', warning: 'badge-warning', alert: 'badge-danger' };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <button className="btn btn-ghost mb-2" onClick={() => navigate('/caregiver')}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 className="page-title">🩺 Doctor Dashboard</h1>
        <p className="page-subtitle">Overview of all patients under your care</p>
      </motion.div>

      {/* Summary */}
      <motion.div className="grid-3 mb-3 mt-3" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="stat-card">
          <div className="stat-value">{data.total_patients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{data.avg_engagement}</div>
          <div className="stat-label">Avg Games/Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: data.alerts > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {data.alerts > 0 ? `⚠️ ${data.alerts}` : '✅ 0'}
          </div>
          <div className="stat-label">Alerts</div>
        </div>
      </motion.div>

      {/* Patients */}
      <h2 className="mb-2">Patients</h2>
      {data.patients?.map((patient, i) => (
        <motion.div
          key={patient.id}
          className="glass-card mb-2"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.05 }}
          style={{ cursor: 'pointer' }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3">
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'var(--gradient-neural)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1.1rem',
            }}>
              {patient.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>{patient.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Age {patient.age} · Level {patient.level} · {patient.total_xp} XP
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${statusBadge[patient.status]}`}>{patient.status}</span>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {patient.accuracy}% accuracy · {patient.games} games
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
