import { useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  User, Calendar, TrendingUp, Award, MessageCircle, CreditCard,
  Mail, Phone, MapPin, Heart, Clock,
} from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import Badge from './Badge';

/* Generate deterministic 12-week attendance from student id */
function generateHistory(s) {
  if (!s) return [];
  const base = s.id.charCodeAt(s.id.length - 1) + s.id.charCodeAt(0);
  return Array.from({ length: 12 }, (_, i) => ({
    week: `W${i + 1}`,
    rate: Math.max(72, Math.min(100, 86 + ((base + i * 7) % 16))),
  }));
}

/* Mock contact + bio from student id */
function generateProfile(s) {
  if (!s) return {};
  const slug = s.name.toLowerCase().replace(/\s+/g, '.');
  return {
    email:   s.email || `${slug}@students.millpond.nsw.edu.au`,
    phone:   `+61 ${400 + (s.id.charCodeAt(2) % 100)} ${100 + s.id.charCodeAt(3) % 900} ${100 + s.id.charCodeAt(4) % 900}`,
    address: `${100 + (s.id.charCodeAt(2) % 800)} Pacific Hwy, Sydney NSW`,
    joined:  '2024',
    house:   s.house || ['Burns', 'Eldon', 'Forrest', 'Robson'][s.id.charCodeAt(1) % 4],
    streak:  18 + (s.id.charCodeAt(s.id.length - 1) % 14),
  };
}

const TooltipBox = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '6px 11px', fontSize: '0.78rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
      <div style={{ color: 'var(--teal)', fontWeight: 700 }}>{payload[0].value}%</div>
    </div>
  );
};

export default function StudentDetailModal({ student, open, onClose }) {
  const history = useMemo(() => generateHistory(student), [student]);
  const profile = useMemo(() => generateProfile(student), [student]);

  if (!student) return null;

  const avg = Math.round(history.reduce((a, b) => a + b.rate, 0) / history.length);
  const status = student.present ? 'present' : 'absent';
  const accent = student.present ? 'var(--green)' : 'var(--red)';

  // Derived contact targets for the footer action buttons
  const parentEmail = `parent.${student.name.split(' ').slice(-1)[0].toLowerCase()}@families.millpond.nsw.edu.au`;
  function emailStudent() {
    const subject = encodeURIComponent(`Re: attendance - ${student.name}`);
    const body = encodeURIComponent(
      `Hi ${student.name.split(' ')[0]},\n\nJust touching base regarding today's attendance.\n\nKind regards,\nMillpond High School`
    );
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }
  function messageParent() {
    const subject = encodeURIComponent(
      `Attendance update - ${student.name} (Year ${student.year} ${student.class})`
    );
    const body = encodeURIComponent(
      `Hi,\n\nThis is a quick note from Millpond High School regarding ${student.name}.\n` +
      `Status today: ${student.present ? 'Checked in' : 'Not checked in'}\n` +
      `Term average: ${avg}%\n\nPlease reply if you have any questions.\n\nMillpond High School`
    );
    window.location.href = `mailto:${parentEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      width="lg"
      accent={accent}
      title={student.name}
      subtitle={`Year ${student.year} · ${student.class} · ID ${student.id}`}
      icon={<User size={20} strokeWidth={2} />}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Last tap: {student.present ? 'today, 8:42am' : 'no tap recorded today'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={messageParent}
              className="btn-secondary"
              style={{ padding: '7px 14px' }}
            >
              <MessageCircle size={13} strokeWidth={2.5} />
              Message parent
            </button>
            <button
              type="button"
              onClick={emailStudent}
              className="btn-primary"
              style={{ padding: '7px 14px' }}
            >
              <Mail size={13} strokeWidth={2.5} />
              Email student
            </button>
          </div>
        </div>
      }
    >
      {/* Hero strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 18px', borderRadius: 14,
        background: 'var(--surface-soft)',
        border: '1px solid var(--border)',
        marginBottom: 18,
      }}>
        <Avatar name={student.name} size={64} status={status} ring={accent} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <Badge status={status} dot>
              {student.present ? 'Checked in today' : 'Not yet checked in'}
            </Badge>
            <Badge status="teal">House {profile.house}</Badge>
            <Badge status="info">{profile.streak} day streak</Badge>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Mail size={11} /> {profile.email}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={11} /> {profile.phone}
            </span>
          </div>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
        marginBottom: 20,
      }} className="student-stats">
        {[
          { label: 'Term Average', value: `${avg}%`,   colour: 'var(--teal)',  icon: TrendingUp },
          { label: 'Best Streak',  value: `${profile.streak}d`, colour: 'var(--green)', icon: Award },
          { label: 'Card UID',     value: student.uid || `SIM-${student.id}`, colour: 'var(--blue)',  icon: CreditCard, mono: true },
          { label: 'Joined',       value: profile.joined, colour: 'var(--purple)', icon: Calendar },
        ].map(({ label, value, colour, icon: Icon, mono }) => (
          <div key={label} style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 11,
            padding: '11px 12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, color: colour }}>
              <Icon size={11} strokeWidth={2.5} />
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--text-soft)' }}>
                {label}
              </span>
            </div>
            <div style={{
              fontFamily: mono ? 'monospace' : 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: mono ? '0.82rem' : '1.1rem',
              color: 'var(--text-primary)',
              letterSpacing: mono ? 0 : '-0.02em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div style={{
        background: 'var(--surface-soft)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px 8px',
        marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Last 12 weeks
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Average <strong style={{ color: 'var(--teal)' }}>{avg}%</strong>
          </span>
        </div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={history} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="sdmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-soft)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis domain={[60, 100]} tick={{ fontSize: 9, fill: 'var(--text-soft)' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
            <Tooltip content={<TooltipBox />} />
            <Area type="monotone" dataKey="rate" stroke={accent} strokeWidth={2} fill="url(#sdmGrad)" dot={false} activeDot={{ r: 4, fill: accent, stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two-column extras */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="student-extras">
        {/* Recent activity */}
        <div style={{
          background: 'var(--surface-soft)',
          border: '1px solid var(--border)',
          borderRadius: 11, padding: '12px 14px',
        }}>
          <div className="label-caps" style={{ marginBottom: 8 }}>Recent activity</div>
          {[
            { icon: '✅', text: 'Tapped in for Period 1', time: '8:42am',   colour: 'var(--green)' },
            { icon: '📝', text: 'Submitted wellbeing check-in', time: '8:55am', colour: 'var(--pink)' },
            { icon: '📚', text: 'Maths homework marked: 95%', time: 'Yesterday', colour: 'var(--blue)' },
            { icon: '🏆', text: 'Class 11A leaderboard: 2nd', time: '2 days ago', colour: 'var(--amber)' },
          ].map((a, i) => (
            <div key={i} style={{
              display: 'flex', gap: 9, padding: '7px 0',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: '0.9rem' }}>{a.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{a.text}</div>
                <div style={{ fontSize: '0.68rem', color: a.colour, fontWeight: 700, marginTop: 1 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Address + Parent */}
        <div style={{
          background: 'var(--surface-soft)',
          border: '1px solid var(--border)',
          borderRadius: 11, padding: '12px 14px',
        }}>
          <div className="label-caps" style={{ marginBottom: 8 }}>Emergency contact</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <Avatar name={`Parent of ${student.name}`} size={32} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                {student.name.split(' ').slice(-1)[0]} family
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Primary contact</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={11} /> {profile.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MapPin size={11} /> {profile.address}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={11} /> Allergies: none recorded
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .student-stats   { grid-template-columns: repeat(2, 1fr) !important; }
          .student-extras  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Modal>
  );
}
