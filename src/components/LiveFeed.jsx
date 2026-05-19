import { useEffect, useRef } from 'react';
import Badge from './Badge';
import { CreditCard, Clock } from 'lucide-react';

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase();
}

const AVATAR_COLOURS = [
  '#14B8B8','#2563EB','#16A34A','#D97706','#7C3AED','#DB2777',
];

function avatarColour(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLOURS[Math.abs(h) % AVATAR_COLOURS.length];
}

export default function LiveFeed({ taps }) {
  const topRef = useRef(null);

  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [taps.length]);

  if (taps.length === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '40px 0', gap: 12,
        color: 'var(--text-soft)',
      }}>
        <CreditCard size={32} strokeWidth={1.5} style={{ color: 'var(--border-strong)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            No scans yet
          </div>
          <div style={{ fontSize: '0.8rem' }}>
            Tap a card on the ACR122U reader, or use the simulator below.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
      {taps.map((tap, i) => (
        <div
          key={tap.id}
          ref={i === 0 ? topRef : null}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: i === 0 ? 'var(--teal-glow)' : 'var(--surface-soft)',
            borderColor: i === 0 ? 'var(--teal-border)' : 'var(--border)',
            animation: i === 0 ? 'slideDown 0.25s ease, fadeHighlight 4s ease forwards' : 'none',
            transition: 'background 0.3s',
          }}
        >
          {/* Avatar */}
          <div style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: avatarColour(tap.name),
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
            letterSpacing: '0.03em',
          }}>
            {initials(tap.name)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>
              {tap.name}
            </div>
            <div style={{
              fontSize: '0.75rem', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
            }}>
              <span>Year {tap.year} · {tap.class}</span>
              {tap.uid && (
                <>
                  <span style={{ color: 'var(--border-strong)' }}>·</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-soft)' }}>
                    {tap.uid}
                  </span>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <Badge status="present" dot>Present</Badge>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-soft)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <Clock size={10} />
              {tap.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
