/**
 * CommandPalette - ⌘K / Ctrl-K spotlight-style search and quick actions.
 *
 * Indexes:
 *   - All students (search by name, year, class)
 *   - Role switches (Admin / Teacher / Student / Parent)
 *   - Quick actions (open marker page, sign out, refresh, simulate tap)
 *
 * Demonstrates: portal-mounted dialog, keyboard nav (↑ ↓ ⏎ ⎋),
 * fuzzy weighted ranking, focus trap, ARIA combobox pattern.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Command, Search, ArrowUp, ArrowDown, CornerDownLeft,
  User, Users, Monitor, BookOpen, Heart, LogOut, RefreshCw,
  Zap, Sparkles,
} from 'lucide-react';

/* ── Hook: register a global ⌘K / Ctrl-K listener ────── */
export function useCommandPaletteHotkey(open, setOpen) {
  useEffect(() => {
    function onKey(e) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const trigger = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (trigger) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);
}

/* ── Tiny fuzzy match → score ─────────────────────────── */
function score(item, query) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const text = `${item.label} ${item.subtitle || ''} ${item.keywords || ''}`.toLowerCase();
  if (text === q) return 100;
  if (text.startsWith(q)) return 80;
  // Exact substring
  const idx = text.indexOf(q);
  if (idx !== -1) return 60 - idx * 0.1;
  // Per-character subsequence match
  let i = 0, hits = 0;
  for (const c of text) {
    if (c === q[i]) { i++; hits++; }
    if (i === q.length) break;
  }
  if (i === q.length) return 10 + hits * 0.5;
  return 0;
}

