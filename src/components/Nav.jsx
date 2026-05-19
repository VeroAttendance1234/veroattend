import { useState } from 'react';
import { Wifi, WifiOff, ChevronDown, BookOpen, LogOut } from 'lucide-react';

const ROLES = ['Admin', 'Teacher', 'Student', 'Parent'];

const ROLE_META = {
  Admin:   { colour: 'var(--teal)',   initials: 'AD', label: 'Administrator' },
  Teacher: { colour: 'var(--blue)',   initials: 'TC', label: 'Mr David Chen' },
  Student: { colour: 'var(--green)',  initials: 'AP', label: 'Aisha Patel' },
  Parent:  { colour: 'var(--purple)', initials: 'JP', label: 'J. Patel' },
};

const PAGE_TITLES = {
  Admin:   { title: 'Admin Dashboard',    sub: 'School-wide attendance & analytics' },
  Teacher: { title: 'Teacher Dashboard',  sub: 'Class management & live attendance' },
  Student: { title: 'Student Portal',     sub: 'Your attendance, goals & wellbeing' },
  Parent:  { title: 'Parent View',        sub: "Your child's attendance & progress" },
};

export default function Nav({ role, setRole, piConnected, onMarker, onLogout }) {
  const [imgErr, setImgErr] = useState(false);
  const meta = ROLE_META[role];
  const page = PAGE_TITLES[role];

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 200,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}>

        {/* ── Logo ────────────────────────────── */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          {!imgErr ? (
            <img
              src="/vero-wordmark.png"
              alt="VERO."
              height={26}
              style={{ objectFit: 'contain', display: 'block' }}
              onError={() => setImgErr(true)}
            />
          ) : (
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: 'var(--teal)',
            }}>
              VERO<span style={{ color: 'var(--text-primary)' }}>.</span>
            </span>
          )}

          {/* Pi status */}
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
        </div>

        {/* ── Page title ───────────────────────── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
          <span style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}>
            {page.title}
          </span>
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--text-soft)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {page.sub}
          </span>
        </div>

        {/* ── Right: role switcher + avatar ───── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Marker page button */}
          <button
            onClick={onMarker}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 8,
              background: 'var(--teal-glow)',
              border: '1px solid var(--teal-border)',
              color: 'var(--teal)',
              fontSize: '0.78rem', fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            <BookOpen size={13} strokeWidth={2.5} />
            Marker
          </button>
          {/* Role pills */}
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
                  letterSpacing: '0.005em',
                }}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Avatar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 10px 4px 6px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface-card)',
            cursor: 'pointer',
            gap: 7,
          }}>
            <div style={{
              width: 28, height: 28,
              borderRadius: 8,
              background: meta.colour,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.68rem',
              letterSpacing: '0.04em',
            }}>
              {meta.initials}
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {meta.label}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-soft)', lineHeight: 1.2 }}>
                {role}
              </div>
            </div>
            <ChevronDown size={13} strokeWidth={2.5} style={{ color: 'var(--text-soft)', marginLeft: 2 }} />
          </div>

          {/* Logout */}
          {onLogout && (
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
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <LogOut size={14} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
