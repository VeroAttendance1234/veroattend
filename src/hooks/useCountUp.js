import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp · smoothly animate a number from 0 → target.
 *
 * Uses requestAnimationFrame + easeOutCubic for a natural deceleration.
 * Triggers when `enabled` becomes true (typically when scrolled into view).
 *
 * @param {number} target   - final value
 * @param {Object} opts
 * @param {bool}   opts.enabled  - start animating (default true)
 * @param {number} opts.duration - ms (default 1400)
 * @param {number} opts.decimals - decimal places (default 0)
 */
export function useCountUp(target, { enabled = true, duration = 1400, decimals = 0 } = {}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled || startedRef.current) return;

    // Respect reduced motion · snap to target
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      startedRef.current = true;
      return;
    }

    startedRef.current = true;
    let raf;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(target);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled, target, duration]);

  // Format with commas and decimals
  const formatted = Number(value.toFixed(decimals)).toLocaleString();
  return formatted;
}
