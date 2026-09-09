import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import Layout from './components/Layout';

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

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboarded} />;
  }

  return (
    <Routes>
      <Route element={<Layout patientId={patientId} />}>
        <Route path="/" element={<PatientHome patientId={patientId} />} />
        <Route path="/games" element={<GamesHub patientId={patientId} />} />
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
