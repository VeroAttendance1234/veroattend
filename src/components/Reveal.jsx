import { useReveal } from '../hooks/useReveal';

/**
 * Reveal · wraps children in a div that fades + slides up when scrolled into view.
 *
 * @param {string|number} delay  - ms to stagger (e.g. 100 → fires 100ms after revealing)
 * @param {string}        as     - HTML tag (default 'div')
 * @param {string}        from   - animation origin: 'up' (default) | 'left' | 'right' | 'scale'
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  from = 'up',
  style,
  className = '',
  ...rest
}) {
  const [ref, visible] = useReveal();

  const directionStyle = {
    up:    'translate3d(0, 24px, 0)',
    left:  'translate3d(-24px, 0, 0)',
    right: 'translate3d(24px, 0, 0)',
    scale: 'scale(0.96)',
  }[from] || 'translate3d(0, 24px, 0)';

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0) scale(1)' : directionStyle,
        transition: `opacity 0.55s cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms, transform 0.55s cubic-bezier(0.32, 0.72, 0, 1) ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
