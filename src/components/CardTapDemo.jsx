/**
 * CardTapDemo · pure-CSS 3D animation of an NFC card tapping the ACR122U reader.
 *
 * Uses CSS 3D transforms (perspective + translateZ + rotateX/Y) and keyframe
 * animations. No libraries, no canvas — buttery smooth and ~2kb of CSS.
 *
 * Scene:
 *   · Reader sits flat on the ground with a subtle shadow
 *   · Card floats in above, rotates gently, descends to tap
 *   · On contact: reader LED flashes green, ripple bursts upward
 *   · Loops continuously (4s cycle)
 */
export default function CardTapDemo({ size = 'lg' }) {
  const scale = { sm: 0.7, md: 0.85, lg: 1, xl: 1.2 }[size] || 1;

  return (
    <div
      style={{
        width:  `${380 * scale}px`,
        height: `${380 * scale}px`,
        perspective: 1200,
        perspectiveOrigin: '50% 30%',
        position: 'relative',
        margin: '0 auto',
      }}
      aria-label="Animated demo of an NFC card tapping the reader"
    >
      <style>{`
        @keyframes cardOrbit {
          0%   { transform: translate3d(0, -160px, 60px) rotateX(60deg) rotateZ(-8deg); }
          35%  { transform: translate3d(0, -40px,  10px) rotateX(70deg) rotateZ(2deg);  }
          45%  { transform: translate3d(0, -8px,    2px) rotateX(75deg) rotateZ(0deg);  }
          55%  { transform: translate3d(0, -8px,    2px) rotateX(75deg) rotateZ(0deg);  }
          65%  { transform: translate3d(0, -40px,  10px) rotateX(70deg) rotateZ(-2deg); }
          100% { transform: translate3d(0, -160px, 60px) rotateX(60deg) rotateZ(-8deg); }
        }
        @keyframes readerFlash {
          0%, 40%, 70%, 100% { background: #0F2030; box-shadow: inset 0 -2px 0 rgba(255,255,255,0.04), 0 30px 50px -20px rgba(20,184,184,0); }
          45%, 60%           { background: #112a3c; box-shadow: inset 0 -2px 0 rgba(255,255,255,0.04), 0 30px 70px -10px rgba(20,184,184,0.6); }
        }
        @keyframes ledPulse {
          0%, 40%, 70%, 100% { background: #DC2626; box-shadow: 0 0 6px rgba(220,38,38,0.5); }
          45%, 60%           { background: #16A34A; box-shadow: 0 0 18px rgba(22,163,74,0.95), 0 0 38px rgba(22,163,74,0.5); }
        }
        @keyframes ripple {
          0%, 40% { opacity: 0; transform: translate(-50%, -50%) scale(0.6); }
          45%     { opacity: 0.9; }
          85%     { opacity: 0;   transform: translate(-50%, -50%) scale(2.4); }
          100%    { opacity: 0;   transform: translate(-50%, -50%) scale(2.6); }
        }
        @keyframes shadowPulse {
          0%, 40%, 70%, 100% { opacity: 0.35; transform: translate(-50%, 0) scale(1);   }
          45%, 60%           { opacity: 0.55; transform: translate(-50%, 0) scale(0.85);}
        }
        @keyframes floatScene {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes successBadge {
          0%, 42% { opacity: 0; transform: translate(-50%, 6px) scale(0.6); }
          50%     { opacity: 1; transform: translate(-50%, -2px) scale(1.08); }
          62%     { opacity: 1; transform: translate(-50%, 0)    scale(1); }
          75%     { opacity: 1; transform: translate(-50%, 0)    scale(1); }
          85%     { opacity: 0; transform: translate(-50%, -10px) scale(1); }
          100%    { opacity: 0; transform: translate(-50%, -10px) scale(1); }
        }
      `}</style>

      {/* Scene wrapper · gentle float so it feels alive */}
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        animation: 'floatScene 4.8s ease-in-out infinite',
      }}>

        {/* ── Ground shadow ── */}
        <div style={{
          position: 'absolute',
          bottom: '24%',
          left: '50%',
          width: 200 * scale,
          height: 28 * scale,
          background: 'radial-gradient(ellipse, rgba(15,30,40,0.55) 0%, transparent 65%)',
          borderRadius: '50%',
          filter: 'blur(8px)',
          animation: 'shadowPulse 4s ease-in-out infinite',
        }} />

        {/* ── Reader (ACR122U-style) ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '12%',
          transform: 'translateX(-50%) rotateX(70deg)',
          transformStyle: 'preserve-3d',
          width: 220 * scale,
          height: 130 * scale,
        }}>
          {/* Top face */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1a2f42 0%, #0F2030 60%, #0a1822 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 -2px 0 rgba(255,255,255,0.04), 0 30px 50px -20px rgba(20,184,184,0)',
            position: 'relative',
            animation: 'readerFlash 4s ease-in-out infinite',
            transformStyle: 'preserve-3d',
          }}>
            {/* Brand text on reader */}
            <div style={{
              position: 'absolute',
              top: 14, left: 18,
              color: 'rgba(255,255,255,0.55)',
              fontSize: 9 * scale,
              fontWeight: 800,
              letterSpacing: '0.18em',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}>
              ACR122U · NFC READER
            </div>

            {/* Status LED */}
            <div style={{
              position: 'absolute',
              top: 16, right: 18,
              width: 8 * scale, height: 8 * scale,
              borderRadius: '50%',
              animation: 'ledPulse 4s ease-in-out infinite',
            }} />

            {/* Antenna coil indicator (concentric rings) */}
            <div style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 60 * scale, height: 60 * scale,
              borderRadius: '50%',
              border: '1.5px solid rgba(20,184,184,0.35)',
            }}>
              <div style={{
                position: 'absolute', inset: 8,
                borderRadius: '50%',
                border: '1.5px solid rgba(20,184,184,0.25)',
              }}>
                <div style={{
                  position: 'absolute', inset: 8,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(20,184,184,0.18)',
                }} />
              </div>
            </div>

            {/* USB cable hint */}
            <div style={{
              position: 'absolute',
              bottom: -3, right: 28,
              width: 12 * scale, height: 8 * scale,
              background: '#0a1822',
              borderRadius: '2px 2px 0 0',
            }} />
          </div>

          {/* ── Ripple bursts (3 staggered) ── */}
          {[0, 0.3, 0.6].map((d, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: 80 * scale, height: 80 * scale,
              borderRadius: '50%',
              border: '2px solid var(--teal)',
              pointerEvents: 'none',
              opacity: 0,
              animation: `ripple 4s ${d}s ease-out infinite`,
              transformOrigin: 'center',
            }} />
          ))}
        </div>

        {/* ── NFC card (floats + descends) ── */}
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '20%',
          marginLeft: -90 * scale,
          width: 180 * scale,
          height: 110 * scale,
          transformStyle: 'preserve-3d',
          animation: 'cardOrbit 4s ease-in-out infinite',
        }}>
          {/* Card body */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 14,
            background: `
              linear-gradient(135deg, var(--teal) 0%, #0F9898 50%, #14B8B8 100%)
            `,
            boxShadow: `
              0 8px 22px rgba(15,30,40,0.32),
              inset 0 -2px 0 rgba(0,0,0,0.15),
              inset 0 1px 0 rgba(255,255,255,0.18)
            `,
            border: '1px solid rgba(255,255,255,0.18)',
            position: 'relative',
            padding: 14 * scale,
            color: '#fff',
          }}>
            {/* VERO branding on card */}
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800,
              fontSize: 18 * scale,
              letterSpacing: '0.04em',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              VERO<span style={{ opacity: 0.6 }}>.</span>
            </div>
            <div style={{
              fontSize: 7 * scale,
              fontWeight: 700,
              letterSpacing: '0.15em',
              opacity: 0.75,
              textTransform: 'uppercase',
            }}>
              Student Access · MIFARE 1K
            </div>

            {/* NFC chip detail (gold square + lines) */}
            <div style={{
              position: 'absolute',
              right: 14 * scale,
              top: 14 * scale,
              width: 22 * scale,
              height: 18 * scale,
              background: 'linear-gradient(135deg, #f4d06f 0%, #d4a843 100%)',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.15)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
              display: 'grid',
              gridTemplateRows: '1fr 1fr 1fr',
              gap: 1.5,
              padding: 2,
            }}>
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
              <div style={{ background: 'rgba(0,0,0,0.18)', borderRadius: 1 }} />
            </div>

            {/* Student ID + name strip */}
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
                <div style={{ fontSize: 7 * scale, opacity: 0.65, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  Name
                </div>
                <div style={{ fontSize: 9.5 * scale, fontWeight: 700, lineHeight: 1.2 }}>
                  Aisha Patel
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 7 * scale, opacity: 0.65, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  ID
                </div>
                <div style={{ fontSize: 9 * scale, fontWeight: 700, fontFamily: 'monospace' }}>
                  S001
                </div>
              </div>
            </div>

            {/* NFC wave glyph (subtle, top-left under brand) */}
            <svg
              viewBox="0 0 24 24" width={12 * scale} height={12 * scale}
              style={{ position: 'absolute', top: 38 * scale, left: 14 * scale, opacity: 0.4 }}
            >
              <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                <path d="M3 12 Q12 3 21 12" />
                <path d="M6 14 Q12 8 18 14" />
                <path d="M9 16 Q12 13 15 16" />
              </g>
            </svg>
          </div>
        </div>

        {/* ── Success badge that pops on tap ── */}
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translate(-50%, 0)',
          background: 'var(--green)',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: 99,
          fontSize: 13 * scale,
          fontWeight: 800,
          letterSpacing: '0.02em',
          boxShadow: '0 8px 24px rgba(22,163,74,0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          opacity: 0,
          animation: 'successBadge 4s ease-in-out infinite',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}>
          <svg width={14 * scale} height={14 * scale} viewBox="0 0 24 24" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Aisha Patel · checked in
        </div>
      </div>
    </div>
  );
}
