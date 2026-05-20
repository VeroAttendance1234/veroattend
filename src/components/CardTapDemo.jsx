/**
 * CardTapDemo · large, cinematic 3D scene of the VERO RFID reader in action.
 *
 * Inspired by Linear / Stripe / Vercel hero scenes. Pure CSS 3D, no libraries.
 *
 *  · The real wall-mounted RFIDREADER.png floats in the centre, gently rotating
 *  · 5 stylised NFC cards orbit in from different angles and tap at staggered
 *    times (every ~2.4s a new tap happens)
 *  · On every tap, the reader glows, ripples burst from the NFC zone, and a
 *    colour-coded check-in notification bubble spawns from the top and floats
 *    upward (teacher = teal, student-on-time = green, late = amber, very-late =
 *    red, early = teal)
 *  · Light beams shoot upward from the reader into the notification stream,
 *    visualising data being sent to the dashboards
 *
 * Total animation cycle: 12 seconds.
 */

/* ─── 6 notification events spawn every 2s in this exact order ─── */
const EVENTS = [
  { delay: 0.4,  type: 'student-ontime', label: 'Aisha Patel',       sub: 'Year 11A · on time'      },
  { delay: 2.4,  type: 'teacher-early',  label: 'Mr Chen',           sub: 'Maths · 5 min early'     },
  { delay: 4.4,  type: 'student-late',   label: 'James Park',        sub: 'Year 11C · 1 min late'   },
  { delay: 6.4,  type: 'student-ontime', label: 'Luna King',         sub: 'Year 7B · on time'       },
  { delay: 8.4,  type: 'teacher-early',  label: 'Ms Williams',       sub: 'English · 3 min early'   },
  { delay: 10.4, type: 'student-vlate',  label: 'Hugo Allen',        sub: 'Year 7B · 5 min late'    },
];

const EVENT_STYLES = {
  'student-ontime': { bg: 'var(--green)',      icon: '✓', accent: 'rgba(22,163,74,0.55)' },
  'teacher-early':  { bg: 'var(--teal)',       icon: '✓', accent: 'rgba(20,184,184,0.55)' },
  'student-late':   { bg: '#D97706',           icon: '!', accent: 'rgba(217,119,6,0.55)' },
  'student-vlate':  { bg: 'var(--red)',        icon: '!', accent: 'rgba(220,38,38,0.55)' },
};

/* ─── 5 cards on their own staggered tap cycles ─── */
const CARDS = [
  {
    name: 'Aisha Patel', id: 'S001',  hue: 'linear-gradient(135deg, #14B8B8 0%, #0F9898 100%)',
    /* approach from right */
    from: 'translate3d(280px,  60px,  120px) rotateY(-32deg) rotateZ(-8deg)',
    delay: 0,
  },
  {
    name: 'Mr Chen', id: 'T002', hue: 'linear-gradient(135deg, #2563EB 0%, #1E4FBF 100%)',
    /* approach from left */
    from: 'translate3d(-280px, 80px, 120px) rotateY(32deg) rotateZ(7deg)',
    delay: 2.4,
  },
  {
    name: 'James Park', id: 'S203', hue: 'linear-gradient(135deg, #D97706 0%, #B45D04 100%)',
    /* approach from bottom-right */
    from: 'translate3d(220px,  220px, 120px) rotateY(-22deg) rotateX(15deg) rotateZ(-12deg)',
    delay: 4.8,
  },
  {
    name: 'Luna King', id: 'S027', hue: 'linear-gradient(135deg, #16A34A 0%, #0F7A36 100%)',
    /* approach from top-right */
    from: 'translate3d(240px, -200px, 120px) rotateY(-22deg) rotateX(-20deg) rotateZ(8deg)',
    delay: 7.2,
  },
  {
    name: 'Ms Williams', id: 'T019', hue: 'linear-gradient(135deg, #7C3AED 0%, #5E2BB8 100%)',
    /* approach from bottom-left */
    from: 'translate3d(-240px, 200px, 120px) rotateY(28deg) rotateX(12deg) rotateZ(10deg)',
    delay: 9.6,
  },
];

