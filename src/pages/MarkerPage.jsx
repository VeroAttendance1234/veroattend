import { useState, useEffect } from 'react';
import {
  Monitor, Wifi, CreditCard, Users, BookOpen, Heart, ChevronRight, X,
  Play, Code, Cpu, Database, Zap, Award, Calendar,
  CheckCircle, Clock, ArrowRight, Sparkles, ExternalLink, Copy,
} from 'lucide-react';
import Modal from '../components/Modal';
import Tagline from '../components/Tagline';

/* ─────────────────────────────────────────────────────────────
   DEMO ACCOUNT DATA
───────────────────────────────────────────────────────────── */
const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    name: 'Administrator',
    description: 'Full school overview — 1,050 students across Years 7-12',
    colour: '#14B8B8',
    icon: Monitor,
    highlights: ['Live dashboard', 'Analytics charts', 'Class leaderboard', '6 KPI cards'],
    features: [
      { title: 'Live attendance hero', detail: 'Pulsing live indicator showing real-time school-wide rate, present/absent counts, and last scan' },
      { title: 'Stat cards', detail: '6 colour-coded metrics (total, present, absent, late, staff, classes) with watermark icons' },
      { title: 'Trend analytics', detail: 'Recharts area chart of monthly attendance over 5 years with toggle (6M/1Y/2Y/5Y)' },
      { title: 'Year-group breakdown', detail: 'Bar chart comparing Year 7 through Year 12 attendance rates' },
      { title: 'Class leaderboard', detail: 'Top 12 classes with gold/silver/bronze medals and progress bars' },
      { title: 'System status', detail: 'Live device monitoring (Pi, ACR122U, WebSocket, Database)' },
      { title: 'Searchable roll', detail: '1,050 students paginated 30/page with year+class filters and search' },
    ],
  },
  {
    role: 'Teacher',
    name: 'Mr David Chen',
    description: 'Maths teacher — 6 classes across Years 7-12',
    colour: '#2563EB',
    icon: BookOpen,
    highlights: ['Per-class live feed', 'Class roll', 'Weekly timetable', 'Stats'],
    features: [
      { title: 'Teacher header card', detail: 'Profile with subject, class count, and live class attendance rate' },
      { title: 'Class switcher', detail: '6 class buttons showing per-class present/total counts at a glance' },
      { title: 'Live feed by class', detail: 'Filters the school-wide scan stream to just the selected class' },
      { title: 'Class roll', detail: 'Sortable roll for the selected class with present/absent badges' },
      { title: 'Weekly timetable', detail: 'Full week timetable highlighting today and the current period' },
    ],
  },
  {
    role: 'Student',
    name: 'Aisha Patel — Year 11A',
    description: 'Student portal with wellbeing, goals and timetable',
    colour: '#16A34A',
    icon: Heart,
    highlights: ['Wellbeing check-in', 'Journal', 'Goals', 'Timetable'],
    features: [
      { title: 'Welcome banner', detail: 'Personalised greeting with today\'s check-in status and current mood' },
      { title: 'Live timetable', detail: 'Today\'s periods with NOW pulse indicator on the current lesson' },
      { title: 'Daily mood picker', detail: '5-emoji wellbeing scale (Struggling → Amazing) with optional note' },
      { title: 'Searchable journal', detail: 'Full mood journal history with search and mood-tagged entries' },
      { title: 'Goal tracker', detail: 'Filterable goals by category (Academic/Health/Personal/Wellbeing) with priority + due dates' },
    ],
  },
  {
    role: 'Parent',
    name: 'J. Patel (Parent)',
    description: "Read-only view of Aisha's attendance and progress",
    colour: '#7C3AED',
    icon: Users,
    highlights: ['Week attendance', 'Wellbeing summary', 'Journal', 'Goals'],
    features: [
      { title: 'Child status card', detail: 'Profile card border colour indicates whether child is present today' },
      { title: 'Week attendance', detail: 'Mon-Fri attendance breakdown with progress bar and weekly rate' },
      { title: 'Mood summary', detail: 'Visual mood chart for the week with auto-generated sentiment label' },
      { title: 'Recent journal', detail: 'Read-only view of child\'s 3 most recent journal entries' },
      { title: 'Goal progress', detail: 'Read-only view of child\'s active goals with completion tracker' },
      { title: 'School alerts', detail: 'Notification feed (excursion forms, sports news, parent-teacher nights)' },
    ],
  },
];

