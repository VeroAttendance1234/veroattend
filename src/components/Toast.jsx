import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

/**
 * Toast system · global, context-driven, queueable.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!', 'Your goal was added to the tracker.');
 *   toast.error('Sign-in failed');
 *   toast.info('Loading new data...');
 *
 * Toasts auto-dismiss after 4s by default. Pass `{ duration: 0 }` to make sticky.
 */

const ToastContext = createContext(null);

const ICON_MAP = {
  success: CheckCircle,
  error:   AlertCircle,
  warn:    AlertTriangle,
  info:    Info,
};

const COLOUR_MAP = {
  success: { bg: 'var(--green-light)',  border: 'var(--green-border)',  color: 'var(--green)'  },
  error:   { bg: 'var(--red-light)',    border: 'var(--red-border)',    color: 'var(--red)'    },
  warn:    { bg: 'var(--amber-light)',  border: 'var(--amber-border)',  color: 'var(--amber)'  },
  info:    { bg: 'var(--blue-light)',   border: 'var(--blue-border)',   color: 'var(--blue)'   },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, title, detail, opts = {}) => {
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts(prev => [...prev, { id, type, title, detail }]);
    const duration = opts.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const api = {
    success: (title, detail, opts) => push('success', title, detail, opts),
    error:   (title, detail, opts) => push('error',   title, detail, opts),
    warn:    (title, detail, opts) => push('warn',    title, detail, opts),
    info:    (title, detail, opts) => push('info',    title, detail, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Safe no-op fallback if used outside provider
    return {
      success: () => {}, error: () => {}, warn: () => {}, info: () => {}, dismiss: () => {},
    };
  }
  return ctx;
}

function ToastViewport({ toasts, dismiss }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      right: 16,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: 380,
      pointerEvents: 'none',
    }}
    className="toast-viewport"
    >
      {toasts.map(t => <ToastItem key={t.id} {...t} onDismiss={() => dismiss(t.id)} />)}
      <style>{`
        @media (max-width: 600px) {
          .toast-viewport {
            bottom: 70px !important;
            right: 12px !important;
            left: 12px !important;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function ToastItem({ type = 'info', title, detail, onDismiss }) {
  const Icon = ICON_MAP[type];
  const palette = COLOUR_MAP[type];
  const [exiting, setExiting] = useState(false);

  function handleDismiss() {
    setExiting(true);
    setTimeout(onDismiss, 180);
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        background: 'var(--surface-card)',
        border: `1px solid ${palette.border}`,
        borderLeft: `3px solid ${palette.color}`,
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(15,30,40,0.18)',
        padding: '12px 14px',
        display: 'flex',
        gap: 11,
        alignItems: 'flex-start',
        animation: exiting
          ? 'toastOut 0.18s ease forwards'
          : 'toastIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: 'auto',
        minWidth: 280,
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: palette.bg,
        color: palette.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={15} strokeWidth={2.4} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.86rem', fontWeight: 700,
          color: 'var(--text-primary)', marginBottom: detail ? 3 : 0,
          lineHeight: 1.3,
        }}>
          {title}
        </div>
        {detail && (
          <div style={{
            fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5,
          }}>
            {detail}
          </div>
        )}
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'transparent', color: 'var(--text-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <X size={12} strokeWidth={2.5} />
      </button>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(20px); }
        }
      `}</style>
    </div>
  );
}
