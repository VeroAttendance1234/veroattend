import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

/**
 * OnboardingTour — Apple-style guided walkthrough.
 *
 * Design notes:
 *  - Backdrop darkens to 0.78 so spotlighted elements POP visually.
 *  - Spotlight uses a triple-layer effect: inner glow + bright border + pulsing aura.
 *  - All timings use Apple's signature curve cubic-bezier(0.32, 0.72, 0, 1)
 *    — same one used across macOS / iOS.
 *  - Tooltip re-mounts per step (keyed by index) so each entrance is fresh,
 *    not a morphing position transition. Feels intentional, never janky.
 *  - Spotlight cutout transitions smoothly via box-shadow + width/height tweens.
 *  - We wait for the smooth-scroll to complete before drawing the spotlight.
 */
export default function OnboardingTour({ steps, storageKey, forceOpen, onClose }) {
  const [open, setOpen] = useState(false);
  const [idx,  setIdx]  = useState(0);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const [transitioning, setTransitioning] = useState(false);
  const tooltipRef = useRef(null);

  /* Open on every fresh page load, unless skipped in this session.
     Uses sessionStorage (not localStorage) so:
       - Tour ALWAYS shows on a fresh visit / refresh
       - Skipping it doesn't make it re-pop when switching roles
       - Closing the tab and reopening triggers it again
  */
  useEffect(() => {
    if (forceOpen) { setOpen(true); setIdx(0); return; }
    const skippedThisSession = sessionStorage.getItem(storageKey);
    if (!skippedThisSession) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [storageKey, forceOpen]);

  /* Compute target rectangle + tooltip position whenever step changes */
  useLayoutEffect(() => {
    if (!open) return;
    const step = steps[idx];
    if (!step?.target) {
      setRect(null);
      setTransitioning(false);
      return;
    }

    setTransitioning(true);

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      setTransitioning(false);
      return;
    }

    // Calculate where we need to scroll so the element ends up in view
    // with some breathing room. We use programmatic scroll for predictable timing.
    const elRect = el.getBoundingClientRect();
    const scrollY = window.scrollY + elRect.top - (window.innerHeight / 2 - elRect.height / 2);
    window.scrollTo({ top: Math.max(0, scrollY), behavior: 'smooth' });

    // After scroll completes (~450ms), measure and reveal
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

      // Tooltip placement
      const tt = tooltipRef.current?.getBoundingClientRect();
      const tooltipH = tt?.height ?? 220;
      const tooltipW = tt?.width  ?? 360;
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const placement = step.placement
        ?? (spaceBelow > tooltipH + 30 ? 'bottom' : spaceAbove > tooltipH + 30 ? 'top' : 'bottom');

      let top  = placement === 'bottom' ? r.bottom + 20 : r.top - tooltipH - 20;
      let left = r.left + r.width / 2 - tooltipW / 2;

      // Keep on-screen
      left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));
      top  = Math.max(16, Math.min(top, window.innerHeight - tooltipH - 16));
      setTooltipPos({ top, left, placement });
      setTransitioning(false);
    }, 480);

    return () => clearTimeout(t);
  }, [open, idx, steps]);

  /* Keyboard nav */
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, idx]);

  /* Lock body scroll while open (but allow programmatic scroll) */
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  function next() {
    if (idx < steps.length - 1) setIdx(idx + 1);
    else finish();
  }
  function prev() { if (idx > 0) setIdx(idx - 1); }
  function finish() {
    // Only remember within this session — tour will show again on next visit
    sessionStorage.setItem(storageKey, '1');
    setOpen(false);
    setIdx(0);
    onClose?.();
  }

  if (!open) return null;
  const step = steps[idx];
  const isCenter = !step.target || !rect;

  /* Apple's signature easing curve */
  const APPLE_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const SCROLL_DURATION = '0.55s';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      animation: 'tourFadeIn 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>

      {/* ── Backdrop ─── */}
      <div
        onClick={finish}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(8, 18, 28, 0.78)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          transition: `background ${SCROLL_DURATION} ${APPLE_EASE}`,
        }}
      />

      {/* ── Spotlight cutout (Apple-style glow) ─── */}
      {rect && (
        <>
          {/* Layer 1: bright spotlight border */}
          <div
            style={{
              position: 'absolute',
              top:    rect.top - 10,
              left:   rect.left - 10,
              width:  rect.width  + 20,
              height: rect.height + 20,
              borderRadius: 18,
              boxShadow: `
                0 0 0 9999px rgba(8, 18, 28, 0.72),
                0 0 0 2px rgba(255, 255, 255, 0.95),
                0 0 0 5px var(--teal),
                0 0 40px 6px rgba(20, 184, 184, 0.6),
                0 0 80px 12px rgba(20, 184, 184, 0.25)
              `,
              pointerEvents: 'none',
              opacity: transitioning ? 0 : 1,
              transition: `
                top ${SCROLL_DURATION} ${APPLE_EASE},
                left ${SCROLL_DURATION} ${APPLE_EASE},
                width ${SCROLL_DURATION} ${APPLE_EASE},
                height ${SCROLL_DURATION} ${APPLE_EASE},
                border-radius ${SCROLL_DURATION} ${APPLE_EASE},
                opacity 0.4s ${APPLE_EASE}
              `,
              animation: !transitioning ? 'spotlightPulse 2.4s ease-in-out infinite' : 'none',
            }}
          />

          {/* Layer 2: subtle pulsing ring extending beyond */}
          <div
            style={{
              position: 'absolute',
              top:    rect.top - 18,
              left:   rect.left - 18,
              width:  rect.width  + 36,
              height: rect.height + 36,
              borderRadius: 22,
              border: '1.5px solid rgba(20, 184, 184, 0.35)',
              pointerEvents: 'none',
              transformOrigin: 'center center',
              opacity: transitioning ? 0 : 1,
              transition: `
                top ${SCROLL_DURATION} ${APPLE_EASE},
                left ${SCROLL_DURATION} ${APPLE_EASE},
                width ${SCROLL_DURATION} ${APPLE_EASE},
                height ${SCROLL_DURATION} ${APPLE_EASE},
                opacity 0.5s ${APPLE_EASE}
              `,
              animation: !transitioning ? 'spotlightRing 2.4s ease-in-out infinite' : 'none',
            }}
          />
        </>
      )}

      {/* ── Tooltip (re-mounts per step for smooth entrance) ─── */}
      <div
        key={idx /* re-mount per step → fresh animation, no morph */}
        ref={tooltipRef}
        style={isCenter ? {
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 460px)',
          opacity: transitioning ? 0 : 1,
          transition: `opacity 0.35s ${APPLE_EASE}`,
        } : {
          position: 'absolute',
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 'min(92vw, 360px)',
          opacity: transitioning ? 0 : 1,
          transition: `opacity 0.35s ${APPLE_EASE}`,
        }}
      >
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 18,
            padding: '22px 24px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            animation: !transitioning ? `tooltipEntrance 0.6s ${APPLE_EASE}` : 'none',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(20, 184, 184, 0.4)',
            }}>
              <Sparkles size={14} strokeWidth={2.4} />
            </div>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800,
              color: 'var(--teal)', textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Step {idx + 1} of {steps.length}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={finish}
              aria-label="Skip tour"
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: 'transparent', color: 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.16s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-soft)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-soft)'; }}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body — staggered fade-in */}
          <div style={{ animation: !transitioning ? `tooltipContent 0.7s ${APPLE_EASE} 0.08s both` : 'none' }}>
            <h3 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '1.18rem', fontWeight: 800,
              color: 'var(--text-primary)', marginBottom: 8,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              {step.title}
            </h3>
            <p style={{
              fontSize: '0.875rem', color: 'var(--text-muted)',
              lineHeight: 1.65, marginBottom: 18,
            }}>
              {step.body}
            </p>
          </div>

          {/* Progress dots */}
          <div style={{
            display: 'flex', gap: 5, marginBottom: 18, justifyContent: 'center',
          }}>
            {steps.map((_, i) => (
              <span key={i} style={{
                width: i === idx ? 22 : 6,
                height: 6, borderRadius: 99,
                background: i === idx ? 'var(--teal)' : i < idx ? 'var(--teal-border)' : 'var(--border)',
                transition: `width 0.45s ${APPLE_EASE}, background 0.3s ease`,
              }} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={finish}
              style={{
                background: 'transparent',
                color: 'var(--text-soft)',
                padding: '9px 12px',
                borderRadius: 9, fontSize: '0.82rem', fontWeight: 600,
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-soft)'}
            >
              Skip tour
            </button>
            <div style={{ flex: 1 }} />
            {idx > 0 && (
              <button
                onClick={prev}
                className="btn-secondary"
                style={{ padding: '8px 13px' }}
              >
                <ChevronLeft size={13} strokeWidth={2.5} />
                Back
              </button>
            )}
            <button
              onClick={next}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
              }}
            >
              {idx === steps.length - 1 ? 'Got it!' : 'Next'}
              {idx !== steps.length - 1 && <ChevronRight size={13} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tourFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes tooltipEntrance {
          0%   { opacity: 0; transform: translateY(12px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tooltipContent {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes spotlightPulse {
          0%, 100% {
            box-shadow:
              0 0 0 9999px rgba(8, 18, 28, 0.72),
              0 0 0 2px rgba(255, 255, 255, 0.95),
              0 0 0 5px var(--teal),
              0 0 40px 6px rgba(20, 184, 184, 0.6),
              0 0 80px 12px rgba(20, 184, 184, 0.25);
          }
          50% {
            box-shadow:
              0 0 0 9999px rgba(8, 18, 28, 0.72),
              0 0 0 2px rgba(255, 255, 255, 1),
              0 0 0 5px var(--teal),
              0 0 56px 10px rgba(20, 184, 184, 0.85),
              0 0 100px 20px rgba(20, 184, 184, 0.4);
          }
        }
        @keyframes spotlightRing {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(1.04);
            opacity: 0.65;
          }
        }
      `}</style>
    </div>
  );
}
