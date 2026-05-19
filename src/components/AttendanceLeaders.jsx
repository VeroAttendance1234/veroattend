import { useMemo, useState } from 'react';
import { Trophy, Crown, Award, TrendingUp } from 'lucide-react';
import Avatar from './Avatar';

/**
 * AttendanceLeaders — compact student leaderboard.
 * Generates a deterministic top-10 from the student list with simulated rates.
 */
export default function AttendanceLeaders({ students, onSelectStudent }) {
  const [scope, setScope] = useState('school'); // 'school' | 'year'

  const leaders = useMemo(() => {
    // Use first 30 present students, assign realistic-looking rates
    const seed = students.filter(s => s.present).slice(0, 60);
    return seed
      .map((s, i) => {
        // Deterministic rate from id hash
        const hash = s.id.charCodeAt(s.id.length - 1) + s.id.charCodeAt(0);
        const rate = +(97 + (hash % 30) / 10).toFixed(1);
        return { ...s, rate: Math.min(100, rate), streak: 12 + (hash % 18) };
      })
      .sort((a, b) => b.rate - a.rate || b.streak - a.streak)
      .slice(0, 10);
  }, [students]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Trophy size={16} style={{ color: 'var(--amber)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Student Attendance Leaders</p>
        </div>
        <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9 }}>
          {['school', 'year'].map(s => (
            <button
              key={s}
              onClick={() => setScope(s)}
              style={{
                padding: '4px 12px', borderRadius: 7,
                background: scope === s ? 'var(--surface-card)' : 'transparent',
                color: scope === s ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: scope === s ? 700 : 500,
                fontSize: '0.76rem',
                textTransform: 'capitalize',
                boxShadow: scope === s ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {s === 'school' ? 'School-wide' : 'Year 11'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {leaders.map((s, i) => {
          const medal = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : null;
          return (
            <div
              key={s.id}
              onClick={() => onSelectStudent?.(s)}
              style={{
                display: 'flex', alignItems: 'center', gap: 11,
                padding: '8px 12px', borderRadius: 11,
                background: medal ? `${medal}15` : 'var(--surface-soft)',
                border: medal ? `1px solid ${medal}55` : '1px solid var(--border)',
                cursor: onSelectStudent ? 'pointer' : 'default',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
              }}
              onMouseEnter={e => {
                if (!onSelectStudent) return;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(47,62,70,0.08)';
              }}
              onMouseLeave={e => {
                if (!onSelectStudent) return;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Rank */}
              <div style={{
                width: 26, height: 26, flexShrink: 0,
                borderRadius: '50%',
                background: medal || 'var(--surface)',
                border: medal ? 'none' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '0.78rem',
                color: medal ? '#fff' : 'var(--text-muted)',
              }}>
                {i === 0 ? <Crown size={13} fill="#fff" strokeWidth={0} /> : i + 1}
              </div>

              <Avatar name={s.name} size={32} status="present" />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>
                  Year {s.year} · {s.class} · {s.streak} day streak
                </div>
              </div>

              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800, fontSize: '0.95rem',
                color: 'var(--green)',
                flexShrink: 0,
              }}>
                {s.rate}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Current Leader hero card (replaces fun facts strip) ── */
export function CurrentLeaderStrip({ students }) {
  const topLeader = useMemo(() => {
    const seed = students.filter(s => s.present).slice(0, 30);
    return seed
      .map(s => {
        const hash = s.id.charCodeAt(s.id.length - 1) + s.id.charCodeAt(0);
        return { ...s, rate: +(98.5 + (hash % 16) / 10).toFixed(1), streak: 22 + (hash % 10) };
      })
      .sort((a, b) => b.rate - a.rate)[0];
  }, [students]);

  const topClass = '7A';
  const topYear  = 'Year 8';

  if (!topLeader) return null;

  const items = [
    {
      icon: <Crown size={18} strokeWidth={2} style={{ color: '#fff' }} />,
      iconBg: '#FFD700',
      label: 'Top Student',
      value: topLeader.name,
      sub: `Year ${topLeader.year} · ${topLeader.rate}% · ${topLeader.streak}d streak`,
    },
    {
      icon: <Trophy size={18} strokeWidth={2} style={{ color: '#fff' }} />,
      iconBg: 'var(--teal)',
      label: 'Top Class',
      value: `Class ${topClass}`,
      sub: '97.2% term avg',
    },
    {
      icon: <Award size={18} strokeWidth={2} style={{ color: '#fff' }} />,
      iconBg: 'var(--blue)',
      label: 'Top Year',
      value: topYear,
      sub: '95.8% this week',
    },
    {
      icon: <TrendingUp size={18} strokeWidth={2} style={{ color: '#fff' }} />,
      iconBg: 'var(--green)',
      label: 'Biggest Gain',
      value: 'Class 9C',
      sub: '+4.2% this week',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 24,
    }} className="leader-strip">
      {items.map(it => (
        <div key={it.label} style={{
          background: 'var(--surface-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 16px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex', alignItems: 'center', gap: 11,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: it.iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {it.icon}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 800,
              color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 3,
            }}>
              {it.label}
            </div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '0.95rem',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {it.value}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {it.sub}
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width: 900px) { .leader-strip { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .leader-strip { grid-template-columns: 1fr; gap: 10px; } }
      `}</style>
    </div>
  );
}
