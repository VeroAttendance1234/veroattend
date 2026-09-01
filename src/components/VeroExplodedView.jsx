/**
 * VeroExplodedView
 * ─────────────────────────────────────────────────────────────
 * Promotional "skeleton" exploded view showing what's inside
 * the VERO enclosure: the white cap, the ACR122U NFC reader
 * board, the antenna coil, the Raspberry Pi 3B, and the base.
 *
 * Layers are stylised stand-ins (the real ACR122U/Pi geometry
 * isn't shipped - using primitives keeps the bundle tiny and
 * still reads as a believable cutaway). Each layer is labelled
 * with a leader line via drei's Html helper.
 *
 * Animation:
 *   - Stacked → exploded → hold → re-stack, loops gently.
 *   - Each layer has a small float wobble for "alive" feel.
 *   - User can drag to spin; auto-rotate while idle.
 */
import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';

const MODEL_URL = '/models/vero-cloud-base.3mf';

function hasWebGL() {
  if (typeof window === 'undefined') return true;
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch { return false; }
}

const TEAL      = '#00B3B8';
const TEAL_DARK = '#00A9A5';
const COPPER    = '#c98a3a';
const PCB_GREEN = '#0f5c3e';

/* ── Easing ────────────────────────────────────── */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/* ── The real 3MF enclosure (loaded once, cached) ─ */
function VeroCap(props) {
  const group = useLoader(ThreeMFLoader, MODEL_URL);

  const prepared = useMemo(() => {
    const root = group.clone(true);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: '#f6f7f8',
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.55,
      reflectivity: 0.15,
    });

    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry?.computeVertexNormals?.();
      obj.castShadow = true;
      obj.receiveShadow = true;
      obj.material = bodyMat;
    });

    // Z-up → Y-up
    root.rotation.x = -Math.PI / 2;
    root.updateMatrixWorld(true);

    // Scale so longest dimension = ~2.3 (matches PCB footprint width)
    let box  = new THREE.Box3().setFromObject(root);
    let size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    root.scale.setScalar(2.3 / maxDim);

    // Re-measure and re-center
    root.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    return root;
  }, [group]);

  return <primitive object={prepared} {...props} />;
}

function AntennaCoil(props) {
  return (
    <group {...props}>
      {/* Substrate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.04, 1.9]} />
        <meshStandardMaterial color="#e7e0d0" roughness={0.85} />
      </mesh>
      {/* Spiral coil - concentric thin rings of copper */}
      {[0.85, 0.74, 0.63, 0.52, 0.41].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} castShadow>
          <torusGeometry args={[r, 0.018, 12, 96]} />
          <meshStandardMaterial color={COPPER} roughness={0.35} metalness={0.85} />
        </mesh>
      ))}
      {/* Centre dot */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.025, 24]} />
        <meshStandardMaterial color={COPPER} roughness={0.3} metalness={0.85} />
      </mesh>
    </group>
  );
}

/* ── Reusable little parts ───────────────────────── */
const goldMat   = <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.85} />;
const silverMat = <meshStandardMaterial color="#d9dbde" roughness={0.4}  metalness={0.7}  />;
const blackICMat = <meshStandardMaterial color="#0a0a0a" roughness={0.45} />;

function MountingHole({ x, z, y = 0.04 }) {
  return (
    <group position={[x, y, z]}>
      <mesh>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 24]} />
        <meshStandardMaterial color="#080808" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.001, 0]}>
        <torusGeometry args={[0.09, 0.012, 8, 24]} />
        {goldMat}
      </mesh>
    </group>
  );
}

