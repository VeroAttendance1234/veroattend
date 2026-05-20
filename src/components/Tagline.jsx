/**
 * Tagline — VERO's "Attendance. Made Real." tagline.
 *
 * Design: stacked, modern, bold typography. No script font.
 * "Attendance." in charcoal, "Made Real." in brand teal with a filled
 * accent dot. Each word fades + slides in with stagger on first paint.
 *
 * Inspired by editorial portfolio sites — Linear, Vercel, Stripe.
 *
 * @param {string} size      – 'sm' | 'md' | 'lg' | 'xl' | 'hero'
 * @param {bool}   inline    – render on a single line (small contexts)
 * @param {bool}   muted     – low-emphasis variant (footer, etc)
 */
export default function Tagline({ size = 'md', inline = false, muted = false, style }) {
  const sizes = {
    sm:   { font: '0.95rem',  gap: 0,     line: 1.15 },
    md:   { font: '1.4rem',   gap: 2,     line: 1.05 },
    lg:   { font: '2.2rem',   gap: 4,     line: 1.02 },
    xl:   { font: '3rem',     gap: 6,     line: 1.0 },
    hero: { font: '4.2rem',   gap: 8,     line: 0.96 },
  }[size] || { font: '1.4rem', gap: 2, line: 1.05 };

  const charcoal = muted ? 'var(--text-soft)' : 'var(--text-primary)';
  const tealCol  = muted ? 'var(--text-muted)' : 'var(--teal)';

  if (inline) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.4em',
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800,
        fontSize: sizes.font,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        ...style,
      }}>
        <span style={{ color: charcoal, animation: 'taglineWordIn 0.55s cubic-bezier(0.32,0.72,0,1) both' }}>
          Attendance.
        </span>
        <span style={{
          color: tealCol,
          animation: 'taglineWordIn 0.55s 0.12s cubic-bezier(0.32,0.72,0,1) both',
        }}>
          Made Real<AccentDot colour={tealCol} />
        </span>

        <style>{taglineKeyframes}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: sizes.gap,
      fontFamily: 'Bricolage Grotesque, sans-serif',
      fontWeight: 800,
      fontSize: sizes.font,
      letterSpacing: '-0.035em',
      lineHeight: sizes.line,
      ...style,
    }}>
      <span style={{
        color: charcoal,
        animation: 'taglineWordIn 0.6s cubic-bezier(0.32,0.72,0,1) both',
      }}>
        Attendance.
      </span>
      <span style={{
        color: tealCol,
        animation: 'taglineWordIn 0.6s 0.13s cubic-bezier(0.32,0.72,0,1) both',
        display: 'inline-flex', alignItems: 'baseline',
      }}>
        Made Real<AccentDot colour={tealCol} size={sizes.font} />
      </span>

      <style>{taglineKeyframes}</style>
    </div>
  );
}

/* The accent dot — a filled circle slightly larger than a period for personality */
function AccentDot({ colour, size = '1rem' }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width:  '0.32em',
        height: '0.32em',
        borderRadius: '50%',
        background: colour,
        marginLeft: '0.06em',
        marginBottom: '0.08em',
        flexShrink: 0,
        animation: 'taglineDotPop 0.5s 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        boxShadow: `0 0 12px ${colour}50`,
      }}
    />
  );
}

const taglineKeyframes = `
  @keyframes taglineWordIn {
    from { opacity: 0; transform: translate3d(0, 18px, 0); }
    to   { opacity: 1; transform: translate3d(0, 0, 0); }
  }
  @keyframes taglineDotPop {
    0%   { opacity: 0; transform: scale(0); }
    60%  { opacity: 1; transform: scale(1.35); }
    100% { opacity: 1; transform: scale(1); }
  }
`;
