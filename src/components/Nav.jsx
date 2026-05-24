import { useState, useEffect } from 'react'; // useEffect for scroll listener
import {
  Wifi, WifiOff, ChevronDown, BookOpen, LogOut,
  Menu, X, Bell, Monitor, Heart, Users, FileSpreadsheet, Search,
} from 'lucide-react';
import { useIsMobile } from '../hooks/useMediaQuery';

const ROLES = ['Admin', 'Teacher', 'Student', 'Parent'];

const ROLE_META = {
  Admin:   { colour: 'var(--teal)',   initials: 'AD', label: 'Administrator', icon: Monitor },
  Teacher: { colour: 'var(--blue)',   initials: 'TC', label: 'Mr David Chen', icon: BookOpen },
  Student: { colour: 'var(--green)',  initials: 'AP', label: 'Aisha Patel',   icon: Heart },
  Parent:  { colour: 'var(--purple)', initials: 'JP', label: 'J. Patel',      icon: Users },
};

const PAGE_TITLES = {
  Admin:   { title: 'Admin Dashboard',    sub: 'School-wide attendance & analytics' },
  Teacher: { title: 'Teacher Dashboard',  sub: 'Class management & live attendance' },
  Student: { title: 'Student Portal',     sub: 'Your attendance, goals & wellbeing' },
  Parent:  { title: 'Parent View',        sub: "Your child's attendance & progress" },
};

