/**
 * Avatar — DiceBear-powered, consistent avatars from any name.
 *
 * Uses the `notionists-neutral` collection which renders friendly,
 * portrait-style illustrations that work well alongside school photos.
 * The seed is derived deterministically from the name, so the same
 * student always gets the same avatar.
 *
 * @param {string}  name    – display name (used as the seed)
 * @param {number}  size    – px square size (default 40)
 * @param {string}  ring    – optional border colour (defaults to var(--border))
 * @param {string}  status  – 'present' | 'absent' | null — coloured dot
 */
export default function Avatar({ name = '', size = 40, ring, status }) {
  const seed = encodeURIComponent(name.trim().toLowerCase() || 'vero');
  const url  = `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${seed}&backgroundColor=14B8B8,2563EB,16A34A,7C3AED,DB2777,D97706&radius=50`;

  const dotColour = status === 'present'
    ? 'var(--green)'
    : status === 'absent'
      ? 'var(--red)'
      : null;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
    }}>
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          background: 'var(--surface-soft)',
          border: ring ? `2px solid ${ring}` : '1px solid var(--border)',
          display: 'block',
        }}
        loading="lazy"
      />
      {dotColour && (
        <span style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: Math.max(8, size * 0.25),
          height: Math.max(8, size * 0.25),
          borderRadius: '50%',
          background: dotColour,
          border: '2px solid var(--surface-card)',
        }} />
      )}
    </div>
  );
}
