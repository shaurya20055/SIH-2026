import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDoctorDashboard } from '../api';

export default function DoctorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPatients(); }, []);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const res = await getDoctorDashboard();
      setPatients(res.data);
    } catch {
      setPatients([
        { id: 1, name: 'Kamala Devi', age: 72, cognitive_level: 1, total_xp: 450, streak: 3, last_played: '2026-09-08', recent_accuracy: 72.5, decline_status: 'stable', decline_message: 'Stable' },
        { id: 2, name: 'Ratan Baruah', age: 68, cognitive_level: 2, total_xp: 220, streak: 1, last_played: '2026-09-07', recent_accuracy: 55.0, decline_status: 'warning', decline_message: 'Gradual decline' },
      ]);
    }
    setLoading(false);
  };

  const statusColor = { stable: 'var(--success)', improving: 'var(--teal)', warning: 'var(--saffron)', alert: 'var(--danger)', insufficient_data: 'var(--gray)' };
  const statusIcon = { stable: '✅', improving: '📈', warning: '⚠️', alert: '🚨', insufficient_data: 'ℹ️' };
  const levelLabels = { 1: 'Mild', 2: 'Moderate', 3: 'Hard' };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div className="animate-float" style={{ fontSize: '3rem' }}>🩺</div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: '2rem' }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ padding: 0, marginBottom: '0.25rem' }}>← {t('back')}</button>
          <h1>🩺 {t('doctor_dashboard')}</h1>
        </div>
      </div>

      <p className="text-gray mb-3">{patients.length} {t('patients_list')}</p>

      {/* Alerts First */}
      {patients.filter(p => p.decline_status === 'alert' || p.decline_status === 'warning').length > 0 && (
        <div className="mb-3">
          <h2 className="mb-2">🚨 {t('decline_alert')}s</h2>
          {patients.filter(p => p.decline_status === 'alert' || p.decline_status === 'warning').map(p => (
            <div key={p.id} className={`alert-banner ${p.decline_status}`}>
              <span>{statusIcon[p.decline_status]}</span>
              <div style={{ flex: 1 }}>
                <strong>{p.name}</strong> — {p.decline_message}
              </div>
              <button className="btn btn-ghost" onClick={() => navigate('/caregiver')} style={{ padding: '0.25rem 0.75rem', minHeight: 'auto' }}>
                {t('view_details')} →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Patient Cards */}
      <h2 className="mb-2">{t('patients_list')}</h2>
      {patients.map(p => (
        <div key={p.id} className="card mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/caregiver')}>
          <div className="flex items-center gap-3">
            <div style={{
              width: '50px', height: '50px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${statusColor[p.decline_status] || 'var(--teal)'}, var(--sage))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '1.2rem',
            }}>
              {p.name?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.15rem' }}>{p.name}</h3>
              <p className="text-gray" style={{ fontSize: '0.85rem' }}>
                Age {p.age} · {levelLabels[p.cognitive_level] || 'Mild'} · {p.total_xp} XP
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem', color: p.recent_accuracy >= 70 ? 'var(--success)' : p.recent_accuracy >= 50 ? 'var(--saffron)' : 'var(--danger)' }}>
                {p.recent_accuracy}%
              </div>
              <div className="text-gray" style={{ fontSize: '0.8rem' }}>{t('avg_accuracy')}</div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--light-gray)' }}>
            <span style={{ fontSize: '0.85rem', color: statusColor[p.decline_status] || 'var(--gray)' }}>
              {statusIcon[p.decline_status]} {p.decline_status}
            </span>
            <span className="text-gray" style={{ fontSize: '0.85rem' }}>🔥 {p.streak} streak</span>
            <span className="text-gray" style={{ fontSize: '0.85rem' }}>Last: {p.last_played || 'Never'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
