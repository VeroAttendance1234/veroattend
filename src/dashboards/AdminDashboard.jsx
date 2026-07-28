import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart,
} from 'recharts';
import {
  Users, UserCheck, UserX, Clock, TrendingUp, Award, Cpu, Wifi,
  Activity, CreditCard, Download, RefreshCw, Play, Square, Search,
  ChevronLeft, ChevronRight, Zap, School,
} from 'lucide-react';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import StatDrillModal from '../components/StatDrillModal';
import Badge from '../components/Badge';
import Avatar from '../components/Avatar';
import LiveFeed from '../components/LiveFeed';
import RFIDSimulator from '../components/RFIDSimulator';
import IntegrityAlerts from '../components/IntegrityAlerts';
import AbsenceRequestsAdmin from '../components/AbsenceRequestsAdmin';
import AttendanceLeaders, { CurrentLeaderStrip } from '../components/AttendanceLeaders';
import AttendanceHeatmap from '../components/AttendanceHeatmap';
import StudentDetailModal from '../components/StudentDetailModal';
import Reveal from '../components/Reveal';
import { useIsMobile } from '../hooks/useMediaQuery';
import { extraNotifications } from '../data/initialState';
import {
  notifications, teachers, monthlyAttendance,
  yearlyStats, yearGroupRates, classLeaderboard, pickSimulatedTap,
} from '../data/sampleData';

const YEARS   = ['All', 7, 8, 9, 10, 11, 12];
const PAGE_SIZE = 30;
const CHART_VIEWS = ['6M', '1Y', '2Y', '5Y'];

