import { useState, useMemo } from 'react';
import {
  ClipboardList, Check, X, Filter, MessageCircle, Stethoscope, Inbox,
} from 'lucide-react';
import Avatar from './Avatar';
import { ABSENCE_TYPES } from './AbsenceRequestForm';

const FILTERS = ['Pending', 'Approved', 'Declined', 'All'];

export default function AbsenceRequestsAdmin({ requests, onApprove, onReject }) {
  const [filter, setFilter] = useState('Pending');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    const map = { Pending: 'pending', Approved: 'approved', Declined: 'rejected' };
    const want = map[filter];
    return want
      ? requests.filter(r => r.status === want)
      : requests;
  }, [requests, filter]);

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <ClipboardList size={16} style={{ color: 'var(--teal)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Absence Requests</p>
          {pendingCount > 0 && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 800,
              background: 'var(--amber-light)', color: 'var(--amber)',
              border: '1px solid var(--amber-border)',
              padding: '2px 9px', borderRadius: 99,
            }}>
              {pendingCount} pending
            </span>
          )}
        </div>
        <div style={{
          display: 'flex', gap: 3, padding: 3,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 9,
        }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px', borderRadius: 7,
                background: filter === f ? 'var(--surface-card)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: filter === f ? 700 : 500,
                fontSize: '0.78rem',
                boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.12s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '32px 0',
          color: 'var(--text-soft)',
        }}>
          <Inbox size={28} strokeWidth={1.5} style={{ margin: '0 auto 10px', color: 'var(--border-strong)' }} />
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            No {filter.toLowerCase()} requests
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {filtered.map(r => {
            const t = ABSENCE_TYPES.find(x => x.id === r.type);
            const isExpanded = expanded === r.id;
            const statusMap = {
              pending:  { bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
              approved: { bg: 'var(--green-light)', border: 'var(--green-border)', color: 'var(--green)' },
              rejected: { bg: 'var(--red-light)',   border: 'var(--red-border)',   color: 'var(--red)'   },
            }[r.status];
            return (
              <div
                key={r.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: 12,
                  background: 'var(--surface-soft)',
                  border: `1px solid ${statusMap.border}`,
                  borderLeft: `3px solid ${statusMap.color}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={r.student} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.student}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>
                        Year {r.year} · {r.class}
                      </span>
                      {r.medical && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          fontSize: '0.66rem', fontWeight: 700,
                          color: 'var(--blue)', background: 'var(--blue-light)',
                          padding: '1px 7px', borderRadius: 99,
                          border: '1px solid var(--blue-border)',
                        }}>
                          <Stethoscope size={9} strokeWidth={2.5} />
                          Medical
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <span style={{ marginRight: 6 }}>{t?.icon}</span>
                      <strong style={{ color: t?.colour, fontWeight: 700 }}>{t?.label}</strong>
                      <span style={{ margin: '0 6px', color: 'var(--border-strong)' }}>·</span>
                      {r.fromDate}{r.fromDate !== r.toDate ? ` → ${r.toDate}` : ''}
                      <span style={{ margin: '0 6px', color: 'var(--border-strong)' }}>·</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{r.id}</span>
                    </div>
                  </div>

                  {r.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => onApprove(r.id)}
                        title="Approve"
                        style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: 'var(--green)',
                          color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <Check size={15} strokeWidth={3} />
                      </button>
                      <button
                        onClick={() => onReject(r.id)}
                        title="Decline"
                        style={{
                          width: 34, height: 34, borderRadius: 9,
                          background: 'var(--surface-card)',
                          color: 'var(--red)',
                          border: '1px solid var(--red-border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={15} strokeWidth={3} />
                      </button>
                    </div>
                  ) : (
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800,
                      background: statusMap.bg, color: statusMap.color,
                      border: `1px solid ${statusMap.border}`,
                      padding: '4px 10px', borderRadius: 99,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}>
                      {r.status}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                  style={{
                    marginTop: 9, padding: 0,
                    background: 'transparent', color: 'var(--teal)',
                    fontWeight: 700, fontSize: '0.75rem',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <MessageCircle size={11} />
                  {isExpanded ? 'Hide details' : 'View parent\'s reason'}
                </button>

                {isExpanded && (
                  <div style={{
                    marginTop: 10, padding: '11px 13px',
                    borderRadius: 10,
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                    fontSize: '0.83rem', lineHeight: 1.55,
                    color: 'var(--text-secondary)',
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      From {r.parent}
                    </div>
                    <p style={{ margin: 0 }}>"{r.reason}"</p>
                    <div style={{ marginTop: 8, fontSize: '0.7rem', color: 'var(--text-soft)' }}>
                      Submitted {r.submitted}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
