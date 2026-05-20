/**
 * Tagline · VERO's "ATTENDANCE. MADE REAL." tagline.
 *
 * Designed to visually match the VERO. wordmark: bold uppercase sans-serif
 * with tight letter-spacing and a teal accent period. Renders as one tight
 * unit so it always feels coherent with the logo above it.
 *
 * @param {string} size      'sm' | 'md' | 'lg' | 'xl' | 'hero'
 * @param {bool}   stacked   render on two lines (default false = single line)
 * @param {bool}   muted     low-emphasis (footer)
 */
export default function Tagline({ size = 'md', stacked = false, muted = false, style }) {
  const sizes = {
    sm:   { font: '0.72rem',  tracking: '0.16em', dot: '0.28em' },
    md:   { font: '0.95rem',  tracking: '0.18em', dot: '0.3em'  },
    lg:   { font: '1.25rem',  tracking: '0.2em',  dot: '0.3em'  },
    xl:   { font: '1.6rem',   tracking: '0.22em', dot: '0.3em'  },
    hero: { font: '2rem',     tracking: '0.24em', dot: '0.32em' },
  }[size] || { font: '0.95rem', tracking: '0.18em', dot: '0.3em' };

  const primary = muted ? 'var(--text-soft)' : 'var(--text-primary)';
  const accent  = muted ? 'var(--text-muted)' : 'var(--teal)';

  const dotStyle = {
    display: 'inline-block',
    width:  sizes.dot,
    height: sizes.dot,
    borderRadius: '50%',
    background: accent,
    marginLeft: '0.05em',
    verticalAlign: 'baseline',
    transform: 'translateY(0.05em)',
    boxShadow: muted ? 'none' : `0 0 10px ${accent}55`,
    animation: 'taglineDotPop 0.45s 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  };

  const wordStyle = {
    fontFamily: 'Bricolage Grotesque, sans-serif',
    fontWeight: 800,
    fontSize: sizes.font,
    letterSpacing: sizes.tracking,
    textTransform: 'uppercase',
    color: primary,
    lineHeight: 1,
    animation: 'taglineWordIn 0.5s cubic-bezier(0.32,0.72,0,1) both',
  };

  const accentStyle = {
    ...wordStyle,
    color: accent,
    animation: 'taglineWordIn 0.5s 0.1s cubic-bezier(0.32,0.72,0,1) both',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'flex-start' : 'baseline',
        gap: stacked ? '0.45em' : '0.55em',
        ...style,
      }}
    >
      <span style={wordStyle}>ATTENDANCE<span style={dotStyle} /></span>
      <span style={accentStyle}>MADE REAL<span style={dotStyle} /></span>

      <style>{`
        @keyframes taglineWordIn {
          from { opacity: 0; transform: translate3d(0, 8px, 0); }
          to   { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        @keyframes taglineDotPop {
          0%   { opacity: 0; transform: translateY(0.05em) scale(0); }
          60%  { opacity: 1; transform: translateY(0.05em) scale(1.4); }
          100% { opacity: 1; transform: translateY(0.05em) scale(1); }
        }
      `}</style>
    </div>
  );
}
