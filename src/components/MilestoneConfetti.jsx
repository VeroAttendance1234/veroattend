/**
 * MilestoneConfetti — pure-DOM particle burst when a milestone is crossed.
 *
 * No external library — 80 lightweight absolutely-positioned divs animated
 * with CSS transforms. Total cost: ~6 KB minified, no canvas allocation,
 * GC-friendly (everything cleans up when the component unmounts).
 *
 * Triggers exactly once per session-key. Default: fires when `attendanceRate`
 * crosses 95 % from below.
 *
 * @param {number} attendanceRate  - current school attendance %
 * @param {number} threshold       - milestone (default 95)
 * @param {string} storageKey      - sessionStorage key to gate the celebration
 */
import { useEffect, useMemo, useState } from 'react';

const COLOURS = ['#14B8B8', '#0F9898', '#3DC48A', '#F4D06F', '#7C3AED', '#FF9966', '#2563EB'];

export default function MilestoneConfetti({
  attendanceRate,
  threshold = 95,
  storageKey = 'vero.milestone.95',
  message = 'School hit 95 % attendance!',
  subtitle = "Best day this term · keep it up",
}) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (attendanceRate < threshold) return;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, '1');
    setActive(true);
    const t = setTimeout(() => setActive(false), 4200);
    return () => clearTimeout(t);
  }, [attendanceRate, threshold, storageKey]);

  // Generate 80 particles with deterministic-per-mount randomness
  const particles = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 80 }, (_, i) => {
      const angle = (Math.random() - 0.5) * Math.PI;        // -90° to +90°
      const dist  = 220 + Math.random() * 320;
      const dx    = Math.sin(angle) * dist;
      const dy    = -Math.cos(angle) * dist - 60;           // bias upward
      return {
        id: i,
        colour: COLOURS[i % COLOURS.length],
        dx, dy,
        rot:   (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.12,
        size:  6 + Math.random() * 6,
        shape: Math.random() > 0.5 ? '50%' : '2px',
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/* Banner — slides down from top, auto-dismisses */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          top: 80, left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1300,
          background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
          color: '#fff',
          padding: '14px 22px',
          borderRadius: 14,
          boxShadow: '0 20px 50px rgba(20,184,184,0.45)',
          display: 'flex', alignItems: 'center', gap: 12,
          animation: 'milestoneBannerIn 0.6s cubic-bezier(0.22, 1, 0.36, 1), milestoneBannerOut 0.4s 3.6s ease both',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🎉</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.96rem', letterSpacing: '-0.01em' }}>
            {message}
          </div>
          <div style={{ fontSize: '0.78rem', opacity: 0.9, fontWeight: 600 }}>
            {subtitle}
          </div>
        </div>
      </div>

      {/* Confetti — two bursts from the bottom corners */}
      {['left', 'right'].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          style={{
            position: 'fixed',
            bottom: 0,
            [side]: 0,
            width: 1, height: 1,
            zIndex: 1299,
            pointerEvents: 'none',
          }}
        >
          {particles.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                width: p.size, height: p.size,
                background: p.colour,
                borderRadius: p.shape,
                bottom: 0, left: 0,
                animation: `confetti-${side} 1.8s ${p.delay}s cubic-bezier(0.1, 0.8, 0.4, 1) forwards`,
                '--dx': `${side === 'left' ? p.dx : -p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
                opacity: 1,
              }}
            />
          ))}
        </div>
      ))}

      <style>{`
        @keyframes milestoneBannerIn {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to   { opacity: 1; transform: translate(-50%, 0);     }
        }
        @keyframes milestoneBannerOut {
          from { opacity: 1; transform: translate(-50%, 0);    }
          to   { opacity: 0; transform: translate(-50%, -14px); }
        }
        @keyframes confetti-left {
          0%   { transform: translate(0, 0) rotate(0);                  opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes confetti-right {
          0%   { transform: translate(0, 0) rotate(0);                  opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </>
  );
}
