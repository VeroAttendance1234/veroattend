import Avatar from './Avatar';
import Badge from './Badge';
import { CreditCard, Wifi, WifiOff } from 'lucide-react';

/*  Live proof for the marker page.
    ───────────────────────────────
    The pipeline strip above this component DESCRIBES a card tap travelling
    reader -> Pi -> WebSocket -> UI in four static cards. This shows it
    actually happening, which is the one claim on the whole page a marker
    cannot otherwise verify without being handed the hardware.

    Deliberately read-only: it takes the same `taps` array the dashboards
    render and owns no state of its own, so a tap lands here and on every
    dashboard from one socket event. There is no simulator hook here on
    purpose - a fake tap on the page arguing the hardware is real would be
    worse than showing nothing.                                            */

const ROWS = 4;

const STATUS_VIEW = {
  'on-time': { badge: 'present', label: 'On time',     dot: 'present' },
  'late':    { badge: 'late',    label: 'Late',        dot: 'present' },
  'out':     { badge: 'info',    label: 'Checked out', dot: 'absent'  },
};

export default function MarkerLiveTaps({ taps = [], systemLive, piConnected }) {
  /*  Three states worth distinguishing, because "nothing is showing" has
      three different causes and the marker should not have to guess which:
      reader genuinely live, Pi reachable but no reader, Pi unreachable.  */
  const state = systemLive ? 'live' : piConnected ? 'no-reader' : 'offline';

  const HEAD = {
    live:        { icon: Wifi,    tint: 'var(--green)', bg: 'var(--green-light)',   label: 'Reader connected' },
    'no-reader': { icon: WifiOff, tint: 'var(--amber)', bg: 'var(--amber-light)',   label: 'Pi online · no reader' },
    offline:     { icon: WifiOff, tint: 'var(--text-soft)', bg: 'var(--surface-soft)', label: 'Reader offline' },
  }[state];

  const visible = state === 'live' ? taps.slice(0, ROWS) : [];

  return (
    <div style={{
      marginTop: 22,
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* ── header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '15px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-soft)',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: HEAD.bg, color: HEAD.tint,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <HEAD.icon size={15} strokeWidth={2.2} />
        </div>

        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '0.98rem',
          letterSpacing: '-0.02em',
          marginRight: 'auto',
        }}>
          This is live, right now
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.72rem', fontWeight: 700,
          color: HEAD.tint,
          background: HEAD.bg,
          padding: '4px 10px', borderRadius: 99,
          letterSpacing: '0.02em',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: HEAD.tint, flexShrink: 0,
            animation: state === 'live' ? 'pulse-dot 1.8s ease-in-out infinite' : 'none',
          }} />
          {HEAD.label}
        </div>
      </div>

      {/* ── body ── */}
      <div style={{ padding: visible.length ? '12px 14px 14px' : '26px 22px' }}>
        {visible.length > 0 && visible.map((tap, i) => {
          const view = STATUS_VIEW[tap.status] || STATUS_VIEW['on-time'];
          return (
            <div
              key={tap.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid',
                background:  i === 0 ? 'var(--teal-glow)'  : 'transparent',
                borderColor: i === 0 ? 'var(--teal-border)' : 'transparent',
                animation: i === 0 ? 'slideDown 0.25s ease, fadeHighlight 4s ease forwards' : 'none',
              }}
            >
              <Avatar name={tap.name} size={34} status={view.dot} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 2 }}>
                  {tap.name}
                </div>
                <div style={{
                  fontSize: '0.72rem', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                }}>
                  <span>Year {tap.year} · {tap.class}</span>
                  {tap.uid && (
                    <>
                      <span style={{ color: 'var(--border-strong)' }}>·</span>
                      {/* The UID is the point: it is what the reader physically
                          read off the card, so it ties this row to the hardware. */}
                      <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--text-soft)' }}>
                        {tap.uid}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <Badge status={view.badge} dot>{view.label}</Badge>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{tap.time}</span>
              </div>
            </div>
          );
        })}

        {/* Live, but nobody has tapped yet this session. */}
        {state === 'live' && visible.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--teal-glow)',
              border: '1px dashed var(--teal-border)',
              color: 'var(--teal)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CreditCard size={19} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>
                Waiting for a card
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                The reader is connected. Tap a card on it and the scan appears
                here, on this page, without a refresh.
              </div>
            </div>
          </div>
        )}

        {state !== 'live' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--surface-soft)',
              border: '1px dashed var(--border-strong)',
              color: 'var(--text-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CreditCard size={19} strokeWidth={1.8} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 3 }}>
                {state === 'no-reader'
                  ? 'Raspberry Pi online, reader not detected'
                  : 'Hardware not connected'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {state === 'no-reader'
                  ? 'The Pi is reachable but the ACR122U is not plugged in, so no card can be read yet.'
                  : 'The four steps above run on a Raspberry Pi. With it powered off this panel stays empty rather than inventing a scan.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
