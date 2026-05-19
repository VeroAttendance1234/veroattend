import { useState } from 'react';
import {
  BookOpen, Heart, Target, CheckCircle, Circle,
  Search, Plus, Sparkles,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import MessagingPanel from '../components/MessagingPanel';
import { MessageSquare } from 'lucide-react';
import { timetable, periods, goals as initialGoals, journalEntries as initialJournal } from '../data/sampleData';

const MOODS = [
  { emoji: '😔', label: 'Struggling', value: 0 },
  { emoji: '😐', label: 'Okay',       value: 1 },
  { emoji: '🙂', label: 'Good',       value: 2 },
  { emoji: '😊', label: 'Great',      value: 3 },
  { emoji: '😄', label: 'Amazing',    value: 4 },
];

const GOAL_CATEGORIES = ['All', 'Academic', 'Health', 'Personal', 'Wellbeing'];
const CAT_COLOURS = {
  Academic:  { color: 'var(--blue)',   bg: 'var(--blue-light)',   border: 'var(--blue-border)'   },
  Health:    { color: 'var(--green)',  bg: 'var(--green-light)',  border: 'var(--green-border)'  },
  Personal:  { color: 'var(--purple)', bg: 'var(--purple-light)', border: 'var(--purple-border)' },
  Wellbeing: { color: 'var(--teal)',   bg: 'var(--teal-glow)',    border: 'var(--teal-border)'   },
};
const PRIORITY_ICONS = { high: '↑ High', medium: '→ Med', low: '↓ Low' };
const PRIORITY_COLOURS = { high: 'var(--red)', medium: 'var(--amber)', low: 'var(--text-soft)' };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function todayKey() {
  const d = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
  return DAYS.includes(d) ? d : 'Mon';
}

function currentPeriodIndex() {
  const h = new Date().getHours(), m = new Date().getMinutes(), mins = h * 60 + m;
  if (mins < 9 * 60)     return -1;
  if (mins < 10 * 60)    return 0;
  if (mins < 11 * 60)    return 1;
  if (mins < 11 * 60 + 30) return 2;
  if (mins < 12 * 60 + 30) return 3;
  if (mins < 13 * 60 + 30) return 4;
  return -1;
}

export default function StudentDashboard({ students, threads = [], onSendMessage }) {
  const student = students.find(s => s.id === 'S001') || students[0];
  const today = todayKey();
  const currentPeriod = currentPeriodIndex();

  const [mood, setMood]               = useState(null);
  const [moodSaved, setMoodSaved]     = useState(false);
  const [journal, setJournal]         = useState(initialJournal);
  const [journalText, setJournalText] = useState('');
  const [journalSaved, setJournalSaved] = useState(false);
  const [journalSearch, setJournalSearch] = useState('');
  const [goals, setGoals]             = useState(initialGoals);
  const [catFilter, setCatFilter]     = useState('All');
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCat, setNewGoalCat]   = useState('Academic');
  const [newGoalDue, setNewGoalDue]   = useState('');
  const [newGoalPri, setNewGoalPri]   = useState('medium');

  function selectMood(i) {
    setMood(i);
    setMoodSaved(true);
    setTimeout(() => setMoodSaved(false), 3000);
  }

  function saveJournal() {
    if (!journalText.trim()) return;
    const date = new Date().toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });
    setJournal(prev => [{
      id: Date.now(), date, mood: mood ?? 2, text: journalText.trim(),
    }, ...prev]);
    setJournalText('');
    setJournalSaved(true);
    setTimeout(() => setJournalSaved(false), 2500);
  }

  function toggleGoal(id) {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, done: !g.done } : g));
  }

  function addGoal() {
    if (!newGoalText.trim()) return;
    setGoals(prev => [...prev, {
      id: Date.now(), text: newGoalText.trim(),
      due: newGoalDue || '—', done: false,
      category: newGoalCat, priority: newGoalPri,
    }]);
    setNewGoalText(''); setNewGoalDue('');
  }

  const filteredGoals   = catFilter === 'All' ? goals : goals.filter(g => g.category === catFilter);
  const goalsDone       = goals.filter(g => g.done).length;
  const goalsRate       = goals.length ? Math.round((goalsDone / goals.length) * 100) : 0;
  const filteredJournal = journalSearch.trim()
    ? journal.filter(e => e.text.toLowerCase().includes(journalSearch.toLowerCase()))
    : journal;

  return (
    <div className="page">

      {/* ── Welcome banner ─────────────────────── */}
      <div style={{
        background: 'var(--surface-card)',
        border: '2px solid var(--teal)',
        borderRadius: 'var(--radius-xl)',
        padding: '22px 28px',
        marginBottom: 22,
        boxShadow: 'var(--shadow-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={student?.name || 'student'} size={56} status={student?.present ? 'present' : 'absent'} ring={student?.present ? 'var(--teal)' : 'var(--red-border)'} />
          <div>
            <h2 style={{ fontSize: '1.375rem', marginBottom: 6 }}>{student?.name}</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Year {student?.year} · Class {student?.class}
              </span>
              <Badge status={student?.present ? 'present' : 'absent'} dot>
                {student?.present ? 'Checked in today' : 'Not yet checked in'}
              </Badge>
            </div>
          </div>
        </div>
        {mood !== null && (
          <div style={{
            background: 'var(--teal-glow)', border: '1px solid var(--teal-border)',
            borderRadius: 12, padding: '10px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 3 }}>{MOODS[mood].emoji}</div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Feeling {MOODS[mood].label}
            </div>
          </div>
        )}
      </div>

      {/* ── Timetable + Check-in ───────────────── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        <Card>
          <p className="section-title">Today's Timetable</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {periods.map((p, i) => {
              const isNow = i === currentPeriod;
              const subject = timetable[today]?.[i] || p.label;
              const isBreak = p.label === 'Recess' || p.label === 'Lunch';
              return (
                <div key={p.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10,
                  background: isNow ? 'var(--teal-glow)' : isBreak ? 'var(--surface)' : 'var(--surface-soft)',
                  border: `1px solid ${isNow ? 'var(--teal-border)' : 'var(--border)'}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: isNow ? 'var(--teal)' : isBreak ? 'var(--border-strong)' : 'var(--border)',
                    animation: isNow ? 'pulse-dot 2s ease-in-out infinite' : 'none',
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: isNow ? 800 : isBreak ? 400 : 600,
                      fontSize: '0.875rem',
                      color: isNow ? 'var(--teal)' : isBreak ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontStyle: isBreak ? 'italic' : 'normal',
                    }}>
                      {subject}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>{p.label} · {p.time}</div>
                  </div>
                  {isNow && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 800, color: 'var(--teal)',
                      background: 'var(--teal-glow)', padding: '2px 8px', borderRadius: 99,
                      border: '1px solid var(--teal-border)',
                    }}>
                      NOW
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <p className="section-title">Daily Wellbeing Check-in</p>
          <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 18 }}>
            How are you feeling today?
          </p>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {MOODS.map((m, i) => (
              <button key={i} onClick={() => selectMood(i)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: mood === i ? 'var(--teal-glow)' : 'var(--surface)',
                border: `2px solid ${mood === i ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: 12, padding: '8px 6px',
                cursor: 'pointer',
                transform: mood === i ? 'scale(1.12)' : 'scale(1)',
                transition: 'all 0.15s ease',
                flex: 1,
              }}>
                <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                <span style={{ fontSize: '0.6rem', color: mood === i ? 'var(--teal)' : 'var(--text-soft)', fontWeight: 700 }}>
                  {m.label}
                </span>
              </button>
            ))}
          </div>

          {moodSaved && (
            <div style={{
              textAlign: 'center', color: 'var(--green)', fontWeight: 700, fontSize: '0.83rem',
              background: 'var(--green-light)', border: '1px solid var(--green-border)',
              borderRadius: 8, padding: '6px 12px', marginBottom: 12,
            }}>
              ✓ Wellbeing check-in saved
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
              Add a note <span style={{ fontWeight: 400 }}>(optional)</span>
            </p>
            <textarea
              value={journalText}
              onChange={e => setJournalText(e.target.value)}
              placeholder="What's on your mind today?"
              rows={3}
              style={{
                width: '100%', border: '1px solid var(--border)', borderRadius: 10,
                padding: '10px 12px', fontSize: '0.875rem', color: 'var(--text-primary)',
                background: 'var(--surface)', resize: 'vertical', lineHeight: 1.6,
                marginBottom: 10,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={saveJournal} className="btn-primary" style={{ gap: 6 }}>
                <Heart size={14} />
                Save entry
              </button>
              {journalSaved && (
                <span style={{ color: 'var(--green)', fontSize: '0.83rem', fontWeight: 700 }}>Saved ✓</span>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Wellbeing Journal ──────────────────── */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={16} style={{ color: 'var(--pink)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>Wellbeing Journal</p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '0 12px', background: 'var(--surface)',
          }}>
            <Search size={13} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
            <input
              value={journalSearch}
              onChange={e => setJournalSearch(e.target.value)}
              placeholder="Search entries..."
              style={{
                border: 'none', background: 'transparent', padding: '7px 0',
                fontSize: '0.82rem', color: 'var(--text-primary)', width: 160,
              }}
            />
          </div>
        </div>

        {filteredJournal.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-soft)', fontSize: '0.875rem' }}>
            No journal entries yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredJournal.map(entry => (
              <div key={entry.id} style={{
                padding: '14px 16px', borderRadius: 12,
                background: 'var(--surface-soft)', border: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.1rem' }}>{MOODS[entry.mood]?.emoji || '🙂'}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: 800, letterSpacing: '0.02em' }}>{entry.date}</span>
                  <span style={{ color: 'var(--border-strong)', fontSize: '0.75rem' }}>·</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-soft)', fontWeight: 600 }}>
                    {MOODS[entry.mood]?.label || 'Good'}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                  {entry.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Goal Tracker ───────────────────────── */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={16} style={{ color: 'var(--teal)' }} />
            <p className="section-title" style={{ marginBottom: 0 }}>Goal Tracker</p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--teal)' }}>
            {goalsDone}/{goals.length} complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ background: 'var(--border)', borderRadius: 99, height: 7, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{
            width: `${goalsRate}%`, height: '100%', borderRadius: 99,
            background: 'var(--green)', transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {GOAL_CATEGORIES.map(c => {
            const col = CAT_COLOURS[c];
            const isActive = catFilter === c;
            return (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700,
                background: isActive ? (col?.bg || 'var(--teal-glow)') : 'var(--surface)',
                color: isActive ? (col?.color || 'var(--teal)') : 'var(--text-muted)',
                border: `1px solid ${isActive ? (col?.border || 'var(--teal-border)') : 'var(--border)'}`,
                transition: 'all 0.12s',
              }}>
                {c}
              </button>
            );
          })}
        </div>

        {/* Goals list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
          {filteredGoals.map(g => {
            const col = CAT_COLOURS[g.category];
            return (
              <div key={g.id} onClick={() => toggleGoal(g.id)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: g.done ? 'var(--green-light)' : 'var(--surface-soft)',
                border: `1px solid ${g.done ? 'var(--green-border)' : 'var(--border)'}`,
                transition: 'all 0.12s ease',
              }}>
                <div style={{ flexShrink: 0, color: g.done ? 'var(--green)' : 'var(--text-soft)' }}>
                  {g.done
                    ? <CheckCircle size={18} strokeWidth={2.5} />
                    : <Circle size={18} strokeWidth={2} />
                  }
                </div>
                <div style={{
                  flex: 1, fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: g.done ? 'line-through' : 'none',
                  color: g.done ? 'var(--text-muted)' : 'var(--text-primary)',
                }}>
                  {g.text}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  {col && (
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                      background: col.bg, color: col.color, border: `1px solid ${col.border}`,
                    }}>
                      {g.category}
                    </span>
                  )}
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIORITY_COLOURS[g.priority] }}>
                    {PRIORITY_ICONS[g.priority]}
                  </span>
                  {g.due !== '—' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-soft)' }}>Due {g.due}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add goal */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 10 }}>
            Add a new goal
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              value={newGoalText}
              onChange={e => setNewGoalText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoal()}
              placeholder="What do you want to achieve?"
              style={{
                flex: 1, minWidth: 160,
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', background: 'var(--surface)', color: 'var(--text-primary)',
              }}
            />
            <select value={newGoalCat} onChange={e => setNewGoalCat(e.target.value)} style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px',
              background: 'var(--surface)', color: 'var(--text-primary)',
            }}>
              {['Academic', 'Health', 'Personal', 'Wellbeing'].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={newGoalPri} onChange={e => setNewGoalPri(e.target.value)} style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px',
              background: 'var(--surface)', color: 'var(--text-primary)',
            }}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              value={newGoalDue}
              onChange={e => setNewGoalDue(e.target.value)}
              placeholder="Due date"
              style={{
                width: 100, border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 10px', background: 'var(--surface)', color: 'var(--text-primary)',
              }}
            />
            <button onClick={addGoal} className="btn-primary">
              <Plus size={15} />
              Add
            </button>
          </div>
        </div>
      </Card>

      {/* ── Messaging ─────────────────────────── */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <MessageSquare size={16} style={{ color: 'var(--purple)' }} />
          <p className="section-title" style={{ marginBottom: 0 }}>Messages</p>
        </div>
        <MessagingPanel role="student" userName="Aisha Patel" threads={threads} onSend={onSendMessage} />
      </Card>
    </div>
  );
}
