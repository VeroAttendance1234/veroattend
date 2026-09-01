import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, GraduationCap, CalendarCheck, Award } from 'lucide-react';
import Card from './Card';
import { studentYears, studentAttendanceByTerm, studentGrades } from '../data/sampleData';

/*  How long the attendance record actually runs, read off the data rather
    than written into the headings. These were hardcoded as "6-Year" and
    "Year 7 → Year 12", so when the persona became a Year 11 student the
    labels carried on claiming a Year 12 record and nothing failed to
    flag it. Derived at module scope because both cards below need them. */
const SPAN_YEARS = studentYears.length;
const FIRST_YEAR = studentYears[0]?.year ?? 'Year 7';
const LAST_YEAR  = studentYears[studentYears.length - 1]?.year ?? 'Year 11';

/* Colour scales ─────────────────────────────────────────────── */
function rateColour(r) {
  if (r >= 96) return { color: 'var(--green)', bg: 'var(--green-light)', border: 'var(--green-border)' };
  if (r >= 92) return { color: 'var(--teal)',  bg: 'var(--teal-glow)',   border: 'var(--teal-border)'  };
  return { color: 'var(--amber)', bg: 'var(--amber-light)', border: 'var(--amber-border)' };
}
function markColour(m) {
  if (m >= 90) return { color: 'var(--green)', bg: 'var(--green-light)', border: 'var(--green-border)' };
  if (m >= 80) return { color: 'var(--teal)',  bg: 'var(--teal-glow)',   border: 'var(--teal-border)'  };
  if (m >= 70) return { color: 'var(--blue)',  bg: 'var(--blue-light)',  border: 'var(--blue-border)'  };
  return { color: 'var(--amber)', bg: 'var(--amber-light)', border: 'var(--amber-border)' };
}

const AttTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '6px 11px', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ color: 'var(--teal)', fontWeight: 700 }}>{payload[0].value}% present</div>
    </div>
  );
};

const AcaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '6px 11px', fontSize: '0.78rem', boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ color: 'var(--purple)', fontWeight: 700 }}>{payload[0].value} avg mark</div>
    </div>
  );
};

