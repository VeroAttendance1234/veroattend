import { useState, useEffect, useRef } from 'react';
import Nav from './components/Nav';
import AdminDashboard   from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard  from './dashboards/ParentDashboard';
import MarkerPage       from './pages/MarkerPage';
import LoginPage        from './pages/LoginPage';
import { students as initialStudents } from './data/sampleData';
import './styles/global.css';

// ============================================================
// HARDWARE INTEGRATION POINT
// Auto-detect: localhost = try Pi (real hardware mode)
//              anywhere else = simulator mode (for deployed demos)
// ============================================================
const IS_LOCAL = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local'));

const PI_CONNECTED = IS_LOCAL;
const PI_URL = 'http://localhost:5000';

let tapCounter = 0;
function now() {
  return new Date().toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function App() {
  const [authedRole, setAuthedRole]   = useState(null);   // null = not logged in
  const [role, setRole]               = useState('Admin');
  const [students, setStudents]       = useState(initialStudents);
  const [taps, setTaps]               = useState([]);
  const [showMarker, setShowMarker]   = useState(false);
  const socketRef = useRef(null);

  function handleTap(student) {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: true } : s));
    setTaps(prev => [{ ...student, id: `tap-${++tapCounter}`, time: now() }, ...prev]);
  }

  useEffect(() => {
    if (!PI_CONNECTED) return;
    import('socket.io-client').then(({ io }) => {
      const socket = io(PI_URL);
      socketRef.current = socket;
      socket.on('card_tap', (studentData) => handleTap(studentData));
    });
    return () => socketRef.current?.disconnect();
  }, []);

  // Update browser tab title
  useEffect(() => {
    document.title = authedRole
      ? `VERO · ${authedRole} Dashboard`
      : 'VERO · Sign in';
  }, [authedRole]);

  // ── Not logged in: show login screen ───────────────
  if (!authedRole) {
    return (
      <LoginPage
        onLogin={(r) => { setAuthedRole(r); setRole(r); }}
      />
    );
  }

  // ── Logged in: dashboards ──────────────────────────
  return (
    <>
      {showMarker && (
        <MarkerPage
          onClose={() => setShowMarker(false)}
          setRole={setRole}
        />
      )}

      <Nav
        role={role}
        setRole={setRole}
        piConnected={PI_CONNECTED}
        onMarker={() => setShowMarker(true)}
        onLogout={() => setAuthedRole(null)}
      />

      {role === 'Admin'   && <AdminDashboard   students={students} setStudents={setStudents} taps={taps} onTap={handleTap} />}
      {role === 'Teacher' && <TeacherDashboard students={students} setStudents={setStudents} taps={taps} onTap={handleTap} />}
      {role === 'Student' && <StudentDashboard students={students} />}
      {role === 'Parent'  && <ParentDashboard  students={students} />}
    </>
  );
}