function SmtCap({ x, z, color = '#1f1f1f' }) {
  return (
    <mesh position={[x, 0.085, z]} castShadow>
      <cylinderGeometry args={[0.045, 0.045, 0.06, 16]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
  );
}

function SmtResistor({ x, z, rotation = 0 }) {
  return (
    <mesh position={[x, 0.08, z]} rotation={[0, rotation, 0]} castShadow>
      <boxGeometry args={[0.1, 0.04, 0.05]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
    </mesh>
  );
}

function TraceLine({ from, to, y = 0.075 }) {
  // Thin gold trace on the PCB surface
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  return (
    <mesh position={[mid[0], y, mid[1]]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[len, 0.005, 0.018]} />
      <meshStandardMaterial color="#caa540" roughness={0.4} metalness={0.85} />
    </mesh>
  );
}

function NfcReaderBoard(props) {
  // Stand-in for the ACR122U PCB - beefed-up detail
  return (
    <group {...props}>
      {/* Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.07, 1.4]} />
        <meshStandardMaterial color={PCB_GREEN} roughness={0.72} metalness={0.1} />
      </mesh>

      {/* Solder-mask thin top layer for slight tone variation */}
      <mesh position={[0, 0.036, 0]}>
        <boxGeometry args={[1.88, 0.001, 1.38]} />
        <meshStandardMaterial color="#0a4a30" roughness={0.85} />
      </mesh>

      {/* Mounting holes - four corners */}
      <MountingHole x={-0.85} z={-0.6} />
      <MountingHole x={ 0.85} z={-0.6} />
      <MountingHole x={-0.85} z={ 0.6} />
      <MountingHole x={ 0.85} z={ 0.6} />

      {/* PN532 controller chip (large QFN) with pin lead-frame */}
      <group position={[-0.35, 0.07, 0.1]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.06, 0.45]} />
          {blackICMat}
        </mesh>
        {/* Tiny silk-screen dot */}
        <mesh position={[-0.18, 0.031, -0.18]}>
          <circleGeometry args={[0.02, 12]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Lead pads on all 4 sides */}
        {Array.from({ length: 8 }).map((_, i) => {
          const t = -0.2 + i * 0.057;
          return (
            <group key={`pn-leads-${i}`}>
              <mesh position={[t, 0.001, -0.235]}><boxGeometry args={[0.025, 0.005, 0.04]} />{goldMat}</mesh>
              <mesh position={[t, 0.001,  0.235]}><boxGeometry args={[0.025, 0.005, 0.04]} />{goldMat}</mesh>
              <mesh position={[-0.235, 0.001, t]}><boxGeometry args={[0.04, 0.005, 0.025]} />{goldMat}</mesh>
              <mesh position={[ 0.235, 0.001, t]}><boxGeometry args={[0.04, 0.005, 0.025]} />{goldMat}</mesh>
            </group>
          );
        })}
      </group>

      {/* Crystal oscillator */}
      <mesh position={[0.2, 0.065, 0.15]} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.1]} />
        {silverMat}
      </mesh>

      {/* Voltage regulator (TO-220 style) */}
      <mesh position={[0.55, 0.09, 0.2]} castShadow>
        <boxGeometry args={[0.12, 0.18, 0.08]} />
        {blackICMat}
      </mesh>

      {/* USB-A connector */}
      <group position={[0.7, 0.1, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.18, 0.25]} />
          {silverMat}
        </mesh>
        {/* USB slot */}
        <mesh position={[0.25, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.08, 0.18]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* Decoupling caps scattered around */}
      {[
        ['#1f1f1f',-0.7, 0.3], ['#1f1f1f',-0.2,-0.3], ['#1f1f1f', 0.0, 0.4],
        ['#a07a30',-0.5, 0.5], ['#a07a30', 0.05, 0.5],
        ['#1f1f1f', 0.4,-0.4], ['#1f1f1f',-0.5,-0.5],
      ].map(([c, x, z], i) => <SmtCap key={i} x={x} z={z} color={c} />)}

      {/* SMD resistors */}
      {[
        [-0.05, 0.2, 0],   [0.05, 0.25, Math.PI / 2],
        [ 0.15,-0.1, 0],   [0.25,-0.05, Math.PI / 2],
        [-0.05,-0.45, 0],
      ].map(([x, z, r], i) => <SmtResistor key={i} x={x} z={z} rotation={r} />)}

      {/* A few gold traces */}
      <TraceLine from={[-0.12, 0.1]}  to={[ 0.2,  0.15]} />
      <TraceLine from={[-0.35,-0.13]} to={[-0.35, -0.4]} />
      <TraceLine from={[ 0.35, 0.1]}  to={[ 0.55,  0.2]} />
      <TraceLine from={[ 0.45,-0.05]} to={[ 0.7,  -0.3]} />
    </group>
  );
}

