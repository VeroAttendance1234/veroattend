/**
 * MessagingDemo
 * ─────────────────────────────────────────────────────────────
 * Self-contained, fully interactive messaging trial for the
 * marker page. The viewer plays as Mr Chen (teacher); a
 * simulated parent ("Ms Patel") replies after a realistic
 * typing delay using a tiny intent-matching reply engine.
 *
 * Demonstrates:
 *   - Stateful conversation with optimistic UI
 *   - Typing indicator → message → read receipt pipeline
 *   - Intent → response matching (keyword + fallback)
 *   - Quick-reply chips for one-tap conversations
 *   - Smooth scroll, animation, accessible aria labels
 */
import { useEffect, useRef, useState } from 'react';
import { MessageSquare, RotateCcw } from 'lucide-react';
import MessagingPanel from './MessagingPanel';

const ROLE = 'teacher';
const ME   = 'Mr David Chen';

/* Tiny intent matcher → returns a parent reply for a teacher message */
function generateParentReply(text) {
  const t = text.toLowerCase();

  // Time-based intents
  if (/(late|absen|sick|miss)/.test(t))
    return "Thanks for letting me know — Aisha had a dentist appointment this morning. She'll be in for period 3.";
  if (/(homework|assignment|task)/.test(t))
    return "We'll make sure it's submitted tonight. Could you remind me of the due date?";
  if (/(meet|chat|catch up|interview)/.test(t))
    return "Thursday afternoon works for me. Is 3:30 okay?";
  if (/(well\s*done|great|excellent|brilliant|amaz)/.test(t))
    return "Oh that's so good to hear! 😊 Thank you for letting me know. I'll tell her tonight.";
  if (/(concern|worri|behaviour|behavior|issue|problem)/.test(t))
    return "Thanks for raising this. Could we set up a quick call to talk through it?";
  if (/(thank|cheers|appreciate)/.test(t))
    return "You're very welcome — thanks for keeping me in the loop.";
  if (/\?/.test(t))
    return "Good question — let me check with Aisha tonight and get back to you.";

  // Generic positive fallbacks
  const fallbacks = [
    "Thanks for the update, Mr Chen!",
    "Appreciate you reaching out — I'll have a chat with Aisha after school.",
    "Got it, thank you for keeping me posted.",
    "Sounds good — we'll handle it on our end.",
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

function nowTime() {
  return new Date().toLocaleTimeString('en-AU', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).toLowerCase();
}

const INITIAL_THREADS = [
  {
    id: 'demo-t1',
    title: 'Ms Patel · Year 11',
    participants: [
      { role: 'teacher', name: ME },
      { role: 'parent',  name: 'Ms J. Patel' },
    ],
    unread: 0,
    messages: [
      { id: 'd1', from: 'parent',  text: "Hi Mr Chen — just letting you know Aisha was a bit unwell yesterday. Hope she's okay in class today!",        time: '8:14 am' },
      { id: 'd2', from: 'teacher', text: "Morning! She just tapped in at 8:42 and seems good — I'll keep an eye on her in maths and let you know.",       time: '8:43 am' },
      { id: 'd3', from: 'parent',  text: "Thank you so much, really appreciate it 🙏",                                                                     time: '8:45 am' },
    ],
  },
  {
    id: 'demo-t2',
    title: 'Mr Khan · Year 8 Eldon',
    participants: [
      { role: 'teacher', name: ME },
      { role: 'parent',  name: 'Mr A. Khan' },
    ],
    unread: 1,
    messages: [
      { id: 'd4', from: 'parent',  text: "Hi — could you send through the Geography assignment criteria for Hassan?", time: 'Yesterday' },
    ],
  },
];

const QUICK_REPLIES = [
  "All good — she just tapped in.",
  "Could we chat after school?",
  "Thanks for letting me know!",
  "I'll get that to you today.",
];

export default function MessagingDemo() {
  const [threads, setThreads]     = useState(INITIAL_THREADS);
  const [typingIn, setTypingIn]   = useState(null);
  const [sent,     setSent]       = useState(0);   // for the "messages sent" counter
  const replyTimers = useRef([]);

  function send(threadId, text) {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      return {
        ...t,
        messages: [...t.messages, {
          id: `m-${Date.now()}`,
          from: ROLE, text, time: nowTime(),
        }],
        unread: 0,
      };
    }));
    setSent(s => s + 1);
    triggerReply(threadId, text);
  }

  function triggerReply(threadId, text) {
    // Typing delay scales with reply length so it feels natural
    const reply = generateParentReply(text);
    const typingDelay = Math.min(2200, 600 + reply.length * 18);
    const showAfter   = 380;

    const t1 = setTimeout(() => setTypingIn(threadId), showAfter);
    const t2 = setTimeout(() => {
      setTypingIn(null);
      setThreads(prev => prev.map(t => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          messages: [...t.messages, {
            id: `r-${Date.now()}`,
            from: 'parent', text: reply, time: nowTime(),
          }],
        };
      }));
    }, showAfter + typingDelay);

    replyTimers.current.push(t1, t2);
  }

  function reset() {
    replyTimers.current.forEach(clearTimeout);
    replyTimers.current = [];
    setTypingIn(null);
    setThreads(INITIAL_THREADS);
    setSent(0);
  }

  useEffect(() => () => replyTimers.current.forEach(clearTimeout), []);

  return (
    <div style={{
      position: 'relative',
      background: 'var(--surface-card)',
      border: '1px solid var(--border)',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* ── Header ───────────────────────────── */}
      <div style={{
        padding: '18px 22px',
        background: 'linear-gradient(135deg, var(--teal-glow) 0%, transparent 80%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 14, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--teal)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(20,184,184,0.35)',
          }}>
            <MessageSquare size={17} strokeWidth={2.3} />
          </span>
          <div>
            <div style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontWeight: 800, fontSize: '1.05rem',
              color: 'var(--text-primary)', letterSpacing: '-0.015em',
            }}>
              You're Mr Chen — try messaging a parent
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Type anything or tap a quick reply · the parent will respond in real time
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            aria-label={`${sent} messages sent in this session`}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: '0.72rem', fontWeight: 800,
              color: 'var(--teal-dark)', letterSpacing: '0.05em',
              textTransform: 'uppercase',
              background: 'var(--teal-glow)',
              border: '1px solid var(--teal-border)',
              padding: '5px 11px', borderRadius: 99,
            }}
          >
            {sent} sent ·{' '}
            {threads.reduce((acc, t) => acc + t.messages.filter(m => m.from === 'parent').length, 0)} received
          </div>
          <button
            onClick={reset}
            aria-label="Reset demo conversation"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 11px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border)',
              borderRadius: 9,
              fontSize: '0.75rem', fontWeight: 700,
              color: 'var(--text-muted)',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--teal)'; e.currentTarget.style.borderColor = 'var(--teal)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <RotateCcw size={12} strokeWidth={2.5} />
            Reset
          </button>
        </div>
      </div>

      {/* ── The actual panel ─────────────────── */}
      <div style={{ padding: 18 }}>
        <MessagingPanel
          role={ROLE}
          userName={ME}
          threads={threads}
          onSend={send}
          quickReplies={QUICK_REPLIES}
          typingFromId={typingIn}
          height={500}
        />
      </div>

      {/* ── Caption ──────────────────────────── */}
      <div style={{
        padding: '10px 22px 16px',
        fontSize: '0.74rem', color: 'var(--text-soft)',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-soft)',
      }}>
        Replies are generated by a small intent matcher (keyword → response template) —
        production VERO routes through the real Pi backend.
      </div>
    </div>
  );
}
