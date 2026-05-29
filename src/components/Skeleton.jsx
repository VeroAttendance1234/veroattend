/**
 * Skeleton — reusable shimmering loading placeholder.
 *
 * Three primitives + four composed presets. All use the same
 * `shimmer` keyframe defined in global.css (110° linear-gradient
 * sweep, 1.6 s loop) so every skeleton across the app pulses
 * together (premium feel — like a real product, not a demo).
 *
 * Primitives:
 *   <Skeleton.Block />   — solid filled rectangle (any size)
 *   <Skeleton.Line  />   — thin text-line placeholder
 *   <Skeleton.Circle />  — avatar/dot placeholder
 *
 * Composed presets:
 *   <Skeleton.Card />    — stat card with title + big number + sub
 *   <Skeleton.Row  />    — list/roster row with avatar + 2 lines
 *   <Skeleton.Chart />   — chart placeholder with header + bars
 *   <Skeleton.Hero  />   — large 3D-canvas-sized placeholder
 *
 * All variants honour prefers-reduced-motion via the global rule
 * in global.css (animation-duration shrinks to 0.01 ms).
 */

const baseStyle = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #eef2f3 0%, #e5ebec 100%)',
  borderRadius: 6,
};

const shimmerOverlay = {
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)',
  animation: 'shimmer 1.6s linear infinite',
  pointerEvents: 'none',
};

function Block({ width = '100%', height = 16, radius = 6, style }) {
  return (
    <div
      aria-hidden="true"
      style={{ ...baseStyle, width, height, borderRadius: radius, ...style }}
    >
      <div style={shimmerOverlay} />
    </div>
  );
}

function Line({ width = '100%', style }) {
  return <Block width={width} height={11} radius={4} style={{ marginBottom: 6, ...style }} />;
}

function Circle({ size = 36, style }) {
  return <Block width={size} height={size} radius={size} style={style} />;
}

/* ── Composed presets ──────────────────────────── */

function Card({ style }) {
  return (
    <div
      aria-hidden="true"
      aria-busy="true"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
    >
      <Line width="40%" />
      <Block width="55%" height={32} radius={6} style={{ marginTop: 10, marginBottom: 8 }} />
      <Line width="70%" />
    </div>
  );
}

function Row({ style }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: 'var(--surface-soft)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        ...style,
      }}
    >
      <Circle size={36} />
      <div style={{ flex: 1 }}>
        <Line width="40%" />
        <Line width="65%" style={{ marginBottom: 0 }} />
      </div>
      <Block width={56} height={20} radius={99} />
    </div>
  );
}

function Chart({ height = 200, style }) {
  return (
    <div
      aria-hidden="true"
      aria-busy="true"
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <Line width={120} style={{ marginBottom: 0 }} />
        <Line width={64}  style={{ marginBottom: 0 }} />
      </div>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 6,
        height, padding: '4px 0',
      }}>
        {[0.45, 0.7, 0.55, 0.85, 0.4, 0.95, 0.65, 0.75, 0.5, 0.85, 0.6, 0.9].map((h, i) => (
          <Block
            key={i}
            width={`${100 / 12}%`}
            height={`${Math.round(h * 100)}%`}
            radius={4}
            style={{ minWidth: 0, flex: 1 }}
          />
        ))}
      </div>
    </div>
  );
}

function Hero({ height = 520, label = 'Loading…', style }) {
  return (
    <div
      aria-hidden="true"
      aria-busy="true"
      style={{
        position: 'relative',
        width: '100%', height,
        borderRadius: 18, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, #f8fafa 0%, #eef3f3 100%)',
        ...style,
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(110deg, transparent 30%, rgba(20,184,184,0.10) 50%, transparent 70%)',
        animation: 'shimmer 1.6s linear infinite',
      }} />
      {label && (
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 18,
          textAlign: 'center',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '0.78rem',
          color: 'var(--teal-dark)', letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
      )}
    </div>
  );
}

const Skeleton = { Block, Line, Circle, Card, Row, Chart, Hero };
export default Skeleton;
