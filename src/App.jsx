import { useState, useEffect, useRef } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import Nav from './components/Nav';
import AdminDashboard   from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import ParentDashboard  from './dashboards/ParentDashboard';
import MarkerPage       from './pages/MarkerPage';
import LoginPage        from './pages/LoginPage';
import ReportsPage      from './pages/ReportsPage';
import OnboardingTour   from './components/OnboardingTour';
import CommandPalette, { useCommandPaletteHotkey } from './components/CommandPalette';
import MilestoneConfetti from './components/MilestoneConfetti';
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

/* ── Admin onboarding tour ────────────────── */
const ADMIN_TOUR_STEPS = [
  {
    target: null,
    title:  'Welcome to VERO',
    body:   'A real-time school attendance platform. This quick tour will show you what you can do as an Administrator · about 30 seconds.',
  },
  {
    target: 'leader-strip',
    title:  'Current Leaders',
    body:   'See who\'s leading at-a-glance · top student, top class, top year, and biggest weekly gain. Updates live.',
  },
  {
    target: 'hero-status',
    title:  'Live school attendance',
    body:   'The pulsing dot is real-time. This number reflects every card tap on the Pi reader as it happens.',
  },
  {
    target: 'stats-row',
    title:  'Key numbers',
    body:   'Six KPIs broken down by category. Each card shows a watermark icon and trend.',
  },
  {
    target: 'attendance-heatmap',
    title:  'Attendance calendar',
    body:   'Hover any day to see the exact rate. Colours grade from red (low) → green (high). Navigate months with the arrows.',
  },
  {
    target: 'absence-requests',
    title:  'Absence requests',
    body:   'Parents submit requests with reasons. You can approve or decline in one click · they\'ll be notified automatically.',
  },
  {
    target: 'live-feed',
    title:  'Live scan feed',
    body:   'Every NFC card tap on the Raspberry Pi shows up here instantly via WebSocket. Click "Simulate tap" to demo it.',
  },
  {
    target: 'student-roll',
    title:  'Searchable student roll',
    body:   'All 1,050 students. Click any student row to open a detailed profile with attendance history.',
  },
  {
    target: null,
    title:  'You\'re all set 🎉',
    body:   'Explore the other roles (Teacher, Student, Parent) using the switcher at the top right. The Marker button opens the hardware demo and project documentation.',
  },
];

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
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const toast = useToast();
  const [authedRole, setAuthedRole] = useState(null);
  const [role, setRole]             = useState('Admin');
  const [students, setStudents]     = useState(initialStudents);
  const [taps, setTaps]             = useState([]);
  const [showMarker, setShowMarker]   = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [forceTour, setForceTour]     = useState(false);
  const [cmdkOpen, setCmdkOpen]       = useState(false);

  /* Live Pi connection state · only true when the WebSocket
     handshake has actually succeeded with the Pi. Declared early so
     the auto-tap simulator below can reference it without a TDZ error. */
  const [piConnected, setPiConnected] = useState(false);

  /* ⌘K / Ctrl-K opens the command palette */
  useCommandPaletteHotkey(cmdkOpen, setCmdkOpen);

  /* Auto-simulated tap activity — fires every 12–22s while signed in
     so the live feed and dashboards never look frozen. Pauses while
     the marker page is open so it doesn't fight the welcome demo. */
  useEffect(() => {
    if (!authedRole || piConnected) return; // real Pi takes over when live
    let cancelled = false;
    function scheduleNext() {
      const delay = 12_000 + Math.random() * 10_000;
      const t = setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === 'visible' && !document.body.dataset.markerOpen) {
          const pool = (initialStudents || []).filter((s, i) => i < 200);
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick) handleTap(pick);
        }
        scheduleNext();
      }, delay);
      return () => clearTimeout(t);
    }
    const cleanup = scheduleNext();
    return () => { cancelled = true; cleanup?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authedRole, piConnected]);

  // ── Shared cross-role state ────────────
  const [absenceRequests, setAbsenceRequests] = useState(initialAbsenceRequests);
  const [threads, setThreads]                 = useState(initialThreads);

  const socketRef = useRef(null);

  /* Card tap pipeline */
  function handleTap(student) {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: true } : s));
    setTaps(prev => [{ ...student, id: `tap-${++tapCounter}`, time: now() }, ...prev]);
    toast.success(`${student.name} checked in`, `Year ${student.year} · ${student.class}`);
  }

  /* Absence request actions */
  function submitAbsenceRequest(req) {
    setAbsenceRequests(prev => [req, ...prev]);
    toast.success('Absence request submitted', 'Admin will review shortly.');
  }
  function approveAbsenceRequest(id) {
    const r = absenceRequests.find(x => x.id === id);
    setAbsenceRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'approved' } : x));
    if (r) toast.success('Request approved', `${r.student} (${r.class}) · ${r.fromDate}`);
  }
  function rejectAbsenceRequest(id) {
    const r = absenceRequests.find(x => x.id === id);
    setAbsenceRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected' } : x));
    if (r) toast.warn('Request declined', `${r.student} (${r.class}) · parent will be notified`);
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
    toast.success('Message sent');
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

      socket.on('connect', () => {
        setPiConnected(true);
        toast.success('Raspberry Pi connected', 'ACR122U reader is live.');
      });
      socket.on('disconnect', () => {
        setPiConnected(false);
        toast.warn('Pi disconnected', 'Reconnecting...');
      });
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
      <LoginPage onLogin={(r) => {
        setAuthedRole(r); setRole(r);
        toast.success(`Welcome to VERO`, `Signed in as ${r}`);
      }} />
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
        <MarkerPage onClose={() => { delete document.body.dataset.markerOpen; setShowMarker(false); }} setRole={setRole} />
      )}

      {/* Global command palette (⌘K) */}
      <CommandPalette
        open={cmdkOpen}
        onClose={() => setCmdkOpen(false)}
        students={students}
        role={role}
        setRole={setRole}
        onMarker={() => { document.body.dataset.markerOpen = '1'; setShowMarker(true); }}
        onReports={() => setShowReports(true)}
        onLogout={() => setAuthedRole(null)}
        onSimulateTap={() => {
          const pool = students.filter(s => !s.present);
          const pick = (pool.length ? pool : students)[
            Math.floor(Math.random() * (pool.length || students.length))
          ];
          if (pick) handleTap(pick);
        }}
      />
      {showReports && (
        <ReportsPage onClose={() => setShowReports(false)} students={students} />
      )}

      <Nav
        role={role}
        setRole={setRole}
        piConnected={piConnected}
        onMarker={() => { document.body.dataset.markerOpen = '1'; setShowMarker(true); }}
        onReports={() => setShowReports(true)}
        onLogout={() => setAuthedRole(null)}
        onCommandPalette={() => setCmdkOpen(true)}
      />

      {/* First-visit guided tour · only shows for Admin role */}
      {role === 'Admin' && (
        <OnboardingTour
          storageKey="vero.tour.admin.v1"
          steps={ADMIN_TOUR_STEPS}
          forceOpen={forceTour}
          onClose={() => setForceTour(false)}
        />
      )}

      {/* Page transition wrapper — key={role} forces a remount with the
          roleSlideIn animation when the user switches dashboards. */}
      <div key={role} style={{ animation: 'roleSlideIn 0.42s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
        {role === 'Admin'   && <AdminDashboard   students={students} setStudents={setStudents} taps={taps} onTap={handleTap} {...sharedProps} />}
        {role === 'Teacher' && <TeacherDashboard students={students} setStudents={setStudents} taps={taps} onTap={handleTap} {...sharedProps} />}
        {role === 'Student' && <StudentDashboard students={students} {...sharedProps} />}
        {role === 'Parent'  && <ParentDashboard  students={students} {...sharedProps} />}
      </div>

      {/* Confetti when the school crosses 95% attendance (once per session per role) */}
      <MilestoneConfetti
        attendanceRate={
          students.length ? Math.round((students.filter(s => s.present).length / students.length) * 100) : 0
        }
        threshold={95}
        storageKey={`vero.milestone.95.${role}`}
        message="🎯 School hit 95 % attendance!"
        subtitle="Best day this term · keep it up"
      />
    </>
  );
}
