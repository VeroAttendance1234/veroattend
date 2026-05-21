import { useState, useEffect, useRef } from 'react';
import {
  Send, MessageSquare, Search, Check, CheckCheck, Smile, Paperclip, Sparkles,
} from 'lucide-react';
import Avatar from './Avatar';

const ROLE_COLOURS = {
  parent:  'var(--purple)',
  teacher: 'var(--blue)',
  student: 'var(--green)',
  admin:   'var(--teal)',
};

/**
 * MessagingPanel · Schoolbox-style two-pane messaging.
 *
 * - Mobile: shows the thread list, then opens the thread when tapped.
 * - Desktop: classic two-pane (list left, conversation right).
 *
 * @param {string} role        - Logged-in role ('parent' | 'teacher' | 'student' | 'admin')
 * @param {string} userName    - Name of the logged-in user (for "from" attribution)
 * @param {Array}  threads     - Conversation threads from shared state
 * @param {Func}   onSend      - Called when user sends a message (threadId, text)
 */
export default function MessagingPanel({
  role,
  userName,
  threads,
  onSend,
  quickReplies = [],
  typingFromId = null,   // when set, shows a "typing..." indicator in that thread
  height = 480,
}) {
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [draft, setDraft]       = useState('');
  const [search, setSearch]     = useState('');
  const [justSent, setJustSent] = useState(false);
  const scrollRef = useRef(null);
  const inputRef  = useRef(null);

  // Filter threads where the current role participates
  const visible = threads.filter(t =>
    t.participants.some(p => p.role === role)
    && (search.trim() === '' || t.title.toLowerCase().includes(search.toLowerCase()))
  );

  const active = threads.find(t => t.id === activeId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [active?.messages.length, activeId, typingFromId]);

  function handleSend(textOverride) {
    const text = (textOverride ?? draft).trim();
    if (!text || !active) return;
    onSend(active.id, text);
    setDraft('');
    setJustSent(true);
    setTimeout(() => setJustSent(false), 320);
    inputRef.current?.focus();
  }

  function otherParticipants(t) {
    return t.participants.filter(p => p.role !== role);
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(220px, 280px) 1fr',
      gap: 0,
      height,
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
    }} className="messaging-grid">

      {/* ── Thread list ─────────────────────────── */}
      <div style={{
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface-soft)',
      }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-card)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            border: '1px solid var(--border)', borderRadius: 9,
            padding: '0 11px', background: 'var(--surface)',
          }}>
            <Search size={12} style={{ color: 'var(--text-soft)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search messages"
              style={{ border: 'none', background: 'transparent', padding: '8px 0', flex: 1, fontSize: '0.82rem' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {visible.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-soft)' }}>
              No conversations
            </div>
          ) : visible.map(t => {
            const others = otherParticipants(t);
            const last   = t.messages[t.messages.length - 1];
            const isActive = activeId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px',
                  width: '100%', textAlign: 'left',
                  background: isActive ? 'var(--teal-glow)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border)',
                  borderLeft: `3px solid ${isActive ? 'var(--teal)' : 'transparent'}`,
                  transition: 'all 0.1s',
                }}
              >
                <Avatar name={others[0]?.name || t.title} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{
                      fontWeight: 700, fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      flex: 1, minWidth: 0,
                    }}>
                      {t.title}
                    </span>
                    {t.unread > 0 && (
                      <span style={{
                        background: 'var(--teal)', color: '#fff',
                        fontSize: '0.62rem', fontWeight: 800,
                        padding: '1px 6px', borderRadius: 99,
                        flexShrink: 0,
                      }}>
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--text-soft)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: 2,
                  }}>
                    {others.map(p => p.name).join(', ')}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    lineHeight: 1.4,
                  }}>
                    {last?.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Active conversation ─────────────────── */}
      {active ? (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Thread header */}
          <div style={{
            padding: '13px 18px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 11,
          }}>
            <Avatar name={otherParticipants(active)[0]?.name || active.title} size={36} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {active.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {otherParticipants(active).map(p => `${p.name} (${p.role})`).join(' · ')}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, padding: '16px 18px', overflowY: 'auto',
            background: 'var(--surface)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {active.messages.map((m, i) => {
              const isMine = m.from === role;
              const author = active.participants.find(p => p.role === m.from);
              const bg = isMine
                ? 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)'
                : 'var(--surface-card)';
              const colour = isMine ? '#fff' : 'var(--text-primary)';
              const isLastMine = isMine && i === active.messages.length - 1;
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                    gap: 8,
                    alignItems: 'flex-end',
                    animation: 'msgIn 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
                  }}
                >
                  {!isMine && <Avatar name={author?.name || 'User'} size={26} />}
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 14,
                      background: bg,
                      color: colour,
                      border: isMine ? 'none' : '1px solid var(--border)',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      borderBottomLeftRadius: isMine ? 14 : 4,
                      borderBottomRightRadius: isMine ? 4 : 14,
                      whiteSpace: 'pre-wrap',
                      boxShadow: isMine
                        ? '0 2px 10px rgba(20,184,184,0.22)'
                        : 'var(--shadow-sm)',
                    }}>
                      {m.text}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-soft)',
                      marginTop: 3,
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      alignItems: 'center', gap: 4,
                      paddingLeft: 4, paddingRight: 4,
                    }}>
                      {!isMine && author && (
                        <span style={{ color: ROLE_COLOURS[author.role], fontWeight: 700 }}>
                          {author.name}
                        </span>
                      )}
                      <span>{m.time}</span>
                      {isMine && (
                        isLastMine
                          ? <Check     size={11} strokeWidth={3} style={{ color: 'var(--text-soft)' }} aria-label="Sent" />
                          : <CheckCheck size={11} strokeWidth={3} style={{ color: 'var(--teal)'   }} aria-label="Read" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator for the other party */}
            {typingFromId && active.id === typingFromId && (
              <div style={{
                display: 'flex', alignItems: 'flex-end', gap: 8,
                animation: 'msgIn 0.22s ease both',
              }}>
                <Avatar name={otherParticipants(active)[0]?.name || 'User'} size={26} />
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 14,
                  borderBottomLeftRadius: 4,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border)',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--text-muted)',
                      animation: `typingDot 1.2s ${i * 0.18}s ease-in-out infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick reply suggestions */}
          {quickReplies.length > 0 && (
            <div style={{
              padding: '8px 14px 0',
              display: 'flex', gap: 6, flexWrap: 'wrap',
              background: 'var(--surface-card)',
              borderTop: '1px solid var(--border)',
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: '0.62rem', fontWeight: 800,
                color: 'var(--text-soft)', letterSpacing: '0.06em',
                textTransform: 'uppercase', alignSelf: 'center',
              }}>
                <Sparkles size={10} strokeWidth={2.5} style={{ color: 'var(--teal)' }} />
                Quick reply
              </span>
              {quickReplies.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  style={{
                    padding: '5px 11px', borderRadius: 99,
                    background: 'var(--teal-glow)',
                    border: '1px solid var(--teal-border)',
                    color: 'var(--teal-dark)',
                    fontSize: '0.75rem', fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--teal)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--teal-glow)'; e.currentTarget.style.color = 'var(--teal-dark)'; }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div style={{
            padding: '11px 14px',
            borderTop: quickReplies.length ? '1px solid var(--border)' : '1px solid var(--border)',
            background: 'var(--surface-card)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <button
              type="button"
              aria-label="Emoji (demo only)"
              title="Emoji picker — demo only"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'transparent',
                color: 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent';     e.currentTarget.style.color = 'var(--text-soft)'; }}
              onClick={() => setDraft(d => d + ' 👍')}
            >
              <Smile size={15} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              aria-label="Attach (demo only)"
              title="Attachment — demo only"
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'transparent',
                color: 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'pointer',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--teal)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent';     e.currentTarget.style.color = 'var(--text-soft)'; }}
            >
              <Paperclip size={14} strokeWidth={2.2} />
            </button>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message…"
              aria-label="Message"
              style={{
                flex: 1,
                border: '1px solid var(--border)', borderRadius: 99,
                padding: '10px 16px',
                fontSize: '0.875rem',
                background: 'var(--surface)',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                outline: 'none',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--teal)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(20,184,184,0.16)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!draft.trim()}
              aria-label="Send message"
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: draft.trim()
                  ? 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)'
                  : 'var(--surface)',
                color: draft.trim() ? '#fff' : 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s cubic-bezier(0.32, 0.72, 0, 1)',
                flexShrink: 0,
                boxShadow: draft.trim() ? '0 4px 14px rgba(20,184,184,0.35)' : 'none',
                transform: justSent ? 'scale(0.86)' : 'scale(1)',
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={15} strokeWidth={2.4} style={{
                transform: 'translateX(-1px)',
                transition: 'transform 0.2s ease',
              }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-soft)', fontSize: '0.88rem',
        }}>
          <MessageSquare size={32} strokeWidth={1.5} style={{ marginBottom: 10, color: 'var(--border-strong)' }} />
          Select a conversation
        </div>
      )}

      <style>{`
        @keyframes msgIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%           { transform: translateY(-4px); opacity: 1;   }
        }
        @media (max-width: 700px) {
          .messaging-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: 480px;
          }
        }
      `}</style>
    </div>
  );
}
