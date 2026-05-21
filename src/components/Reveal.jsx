import { useReveal } from '../hooks/useReveal';

/**
 * Reveal · scroll-triggered entrance with combined fade + slide + slight scale.
 *
 * @param {string|number} delay  - ms to stagger
 * @param {string}        from   - 'up' (default) | 'left' | 'right' | 'scale' | 'down'
 * @param {boolean}       blur   - add a small blur on entry for "focus pull" feel (default true)
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  from = 'up',
  blur = true,
  style,
  className = '',
  ...rest
}) {
  const [ref, visible] = useReveal();

  // Combined translate + scale baseline → more cinematic than slide alone
  const initialTransform = {
    up:    'translate3d(0, 28px, 0) scale(0.985)',
    down:  'translate3d(0,-28px, 0) scale(0.985)',
    left:  'translate3d(-28px, 0, 0) scale(0.985)',
    right: 'translate3d( 28px, 0, 0) scale(0.985)',
    scale: 'translate3d(0, 0, 0) scale(0.94)',
  }[from] || 'translate3d(0, 28px, 0) scale(0.985)';

  // Quintic ease-out — gentle landing, no bounce
  const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const duration = '0.65s';

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0) scale(1)' : initialTransform,
        filter: blur && !visible ? 'blur(6px)' : 'blur(0px)',
        transition:
          `opacity ${duration} ${easing} ${delay}ms, ` +
          `transform ${duration} ${easing} ${delay}ms, ` +
          `filter 0.5s ${easing} ${delay}ms`,
        willChange: visible ? 'auto' : 'opacity, transform, filter',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
