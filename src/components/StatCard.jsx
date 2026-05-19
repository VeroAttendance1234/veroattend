export default function StatCard({ label, value, sub, accent, icon: Icon, trend }) {
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
    }}>
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

      <div style={{
        display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4,
      }}>
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
        {value}
      </div>

      {sub && (
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: accent || 'var(--teal)',
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