function RaspberryPi(props) {
  // Stand-in for the Pi 3B - recognisable silhouette, beefed-up detail
  return (
    <group {...props}>
      {/* Board */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.07, 1.4]} />
        <meshStandardMaterial color={PCB_GREEN} roughness={0.72} metalness={0.1} />
      </mesh>

      {/* Slightly darker solder mask top */}
      <mesh position={[0, 0.036, 0]}>
        <boxGeometry args={[1.98, 0.001, 1.38]} />
        <meshStandardMaterial color="#0a4a30" roughness={0.85} />
      </mesh>

      {/* Mounting holes - 4 corners */}
      <MountingHole x={-0.9} z={-0.6} />
      <MountingHole x={ 0.9} z={-0.6} />
      <MountingHole x={-0.9} z={ 0.6} />
      <MountingHole x={ 0.9} z={ 0.6} />

      {/* Broadcom SoC with silver heat-spreader effect */}
      <group position={[-0.2, 0.075, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.06, 0.55]} />
          <meshStandardMaterial color="#161616" roughness={0.4} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.032, 0]}>
          <boxGeometry args={[0.45, 0.001, 0.45]} />
          <meshStandardMaterial color="#888c93" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Etched logo bevel */}
        <mesh position={[0, 0.033, 0.05]}>
          <boxGeometry args={[0.15, 0.002, 0.05]} />
          <meshStandardMaterial color="#cdd0d3" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>

      {/* Wireless / LAN chip (smaller IC) */}
      <mesh position={[0.18, 0.07, 0.22]} castShadow>
        <boxGeometry args={[0.28, 0.05, 0.28]} />
        {blackICMat}
      </mesh>

      {/* Ferrite bead near power */}
      <mesh position={[-0.6, 0.07, -0.35]} castShadow>
        <boxGeometry args={[0.18, 0.04, 0.1]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.6} />
      </mesh>

      {/* Yellow Ethernet jack - with grid */}
      <group position={[0.75, 0.13, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.22, 0.4]} />
          <meshStandardMaterial color="#caa72b" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Inset grid hint */}
        <mesh position={[0.23, 0, 0]}>
          <boxGeometry args={[0.01, 0.12, 0.28]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        {/* LEDs */}
        <mesh position={[0.23, -0.08, -0.1]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <meshStandardMaterial color="#3aff77" emissive="#3aff77" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0.23, -0.08, 0.1]}>
          <boxGeometry args={[0.02, 0.04, 0.04]} />
          <meshStandardMaterial color="#ffaa3a" emissive="#ffaa3a" emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Dual blue USB stack with double-slot detail */}
      <group position={[0.75, 0.13, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.45, 0.22, 0.5]} />
          <meshStandardMaterial color="#1e2c44" roughness={0.5} metalness={0.5} />
        </mesh>
        <mesh position={[0.23, 0.04, 0]}>
          <boxGeometry args={[0.01, 0.06, 0.36]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.23,-0.04, 0]}>
          <boxGeometry args={[0.01, 0.06, 0.36]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* GPIO 40-pin header - actual gold pin strip */}
      <group position={[-0.85, 0.075, 0.55]}>
        <mesh castShadow>
          <boxGeometry args={[1.0, 0.04, 0.12]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.55} />
        </mesh>
        {/* 40 individual pins (2 rows × 20) */}
        {Array.from({ length: 20 }).map((_, i) => {
          const x = -0.475 + i * 0.05;
          return (
            <group key={i}>
              <mesh position={[x, 0.08, -0.025]} castShadow>
                <boxGeometry args={[0.022, 0.12, 0.022]} />
                {goldMat}
              </mesh>
              <mesh position={[x, 0.08, 0.025]} castShadow>
                <boxGeometry args={[0.022, 0.12, 0.022]} />
                {goldMat}
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Micro-USB power */}
      <group position={[-0.8, 0.1, -0.65]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.12, 0.14]} />
          {silverMat}
        </mesh>
        <mesh position={[0, 0, -0.075]}>
          <boxGeometry args={[0.16, 0.04, 0.02]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>

      {/* HDMI (silver block on the opposite side) */}
      <mesh position={[-0.15, 0.1, -0.65]} castShadow>
        <boxGeometry args={[0.4, 0.14, 0.18]} />
        {silverMat}
      </mesh>

      {/* 3.5mm jack */}
      <mesh position={[0.35, 0.1, -0.65]} castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.22, 16]} />
        <meshStandardMaterial color="#222" roughness={0.5} />
      </mesh>

      {/* MicroSD slot underneath the board (just hinted on the edge) */}
      <mesh position={[-0.95, -0.03, 0]} castShadow>
        <boxGeometry args={[0.12, 0.04, 0.3]} />
        {silverMat}
      </mesh>

      {/* Decoupling caps + resistors sprinkled */}
      {[
        ['#1f1f1f',-0.5, 0.0], ['#1f1f1f',-0.4, 0.15],
        ['#a07a30', 0.3, 0.0], ['#a07a30',-0.3,-0.3],
        ['#1f1f1f', 0.1,-0.3], ['#1f1f1f', 0.45,-0.05],
      ].map(([c, x, z], i) => <SmtCap key={i} x={x} z={z} color={c} />)}

      {[
        [-0.4, 0.4, 0], [ 0.45, 0.3, Math.PI / 2],
        [ 0.2, 0.4, 0], [-0.7, 0.1, Math.PI / 2],
        [ 0.55, 0.5, 0],
      ].map(([x, z, r], i) => <SmtResistor key={i} x={x} z={z} rotation={r} />)}

      {/* Subtle gold traces */}
      <TraceLine from={[ 0.07, 0.05]} to={[ 0.32, 0.22]} />
      <TraceLine from={[-0.2,  0.32]} to={[ 0.18, 0.4]} />
      <TraceLine from={[ 0.06,-0.25]} to={[ 0.5, -0.4]} />
      <TraceLine from={[-0.35,-0.12]} to={[-0.6, -0.32]} />
    </group>
  );
}

