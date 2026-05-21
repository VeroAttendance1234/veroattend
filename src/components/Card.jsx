import { useRef, useState } from 'react';

/**
 * Card · base surface with cursor-following spotlight + lift on hover.
 * Drop-in compatible with the previous Card — same className and props.
 *
 * The spotlight is a soft teal radial gradient that follows the mouse,
 * letting any data-driven card (StatCard, leaderboard rows, etc.) feel
 * a little more alive without changing each page.
 */
export default function Card({
  children,
  style,
  className = '',
  spotlight = true,  // pass spotlight={false} to opt out per-card
  ...rest
}) {
  const ref = useRef(null);
  const [pos, setPos]   = useState({ x: -200, y: -200 });
  const [hover, setHover] = useState(false);

  function onMove(e) {
    if (!ref.current || !spotlight) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  return (
    <div
      ref={ref}
      className={`card ${className}`}
      onMouseMove={onMove}
      onMouseEnter={() => spotlight && setHover(true)}
      onMouseLeave={() => spotlight && setHover(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        transition:
          'transform 0.25s cubic-bezier(0.32, 0.72, 0, 1), ' +
          'box-shadow 0.25s cubic-bezier(0.32, 0.72, 0, 1), ' +
          'border-color 0.2s ease',
        ...style,
      }}
      {...rest}
    >
      {/* Cursor-following spotlight (sits above background, below content) */}
      {spotlight && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(20, 184, 184, 0.10), transparent 55%)`,
            opacity: hover ? 1 : 0,
            transition: 'opacity 0.25s ease',
            zIndex: 0,
          }}
        />
      )}
      {/* Content sits above the spotlight */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
