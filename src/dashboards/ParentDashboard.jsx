import {
  Heart, Target, Bell, TrendingUp, CheckCircle, Circle,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import AbsenceRequestForm from '../components/AbsenceRequestForm';
import MessagingPanel from '../components/MessagingPanel';
import Reveal from '../components/Reveal';
import { MessageSquare } from 'lucide-react';
import {
  attendanceHistory, notifications, goals, journalEntries,
} from '../data/sampleData';

const MOODS = [
  { emoji: '😔', label: 'Struggling' },
  { emoji: '😐', label: 'Okay'       },
  { emoji: '🙂', label: 'Good'       },
  { emoji: '😊', label: 'Great'      },
  { emoji: '😄', label: 'Amazing'    },
];

const weekMoods = journalEntries.slice(0, 5).map(e => e.mood);

function weekRate(history) {
  const present = history.filter(d => d.status === 'present').length;
  return Math.round((present / history.length) * 100);
}

function sentimentLabel(moods) {
  const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
  if (avg >= 3.5) return { text: 'Positive week 😊', color: 'var(--green)', bg: 'var(--green-light)', border: 'var(--green-border)' };
  if (avg >= 2.5) return { text: 'Mixed week 🙂', color: 'var(--teal)', bg: 'var(--teal-glow)', border: 'var(--teal-border)' };
  return { text: 'Tough week · worth checking in', color: 'var(--amber)', bg: 'var(--amber-light)', border: 'var(--amber-border)' };
}

export default function ParentDashboard({
  students,
  absenceRequests = [], onSubmitAbsence,
  threads = [], onSendMessage,
}) {
  const child    = students.find(s => s.id === 'S001') || students[0];
  const rate     = weekRate(attendanceHistory);
  const doneGoals = goals.filter(g => g.done).length;
  const sentiment = sentimentLabel(weekMoods);

  return (
    <div className="page">

      {/* ── Child header card ──────────────────── */}
      <div style={{
        background: 'var(--surface-card)',
        border: `2px solid ${child?.present ? 'var(--teal)' : 'var(--red)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '22px 26px',
        marginBottom: 22,
        boxShadow: 'var(--shadow-md)',
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <Avatar name={child?.name || 'student'} size={60} status={child?.present ? 'present' : 'absent'} ring={child?.present ? 'var(--teal)' : 'var(--red-border)'} />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.375rem', marginBottom: 6 }}>{child?.name}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Year {child?.year} · Class {child?.class}
            </span>
            <Badge status={child?.present ? 'present' : 'absent'} dot>
              {child?.present ? 'Present today' : 'Not yet checked in'}
            </Badge>
          </div>
        </div>
        <div style={{
          padding: '12px 20px', borderRadius: 14,
          background: child?.present ? 'var(--teal-glow)' : 'var(--red-light)',
          border: `1px solid ${child?.present ? 'var(--teal-border)' : 'var(--red-border)'}`,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '1.75rem', fontWeight: 800,
            color: child?.present ? 'var(--teal)' : 'var(--red)',
            letterSpacing: '-0.03em', lineHeight: 1,
          }}>
            {rate}%
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Week rate
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>

        {/* ── Attendance history ─────────────────── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={15} style={{ color: 'var(--teal)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>This Week's Attendance</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            {attendanceHistory.map(d => (
              <div key={d.date} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 13px', borderRadius: 10,
                background: d.status === 'present' ? 'var(--green-light)' : 'var(--surface-soft)',
                border: `1px solid ${d.status === 'present' ? 'var(--green-border)' : 'var(--border)'}`,
              }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{d.date}</span>
                <Badge status={d.status} dot>
                  {d.status === 'present' ? 'Present' : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700 }}>
            Week attendance rate: {rate}%
          </div>
          <div style={{ background: 'var(--border)', borderRadius: 99, height: 7, overflow: 'hidden' }}>
            <div style={{
              width: `${rate}%`, height: '100%', borderRadius: 99,
              background: rate >= 80 ? 'var(--green)' : 'var(--red)',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </Card>

        {/* ── Wellbeing summary ─────────────────── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Heart size={15} style={{ color: 'var(--pink)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>Wellbeing This Week</p>
          </div>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Mood check-ins from {child?.name?.split(' ')[0]}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
            {weekMoods.map((m, i) => (
              <div key={i} style={{
                textAlign: 'center',
                background: 'var(--surface-soft)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '8px 6px',
                flex: 1,
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{MOODS[m].emoji}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {['M', 'T', 'W', 'T', 'F'][i]}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            textAlign: 'center', padding: '11px 16px', borderRadius: 10,
            background: sentiment.bg,
            border: `1px solid ${sentiment.border}`,
            fontWeight: 700, fontSize: '0.875rem',
            color: sentiment.color,
          }}>
            {sentiment.text}
          </div>
        </Card>
      </div>

      {/* ── Absence request ───────────────────── */}
      <Reveal>
      <div style={{ marginBottom: 20 }}>
        <AbsenceRequestForm
          student={child}
          parent="J. Patel"
          requests={absenceRequests}
          onSubmit={onSubmitAbsence}
        />
      </div>
      </Reveal>

      {/* ── Messaging ─────────────────────────── */}
      <Reveal>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <MessageSquare size={16} style={{ color: 'var(--purple)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Messages</p>
        </div>
        <MessagingPanel role="parent" userName="J. Patel" threads={threads} onSend={onSendMessage} />
      </Card>
      </Reveal>

      {/* ── Recent journal entries ─────────────── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Heart size={15} style={{ color: 'var(--pink)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Recent Journal Entries</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {journalEntries.slice(0, 3).map(entry => (
            <div key={entry.id} style={{
              padding: '13px 16px', borderRadius: 12,
              background: 'var(--surface-soft)', border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
                <span style={{ fontSize: '1rem' }}>{MOODS[entry.mood]?.emoji || '🙂'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 800 }}>{entry.date}</span>
                <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>·</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>
                  {MOODS[entry.mood]?.label || 'Good'}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>{entry.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid-2">

        {/* ── Goals read-only ───────────────────── */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={15} style={{ color: 'var(--teal)' }} />
              <p className="section-title" style={{ marginBottom: 0 }}>Goals Progress</p>
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)' }}>
              {doneGoals}/{goals.length} done
            </span>
          </div>

          <div style={{ background: 'var(--border)', borderRadius: 99, height: 7, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.round((doneGoals / goals.length) * 100)}%`, height: '100%',
              borderRadius: 99, background: 'var(--green)', transition: 'width 0.5s',
            }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {goals.map(g => (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10,
                background: g.done ? 'var(--green-light)' : 'var(--surface-soft)',
                border: `1px solid ${g.done ? 'var(--green-border)' : 'var(--border)'}`,
              }}>
                <div style={{ flexShrink: 0, color: g.done ? 'var(--green)' : 'var(--text-soft)' }}>
                  {g.done ? <CheckCircle size={16} strokeWidth={2.5} /> : <Circle size={16} strokeWidth={2} />}
                </div>
                <div style={{
                  flex: 1, fontSize: '0.875rem',
                  textDecoration: g.done ? 'line-through' : 'none',
                  color: g.done ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>
                  {g.text}
                </div>
                {g.due !== '·' && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)', flexShrink: 0 }}>
                    Due {g.due}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* ── Notifications ─────────────────────── */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Bell size={15} style={{ color: 'var(--amber)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>Recent Alerts</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                display: 'flex', gap: 12, padding: '11px 14px', borderRadius: 10,
                background: n.type === 'warn' ? 'var(--red-light)' : 'var(--blue-light)',
                border: `1px solid ${n.type === 'warn' ? 'var(--red-border)' : 'var(--blue-border)'}`,
              }}>
                <span style={{ fontSize: '0.9rem', lineHeight: 1.2 }}>
                  {n.type === 'warn' ? '⚠️' : 'ℹ️'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.text}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
