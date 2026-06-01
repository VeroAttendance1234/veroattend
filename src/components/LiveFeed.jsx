import { useEffect, useRef } from 'react';
import Badge from './Badge';
import Avatar from './Avatar';
import Sparkline, { seedHistory } from './Sparkline';
import { CreditCard, Clock, LogOut, LogIn } from 'lucide-react';

// Maps a tap's status to how its row should read. A check-OUT is shown as a
// neutral "Checked out" pill; arrivals split into on-time vs late.
const STATUS_VIEW = {
  'on-time': { badge: 'present', label: 'On time',     dot: 'present', out: false },
  'late':    { badge: 'late',    label: 'Late',        dot: 'present', out: false },
  'out':     { badge: 'info',    label: 'Checked out', dot: 'absent',  out: true  },
};

export default function LiveFeed({ taps }) {
  const listRef = useRef(null);

  // Keep the newest tap visible by scrolling THIS panel only - never the
  // page. (Previously used scrollIntoView, which yanked the whole window
  // down to the scan feed on every card tap.)
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 340, overflowY: 'auto', paddingRight: 2 }}>
      <style>{`
        @media (min-width: 540px) {
          .livefeed-spark { display: flex !important; }
        }
      `}</style>
      {taps.map((tap, i) => {
        const view = STATUS_VIEW[tap.status] || STATUS_VIEW['on-time'];
        return (
        <div
          key={tap.id}
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
          <Avatar name={tap.name} size={38} status={view.dot} />

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

          {/* 7-day attendance sparkline - gives every row instant context */}
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
            <Badge status={view.badge} dot>{view.label}</Badge>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-soft)',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              {view.out
                ? <LogOut size={10} style={{ color: 'var(--blue)' }} />
                : <LogIn size={10} style={{ color: 'var(--green)' }} />}
              {tap.time}
            </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
