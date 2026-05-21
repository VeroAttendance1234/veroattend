import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X, UserCheck, UserX, Clock } from 'lucide-react';

const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * AttendanceHeatmap · month-grid heatmap of school attendance %.
 * Each cell is tap/hoverable to see the date + rate.
 * Deterministic seed → same date always shows same rate (no flicker).
 */
export default function AttendanceHeatmap({ totalStudents = 1050 } = {}) {
  const [offset, setOffset]   = useState(0);
  const [selected, setSelected] = useState(null);  // hover or click
  const [pinned,   setPinned]   = useState(null);  // sticky on click

  // Derive a deterministic breakdown for the focused day
  function breakdown(day) {
    if (!day || day.rate === null) return null;
    const present = Math.round((day.rate / 100) * totalStudents);
    const absent  = totalStudents - present;
    const seed    = (day.date.getDate() * 13 + day.date.getMonth() * 7) % 23;
    const late    = Math.max(2, Math.min(absent - 1, 6 + (seed % 8)));
    return { present, absent: absent - late, late, total: totalStudents };
  }

  const { year, month, days } = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const y = d.getFullYear(), m = d.getMonth();
    const firstDay = (d.getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m, day);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      const seed = (y * 1000 + (m + 1) * 31 + day) % 23;
      let rate = isWeekend ? null : 78 + ((seed * 7) % 20); // 78-98%
      if (date > now) rate = null;
      cells.push({
        day, date, rate, isWeekend,
        isFuture: date > now,
        isToday: date.toDateString() === now.toDateString(),
      });
    }
    return { year: y, month: m, days: cells };
  }, [offset]);

  function cellColour(rate) {
    if (rate === null) return null;
    if (rate >= 95) return { bg: '#0F9898', text: '#fff' };           // dark teal
    if (rate >= 90) return { bg: '#3DC48A', text: '#fff' };           // green
    if (rate >= 85) return { bg: '#F4D06F', text: '#2F3E46' };        // amber (dark text!)
    if (rate >= 80) return { bg: '#FF9966', text: '#fff' };           // orange
    return                  { bg: '#DC2626', text: '#fff' };           // red
  }

  const monthRates = days.filter(d => d && d.rate !== null).map(d => d.rate);
  const monthAvg   = monthRates.length
    ? Math.round(monthRates.reduce((a, b) => a + b, 0) / monthRates.length)
    : 0;

  // Pinned (click) wins over hover; falls back to hover preview
  const info = pinned ?? selected;
  const bd   = breakdown(info);

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* ── Header ───────────────────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Calendar size={16} style={{ color: 'var(--teal)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Attendance Calendar</p>
          <span style={{
            fontSize: '0.72rem', fontWeight: 800,
            background: 'var(--teal-glow)', color: 'var(--teal)',
            border: '1px solid var(--teal-border)',
            padding: '2px 9px', borderRadius: 99,
          }}>
            {monthAvg}% avg
          </span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 9, padding: 3,
        }}>
          <button
            onClick={() => { setOffset(o => o - 1); setSelected(null); setPinned(null); }}
            aria-label="Previous month"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'transparent', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <span style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)',
            minWidth: 130, textAlign: 'center',
          }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => { setOffset(o => Math.min(0, o + 1)); setSelected(null); setPinned(null); }}
            disabled={offset === 0}
            aria-label="Next month"
            style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'transparent',
              color: offset === 0 ? 'var(--text-soft)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: offset === 0 ? 0.4 : 1,
            }}
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Day-of-week labels ──────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 6, marginBottom: 8,
      }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: '0.68rem', fontWeight: 800,
            color: i >= 5 ? 'var(--text-soft)' : 'var(--text-muted)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ───────────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6,
      }}>
        {days.map((c, i) => {
          if (!c) return <div key={`pad-${i}`} style={{ aspectRatio: '1' }} />;

          const colour = cellColour(c.rate);
          const isEmpty = c.rate === null;
          const isSelected = (pinned?.day === c.day) || (!pinned && selected?.day === c.day);

          return (
            <button
              key={c.day}
              aria-label={isEmpty
                ? `${c.date.toDateString()} — no data`
                : `${c.date.toDateString()} — ${c.rate}% attendance`}
              aria-pressed={pinned?.day === c.day}
              onClick={() => {
                if (isEmpty) return;
                setPinned(p => (p?.day === c.day ? null : c));
              }}
              onMouseEnter={() => !isEmpty && setSelected(c)}
              onMouseLeave={() => setSelected(null)}
              onFocus={() => !isEmpty && setSelected(c)}
              disabled={isEmpty}
              style={{
                aspectRatio: '1',
                borderRadius: 9,
                background: colour?.bg
                  ?? (c.isWeekend ? 'transparent' : 'var(--surface-soft)'),
                border: c.isToday
                  ? '2.5px solid var(--teal)'
                  : isSelected
                    ? '2px solid rgba(15, 30, 40, 0.4)'
                    : c.isWeekend
                      ? '1px dashed var(--border)'
                      : '1px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1,
                fontWeight: 700,
                color: colour?.text ?? 'var(--text-soft)',
                cursor: isEmpty ? 'default' : 'pointer',
                transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 6px 16px rgba(15, 30, 40, 0.25)'
                  : 'none',
                opacity: c.isFuture ? 0.4 : 1,
                position: 'relative',
                padding: 0,
              }}
            >
              <span style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '0.82rem',
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                textShadow: colour?.bg && colour.text === '#fff'
                  ? '0 1px 1px rgba(0,0,0,0.18)' : 'none',
              }}>
                {c.day}
              </span>
              {!isEmpty && (
                <span style={{
                  fontSize: '0.5rem',
                  fontWeight: 800,
                  opacity: 0.95,
                  letterSpacing: '0.02em',
                  textShadow: colour.text === '#fff' ? '0 1px 1px rgba(0,0,0,0.18)' : 'none',
                }}>
                  {c.rate}%
                </span>
              )}
              {c.isToday && (
                <span style={{
                  position: 'absolute', top: -8, right: -4,
                  fontSize: '0.55rem', fontWeight: 800,
                  background: 'var(--teal)', color: '#fff',
                  padding: '2px 6px', borderRadius: 99,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(20,184,184,0.4)',
                }}>
                  Today
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Pinned-date detail panel ────────── */}
      {pinned && bd && (
        <div
          role="region"
          aria-label={`Details for ${pinned.date.toDateString()}`}
          style={{
            marginTop: 14,
            background: 'var(--surface-card)',
            border: `1.5px solid ${cellColour(pinned.rate)?.bg ?? 'var(--border)'}`,
            borderRadius: 14,
            padding: '14px 16px',
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.18s ease',
          }}
        >
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: 10, marginBottom: 12,
          }}>
            <div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}>
                {pinned.date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {pinned.isToday ? 'Today' : null}
                {pinned.isToday && ' · '}
                <strong style={{ color: cellColour(pinned.rate)?.bg }}>{pinned.rate}% attendance</strong>
              </div>
            </div>
            <button
              onClick={() => setPinned(null)}
              aria-label="Close details"
              style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'var(--surface-soft)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
          }}>
            {[
              { label: 'Present', value: bd.present, icon: UserCheck, colour: 'var(--green)' },
              { label: 'Absent',  value: bd.absent,  icon: UserX,     colour: 'var(--red)'   },
              { label: 'Late',    value: bd.late,    icon: Clock,     colour: 'var(--amber, #F4D06F)' },
            ].map(({ label, value, icon: Icon, colour }) => (
              <div key={label} style={{
                background: 'var(--surface-soft)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em',
                  textTransform: 'uppercase', color: 'var(--text-soft)',
                  marginBottom: 4,
                }}>
                  <Icon size={11} strokeWidth={2.5} style={{ color: colour }} />
                  {label}
                </div>
                <div style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 800, fontSize: '1.25rem',
                  color: 'var(--text-primary)', letterSpacing: '-0.02em',
                }}>
                  {value}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  of {bd.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Info bar + legend ───────────────── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 16, gap: 12, flexWrap: 'wrap',
        background: 'var(--surface-soft)',
        border: '1px solid var(--border)',
        borderRadius: 11, padding: '10px 14px',
        minHeight: 40,
      }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {info ? (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {info.date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })}
              </strong>
              {' · '}
              <strong style={{
                color: cellColour(info.rate)?.bg ?? 'var(--text-soft)',
                fontSize: '0.95rem',
              }}>
                {info.rate ?? '·'}%
              </strong>
              {info.rate >= 95 && ' 🎉 excellent'}
              {info.rate >= 90 && info.rate < 95 && ' 👍 great'}
              {info.rate < 85 && info.rate !== null && ' ⚠️ flagged'}
            </span>
          ) : (
            <span style={{ color: 'var(--text-soft)' }}>
              Hover any day for a preview · click to pin a full breakdown
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.7rem', color: 'var(--text-soft)', fontWeight: 700,
        }}>
          <span>Low</span>
          {[
            { c: '#DC2626' }, { c: '#FF9966' }, { c: '#F4D06F' },
            { c: '#3DC48A' }, { c: '#0F9898' },
          ].map(({ c }) => (
            <span key={c} style={{
              width: 14, height: 14, borderRadius: 4,
              background: c, display: 'inline-block',
            }} />
          ))}
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