/* ── Tooltip ─────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '8px 14px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.82rem',
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--teal)', fontWeight: 700 }}>{payload[0].value}%</div>
    </div>
  );
};

/* ── Device health row ────────────────────────── */
function DevicePanel({ piConnected }) {
  const items = [
    { label: 'Raspberry Pi 3B', ok: piConnected, icon: Cpu },
    { label: 'ACR122U Reader',  ok: piConnected, icon: CreditCard },
    { label: 'WebSocket API',   ok: piConnected, icon: Wifi },
    { label: 'Database',        ok: true,         icon: Activity },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map(({ label, ok, icon: Icon }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', borderRadius: 10,
          background: ok ? 'var(--green-light)' : 'var(--red-light)',
          border: `1px solid ${ok ? 'var(--green-border)' : 'var(--red-border)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon size={15} strokeWidth={2} style={{ color: ok ? 'var(--green)' : 'var(--red)' }} />
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{label}</span>
          </div>
          <Badge status={ok ? 'present' : 'absent'} dot>
            {ok ? 'Online' : 'Offline'}
          </Badge>
        </div>
      ))}
    </div>
  );
}

/* ── Quick actions ────────────────────────────── */
function QuickActions({ onSimulate, students = [], filtered = [] }) {
  // CSV export of the currently filtered student list
  function exportReport() {
    const rows = (filtered.length ? filtered : students);
    const header = ['ID', 'Name', 'Year', 'Class', 'Status', 'Card UID'];
    const csv = [
      header.join(','),
      ...rows.map(s => [
        s.id,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        s.year,
        s.class,
        s.present ? 'Present' : 'Absent',
        s.uid || `SIM-${s.id}`,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `vero-attendance-${date}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function refreshDevice() {
    // In demo mode there's no real device; do a soft reload so the
    // dashboard re-renders without losing the auth shell.
    window.location.reload();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[
        { label: 'Simulate card tap', icon: Zap, action: onSimulate, primary: true },
        { label: 'Refresh device',    icon: RefreshCw, action: refreshDevice },
        { label: 'Export report',     icon: Download, action: exportReport },
      ].map(({ label, icon: Icon, action, primary }) => (
        <button
          key={label}
          onClick={action}
          className={primary ? 'btn-primary' : 'btn-secondary'}
          style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
        >
          <Icon size={15} strokeWidth={2.5} />
          {label}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard({
  students, setStudents, taps, onTap, onSimulateCheat,
  absenceRequests = [], onApproveAbsence, onRejectAbsence,
  newAbsenceIds = new Set(),
}) {
  const [yearFilter, setYearFilter]   = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [chartView, setChartView]     = useState('2Y');
  const [leaderView, setLeaderView]   = useState('All Classes');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drill, setDrill]             = useState(null); // { title, accent, icon, students }
  const isMobile = useIsMobile();

  const classOptions = useMemo(() => {
    if (yearFilter === 'All') return ['All'];
    const cls = [...new Set(students.filter(s => s.year === yearFilter).map(s => s.class))].sort();
    return ['All', ...cls];
  }, [yearFilter, students]);

  const filtered = useMemo(() => {
    let list = students;
    if (yearFilter !== 'All')  list = list.filter(s => s.year === yearFilter);
    if (classFilter !== 'All') list = list.filter(s => s.class === classFilter);
    if (search.trim())         list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [students, yearFilter, classFilter, search]);

  const present = filtered.filter(s => s.present).length;
  const absent  = filtered.filter(s => !s.present).length;
  const rate    = filtered.length ? Math.round((present / filtered.length) * 100) : 0;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const chartData = useMemo(() => {
    const all = monthlyAttendance;
    if (chartView === '5Y') return all;
    if (chartView === '2Y') return all.slice(-24);
    if (chartView === '1Y') return all.slice(-12);
    return all.slice(-6);
  }, [chartView]);

  const leaderData = useMemo(() => {
    if (leaderView === 'All Classes') return classLeaderboard.slice(0, 12);
    const yr = parseInt(leaderView.replace('Year ', ''));
    return classLeaderboard.filter(c => c.year === yr).slice(0, 10);
  }, [leaderView]);

  function changeYear(y) { setYearFilter(y); setClassFilter('All'); setPage(1); }

  const schoolPresent = students.filter(s => s.present).length;
  const schoolRate    = Math.round((schoolPresent / students.length) * 100);
  const schoolAbsent  = students.length - schoolPresent;
  const schoolLate    = students.filter(s => s.status === 'late').length;
  const schoolOut     = students.filter(s => s.status === 'out').length;

  return (
    <div className="page">

      {/* Modal · opens when a student row is clicked */}
      <StudentDetailModal
        student={selectedStudent}
        open={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Stat drill modal */}
      {drill && (
        <StatDrillModal
          title={drill.title}
          accent={drill.accent}
          icon={drill.icon}
          students={drill.students}
          emptyText={drill.emptyText}
          onClose={() => setDrill(null)}
          onSelectStudent={s => { setSelectedStudent(s); setDrill(null); }}
        />
      )}

      {/* ── Current Leader strip ─────────────── */}
      <CurrentLeaderStrip students={students} />

      {/* ── Two-column top section ───────────── */}
      {/* Left: hero + stat cards   Right: absence requests (key feature) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 400px',
        gap: 20,
        marginBottom: 20,
        alignItems: 'start',
      }}>

        {/* ── LEFT: Hero + Stats ──────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Hero status */}
          <div data-tour="hero-status" style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '22px 24px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 220 }}>
              <div style={{
                width: 60, height: 60, borderRadius: 16,
                background: 'var(--teal-glow)', border: '2px solid var(--teal-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <div style={{ position: 'relative' }}>
                  <Activity size={26} strokeWidth={2} style={{ color: 'var(--teal)' }} />
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    width: 10, height: 10, borderRadius: '50%',
                    background: 'var(--green)', border: '2px solid var(--surface-card)',
                    animation: 'pulse-dot 2s ease-in-out infinite',
                  }} />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '2.1rem', fontWeight: 800, color: 'var(--teal)', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {schoolRate}%
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: 3 }}>School attendance today</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{schoolPresent} of {students.length} students checked in</div>
              </div>
            </div>
            <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} />
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Present', value: schoolPresent, color: 'var(--green)' },
                { label: 'Absent',  value: schoolAbsent,  color: 'var(--red)'   },
                { label: 'Late',    value: schoolLate,    color: 'var(--amber)' },
                { label: 'Out',     value: schoolOut,     color: 'var(--blue)'  },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.03em' }}>{value}</div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                </div>
              ))}
            </div>
            {taps.length > 0 && (
              <>
                <div style={{ width: 1, height: 56, background: 'var(--border)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Last scan</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{taps[0].name}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{taps[0].class} · {taps[0].time}</div>
                  <div style={{ marginTop: 5 }}>
                    <Badge status={taps[0].action === 'out' ? 'info' : taps[0].status === 'late' ? 'late' : 'present'} dot>
                      {taps[0].action === 'out' ? 'Stepped out' : taps[0].status === 'late' ? 'Late' : 'Checked in'}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Stat cards - 3 columns in this narrower layout */}
          <div data-tour="stats-row" style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 12 }}>
            <StatCard
              label="Total Students" value={students.length} icon={Users} accent="var(--teal)"
              onClick={() => setDrill({ title: 'All Students', accent: 'var(--teal)', icon: Users, students, emptyText: 'No students' })}
            />
            <StatCard
              label="Present Today" value={schoolPresent} icon={UserCheck} accent="var(--green)" sub={`${schoolRate}% rate`}
              onClick={() => setDrill({ title: 'Present Today', accent: 'var(--green)', icon: UserCheck, students: students.filter(s => s.present), emptyText: 'Nobody present yet' })}
            />
            <StatCard
              label="Absent Today" value={schoolAbsent} icon={UserX} accent="var(--red)"
              onClick={() => setDrill({ title: 'Absent Today', accent: 'var(--red)', icon: UserX, students: students.filter(s => !s.present), emptyText: 'No absences - great!' })}
            />
            <StatCard
              label="Late Today" value={schoolLate} icon={Clock} accent="var(--amber)" sub={`${schoolOut} out of class`}
              onClick={() => setDrill({ title: 'Late Arrivals', accent: 'var(--amber)', icon: Clock, students: students.filter(s => s.status === 'late'), emptyText: 'No late arrivals' })}
            />
            <StatCard
              label="Out of Class" value={schoolOut} icon={Activity} accent="var(--blue)"
              onClick={() => setDrill({ title: 'Currently Out', accent: 'var(--blue)', icon: Activity, students: students.filter(s => s.status === 'out'), emptyText: 'Nobody stepped out' })}
            />
            <StatCard label="Teaching Staff" value={teachers.length} icon={School} accent="var(--purple)" />
          </div>
        </div>

        {/* ── RIGHT: Absence Requests (key feature) ── */}
        <Card
          data-tour="absence-requests"
          style={{
            position: 'sticky', top: 80,
            border: absenceRequests.filter(r => r.status === 'pending').length > 0
              ? '1.5px solid var(--amber-border)'
              : '1px solid var(--border)',
            boxShadow: absenceRequests.filter(r => r.status === 'pending').length > 0
              ? '0 0 0 3px color-mix(in srgb, var(--amber) 8%, transparent)'
              : 'var(--shadow-md)',
            maxHeight: 'calc(100vh - 120px)',
            overflowY: 'auto',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          <AbsenceRequestsAdmin
            requests={absenceRequests}
            onApprove={onApproveAbsence}
            onReject={onRejectAbsence}
            newIds={newAbsenceIds}
          />
        </Card>
      </div>

      {/* ── Charts row ─────────────────────────── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Attendance trend */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <p className="section-title" style={{ marginBottom: 2 }}>Attendance Trend</p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monthly average rate</span>
            </div>
            <div style={{ display: 'flex', gap: 3, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
              {CHART_VIEWS.map(v => (
                <button key={v} onClick={() => setChartView(v)} style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600,
                  background: chartView === v ? 'var(--surface-card)' : 'transparent',
                  color: chartView === v ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: chartView === v ? 'var(--shadow-sm)' : 'none',
                }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#14B8B8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#14B8B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'Inter' }} interval="preserveStartEnd" axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'Inter' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={90} stroke="var(--border-strong)" strokeDasharray="4 4" label={{ value: '90%', fontSize: 9, fill: 'var(--text-soft)', position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="rate" stroke="#14B8B8" strokeWidth={2.5} fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: '#14B8B8', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Year group bar chart */}
        <Card>
          <p className="section-title" style={{ marginBottom: 18 }}>Attendance by Year Group</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={yearGroupRates} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
              <YAxis domain={[84, 98]} tick={{ fontSize: 10, fill: 'var(--text-soft)', fontFamily: 'Inter' }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="rate" fill="#14B8B8" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Leaderboard + Device + Actions ─────── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 18, marginBottom: 20 }}>
        {/* Leaderboard */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <p className="section-title" style={{ marginBottom: 0 }}>Class Leaderboard</p>
            <select
              value={leaderView}
              onChange={e => setLeaderView(e.target.value)}
              style={{
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '5px 10px', fontSize: '0.78rem',
                background: 'var(--surface)', color: 'var(--text-primary)',
              }}
            >
              {['All Classes', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12'].map(v => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {leaderData.map((c, i) => (
              <div key={c.class} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--surface)',
                  border: i > 2 ? '1px solid var(--border)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 800,
                  color: i < 3 ? '#fff' : 'var(--text-muted)',
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.83rem' }}>Class {c.class}</span>
                    <span style={{
                      fontWeight: 800, fontSize: '0.83rem',
                      color: c.rate >= 93 ? 'var(--green)' : c.rate >= 90 ? 'var(--teal)' : 'var(--red)',
                    }}>{c.rate}%</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
                    <div style={{
                      width: `${((c.rate - 84) / (98 - 84)) * 100}%`, height: '100%', borderRadius: 99,
                      background: c.rate >= 93 ? 'var(--green)' : c.rate >= 90 ? 'var(--teal)' : 'var(--red)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Device + Actions column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Card>
            <p className="section-title" style={{ marginBottom: 14 }}>System Status</p>
            <DevicePanel piConnected={true} />
          </Card>
          <Card>
            <p className="section-title" style={{ marginBottom: 14 }}>Quick Actions</p>
            <QuickActions
              students={students}
              filtered={filtered}
              onSimulate={() => {
                const sim = pickSimulatedTap(students);
                if (sim) onTap(sim.student, { action: sim.action, status: sim.status });
              }}
            />
          </Card>
        </div>
      </div>

      {/* ── Calendar heatmap ───────────────────── */}
      <Reveal>
        <Card data-tour="attendance-heatmap" style={{ marginBottom: 20 }}>
          <AttendanceHeatmap />
        </Card>
      </Reveal>

      {/* ── Attendance leaders ─────────────────── */}
      <Reveal>
        <Card style={{ marginBottom: 20 }}>
          <AttendanceLeaders students={students} onSelectStudent={setSelectedStudent} />
        </Card>
      </Reveal>

      {/* ── Live feed ──────────────────────────── */}
      <Reveal>
      <Card data-tour="live-feed" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <p className="section-title" style={{ marginBottom: 2 }}>Live Scan Feed</p>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time card taps from ACR122U reader
            </span>
          </div>
          {taps.length > 0 && (
            <Badge status="present" dot>{taps.length} scan{taps.length !== 1 ? 's' : ''} today</Badge>
          )}
        </div>
        <LiveFeed taps={taps} />
        <div style={{ marginTop: 16 }}>
          <RFIDSimulator students={students} onTap={onTap} />
        </div>
      </Card>
      </Reveal>

      {/* ── Anti-cheat · card-sharing detection ── */}
      <Reveal>
        <Card data-tour="integrity" style={{ marginBottom: 20 }}>
          <IntegrityAlerts taps={taps} students={students} onSimulateCheat={onSimulateCheat} />
        </Card>
      </Reveal>

      {/* ── Student roll ───────────────────────── */}
      <Reveal>
      <Card data-tour="student-roll" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
          <p className="section-title" style={{ marginBottom: 0 }}>Student Roll</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>{present} present</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ color: 'var(--red)', fontWeight: 700 }}>{absent} absent</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span style={{ fontWeight: 800, color: 'var(--teal)' }}>{rate}%</span>
          </div>
        </div>

        {/* Year filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {YEARS.map(y => (
            <button key={y} onClick={() => changeYear(y)} style={{
              padding: '5px 13px', borderRadius: 8, fontWeight: 600, fontSize: '0.8rem',
              background: yearFilter === y ? 'var(--teal)' : 'var(--surface)',
              color: yearFilter === y ? '#fff' : 'var(--text-muted)',
              border: `1px solid ${yearFilter === y ? 'var(--teal)' : 'var(--border)'}`,
            }}>
              {y === 'All' ? 'All Years' : `Y${y}`}
            </button>
          ))}
        </div>

        {/* Search + class filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, minWidth: 180,
            display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border)', borderRadius: 8,
            padding: '0 12px',
            background: 'var(--surface)',
          }}>
            <Search size={14} strokeWidth={2.5} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search student..."
              style={{
                border: 'none', background: 'transparent', padding: '8px 0',
                width: '100%', color: 'var(--text-primary)',
              }}
            />
          </div>
          {classOptions.length > 1 && (
            <select
              value={classFilter}
              onChange={e => { setClassFilter(e.target.value); setPage(1); }}
              style={{
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '8px 12px', background: 'var(--surface)',
                color: 'var(--text-primary)',
              }}
            >
              {classOptions.map(c => <option key={c}>{c}</option>)}
            </select>
          )}
        </div>

        {/* Roll list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {paginated.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px', borderRadius: 10,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={s.name} size={36} status={s.present ? 'present' : 'absent'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{s.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Year {s.year} · {s.class} · <span style={{ fontFamily: 'monospace' }}>{s.id}</span>
                  </div>
                </div>
              </div>
              <Badge
                status={!s.present ? 'absent' : s.status === 'late' ? 'late' : s.status === 'out' ? 'info' : 'present'}
                dot
              >
                {!s.present ? 'Absent' : s.status === 'late' ? 'Late' : s.status === 'out' ? 'Out' : 'Present'}
              </Badge>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: '6px 12px', opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
              Prev
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {page} / {totalPages} · {filtered.length} students
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: '6px 12px', opacity: page === totalPages ? 0.4 : 1 }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </Card>
      </Reveal>

      {/* ── Notifications ──────────────────────── */}
      <Reveal>
      <Card>
        <p className="section-title" style={{ marginBottom: 14 }}>Notifications</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {extraNotifications.map(n => {
            const palette = {
              absence:    { bg: 'var(--teal-glow)',  border: 'var(--teal-border)',  color: 'var(--teal)'  },
              message:    { bg: 'var(--purple-light)', border: 'var(--purple-border)', color: 'var(--purple)' },
              alert:      { bg: 'var(--red-light)',  border: 'var(--red-border)',   color: 'var(--red)'   },
              system:     { bg: 'var(--blue-light)', border: 'var(--blue-border)',  color: 'var(--blue)'  },
              milestone:  { bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
              wellbeing:  { bg: 'var(--green-light)', border: 'var(--green-border)', color: 'var(--green)' },
              event:      { bg: 'var(--surface-soft)', border: 'var(--border)',     color: 'var(--text-muted)' },
            }[n.type] || { bg: 'var(--surface-soft)', border: 'var(--border)', color: 'var(--text-muted)' };

            return (
              <div key={n.id} style={{
                display: 'flex', gap: 12, padding: '11px 14px', borderRadius: 10,
                background: palette.bg,
                border: `1px solid ${palette.border}`,
              }}>
                <span style={{ fontSize: '1.05rem', lineHeight: 1, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{n.text}</div>
                  <div style={{ fontSize: '0.7rem', color: palette.color, marginTop: 4, fontWeight: 700 }}>{n.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      </Reveal>

    </div>
  );
}