/* ── 6-year attendance journey ──────────────────────────────── */
export function AttendanceJourney({ name = 'Grace' }) {
  const first = name.split(' ')[0];
  const avg = Math.round(
    (studentYears.reduce((a, y) => a + y.attendance, 0) / studentYears.length) * 10
  ) / 10;
  const totalAbsent = studentYears.reduce((a, y) => a + y.absent, 0);
  const best = studentYears.reduce((a, y) => (y.attendance > a.attendance ? y : a));

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CalendarCheck size={16} style={{ color: 'var(--teal)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Attendance · {SPAN_YEARS}-Year History</p>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {FIRST_YEAR} → {LAST_YEAR} · {first}
        </span>
      </div>

      {/* Headline stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: `${SPAN_YEARS}-Year Average`, value: `${avg}%`,  colour: 'var(--teal)'  },
          { label: 'Best Year',      value: best.year.replace('Year ', 'Yr '), sub: `${best.attendance}%`, colour: 'var(--green)' },
          { label: 'Total Days Absent', value: totalAbsent,       colour: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface-soft)', border: '1px solid var(--border)',
            borderRadius: 11, padding: '11px 13px',
          }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-soft)', marginBottom: 5 }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
              fontSize: '1.35rem', color: s.colour, letterSpacing: '-0.02em', lineHeight: 1,
            }}>
              {s.value}{s.sub && <span style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginLeft: 5 }}>{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Term-by-term area chart */}
      <div style={{
        background: 'var(--surface-soft)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '14px 16px 8px', marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Attendance by term
        </div>
        <ResponsiveContainer width="100%" height={150}>
          <AreaChart data={studentAttendanceByTerm} margin={{ top: 4, right: 4, left: -26, bottom: 0 }}>
            <defs>
              <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--teal)" stopOpacity={0.22} />
                <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 8, fill: 'var(--text-soft)' }} axisLine={false} tickLine={false} interval={3} />
            <YAxis domain={[85, 100]} tick={{ fontSize: 9, fill: 'var(--text-soft)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip content={<AttTooltip />} />
            <Area type="monotone" dataKey="rate" stroke="var(--teal)" strokeWidth={2} fill="url(#attGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--teal)', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-year chips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
        {studentYears.map(y => {
          const c = rateColour(y.attendance);
          return (
            <div key={y.year} style={{
              textAlign: 'center', padding: '9px 4px', borderRadius: 10,
              background: c.bg, border: `1px solid ${c.border}`,
            }}>
              <div style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>
                {y.year.replace('Year ', 'Yr ')}
              </div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: c.color, letterSpacing: '-0.02em' }}>
                {y.attendance}%
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Academic results ───────────────────────────────────────── */
export function AcademicResults({ name = 'Grace' }) {
  const first = name.split(' ')[0];
  const avgMark = Math.round(studentGrades.reduce((a, g) => a + g.mark, 0) / studentGrades.length);
  // Year 11 Preliminary reports an A-E common grade, not an HSC band, so the
  // headline counts top grades rather than Band 6s.
  const topGrades = studentGrades.filter(g => g.grade === 'A').length;

  return (
    <Card style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GraduationCap size={17} style={{ color: 'var(--purple)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Academic Results · Year 11</p>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)' }}>
          <Award size={13} /> {topGrades} subjects at A grade
        </span>
      </div>

      {/* Headline + yearly average trend */}
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14, marginBottom: 16 }} className="aca-split">
        <div style={{
          background: 'var(--purple-light)', border: '1px solid var(--purple-border)',
          borderRadius: 12, padding: '14px 12px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--purple)', marginBottom: 4 }}>
            Course Average
          </div>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '2rem', color: 'var(--purple)', letterSpacing: '-0.03em', lineHeight: 1 }}>
            {avgMark}
          </div>
          <div style={{ fontSize: '0.66rem', color: 'var(--text-soft)', marginTop: 4, fontWeight: 600 }}>across 6 courses</div>
        </div>

        <div style={{
          background: 'var(--surface-soft)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 14px 6px',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Yearly average · {FIRST_YEAR} → {LAST_YEAR.replace('Year ', '')}
          </div>
          <ResponsiveContainer width="100%" height={96}>
            <AreaChart data={studentYears} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
              <defs>
                <linearGradient id="acaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--purple)" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="var(--purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 8, fill: 'var(--text-soft)' }} axisLine={false} tickLine={false} tickFormatter={v => v.replace('Year ', 'Yr ')} />
              <YAxis domain={[70, 95]} tick={{ fontSize: 9, fill: 'var(--text-soft)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<AcaTooltip />} />
              <Area type="monotone" dataKey="average" stroke="var(--purple)" strokeWidth={2} fill="url(#acaGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--purple)', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {studentGrades.map(g => {
          const c = markColour(g.mark);
          const up = g.trend >= 0;
          return (
            <div key={g.subject} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 13px', borderRadius: 10,
              background: 'var(--surface-soft)', border: '1px solid var(--border)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.subject}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-soft)', marginTop: 2 }}>{g.teacher}</div>
              </div>
              <span style={{
                fontSize: '0.66rem', fontWeight: 800, padding: '2px 9px', borderRadius: 99,
                background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              }}>
                {g.rank}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                fontSize: '0.7rem', fontWeight: 800,
                color: up ? 'var(--green)' : 'var(--red)', width: 42, justifyContent: 'flex-end',
              }}>
                {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {up ? '+' : ''}{g.trend}
              </span>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
                fontSize: '1.15rem', color: c.color, letterSpacing: '-0.02em',
                width: 40, textAlign: 'right',
              }}>
                {g.mark}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
