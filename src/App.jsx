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
   Vercel build stays in Simulator mode on purpose - it can't reach a
   .local address, and an https page can't talk to an http Pi anyway.

   By default we connect to the page's OWN origin (localhost:3000) and let the
   Vite dev server proxy /socket.io through to the Pi - see vite.config.js.
   That matters: a browser needs OS-level local-network permission to reach the
   Pi directly, and without it the connection fails as ERR_INTERNET_DISCONNECTED
   with nothing useful on screen. Node has no such restriction, so proxying
   makes the page's only network peer localhost.

   Set VITE_PI_URL to bypass the proxy and dial the Pi directly (this needs the
   browser permission above); set VITE_PI_TARGET to change where the proxy
   points. The "VERO system" pill reflects the real handshake + reader status,
   not where the app is hosted.
─────────────────────────────────────────────── */
/*  Whether attempting a Pi connection is worth anything from THIS origin.
    Testing the protocol rather than allowlisting hostnames is the whole
    point: a phone on the same Wi-Fi arrives on the laptop's LAN address
    (192.168.x.x, or whatever the router handed out that morning), which no
    hostname list could have predicted, and the old localhost-only check
    silently dropped it into Simulator mode with no real taps ever.

    Every http origin is either localhost or a LAN address serving this dev
    build, and both reach the Pi through the dev server's bridge. The
    deployed build is https, where the browser blocks a request to an http
    Pi as mixed content before it leaves the page, so there is genuinely
    nothing to attempt there and skipping it saves a pointless retry loop. */
/*  Declared BEFORE CAN_REACH_PI, which reads it. Order matters: this module
    already shipped one temporal-dead-zone crash (blank white page in
    production) from a const referenced above its declaration.
    '' = same origin, which the dev-server proxy forwards to the Pi.       */
const PI_URL = import.meta.env.VITE_PI_URL ?? '';

/*  ...and one exception to the http-only rule: an https origin CAN reach the
    Pi when VITE_PI_URL is itself https, i.e. the Pi sits behind a TLS tunnel
    (Cloudflare) rather than being dialled at its LAN address. There is no
    mixed content in that case, so the deployed build on Vercel is worth
    connecting after all. Without such a URL an https page still has nothing
    to attempt and should not burn a retry loop discovering that.          */
const CAN_REACH_PI = typeof window !== 'undefined'
  && (window.location.protocol === 'http:' || PI_URL.startsWith('https://'));
// Plain HTTP calls take the '/pi' proxy prefix, which the dev server rewrites
// away before handing the request to the bridge. When VITE_PI_URL is set the
// browser is dialling the Pi directly and no prefix applies.
const PI_HTTP = PI_URL || '/pi';

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

/* The live feed is a rolling window, not a ledger. Left running, the auto
   simulator adds a tap every 12-22s (~4,500/day), and every entry here becomes
   a rendered row carrying a cloned student object. Uncapped, a week-long run
   accumulates tens of thousands of them and each new tap re-renders the lot,
   so the cost of a tap grows with every tap already taken. The permanent
   record lives in SQLite on the Pi; this is just what's on screen. */
const MAX_TAPS = 200;

/* Local calendar day. Deliberately not toISOString(), which is UTC and would
   roll the day over at 10am AEST instead of midnight. */
function localDayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatTime(d) {
  return d.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function now() {
  return formatTime(new Date());
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
     reachable (piConnected) does NOT mean the reader works - so the
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

  /* Daily rollover.
     A demo left running for weeks crosses midnight, and nothing here used to
     notice. `present` is only ever set true (on a tap) and never cleared, so
     the whole roll read present within a fortnight, and the live feed kept
     every scan since launch under a heading that said "today". The Pi already
     scopes its own query to a single date - see get_today_attendance() in
     backend/database.py - so this is the client catching up to what the
     database already believes.

     Polled once a minute rather than a timer armed for midnight: a laptop
     that sleeps through midnight never fires that timer, and a kiosk that
     does stay awake gets the same result either way. */
  useEffect(() => {
    let day = localDayKey();
    const id = setInterval(() => {
      const today = localDayKey();
      if (today === day) return;
      day = today;
      setTaps([]);
      setStudents(prev => prev.map(s => ({ ...s, present: false, status: 'absent' })));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  /* Auto-simulated tap activity - fires every 12–22s while signed in so the
     live feed and dashboards never look frozen. Draws from the WHOLE school
     (never Grace) and mixes on-time check-ins, late arrivals and students
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
  // IDs submitted this session (parent → shows "NEW" badge on admin side)
  const [newAbsenceIds, setNewAbsenceIds]         = useState(new Set());
  // IDs resolved this session (admin → shows alert banner on parent side)
  const [resolvedAbsenceIds, setResolvedAbsenceIds] = useState(new Set());

  const socketRef = useRef(null);

  /* Card tap pipeline.
     One tap can be a check-IN (on time / late) or a check-OUT (stepping out
     of class). `opts` lets the simulator state intent explicitly; a real
     hardware tap (no opts) toggles based on where the student currently is -
     tap once to come in, tap again to step out. A check-out keeps `present`
     true (they still attended today) but flips status to 'out'. */
  function handleTap(student, opts = {}) {
    const current = studentsRef.current.find(s => s.id === student.id);
    let action = opts.action;
    if (!action) action = (current && current.present && current.status !== 'out') ? 'out' : 'in';
    const status = action === 'out' ? 'out' : (opts.status || 'on-time');

    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, present: true, status } : s));
    setTaps(prev => [{ ...student, id: `tap-${++tapCounter}`, action, status, ts: Date.now(), time: now() }, ...prev].slice(0, MAX_TAPS));

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
     caught live by the Integrity Alerts detector - proving the limitation is
     handled rather than ignored. Never uses Grace's card. */
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
    setNewAbsenceIds(prev => new Set([...prev, req.id]));
    toast.success('Absence request submitted', 'Admin will review shortly.');
  }
  function approveAbsenceRequest(id) {
    const r = absenceRequests.find(x => x.id === id);
    setAbsenceRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'approved' } : x));
    setResolvedAbsenceIds(prev => new Set([...prev, id]));
    if (r) toast.success('Request approved', `${r.student} (${r.class}) · ${r.fromDate}`);
  }
  function rejectAbsenceRequest(id) {
    const r = absenceRequests.find(x => x.id === id);
    setAbsenceRequests(prev => prev.map(x => x.id === id ? { ...x, status: 'rejected' } : x));
    setResolvedAbsenceIds(prev => new Set([...prev, id]));
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
    if (!CAN_REACH_PI) return;

    let cancelled = false;
    import('socket.io-client').then(({ io }) => {
      if (cancelled) return;
      const socket = io(PI_URL || undefined, {
        reconnectionDelay: 2000,
        reconnectionAttempts: Infinity,
        timeout: 4000,
      });
      socketRef.current = socket;

      /*  Replay the day on connect.
          The socket only ever carries taps from this moment forward, so a
          device that joins late - the phone picked up at 11am - started from
          the seeded roster with an empty feed and disagreed with the laptop
          about the entire morning, permanently. This pulls what actually
          happened today from the Pi, which is the same source the laptop has
          been building its feed from, so the two screens land on one story.  */
      async function syncToday() {
        try {
          const res = await fetch(`${PI_HTTP}/attendance`, { cache: 'no-store' });
          if (!res.ok) return;
          const rows = await res.json();
          if (!Array.isArray(rows) || rows.length === 0) return;

          setTaps(rows.slice(0, MAX_TAPS).map(r => {
            // SQLite CURRENT_TIMESTAMP is UTC in 'YYYY-MM-DD HH:MM:SS'. That
            // space is not ISO 8601 and some browsers refuse to parse it, so
            // normalise before letting Date near it.
            const when = new Date(`${String(r.timestamp).replace(' ', 'T')}Z`);
            const valid = !Number.isNaN(when.getTime());
            return {
              ...r,
              // Keyed off the database row id, so reconnecting and syncing
              // again cannot duplicate rows that are already on screen.
              id: `tap-db-${r.id}`,
              status: r.action === 'out' ? 'out' : 'on-time',
              ts:   valid ? when.getTime() : Date.now(),
              time: valid ? formatTime(when) : now(),
            };
          }));

          // Rows arrive newest first, so the first entry seen for a student is
          // their latest tap and decides where they currently are. A check-out
          // still counts as having attended, matching handleTap.
          const latest = new Map();
          for (const r of rows) {
            if (!latest.has(r.student_id)) latest.set(r.student_id, r.action);
          }
          setStudents(prev => prev.map(st => {
            const action = latest.get(st.id);
            if (!action) return st;
            return { ...st, present: true, status: action === 'out' ? 'out' : 'on-time' };
          }));
        } catch {
          // Pi vanished mid-fetch. The socket's own reconnect will call this
          // again, so there is nothing useful to do here.
        }
      }

      socket.on('connect', () => {
        setPiConnected(true);
        syncToday();
        /*  Which transport won matters for how instant a tap feels, and it is
            otherwise invisible. Socket.IO always opens on HTTP long-polling
            and upgrades to a real WebSocket a moment later - but only if the
            Pi can serve one, which needs simple-websocket installed there
            (see backend/requirements.txt). Without it the upgrade never
            happens and every tap pays a fresh request round trip. Logged so
            that is a glance at the console rather than a guess. */
        const logTransport = (label) =>
          console.info(`[vero] socket ${label}: ${socket.io.engine.transport.name}`);
        logTransport('connected on');
        socket.io.engine.once('upgrade', () => logTransport('upgraded to'));
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
      // surface Grace: the simulator deliberately excludes her, but when her
      // physical card (UID 67BDE33D) is tapped on the reader the Pi sends it
      // here and it flows straight onto the live feed like any other student.
      /*  The Pi now says whether the tap was an in or an out, and every
          client gets that same answer in the same broadcast. Deciding it
          locally instead meant a laptop and a phone whose rosters had
          drifted could read one physical tap as opposite actions. Falls
          back to the local toggle if an older Pi sends no action. */
      socket.on('card_tap',  (studentData) => handleTap(
        studentData,
        studentData?.action ? { action: studentData.action } : {},
      ));
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
    onSubmitAbsence:  submitAbsenceRequest,
    onApproveAbsence: approveAbsenceRequest,
    onRejectAbsence:  rejectAbsenceRequest,
    newAbsenceIds,
    resolvedAbsenceIds,
    threads,
    onSendMessage: sendMessage,
  };

  return (
    <>
      {showMarker && (
        <MarkerPage
          onClose={() => { delete document.body.dataset.markerOpen; setShowMarker(false); }}
          setRole={setRole}
          /*  Same array the dashboards render, so a single card_tap event
              updates this page and everything behind it together. Passing
              piConnected as well as systemLive lets the panel say WHICH half
              is down (Pi unreachable vs reader unplugged) instead of just
              showing nothing.                                             */
          taps={taps}
          systemLive={systemLive}
          piConnected={piConnected}
        />
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

      {/* Page transition wrapper - key={role} forces a remount with the
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
