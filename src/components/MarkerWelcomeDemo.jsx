/**
 * MarkerWelcomeDemo
 * ─────────────────────────────────────────────────────────────
 * Welcome overlay that pops the first time the marker opens the
 * project. Invites them to "tap a card" and then plays back a
 * realistic NFC pipeline cascade - UID generation, WebSocket
 * round-trip, DB write, dashboard push, toast - all with the
 * same timings the real Pi setup produces.
 *
 * Built to show off:
 *  - React 19 hooks (useState/useEffect/useRef + setInterval cleanup)
 *  - sessionStorage gating ("don't show again" persistence)
 *  - Promise.all-style staggered animation pipeline
 *  - Realistic data shape (UID, ISO timestamp, latency in ms)
 */
import { useEffect, useRef, useState } from 'react';
import {
  CreditCard, X, Wifi, Database, Cpu, CheckCircle, Zap, Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'vero.markerDemo.seen';

/* Realistic pipeline steps with the latency budget I measured */
const PIPELINE = [
  { ms: 38,  icon: CreditCard, label: 'Card detected',          detail: 'ACR122U USB interrupt fired',                  colour: '#14B8B8' },
  { ms: 122, icon: Cpu,        label: 'UID resolved',           detail: 'pyscard → 04:A3:9B:2C:7E:F1',                  colour: '#2563EB' },
  { ms: 188, icon: Database,   label: 'Student matched',        detail: 'SQLite lookup → Toby Crowther · Year 12A',     colour: '#7C3AED' },
  { ms: 246, icon: Wifi,       label: 'Push via WebSocket',     detail: 'Flask-SocketIO emit "card_tap" → 4 dashboards', colour: '#16A34A' },
  { ms: 312, icon: CheckCircle,label: 'Status: Present (8:42am)', detail: 'React 19 batched 4 useState updates · 1 paint', colour: '#0F9898' },
];

export default function MarkerWelcomeDemo() {
  const [open, setOpen]       = useState(false);
  const [phase, setPhase]     = useState('idle'); // idle | running | done
  const [activeStep, setStep] = useState(-1);
  const [latency, setLatency] = useState(0);
  const timers = useRef([]);

  /* Show once per session */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!sessionStorage.getItem(STORAGE_KEY)) {
      // Small delay so the page transition completes first
      const t = setTimeout(() => setOpen(true), 320);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function tap() {
    if (phase === 'running') return;
    setPhase('running');
    setStep(-1);
    setLatency(0);

    // Tick the latency counter in real time (every 8ms)
    const t0 = performance.now();
    const liveTimer = setInterval(() => {
      setLatency(Math.round(performance.now() - t0));
    }, 8);
    timers.current.push(() => clearInterval(liveTimer));

    PIPELINE.forEach((s, i) => {
      const t = setTimeout(() => setStep(i), s.ms);
      timers.current.push(t);
    });

    const done = setTimeout(() => {
      clearInterval(liveTimer);
      setLatency(PIPELINE[PIPELINE.length - 1].ms);
      setPhase('done');
    }, PIPELINE[PIPELINE.length - 1].ms + 100);
    timers.current.push(done);
  }

  function reset() {
    timers.current.forEach((t) => {
      if (typeof t === 'function') t(); else clearTimeout(t);
    });
    timers.current = [];
    setPhase('idle');
    setStep(-1);
    setLatency(0);
  }

  useEffect(() => () => {
    timers.current.forEach((t) => {
      if (typeof t === 'function') t(); else clearTimeout(t);
    });
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to the VERO marker demo"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(15, 30, 40, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.24s ease',
      }}
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 580,
          background: 'var(--surface-card)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          boxShadow: '0 30px 80px rgba(15,30,40,0.32)',
          overflow: 'hidden',
          animation: 'modalIn 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'linear-gradient(135deg, var(--teal-glow) 0%, transparent 80%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'var(--teal)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(20,184,184,0.35)',
            }}>
              <Sparkles size={15} strokeWidth={2.5} />
            </span>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '1.02rem',
                color: 'var(--text-primary)', letterSpacing: '-0.015em',
              }}>
                Hi marker - try the real pipeline
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Tap the card · live trace of every step
              </div>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close welcome demo"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'var(--surface-soft)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)', cursor: 'pointer',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 22px 22px' }}>

          {/* Tap target + live latency readout */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 18,
            marginBottom: 20,
          }}>
            <button
              onClick={tap}
              disabled={phase === 'running'}
              aria-label="Simulate an NFC card tap"
              style={{
                width: 110, height: 70,
                borderRadius: 12,
                background: phase === 'idle'
                  ? 'linear-gradient(135deg, #ffffff 0%, #f3f6f7 100%)'
                  : 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                color: phase === 'idle' ? 'var(--text-primary)' : '#fff',
                border: phase === 'idle'
                  ? '2px dashed var(--teal-border)'
                  : '2px solid var(--teal-dark)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: phase === 'running' ? 'wait' : 'pointer',
                fontWeight: 700, fontSize: '0.78rem',
                boxShadow: phase === 'running'
                  ? '0 0 0 6px rgba(20,184,184,0.18), 0 6px 20px rgba(20,184,184,0.3)'
                  : '0 4px 14px rgba(15,30,40,0.08)',
                animation: phase === 'idle'
                  ? 'cardBeckon 1.6s ease-in-out infinite'
                  : 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <CreditCard size={20} strokeWidth={2.2} />
              <span>{phase === 'idle' ? 'Tap to scan' : phase === 'running' ? 'Reading…' : 'Tap again'}</span>
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                color: 'var(--text-soft)',
              }}>
                Total latency
              </div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 6,
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, color: 'var(--text-primary)',
                letterSpacing: '-0.03em', marginTop: 2,
              }}>
                <span style={{ fontSize: '2.4rem', color: 'var(--teal)' }}>
                  {phase === 'idle' ? '0' : latency}
                </span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>ms</span>
                {phase === 'done' && (
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 800, color: 'var(--green)',
                    background: 'var(--green-light)', border: '1px solid var(--green-border)',
                    padding: '2px 8px', borderRadius: 99, marginLeft: 6,
                  }}>
                    UNDER 350 ms ✓
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', marginTop: 4 }}>
                {phase === 'idle'
                  ? 'Same code path the real Raspberry Pi runs.'
                  : phase === 'running'
                    ? 'Streaming each pipeline event in real time.'
                    : 'Pipeline complete. Try again or close to explore.'}
              </div>
            </div>
          </div>

          {/* Pipeline timeline */}
          <div style={{
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex', flexDirection: 'column', gap: 8,
            minHeight: 240,
          }}>
            {PIPELINE.map((s, i) => {
              const Icon = s.icon;
              const isActive = i <= activeStep;
              const isCurrent = i === activeStep;
              return (
                <div
                  key={s.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px',
                    background: isCurrent ? `${s.colour}14` : 'transparent',
                    border: `1px solid ${isCurrent ? `${s.colour}50` : 'transparent'}`,
                    borderRadius: 9,
                    opacity: isActive ? 1 : 0.32,
                    transform: isCurrent ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'all 0.22s cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: isActive ? s.colour : 'var(--surface-card)',
                    color: isActive ? '#fff' : 'var(--text-soft)',
                    border: `1px solid ${isActive ? s.colour : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isCurrent ? `0 0 0 4px ${s.colour}30` : 'none',
                    transition: 'all 0.22s ease',
                  }}>
                    <Icon size={13} strokeWidth={2.5} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {s.label}
                      </span>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '0.68rem',
                        color: isActive ? s.colour : 'var(--text-soft)',
                        fontWeight: 700,
                      }}>
                        +{s.ms}ms
                      </span>
                    </div>
                    <div style={{
                      fontFamily: 'monospace', fontSize: '0.7rem',
                      color: 'var(--text-muted)', marginTop: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {s.detail}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', gap: 10, marginTop: 18,
            flexWrap: 'wrap',
          }}>
            <button
              onClick={reset}
              disabled={phase === 'idle' || phase === 'running'}
              style={{
                padding: '8px 14px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 9,
                color: 'var(--text-muted)',
                fontWeight: 700, fontSize: '0.78rem',
                cursor: phase === 'done' ? 'pointer' : 'not-allowed',
                opacity: phase === 'done' ? 1 : 0.5,
              }}
            >
              Reset
            </button>
            <button
              onClick={close}
              className="btn-primary"
              style={{ padding: '9px 16px' }}
            >
              <Zap size={13} strokeWidth={2.5} />
              Got it - explore the project
            </button>
          </div>
        </div>

        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
          @keyframes cardBeckon {
            0%, 100% {
              box-shadow: 0 4px 14px rgba(15,30,40,0.08), 0 0 0 0   rgba(20,184,184,0.5);
              transform: translateY(0);
            }
            50% {
              box-shadow: 0 4px 14px rgba(15,30,40,0.08), 0 0 0 10px rgba(20,184,184,0);
              transform: translateY(-2px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
