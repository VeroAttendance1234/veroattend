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
import { students as initialStudents, pickSimulatedTap, DEMO_STUDENT_ID } from './data/sampleData';
import { initialAbsenceRequests, initialThreads } from './data/initialState';
import './styles/global.css';

/* ───────────────────────────────────────────────
   Hardware integration:
   We only ATTEMPT to connect to the Pi when running locally. The deployed
   Vercel build stays in Simulator mode on purpose — it can't reach a
   .local address, and an https page can't talk to an http Pi anyway.

   PI_URL points at the Raspberry Pi's Flask-SocketIO server. Override it
   WITHOUT editing code by creating a `.env` file with a VITE_PI_URL line:
       VITE_PI_URL=http://veroattendance.local:5000   ← Pi on the network (default)
       VITE_PI_URL=http://localhost:5000              ← backend running on this Mac
   Restart `npm run dev` after changing .env. The "VERO system" pill
   reflects the real handshake + reader status, not where the app is hosted.
─────────────────────────────────────────────── */
const IS_LOCAL = typeof window !== 'undefined'
  && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local'));

const PI_URL = import.meta.env.VITE_PI_URL || 'http://veroattendance.local:5000';

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

  /* Whether the ACR122U reader itself is actually present, as reported
     by the Pi over the `reader_status` event. The Flask server being
     reachable (piConnected) does NOT mean the reader works — so the
     "VERO system" pill only goes green when BOTH are true. */
  const [readerConnected, setReaderConnected] = useState(false);

  /* The only state that should ever show as "live": the Pi is reachable
     AND its ACR122U reader is confirmed present. */
  const systemLive = piConnected && readerConnected;

  /* ⌘K / Ctrl-K opens the command palette */
  useCommandPaletteHotkey(cmdkOpen, setCmdkOpen);

  /* Live mirror of the roster so handleTap (called from timers and the Pi
     socket) can read CURRENT student state without going stale in a closure. */
  const studentsRef = useRef(initialStudents);
  useEffect(() => { studentsRef.current = students; }, [students]);

  /* Auto-simulated tap activity — fires every 12–22s while signed in so the
     live feed and dashboards never look frozen. Draws from the WHOLE school
     (never Toby) and mixes on-time check-ins, late arrivals and students
     stepping out, so it never looks like a fixed handful of people looping.
     Pauses while the marker page is open so it doesn't fight the welcome demo. */
  useEffect(() => {
    if (!authedRole || systemLive) return; // real reader takes over only when actually live
    let cancelled = false;
    function scheduleNext() {
      const delay = 12_000 + Math.random() * 10_000;
      const t = setTimeout(() => {
        if (cancelled) return;
        if (document.visibilityState === 'visible' && !document.body.dataset.markerOpen) {
          const sim = pickSimulatedTap(studentsRef.current);
          if (sim) handleTap(sim.student, { action: sim.action, status: sim.status });
        }
        scheduleNext();
      }, delay);
      return () => clearTimeout(t);
    }
    const cleanup = scheduleNext();
    return () => { cancelled = true; cleanup?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authedRole, systemLive]);

  // ── Shared cross-role state ────────────
  const [absenceRequests, setAbsenceRequests] = useState(initialAbsenceRequests);
  const [threads, setThreads]                 = useState(initialThreads);

  const socketRef = useRef(null);

  /* Card tap pipeline.
     One tap can be a check-IN (on time / late) or a check-OUT (stepping out
     of class). `opts` lets the simulator state intent explicitly; a real
     hardware tap (no opts) toggles based on where the student currently is —
     tap once to come in, tap again to step out. A check-out keeps `present`
     true (they still attended today) but flips status to 'out'. */
  function handleTap(student, opts = {}) {
    const current = studentsRef.current.find(s => s.id === student.id);
    let action = opts.action;
    if (!action) action = (current && current.present && current.status !== 'out') ? 'out' : 'in';
    const status = action === 'out' ? 'out' : (opts.status || 'on-time');

    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: true, status } : s));
    setTaps(prev => [{ ...student, id: `tap-${++tapCounter}`, action, status, ts: Date.now(), time: now() }, ...prev]);

    if (action === 'out') {
      toast.success(`${student.name} stepped out`, `Year ${student.year} · ${student.class} · out of class`);
    } else if (status === 'late') {
      toast.warn(`${student.name} checked in late`, `Year ${student.year} · ${student.class}`);
    } else {
      toast.success(`${student.name} checked in`, `Year ${student.year} · ${student.class}`);
    }
  }

  /* Anti-cheat demo trigger: simulate one person tapping a STACK of borrowed
     cards in quick succession (classic buddy-punching). The rapid burst is
     caught live by the Integrity Alerts detector — proving the limitation is
     handled rather than ignored. Never uses Toby's card. */
  function simulateCheatAttempt() {
    const pool = studentsRef.current.filter(s => s.id !== DEMO_STUDENT_ID && !s.present);
    if (pool.length < 3) return;
    const picks = [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
    picks.forEach((s, i) => setTimeout(() => {
      if (document.body.dataset.markerOpen) return;
      handleTap(s, { action: 'in', status: 'on-time' });
    }, i * 220));
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
        // Honest: reaching the Pi does NOT mean the reader works. We wait
        // for `reader_status` before claiming the ACR122U is live.
        toast.success('Pi reachable', 'Checking for ACR122U reader…');
      });
      socket.on('disconnect', () => {
        setPiConnected(false);
        setReaderConnected(false); // can't trust the reader once the Pi is gone
        toast.warn('Pi disconnected', 'Reconnecting…');
      });
      socket.on('connect_error', () => {
        setPiConnected(false);
        setReaderConnected(false);
      });
      // The Pi tells us whether the ACR122U is actually plugged in & working.
      socket.on('reader_status', (s) => {
        const connected = !!s?.connected;
        setReaderConnected(prev => {
          if (connected && !prev) toast.success('ACR122U reader live', 'Card taps will appear in real time.');
          if (!connected && prev) toast.warn('Reader offline', 'Pi is online but no ACR122U detected.');
          return connected;
        });
      });
      // A REAL hardware tap from the ACR122U. This is the ONLY path that can
      // surface Toby: the simulator deliberately excludes him, but when his
      // physical card (UID 67BDE33D) is tapped on the reader the Pi sends it
      // here and it flows straight onto the live feed like any other student.
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
          const sim = pickSimulatedTap(studentsRef.current);
          if (sim) handleTap(sim.student, { action: sim.action, status: sim.status });
        }}
      />
      {showReports && (
        <ReportsPage onClose={() => setShowReports(false)} students={students} />
      )}

      <Nav
        role={role}
        setRole={setRole}
        piConnected={piConnected}
        readerConnected={readerConnected}
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
        {role === 'Admin'   && <AdminDashboard   students={students} setStudents={setStudents} taps={taps} onTap={handleTap} onSimulateCheat={simulateCheatAttempt} {...sharedProps} />}
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
