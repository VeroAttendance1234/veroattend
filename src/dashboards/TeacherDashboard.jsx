import { useState } from 'react';
import {
  Users, UserCheck, UserX, TrendingUp,
  BookOpen, Calendar, ChevronDown, Search,
} from 'lucide-react';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import LiveFeed from '../components/LiveFeed';
import MessagingPanel from '../components/MessagingPanel';
import StudentDetailModal from '../components/StudentDetailModal';
import Reveal from '../components/Reveal';
import { MessageSquare } from 'lucide-react';
import RFIDSimulator from '../components/RFIDSimulator';
import { teachers, DEMO_TEACHER_ID, teacherTimetable, periods } from '../data/sampleData';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function todayKey() {
  const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  return DAYS.includes(d) ? d : 'Mon';
}

export default function TeacherDashboard({ students, setStudents, taps, onTap, threads = [], onSendMessage }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState(DEMO_TEACHER_ID);
  const [teacherPickerOpen, setTeacherPickerOpen] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const teacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];
  const [selectedClass, setSelectedClass] = useState(teacher.classes[0]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const today = todayKey();

  /* When teacher changes, reset their selected class */
  function pickTeacher(id) {
    const t = teachers.find(x => x.id === id);
    setSelectedTeacherId(id);
    setSelectedClass(t?.classes?.[0] || '');
    setTeacherPickerOpen(false);
    setTeacherSearch('');
  }

  const filteredTeachers = teachers.filter(t =>
    !teacherSearch.trim()
    || t.name.toLowerCase().includes(teacherSearch.toLowerCase())
    || t.subject.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const classStudents = students.filter(s => s.class === selectedClass);
  const classTaps     = taps.filter(t => t.class === selectedClass);
  const present       = classStudents.filter(s => s.present).length;
  const absent        = classStudents.filter(s => !s.present).length;
  const rate          = classStudents.length ? Math.round((present / classStudents.length) * 100) : 0;

  return (
    <div className="page">

      <StudentDetailModal
        student={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* ── Teacher hero banner with switcher ── */}
      <div style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        marginBottom: 20,
        boxShadow: 'var(--shadow-md)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        position: 'relative',
      }}>
        {/* Avatar + name + picker trigger */}
        <button
          onClick={() => setTeacherPickerOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'transparent', padding: '6px',
            borderRadius: 12, flex: 1, minWidth: 250,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 54, height: 54, borderRadius: 16,
            background: 'var(--blue-light)',
            border: '2px solid var(--blue-border)',
            color: 'var(--blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.95rem', fontWeight: 800,
            fontFamily: 'Bricolage Grotesque, sans-serif',
            flexShrink: 0,
          }}>
            {teacher.avatar}
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: 3 }}>{teacher.name}</h2>
              <ChevronDown size={15} style={{ color: 'var(--text-muted)', transform: teacherPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {teacher.subject}
              </span>
              <span style={{ color: 'var(--border-strong)' }}>·</span>
              <Badge status="info">{teacher.classes.length} classes</Badge>
              <Badge status="teal">{today}</Badge>
            </div>
          </div>
        </button>

        {/* Class rate badge */}
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

        {/* ── Teacher picker dropdown ── */}
        {teacherPickerOpen && (
          <>
            <div
              onClick={() => setTeacherPickerOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 100 }}
            />
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0,
              width: 'min(420px, calc(100% - 0px))',
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 101,
              animation: 'slideDown 0.18s ease',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '12px 14px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface-soft)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--surface-card)', border: '1px solid var(--border)',
                  borderRadius: 9, padding: '0 11px',
                }}>
                  <Search size={13} style={{ color: 'var(--text-soft)' }} />
                  <input
                    autoFocus
                    value={teacherSearch}
                    onChange={e => setTeacherSearch(e.target.value)}
                    placeholder="Switch teacher · search by name or subject"
                    style={{
                      border: 'none', background: 'transparent', padding: '8px 0',
                      flex: 1, fontSize: '0.85rem',
                    }}
                  />
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-soft)',
                    background: 'var(--surface)', padding: '2px 7px', borderRadius: 99,
                  }}>
                    {filteredTeachers.length}
                  </span>
                </div>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {filteredTeachers.map(t => {
                  const isActive = t.id === selectedTeacherId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => pickTeacher(t.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        width: '100%', textAlign: 'left',
                        padding: '10px 14px',
                        background: isActive ? 'var(--teal-glow)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        borderLeft: `3px solid ${isActive ? 'var(--teal)' : 'transparent'}`,
                        transition: 'all 0.1s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--surface-soft)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: isActive ? 'var(--teal)' : 'var(--blue-light)',
                        color: isActive ? '#fff' : 'var(--blue)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '0.72rem',
                        fontFamily: 'Bricolage Grotesque, sans-serif',
                        flexShrink: 0,
                      }}>
                        {t.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: '0.85rem',
                          color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {t.subject} · {t.classes.length} classes
                        </div>
                      </div>
                      {isActive && (
                        <span style={{
                          fontSize: '0.66rem', fontWeight: 800, color: 'var(--teal)',
                          letterSpacing: '0.06em',
                        }}>
                          ● ACTIVE
                        </span>
                      )}
                    </button>
                  );
                })}
                {filteredTeachers.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-soft)', fontSize: '0.82rem' }}>
                    No teachers match "{teacherSearch}"
                  </div>
                )}
              </div>
              <div style={{
                padding: '10px 14px', borderTop: '1px solid var(--border)',
                background: 'var(--surface-soft)',
                fontSize: '0.72rem', color: 'var(--text-soft)', textAlign: 'center',
              }}>
                {teachers.length} teaching staff total
              </div>
            </div>
          </>
        )}
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
      <Reveal>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <p className="section-title" style={{ marginBottom: 2 }}>Live Scan Feed · {selectedClass}</p>
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
      </Reveal>

      {/* ── Roll + Timetable ───────────────────── */}
      <Reveal>
      <div className="grid-2">
        <Card>
          <p className="section-title">Class Roll · {selectedClass}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
            {classStudents.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '9px 12px', borderRadius: 10,
                  background: s.present ? 'var(--green-light)' : 'var(--surface-soft)',
                  border: `1px solid ${s.present ? 'var(--green-border)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(47,62,70,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Avatar name={s.name} size={32} status={s.present ? 'present' : 'absent'} />
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
          <p className="section-title">My Timetable · {today}</p>
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
                      const cell = teacherTimetable[d]?.[p.label] || '·';
                      const isFree = cell === '·' || cell === 'Preparation';
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
      </Reveal>

      {/* ── Messaging with parents ─────────────── */}
      <Reveal>
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <MessageSquare size={16} style={{ color: 'var(--purple)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Parent Messages</p>
        </div>
        <MessagingPanel role="teacher" userName="Mr David Chen" threads={threads} onSend={onSendMessage} />
      </Card>
      </Reveal>
    </div>
  );
}
