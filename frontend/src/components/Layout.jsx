import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Layout({ patientId }) {
  const { t } = useTranslation();

  return (
    <div>
      <Outlet />
      <nav className="bottom-nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <span className="nav-icon">🏠</span>
          <span>{t('home')}</span>
        </NavLink>
        <NavLink to="/games" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🎮</span>
          <span>{t('games')}</span>
        </NavLink>
        <NavLink to="/reminders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⏰</span>
          <span>{t('reminders')}</span>
        </NavLink>
        <NavLink to="/mood" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">😊</span>
          <span>{t('mood_check')}</span>
        </NavLink>
        <NavLink to="/caregiver" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span>{t('dashboard')}</span>
        </NavLink>
      </nav>
    </div>
  );
}