export default function Nav({ role, setRole, piConnected, onMarker, onReports, onLogout, onCommandPalette }) {
  const [imgErr, setImgErr]     = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [now, setNow]           = useState(() => new Date());
  const isMobile = useIsMobile();
  const meta = ROLE_META[role];
  const page = PAGE_TITLES[role];

  /* Live wall clock — re-renders every 30 s so seconds aren't burnt
     into the layout but the minute always reads current. */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const timeStr = now.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateStr = now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' });

  /* Shrink + heighten shadow once the user scrolls past 8px */
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  /* Close drawer when role changes */
  useEffect(() => { setMenuOpen(false); }, [role]);

  return (
    <>
      {/* ═══════════════════════════════════════════
          TOP NAV
      ═══════════════════════════════════════════ */}
      <nav style={{
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: scrolled
          ? '0 4px 18px rgba(15, 30, 40, 0.08)'
          : 'var(--shadow-sm)',
        transition: 'background 0.25s ease, box-shadow 0.25s ease, height 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '0 14px' : '0 24px',
          height: isMobile ? (scrolled ? 48 : 54) : (scrolled ? 52 : 60),
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 10 : 20,
          transition: 'height 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
        }}>

          {/* ── Hamburger (mobile) ────────────── */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{
                width: 36, height: 36, borderRadius: 9,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-primary)',
                flexShrink: 0,
              }}
            >
              <Menu size={18} strokeWidth={2.2} />
            </button>
          )}

          {/* ── Logo ─────────────────────────────── */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            {!imgErr ? (
              <img
                src="/vero-wordmark-clean.png"
                alt="VERO."
                height={isMobile ? 22 : 26}
                style={{ objectFit: 'contain', display: 'block' }}
                onError={() => setImgErr(true)}
              />
            ) : (
              <span style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: isMobile ? '1.1rem' : '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                color: 'var(--teal)',
              }}>
                VERO<span style={{ color: 'var(--text-primary)' }}>.</span>
              </span>
            )}

            {/* Pi status pill · desktop only */}
            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '3px 9px 3px 7px',
                borderRadius: 99,
                fontSize: '0.7rem', fontWeight: 700,
                background: piConnected ? 'var(--green-light)' : 'rgba(90,122,146,0.09)',
                color: piConnected ? 'var(--green)' : 'var(--text-muted)',
                border: `1px solid ${piConnected ? 'var(--green-border)' : 'var(--border)'}`,
              }}>
                {piConnected
                  ? <Wifi size={11} strokeWidth={2.5} />
                  : <WifiOff size={11} strokeWidth={2.5} />
                }
                {piConnected ? 'Live' : 'Sim'}
              </div>
            )}
          </div>

          {/* ── Page title (desktop) · fixed-width column so right cluster stays put ─ */}
          {!isMobile && (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
              minWidth: 0,
              overflow: 'hidden',
            }}>
              <span style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {page.title}
              </span>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-soft)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flex: 1,
                minWidth: 0,
              }}>
                {page.sub}
              </span>
            </div>
          )}

          {/* Spacer for mobile so right cluster pushes right */}
          {isMobile && <div style={{ flex: 1 }} />}

          {/* ── Right cluster ─────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 8, flexShrink: 0 }}>

            {/* Notifications bell */}
            <button
              onClick={() => setBellOpen(!bellOpen)}
              aria-label={bellOpen ? 'Close notifications · 3 unread' : 'Open notifications · 3 unread'}
              aria-haspopup="dialog"
              aria-expanded={bellOpen}
              title="Notifications (3 unread)"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: bellOpen ? 'var(--teal-glow)' : 'var(--surface-card)',
                border: `1px solid ${bellOpen ? 'var(--teal-border)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: bellOpen ? 'var(--teal)' : 'var(--text-muted)',
                position: 'relative',
                transition: 'all 0.12s',
              }}
            >
              <Bell size={15} strokeWidth={2.2} />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', top: 5, right: 6,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--red)',
                  border: '2px solid var(--surface-card)',
                }}
              />
            </button>

            {/* Command palette trigger (desktop only) */}
            {!isMobile && onCommandPalette && (
              <button
                onClick={onCommandPalette}
                aria-label="Open command palette"
                title="Search · ⌘K"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 10px 6px 12px',
                  borderRadius: 9,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem', fontWeight: 600,
                  minWidth: 160,
                  transition: 'all 0.14s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.color = 'var(--teal)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <Search size={13} strokeWidth={2.4} />
                <span style={{ flex: 1, textAlign: 'left' }}>Search…</span>
                <kbd style={{
                  fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 700,
                  color: 'var(--text-soft)',
                  border: '1px solid var(--border)', borderRadius: 5,
                  padding: '1px 5px',
                  background: 'var(--surface)',
                  lineHeight: 1.2,
                }}>
                  ⌘K
                </kbd>
              </button>
            )}

            {/* Live clock (desktop only) — gives the dashboard a real-time feel */}
            {!isMobile && (
              <div
                aria-label={`Current time ${timeStr}, ${dateStr}`}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-end', justifyContent: 'center',
                  padding: '0 4px 0 0',
                  lineHeight: 1.1,
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  borderRight: '1px solid var(--border)',
                  marginRight: 4, paddingRight: 12,
                }}
              >
                <div style={{
                  fontSize: '0.92rem', fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: piConnected ? 'var(--green)' : 'var(--text-soft)',
                    boxShadow: piConnected ? '0 0 0 0 rgba(34,197,94,0.55)' : 'none',
                    animation: piConnected ? 'navHeartbeat 1.8s ease-out infinite' : 'none',
                  }} />
                  {timeStr}
                </div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-soft)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  {dateStr}
                </div>
                <style>{`
                  @keyframes navHeartbeat {
                    0%   { box-shadow: 0 0 0 0    rgba(34,197,94,0.55); }
                    70%  { box-shadow: 0 0 0 7px  rgba(34,197,94,0);    }
                    100% { box-shadow: 0 0 0 0    rgba(34,197,94,0);    }
                  }
                `}</style>
              </div>
            )}

            {/* Reports (desktop only) */}
            {!isMobile && onReports && (
              <button
                onClick={onReports}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 9,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem', fontWeight: 700,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <FileSpreadsheet size={13} strokeWidth={2.5} />
                Reports
              </button>
            )}

            {/* Marker (desktop only) · animated to draw attention */}
            {!isMobile && (
              <button
                onClick={onMarker}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem', fontWeight: 800,
                  letterSpacing: '0.02em',
                  boxShadow: '0 4px 14px rgba(20, 184, 184, 0.32)',
                  animation: 'markerPulse 2.4s ease-in-out infinite',
                  transition: 'transform 0.14s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
              >
                <BookOpen size={14} strokeWidth={2.6} />
                <span>For the marker</span>
                <span style={{
                  fontSize: '0.95rem', lineHeight: 1,
                  animation: 'markerWave 1.6s ease-in-out infinite',
                }}>
                  👋
                </span>
                <style>{`
                  @keyframes markerPulse {
                    0%, 100% { box-shadow: 0 4px 14px rgba(20,184,184,0.32), 0 0 0 0 rgba(20,184,184,0.45); }
                    50%      { box-shadow: 0 4px 14px rgba(20,184,184,0.32), 0 0 0 8px rgba(20,184,184,0); }
                  }
                  @keyframes markerWave {
                    0%, 100% { transform: rotate(0deg); }
                    25%      { transform: rotate(15deg); }
                    50%      { transform: rotate(-8deg); }
                    75%      { transform: rotate(12deg); }
                  }
                `}</style>
              </button>
            )}

            {/* Role pills (desktop only) */}
            {!isMobile && (
              <div style={{
                display: 'flex', gap: 2, alignItems: 'center',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '3px',
              }}>
                {ROLES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      padding: '4px 11px',
                      borderRadius: 8,
                      background: role === r ? 'var(--surface-card)' : 'transparent',
                      color: role === r ? 'var(--text-primary)' : 'var(--text-muted)',
                      fontWeight: role === r ? 700 : 500,
                      fontSize: '0.8rem',
                      boxShadow: role === r ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.12s ease',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Avatar chip · fixed-width so it doesn't jump per role */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: isMobile ? '4px' : '4px 10px 4px 6px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface-card)',
              width: isMobile ? 'auto' : 168,
              flexShrink: 0,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: meta.colour, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.68rem',
                letterSpacing: '0.04em',
                flexShrink: 0,
              }}>
                {meta.initials}
              </div>
              {!isMobile && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.78rem', fontWeight: 700,
                      color: 'var(--text-primary)', lineHeight: 1.2,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', lineHeight: 1.2 }}>
                      {role}
                    </div>
                  </div>
                  <ChevronDown size={13} strokeWidth={2.5} style={{ color: 'var(--text-soft)', flexShrink: 0 }} />
                </>
              )}
            </div>

            {/* Logout (desktop only · drawer handles it on mobile) */}
            {!isMobile && onLogout && (
              <button
                onClick={onLogout}
                title="Sign out"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'all 0.12s',
                }}
              >
                <LogOut size={14} strokeWidth={2.2} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          NOTIFICATIONS DROPDOWN
      ═══════════════════════════════════════════ */}
      {bellOpen && (
        <>
          <div
            onClick={() => setBellOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 300 }}
          />
          <div style={{
            position: 'fixed',
            top: isMobile ? 60 : 66,
            right: isMobile ? 10 : 24,
            width: isMobile ? 'calc(100vw - 20px)' : 360,
            maxWidth: 380,
            background: 'var(--surface-card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 301,
            animation: 'slideDown 0.18s ease',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'var(--surface-soft)',
            }}>
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '0.95rem' }}>
                Notifications
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-glow)', padding: '2px 8px', borderRadius: 99 }}>
                3 new
              </span>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {[
                { icon: '🎉', title: 'Attendance milestone', text: 'School hit 91% attendance today', time: '2 min ago', colour: 'var(--green)' },
                { icon: '⚠️', title: 'Low attendance alert', text: 'Year 12 below 88% · second day running', time: '24 min ago', colour: 'var(--amber)' },
                { icon: '📅', title: 'Parent-teacher night', text: 'Reminders sent to 1,050 families', time: '1 hr ago', colour: 'var(--blue)' },
                { icon: '🏆', title: 'Class 7A leads', text: 'Highest rate in school: 97.2%', time: '3 hrs ago', colour: 'var(--teal)' },
                { icon: '🔔', title: 'System update', text: 'ACR122U firmware: stable', time: 'Yesterday', colour: 'var(--text-muted)' },
              ].map((n, i) => (
                <div key={i} style={{
                  padding: '12px 18px',
                  display: 'flex', gap: 11,
                  borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontSize: '1.05rem', flexShrink: 0 }}>{n.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-soft)', marginTop: 4, fontWeight: 600 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
              <button style={{
                width: '100%', background: 'transparent', color: 'var(--teal)',
                fontSize: '0.8rem', fontWeight: 700, padding: '4px',
              }}>
                Mark all as read
              </button>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════════ */}
      {isMobile && menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 400,
              background: 'rgba(15,30,40,0.45)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.15s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: '82%', maxWidth: 320,
            background: 'var(--surface-card)',
            zIndex: 401,
            display: 'flex', flexDirection: 'column',
            animation: 'drawerIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '4px 0 24px rgba(0,0,0,0.18)',
          }}>
            {/* Drawer header */}
            <div style={{
              padding: '18px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <img src="/vero-wordmark-clean.png" alt="VERO." height={24} style={{ objectFit: 'contain' }} />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Current user banner */}
            <div style={{
              padding: '16px 20px',
              background: 'var(--surface-soft)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: meta.colour, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.85rem',
              }}>{meta.initials}</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{meta.label}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{role} · Signed in</div>
              </div>
            </div>

            {/* Role switcher */}
            <div style={{ padding: '16px 16px 8px' }}>
              <div className="label-caps" style={{ marginBottom: 10, paddingLeft: 4 }}>Switch role</div>
              {ROLES.map(r => {
                const m = ROLE_META[r];
                const Icon = m.icon;
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px',
                      borderRadius: 10,
                      background: isActive ? `${m.colour}12` : 'transparent',
                      border: `1px solid ${isActive ? `${m.colour}30` : 'transparent'}`,
                      color: isActive ? m.colour : 'var(--text-primary)',
                      fontWeight: isActive ? 700 : 600,
                      fontSize: '0.9rem',
                      marginBottom: 4,
                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: 8,
                      background: isActive ? m.colour : `${m.colour}18`,
                      color: isActive ? '#fff' : m.colour,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={14} strokeWidth={2.2} />
                    </div>
                    <span style={{ flex: 1 }}>{r}</span>
                    {isActive && <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>● Active</span>}
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', marginTop: 8 }}>
              <button
                onClick={() => { setMenuOpen(false); onReports?.(); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '12px',
                  background: 'var(--surface-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontWeight: 700, fontSize: '0.88rem',
                  marginTop: 8,
                }}
              >
                <FileSpreadsheet size={15} strokeWidth={2.2} style={{ color: 'var(--teal)' }} />
                Reports & exports
              </button>
              <button
                onClick={() => { setMenuOpen(false); onMarker?.(); }}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '12px',
                  background: 'var(--teal-glow)',
                  border: '1px solid var(--teal-border)',
                  borderRadius: 10,
                  color: 'var(--teal)',
                  fontWeight: 700, fontSize: '0.88rem',
                  marginTop: 8,
                }}
              >
                <BookOpen size={15} strokeWidth={2.2} />
                Open marker page
              </button>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', padding: '16px 16px 20px', borderTop: '1px solid var(--border)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 12px',
                background: piConnected ? 'var(--green-light)' : 'var(--surface)',
                border: `1px solid ${piConnected ? 'var(--green-border)' : 'var(--border)'}`,
                borderRadius: 10,
                marginBottom: 10,
              }}>
                {piConnected
                  ? <Wifi size={13} strokeWidth={2.5} style={{ color: 'var(--green)' }} />
                  : <WifiOff size={13} strokeWidth={2.5} style={{ color: 'var(--text-muted)' }} />}
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: piConnected ? 'var(--green)' : 'var(--text-muted)' }}>
                  {piConnected ? 'Pi connected · Live mode' : 'Simulator mode'}
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    color: 'var(--red)',
                    fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  <LogOut size={14} strokeWidth={2.2} />
                  Sign out
                </button>
              )}
            </div>
          </div>

          <style>{`
            @keyframes drawerIn {
              from { transform: translateX(-100%); }
              to   { transform: translateX(0); }
            }
          `}</style>
        </>
      )}

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM TAB BAR
      ═══════════════════════════════════════════ */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          zIndex: 199,
          padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 2,
        }}>
          {ROLES.map(r => {
            const m = ROLE_META[r];
            const Icon = m.icon;
            const isActive = role === r;
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  padding: '8px 4px',
                  background: 'transparent',
                  color: isActive ? m.colour : 'var(--text-soft)',
                  fontSize: '0.65rem', fontWeight: 700,
                  borderRadius: 10,
                  transition: 'all 0.12s',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: isActive ? `${m.colour}18` : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.14s',
                }}>
                  <Icon size={15} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {r}
              </button>
            );
          })}
        </nav>
      )}

      {/* Padding bottom so content doesn't sit under the bar */}
      {isMobile && <div style={{ height: 56 }} />}
    </>
  );
}
