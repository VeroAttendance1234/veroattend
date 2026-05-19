import { useState, useEffect, useRef } from 'react';
import Nav from './components/Nav';
import AdminDashboard   from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard  from './dashboards/ParentDashboard';
import MarkerPage       from './pages/MarkerPage';
import LoginPage        from './pages/LoginPage';
import { students as initialStudents } from './data/sampleData';
import { initialAbsenceRequests, initialThreads } from './data/initialState';
import './styles/global.css';

/* ───────────────────────────────────────────────
   Hardware integration:
   We only ATTEMPT to connect to the Pi when running locally.
   The actual `Live` / `Sim` pill reflects whether the
   WebSocket handshake succeeded, not just where the app is hosted.
─────────────────────────────────────────────── */
const IS_LOCAL = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local'));

const PI_URL = 'http://localhost:5000';

let tapCounter = 0;
function now() {
  return new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function timestamp() {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}
function shortTime() {
  return new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
}

export default function App() {
  const [authedRole, setAuthedRole] = useState(null);
  const [role, setRole]             = useState('Admin');
  const [students, setStudents]     = useState(initialStudents);
  const [taps, setTaps]             = useState([]);
  const [showMarker, setShowMarker] = useState(false);

  /* Live Pi connection state — only true when the WebSocket
     handshake has actually succeeded with the Pi. */
  const [piConnected, setPiConnected] = useState(false);

  // ── Shared cross-role state ────────────
  const [absenceRequests, setAbsenceRequests] = useState(initialAbsenceRequests);
  const [threads, setThreads]                 = useState(initialThreads);

  const socketRef = useRef(null);

  /* Card tap pipeline */
  function handleTap(student) {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: true } : s));
    setTaps(prev => [{ ...student, id: `tap-${++tapCounter}`, time: now() }, ...prev]);
  }

  /* Absence request actions */
  function submitAbsenceRequest(req) {
    setAbsenceRequests(prev => [req, ...prev]);
  }
  function approveAbsenceRequest(id) {
    setAbsenceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
  }
  function rejectAbsenceRequest(id) {
    setAbsenceRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
  }

  /* Messaging actions */
  function sendMessage(threadId, text) {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      const newMsg = {
        id: `M-${Date.now()}`,
        from: role.toLowerCase(),
        text,
        time: `Today ${shortTime()}`,
      };
      return { ...t, messages: [...t.messages, newMsg], unread: 0 };
    }));
  }

  /* ───── Pi WebSocket lifecycle ──────────────
     Only attempts a connection when running locally (saves bandwidth
     for the deployed Vercel build). The pill flips green only on
     a real `connect` event from the Pi's Flask-SocketIO server.
  ─────────────────────────────────────────────── */
  useEffect(() => {
    if (!IS_LOCAL) return;

    let cancelled = false;
    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      const socket = io(PI_URL, {
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
        timeout: 4000,
      });
      socketRef.current = socket;

      socket.on('connect',    () => setPiConnected(true));
      socket.on('disconnect', () => setPiConnected(false));
      socket.on('connect_error', () => setPiConnected(false));
      socket.on('card_tap',  (studentData) => handleTap(studentData));
    });

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.title = authedRole
      ? `VERO · ${authedRole} Dashboard`
      : 'VERO · Sign in';
  }, [authedRole]);

  if (!authedRole) {
    return (
      <LoginPage onLogin={(r) => { setAuthedRole(r); setRole(r); }} />
    );
  }

  /* Shared bundle to keep dashboards tidy */
  const sharedProps = {
    absenceRequests,
    onSubmitAbsence: submitAbsenceRequest,
    onApproveAbsence: approveAbsenceRequest,
    onRejectAbsence: rejectAbsenceRequest,
    threads,
    onSendMessage: sendMessage,
  };

  return (
    <>
      {showMarker && (
        <MarkerPage onClose={() => setShowMarker(false)} setRole={setRole} />
      )}

      <Nav
        role={role}
        setRole={setRole}
        piConnected={piConnected}
        onMarker={() => setShowMarker(true)}
        onLogout={() => setAuthedRole(null)}
      />

      {role === 'Admin'   && <AdminDashboard   students={students} setStudents={setStudents} taps={taps} onTap={handleTap} {...sharedProps} />}
      {role === 'Teacher' && <TeacherDashboard students={students} setStudents={setStudents} taps={taps} onTap={handleTap} {...sharedProps} />}
      {role === 'Student' && <StudentDashboard students={students} {...sharedProps} />}
      {role === 'Parent'  && <ParentDashboard  students={students} {...sharedProps} />}
    </>
  );
}
