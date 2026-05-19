import { useState } from 'react';
import {
  Monitor, BookOpen, Heart, Users, CreditCard, Lock,
  Mail, Eye, EyeOff, ChevronRight, Wifi, Shield,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { role: 'Admin',   label: 'Administrator',   email: 'admin@shore.nsw.edu.au',     colour: '#14B8B8', icon: Monitor },
  { role: 'Teacher', label: 'Mr David Chen',   email: 'd.chen@shore.nsw.edu.au',    colour: '#2563EB', icon: BookOpen },
  { role: 'Student', label: 'Aisha Patel',     email: 'a.patel@students.shore.nsw', colour: '#16A34A', icon: Heart },
  { role: 'Parent',  label: 'J. Patel',        email: 'jpatel@parents.shore.nsw',   colour: '#7C3AED', icon: Users },
];

export default function LoginPage({ onLogin }) {
  const [selectedRole, setSelectedRole]   = useState('Admin');
  const [email, setEmail]                 = useState('admin@shore.nsw.edu.au');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [scanning, setScanning]           = useState(false);
  const [error, setError]                 = useState('');
  const [loginMethod, setLoginMethod]     = useState('password'); // 'password' | 'card'

  function pickRole(r) {
    setSelectedRole(r.role);
    setEmail(r.email);
    setPassword('');
    setError('');
  }

  function handleLogin(e) {
    e?.preventDefault();
    setError('');
    if (loginMethod === 'password' && password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
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
      backgroundImage: `
        radial-gradient(circle at 15% 20%, var(--teal-glow) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(124,58,237,0.06) 0%, transparent 40%)
      `,
    }}>
      {/* ── Left: brand panel (desktop only) ── */}
      <div className="login-brand" style={{
        flex: '0 0 45%',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        borderRight: '1px solid var(--border)',
        background: 'var(--surface-card)',
      }}>
        <div>
          <img src="/vero-wordmark.png" alt="VERO." style={{ height: 32, marginBottom: 4 }} />
          <img src="/vero-tagline.png" alt="Attendance. Made Real." style={{ height: 18, opacity: 0.6 }} />
        </div>

        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--teal-glow)',
            border: '1px solid var(--teal-border)',
            borderRadius: 99, padding: '6px 14px',
            marginBottom: 22,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--teal)', letterSpacing: '0.02em' }}>
              Pi connected · ACR122U online
            </span>
          </div>

          <h1 style={{
            fontSize: '2.4rem', lineHeight: 1.1, letterSpacing: '-0.035em',
            marginBottom: 16, color: 'var(--text-primary)',
          }}>
            Sign in to your<br/>school dashboard.
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 380 }}>
            Real-time attendance, wellbeing and analytics —
            powered by NFC card taps and your Raspberry Pi.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 32 }}>
            {[
              { icon: CreditCard, text: 'NFC card or password sign-in' },
              { icon: Shield,     text: 'Role-based access control' },
              { icon: Wifi,       text: 'Real-time WebSocket updates' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex', alignItems: 'center', gap: 11,
                fontSize: '0.85rem', color: 'var(--text-muted)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--teal-glow)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--teal)', flexShrink: 0,
                }}>
                  <Icon size={13} strokeWidth={2.2} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)' }}>
          © 2026 VERO · HSC Software Design & Development Major Project
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div style={{
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile-only logo */}
          <div className="login-mobile-logo" style={{ display: 'none', textAlign: 'center', marginBottom: 28 }}>
            <img src="/vero-wordmark.png" alt="VERO." style={{ height: 28, marginBottom: 4 }} />
            <img src="/vero-tagline.png" alt="Attendance. Made Real." style={{ height: 16, opacity: 0.6, display: 'block', margin: '0 auto' }} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Welcome back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 26 }}>
            Choose your role to continue. This is a demo — pick any.
          </p>

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
              { id: 'card',     label: 'Tap NFC card', icon: CreditCard },
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
                <div style={{
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                    Password
                  </label>
                  <a href="#" style={{ fontSize: '0.74rem', color: 'var(--teal)', fontWeight: 700, textDecoration: 'none' }}>
                    Forgot?
                  </a>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  border: `1px solid ${error ? 'var(--red-border)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '0 13px',
                  background: 'var(--surface-card)',
                }}>
                  <Lock size={15} style={{ color: 'var(--text-soft)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter any password (demo)"
                    style={{
                      border: 'none', background: 'transparent', padding: '11px 0',
                      width: '100%', fontSize: '0.875rem',
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
                  background: 'var(--teal)', color: '#fff',
                  padding: '12px 16px', borderRadius: 10,
                  fontWeight: 700, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4, boxShadow: '0 4px 16px rgba(20,184,184,0.3)',
                }}
              >
                Sign in
                <ChevronRight size={15} strokeWidth={2.8} />
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
            Need help? <a href="#" style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'none' }}>Contact IT</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .login-brand { display: none; }
          .login-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
