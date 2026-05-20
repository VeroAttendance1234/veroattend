import { useState } from 'react';
import {
  Calendar, FileText, Send, Paperclip, X, CheckCircle, ClipboardList,
} from 'lucide-react';
import Card from './Card';

const TYPES = [
  { id: 'sick',         label: 'Illness',         icon: '🤒', colour: 'var(--red)'    },
  { id: 'appointment',  label: 'Appointment',     icon: '🏥', colour: 'var(--blue)'   },
  { id: 'family',       label: 'Family',          icon: '👨‍👩‍👧', colour: 'var(--purple)' },
  { id: 'sport',        label: 'Sport/Rep',       icon: '⚽',  colour: 'var(--amber)'  },
  { id: 'religious',    label: 'Religious',       icon: '🕊️', colour: 'var(--teal)'   },
  { id: 'other',        label: 'Other',           icon: '📝', colour: 'var(--text-muted)' },
];

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export default function AbsenceRequestForm({ student, parent, onSubmit, requests = [] }) {
  const [type,     setType]     = useState('sick');
  const [fromDate, setFromDate] = useState(todayISO());
  const [toDate,   setToDate]   = useState(todayISO());
  const [reason,   setReason]   = useState('');
  const [medical,  setMedical]  = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,    setError]    = useState('');

  // History filter · most recent first
  const ownRequests = requests
    .filter(r => r.studentId === student?.id)
    .sort((a, b) => b.submitted.localeCompare(a.submitted))
    .slice(0, 5);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please provide a reason (10 characters minimum)');
      return;
    }
    if (new Date(toDate) < new Date(fromDate)) {
      setError('End date can\'t be before start date');
      return;
    }

    const req = {
      id:         `AR-${Math.floor(Math.random() * 9000) + 1000}`,
      student:    student.name,
      studentId:  student.id,
      year:       student.year,
      class:      student.class,
      parent:     parent || 'Parent',
      type, fromDate, toDate,
      reason:     reason.trim(),
      submitted:  new Date().toISOString().slice(0, 16).replace('T', ' '),
      status:     'pending',
      medical,
    };

    onSubmit(req);
    setSubmitted(true);
    setReason('');
    setMedical(false);
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── New request form ─────────────────────── */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <ClipboardList size={16} style={{ color: 'var(--teal)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Submit Absence Request</p>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18 }}>
          Notify the school of a planned or current absence for <strong>{student?.name}</strong>.
          The admin team will review and respond.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Type chips */}
          <div>
            <div className="label-caps" style={{ marginBottom: 8 }}>Reason category</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TYPES.map(t => {
                const isActive = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 13px', borderRadius: 99,
                      background: isActive ? `${t.colour}15` : 'var(--surface-soft)',
                      color: isActive ? t.colour : 'var(--text-muted)',
                      border: `1.5px solid ${isActive ? t.colour : 'var(--border)'}`,
                      fontWeight: 700, fontSize: '0.8rem',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem' }}>{t.icon}</span>
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="label-caps" style={{ marginBottom: 6 }}>From</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '1px solid var(--border)', borderRadius: 9,
                padding: '0 12px', background: 'var(--surface)',
              }}>
                <Calendar size={14} style={{ color: 'var(--text-soft)' }} />
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: '9px 0', flex: 1, fontSize: '0.85rem' }}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 140 }}>
              <div className="label-caps" style={{ marginBottom: 6 }}>To</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                border: '1px solid var(--border)', borderRadius: 9,
                padding: '0 12px', background: 'var(--surface)',
              }}>
                <Calendar size={14} style={{ color: 'var(--text-soft)' }} />
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: '9px 0', flex: 1, fontSize: '0.85rem' }}
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <div className="label-caps" style={{ marginBottom: 6 }}>Details</div>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setError(''); }}
              rows={4}
              placeholder="Please provide context · symptoms, appointment details, expected return time, etc."
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 9,
                padding: '11px 13px', background: 'var(--surface)', resize: 'vertical',
                lineHeight: 1.55,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{reason.length} characters</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <input
                  type="checkbox"
                  checked={medical}
                  onChange={e => setMedical(e.target.checked)}
                  style={{ accentColor: 'var(--teal)' }}
                />
                Medical certificate to follow
              </label>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '9px 12px', borderRadius: 9,
              background: 'var(--red-light)', border: '1px solid var(--red-border)',
              color: 'var(--red)', fontSize: '0.82rem', fontWeight: 600,
            }}>
              {error}
            </div>
          )}
          {submitted && (
            <div style={{
              padding: '10px 14px', borderRadius: 9,
              background: 'var(--green-light)', border: '1px solid var(--green-border)',
              color: 'var(--green)', fontSize: '0.82rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <CheckCircle size={14} strokeWidth={2.5} />
              Request submitted · admin will review shortly.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '9px 16px' }}
            >
              <Paperclip size={14} />
              Attach file
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ marginLeft: 'auto' }}
            >
              <Send size={14} strokeWidth={2.5} />
              Submit request
            </button>
          </div>
        </form>
      </Card>

      {/* ── My recent requests ───────────────────── */}
      {ownRequests.length > 0 && (
        <Card>
          <p className="section-title">Recent Requests</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ownRequests.map(r => {
              const t = TYPES.find(x => x.id === r.type);
              const statusMap = {
                pending:  { bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Pending review' },
                approved: { bg: 'var(--green-light)', border: 'var(--green-border)', color: 'var(--green)', label: 'Approved' },
                rejected: { bg: 'var(--red-light)',   border: 'var(--red-border)',   color: 'var(--red)',   label: 'Declined' },
              }[r.status];
              return (
                <div key={r.id} style={{
                  padding: '12px 14px', borderRadius: 11,
                  background: 'var(--surface-soft)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem' }}>{t?.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t?.label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontFamily: 'monospace' }}>{r.id}</span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 800,
                      background: statusMap.bg, color: statusMap.color,
                      border: `1px solid ${statusMap.border}`,
                      padding: '2px 9px', borderRadius: 99,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {statusMap.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                    {r.fromDate} → {r.toDate} · Submitted {r.submitted}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {r.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export { TYPES as ABSENCE_TYPES };
