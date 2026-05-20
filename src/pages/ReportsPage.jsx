import { useState, useMemo } from 'react';
import {
  X, Download, FileText, BarChart3, Users, Calendar,
  Filter, Printer, FileSpreadsheet, Mail, Search, TrendingUp,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import { useToast } from '../components/Toast';
import { classLeaderboard, yearGroupRates, monthlyAttendance } from '../data/sampleData';

const REPORT_TYPES = [
  {
    id: 'roll',
    title: 'Class Roll Report',
    icon: Users,
    colour: 'var(--teal)',
    description: 'Present/absent breakdown per class with attendance rates.',
  },
  {
    id: 'year',
    title: 'Year-Group Summary',
    icon: BarChart3,
    colour: 'var(--blue)',
    description: 'Attendance comparison across all year groups.',
  },
  {
    id: 'trend',
    title: 'Monthly Trend Report',
    icon: TrendingUp,
    colour: 'var(--green)',
    description: 'Term-by-term attendance % across 2 years.',
  },
  {
    id: 'leaders',
    title: 'Class Leaderboard',
    icon: FileText,
    colour: 'var(--amber)',
    description: 'Top 42 classes ranked by term attendance rate.',
  },
];

/* ── CSV helpers ─────────────────────────── */
function toCSV(rows) {
  return rows.map(r =>
    r.map(cell => {
      const s = String(cell ?? '');
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')
  ).join('\n');
}

function downloadCSV(filename, rows) {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── Report builders ─────────────────────── */
function buildRollRows(students, yearFilter) {
  const filtered = yearFilter === 'all' ? students : students.filter(s => s.year === yearFilter);
  const header = ['ID', 'Name', 'Year', 'Class', 'Status', 'UID'];
  const body = filtered.map(s => [s.id, s.name, s.year, s.class, s.present ? 'Present' : 'Absent', s.uid || '·']);
  return [header, ...body];
}
function buildYearRows() {
  return [
    ['Year', 'Rate %', 'Trend'],
    ...yearGroupRates.map(y => [y.label, y.rate, y.rate >= 92 ? 'High' : y.rate >= 88 ? 'Average' : 'Low']),
  ];
}
function buildTrendRows() {
  return [
    ['Period', 'Attendance %'],
    ...monthlyAttendance.map(m => [m.period, m.rate]),
  ];
}
function buildLeaderRows() {
  return [
    ['Rank', 'Class', 'Year', 'Rate %'],
    ...classLeaderboard.map((c, i) => [i + 1, c.class, c.year, c.rate]),
  ];
}

/* ─────────────────────────────────────────────
   MAIN REPORTS PAGE
───────────────────────────────────────────── */
export default function ReportsPage({ onClose, students }) {
  const [activeId, setActiveId]   = useState('roll');
  const [yearFilter, setYearFilter] = useState('all');
  const [search, setSearch]       = useState('');
  const toast = useToast();

  const active = REPORT_TYPES.find(r => r.id === activeId);

  // Build preview rows based on active report
  const rows = useMemo(() => {
    switch (activeId) {
      case 'roll':    return buildRollRows(students, yearFilter);
      case 'year':    return buildYearRows();
      case 'trend':   return buildTrendRows();
      case 'leaders': return buildLeaderRows();
      default:        return [];
    }
  }, [activeId, students, yearFilter]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    const [header, ...body] = rows;
    return [header, ...body.filter(r => r.some(cell => String(cell).toLowerCase().includes(q)))];
  }, [rows, search]);

  const previewRows = filteredRows.slice(0, 50);
  const totalRows   = filteredRows.length - 1;

  function handleExportCSV() {
    const fname = `vero-${activeId}-${new Date().toISOString().slice(0,10)}.csv`;
    downloadCSV(fname, filteredRows);
    toast.success('CSV exported', `${totalRows} rows downloaded · ${fname}`);
  }
  function handlePrint() {
    window.print();
    toast.info('Print dialog opened');
  }
  function handleEmail() {
    toast.info('Email report scheduled', 'Will deliver to admin@shore.nsw.edu.au');
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 950,
      background: 'var(--surface)',
      overflowY: 'auto',
      animation: 'fadeIn 0.2s ease',
    }}>
      {/* Header bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--teal-glow)', color: 'var(--teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <FileSpreadsheet size={17} strokeWidth={2.2} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>
            Reports & Exports
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Generate attendance reports · CSV, print, or email
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 38, height: 38, borderRadius: '50%',
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)',
          }}
        >
          <X size={17} />
        </button>
      </div>

      <div style={{
        maxWidth: 1180, margin: '0 auto', padding: '28px 24px 64px',
        display: 'grid', gridTemplateColumns: '280px 1fr', gap: 22,
      }} className="reports-grid">

        {/* ── Sidebar: report types ── */}
        <div>
          <div className="label-caps" style={{ marginBottom: 10 }}>Report Type</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REPORT_TYPES.map(r => {
              const Icon = r.icon;
              const isActive = r.id === activeId;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 11,
                    padding: '13px 14px',
                    borderRadius: 12,
                    background: isActive ? 'var(--surface-card)' : 'transparent',
                    border: `1.5px solid ${isActive ? r.colour : 'var(--border)'}`,
                    textAlign: 'left',
                    transition: 'all 0.13s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${r.colour}18`, color: r.colour,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} strokeWidth={2.2} />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)',
                      marginBottom: 2,
                    }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                      {r.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main panel ── */}
        <div>
          {/* Toolbar */}
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 16,
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 200 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: `${active.colour}18`, color: active.colour,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <active.icon size={15} strokeWidth={2.2} />
              </div>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem' }}>
                  {active.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {totalRows} {totalRows === 1 ? 'row' : 'rows'} · ready to export
                </div>
              </div>
            </div>

            <button onClick={handlePrint} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <Printer size={13} strokeWidth={2.4} />
              Print
            </button>
            <button onClick={handleEmail} className="btn-secondary" style={{ padding: '8px 14px' }}>
              <Mail size={13} strokeWidth={2.4} />
              Email
            </button>
            <button onClick={handleExportCSV} className="btn-primary" style={{ padding: '8px 16px' }}>
              <Download size={13} strokeWidth={2.5} />
              Download CSV
            </button>
          </div>

          {/* Filters (roll only) */}
          {activeId === 'roll' && (
            <div style={{
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: '12px 16px',
              marginBottom: 16,
              display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <Filter size={14} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>Year:</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {['all', 7, 8, 9, 10, 11, 12].map(y => (
                  <button
                    key={y}
                    onClick={() => setYearFilter(y)}
                    style={{
                      padding: '5px 11px', borderRadius: 7,
                      background: yearFilter === y ? 'var(--teal)' : 'var(--surface)',
                      color: yearFilter === y ? '#fff' : 'var(--text-muted)',
                      border: `1px solid ${yearFilter === y ? 'var(--teal)' : 'var(--border)'}`,
                      fontWeight: 700, fontSize: '0.75rem',
                    }}
                  >
                    {y === 'all' ? 'All' : `Y${y}`}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1 }} />
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                border: '1px solid var(--border)', borderRadius: 8,
                padding: '0 11px', background: 'var(--surface)',
              }}>
                <Search size={12} style={{ color: 'var(--text-soft)' }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search rows..."
                  style={{ border: 'none', background: 'transparent', padding: '7px 0', width: 160, fontSize: '0.82rem' }}
                />
              </div>
            </div>
          )}

          {/* Data table preview */}
          <div style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--surface-soft)' }}>
                    {previewRows[0]?.map((h, i) => (
                      <th key={i} style={{
                        padding: '12px 16px', textAlign: 'left',
                        color: 'var(--text-muted)', fontSize: '0.7rem',
                        fontWeight: 800, letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid var(--border)',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(1).map((row, ri) => (
                    <tr key={ri} style={{ borderBottom: ri < previewRows.length - 2 ? '1px solid var(--border)' : 'none' }}>
                      {row.map((cell, ci) => {
                        const isStatus = activeId === 'roll' && ci === 4;
                        return (
                          <td key={ci} style={{
                            padding: '10px 16px',
                            color: 'var(--text-primary)',
                            fontVariantNumeric: ci > 0 ? 'tabular-nums' : 'normal',
                          }}>
                            {isStatus ? (
                              <Badge status={cell === 'Present' ? 'present' : 'absent'} dot>{cell}</Badge>
                            ) : (
                              cell
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalRows > 50 && (
              <div style={{
                padding: '11px 16px', borderTop: '1px solid var(--border)',
                background: 'var(--surface-soft)',
                fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center',
              }}>
                Showing first 50 of <strong>{totalRows}</strong> rows · download CSV for full export
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 850px) {
          .reports-grid { grid-template-columns: 1fr !important; }
        }
        @media print {
          body * { visibility: hidden; }
          .reports-grid, .reports-grid * { visibility: visible; }
          .reports-grid { position: absolute; left: 0; top: 0; padding: 0; }
        }
      `}</style>
    </div>
  );
}