export default function CardTapDemo({ size = 'lg' }) {
  const scale = { sm: 0.6, md: 0.8, lg: 1, xl: 1.15 }[size] || 1;
  const W = 640 * scale;
  const H = 680 * scale;

  return (
    <div
      style={{
        width: W, height: H,
        position: 'relative',
        margin: '0 auto',
        perspective: 1600,
        perspectiveOrigin: '50% 50%',
      }}
      aria-label="Animated 3D scene of NFC cards tapping the VERO reader"
    >
      <SceneStyles />

      {/* Gentle floating wrapper */}
      <div style={{
        position: 'absolute', inset: 0,
        transformStyle: 'preserve-3d',
        animation: 'sceneFloat 6s ease-in-out infinite',
      }}>

        {/* ── Deep ambient gradient backdrop ── */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 50% 50%, rgba(20,184,184,0.28) 0%, transparent 55%), ' +
            'radial-gradient(circle at 30% 70%, rgba(124,58,237,0.10) 0%, transparent 55%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        {/* ── Notification stream (top half) ── */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0, right: 0,
          height: '52%',
          pointerEvents: 'none',
          overflow: 'visible',
        }}>
          {EVENTS.map((e, i) => (
            <Notification key={i} event={e} scale={scale} />
          ))}
        </div>

        {/* ── Light beams shooting up from reader to notifications ── */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 4,
          height: '38%',
          background: 'linear-gradient(180deg, var(--teal) 0%, transparent 100%)',
          opacity: 0.18,
          pointerEvents: 'none',
          filter: 'blur(2px)',
        }} />

        {/* ── Reader image (real 3D-printed enclosure) ── */}
        <ReaderImage scale={scale} W={W} H={H} />

        {/* ── 5 cards each on staggered orbits ── */}
        {CARDS.map((c, i) => (
          <NFCCard key={i} card={c} scale={scale} />
        ))}

        {/* ── Ground glow ── */}
        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          width:  W * 0.55,
          height: 24,
          background: 'radial-gradient(ellipse, rgba(20,184,184,0.45) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(10px)',
          transform: 'translateX(-50%)',
          animation: 'groundPulse 12s ease-in-out infinite',
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
function ReaderImage({ scale, W, H }) {
  return (
    <div style={{
      position: 'absolute',
      top: '36%',
      left: '50%',
      width:  W * 0.45,
      height: H * 0.45,
      transform: 'translateX(-50%)',
      transformStyle: 'preserve-3d',
      animation: 'readerSpin 14s ease-in-out infinite, readerGlow 12s ease-in-out infinite',
      filter: 'drop-shadow(0 30px 40px rgba(15, 30, 40, 0.22))',
    }}>
      <img
        src="/RFIDREADER.png"
        alt="VERO RFID reader"
        style={{
          width: '100%', height: '100%',
          objectFit: 'contain',
          display: 'block',
          // strip the white background by multiplying it into the page
          mixBlendMode: 'multiply',
        }}
      />

      {/* NFC pulse rings · centred over the wave glyph on the reader */}
      {[0, 0.25, 0.5].map((d, i) => (
        <div key={`pulse-${i}`} style={{
          position: 'absolute',
          top: '60%', left: '50%',
          width: 90 * scale, height: 90 * scale,
          borderRadius: '50%',
          border: '3px solid var(--teal)',
          pointerEvents: 'none',
          opacity: 0,
          animation: `nfcRipple 2.4s ${d}s ease-out infinite`,
          transformOrigin: 'center',
        }} />
      ))}

      {/* Sharper inner glow at the moment of tap */}
      <div style={{
        position: 'absolute',
        top: '60%', left: '50%',
        width: 60 * scale, height: 60 * scale,
        borderRadius: '50%',
        background: 'radial-gradient(circle, var(--teal) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        opacity: 0,
        animation: 'readerCoreFlash 2.4s ease-in-out infinite',
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }} />
    </div>
  );
}

