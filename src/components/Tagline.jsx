/**
 * Tagline — VERO's "Attendance. Made Real" tagline.
 *
 * Replaces the old PNG with crisp CSS typography:
 *  - "Attendance." in Bricolage Grotesque (bold, charcoal) — matches headings
 *  - "Made Real" in Caveat (handwritten script) with animated teal gradient
 *  - Subtle continuous shimmer sweep across "Made Real" — draws the eye
 *    without being distracting
 *  - Scales sharp at any size, themeable, lightweight (no PNG load)
 *
 * @param {string} size  – 'sm' | 'md' | 'lg' | 'xl' (default 'md')
 * @param {bool}   center  – text-align: center
 */
export default function Tagline({ size = 'md', center = true, style }) {
  const sizes = {
    sm: { primary: '0.95rem',  script: '1.4rem',  underline: 2  },
    md: { primary: '1.15rem',  script: '1.75rem', underline: 2  },
    lg: { primary: '1.55rem',  script: '2.4rem',  underline: 3  },
    xl: { primary: '2rem',     script: '3.1rem',  underline: 3.5 },
  }[size] || { primary: '1.15rem', script: '1.75rem', underline: 2 };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: '0.35em',
        textAlign: center ? 'center' : 'left',
        lineHeight: 1.1,
        ...style,
      }}
    >
      <span style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800,
        fontSize: sizes.primary,
        color: 'var(--text-primary)',
        letterSpacing: '-0.025em',
      }}>
        Attendance.
      </span>

      <span style={{
        position: 'relative',
        fontFamily: 'Caveat, cursive',
        fontWeight: 700,
        fontSize: sizes.script,
        background: 'linear-gradient(90deg, var(--teal) 0%, var(--teal-dark) 45%, #1FD8D8 55%, var(--teal-dark) 90%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        lineHeight: 1,
        transform: 'rotate(-2deg) translateY(0.05em)',
        animation: 'taglineShimmer 6s ease-in-out infinite',
        display: 'inline-block',
        paddingBottom: '0.08em',
      }}>
        Made Real
        {/* Hand-drawn underline */}
        <svg
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            bottom: '-0.15em',
            left: '0%',
            width: '100%',
            height: '0.45em',
            overflow: 'visible',
          }}
        >
          <path
            d="M 4 6 Q 50 11 100 5 T 196 7"
            fill="none"
            stroke="var(--teal)"
            strokeWidth={sizes.underline}
            strokeLinecap="round"
            style={{
              strokeDasharray: 220,
              strokeDashoffset: 220,
              animation: 'taglineDraw 1.4s 0.4s cubic-bezier(0.32, 0.72, 0, 1) forwards',
            }}
          />
        </svg>
      </span>

      <style>{`
        @keyframes taglineShimmer {
          0%, 100% { background-position: 200% 0; }
          50%      { background-position: -200% 0; }
        }
        @keyframes taglineDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}
