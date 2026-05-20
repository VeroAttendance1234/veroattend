/**
 * CardTapDemo · pure-CSS 3D scene of an NFC card tapping the real wall-mounted
 * VERO RFID reader enclosure.
 *
 * Uses the actual 3D-printed enclosure render (public/RFIDREADER.png) as the
 * focal point. A stylised NFC card approaches from the right, taps the
 * reader's face, triggers a green success state and ripple bursts.
 *
 * 100% CSS animations · GPU-accelerated · ~3kb.
 */
export default function CardTapDemo({ size = 'lg' }) {
  const scale = { sm: 0.7, md: 0.85, lg: 1, xl: 1.2 }[size] || 1;
  const W = 460 * scale;
  const H = 460 * scale;

  return (
    <div
      style={{
        width: W, height: H,
        position: 'relative',
        margin: '0 auto',
        perspective: 1400,
        perspectiveOrigin: '50% 45%',
      }}
      aria-label="Animated demo of an NFC student card tapping the VERO wall-mounted reader"
    >
      <style>{`
        @keyframes cardApproach {
          0%   { transform: translate3d(180px, 0, 80px) rotateY(-28deg) rotateZ(-6deg); opacity: 0.85; }
          30%  { transform: translate3d(60px,  0, 60px) rotateY(-18deg) rotateZ(-3deg); opacity: 1; }
          42%  { transform: translate3d(10px,  0, 20px) rotateY(-6deg)  rotateZ(0deg);  }
          50%  { transform: translate3d(-2px,  0, 4px)  rotateY(-2deg)  rotateZ(0deg);  }
          58%  { transform: translate3d(10px,  0, 20px) rotateY(-6deg)  rotateZ(0deg);  }
          75%  { transform: translate3d(80px,  0, 60px) rotateY(-22deg) rotateZ(-4deg); opacity: 1; }
          100% { transform: translate3d(180px, 0, 80px) rotateY(-28deg) rotateZ(-6deg); opacity: 0.85; }
        }
        @keyframes readerGlow {
          0%, 38%, 70%, 100% { filter: drop-shadow(0 18px 28px rgba(15, 30, 40, 0.18)); }
          48%, 60%           { filter: drop-shadow(0 0 32px rgba(20,184,184,0.55))
                                       drop-shadow(0 18px 28px rgba(15, 30, 40, 0.18)); }
        }
        @keyframes nfcPulse {
          0%, 38%, 70%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
          45%                { opacity: 0.85; }
          85%                { opacity: 0; transform: translate(-50%, -50%) scale(3); }
        }
        @keyframes successPop {
          0%, 42%   { opacity: 0; transform: translate(-50%, 12px) scale(0.7); }
          50%       { opacity: 1; transform: translate(-50%, -2px) scale(1.08); }
          62%, 78%  { opacity: 1; transform: translate(-50%, 0)    scale(1); }
          90%, 100% { opacity: 0; transform: translate(-50%, -10px) scale(1); }
        }
        @keyframes floatScene {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes mountShadowBreathe {
          0%, 38%, 70%, 100% { opacity: 0.35; transform: translate(-50%, 0) scaleX(1);    }
          48%, 60%           { opacity: 0.6;  transform: translate(-50%, 0) scaleX(0.88); }
        }
      `}</style>

      {/* Gentle floating wrapper */}
      <div style={{
        position: 'absolute', inset: 0,
        animation: 'floatScene 5s ease-in-out infinite',
      }}>

        {/* ── Ambient teal glow behind reader ── */}
        <div style={{
          position: 'absolute',
          top:  '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width:  W * 0.7,
          height: H * 0.55,
          background: 'radial-gradient(ellipse, rgba(20,184,184,0.25) 0%, transparent 70%)',
          filter: 'blur(28px)',
          pointerEvents: 'none',
        }} />

        {/* ── Wall mount shadow under reader ── */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          width:  W * 0.45,
          height: 16,
          background: 'radial-gradient(ellipse, rgba(15,30,40,0.45) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(6px)',
          animation: 'mountShadowBreathe 4s ease-in-out infinite',
        }} />

        {/* ── Reader image (the real 3D-printed enclosure) ── */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width:  W * 0.55,
          height: H * 0.62,
          animation: 'readerGlow 4s ease-in-out infinite',
        }}>
          <img
            src="/RFIDREADER.png"
            alt="VERO wall-mounted RFID reader"
            style={{
              width: '100%', height: '100%',
              objectFit: 'contain',
              display: 'block',
              mixBlendMode: 'multiply', // drops any white halo into the page background
            }}
          />

          {/* NFC tap ripples · positioned over the wave glyph area on the reader */}
          {[0, 0.25, 0.5].map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '60%', left: '50%',
                width: 60 * scale, height: 60 * scale,
                borderRadius: '50%',
                border: '2.5px solid var(--teal)',
                pointerEvents: 'none',
                opacity: 0,
                animation: `nfcPulse 4s ${d}s ease-out infinite`,
                transformOrigin: 'center',
              }}
            />
          ))}
        </div>

        {/* ── The NFC card (approaches from the right) ── */}
        <div style={{
          position: 'absolute',
          top: '38%',
          left: '50%',
          marginLeft: -100 * scale,
          width:  200 * scale,
          height: 124 * scale,
          transformStyle: 'preserve-3d',
          animation: 'cardApproach 4s ease-in-out infinite',
          filter: 'drop-shadow(0 12px 18px rgba(15,30,40,0.28))',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #14B8B8 0%, #0F9898 55%, #14B8B8 100%)',
            boxShadow: `
              inset 0 -2px 0 rgba(0,0,0,0.18),
              inset 0 1px 0 rgba(255,255,255,0.22)
            `,
            border: '1px solid rgba(255,255,255,0.18)',
            position: 'relative',
            padding: 14 * scale,
            color: '#fff',
            overflow: 'hidden',
          }}>
            {/* Subtle holographic shimmer */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              animation: 'shimmer 5s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            {/* VERO branding */}
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: 20 * scale,
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              VERO<span style={{ opacity: 0.7 }}>.</span>
            </div>
            <div style={{
              fontSize: 7.5 * scale,
              fontWeight: 700,
              letterSpacing: '0.18em',
              opacity: 0.78,
              textTransform: 'uppercase',
            }}>
              Student · MIFARE 1K
            </div>

            {/* NFC chip */}
            <div style={{
              position: 'absolute',
              right: 16 * scale,
              top: 16 * scale,
              width: 26 * scale,
              height: 22 * scale,
              background: 'linear-gradient(135deg, #f4d06f 0%, #d4a843 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              display: 'grid',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: 1.5,
              padding: 2.5,
            }}>
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
            </div>

            {/* Name + ID */}
            <div style={{
              position: 'absolute',
              bottom: 12 * scale,
              left: 14 * scale,
              right: 14 * scale,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}>
              <div>
                <div style={{ fontSize: 7 * scale, opacity: 0.7, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Name
                </div>
                <div style={{ fontSize: 10 * scale, fontWeight: 700, lineHeight: 1.2 }}>
                  Aisha Patel
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 7 * scale, opacity: 0.7, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ID
                </div>
                <div style={{ fontSize: 9.5 * scale, fontWeight: 700, fontFamily: 'monospace' }}>
                  S001
                </div>
              </div>
            </div>

            {/* NFC wave glyph */}
            <svg
              viewBox="0 0 24 24"
              width={14 * scale} height={14 * scale}
              style={{ position: 'absolute', top: 42 * scale, left: 14 * scale, opacity: 0.45 }}
            >
              <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12 Q12 3 21 12" />
                <path d="M6 14 Q12 8 18 14" />
                <path d="M9 16 Q12 13 15 16" />
              </g>
            </svg>
          </div>
        </div>

        {/* ── Success badge that pops on contact ── */}
        <div style={{
          position: 'absolute',
          top: '4%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          background: 'var(--green)',
          color: '#fff',
          padding: '9px 18px',
          borderRadius: 99,
          fontSize: 13.5 * scale,
          fontWeight: 800,
          letterSpacing: '0.02em',
          boxShadow: '0 10px 26px rgba(22,163,74,0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          opacity: 0,
          animation: 'successPop 4s ease-in-out infinite',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <svg width={15 * scale} height={15 * scale} viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5"
              stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aisha Patel · checked in
        </div>
      </div>

      {/* Shimmer keyframe (scoped to the card) */}
      <style>{`
        @keyframes shimmer {
          0%, 25% { transform: translateX(-100%); }
          50%     { transform: translateX(100%);  }
          50.01%, 100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