const SYSTEM_SPECS = [
  { category: 'Frontend',  items: [
    { label: 'React 19',           icon: Code },
    { label: 'Vite 8',             icon: Zap },
    { label: 'Recharts',           icon: Monitor },
    { label: 'Lucide Icons',       icon: Sparkles },
    { label: 'Socket.io Client',   icon: Wifi },
  ]},
  { category: 'Backend',   items: [
    { label: 'Python 3.11',        icon: Code },
    { label: 'Flask',              icon: Cpu },
    { label: 'Flask-SocketIO',     icon: Wifi },
    { label: 'pyscard',            icon: CreditCard },
    { label: 'SQLite',             icon: Database },
  ]},
  { category: 'Hardware',  items: [
    { label: 'Raspberry Pi 3B',    icon: Cpu },
    { label: 'ACR122U NFC Reader', icon: CreditCard },
    { label: 'PC/SC Daemon',       icon: Cpu },
    { label: 'MIFARE Classic Cards', icon: CreditCard },
  ]},
];

const TIMELINE = [
  { date: 'Oct 2025', title: 'Research & Discovery',     detail: 'Surveyed existing school attendance systems (Schoolbox, Sentral, Canvas). Interviewed teachers about manual roll-marking pain points. Researched NFC/RFID hardware options.' },
  { date: 'Nov 2025', title: 'Feasibility & Hardware R&D', detail: 'Compared RFID readers, evaluated Raspberry Pi vs Arduino, tested NFC card compatibility. Prototyped first card-tap with a USB reader and a Python script.' },
  { date: 'Dec 2025', title: 'Requirements & Scope',     detail: 'Locked in the 4-role architecture (Admin / Teacher / Student / Parent). Drafted data model, user stories, and non-functional requirements for the HSC project brief.' },
  { date: 'Jan 2026', title: 'Design + Brand System',    detail: 'Wireframes, brand identity (VERO logo, teal palette), typography. Built the design tokens that drive the live app.' },
  { date: 'Feb 2026', title: 'Frontend Foundation',      detail: 'React + Vite scaffold, component library (Card, Badge, StatCard, Modal). 1,050 seeded students across 42 classes.' },
  { date: 'Mar 2026', title: 'Dashboards Built',         detail: 'Four role-based dashboards. Recharts analytics, live feed, search, filters, pagination, attendance leaderboard.' },
  { date: 'Apr 2026', title: 'Backend + Pi Integration', detail: 'Flask + Flask-SocketIO backend, SQLite schema, pyscard daemon on Raspberry Pi 3B. ACR122U reader provisioned and verified end-to-end.' },
  { date: 'May 2026', title: 'Polish + Deploy',          detail: 'Mobile-responsive design, accessibility pass, absence requests, parent–teacher messaging, deployment to Vercel. Final folio and documentation.' },
];

