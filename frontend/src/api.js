import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────
export const login = (username, password) =>
  API.post('/auth/login/', { username, password });

export const register = (data) =>
  API.post('/auth/register/', data);

export const getMe = () => API.get('/auth/me/');

// ─── Patients ────────────────────────────────────────────────────
export const getPatients = (params) => API.get('/patients/', { params });
export const getPatient = (id) => API.get(`/patients/${id}/`);
export const createPatient = (data) => API.post('/patients/', data);
export const updatePatient = (id, data) => API.patch(`/patients/${id}/`, data);

// ─── Memory Bank ─────────────────────────────────────────────────
export const getMemoryItems = (patientId) =>
  API.get('/memory/', { params: { patient_id: patientId } });
export const createMemoryItem = (data) => API.post('/memory/', data);

// ─── Games ───────────────────────────────────────────────────────
export const generateGame = (patientId, gameType) =>
  API.get('/games/generate/', { params: { patient_id: patientId, game_type: gameType } });

export const saveSession = (data) => API.post('/sessions/', data);

export const getSessions = (patientId) =>
  API.get('/sessions/', { params: { patient_id: patientId } });

export const checkDecline = (patientId) =>
  API.get('/games/decline-check/', { params: { patient_id: patientId } });

// ─── Mood ────────────────────────────────────────────────────────
export const logMood = (data) => API.post('/mood/', data);
export const getMoods = (patientId) =>
  API.get('/mood/', { params: { patient_id: patientId } });

// ─── Reminders ───────────────────────────────────────────────────
export const getReminders = (patientId) =>
  API.get('/reminders/', { params: { patient_id: patientId } });
export const getTodayReminders = (patientId) =>
  API.get('/reminders/today/', { params: { patient_id: patientId } });
export const createReminder = (data) => API.post('/reminders/', data);
export const markReminderDone = (id) => API.patch(`/reminders/${id}/done/`);

// ─── Dashboard ───────────────────────────────────────────────────
export const getPatientDashboard = (patientId) =>
  API.get(`/dashboard/patient/${patientId}/`);
export const getDoctorDashboard = (doctorId) =>
  API.get('/dashboard/doctor/', { params: { doctor_id: doctorId } });

// ─── Greetings ───────────────────────────────────────────────────
export const sendGreeting = (data) => API.post('/greetings/', data);
export const getGreetings = (receiverId) =>
  API.get('/greetings/', { params: { receiver_id: receiverId } });

// ─── Prescriptions ──────────────────────────────────────────────
export const getPrescriptions = (patientId) =>
  API.get('/prescriptions/', { params: { patient_id: patientId } });
export const createPrescription = (data) => API.post('/prescriptions/', data);

export default API;
