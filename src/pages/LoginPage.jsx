import { useState, useEffect } from 'react';
import {
  Monitor, BookOpen, Heart, Users, CreditCard, Lock,
  Mail, Eye, EyeOff, ChevronRight, Wifi, Shield, Zap, Clock, TrendingUp, Sparkles,
} from 'lucide-react';
import Tagline from '../components/Tagline';

/* Rotates through simulated card-tap events to suggest the system is alive */
function LiveActivityTicker() {
  const EVENTS = [
    { name: 'Toby Crowther',   class: '12A · Maths',    when: 'just now', colour: 'var(--green)' },
    { name: 'Mr David Chen',   class: 'Year 11 home',   when: '4s ago',   colour: 'var(--blue)' },
    { name: 'Hassan Khan',     class: '8E · Geography', when: '11s ago',  colour: 'var(--teal)' },
    { name: 'Olivia Burns',    class: '12B · Physics',  when: '18s ago',  colour: 'var(--purple)' },
    { name: 'Marco Trovato',   class: '9F · English',   when: '24s ago',  colour: 'var(--green)' },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % EVENTS.length), 2400);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ev = EVENTS[idx];
  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(6px)',
      borderRadius: 14,
      padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      overflow: 'hidden',
    }} aria-live="polite">
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(45,212,191,0.14)',
        border: '1px solid rgba(45,212,191,0.30)',
        color: '#5EEAD4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <CreditCard size={15} strokeWidth={2.4} />
      </div>
      <div key={idx} style={{ flex: 1, minWidth: 0, animation: 'tickerIn 0.32s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.85rem', fontWeight: 700, color: '#F7FDFC',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {ev.name}
          <span style={{
            fontSize: '0.62rem', fontWeight: 800,
            color: '#fff', background: ev.colour,
            padding: '2px 7px', borderRadius: 99, letterSpacing: '0.03em',
          }}>
            CHECKED IN
          </span>
        </div>
        <div style={{
          fontSize: '0.74rem', color: 'rgba(214,240,238,0.62)',
          display: 'flex', gap: 6, alignItems: 'center',
        }}>
          <span>{ev.class}</span>
          <span style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
          <Clock size={10} strokeWidth={2.5} />
          <span>{ev.when}</span>
        </div>
      </div>
      <TrendingUp size={14} strokeWidth={2.4} style={{ color: '#5EEAD4', flexShrink: 0, opacity: 0.7 }} />
      <style>{`
        @keyframes tickerIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0);    }
        }
      `}</style>
    </div>
  );
}

const ROLE_OPTIONS = [
  { role: 'Admin',   label: 'Administrator',   email: 'admin@millpond.nsw.edu.au',     colour: '#14B8B8', icon: Monitor },
  { role: 'Teacher', label: 'Mr David Chen',   email: 'd.chen@millpond.nsw.edu.au',    colour: '#2563EB', icon: BookOpen },
  { role: 'Student', label: 'Toby Crowther',   email: 'tc.160138@student.millpond.nsw.edu.au', colour: '#16A34A', icon: Heart },
  { role: 'Parent',  label: 'J. Crowther',     email: 'jcrowther@parents.millpond.nsw',        colour: '#7C3AED', icon: Users },
];