/* ─────────────────────────────────────────────────────────────
   FEATURE MODAL — uses shared Modal for consistency
───────────────────────────────────────────────────────────── */
function FeatureModal({ account, onClose, onOpen }) {
  if (!account) return null;
  const Icon = account.icon;

  return (
    <Modal
      open={!!account}
      onClose={onClose}
      width="md"
      accent={account.colour}
      icon={<Icon size={20} strokeWidth={2.2} />}
      title={`${account.role} Dashboard`}
      subtitle={account.name}
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ready to explore?</span>
          <button
            onClick={onOpen}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              background: account.colour, color: '#fff',
              fontSize: '0.85rem', fontWeight: 700,
              boxShadow: `0 4px 16px ${account.colour}40`,
            }}
          >
            <Play size={13} strokeWidth={2.8} />
            Open {account.role} dashboard
            <ArrowRight size={14} strokeWidth={2.8} />
          </button>
        </div>
      }
    >
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 18 }}>
        {account.description}
      </p>
      <div className="label-caps" style={{ marginBottom: 10 }}>Key features</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {account.features.map((f, i) => (
          <div key={i} style={{
            display: 'flex', gap: 11,
            padding: '11px 13px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
            borderRadius: 11,
          }}>
            <CheckCircle size={15} style={{ color: account.colour, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                {f.title}
              </div>
              <div style={{ fontSize: '0.79rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {f.detail}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN MARKER PAGE
───────────────────────────────────────────────────────────── */
export default function MarkerPage({ onClose, setRole }) {
  const [openModal, setOpenModal] = useState(null);
  const [tab, setTab] = useState('overview'); // overview | tech | timeline
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
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Close button (top-right corner) */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 1000,
          width: 40, height: 40, borderRadius: '50%',
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.12s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <X size={18} />
      </button>

      {/* Feature modal */}
      {openModal && (
        <FeatureModal
          account={openModal}
          onClose={() => setOpenModal(null)}
          onOpen={() => openRole(openModal.role)}
        />
      )}

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* ─── HERO ───────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img
            src="/vero-logo.png"
            alt="VERO."
            style={{ height: 110, objectFit: 'contain', display: 'block', margin: '0 auto 20px' }}
          />
          <div style={{ marginBottom: 30 }}>
            <Tagline size="lg" />
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'var(--surface-card)',
            border: '1.5px solid var(--teal-border)',
            borderRadius: 99, padding: '8px 18px',
            marginBottom: 20,
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.02em' }}>
              HSC Software Design & Development · Major Project 2026
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: 12, letterSpacing: '-0.03em' }}>
            A real-time school attendance platform
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 24px' }}>
            VERO unifies hardware (NFC card reader on Raspberry Pi),
            backend (Flask + WebSocket), and frontend (React) into a single live system —
            with four distinct role-based experiences.
          </p>

          {/* Quick stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 12 }}>
            {[
              { v: '1,050', l: 'Students' },
              { v: '42',    l: 'Classes' },
              { v: '4',     l: 'User roles' },
              { v: '< 100ms', l: 'Tap → Update' },
            ].map(({ v, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontSize: '1.6rem', fontWeight: 800, color: 'var(--teal)',
                  letterSpacing: '-0.03em', lineHeight: 1,
                }}>{v}</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── TAB SWITCHER ───────────────────── */}
        <div style={{
          display: 'flex', gap: 4, padding: 4,
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          marginBottom: 26,
          width: 'fit-content',
          marginLeft: 'auto', marginRight: 'auto',
        }}>
          {[
            { id: 'overview', label: 'Demo Accounts', icon: Users },
            { id: 'tech',     label: 'Tech Stack',    icon: Code },
            { id: 'timeline', label: 'Project Timeline', icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 9,
                background: tab === id ? 'var(--teal)' : 'transparent',
                color: tab === id ? '#fff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.85rem',
                transition: 'all 0.14s ease',
              }}
            >
              <Icon size={14} strokeWidth={2.5} />
              {label}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ────────────────────── */}
        {tab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {DEMO_ACCOUNTS.map(acc => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    onClick={() => setOpenModal(acc)}
                    style={{
                      background: 'var(--surface-card)',
                      border: '1.5px solid var(--border)',
                      borderRadius: 16,
                      padding: '20px 20px 16px',
                      textAlign: 'left',
                      transition: 'all 0.18s ease',
                      display: 'flex', flexDirection: 'column', gap: 10,
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = acc.colour;
                      e.currentTarget.style.boxShadow = `0 8px 28px ${acc.colour}25`;
                      e.currentTarget.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 11,
                          background: `${acc.colour}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: acc.colour,
                        }}>
                          <Icon size={18} strokeWidth={2} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                            {acc.role}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: acc.colour, fontWeight: 700 }}>{acc.name}</div>
                        </div>
                      </div>
                      <div style={{
                        padding: '3px 9px', borderRadius: 99,
                        background: `${acc.colour}12`,
                        color: acc.colour,
                        fontSize: '0.68rem', fontWeight: 800,
                        letterSpacing: '0.04em',
                      }}>
                        VIEW
                      </div>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                      {acc.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {acc.highlights.map(h => (
                        <span key={h} style={{
                          fontSize: '0.66rem', fontWeight: 700,
                          padding: '2px 8px', borderRadius: 99,
                          background: 'var(--surface-soft)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}>
                          {h}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-soft)', marginTop: 16 }}>
              Click any role card to see its full feature breakdown
            </p>
          </div>
        )}

        {tab === 'tech' && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {SYSTEM_SPECS.map(group => (
                <div key={group.category} style={{
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: '0.95rem', fontWeight: 800,
                    color: 'var(--teal)', marginBottom: 14,
                    letterSpacing: '-0.01em',
                  }}>
                    {group.category}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                    {group.items.map(({ label, icon: Icon }) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '10px 12px', borderRadius: 10,
                        background: 'var(--surface-soft)',
                        border: '1px solid var(--border)',
                      }}>
                        <Icon size={14} strokeWidth={2} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* How it works */}
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '24px 26px',
              marginTop: 20,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '0.95rem', fontWeight: 800, color: 'var(--teal)', marginBottom: 18 }}>
                Card-tap pipeline
              </div>
              {[
                { step: '01', title: 'NFC card tapped', detail: 'ACR122U USB reader (connected to Pi) detects the card UID' },
                { step: '02', title: 'Pi identifies student', detail: 'Python + pyscard queries SQLite for the matching student record' },
                { step: '03', title: 'WebSocket broadcast', detail: 'Flask-SocketIO emits a card_tap event over WebSocket' },
                { step: '04', title: 'UI updates live', detail: 'React receives event via socket.io-client, all dashboards update' },
              ].map(({ step, title, detail }, i, arr) => (
                <div key={step} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--teal-glow)',
                      border: '2px solid var(--teal-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.7rem',
                      color: 'var(--teal)',
                    }}>{step}</div>
                    {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 20, margin: '4px 0' }} />}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 16 : 0, paddingTop: 5 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div style={{ animation: 'fadeIn 0.25s ease' }}>
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {TIMELINE.map((item, i, arr) => (
                <div key={item.date} style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: 'var(--teal)',
                      border: '3px solid var(--teal-glow)',
                      marginTop: 6,
                    }} />
                    {i < arr.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 40, margin: '4px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < arr.length - 1 ? 22 : 0 }}>
                    <div style={{
                      fontSize: '0.7rem', fontWeight: 800,
                      color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em',
                      marginBottom: 4,
                    }}>{item.date}</div>
                    <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SHARE BAR ──────────────────────── */}
        <div style={{
          marginTop: 32,
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '16px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--teal-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--teal)',
            }}>
              <ExternalLink size={16} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Share this demo</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: 2 }}>
                {typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}
              </div>
            </div>
          </div>
          <button
            onClick={copyURL}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 10,
              background: copied ? 'var(--green)' : 'var(--teal)',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              transition: 'all 0.15s',
            }}
          >
            {copied
              ? <><CheckCircle size={14} strokeWidth={2.8} /> Copied!</>
              : <><Copy size={14} strokeWidth={2.5} /> Copy link</>
            }
          </button>
        </div>

        {/* ─── FOOTER ─────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <img
            src="/vero-wordmark.png"
            alt="VERO."
            style={{ height: 22, objectFit: 'contain', display: 'block', margin: '0 auto 8px', opacity: 0.5 }}
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)' }}>
            Built by <strong style={{ color: 'var(--text-muted)' }}>Toby Crowther</strong> · Shore School · HSC SDD 2026
          </p>
        </div>

      </div>
    </div>
  );
}
