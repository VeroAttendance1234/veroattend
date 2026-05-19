import { useState, useEffect } from 'react';

/**
 * Custom hook: returns true when the given media query matches.
 *
 * Example:
 *   const isMobile = useMediaQuery('(max-width: 700px)');
 *
 * Uses the modern `addEventListener('change')` API and cleans up on unmount.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useIsMobile  = () => useMediaQuery('(max-width: 700px)');
export const useIsTablet  = () => useMediaQuery('(max-width: 900px)');
