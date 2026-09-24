import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Gamepad2, Heart, Pill, Calendar, BarChart3, Users, Bell, Globe, User, Brain } from 'lucide-react';
import AIAssistant from './AIAssistant';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/games', icon: Gamepad2, label: 'Brain Games' },
  { to: '/dashboard/daily-care', icon: Heart, label: 'Daily Care' },
  { to: '/dashboard/medicines', icon: Pill, label: 'Medicines' },
  { to: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/dashboard/progress', icon: BarChart3, label: 'Progress' },
  { to: '/dashboard/connect', icon: Users, label: 'Connect' },
];

const MOBILE_NAV = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/dashboard/games', icon: Gamepad2, label: 'Games' },
  { to: '/dashboard/daily-care', icon: Heart, label: 'Care' },
  { to: '/dashboard/medicines', icon: Pill, label: 'Meds' },
  { to: '/dashboard/progress', icon: BarChart3, label: 'Progress' },
];

export default function Layout({ patientId }) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Desktop Top Navigation */}
      <nav className="top-nav">
        <NavLink to="/dashboard" className="nav-brand">
          <Brain size={18} /> MindSathi
        </NavLink>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><item.icon size={16} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="nav-right">
          <button className="nav-link" title="Notifications">
            <Bell size={16} />
          </button>
          <button className="nav-link" title="Language">
            <Globe size={16} />
          </button>
          <button className="nav-link" title="Profile">
            <User size={16} />
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <Outlet />

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        {MOBILE_NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end={item.to === '/dashboard'}
          >
            <span className="nav-icon"><item.icon size={22} /></span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
