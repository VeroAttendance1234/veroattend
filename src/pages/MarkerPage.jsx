import { useState, useEffect } from 'react';
import {
  X, ArrowRight, ArrowDown, Play, ExternalLink, Copy, CheckCircle,
  Monitor, BookOpen, Heart, Users, CreditCard, Wifi, Cpu, Database,
  Code, Zap, Calendar, Sparkles, Award, TrendingUp, Shield,
  MessageSquare, ClipboardList, Activity, GitBranch, Globe,
} from 'lucide-react';
import Modal from '../components/Modal';
import Tagline from '../components/Tagline';
import Reveal from '../components/Reveal';
import CountUp from '../components/CountUp';
import CardTapDemo from '../components/CardTapDemo';

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    role: 'Admin', label: 'Administrator', colour: '#14B8B8', icon: Monitor,
    description: 'Full school overview · 1,050 students, live analytics, system control.',
    features: [
      { t: 'Live attendance hero',  d: 'Pulsing real-time rate of every active scan across the school' },
      { t: 'Six-up stat grid',      d: 'Total students, present, absent, late, staff, classes · all animated count-ups' },
      { t: 'Trend analytics',       d: 'Recharts area chart of monthly attendance over 5 years with timeframe toggles' },
      { t: 'Year-group breakdown',  d: 'Bar chart comparing Year 7-12 attendance rates side-by-side' },
      { t: 'Calendar heatmap',      d: 'Month-grid heatmap with daily rate, today indicator, hover/tap details' },
      { t: 'Absence inbox',         d: 'Pending requests with one-click approve/reject + expandable parent reasons' },
      { t: 'Class leaderboard',     d: 'Top 12 classes with medals + animated progress bars' },
      { t: 'Student leaderboard',   d: 'Top students by attendance % with streak tracking' },
      { t: 'System status',         d: 'Live device monitoring · Pi, ACR122U, WebSocket, Database' },
      { t: 'Searchable roll',       d: '1,050 students paginated 30/page with year, class, name filters' },
      { t: 'Notifications feed',    d: '9 colour-coded notification types · absence, alert, message, system, milestone' },
    ],
  },
  {
    role: 'Teacher', label: 'Mr David Chen', colour: '#2563EB', icon: BookOpen,
    description: 'Maths teacher with 6 classes · class management & live attendance.',
    features: [
      { t: 'Teacher switcher',      d: 'Search through 30 staff members by name or subject' },
      { t: 'Class selector',        d: '6 class buttons with per-class present/total counts at a glance' },
      { t: 'Live feed by class',    d: 'Filters the school-wide scan stream to just the selected class' },
      { t: 'Class roll',            d: 'Clickable students with DiceBear avatars and live status' },
      { t: 'Weekly timetable',      d: 'Full week timetable highlighting today and the current period' },
      { t: 'Parent messages',       d: 'Threaded chat with parents of students in their classes' },
    ],
  },
  {
    role: 'Student', label: 'Aisha Patel', colour: '#16A34A', icon: Heart,
    description: 'Year 11A student · wellbeing, goals, journal, timetable.',
    features: [
      { t: 'Welcome banner',        d: 'Personalised greeting with today\'s status and current mood' },
      { t: 'Live timetable',        d: 'Today\'s periods with NOW indicator on the current lesson' },
      { t: 'Wellbeing check-in',    d: '5-emoji mood scale with optional note · feeds into the journal' },
      { t: 'Searchable journal',    d: 'Full mood journal history with search and emoji-tagged entries' },
      { t: 'Goal tracker',          d: 'Filterable goals by category with priority + due dates' },
      { t: 'Family messaging',      d: 'Chat threads with parents and teachers' },
    ],
  },
  {
    role: 'Parent', label: 'J. Patel', colour: '#7C3AED', icon: Users,
    description: 'Parent of Aisha · attendance, wellbeing, absence requests.',
    features: [
      { t: 'Child status card',     d: 'Border colour shows whether child is present today' },
      { t: 'Week attendance',       d: 'Mon-Fri breakdown with progress bar and weekly rate' },
      { t: 'Mood summary',          d: 'Visual mood chart with auto-generated sentiment label' },
      { t: 'Read-only journal',     d: 'Child\'s 3 most recent journal entries' },
      { t: 'Absence requests',      d: 'Full submission form with type chips, dates, reason, medical cert toggle' },
      { t: 'Messaging',             d: 'Threaded chat with teachers, school admin, and child' },
    ],
  },
];

