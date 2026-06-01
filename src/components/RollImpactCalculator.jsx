/**
 * RollImpactCalculator
 * ─────────────────────────────────────────────────────────────
 * Live visual of how much teaching time is lost to manual roll
 * marking. Drag the sliders → every number, bar, and unit
 * conversion updates in real time.
 *
 * Default values match the brief:
 *   5 min/period × 6 periods/day × 5 days × 40 weeks × 30 staff
 *   = 18,000 minutes/year = 300 hours = 37.5 working days lost
 */
import { useMemo, useState } from 'react';
import {
  Clock, Calendar, Users, DollarSign, AlertTriangle, GraduationCap,
} from 'lucide-react';

const WEEKS_PER_YEAR  = 40;
const HOURLY_RATE_AUD = 65;   // award rate for NSW secondary teachers (~$110k / 1700h)

export default function RollImpactCalculator() {
  const [perPeriod, setPerPeriod] = useState(5);    // minutes
  const [periods,   setPeriods]   = useState(6);    // periods/day
  const [staff,     setStaff]     = useState(30);   // teachers

  const calc = useMemo(() => {
    const minPerDay  = perPeriod * periods;
    const minPerWeek = minPerDay * 5;
    const minPerYear = minPerWeek * WEEKS_PER_YEAR;
    const minPerYearSchool = minPerYear * staff;

    const hoursYearTeacher = minPerYear / 60;
    const hoursYearSchool  = minPerYearSchool / 60;
    const daysYearSchool   = hoursYearSchool / 6; // 6 teaching hrs/day
    const dollarsLost      = Math.round(hoursYearSchool * HOURLY_RATE_AUD);
    // 30-min class periods → how many extra class-equivalents lost
    const classEquivalents = Math.round(hoursYearSchool * 2);

    return {
      minPerDay, minPerWeek, minPerYear, minPerYearSchool,
      hoursYearTeacher, hoursYearSchool, daysYearSchool,
      dollarsLost, classEquivalents,
    };
  }, [perPeriod, periods, staff]);

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* ── Header ───────────────────────────── */}
      <div style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(220,38,38,0.06) 0%, rgba(20,184,184,0.04) 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(220,38,38,0.12)',
            color: 'var(--red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(220,38,38,0.2)',
          }}>
            <AlertTriangle size={18} strokeWidth={2.2} />
          </span>
          <div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '1.06rem',
              color: 'var(--text-primary)', letterSpacing: '-0.015em',
            }}>
              Time lost to manual roll marking
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Live calculator · drag the sliders to model your school
            </div>
          </div>
        </div>
      </div>

      {/* ── Top-line headline number ─────────── */}
      <div style={{
        padding: '28px 24px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div className="label-caps" style={{ color: 'var(--text-muted)', marginBottom: 6 }}>
          Across the whole school, every year
        </div>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(2.6rem, 7vw, 4.6rem)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, var(--red) 0%, var(--teal) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 6,
          transition: 'all 0.3s ease',
        }}>
          {Math.round(calc.hoursYearSchool).toLocaleString()} <span style={{ fontSize: '0.45em' }}>hours</span>
        </div>
        <div style={{
          fontSize: '0.95rem', color: 'var(--text-secondary)',
          lineHeight: 1.5, maxWidth: 580, margin: '0 auto',
        }}>
          That's <strong style={{ color: 'var(--text-primary)' }}>{Math.round(calc.daysYearSchool)} full teaching days</strong>{' '}
          – or roughly <strong style={{ color: 'var(--teal-dark)' }}>{calc.classEquivalents.toLocaleString()} class periods</strong>{' '}
          of teaching time lost to admin every single year.
        </div>
      </div>

      {/* ── Sliders + breakdown ──────────────── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 0,
      }} className="impact-grid">
        {/* Sliders */}
        <div style={{
          padding: '24px',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <Slider
            label="Minutes per period"
            value={perPeriod}
            onChange={setPerPeriod}
            min={2} max={10} step={1}
            unit="min"
            icon={Clock}
            accent="#DC2626"
          />
          <Slider
            label="Periods per day"
            value={periods}
            onChange={setPeriods}
            min={3} max={8} step={1}
            unit="periods"
            icon={Calendar}
            accent="#2563EB"
          />
          <Slider
            label="Teaching staff"
            value={staff}
            onChange={setStaff}
            min={5} max={120} step={1}
            unit="teachers"
            icon={Users}
            accent="#7C3AED"
          />

          {/* Equation breakdown */}
          <div style={{
            marginTop: 6,
            padding: '12px 14px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            lineHeight: 1.7,
            color: 'var(--text-muted)',
          }}>
            <div>{perPeriod}m × {periods}p&nbsp;&nbsp;&nbsp;&nbsp;= <strong style={{ color: 'var(--text-primary)' }}>{calc.minPerDay} min/day</strong></div>
            <div>× 5 days&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong style={{ color: 'var(--text-primary)' }}>{calc.minPerWeek} min/week</strong></div>
            <div>× {WEEKS_PER_YEAR} weeks&nbsp;&nbsp;&nbsp;= <strong style={{ color: 'var(--text-primary)' }}>{Math.round(calc.hoursYearTeacher)} h/yr per teacher</strong></div>
            <div>× {staff} staff&nbsp;&nbsp;&nbsp;= <strong style={{ color: 'var(--teal-dark)' }}>{Math.round(calc.hoursYearSchool).toLocaleString()} h/yr school-wide</strong></div>
          </div>
        </div>

        {/* Impact cards */}
        <div style={{
          padding: '24px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
          alignContent: 'start',
        }}>
          <ImpactStat
            icon={Calendar}
            label="Teaching days lost"
            value={Math.round(calc.daysYearSchool).toLocaleString()}
            sub="per year, across the school"
            colour="#DC2626"
          />
          <ImpactStat
            icon={GraduationCap}
            label="Class-equivalents lost"
            value={calc.classEquivalents.toLocaleString()}
            sub="30-min lessons not taught"
            colour="#2563EB"
          />
          <ImpactStat
            icon={DollarSign}
            label="Labour cost"
            value={`$${calc.dollarsLost.toLocaleString()}`}
            sub={`at $${HOURLY_RATE_AUD}/h NSW teacher rate`}
            colour="#16A34A"
          />
          <ImpactStat
            icon={Clock}
            label="Per teacher per year"
            value={`${Math.round(calc.hoursYearTeacher)} h`}
            sub={`~${Math.round(calc.hoursYearTeacher / 6)} working days`}
            colour="#0F9898"
          />

          {/* Visual bar - annual hours */}
          <div style={{
            gridColumn: '1 / -1',
            padding: '12px 14px',
            background: 'var(--teal-glow)',
            border: '1px solid var(--teal-border)',
            borderRadius: 11,
            marginTop: 4,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.7rem', fontWeight: 800,
              color: 'var(--teal-dark)', letterSpacing: '0.04em',
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              <span>VERO cuts this to under 2 sec/class</span>
              <span>{Math.round(99.3)}% recovered</span>
            </div>
            <div style={{
              position: 'relative', height: 10, borderRadius: 99,
              background: 'rgba(220,38,38,0.18)', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: '99.3%',
                background: 'linear-gradient(90deg, var(--teal) 0%, var(--green) 100%)',
                borderRadius: 99,
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{
              fontSize: '0.74rem', color: 'var(--text-muted)',
              marginTop: 8, lineHeight: 1.5,
            }}>
              At a 2-second tap, that {Math.round(calc.hoursYearSchool).toLocaleString()} h drops to
              under <strong style={{ color: 'var(--teal-dark)' }}>
                {Math.round(calc.hoursYearSchool * 0.007).toLocaleString()} hours
              </strong> – a reclaim of
              ~<strong style={{ color: 'var(--green)' }}>
                {Math.round(calc.hoursYearSchool * 0.993).toLocaleString()} hours
              </strong>{' '}
              of teaching every year.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .impact-grid { grid-template-columns: 1fr !important; }
          .impact-grid > div { border-right: none !important; border-bottom: 1px solid var(--border); }
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────── */
function Slider({ label, value, onChange, min, max, step, unit, icon: Icon, accent }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Icon size={14} strokeWidth={2.3} style={{ color: accent }} />
          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            {label}
          </span>
        </div>
        <span style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '1rem',
          color: accent, letterSpacing: '-0.02em',
        }}>
          {value} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        style={{
          width: '100%',
          accentColor: accent,
          cursor: 'pointer',
        }}
      />
    </div>
  );
}

function ImpactStat({ icon: Icon, label, value, sub, colour }) {
  return (
    <div style={{
      background: 'var(--surface-soft)',
      border: '1px solid var(--border)',
      borderRadius: 11,
      padding: '12px 13px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em',
        textTransform: 'uppercase', color: 'var(--text-soft)',
        marginBottom: 5,
      }}>
        <Icon size={11} strokeWidth={2.5} style={{ color: colour }} />
        {label}
      </div>
      <div style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontWeight: 800, fontSize: '1.5rem',
        color: colour, letterSpacing: '-0.025em',
        transition: 'all 0.3s ease',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
        {sub}
      </div>
    </div>
  );
}
