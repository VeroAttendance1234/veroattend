import { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/**
 * AttendanceHeatmap — month-grid heatmap of school attendance %.
 * GitHub-contribution-graph style. Hover a cell to see the date + rate.
 *
 * Deterministic seeded data so the same date always shows the same rate
 * (no flicker between renders).
 */
export default function AttendanceHeatmap() {
  const [offset, setOffset] = useState(0); // 0 = current month, -1 = last
  const [hover, setHover]   = useState(null);

  const { year, month, days, weeks } = useMemo(() => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const y = d.getFullYear(), m = d.getMonth();
    const firstDay = (d.getDay() + 6) % 7; // make Monday = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m, day);
      const dow = date.getDay();
      const isWeekend = dow === 0 || dow === 6;
      // Seeded rate from date
      const seed = (y * 1000 + (m + 1) * 31 + day) % 23;
      let rate = isWeekend ? null : 78 + ((seed * 7) % 20); // 78–98%
      if (date > now) rate = null; // future
      cells.push({ day, date, rate, isWeekend, isFuture: date > now, isToday: date.toDateString() === now.toDateString() });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const weekRows = [];
    for (let i = 0; i < cells.length; i += 7) weekRows.push(cells.slice(i, i + 7));

    return { year: y, month: m, days: cells, weeks: weekRows };
  }, [offset]);

  function cellColour(rate) {
    if (rate === null) return 'transparent';
    if (rate >= 95) return 'var(--green)';
    if (rate >= 90) return '#3DC48A';
    if (rate >= 85) return '#FFD06E';
    if (rate >= 80) return '#FF9966';
    return 'var(--red)';
  }

  const monthRates = days.filter(d => d && d.rate !== null).map(d => d.rate);
  const monthAvg   = monthRates.length
    ? Math.round(monthRates.reduce((a, b) => a + b, 0) / monthRates.length)
    : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
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
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 9, padding: 3,
        }}>
          <button
            onClick={() => setOffset(o => o - 1)}
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'transparent', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <span style={{
            fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)',
            minWidth: 120, textAlign: 'center',
          }}>
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={() => setOffset(o => Math.min(0, o + 1))}
            disabled={offset === 0}
            style={{
              width: 26, height: 26, borderRadius: 6,
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

      {/* Day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: '0.65rem', fontWeight: 800,
            color: i >= 5 ? 'var(--text-soft)' : 'var(--text-muted)',
            letterSpacing: '0.06em',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {days.map((c, i) => {
          if (!c) return <div key={i} style={{ aspectRatio: '1', }} />;
          const colour = cellColour(c.rate);
          const isEmpty = c.rate === null;
          return (
            <div
              key={i}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              style={{
                aspectRatio: '1',
                borderRadius: 7,
                background: isEmpty
                  ? c.isWeekend ? 'transparent' : 'var(--surface-soft)'
                  : colour,
                border: c.isToday ? '2px solid var(--teal)' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                color: isEmpty ? 'var(--text-soft)' : '#fff',
                cursor: !isEmpty ? 'default' : 'default',
                transition: 'transform 0.12s ease',
                transform: hover?.day === c.day ? 'scale(1.1)' : 'scale(1)',
                opacity: c.isFuture ? 0.35 : 1,
              }}
            >
              {c.day}
            </div>
          );
        })}
      </div>

      {/* Hover info + legend */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 14, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {hover ? (
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {hover.date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'short' })}
              </strong>
              {' — '}
              <strong style={{ color: cellColour(hover.rate) }}>{hover.rate ?? '—'}%</strong>
              {hover.isWeekend && ' (weekend)'}
              {hover.isFuture && ' (upcoming)'}
            </span>
          ) : (
            'Hover a day to see details'
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.7rem', color: 'var(--text-soft)', fontWeight: 700 }}>
          <span>Low</span>
          {['var(--red)','#FF9966','#FFD06E','#3DC48A','var(--green)'].map(c => (
            <span key={c} style={{ width: 12, height: 12, borderRadius: 3, background: c, display: 'inline-block' }} />
          ))}
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
