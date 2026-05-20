import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Modal · reusable bottom-up / fade-in popup used across VERO.
 *
 * Performance-aware:
 *  - Conditionally mounts (returns null when closed) so we never animate offscreen DOM.
 *  - Uses transform + opacity only (GPU-accelerated, no layout thrash).
 *  - Locks body scroll while open.
 *  - Click backdrop or press Escape to close.
 *  - Focus is parked on the dialog so keyboard nav lands there.
 *
 * @param {bool}     open     - whether to render
 * @param {Function} onClose
 * @param {string}   accent   - brand colour for the header rail (defaults to teal)
 * @param {ReactNode} icon    - optional icon element shown in the header
 * @param {string}   title
 * @param {string}   subtitle
 * @param {ReactNode} children - body content
 * @param {ReactNode} footer   - optional sticky footer (e.g. action buttons)
 * @param {string}   width    - max width: 'sm' | 'md' | 'lg'
 */
export default function Modal({
  open,
  onClose,
  accent = 'var(--teal)',
  icon,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Escape closes
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);

    // Park focus on dialog for a11y
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const maxWidth = { sm: 440, md: 600, lg: 820 }[width] || 600;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(15,30,40,0.55)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px',
        overflowY: 'auto',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)',
          borderRadius: 18,
          width: '100%',
          maxWidth,
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          animation: 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
          outline: 'none',
          overflow: 'hidden',
          marginBottom: 60,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        {/* Header */}
        {(title || icon) && (
          <div style={{
            padding: '20px 22px',
            borderBottom: '1px solid var(--border)',
            background: `linear-gradient(135deg, ${accent}10 0%, transparent 100%)`,
            display: 'flex', alignItems: 'center', gap: 14,
            flexShrink: 0,
          }}>
            {icon && (
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${accent}18`,
                border: `1.5px solid ${accent}30`,
                color: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icon}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <div id="modal-title" style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  fontWeight: 800, fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}>
                  {title}
                </div>
              )}
              {subtitle && (
                <div style={{
                  fontSize: '0.78rem', color: accent,
                  fontWeight: 700, marginTop: 3,
                }}>
                  {subtitle}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--surface-soft)',
                color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-light)'; e.currentTarget.style.color = 'var(--red)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-soft)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* Body · scrolls if content is tall */}
        <div style={{
          padding: '20px 22px',
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}>
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--border)',
            background: 'var(--surface-soft)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>

      {/* Animation keyframes scoped to this component */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
