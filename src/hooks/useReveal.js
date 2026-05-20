import { useEffect, useRef, useState } from 'react';

/**
 * useReveal · IntersectionObserver-driven reveal-on-scroll.
 *
 * Attach the returned ref to any element. When ≥10% of the element
 * is in the viewport, `visible` flips to true (one-shot · won't toggle off).
 *
 * Pairs with `.reveal` / `.reveal.is-visible` classes in global.css.
 *
 * @param {Object} opts
 * @param {number} opts.threshold  - 0..1 visibility ratio that triggers reveal
 * @param {string} opts.rootMargin - e.g. "0px 0px -10% 0px" to trigger early
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    // Respect reduced motion · make everything visible immediately
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        obs.disconnect(); // one-shot
      }
    }, { threshold, rootMargin });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return [ref, visible];
}