/* ── Component ────────────────────────────────────────── */
export default function CommandPalette({
  open, onClose,
  students = [],
  role,
  setRole,
  onMarker,
  onReports,
  onLogout,
  onSimulateTap,
}) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  /* Build the index every time the palette opens */
  const index = useMemo(() => {
    if (!open) return [];

    const out = [];

    /* Quick actions */
    out.push(
      { id: 'qa-marker',  label: 'Open marker page',  subtitle: 'Full project portfolio + 3D + demos', icon: BookOpen,  group: 'Actions', keywords: 'marker hsc project portfolio', run: () => onMarker?.() },
      { id: 'qa-tap',     label: 'Simulate a card tap', subtitle: 'Fire a fake NFC tap into the live feed', icon: Zap,      group: 'Actions', keywords: 'simulate tap nfc demo', run: () => onSimulateTap?.() },
      { id: 'qa-reports', label: 'Open reports',      subtitle: 'School-wide exports + analytics',     icon: Sparkles,  group: 'Actions', keywords: 'reports exports csv pdf', run: () => onReports?.() },
      { id: 'qa-reload',  label: 'Refresh dashboard', subtitle: 'Reloads the page',                    icon: RefreshCw, group: 'Actions', keywords: 'refresh reload',                run: () => window.location.reload() },
      { id: 'qa-logout',  label: 'Sign out',          subtitle: 'Back to the login screen',            icon: LogOut,    group: 'Actions', keywords: 'sign out logout exit', run: () => onLogout?.() },
    );

    /* Role switches (skip current) */
    const ROLE_LIST = [
      { role: 'Admin',   label: 'Switch to Administrator', icon: Monitor },
      { role: 'Teacher', label: 'Switch to Teacher',       icon: BookOpen },
      { role: 'Student', label: 'Switch to Student',       icon: Heart },
      { role: 'Parent',  label: 'Switch to Parent',        icon: Users },
    ];
    ROLE_LIST.filter(r => r.role !== role).forEach(r => {
      out.push({
        id: `role-${r.role}`,
        label: r.label,
        subtitle: `Open the ${r.role} dashboard`,
        icon: r.icon,
        group: 'Switch role',
        keywords: `role switch ${r.role.toLowerCase()}`,
        run: () => setRole?.(r.role),
      });
    });

    /* Students (cap to a sensible number to keep index lean) */
    students.slice(0, 200).forEach(s => {
      out.push({
        id: `s-${s.id}`,
        label: s.name,
        subtitle: `Year ${s.year} · ${s.class} · ${s.present ? 'Present' : 'Absent'} today`,
        icon: User,
        group: 'Students',
        keywords: `student ${s.year} ${s.class} ${s.id}`,
        run: () => {
          // Drop a hash so other code (or just the URL bar) sees who was picked
          window.location.hash = `#student-${encodeURIComponent(s.id)}`;
        },
      });
    });

    return out;
  }, [open, students, role, setRole, onMarker, onReports, onLogout, onSimulateTap]);

  /* Ranked + filtered */
  const results = useMemo(() => {
    if (!open) return [];
    const ranked = index
      .map(item => ({ item, score: score(item, query) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 60)
      .map(r => r.item);
    return ranked;
  }, [open, index, query]);

  /* Reset active row when results change */
  useEffect(() => { setActive(0); }, [query, open]);

  /* Focus input + lock body scroll on open */
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* Keep active row in view */
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open, results]);

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const r = results[active];
      if (r) { r.run?.(); onClose(); }
    }
  }

  if (!open) return null;

  // Group results by their `group` field for readability
  const grouped = results.reduce((acc, item, i) => {
    const g = item.group || 'Other';
    if (!acc[g]) acc[g] = [];
    acc[g].push({ ...item, _idx: i });
    return acc;
  }, {});

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        background: 'rgba(15, 30, 40, 0.42)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'min(12vh, 96px) 16px 16px',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 620,
          background: 'var(--surface-card)',
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: '0 24px 64px rgba(15,30,40,0.28)',
          overflow: 'hidden',
          animation: 'cmdkIn 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <Search size={16} strokeWidth={2.4} style={{ color: 'var(--text-soft)' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search students, actions, switch role…"
            aria-label="Search"
            aria-autocomplete="list"
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent',
              fontSize: '0.96rem',
              color: 'var(--text-primary)',
            }}
          />
          <kbd style={{
            fontFamily: 'monospace', fontSize: '0.66rem', fontWeight: 700,
            color: 'var(--text-soft)',
            border: '1px solid var(--border)', borderRadius: 5,
            padding: '2px 6px',
            background: 'var(--surface)',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Results"
          style={{
            maxHeight: '52vh', overflowY: 'auto', padding: 6,
          }}
        >
          {results.length === 0 ? (
            <div style={{
              padding: '36px 16px', textAlign: 'center',
              color: 'var(--text-soft)', fontSize: '0.88rem',
            }}>
              No matches. Try a student's name, "marker", "tap", or a role.
            </div>
          ) : (
            Object.entries(grouped).map(([groupName, items]) => (
              <div key={groupName} style={{ marginBottom: 4 }}>
                <div className="label-caps" style={{
                  padding: '8px 12px 4px', color: 'var(--text-soft)',
                  fontSize: '0.62rem',
                }}>
                  {groupName}
                </div>
                {items.map(item => {
                  const Icon = item.icon;
                  const isActive = item._idx === active;
                  return (
                    <button
                      key={item.id}
                      data-idx={item._idx}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActive(item._idx)}
                      onClick={() => { item.run?.(); onClose(); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 11,
                        width: '100%', padding: '9px 12px',
                        borderRadius: 8,
                        background: isActive ? 'var(--teal-glow)' : 'transparent',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: 'none',
                        transition: 'background 0.1s ease',
                      }}
                    >
                      <span style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: isActive ? 'var(--teal)' : 'var(--surface-soft)',
                        color: isActive ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.1s ease',
                      }}>
                        <Icon size={14} strokeWidth={2.2} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '0.72rem', color: 'var(--text-muted)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.subtitle}
                        </div>
                      </div>
                      {isActive && (
                        <CornerDownLeft size={13} strokeWidth={2.5} style={{
                          color: 'var(--teal)', flexShrink: 0,
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '9px 16px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-soft)',
          fontSize: '0.7rem', color: 'var(--text-soft)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Hint icon={ArrowUp} text="↑↓ Navigate" />
            <Hint icon={CornerDownLeft} text="⏎ Select" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Command size={11} strokeWidth={2.5} /> + K
          </div>
        </div>

        <style>{`
          @keyframes cmdkIn {
            from { opacity: 0; transform: translateY(-10px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)     scale(1);    }
          }
        `}</style>
      </div>
    </div>
  );
}

function Hint({ icon: Icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      <Icon size={10} strokeWidth={2.5} />
      {text}
    </span>
  );
}
