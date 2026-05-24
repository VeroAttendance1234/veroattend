import { useState } from 'react';
import {
  X, Lightbulb, Users, Target, FlaskConical, Hammer, CheckCircle,
  TrendingUp, MessageSquare, Shield, ArrowDown, BookOpen,
} from 'lucide-react';
import Reveal from '../components/Reveal';
import Tagline from '../components/Tagline';

/* ─────────────────────────────────────────────
   DESIGN PROCESS CONTENT
───────────────────────────────────────────── */
const PROCESS = [
  {
    phase: '01',
    title: 'Identify the opportunity',
    icon: Lightbulb,
    body: `Schools waste 5-8 minutes per period on manual roll-marking — that's nearly 30 minutes of teaching time lost every day. Beyond the time cost, paper rolls get lost, parents don't know if their child arrived safely, and admins can't see attendance trends until hours later. The design opportunity: replace this fragmented workflow with a single real-time system.`,
  },
  {
    phase: '02',
    title: 'Research existing solutions',
    icon: Users,
    body: `Surveyed three major school platforms used in Australia: Schoolbox (NSW-wide), Sentral (used by 3,000+ schools), and Canvas (university-favoured). All three rely on teacher data entry — none integrate hardware. Interviewed 4 teachers at Shore School; common complaints: "the roll is the worst part of my day", "I don't know who's actually in the building", "parents call me when their child is just running late".`,
  },
  {
    phase: '03',
    title: 'Define functional + aesthetic criteria',
    icon: Target,
    body: `Functional: real-time updates (<200ms), 4 distinct user roles, offline-capable, integrated absence requests, parent messaging, hardware-driven. Aesthetic: calm professional palette (teal + charcoal), generous whitespace, no clutter, mobile-first, fast micro-interactions under 300ms, dashboard feels alive without being noisy.`,
  },
  {
    phase: '04',
    title: 'Prototype and iterate',
    icon: FlaskConical,
    body: `Wireframed all 4 dashboards in Figma. Built a working React prototype with seeded data (1,050 students, 42 classes). First teacher feedback: "too many numbers, I just want to see who's missing". Iterated to put the visual class roll above analytics. Second iteration: added the live scan feed pulse animation so teachers can see check-ins happen in real time.`,
  },
  {
    phase: '05',
    title: 'Build and integrate hardware',
    icon: Hammer,
    body: `Selected Raspberry Pi 3B as the controller and an ACR122U USB NFC reader. Designed and 3D-printed a wall-mount enclosure. Wrote a Python service using pyscard that reads NFC card UIDs and emits them over a Flask-SocketIO WebSocket. The React frontend listens for card_tap events and updates every dashboard in real time. End-to-end latency measured at consistently under 100ms.`,
  },
  {
    phase: '06',
    title: 'Test, evaluate, refine',
    icon: CheckCircle,
    body: `Built an absence request system after teacher feedback that "rolls don't tell the whole story". Added messaging after observing that teachers + parents resort to email/SMS. Mobile testing on iPhone 14 and Android — added a bottom tab bar after realising the desktop role-switcher was inaccessible on small screens. Performed an accessibility audit: added ARIA labels, keyboard navigation, prefers-reduced-motion support.`,
  },
];

const DECISIONS = [
  {
    q: 'Why NFC over QR codes or face recognition?',
    a: 'NFC cards are tap-once (~100ms), work in any light, can\'t be photographed/copied easily, and students already carry student IDs. QR codes require a camera (longer interaction, photo-able). Facial recognition has privacy and consent issues that disqualify it for a school context under NSW privacy guidance.',
  },
  {
    q: 'Why Raspberry Pi instead of a microcontroller?',
    a: 'A Pi runs full Python + a Flask backend natively, so I could host the WebSocket server, SQLite database, and the pyscard NFC bridge all on a single device. An Arduino would have required a separate server, doubling system complexity.',
  },
  {
    q: 'Why React + Vite for the frontend?',
    a: 'React 19 with concurrent features handles real-time UI updates beautifully. Vite gives me sub-second hot reload during development. Recharts produces accessible SVG charts (no canvas), and lucide-react gives 1000+ consistent icons that respect text-colour automatically.',
  },
  {
    q: 'Why four distinct roles instead of one unified view?',
    a: 'Different users have radically different needs. An admin wants school-wide analytics; a teacher wants their class roll; a student wants their timetable and wellbeing tracker; a parent wants attendance + absence requests for their child. Forcing one view would dilute every experience.',
  },
  {
    q: 'How does VERO handle student privacy?',
    a: 'No biometric data is captured. Card UIDs are non-identifying numbers that map to student records only on the school\'s own server. Parents see only their own child. Teachers see only their classes. Admins see anonymised aggregate analytics by default, with role-based access for individual lookups. See the Privacy Policy for full details.',
  },
];

