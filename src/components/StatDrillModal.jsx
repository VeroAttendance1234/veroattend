import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import Avatar from './Avatar';
import Badge from './Badge';

export default function StatDrillModal({
  title, accent, icon: Icon,
  students = [], emptyText = 'No students',
  onClose, onSelectStudent,
}) {
  const [search, setSearch] = useState('');

  const filtered = students.filter(s =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.class || '').toLowerCase().includes(search.toLowerCase())
  );

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 950,
        background: 'rgba(10,18,28,0.52)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.16s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: 520,
          maxHeight: '84vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 28px 72px rgba(10,18,28,0.24), 0 0 0 1px var(--border)',
          overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          borderTop: `3px solid ${accent || 'var(--teal)'}`,
          background: `color-mix(in srgb, ${accent || '#14B8B8'} 6%, var(--surface-card))`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {Icon && (
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: `color-mix(in srgb, ${accent || '#14B8B8'} 14%, transparent)`,
                border: `1px solid color-mix(in srgb, ${accent || '#14B8B8'} 22%, transparent)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: accent || 'var(--teal)',
              }}>
                <Icon size={17} strokeWidth={2} />
              </div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>{title}</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 1 }}>
                {students.length} student{students.length !== 1 ? 's' : ''} · click any row to view full profile
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border)', borderRadius: 9,
            padding: '0 12px', background: 'var(--surface-card)',
          }}>
            <Search size={13} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or class..."
              autoFocus
              style={{
                border: 'none', background: 'transparent',
                padding: '8px 0', flex: 1,
                fontSize: '0.84rem', color: 'var(--text-primary)',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ color: 'var(--text-soft)', background: 'none', padding: 2, lineHeight: 1 }}
              >
                <X size={11} />
              </button>
            )}
          </div>
          {search && (
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontWeight: 600 }}>
              {filtered.length} of {students.length} shown
            </div>
          )}
        </div>

        {/* Student list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {search ? `No results for "${search}"` : emptyText}
            </div>
          ) : (
            filtered.map(s => (
              <div
                key={s.id}
                onClick={() => { onSelectStudent?.(s); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
                  background: s.present ? 'var(--green-light)' : 'var(--surface-soft)',
                  border: `1px solid ${s.present ? 'var(--green-border)' : 'var(--border)'}`,
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateX(3px)';
                  e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={s.name} size={34} status={s.present ? 'present' : 'absent'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Year {s.year} · {s.class}</div>
                  </div>
                </div>
                <Badge
                  status={!s.present ? 'absent' : s.status === 'late' ? 'late' : s.status === 'out' ? 'info' : 'present'}
                  dot
                >
                  {!s.present ? 'Absent' : s.status === 'late' ? 'Late' : s.status === 'out' ? 'Out' : 'Present'}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