const TECH_GROUPS = [
  {
    title: 'Frontend',
    colour: '#14B8B8',
    items: [
      { name: 'React 19',         note: 'Latest React with concurrent features' },
      { name: 'Vite 8',           note: 'Sub-second HMR build tooling' },
      { name: 'Recharts',         note: 'Responsive data visualisation' },
      { name: 'Lucide Icons',     note: '1000+ stroke-based icons' },
      { name: 'Socket.io Client', note: 'Real-time WebSocket' },
    ],
  },
  {
    title: 'Backend',
    colour: '#2563EB',
    items: [
      { name: 'Python 3.11',      note: 'Pi-native runtime' },
      { name: 'Flask',            note: 'Lightweight WSGI framework' },
      { name: 'Flask-SocketIO',   note: 'Real-time bidirectional events' },
      { name: 'pyscard',          note: 'PC/SC bindings for NFC' },
      { name: 'SQLite',           note: 'Embedded relational store' },
    ],
  },
  {
    title: 'Hardware',
    colour: '#7C3AED',
    items: [
      { name: 'Raspberry Pi 3B',     note: 'Quad-core ARM Cortex-A53' },
      { name: 'ACR122U NFC Reader',  note: 'USB-powered, ISO 14443A/B' },
      { name: 'PC/SC Daemon',        note: 'Linux smart-card middleware' },
      { name: 'MIFARE Classic',      note: '13.56 MHz NFC student cards' },
    ],
  },
];

const TIMELINE = [
  { date: 'Oct 2025', title: 'Research & Discovery',     detail: 'Surveyed Schoolbox, Sentral, Canvas. Interviewed teachers about roll-marking pain points. Researched NFC hardware.' },
  { date: 'Nov 2025', title: 'Feasibility & Hardware R&D', detail: 'Compared RFID readers, evaluated Pi vs Arduino, tested NFC compatibility. First card-tap prototype with Python.' },
  { date: 'Dec 2025', title: 'Requirements & Scope',     detail: 'Locked in 4-role architecture. Drafted data model, user stories, non-functional requirements for HSC project brief.' },
  { date: 'Jan 2026', title: 'Design + Brand System',    detail: 'Wireframes, VERO logo, teal palette, design tokens. Built the visual system that drives every screen.' },
  { date: 'Feb 2026', title: 'Frontend Foundation',      detail: 'React + Vite scaffold, component library. 1,050 seeded students across 42 classes.' },
  { date: 'Mar 2026', title: 'Dashboards Built',         detail: 'Four role-based dashboards. Recharts analytics, live feed, search, filters, pagination, leaderboards.' },
  { date: 'Apr 2026', title: 'Backend + Pi Integration', detail: 'Flask + Flask-SocketIO, SQLite schema, pyscard on Pi 3B. ACR122U verified end-to-end.' },
  { date: 'May 2026', title: 'Polish + Deploy',          detail: 'Mobile-responsive, accessibility, absence requests, messaging, deployment to Vercel.' },
];

const PROBLEMS = [
  { icon: '⏱️', title: 'Manual roll wastes time', detail: 'Teachers spend 5-8 minutes per period marking rolls. That\'s ~30 minutes/day of lost teaching.' },
  { icon: '❌', title: 'Errors and friction',     detail: 'Paper or basic forms get lost, parents are confused, admins chase up missing data.' },
  { icon: '🔍', title: 'No real-time visibility', detail: 'Schools don\'t know who\'s on campus until rolls are entered hours later.' },
  { icon: '💬', title: 'Disconnected workflows',  detail: 'Absence requests, messaging, and attendance live in 3+ different systems.' },
];

