import { useReveal } from '../hooks/useReveal';
import { useCountUp } from '../hooks/useCountUp';

/**
 * CountUp · animates a number from 0 → value when scrolled into view.
 *
 * @param {number} value     - target number
 * @param {string} prefix    - e.g. '$'
 * @param {string} suffix    - e.g. '%'
 * @param {number} decimals
 * @param {number} duration  - ms
 */
export default function CountUp({ value, prefix = '', suffix = '', decimals = 0, duration = 1400, style }) {
  const [ref, visible] = useReveal({ threshold: 0.3 });
  const display = useCountUp(value, { enabled: visible, duration, decimals });

  return (
    <span ref={ref} style={style}>
      {prefix}{display}{suffix}
    </span>
  );
}
