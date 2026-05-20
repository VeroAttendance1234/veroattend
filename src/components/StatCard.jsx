import { useMemo } from 'react';
import CountUp from './CountUp';

/**
 * StatCard · number + label tile.
 *
 * If `value` is a plain number (or numeric string), it animates from 0 → value
 * with a smooth count-up when scrolled into view. Strings with non-numeric
 * characters are rendered as-is.
 *
 * Format hints supported in string values:
 *   "91%"   → animates 91, appends %
 *   "1050"  → animates 1050 with thousands separator
 */
export default function StatCard({ label, value, sub, accent, icon: Icon, trend }) {
  /* Parse `value` once: detect numeric portion + suffix (%, etc.) */
  const parsed = useMemo(() => {
    if (typeof value === 'number') return { num: value, prefix: '', suffix: '' };
    const s = String(value ?? '');
    const m = s.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)([^\d]*)$/);
    if (!m) return null; // not animatable · render verbatim
    return { prefix: m[1], num: Number(m[2]), suffix: m[3] };
  }, [value]);

  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      boxShadow: 'var(--shadow-md)',
      borderTop: `3px solid ${accent || 'var(--teal)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.18s cubic-bezier(0.32,0.72,0,1), box-shadow 0.18s cubic-bezier(0.32,0.72,0,1)',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 8px 28px ${accent ? `${accent}22` : 'rgba(20,184,184,0.18)'}, 0 2px 6px rgba(47,62,70,0.06)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Background icon watermark */}
      {Icon && (
        <div style={{
          position: 'absolute', right: 14, top: 14,
          opacity: 0.07,
          color: accent || 'var(--teal)',
        }}>
          <Icon size={40} strokeWidth={1.5} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        {Icon && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `${accent || 'var(--teal)'}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent || 'var(--teal)',
            flexShrink: 0,
          }}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'var(--text-soft)',
        }}>
          {label}
        </span>
      </div>

      <div style={{
        fontFamily: 'Bricolage Grotesque, sans-serif',
        fontSize: '2rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1,
        letterSpacing: '-0.03em',
      }}>
        {parsed
          ? <CountUp value={parsed.num} prefix={parsed.prefix} suffix={parsed.suffix} />
          : value}
      </div>

      {sub && (
        <div style={{
          fontSize: '0.8rem',
          color: accent || 'var(--teal)',
          fontWeight: 600,
          marginTop: 2,
        }}>
          {sub}
        </div>
      )}

      {trend && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: trend > 0 ? 'var(--green)' : trend < 0 ? 'var(--red)' : 'var(--text-muted)',
          marginTop: 2,
        }}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}% vs last week
        </div>
      )}
    </div>
  );
}