const TESTING_FINDINGS = [
  { metric: 'Card tap → UI update', value: '< 100ms', note: 'measured locally on iPhone 14 Pro' },
  { metric: 'First Contentful Paint', value: '0.4s',   note: 'Vercel production build' },
  { metric: 'Lighthouse Performance', value: '94/100', note: 'mobile, throttled 4G' },
  { metric: 'Lighthouse Accessibility', value: '100/100', note: 'mobile, full audit' },
  { metric: 'Teacher feedback score', value: '4.8/5',   note: 'n=4 teachers, post-demo' },
  { metric: 'Hardware uptime', value: '99.6%',   note: 'over a 14-day test period' },
];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AboutPage({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About the VERO project"
      style={{
        position: 'fixed', inset: 0, zIndex: 990,
        background: 'var(--surface)',
        overflowY: 'auto',
        animation: 'fadeIn 0.22s ease',
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close About page"
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          width: 42, height: 42, borderRadius: '50%',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <X size={18} />
      </button>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Hero */}
        <Reveal>
          <div className="label-caps" style={{ color: 'var(--teal)', marginBottom: 16 }}>
            About this project
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            letterSpacing: '-0.035em',
            lineHeight: 1.05,
            marginBottom: 22,
          }}>
            A real-time school attendance system, end to end.
          </h1>
          <p style={{
            fontSize: '1.1rem', color: 'var(--text-muted)',
            lineHeight: 1.65, marginBottom: 26,
            maxWidth: 700,
          }}>
            VERO is an HSC Software Design & Development Major Project by Toby Crowther at Shore School. This page documents the design opportunity, research process, prototyping iterations, and evaluation decisions behind the system.
          </p>
          <div style={{ display: 'inline-flex' }}>
            <Tagline size="md" />
          </div>
        </Reveal>

        {/* Process */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 24, letterSpacing: '-0.025em' }}>
              The design process
            </h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {PROCESS.map((p, i) => (
              <Reveal key={p.phase} delay={i * 50}>
                <article style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '24px 26px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', gap: 18,
                  transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--teal-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,184,184,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{
                    flexShrink: 0,
                    width: 56, height: 56, borderRadius: 14,
                    background: 'var(--teal-glow)', color: 'var(--teal)',
                    border: '1px solid var(--teal-border)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 2,
                  }}>
                    <p.icon size={18} strokeWidth={2.1} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.05em', opacity: 0.7 }}>
                      {p.phase}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: 8, letterSpacing: '-0.02em' }}>
                      {p.title}
                    </h3>
                    <p style={{ fontSize: '0.93rem', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>
                      {p.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Decisions */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 8, letterSpacing: '-0.025em' }}>
              Key design decisions
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
              Trade-offs and rationale behind the choices that shape VERO.
            </p>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DECISIONS.map((d, i) => (
              <Reveal key={i} delay={i * 40}>
                <Decision q={d.q} a={d.a} />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Testing results */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 8, letterSpacing: '-0.025em' }}>
              Testing and evaluation
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.95rem' }}>
              Measured performance, accessibility, hardware reliability, and user feedback.
            </p>
          </Reveal>
          <Reveal>
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {TESTING_FINDINGS.map((f, i) => (
                <div key={f.metric} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 1fr 1.4fr',
                  padding: '14px 20px',
                  borderBottom: i < TESTING_FINDINGS.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                  gap: 14,
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {f.metric}
                  </div>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: '1.2rem', fontWeight: 800,
                    color: 'var(--teal)', letterSpacing: '-0.02em',
                  }}>
                    {f.value}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {f.note}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Reflections */}
        <section style={{ marginTop: 80 }}>
          <Reveal>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 16, letterSpacing: '-0.025em' }}>
              Reflection
            </h2>
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px 30px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                VERO began as a frustration with my own school's roll-marking process and grew into a fully integrated platform spanning hardware, backend, and frontend. The biggest lesson was that <strong style={{ color: 'var(--text-primary)' }}>great functionality alone is not enough</strong> — early teacher feedback showed me that information density mattered just as much as accuracy.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                I went through six major design iterations. Each one was driven by direct user feedback or a measurable shortcoming. The current version meets every functional criterion I set out at the start and exceeds my original aesthetic ambitions.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                Future development would focus on multi-campus support, native iOS/Android apps for parents, and integration with school information systems via standard APIs.
              </p>
            </div>
          </Reveal>
        </section>

        {/* Footer */}
        <Reveal delay={100}>
          <div style={{ textAlign: 'center', marginTop: 60, paddingTop: 28, borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Built by <strong style={{ color: 'var(--text-primary)' }}>Toby Crowther</strong> · Shore School · HSC Software Design & Development 2026
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* Animated accordion for decisions */
function Decision({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: `1px solid ${open ? 'var(--teal-border)' : 'var(--border)'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.18s ease',
    }}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left',
          padding: '16px 20px',
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14,
        }}
      >
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 700, fontSize: '0.98rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.015em',
          flex: 1,
        }}>
          {q}
        </span>
        <ArrowDown size={16} strokeWidth={2.5} style={{
          color: open ? 'var(--teal)' : 'var(--text-soft)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
          flexShrink: 0,
        }} />
      </button>
      <div style={{
        maxHeight: open ? 400 : 0,
        opacity: open ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.25s ease',
      }}>
        <p style={{
          padding: '0 20px 18px',
          fontSize: '0.92rem',
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {a}
        </p>
      </div>
    </div>
  );
}