/* ── Annotation label with leader line ────────── */
function Annotation({ position, label, sub, side = 'right' }) {
  const offsetX = side === 'right' ? 1.7 : -1.7;
  const align = side === 'right' ? 'flex-start' : 'flex-end';

  return (
    <Html
      position={position}
      center
      distanceFactor={6}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        transform: `translateX(${side === 'right' ? '70%' : '-70%'})`,
        display: 'flex', flexDirection: 'column', alignItems: align,
        gap: 2,
      }}>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '0.78rem',
          color: TEAL_DARK, letterSpacing: '-0.01em',
          textShadow: '0 0 6px rgba(255,255,255,0.9)',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: '0.62rem', fontWeight: 600,
            color: '#5b6770', letterSpacing: '0.02em',
            textShadow: '0 0 6px rgba(255,255,255,0.9)',
            whiteSpace: 'nowrap',
          }}>
            {sub}
          </div>
        )}
      </div>
    </Html>
  );
}

/* ── Animated stack ──────────────────────────────
 * 4 layers (no separate base - the 3MF enclosure
 * is the housing). Top to bottom:
 *   cap     → real CAD enclosure
 *   antenna → NFC antenna coil
 *   nfc     → ACR122U reader board
 *   pi      → Raspberry Pi 3B
 */
// The camera is fixed and the canvas is a fixed 520px tall, so the vertical
// field of view - and therefore how much world-space height is visible - does
// NOT grow with the window. 'exploded' values must stay inside that window or
// the part silently leaves frame at full explode: the cap at 2.4 sat ~51px
// above the canvas top and vanished for the hold phase of every cycle.
const LAYERS = [
  { key: 'cap',     stacked: 0.70,  exploded: 2.1,  label: 'VERO enclosure',      sub: '3D-printed PETG · the real CAD geometry', side: 'right' },
  { key: 'antenna', stacked: 0.35,  exploded: 1.1,  label: 'NFC antenna coil',    sub: '13.56 MHz · ISO 14443A',                  side: 'left'  },
  { key: 'nfc',     stacked: 0.05,  exploded: -0.2, label: 'ACR122U reader',      sub: 'USB NFC controller · PN532',              side: 'right' },
  { key: 'pi',      stacked: -0.30, exploded: -1.7, label: 'Raspberry Pi 3B',     sub: 'Flask-SocketIO + pyscard',                side: 'left'  },
];

function Stack() {
  const refs = useRef({});

  useFrame(({ clock }) => {
    // Cycle: 0–1 stacked → 1–3 explode → 3–6 hold → 6–7 collapse → repeat
    const CYCLE = 7;
    const t = clock.getElapsedTime() % CYCLE;
    let progress;          // 0 = stacked, 1 = fully exploded
    if (t < 1)       progress = 0;
    else if (t < 3)  progress = easeInOut((t - 1) / 2);
    else if (t < 6)  progress = 1;
    else             progress = 1 - easeInOut((t - 6) / 1);

    LAYERS.forEach((L) => {
      const ref = refs.current[L.key];
      if (!ref) return;
      const y = THREE.MathUtils.lerp(L.stacked, L.exploded, progress);
      const wobble = Math.sin(clock.getElapsedTime() * 1.2 + L.exploded) * 0.015;
      ref.position.y = y + wobble * progress;
    });
  });

  const setRef = (key) => (el) => { refs.current[key] = el; };

  return (
    <group>
      <group ref={setRef('cap')}>     <VeroCap /></group>
      <group ref={setRef('antenna')}> <AntennaCoil /></group>
      <group ref={setRef('nfc')}>     <NfcReaderBoard /></group>
      <group ref={setRef('pi')}>      <RaspberryPi /></group>

      {LAYERS.map((L) => (
        <Annotation
          key={L.key}
          position={[L.side === 'right' ? 1.5 : -1.5, L.exploded, 0]}
          label={L.label}
          sub={L.sub}
          side={L.side}
        />
      ))}
    </group>
  );
}

