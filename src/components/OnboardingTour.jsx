import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

/**
 * OnboardingTour — Apple-style guided walkthrough.
 *
 * Selective-blur architecture:
 *   The classic "single backdrop + blur" approach blurs EVERYTHING, including
 *   the focus point. To keep the spotlighted element crisp, we render the
 *   dim+blur as FOUR STRIPS around the spotlight rect (top, bottom, left, right).
 *   The cutout area itself has nothing covering it — so the highlighted element
 *   is rendered at full clarity, while the rest of the page is softly blurred.
 *
 *   All strip dimensions animate with the same cubic-bezier, so when stepping
 *   between targets the cutout smoothly expands/contracts/translates as a
 *   single coherent motion (no flash, no two-stage fade).
 */
export default function OnboardingTour({ steps, storageKey, forceOpen, onClose }) {
  const [open, setOpen] = useState(false);
  const [idx,  setIdx]  = useState(0);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth  : 1200);
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const tooltipRef = useRef(null);

  /* Open on fresh visit (or when forced). sessionStorage means it shows
     again on a new tab/refresh, but not when toggling roles. */
  useEffect(() => {
    if (forceOpen) { setOpen(true); setIdx(0); return; }
    const skipped = sessionStorage.getItem(storageKey);
    if (!skipped) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [storageKey, forceOpen]);

  /* Track viewport size — strips depend on it */
  useEffect(() => {
    function onResize() { setVw(window.innerWidth); setVh(window.innerHeight); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* When step changes: compute the FUTURE position of the target (where it
     will land after we scroll) and apply it immediately. The spotlight + tooltip
     start sliding at t=0 in parallel with the page's smooth scroll, so they
     all land in sync ~500-700ms later. No 500ms lag-then-jump. */
  useLayoutEffect(() => {
    if (!open) return;
    const step = steps[idx];
    if (!step?.target) {
      setRect(null);
      return;
    }

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) { setRect(null); return; }

    /* 1. Measure where the element CURRENTLY is */
    const elRect = el.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const elemAbsY       = elRect.top + currentScrollY;
    const maxScroll      = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    /* 2. Where do we want to scroll to so the element is centred? */
    const desiredScrollY = elemAbsY - (window.innerHeight / 2) + (elRect.height / 2);
    const targetScrollY  = Math.max(0, Math.min(maxScroll, desiredScrollY));

    /* 3. After the scroll completes, the element will be at this viewport-Y */
    const futureTop = elemAbsY - targetScrollY;

    /* 4. Apply the FUTURE position now — spotlight + strips smoothly tween */
    const futureRect = {
      top:    futureTop,
      left:   elRect.left,
      width:  elRect.width,
      height: elRect.height,
    };
    setRect(futureRect);

    /* 5. Position the tooltip based on the FUTURE rect */
    const tt = tooltipRef.current?.getBoundingClientRect();
    const tooltipH = tt?.height ?? 220;
    const tooltipW = tt?.width  ?? 360;
    const spaceBelow = window.innerHeight - (futureRect.top + futureRect.height);
    const spaceAbove = futureRect.top;
    const placeBottom = spaceBelow > tooltipH + 30 || spaceAbove < tooltipH + 30;

    let top  = placeBottom
      ? futureRect.top + futureRect.height + 22
      : futureRect.top - tooltipH - 22;
    let left = futureRect.left + futureRect.width / 2 - tooltipW / 2;
    left = Math.max(16, Math.min(left, window.innerWidth  - tooltipW - 16));
    top  = Math.max(16, Math.min(top,  window.innerHeight - tooltipH - 16));
    setTooltipPos({ top, left });

    /* 6. Start the page scroll at the SAME instant — runs in parallel */
    window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
  }, [open, idx, steps]);

  /* Keyboard */
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      else if (e.key === 'ArrowLeft') prev();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, idx]);

  /* Lock body scroll */
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
    sessionStorage.setItem(storageKey, '1');
    setOpen(false);
    setIdx(0);
    onClose?.();
  }

  if (!open) return null;
  const step = steps[idx];
  const isCenter = !step.target || !rect;

  /* Apple's signature easing */
  const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const D    = '0.7s';

  /* Strip styles — share transition for synchronised motion */
  const stripBase = {
    position: 'fixed',
    background: 'rgba(8, 18, 28, 0.45)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    transition: `top ${D} ${EASE}, left ${D} ${EASE}, width ${D} ${EASE}, height ${D} ${EASE}, opacity 0.35s ${EASE}`,
    pointerEvents: 'auto',
  };

  /* Spotlight dimensions with breathing room */
  const padding = 10;
  const spotTop    = rect ? rect.top    - padding : 0;
  const spotLeft   = rect ? rect.left   - padding : 0;
  const spotWidth  = rect ? rect.width  + padding * 2 : 0;
  const spotHeight = rect ? rect.height + padding * 2 : 0;
  const spotBottom = spotTop + spotHeight;
  const spotRight  = spotLeft + spotWidth;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000,
      animation: 'tourFadeIn 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>
      {/* ── Click-anywhere-to-close hit area ─── */}
      <div
        onClick={finish}
        style={{ position: 'fixed', inset: 0, zIndex: 1 }}
      />

      {/* ── Selective-blur strips ──
            When rect is null (center step), we render ONE full overlay.
            Otherwise four strips frame the cutout — leaving the focus crisp. */}
      {isCenter ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2,
          background: 'rgba(8, 18, 28, 0.55)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          transition: `opacity 0.4s ${EASE}`,
        }} />
      ) : (
        <>
          {/* TOP */}
          <div style={{ ...stripBase, zIndex: 2,
            top: 0, left: 0, width: '100vw', height: Math.max(0, spotTop) }} />
          {/* BOTTOM */}
          <div style={{ ...stripBase, zIndex: 2,
            top: spotBottom, left: 0, width: '100vw', height: Math.max(0, vh - spotBottom) }} />
          {/* LEFT */}
          <div style={{ ...stripBase, zIndex: 2,
            top: spotTop, left: 0, width: Math.max(0, spotLeft), height: Math.max(0, spotHeight) }} />
          {/* RIGHT */}
          <div style={{ ...stripBase, zIndex: 2,
            top: spotTop, left: spotRight, width: Math.max(0, vw - spotRight), height: Math.max(0, spotHeight) }} />
        </>
      )}

      {/* ── Spotlight border + glow (sits on top of the cutout) ─── */}
      {rect && (
        <>
          {/* Animated glow halo */}
          <div
            style={{
              position: 'fixed', zIndex: 3,
              top: spotTop, left: spotLeft, width: spotWidth, height: spotHeight,
              borderRadius: 18,
              boxShadow: `
                0 0 0 2px rgba(255, 255, 255, 0.95),
                0 0 0 5px var(--teal),
                0 0 36px 6px rgba(20, 184, 184, 0.5),
                0 0 72px 12px rgba(20, 184, 184, 0.22)
              `,
              pointerEvents: 'none',
              transition: `top ${D} ${EASE}, left ${D} ${EASE}, width ${D} ${EASE}, height ${D} ${EASE}`,
              animation: 'spotPulse 2.6s ease-in-out infinite',
            }}
          />
          {/* Outer pulsing ring */}
          <div
            style={{
              position: 'fixed', zIndex: 3,
              top:  spotTop  - 8,
              left: spotLeft - 8,
              width:  spotWidth  + 16,
              height: spotHeight + 16,
              borderRadius: 22,
              border: '1.5px solid rgba(20, 184, 184, 0.4)',
              pointerEvents: 'none',
              transformOrigin: 'center center',
              transition: `top ${D} ${EASE}, left ${D} ${EASE}, width ${D} ${EASE}, height ${D} ${EASE}`,
              animation: 'spotRing 2.6s ease-in-out infinite',
            }}
          />
        </>
      )}

      {/* ── Tooltip card ── */}
      <div
        key={idx /* re-mount per step → fresh entrance, no morph */}
        ref={tooltipRef}
        style={isCenter ? {
          position: 'fixed', zIndex: 4,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 460px)',
        } : {
          position: 'fixed', zIndex: 4,
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 'min(92vw, 360px)',
          transition: `top ${D} ${EASE}, left ${D} ${EASE}`,
        }}
      >
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 18,
            padding: '22px 24px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35), 0 4px 16px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            animation: `tooltipEntrance 0.55s ${EASE}`,
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

          {/* Body */}
          <div style={{ animation: `tooltipContent 0.6s ${EASE} 0.08s both` }}>
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
                transition: `width 0.5s ${EASE}, background 0.3s ease`,
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
          0%   { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes tooltipContent {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0);   }
        }
        @keyframes spotPulse {
          0%, 100% {
            box-shadow:
              0 0 0 2px rgba(255, 255, 255, 0.95),
              0 0 0 5px var(--teal),
              0 0 36px 6px rgba(20, 184, 184, 0.5),
              0 0 72px 12px rgba(20, 184, 184, 0.22);
          }
          50% {
            box-shadow:
              0 0 0 2px rgba(255, 255, 255, 1),
              0 0 0 5px var(--teal),
              0 0 52px 9px rgba(20, 184, 184, 0.8),
              0 0 96px 18px rgba(20, 184, 184, 0.36);
          }
        }
        @keyframes spotRing {
          0%, 100% { transform: scale(1);    opacity: 0.4; }
          50%      { transform: scale(1.04); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
