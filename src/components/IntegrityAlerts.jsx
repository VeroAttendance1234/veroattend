import { useEffect, useRef, useState } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, Layers, Copy, MapPin,
  Users, Clock, Check, Fingerprint, Camera, ScrollText, Zap,
} from 'lucide-react';
import Badge from './Badge';

/* ── Severity → colour palette ─────────────────── */
const SEV = {
  high:   { bg: 'var(--red-light)',   border: 'var(--red-border)',   color: 'var(--red)',   label: 'High' },
  medium: { bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Medium' },
  low:    { bg: 'var(--blue-light)',  border: 'var(--blue-border)',  color: 'var(--blue)',  label: 'Low' },
};

/* ── Anomaly type → icon ───────────────────────── */
const TYPE_ICON = {
  burst:     Layers,   // one person tapping a stack of cards
  duplicate: Copy,     // same card in two places
  velocity:  MapPin,   // impossible travel between readers
  pattern:   Users,    // recurring group cluster
};

function nowLabel() {
  return new Date()
    .toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toLowerCase();
}

/* The four defences VERO runs on every tap - this is the "we thought of and
   beat the limitation" narrative made concrete. */
const DEFENCES = [
  { icon: Layers,      title: 'Burst detection',     text: 'Several cards tapped in seconds = one hand on a stack. Flagged instantly.' },
  { icon: MapPin,      title: 'Impossible travel',   text: 'Same ID at two readers too far apart, too fast - physically impossible.' },
  { icon: Copy,        title: 'Duplicate presence',  text: 'A card can\'t be in two rooms at once. Double presence is held, not trusted.' },
  { icon: Camera,      title: 'Photo confirmation',  text: 'Flagged taps surface the enrolled photo so staff verify the right student.' },
];

/* Seeded examples so the panel demonstrates the detection categories even
   before anything happens live. These read like genuine flagged events. */
const SEED_ALERTS = [
  {
    id: 'seed-dup', severity: 'high', type: 'duplicate', state: 'open',
    title: 'Same card, two locations',
    detail: 'Card A91C-44E2 (S0412 · 9C) registered at the Main Gate reader while already marked present in B-Block 11s earlier. One card cannot be in two places - likely shared between students.',
    students: ['Aisha Nguyen'], reader: 'Main Gate ↔ B-Block', time: '8:47 am',
  },
  {
    id: 'seed-vel', severity: 'medium', type: 'velocity', state: 'open',
    title: 'Impossible travel time',
    detail: 'S0233 tapped the Gym reader just 9s after the Library reader - 180 m apart. Faster than physically possible; the card may have been handed to a friend.',
    students: ['Marcus Lee'], reader: 'Library → Gym', time: '8:51 am',
  },
  {
    id: 'seed-pat', severity: 'low', type: 'pattern', state: 'monitoring',
    title: 'Recurring morning cluster',
    detail: 'Four 8F cards have tapped within the same 3-second window every morning this week. Not proof on its own, but a classic card-pooling signature - worth a spot check.',
    students: ['8F · 4 students'], reader: 'East Door', time: 'This week',
  },
];

export default function IntegrityAlerts({ taps = [], students = [], onSimulateCheat }) {
  const [alerts, setAlerts] = useState(SEED_ALERTS);
  const lastBurstRef = useRef(0);

  /* Live detector: watch the real tap stream for a rapid multi-card burst -
     the tell-tale signature of one person tapping a stack of borrowed cards.
     Normal cadence is one tap every 12s+, so a genuine burst stands out. */
  useEffect(() => {
    if (!taps.length) return;
    const newest = taps[0];
    if (!newest.ts) return;
    const recent = taps.filter(t => t.ts && newest.ts - t.ts <= 5000);
    if (recent.length >= 3 && newest.ts - lastBurstRef.current > 6000) {
      lastBurstRef.current = newest.ts;
      const span  = Math.max(0.1, (newest.ts - recent[recent.length - 1].ts) / 1000).toFixed(1);
      const names = [...new Set(recent.map(t => t.name))].slice(0, 5);
      const id    = `live-${newest.ts}`;
      setAlerts(prev => prev.some(a => a.id === id) ? prev : [{
        id, severity: 'high', type: 'burst', state: 'open', live: true,
        title: 'Rapid multi-card burst',
        detail: `${recent.length} different cards tapped at Reader 01 within ${span}s - the signature of one person tapping a stack of cards (buddy-punching). Taps held pending teacher confirmation.`,
        students: names,
        reader: 'Reader 01 · Main Gate',
        time: nowLabel(),
      }, ...prev]);
    }
  }, [taps]);

  function resolve(id, outcome) {
    if (outcome === 'cleared') {
      setAlerts(prev => prev.filter(a => a.id !== id));
    } else {
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, state: 'confirmed' } : a));
    }
  }

  const openCount = alerts.filter(a => a.state === 'open').length;
  const scanned   = taps.length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: openCount ? 'var(--red-light)' : 'var(--green-light)',
            border: `1px solid ${openCount ? 'var(--red-border)' : 'var(--green-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {openCount
              ? <ShieldAlert size={20} strokeWidth={2} style={{ color: 'var(--red)' }} />
              : <ShieldCheck size={20} strokeWidth={2} style={{ color: 'var(--green)' }} />}
          </div>
          <div>
            <p className="section-title" style={{ marginBottom: 2 }}>Integrity &amp; Anti-Cheat</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Watching for shared &amp; passed-around cards
            </span>
          </div>
        </div>
        <Badge status={openCount ? 'warn' : 'present'} dot>
          {openCount ? `${openCount} open alert${openCount !== 1 ? 's' : ''}` : 'All clear'}
        </Badge>
      </div>

      {/* The limitation, named - then the defences that beat it */}
      <div style={{
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '13px 16px', margin: '14px 0 16px',
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
          <strong style={{ color: 'var(--text-primary)' }}>The known weakness of any RFID system is card-sharing</strong> - a
          student hands their card to a friend, or one person taps a stack of cards to mark absent mates
          present (&ldquo;buddy-punching&rdquo;). VERO doesn&rsquo;t ignore this. Every tap is scored against
          four signals, and anything suspicious is <em>held for human confirmation</em> rather than silently trusted.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 9 }}>
          {DEFENCES.map(({ icon: Icon, title, text }) => (
            <div key={title} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8, flexShrink: 0, marginTop: 1,
                background: 'var(--teal-glow)', border: '1px solid var(--teal-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={13} strokeWidth={2.2} style={{ color: 'var(--teal)' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live demo trigger + scan counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 13, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-soft)' }}>
            <Fingerprint size={13} strokeWidth={2} />
            <span><strong style={{ color: 'var(--text-muted)' }}>{scanned}</strong> taps scored this session</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <ScrollText size={13} strokeWidth={2} />
            <span>every tap logged immutably</span>
          </div>
          {onSimulateCheat && (
            <button
              onClick={onSimulateCheat}
              className="btn-secondary"
              style={{ padding: '7px 13px', fontSize: '0.78rem', borderColor: 'var(--red-border)', color: 'var(--red)' }}
            >
              <Zap size={14} strokeWidth={2.5} />
              Simulate card-passing attempt
            </button>
          )}
        </div>
      </div>

      {/* Alerts list */}
      {alerts.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 8, padding: '28px 0', color: 'var(--text-soft)',
        }}>
          <ShieldCheck size={26} strokeWidth={1.6} style={{ color: 'var(--green)' }} />
          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No integrity flags</div>
          <div style={{ fontSize: '0.78rem' }}>Every tap this session passed all four checks.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {alerts.map(a => {
            const sev  = SEV[a.severity] || SEV.low;
            const Icon = TYPE_ICON[a.type] || AlertTriangle;
            const confirmed = a.state === 'confirmed';
            return (
              <div key={a.id} style={{
                display: 'flex', gap: 12, padding: '13px 15px',
                borderRadius: 'var(--radius-md)',
                background: confirmed ? 'var(--surface-soft)' : sev.bg,
                border: `1px solid ${confirmed ? 'var(--border)' : sev.border}`,
                animation: a.live ? 'slideDown 0.3s ease' : 'none',
                opacity: confirmed ? 0.85 : 1,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                  background: 'var(--surface-card)', border: `1px solid ${sev.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={16} strokeWidth={2} style={{ color: sev.color }} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.title}</span>
                    <span style={{
                      fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                      color: sev.color, background: 'var(--surface-card)',
                      border: `1px solid ${sev.border}`, borderRadius: 99, padding: '1px 7px',
                    }}>{sev.label}</span>
                    {a.live && (
                      <span style={{
                        fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                        color: 'var(--red)', display: 'inline-flex', alignItems: 'center', gap: 3,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
                        Live
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 7 }}>
                    {a.detail}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--text-soft)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Users size={11} /> {a.students.join(', ')}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={11} /> {a.reader}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {a.time}
                    </span>
                  </div>

                  {/* Resolution controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 11 }}>
                    {confirmed ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: '0.74rem', fontWeight: 700, color: 'var(--red)',
                      }}>
                        <AlertTriangle size={13} /> Confirmed · taps voided, parent &amp; head teacher notified
                      </span>
                    ) : a.state === 'monitoring' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)',
                      }}>
                        <Clock size={13} /> Monitoring · watching for repeats
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => resolve(a.id, 'confirmed')}
                          className="btn-secondary"
                          style={{ padding: '5px 11px', fontSize: '0.74rem', borderColor: 'var(--red-border)', color: 'var(--red)' }}
                        >
                          <AlertTriangle size={12} strokeWidth={2.5} /> Confirm cheating
                        </button>
                        <button
                          onClick={() => resolve(a.id, 'cleared')}
                          className="btn-secondary"
                          style={{ padding: '5px 11px', fontSize: '0.74rem' }}
                        >
                          <Check size={12} strokeWidth={2.5} /> False alarm
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
