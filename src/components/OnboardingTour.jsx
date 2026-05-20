import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, X, Sparkles } from 'lucide-react';

/**
 * OnboardingTour — guided first-visit walkthrough.
 *
 * Spotlights a sequence of elements using their `data-tour="<id>"` attribute,
 * shows a tooltip next to each one, and remembers completion in localStorage.
 *
 * Usage:
 *   <OnboardingTour storageKey="vero.tour.admin.v1" steps={STEPS} />
 *
 * Each step:
 *   {
 *     target:   'tour-id' | null  (null = centered hero)
 *     title:    'Welcome to VERO'
 *     body:     'Short paragraph describing the feature.'
 *     placement?: 'top' | 'bottom' | 'auto' (defaults to auto)
 *   }
 */
export default function OnboardingTour({ steps, storageKey, forceOpen, onClose }) {
  const [open, setOpen] = useState(false);
  const [idx,  setIdx]  = useState(0);
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0, placement: 'bottom' });
  const tooltipRef = useRef(null);

  /* Open on first visit (or when forced) */
  useEffect(() => {
    if (forceOpen) { setOpen(true); setIdx(0); return; }
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 700); // gentle delay
      return () => clearTimeout(t);
    }
  }, [storageKey, forceOpen]);

  /* Compute target rectangle + tooltip position whenever step changes */
  useLayoutEffect(() => {
    if (!open) return;
    const step = steps[idx];
    if (!step?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    // Scroll into view first
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    // Give scroll a moment, then read rect
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });

      // Decide tooltip placement
      const tt = tooltipRef.current?.getBoundingClientRect();
      const tooltipH = tt?.height ?? 160;
      const tooltipW = tt?.width  ?? 340;
      const spaceBelow = window.innerHeight - r.bottom;
      const spaceAbove = r.top;
      const placement = step.placement ?? (spaceBelow > tooltipH + 30 ? 'bottom' : 'top');

      let top  = placement === 'bottom' ? r.bottom + 14 : r.top - tooltipH - 14;
      let left = r.left + r.width / 2 - tooltipW / 2;
      // Keep on-screen
      left = Math.max(12, Math.min(left, window.innerWidth - tooltipW - 12));
      top  = Math.max(12, top);
      setTooltipPos({ top, left, placement });
    }, 320);
    return () => clearTimeout(t);
  }, [open, idx, steps]);

  /* Close on Esc */
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

  /* Lock body scroll while open */
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
  function prev() {
    if (idx > 0) setIdx(idx - 1);
  }
  function finish() {
    localStorage.setItem(storageKey, '1');
    setOpen(false);
    setIdx(0);
    onClose?.();
  }

  if (!open) return null;
  const step = steps[idx];
  const isCenter = !step.target || !rect;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        animation: 'fadeIn 0.18s ease',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={finish}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15, 30, 40, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Spotlight cutout via box-shadow trick */}
      {rect && (
        <div
          style={{
            position: 'absolute',
            top: rect.top - 8,
            left: rect.left - 8,
            width: rect.width + 16,
            height: rect.height + 16,
            borderRadius: 16,
            boxShadow: '0 0 0 9999px rgba(15, 30, 40, 0.55), 0 0 0 3px var(--teal), 0 0 30px rgba(20,184,184,0.4)',
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        style={isCenter ? {
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(92vw, 440px)',
        } : {
          position: 'absolute',
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 'min(92vw, 340px)',
          transition: 'top 0.3s cubic-bezier(0.16, 1, 0.3, 1), left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 16,
            padding: '20px 22px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
            border: '1px solid var(--border)',
            position: 'relative',
            animation: 'tooltipIn 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'var(--teal-glow)', color: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Sparkles size={14} strokeWidth={2.4} />
            </div>
            <span style={{
              fontSize: '0.66rem', fontWeight: 800,
              color: 'var(--teal)', textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              Step {idx + 1} of {steps.length}
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={finish}
              aria-label="Skip tour"
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'transparent', color: 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          </div>

          {/* Body */}
          <h3 style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '1.1rem', fontWeight: 800,
            color: 'var(--text-primary)', marginBottom: 6,
            letterSpacing: '-0.015em',
          }}>
            {step.title}
          </h3>
          <p style={{
            fontSize: '0.86rem', color: 'var(--text-muted)',
            lineHeight: 1.6, marginBottom: 16,
          }}>
            {step.body}
          </p>

          {/* Progress dots */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 16, justifyContent: 'center',
          }}>
            {steps.map((_, i) => (
              <span key={i} style={{
                width: i === idx ? 18 : 6,
                height: 6, borderRadius: 99,
                background: i === idx ? 'var(--teal)' : i < idx ? 'var(--teal-border)' : 'var(--border)',
                transition: 'all 0.2s ease',
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
                padding: '8px 12px',
                borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
              }}
            >
              Skip tour
            </button>
            <div style={{ flex: 1 }} />
            {idx > 0 && (
              <button
                onClick={prev}
                className="btn-secondary"
                style={{ padding: '7px 12px' }}
              >
                <ChevronLeft size={13} strokeWidth={2.5} />
                Back
              </button>
            )}
            <button
              onClick={next}
              className="btn-primary"
              style={{ padding: '7px 14px' }}
            >
              {idx === steps.length - 1 ? 'Got it!' : 'Next'}
              {idx !== steps.length - 1 && <ChevronRight size={13} strokeWidth={2.5} />}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
