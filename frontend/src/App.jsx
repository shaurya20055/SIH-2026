import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';

import HeroLanding from './pages/HeroLanding';
import Onboarding from './pages/Onboarding';
import PatientHome from './pages/PatientHome';
import GamesHub from './pages/GamesHub';
import FaceRecall from './pages/FaceRecall';
import FlipCard from './pages/FlipCard';
import DailyRoutine from './pages/DailyRoutine';
import SoundMatch from './pages/SoundMatch';
import MoodCheckin from './pages/MoodCheckin';
import RemindersPage from './pages/RemindersPage';
import CaregiverDashboard from './pages/CaregiverDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import GameComplete from './pages/GameComplete';
import DailyCare from './pages/DailyCare';
import Medicines from './pages/Medicines';
import Appointments from './pages/Appointments';
import Progress from './pages/Progress';
import Connect from './pages/Connect';
import Layout from './components/Layout';

function App() {
  const [patientId, setPatientId] = useState(
    localStorage.getItem('mm_patient_id') || null
  );
  const [isOnboarded, setIsOnboarded] = useState(
    localStorage.getItem('mm_onboarded') === 'true'
  );
  const [showHero, setShowHero] = useState(!isOnboarded);

  const handleOnboarded = (pid) => {
    setPatientId(pid);
    setIsOnboarded(true);
    setShowHero(false);
    localStorage.setItem('mm_patient_id', pid);
    localStorage.setItem('mm_onboarded', 'true');
  };

  // First-time users see the Hero Landing
  if (showHero && !isOnboarded) {
    return (
      <Routes>
        <Route
          path="*"
          element={
            <HeroLanding
              onStart={() => {
                setShowHero(false);
              }}
            />
          }
        />
      </Routes>
    );
  }

  // After hero, show onboarding if not yet onboarded
  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboarded} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route element={<Layout patientId={patientId} />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PatientHome patientId={patientId} />} />
          <Route path="/games" element={<GamesHub patientId={patientId} />} />
          <Route path="/daily-care" element={<DailyCare patientId={patientId} />} />
          <Route path="/medicines" element={<Medicines patientId={patientId} />} />
          <Route path="/appointments" element={<Appointments patientId={patientId} />} />
          <Route path="/progress" element={<Progress patientId={patientId} />} />
          <Route path="/connect" element={<Connect patientId={patientId} />} />
          <Route path="/reminders" element={<RemindersPage patientId={patientId} />} />
          <Route path="/mood" element={<MoodCheckin patientId={patientId} />} />
        </Route>
        <Route path="/game/face-recall" element={<FaceRecall patientId={patientId} />} />
        <Route path="/game/flip-card" element={<FlipCard patientId={patientId} />} />
        <Route path="/game/daily-routine" element={<DailyRoutine patientId={patientId} />} />
        <Route path="/game/sound-match" element={<SoundMatch patientId={patientId} />} />
        <Route path="/game-complete" element={<GameComplete patientId={patientId} />} />
        <Route path="/caregiver" element={<CaregiverDashboard patientId={patientId} />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
