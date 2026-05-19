import { useState } from 'react';
import {
  Users, UserCheck, UserX, TrendingUp,
  BookOpen, Calendar,
} from 'lucide-react';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LiveFeed from '../components/LiveFeed';
import RFIDSimulator from '../components/RFIDSimulator';
import { teachers, DEMO_TEACHER_ID, teacherTimetable, periods } from '../data/sampleData';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function todayKey() {
  const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  return DAYS.includes(d) ? d : 'Mon';
}

export default function TeacherDashboard({ students, setStudents, taps, onTap }) {
  const teacher = teachers.find(t => t.id === DEMO_TEACHER_ID);
  const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
  const today = todayKey();

  const classStudents = students.filter(s => s.class === selectedClass);
  const classTaps     = taps.filter(t => t.class === selectedClass);
  const present       = classStudents.filter(s => s.present).length;
  const absent        = classStudents.filter(s => !s.present).length;
  const rate          = classStudents.length ? Math.round((present / classStudents.length) * 100) : 0;

  return (
    <div className="page">

      {/* ── Teacher hero banner ─────────────────── */}
      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-md)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16,
          background: 'var(--blue-light)',
          border: '2px solid var(--blue-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', flexShrink: 0,
        }}>
          {teacher.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: 3 }}>{teacher.name}</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {teacher.subject}
            </span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <Badge status="info">{teacher.classes.length} classes</Badge>
            <Badge status="teal">{today}</Badge>
          </div>
        </div>
        <div style={{
          textAlign: 'right',
          padding: '12px 18px',
          borderRadius: 12,
          background: 'var(--teal-glow)',
          border: '1px solid var(--teal-border)',
        }}>
          <div style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '2rem', fontWeight: 800,
            color: 'var(--teal)', letterSpacing: '-0.04em', lineHeight: 1,
          }}>{rate}%</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Class rate
          </div>
        </div>
      </div>

      {/* ── Class selector ──────────────────────── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          My Classes
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {teacher.classes.map(c => {
            const cs = students.filter(s => s.class === c);
            const cp = cs.filter(s => s.present).length;
            const cr = cs.length ? Math.round((cp / cs.length) * 100) : 0;
            const isSelected = selectedClass === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  border: `2px solid ${isSelected ? 'var(--teal)' : 'var(--border)'}`,
                  background: isSelected ? 'var(--teal)' : 'var(--surface-card)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  transition: 'all 0.13s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}
              >
                <span>{c}</span>
                <span style={{
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  opacity: 0.8,
                  color: isSelected ? 'rgba(255,255,255,0.85)' : (cr >= 90 ? 'var(--green)' : 'var(--red)'),
                }}>
                  {cp}/{cs.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Stats for selected class ────────────── */}
      <div className="stats-row" style={{ marginBottom: 20 }}>
        <StatCard label="Class Size"  value={classStudents.length} icon={Users}      accent="var(--teal)"  />
        <StatCard label="Present"     value={present}               icon={UserCheck}  accent="var(--green)" sub={`${rate}% rate`} />
        <StatCard label="Absent"      value={absent}                icon={UserX}      accent="var(--red)"   />
        <StatCard label="Rate"        value={`${rate}%`}            icon={TrendingUp} accent="var(--blue)"  />
      </div>

      {/* ── Live feed ──────────────────────────── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p className="section-title" style={{ marginBottom: 2 }}>Live Scan Feed — {selectedClass}</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Real-time card taps</span>
          </div>
          {classTaps.length > 0 && (
            <Badge status="present" dot>{classTaps.length} scans</Badge>
          )}
        </div>
        <LiveFeed taps={classTaps} />
        <div style={{ marginTop: 16 }}>
          <RFIDSimulator students={classStudents} onTap={onTap} />
        </div>
      </Card>

      {/* ── Roll + Timetable ───────────────────── */}
      <div className="grid-2">
        <Card>
          <p className="section-title">Class Roll — {selectedClass}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
            {classStudents.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 12px', borderRadius: 10,
                background: s.present ? 'var(--green-light)' : 'var(--surface-soft)',
                border: `1px solid ${s.present ? 'var(--green-border)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: s.present ? 'var(--green)' : 'var(--text-soft)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700,
                  }}>
                    {s.name.split(' ').map(p => p[0]).join('')}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</span>
                </div>
                <Badge status={s.present ? 'present' : 'absent'} dot>
                  {s.present ? 'Present' : 'Absent'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="section-title">My Timetable — {today}</p>
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--text-soft)', fontWeight: 700, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '2px solid var(--border)' }}>Period</th>
                  {DAYS.map(d => (
                    <th key={d} style={{
                      padding: '6px 8px', textAlign: 'center',
                      color: d === today ? 'var(--teal)' : 'var(--text-soft)',
                      fontWeight: d === today ? 800 : 600,
                      fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderBottom: `2px solid ${d === today ? 'var(--teal)' : 'var(--border)'}`,
                    }}>
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((p, i) => (
                  <tr key={p.label} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'transparent' }}>
                    <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{p.label}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)' }}>{p.time}</div>
                    </td>
                    {DAYS.map(d => {
                      const cell = teacherTimetable[d]?.[p.label] || '—';
                      const isFree = cell === '—' || cell === 'Preparation';
                      const isToday = d === today;
                      return (
                        <td key={d} style={{
                          padding: '7px 8px', textAlign: 'center',
                          color: isFree ? 'var(--text-soft)' : isToday ? 'var(--teal)' : 'var(--text-primary)',
                          fontWeight: isToday && !isFree ? 700 : 400,
                          fontStyle: isFree ? 'italic' : 'normal',
                          fontSize: '0.78rem',
                          background: isToday && !isFree ? 'var(--teal-glow)' : 'transparent',
                        }}>
                          {cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