/* ─────────────────────────────────────────── */
function NFCCard({ card, scale }) {
  const cycleDuration = 12; // seconds
  const safeDelay = -(cycleDuration - card.delay); // negative so animation starts mid-cycle

  return (
    <div style={{
      position: 'absolute',
      top: '40%',
      left: '50%',
      marginLeft: -110 * scale,
      marginTop:  -68  * scale,
      width:  220 * scale,
      height: 136 * scale,
      transformStyle: 'preserve-3d',
      animation: `cardTap ${cycleDuration}s ease-in-out infinite`,
      animationDelay: `${safeDelay}s`,
      filter: 'drop-shadow(0 18px 24px rgba(15,30,40,0.32))',
      '--from-transform': card.from,
    }}>
      {/* Inject the per-card "from" transform via inline style + CSS var trick */}
      <style>{`
        [data-card-from="${card.name.replace(/[^a-z0-9]/gi,'')}"] {
          --card-from: ${card.from};
        }
      `}</style>

      <div data-card-from={card.name.replace(/[^a-z0-9]/gi,'')}
        style={{
          width: '100%', height: '100%',
          borderRadius: 14,
          background: card.hue,
          boxShadow: `
            inset 0 -2px 0 rgba(0,0,0,0.2),
            inset 0 1px 0 rgba(255,255,255,0.24)
          `,
          border: '1px solid rgba(255,255,255,0.2)',
          position: 'relative',
          padding: 16 * scale,
          color: '#fff',
          overflow: 'hidden',
          /* Animate from the card-specific start position */
          animation: `cardTapInner-${card.name.replace(/[^a-z0-9]/gi,'')} ${cycleDuration}s ease-in-out infinite`,
          animationDelay: `${safeDelay}s`,
        }}>
        <style>{`
          @keyframes cardTapInner-${card.name.replace(/[^a-z0-9]/gi,'')} {
            0%   { transform: ${card.from}; opacity: 0; }
            5%   { opacity: 1; }
            14%  { transform: translate3d(-2px, 0, 6px) rotateY(-2deg) rotateZ(0deg); }
            18%  { transform: translate3d(0, 0, 0) rotateY(0deg) rotateZ(0deg); }
            22%  { transform: translate3d(-2px, 0, 6px) rotateY(-2deg) rotateZ(0deg); }
            33%  { transform: ${card.from}; opacity: 1; }
            36%  { opacity: 0; }
            100% { transform: ${card.from}; opacity: 0; }
          }
        `}</style>

        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)',
          transform: 'translateX(-100%)',
          animation: `cardShimmer 12s ${card.delay}s ease-in-out infinite`,
          pointerEvents: 'none',
        }} />

        {/* VERO branding */}
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800,
          fontSize: 22 * scale,
          letterSpacing: '0.04em',
          lineHeight: 1,
          marginBottom: 4,
        }}>
          VERO<span style={{ opacity: 0.7 }}>.</span>
        </div>
        <div style={{
          fontSize: 8 * scale,
          fontWeight: 700,
          letterSpacing: '0.18em',
          opacity: 0.78,
          textTransform: 'uppercase',
        }}>
          {card.id.startsWith('T') ? 'Staff' : 'Student'} · MIFARE 1K
        </div>

        {/* NFC chip */}
        <div style={{
          position: 'absolute',
          right: 18 * scale, top: 18 * scale,
          width: 28 * scale, height: 24 * scale,
          background: 'linear-gradient(135deg, #f4d06f 0%, #d4a843 100%)',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.18)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
          display: 'grid', gridTemplateRows: '1fr 1fr 1fr',
          gap: 1.5, padding: 2.5,
        }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
          <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 1 }} />
        </div>

        {/* Name + ID */}
        <div style={{
          position: 'absolute',
          bottom: 14 * scale,
          left: 16 * scale,
          right: 16 * scale,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ fontSize: 7 * scale, opacity: 0.7, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Name
            </div>
            <div style={{ fontSize: 11 * scale, fontWeight: 700, lineHeight: 1.2 }}>
              {card.name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 7 * scale, opacity: 0.7, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ID
            </div>
            <div style={{ fontSize: 10 * scale, fontWeight: 700, fontFamily: 'monospace' }}>
              {card.id}
            </div>
          </div>
        </div>

        {/* NFC wave glyph */}
        <svg
          viewBox="0 0 24 24"
          width={16 * scale} height={16 * scale}
          style={{ position: 'absolute', top: 46 * scale, left: 16 * scale, opacity: 0.45 }}
        >
          <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12 Q12 3 21 12" />
            <path d="M6 14 Q12 8 18 14" />
            <path d="M9 16 Q12 13 15 16" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
function Notification({ event, scale }) {
  const style = EVENT_STYLES[event.type];
  return (
    <div style={{
      position: 'absolute',
      top: '90%',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '8px 14px 8px 9px',
      borderRadius: 99,
      background: style.bg,
      color: '#fff',
      fontWeight: 800,
      fontSize: 12 * scale,
      letterSpacing: '0.005em',
      boxShadow: `0 8px 22px ${style.accent}, 0 0 0 1px rgba(255,255,255,0.18) inset`,
      opacity: 0,
      whiteSpace: 'nowrap',
      animation: `notifFloat 12s ${event.delay}s ease-out infinite`,
      willChange: 'transform, opacity',
    }}>
      <span style={{
        width: 18 * scale, height: 18 * scale,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11 * scale, fontWeight: 900,
        flexShrink: 0,
      }}>
        {style.icon}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, alignItems: 'flex-start' }}>
        <span>{event.label}</span>
        <span style={{ fontSize: 9 * scale, opacity: 0.85, fontWeight: 600 }}>{event.sub}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── */
function SceneStyles() {
  return (
    <style>{`
      @keyframes sceneFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
      @keyframes readerSpin {
        0%, 100% { transform: translateX(-50%) rotateY(-3deg) rotateX(2deg); }
        50%      { transform: translateX(-50%) rotateY(3deg)  rotateX(-2deg); }
      }
      @keyframes readerGlow {
        /* Glow flashes at every tap (5 cards staggered) */
        0%, 1.5%, 2%, 21.5%, 22%, 41.5%, 42%, 61.5%, 62%, 81.5%, 82%, 100% {
          filter: drop-shadow(0 30px 40px rgba(15,30,40,0.22));
        }
        1.7%, 21.7%, 41.7%, 61.7%, 81.7% {
          filter: drop-shadow(0 30px 40px rgba(15,30,40,0.22))
                  drop-shadow(0 0 36px rgba(20,184,184,0.7));
        }
      }
      @keyframes readerCoreFlash {
        /* Brief flash at each tap */
        0%, 14%, 16%, 34%, 36%, 54%, 56%, 74%, 76%, 94%, 96%, 100% { opacity: 0; }
        15%, 35%, 55%, 75%, 95% { opacity: 0.7; }
      }
      @keyframes nfcRipple {
        0%, 35% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        45%     { opacity: 0.9; }
        100%    { opacity: 0; transform: translate(-50%, -50%) scale(3.2); }
      }
      @keyframes cardShimmer {
        0%, 6%   { transform: translateX(-100%); }
        10%      { transform: translateX(100%); }
        100%     { transform: translateX(100%); }
      }
      @keyframes notifFloat {
        0%, 12%  { opacity: 0; transform: translate(-50%, 0) scale(0.7); }
        14%      { opacity: 1; transform: translate(-50%, -8px) scale(1.05); }
        18%      { opacity: 1; transform: translate(-50%, -20px) scale(1); }
        28%      { opacity: 1; transform: translate(-50%, -80px) scale(1); }
        38%      { opacity: 0; transform: translate(-50%, -160px) scale(0.9); }
        100%     { opacity: 0; transform: translate(-50%, -160px) scale(0.9); }
      }
      @keyframes groundPulse {
        0%, 1.5%, 2%, 21.5%, 22%, 41.5%, 42%, 61.5%, 62%, 81.5%, 82%, 100% { opacity: 0.5; }
        1.7%, 21.7%, 41.7%, 61.7%, 81.7% { opacity: 0.95; transform: translateX(-50%) scaleX(1.15); }
      }
      @keyframes cardTap { 0%, 100% { } }
    `}</style>
  );
}