/* ── Public component ─────────────────────────── */
export default function VeroExplodedView({
  height = 520,
  className,
  interactive = true,
}) {
  if (!hasWebGL()) {
    // Static, accessible breakdown - renders anywhere (no WebGL, no image asset).
    // Mirrors the layers in the 3D model so markers always see the hardware design.
    const layers = [
      { name: 'VERO enclosure',   sub: '3D-printed PETG shell',        dot: TEAL },
      { name: 'NFC antenna coil', sub: '13.56 MHz · ISO 14443A',       dot: COPPER },
      { name: 'ACR122U reader',   sub: 'USB NFC controller · PN532',   dot: '#1f2937' },
      { name: 'Raspberry Pi 3B',  sub: 'Flask-SocketIO + pyscard',     dot: PCB_GREEN },
      { name: 'Base plate',       sub: 'Cable routing · wall mount',   dot: '#9aa6ad' },
    ];
    return (
      <div
        className={className}
        role="img"
        aria-label="VERO hardware breakdown, top to bottom: 3D-printed enclosure, NFC antenna coil, ACR122U reader board, Raspberry Pi 3B, and base plate."
        style={{
          width: '100%', height, borderRadius: 18,
          background: 'linear-gradient(135deg, #f8fafa 0%, #eef3f3 100%)',
          border: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          gap: 12, padding: 24, overflow: 'auto',
        }}
      >
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)',
        }}>
          Inside the VERO enclosure
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {layers.map((l, i) => (
            <div key={l.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              background: 'var(--surface-card, #fff)',
              border: '1px solid var(--border)',
            }}>
              <span aria-hidden="true" style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${l.dot}1a`, color: l.dot,
                border: `1.5px solid ${l.dot}40`,
                fontWeight: 800, fontSize: '0.78rem',
              }}>{i + 1}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{l.name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{l.sub}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
          Static view - the interactive 3D model needs WebGL / hardware acceleration.
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f8fafa 0%, #eef3f3 100%)',
        border: '1px solid var(--border)',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [5.4, 3.0, 6.0], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Pure-local lighting - no remote HDRI fetch */}
        <hemisphereLight args={['#ffffff', '#d6dee4', 0.6]} />
        <ambientLight intensity={0.32} />
        <directionalLight
          position={[4, 6, 3]}
          intensity={1.05}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-4, 2, -3]} intensity={0.4}  />
        <directionalLight position={[0, 3, -5]}  intensity={0.25} color="#dceeee" />

        <Suspense fallback={null}>
          <Stack />
          <ContactShadows
            position={[0, -2.8, 0]}
            opacity={0.4}
            scale={8}
            blur={2.5}
            far={3}
          />
        </Suspense>

        {interactive && (
          <OrbitControls
            enablePan={false}
            minDistance={3.5}
            maxDistance={9}
            autoRotate
            autoRotateSpeed={0.5}
            target={[0, 0, 0]}
          />
        )}
      </Canvas>

      {/* Caption chip */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 14, top: 14,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          borderRadius: 99,
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          border: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontSize: '0.72rem', fontWeight: 800,
          color: TEAL_DARK, letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{
          display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
          background: TEAL,
          boxShadow: '0 0 0 0 rgba(0,179,184,0.6)',
          animation: 'hintPulse 1.8s ease-out infinite',
        }} />
        Inside the VERO · exploded view
      </div>

      {interactive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 14, top: 14,
            padding: '6px 11px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(0,0,0,0.06)',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '0.7rem', fontWeight: 700,
            color: '#0F9898', letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}
        >
          Drag to spin · scroll to zoom
        </div>
      )}
    </div>
  );
}
