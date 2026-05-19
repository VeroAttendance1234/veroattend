const STYLES = {
  present: {
    bg: 'var(--green-light)',
    color: 'var(--green)',
    border: 'var(--green-border)',
    dot: '#16A34A',
  },
  absent: {
    bg: 'var(--red-light)',
    color: 'var(--red)',
    border: 'var(--red-border)',
    dot: '#DC2626',
  },
  late: {
    bg: 'var(--amber-light)',
    color: 'var(--amber)',
    border: 'var(--amber-border)',
    dot: '#D97706',
  },
  info: {
    bg: 'var(--blue-light)',
    color: 'var(--blue)',
    border: 'var(--blue-border)',
    dot: '#2563EB',
  },
  warn: {
    bg: 'var(--red-light)',
    color: 'var(--red)',
    border: 'var(--red-border)',
    dot: '#DC2626',
  },
  teal: {
    bg: 'var(--teal-glow)',
    color: 'var(--teal)',
    border: 'var(--teal-border)',
    dot: '#14B8B8',
  },
};

export default function Badge({ status = 'info', children, dot = false }) {
  const s = STYLES[status] || STYLES.info;

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 99,
      fontSize: '0.75rem',
      fontWeight: 700,
      letterSpacing: '0.01em',
      whiteSpace: 'nowrap',
    }}>
      {dot && (
        <span style={{
          display: 'inline-block',
          width: 6, height: 6,
          borderRadius: '50%',
          background: s.dot,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}
