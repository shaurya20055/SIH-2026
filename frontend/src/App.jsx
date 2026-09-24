import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

// Patient-side
import PatientHome from './pages/PatientHome';
import GamesHub from './pages/GamesHub';
import FaceRecall from './pages/FaceRecall';
import FlipCard from './pages/FlipCard';
import DailyRoutine from './pages/DailyRoutine';
import SoundMatch from './pages/SoundMatch';
import MoodCheckin from './pages/MoodCheckin';
import RemindersPage from './pages/RemindersPage';
import GameComplete from './pages/GameComplete';
import DailyCare from './pages/DailyCare';
import Medicines from './pages/Medicines';
import Appointments from './pages/Appointments';
import Progress from './pages/Progress';
import Connect from './pages/Connect';
import Layout from './components/Layout';
import Onboarding from './pages/Onboarding';

// Staff portal — Homepage + Login pages
import StaffHomepage from './pages/StaffHomepage';
import AdminLogin from './pages/AdminLogin';
import CaretakerLogin from './pages/CaretakerLogin';
import DoctorLogin from './pages/DoctorLogin';

// Staff Dashboards
import AdminDashboard from './pages/AdminDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function App() {
  const [patientId, setPatientId] = useState(
    localStorage.getItem('mm_patient_id') || null
  );
  const [isOnboarded, setIsOnboarded] = useState(
    localStorage.getItem('mm_onboarded') === 'true'
  );

  const handleOnboarded = (pid) => {
    setPatientId(pid);
    setIsOnboarded(true);
    localStorage.setItem('mm_patient_id', pid);
    localStorage.setItem('mm_onboarded', 'true');
  };

  // Staff portal routes are always accessible
  const staffRoutes = (
    <>
      <Route path="/staff" element={<StaffHomepage />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/caretaker-login" element={<CaretakerLogin />} />
      <Route path="/doctor-login" element={<DoctorLogin />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      <Route path="/caretaker-dashboard" element={<CaretakerDashboard />} />
      <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
      {/* Legacy paths */}
      <Route path="/doctor" element={<DoctorDashboard />} />
    </>
  );

  // Patient not yet onboarded → show onboarding, but staff portal still accessible
  if (!isOnboarded) {
    return (
      <Routes>
        {staffRoutes}
        {/* "/" and everything else goes to staff homepage first, then onboarding */}
        <Route path="/onboard" element={<Onboarding onComplete={handleOnboarded} />} />
        <Route path="/" element={<StaffHomepage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* ── Staff portal routes ── */}
        {staffRoutes}

        {/* ── Patient portal (inside Layout nav) ── */}
        <Route element={<Layout patientId={patientId} />}>
          <Route path="/dashboard" element={<PatientHome patientId={patientId} />} />
          <Route path="/games" element={<GamesHub patientId={patientId} />} />
          <Route path="/daily-care" element={<DailyCare patientId={patientId} />} />
          <Route path="/medicines" element={<Medicines patientId={patientId} />} />
          <Route path="/appointments" element={<Appointments patientId={patientId} />} />
          <Route path="/progress" element={<Progress patientId={patientId} />} />
          <Route path="/connect" element={<Connect patientId={patientId} />} />
          <Route path="/reminders" element={<RemindersPage patientId={patientId} />} />
          <Route path="/mood" element={<MoodCheckin patientId={patientId} />} />
          <Route path="/caregiver" element={<CaretakerDashboard />} />
        </Route>

        {/* ── Game routes (full-screen) ── */}
        <Route path="/game/face-recall" element={<FaceRecall patientId={patientId} />} />
        <Route path="/game/flip-card" element={<FlipCard patientId={patientId} />} />
        <Route path="/game/daily-routine" element={<DailyRoutine patientId={patientId} />} />
        <Route path="/game/sound-match" element={<SoundMatch patientId={patientId} />} />
        <Route path="/game-complete" element={<GameComplete patientId={patientId} />} />

        {/* "/" → staff homepage; /dashboard → patient home */}
        <Route path="/" element={<StaffHomepage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
