import { useEffect, useRef } from 'react';
import Badge from './Badge';
import Avatar from './Avatar';
import Sparkline, { seedHistory } from './Sparkline';
import { CreditCard, Clock } from 'lucide-react';

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
        justifyContent: 'center', padding: '36px 0', gap: 10,
        color: 'var(--text-soft)',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: 'var(--surface-soft)',
          border: '1px dashed var(--border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-soft)',
        }}>
          <CreditCard size={22} strokeWidth={1.6} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: 3 }}>
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
      <style>{`
        @media (min-width: 540px) {
          .livefeed-spark { display: flex !important; }
        }
      `}</style>
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
            border: '1px solid',
            background: i === 0 ? 'var(--teal-glow)' : 'var(--surface-soft)',
            borderColor: i === 0 ? 'var(--teal-border)' : 'var(--border)',
            animation: i === 0 ? 'slideDown 0.25s ease, fadeHighlight 4s ease forwards' : 'none',
            transition: 'background 0.3s',
          }}
        >
          <Avatar name={tap.name} size={38} status="present" />

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

          {/* 7-day attendance sparkline — gives every row instant context */}
          <div style={{
            flexShrink: 0, display: 'none', alignItems: 'center',
            paddingRight: 4,
          }} className="livefeed-spark">
            <Sparkline
              data={seedHistory(tap.id || tap.name, 7)}
              width={56} height={22}
              ariaLabel={`${tap.name} 7-day attendance trend`}
            />
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
