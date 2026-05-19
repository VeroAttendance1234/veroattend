import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, ChevronLeft, Search } from 'lucide-react';
import Avatar from './Avatar';

const ROLE_COLOURS = {
  parent:  'var(--purple)',
  teacher: 'var(--blue)',
  student: 'var(--green)',
  admin:   'var(--teal)',
};

/**
 * MessagingPanel — Schoolbox-style two-pane messaging.
 *
 * - Mobile: shows the thread list, then opens the thread when tapped.
 * - Desktop: classic two-pane (list left, conversation right).
 *
 * @param {string} role        – Logged-in role ('parent' | 'teacher' | 'student' | 'admin')
 * @param {string} userName    – Name of the logged-in user (for "from" attribution)
 * @param {Array}  threads     – Conversation threads from shared state
 * @param {Func}   onSend      – Called when user sends a message (threadId, text)
 */
export default function MessagingPanel({ role, userName, threads, onSend }) {
  const [activeId, setActiveId] = useState(threads[0]?.id);
  const [draft, setDraft]       = useState('');
  const [search, setSearch]     = useState('');
  const scrollRef = useRef(null);

  // Filter threads where the current role participates
  const visible = threads.filter(t =>
    t.participants.some(p => p.role === role)
    && (search.trim() === '' || t.title.toLowerCase().includes(search.toLowerCase()))
  );

  const active = threads.find(t => t.id === activeId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [active?.messages.length, activeId]);

  function handleSend() {
    if (!draft.trim() || !active) return;
    onSend(active.id, draft.trim());
    setDraft('');
  }

  function otherParticipants(t) {
    return t.participants.filter(p => p.role !== role);
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(220px, 280px) 1fr',
      gap: 0,
      height: 480,
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
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
            {active.messages.map(m => {
              const isMine = m.from === role;
              const author = active.participants.find(p => p.role === m.from);
              const bg = isMine ? 'var(--teal)' : 'var(--surface-card)';
              const colour = isMine ? '#fff' : 'var(--text-primary)';
              return (
                <div key={m.id} style={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  gap: 8,
                  alignItems: 'flex-end',
                }}>
                  {!isMine && <Avatar name={author?.name || 'User'} size={26} />}
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 12,
                      background: bg,
                      color: colour,
                      border: isMine ? 'none' : '1px solid var(--border)',
                      fontSize: '0.86rem',
                      lineHeight: 1.5,
                      borderBottomLeftRadius: isMine ? 12 : 3,
                      borderBottomRightRadius: isMine ? 3 : 12,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {m.text}
                    </div>
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-soft)',
                      marginTop: 3, textAlign: isMine ? 'right' : 'left',
                      paddingLeft: 4, paddingRight: 4,
                    }}>
                      {!isMine && author && (
                        <span style={{ color: ROLE_COLOURS[author.role], fontWeight: 700, marginRight: 5 }}>
                          {author.name}
                        </span>
                      )}
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div style={{
            padding: '11px 14px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-card)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              style={{
                flex: 1,
                border: '1px solid var(--border)', borderRadius: 99,
                padding: '9px 16px',
                fontSize: '0.875rem',
                background: 'var(--surface)',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!draft.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: draft.trim() ? 'var(--teal)' : 'var(--surface)',
                color: draft.trim() ? '#fff' : 'var(--text-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.12s',
                flexShrink: 0,
              }}
            >
              <Send size={15} strokeWidth={2.4} />
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