const SOLUTIONS = [
  { icon: <Zap size={18} />,           title: 'Sub-second card tap',  detail: 'Students tap an NFC card on the reader. Their dashboard updates in real-time everywhere.' },
  { icon: <Shield size={18} />,        title: 'One source of truth',  detail: 'Attendance, absences, messaging · all in one app, all in sync.' },
  { icon: <Activity size={18} />,      title: 'Live analytics',       detail: 'Admins see school-wide attendance rates updating live. Spot drops the moment they happen.' },
  { icon: <MessageSquare size={18} />, title: 'Frictionless workflow', detail: 'Parents submit absences from their phone. Admins approve with one click. Everyone is notified.' },
];

/* ─────────────────────────────────────────────
   FEATURE MODAL
───────────────────────────────────────────── */
function FeatureModal({ account, onClose, onOpen }) {
  if (!account) return null;
  const Icon = account.icon;
  return (
    <Modal
      open={!!account}
      onClose={onClose}
      width="lg"
      accent={account.colour}
      icon={<Icon size={20} strokeWidth={2.2} />}
      title={`${account.role} Dashboard`}
      subtitle={account.label}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{account.features.length} features built</span>
          <button
            onClick={onOpen}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 11,
              background: `linear-gradient(135deg, ${account.colour} 0%, ${account.colour}dd 100%)`,
              color: '#fff', fontSize: '0.88rem', fontWeight: 800,
              boxShadow: `0 6px 20px ${account.colour}55`,
            }}
          >
            <Play size={13} strokeWidth={3} />
            Open {account.role} dashboard
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      }
    >
      <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
        {account.description}
      </p>
      <div className="label-caps" style={{ marginBottom: 12 }}>Every feature built</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 9 }}>
        {account.features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10,
            padding: '11px 13px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
            borderRadius: 11,
          }}>
            <CheckCircle size={14} style={{ color: account.colour, flexShrink: 0, marginTop: 3 }} strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {f.t}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.d}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function MarkerPage({ onClose, setRole }) {
  const [openModal, setOpenModal] = useState(null);
  const [copied, setCopied] = useState(false);

  function copyURL() {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openRole(role) {
    setOpenModal(null);
    setRole(role);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'var(--surface)',
      overflowY: 'auto',
      animation: 'fadeIn 0.22s ease',
    }}>
      {/* Close FAB */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          width: 42, height: 42, borderRadius: '50%',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.14s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <X size={18} />
      </button>

      {openModal && (
        <FeatureModal
          account={openModal}
          onClose={() => setOpenModal(null)}
          onOpen={() => openRole(openModal.role)}
        />
      )}

      {/* ═══════════════════════════════════════
          §1 HERO · full-bleed, massive
      ═══════════════════════════════════════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '40px 24px 60px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(20,184,184,0.18) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)',
          pointerEvents: 'none', filter: 'blur(40px)',
        }} />

        <div style={{
          maxWidth: 1320, margin: '0 auto', width: '100%', position: 'relative',
          display: 'grid', gridTemplateColumns: '0.85fr 1.15fr', gap: 32, alignItems: 'center',
        }} className="hero-grid">

          {/* ── Left: copy ── */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 9,
              background: 'var(--surface-card)',
              border: '1px solid var(--teal-border)',
              borderRadius: 99, padding: '7px 16px',
              marginBottom: 28,
              boxShadow: 'var(--shadow-sm)',
              animation: 'taglineWordIn 0.5s cubic-bezier(0.32,0.72,0,1) both',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.02em' }}>
                Live · HSC Major Project · 2026
              </span>
            </div>

            <div style={{
              marginBottom: 28,
              animation: 'taglineWordIn 0.6s 0.1s cubic-bezier(0.32,0.72,0,1) both',
            }}>
              <Tagline size="hero" stacked />
            </div>

            <p style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              maxWidth: 540,
              marginBottom: 32,
              animation: 'taglineWordIn 0.6s 0.2s cubic-bezier(0.32,0.72,0,1) both',
            }}>
              A real-time school attendance platform. NFC card hardware on Raspberry Pi, Python backend, four role-based React dashboards · all wired into one living system.
            </p>

            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap',
              animation: 'taglineWordIn 0.6s 0.3s cubic-bezier(0.32,0.72,0,1) both',
            }}>
              <button
                onClick={onClose}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 24px', borderRadius: 12,
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                  color: '#fff', fontSize: '1rem', fontWeight: 800,
                  boxShadow: '0 8px 28px rgba(20,184,184,0.4)',
                  transition: 'transform 0.14s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Explore the live demo
                <ArrowRight size={17} strokeWidth={2.8} />
              </button>
              <a
                href="#features"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '14px 22px', borderRadius: 12,
                  background: 'var(--surface-card)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                Read the case study
                <ArrowDown size={15} strokeWidth={2.6} />
              </a>
            </div>
          </div>

          {/* ── Right: 3D card-tap demo (the focal point) ── */}
          <div style={{
            position: 'relative',
            animation: 'taglineWordIn 0.7s 0.35s cubic-bezier(0.32,0.72,0,1) both',
            minHeight: 600,
          }}>
            <CardTapDemo size="lg" />

            <div style={{
              position: 'absolute', bottom: -2, left: 0, right: 0,
              textAlign: 'center',
              fontSize: '0.7rem', fontWeight: 800,
              color: 'var(--text-soft)',
              textTransform: 'uppercase', letterSpacing: '0.18em',
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'var(--green)',
                  animation: 'pulse-dot 2s ease-in-out infinite',
                }} />
                Live · NFC card tap stream
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §2 NUMBERS · big stats with count-up
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '80px 28px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,184,0.04) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <Reveal>
          <div style={{
            maxWidth: 1100, margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
          }} className="numbers-grid">
            {[
              { label: 'Students seeded',  value: 1050,    suffix: ''      },
              { label: 'Classes',          value: 42,      suffix: ''      },
              { label: 'Teaching staff',   value: 30,      suffix: ''      },
              { label: 'Tap → UI latency', value: 100,     suffix: ' ms',  prefix: '<' },
            ].map(s => (
              <div key={s.label}>
                <div style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: 8,
                }}>
                  <CountUp value={s.value} prefix={s.prefix || ''} suffix={s.suffix} />
                </div>
                <div style={{
                  fontSize: '0.78rem', fontWeight: 800,
                  color: 'var(--text-soft)',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════════════════════════
          §3 PROBLEM / SOLUTION
      ═══════════════════════════════════════ */}
      <section id="features" style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>The problem</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 24,
              maxWidth: 720,
            }}>
              Marking the roll wastes hours. Schools need real-time visibility · not yesterday's spreadsheet.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 80 }} className="problem-grid">
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '22px 24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', gap: 14,
                  height: '100%',
                }}>
                  <div style={{ fontSize: '1.6rem', lineHeight: 1, flexShrink: 0 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {p.detail}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>The solution</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 32,
              maxWidth: 720,
            }}>
              One tap. One source of truth. Live for everyone.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="problem-grid">
            {SOLUTIONS.map((s, i) => (
              <Reveal key={s.title} delay={i * 70}>
                <div style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--teal-border)',
                  borderRadius: 14, padding: '22px 24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', gap: 14,
                  height: '100%',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'var(--teal-glow)',
                    color: 'var(--teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6, letterSpacing: '-0.02em' }}>
                      {s.title}
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {s.detail}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §4 HOW IT WORKS · pipeline
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '100px 28px',
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>How it works</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 40,
              maxWidth: 760,
            }}>
              From a card tap to a live dashboard · in under 100 milliseconds.
            </h2>
          </Reveal>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          }} className="pipeline-grid">
            {[
              { n: '01', icon: CreditCard, title: 'NFC tap',         d: 'Student taps their MIFARE card on the ACR122U USB reader connected to the Raspberry Pi.' },
              { n: '02', icon: Cpu,        title: 'Pi identifies',   d: 'Python + pyscard reads the UID and queries SQLite for the matching student record.' },
              { n: '03', icon: Wifi,       title: 'WebSocket emit',  d: 'Flask-SocketIO broadcasts a card_tap event with the student data over WebSocket.' },
              { n: '04', icon: Activity,   title: 'UI updates live', d: 'React clients receive the event via socket.io-client and update every dashboard in real-time.' },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 100}>
                <div style={{
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '22px 22px',
                  height: '100%', position: 'relative',
                }}>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: '2.2rem', fontWeight: 800,
                    color: 'var(--teal)', opacity: 0.4,
                    letterSpacing: '-0.04em', lineHeight: 1,
                    marginBottom: 16,
                  }}>
                    {step.n}
                  </div>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: 'var(--teal-glow)',
                    color: 'var(--teal)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <step.icon size={18} strokeWidth={2} />
                  </div>
                  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {step.d}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §5 DEMO ACCOUNTS · interactive cards
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>Demo accounts</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 16,
              maxWidth: 720,
            }}>
              Four roles. One platform. Click any card.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 40, maxWidth: 600 }}>
              Each role has its own dashboard tailored to its needs. Click a card to see every feature, or hit "Open" to dive straight in.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="problem-grid">
            {DEMO_ACCOUNTS.map((acc, i) => (
              <Reveal key={acc.role} delay={i * 80}>
                <button
                  onClick={() => setOpenModal(acc)}
                  style={{
                    background: 'var(--surface-card)',
                    border: '1.5px solid var(--border)',
                    borderRadius: 16, padding: '24px 24px',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.22s cubic-bezier(0.32, 0.72, 0, 1)',
                    display: 'flex', flexDirection: 'column', gap: 14,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = acc.colour;
                    e.currentTarget.style.boxShadow = `0 12px 36px ${acc.colour}25`;
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 13,
                      background: `${acc.colour}18`, color: acc.colour,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <acc.icon size={22} strokeWidth={2} />
                    </div>
                    <ArrowRight size={18} style={{ color: acc.colour }} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      fontWeight: 800, fontSize: '1.6rem',
                      color: 'var(--text-primary)', letterSpacing: '-0.03em',
                      marginBottom: 4,
                    }}>
                      {acc.role}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: acc.colour, fontWeight: 700, marginBottom: 12 }}>
                      {acc.label}
                    </div>
                    <div style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {acc.description}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '0.74rem', fontWeight: 700,
                    color: acc.colour, letterSpacing: '0.04em',
                  }}>
                    {acc.features.length} features →
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §5b QUIET CTA · bridge between demo + tech
      ═══════════════════════════════════════ */}
      <section style={{ padding: '40px 28px 80px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(1.3rem, 3vw, 1.9rem)',
              fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.25,
              color: 'var(--text-primary)',
              marginBottom: 14,
            }}>
              Best experienced first-hand.
            </p>
            <p style={{
              fontSize: '1rem', color: 'var(--text-muted)',
              lineHeight: 1.65, marginBottom: 26,
            }}>
              Reading about it only gets you so far. The platform's strength is in the live interactions, the animations, the way the dashboards respond to a real card tap. Pick any role to step inside.
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => openRole(acc.role)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px', borderRadius: 11,
                    background: 'var(--surface-card)',
                    border: `1.5px solid ${acc.colour}50`,
                    color: acc.colour,
                    fontSize: '0.86rem', fontWeight: 800,
                    transition: 'all 0.18s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${acc.colour}10`;
                    e.currentTarget.style.borderColor = acc.colour;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = `0 6px 18px ${acc.colour}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--surface-card)';
                    e.currentTarget.style.borderColor = `${acc.colour}50`;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <acc.icon size={14} strokeWidth={2.4} />
                  Try {acc.role}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §6 TECH STACK
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '100px 28px',
        background: 'var(--surface-card)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>Tech stack</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 40,
              maxWidth: 720,
            }}>
              Built with modern, production-grade tooling.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }} className="tech-grid">
            {TECH_GROUPS.map((g, i) => (
              <Reveal key={g.title} delay={i * 80}>
                <div style={{
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 14, padding: '24px',
                  height: '100%',
                }}>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontWeight: 800, fontSize: '1.15rem',
                    color: g.colour, marginBottom: 18,
                    letterSpacing: '-0.02em',
                  }}>
                    {g.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {g.items.map(t => (
                      <div key={t.name} style={{
                        padding: '11px 13px',
                        background: 'var(--surface-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: 2 }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          {t.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §7 TIMELINE
      ═══════════════════════════════════════ */}
      <section style={{ padding: '100px 28px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <Reveal>
            <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 18 }}>The journey</div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
              letterSpacing: '-0.035em', lineHeight: 1.1, marginBottom: 16,
              maxWidth: 720,
            }}>
              Eight months of research, design and engineering.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 48, maxWidth: 580 }}>
              From research to deployment. Every phase documented for the HSC SDD project brief.
            </p>
          </Reveal>

          <div>
            {TIMELINE.map((item, i) => (
              <Reveal key={item.date} delay={i * 50}>
                <div style={{ display: 'flex', gap: 22, marginBottom: i < TIMELINE.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: 'var(--teal)',
                      border: '3px solid var(--teal-glow)',
                      marginTop: 8,
                      boxShadow: '0 0 0 4px var(--surface), 0 0 14px rgba(20,184,184,0.45)',
                    }} />
                    {i < TIMELINE.length - 1 && (
                      <div style={{
                        width: 2, flex: 1,
                        background: 'linear-gradient(to bottom, var(--teal-border) 0%, var(--border) 100%)',
                        minHeight: 36, margin: '6px 0 0',
                      }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < TIMELINE.length - 1 ? 30 : 0, flex: 1 }}>
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 800,
                      color: 'var(--teal)', textTransform: 'uppercase',
                      letterSpacing: '0.1em', marginBottom: 6,
                    }}>
                      {item.date}
                    </div>
                    <div style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      fontWeight: 800, fontSize: '1.2rem',
                      color: 'var(--text-primary)', marginBottom: 6,
                      letterSpacing: '-0.025em',
                    }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 640 }}>
                      {item.detail}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          §8 BUILT BY + SHARE
      ═══════════════════════════════════════ */}
      <section style={{
        padding: '80px 28px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(20,184,184,0.06) 100%)',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <Reveal>
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 18, padding: '32px',
              boxShadow: 'var(--shadow-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 22, flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 14,
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                  color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 800, fontSize: '1.4rem',
                  boxShadow: '0 8px 24px rgba(20,184,184,0.4)',
                }}>
                  TC
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontWeight: 800, fontSize: '1.2rem',
                    color: 'var(--text-primary)', marginBottom: 3, letterSpacing: '-0.02em',
                  }}>
                    Toby Crowther
                  </div>
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    Shore School · HSC SDD 2026
                  </div>
                </div>
              </div>

              <button
                onClick={copyURL}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 18px', borderRadius: 11,
                  background: copied ? 'var(--green)' : 'var(--surface)',
                  color: copied ? '#fff' : 'var(--text-primary)',
                  border: `1.5px solid ${copied ? 'var(--green)' : 'var(--border)'}`,
                  fontSize: '0.86rem', fontWeight: 700,
                  transition: 'all 0.18s ease',
                }}
              >
                {copied
                  ? <><CheckCircle size={14} strokeWidth={2.8} /> Link copied</>
                  : <><Copy size={14} strokeWidth={2.5} /> Copy demo URL</>}
              </button>
            </div>
          </Reveal>

          {/* Tagline mark at the very end */}
          <Reveal delay={150}>
            <div style={{ textAlign: 'center', marginTop: 56, opacity: 0.6 }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center' }}>
                <Tagline size="sm" muted />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        @media (max-width: 980px) {
          .hero-grid     { grid-template-columns: 1fr !important; gap: 24px !important; }
        }
        @media (max-width: 900px) {
          .numbers-grid  { grid-template-columns: repeat(2, 1fr) !important; gap: 22px !important; }
          .problem-grid  { grid-template-columns: 1fr !important; }
          .pipeline-grid { grid-template-columns: 1fr !important; }
          .tech-grid     { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
