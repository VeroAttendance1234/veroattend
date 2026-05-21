/**
 * Sparkline — zero-dependency mini trend chart.
 *
 * Renders an SVG polyline + optional area fill from a small numeric array.
 * Deterministic if the same data is passed (no animation jitter).
 *
 * @param {number[]} data    - values to plot (typically attendance %)
 * @param {number}   width   - px (default 56)
 * @param {number}   height  - px (default 18)
 * @param {string}   stroke  - line colour
 * @param {string}   fill    - area fill colour (optional)
 * @param {number}   min     - y-axis min (defaults to data min, padded)
 * @param {number}   max     - y-axis max (defaults to data max, padded)
 * @param {boolean}  dot     - draw a dot on the last point
 */
export default function Sparkline({
  data = [],
  width = 56,
  height = 18,
  stroke = 'var(--teal)',
  fill = 'rgba(20,184,184,0.18)',
  min,
  max,
  dot = true,
  strokeWidth = 1.4,
  ariaLabel,
}) {
  if (!data || data.length < 2) return null;
  const lo = min ?? Math.min(...data);
  const hi = max ?? Math.max(...data);
  const span = (hi - lo) || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    // Inset 1px top/bottom so the stroke doesn't clip
    const y = height - 1 - ((v - lo) / span) * (height - 2);
    return [x, y];
  });

  const lineD = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${width} ${height} L 0 ${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? `Trend chart: ${data.length} points`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      {fill && <path d={areaD} fill={fill} />}
      <path
        d={lineD}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dot && (
        <circle
          cx={lastX}
          cy={lastY}
          r={1.9}
          fill={stroke}
          stroke="#fff"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

/* Deterministic 7-day history from a string id so sparklines don't flicker */
export function seedHistory(id, length = 7) {
  if (!id) return [];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return Array.from({ length }, (_, i) => 78 + ((h + i * 13) % 22));
}