export default function LoginPage({ onLogin }) {
  const [selectedRole, setSelectedRole]   = useState('Admin');
  const [email, setEmail]                 = useState('admin@millpond.nsw.edu.au');
  const [password, setPassword]           = useState('demo1234');
  const [showPassword, setShowPassword]   = useState(false);
  const [scanning, setScanning]           = useState(false);
  const [error, setError]                 = useState('');
  const [loginMethod, setLoginMethod]     = useState('password'); // 'password' | 'card'

  function pickRole(r) {
    setSelectedRole(r.role);
    setEmail(r.email);
    // Password persists across role picks (demo convenience)
    setError('');
  }

  function handleLogin(e) {
    e?.preventDefault();
    setError('');
    // No validation in demo mode · Sign in always works
    onLogin(selectedRole);
  }

  function handleCardLogin() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onLogin(selectedRole);
    }, 1400);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--surface)',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ── Animated mesh-gradient background ───
          Four soft blobs that drift slowly behind everything,
          giving the page a living "atmosphere" without taking
          focus from the form. Pointer-events: none so it doesn't
          interfere with anything. */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        {[
          { c: 'rgba(20,184,184,0.18)',  x: '10%',  y: '15%', size: '60vmax', dur: '22s', delay: '0s'   },
          { c: 'rgba(20,184,184,0.12)',  x: '85%',  y: '78%', size: '55vmax', dur: '28s', delay: '-7s'  },
          { c: 'rgba(34,197,94,0.07)',   x: '78%',  y: '15%', size: '45vmax', dur: '24s', delay: '-12s' },
          { c: 'rgba(20,184,184,0.10)',  x: '20%',  y: '85%', size: '50vmax', dur: '30s', delay: '-3s'  },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: b.x, top: b.y,
            width: b.size, height: b.size,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 60%)`,
            transform: 'translate(-50%, -50%)',
            animation: `loginBlobDrift ${b.dur} ${b.delay} ease-in-out infinite`,
            filter: 'blur(8px)',
          }} />
        ))}
        <style>{`
          @keyframes loginBlobDrift {
            0%, 100% { transform: translate(-50%, -50%) scale(1)   rotate(0deg);   }
            33%      { transform: translate(-40%, -55%) scale(1.18) rotate(40deg);  }
            66%      { transform: translate(-58%, -45%) scale(0.92) rotate(-30deg); }
          }
        `}</style>
      </div>

      {/* Login panels sit above the background */}
      <div style={{ display: 'flex', width: '100%', position: 'relative', zIndex: 1 }}>
      {/* ── Left: brand panel (desktop only) ── */}
      <div className="login-brand" style={{
        flex: '0 0 50%',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        background: 'linear-gradient(160deg, #052726 0%, #0A403E 52%, #0E5450 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Ambient glows inside the dark panel */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-18%', right: '-12%',
            width: '58%', height: '52%',
            background: 'radial-gradient(circle, rgba(45,212,191,0.20) 0%, transparent 65%)',
            filter: 'blur(28px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-22%', left: '-10%',
            width: '68%', height: '58%',
            background: 'radial-gradient(circle, rgba(20,184,184,0.14) 0%, transparent 65%)',
            filter: 'blur(28px)',
          }} />
        </div>

        {/* Top: wordmark + live-connection chip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', position: 'relative' }}>
          <div>
            <img src="/vero-wordmark-clean.png" alt="VERO." style={{ height: 34, marginBottom: 10, display: 'block', filter: 'brightness(0) invert(1)' }} />
            <Tagline size="md" light />
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 99, padding: '6px 12px',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 0 0 rgba(34,197,94,0.6)',
              animation: 'heroHeartbeat 1.8s ease-out infinite',
            }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7FE7DC', letterSpacing: '0.03em' }}>
              ACR122U · LIVE
            </span>
          </div>
        </div>

        {/* Middle: hero + focal stat + activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28, position: 'relative' }}>

          {/* Massive gradient headline with kinetic word-in */}
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.4vw, 4.2rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.045em',
            margin: 0,
            color: '#F7FDFC',
            fontWeight: 800,
          }}>
            <span className="heroWord" style={{ animationDelay: '0.05s' }}>Real-time.</span>{' '}
            <span className="heroWord" style={{ animationDelay: '0.18s' }}>Right</span>{' '}
            <span className="heroWord heroWordAccent" style={{ animationDelay: '0.30s' }}>now.</span>
          </h1>

          <p style={{
            fontSize: '1.02rem', color: 'rgba(214,240,238,0.72)',
            lineHeight: 1.6, maxWidth: 460, margin: 0,
          }}>
            Replace the 5-minute roll call with a single NFC tap. Every
            classroom, every period, every parent, synced in under 100ms.
          </p>

          {/* Focal stat: the one number that should burn in */}
          <div style={{
            position: 'relative',
            padding: '22px 24px',
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(6px)',
            overflow: 'hidden',
          }}>
            {/* Decorative corner glow */}
            <div aria-hidden="true" style={{
              position: 'absolute', top: -60, right: -60,
              width: 160, height: 160, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45,212,191,0.30), transparent 60%)',
              filter: 'blur(8px)',
            }} />
            <div style={{ position: 'relative' }}>
              <div className="label-caps" style={{ color: '#5EEAD4', marginBottom: 6, fontSize: '0.62rem' }}>
                Per-school annual impact
              </div>
              <div style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(2.4rem, 5vw, 3.4rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                background: 'linear-gradient(135deg, #86EFAC 0%, #5EEAD4 45%, #2DD4BF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                300<span style={{ fontSize: '0.42em', color: '#5EEAD4', WebkitTextFillColor: '#5EEAD4' }}> hrs/yr</span>
              </div>
              <div style={{
                fontSize: '0.88rem', color: 'rgba(214,240,238,0.72)',
                marginTop: 6, lineHeight: 1.5,
              }}>
                of teaching time reclaimed when manual roll calls are replaced,
                across a typical 30-staff secondary school.
              </div>
            </div>
          </div>

          {/* Live activity ticker - rotates through simulated taps */}
          <LiveActivityTicker />
        </div>

        {/* Bottom: trust strip + footer */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', gap: 18, alignItems: 'center',
            color: 'rgba(214,240,238,0.65)', fontSize: '0.74rem', fontWeight: 700,
            marginBottom: 14, flexWrap: 'wrap',
          }}>
            {[
              { icon: Shield, text: 'WCAG 2.1 AA' },
              { icon: Zap,    text: '<100 ms latency' },
              { icon: Wifi,   text: 'Offline-tolerant' },
            ].map(({ icon: Icon, text }) => (
              <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Icon size={12} strokeWidth={2.4} style={{ color: '#5EEAD4' }} />
                {text}
              </span>
            ))}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(214,240,238,0.4)' }}>
            © 2026 VERO · HSC Software Design & Development Major Project
          </div>
        </div>

        <style>{`
          .heroWord {
            display: inline-block;
            opacity: 0;
            transform: translateY(18px);
            animation: heroWordIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          }
          .heroWordAccent {
            background: linear-gradient(135deg, #86EFAC 0%, #2DD4BF 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          @keyframes heroWordIn {
            from { opacity: 0; transform: translateY(18px); filter: blur(4px); }
            to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
          }
          @keyframes heroHeartbeat {
            0%   { box-shadow: 0 0 0 0    rgba(34,197,94,0.55); }
            70%  { box-shadow: 0 0 0 8px  rgba(34,197,94,0);    }
            100% { box-shadow: 0 0 0 0    rgba(34,197,94,0);    }
          }
        `}</style>
      </div>

      {/* ── Right: form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div className="login-card" style={{
          width: '100%', maxWidth: 448,
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(20px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.9)',
          borderRadius: 24,
          boxShadow: '0 4px 24px rgba(15,152,152,0.10), 0 24px 64px rgba(47,62,70,0.14)',
          padding: '36px 34px',
        }}>

          {/* Mobile-only logo */}
          <div className="login-mobile-logo" style={{ display: 'none', textAlign: 'center', marginBottom: 28, alignItems: 'center' }}>
            <img src="/vero-wordmark-clean.png" alt="VERO." style={{ height: 32, display: 'block', margin: '0 auto 10px' }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}><Tagline size="sm" /></div>
          </div>

          <h2 style={{
            fontSize: '1.9rem',
            marginBottom: 6,
            letterSpacing: '-0.025em',
            fontWeight: 800,
          }}>
            Welcome<span style={{ color: 'var(--teal)' }}>.</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 18, lineHeight: 1.5 }}>
            Pick a role. Every dashboard is fully wired with seeded data.
          </p>

          {/* Demo helper banner · makes it obvious what to do */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(90deg, var(--teal-glow) 0%, rgba(20,184,184,0.05) 100%)',
            border: '1.5px solid var(--teal-border)',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 22,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Subtle moving shimmer */}
            <span aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
              animation: 'demoShimmer 3.6s linear infinite',
              pointerEvents: 'none',
            }} />
            <span style={{
              width: 30, height: 30, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(20,184,184,0.35)',
              position: 'relative',
            }}>
              <Sparkles size={14} strokeWidth={2.4} />
            </span>
            <div style={{ flex: 1, fontSize: '0.82rem', lineHeight: 1.5, position: 'relative' }}>
              <strong style={{ color: 'var(--teal-dark)' }}>Demo ready.</strong>{' '}
              <span style={{ color: 'var(--text-secondary)' }}>
                Password is pre-filled · just click <strong>Sign in</strong> below.
              </span>
            </div>
            <style>{`
              @keyframes demoShimmer {
                from { transform: translateX(-100%); }
                to   { transform: translateX(100%);  }
              }
            `}</style>
          </div>

          {/* Role picker */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 22,
          }}>
            {ROLE_OPTIONS.map(r => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  className="login-role"
                  onClick={() => pickRole(r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 14px', borderRadius: 12,
                    background: isSelected ? `${r.colour}10` : 'var(--surface-card)',
                    border: `1.5px solid ${isSelected ? r.colour : 'var(--border)'}`,
                    textAlign: 'left',
                    transition: 'all 0.12s ease',
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 9,
                    background: `${r.colour}18`,
                    color: r.colour,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} strokeWidth={2.2} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {r.role}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Method toggle */}
          <div style={{
            display: 'flex', gap: 4, padding: 3,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10, marginBottom: 18,
          }}>
            {[
              { id: 'password', label: 'Password', icon: Lock },
              { id: 'card',     label: 'NFC Card', icon: CreditCard },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setLoginMethod(id)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '7px 10px', borderRadius: 8,
                  background: loginMethod === id ? 'var(--surface-card)' : 'transparent',
                  color: loginMethod === id ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.82rem',
                  boxShadow: loginMethod === id ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                <Icon size={13} strokeWidth={2.5} />
                {label}
              </button>
            ))}
          </div>

          {/* Form (password) */}
          {loginMethod === 'password' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6, letterSpacing: '0.02em' }}>
                  Email
                </label>
                <div className="login-field" style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  border: '1px solid var(--border)', borderRadius: 10,
                  padding: '0 13px', background: 'var(--surface-card)',
                }}>
                  <Mail size={15} style={{ color: 'var(--text-soft)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={{
                      border: 'none', background: 'transparent', padding: '11px 0',
                      width: '100%', fontSize: '0.875rem',
                    }}
                  />
                </div>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 6,
                  minHeight: 18,
                }}>
                  <label style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.02em',
                    lineHeight: 1.2,
                  }}>
                    Password
                  </label>
                  <a href="mailto:it@millpond.nsw.edu.au?subject=VERO%20password%20reset" style={{
                    fontSize: '0.74rem',
                    color: 'var(--teal)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    lineHeight: 1.2,
                  }}>
                    Forgot?
                  </a>
                </div>
                <div className="login-field" style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  border: `1px solid ${error ? 'var(--red-border)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '0 13px',
                  background: 'var(--surface-card)',
                }}>
                  <Lock size={15} style={{ color: 'var(--text-soft)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value="demo1234"
                    readOnly
                    aria-label="Demo password (pre-filled)"
                    style={{
                      border: 'none', background: 'transparent', padding: '11px 0',
                      width: '100%', fontSize: '0.875rem',
                      cursor: 'not-allowed',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', padding: 0, color: 'var(--text-soft)', display: 'flex' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {error && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--red)', marginTop: 6, fontWeight: 600 }}>
                    {error}
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
                  color: '#fff',
                  padding: '14px 20px',
                  borderRadius: 12,
                  fontWeight: 800, fontSize: '1rem',
                  letterSpacing: '0.01em',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 6,
                  boxShadow: '0 4px 16px rgba(20, 184, 184, 0.3)',
                  transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(20, 184, 184, 0.42)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(20, 184, 184, 0.3)'; }}
              >
                Sign in as {selectedRole}
                <ChevronRight size={17} strokeWidth={3} />
              </button>
            </form>
          )}

          {/* Form (card) */}
          {loginMethod === 'card' && (
            <div style={{
              background: 'var(--surface-card)',
              border: `2px dashed ${scanning ? 'var(--teal)' : 'var(--border-strong)'}`,
              borderRadius: 14, padding: '32px 24px',
              textAlign: 'center',
              transition: 'all 0.25s',
            }}>
              <div style={{
                width: 70, height: 70, borderRadius: 20,
                background: scanning ? 'var(--teal)' : 'var(--teal-glow)',
                border: `2px solid ${scanning ? 'var(--teal-dark)' : 'var(--teal-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 18px',
                color: scanning ? '#fff' : 'var(--teal)',
                boxShadow: scanning ? '0 0 24px rgba(20,184,184,0.5)' : 'none',
                transition: 'all 0.25s',
              }}>
                <CreditCard size={28} strokeWidth={2} style={scanning ? { animation: 'pulse-dot 1.2s ease-in-out infinite' } : null} />
              </div>
              <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                {scanning ? 'Reading card...' : 'Tap your NFC card'}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
                {scanning
                  ? 'Authenticating with the school directory...'
                  : `Hold your card near the ACR122U reader to sign in as ${selectedRole}`
                }
              </p>
              <button
                onClick={handleCardLogin}
                disabled={scanning}
                style={{
                  background: scanning ? 'var(--text-soft)' : 'var(--teal)',
                  color: '#fff', padding: '10px 22px', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.85rem',
                  opacity: scanning ? 0.7 : 1,
                }}
              >
                {scanning ? 'Scanning...' : 'Simulate tap'}
              </button>
            </div>
          )}

          {/* Footer help */}
          <div style={{
            marginTop: 22, paddingTop: 18,
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
            fontSize: '0.78rem', color: 'var(--text-muted)',
          }}>
            Need help? <a href="mailto:it@millpond.nsw.edu.au?subject=VERO%20support" style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'none' }}>Contact IT</a>
          </div>
        </div>
      </div>

      <style>{`
        .login-field {
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .login-field:focus-within {
          border-color: var(--teal) !important;
          box-shadow: 0 0 0 3px rgba(20,184,184,0.14);
        }
        .login-role {
          cursor: pointer;
        }
        .login-role:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
        @media (max-width: 800px) {
          .login-brand { display: none !important; }
          .login-mobile-logo { display: block !important; }
          .login-card {
            background: rgba(255,255,255,0.85) !important;
            padding: 28px 22px !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
