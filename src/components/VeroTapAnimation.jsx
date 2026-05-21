/**
 * VeroTapAnimation
 * ─────────────────────────────────────────────────────────────
 * Premium hero animation: blank white cards tapping the centre
 * of the VERO product. Uses the real CAD geometry from the 3MF
 * file at `public/models/vero-cloud-base.3mf`.
 *
 * To replace the model:
 *   1. Drop your new 3MF or GLB into public/models/
 *   2. Change MODEL_URL below.
 *
 * To change card count: edit CARD_COUNT below.
 * To change animation speed: edit CYCLE_SECONDS.
 * To enable infinite looping: pass <VeroTapAnimation loop />.
 *
 * Props:
 *   - autoPlay?: boolean   default true
 *   - loop?:     boolean   default false
 *   - className?: string
 *   - debugMeshes?: boolean  log mesh names + show wireframe (dev only)
 */
import {
  Suspense, useEffect, useMemo, useRef, useState,
} from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import {
  ContactShadows, OrbitControls,
} from '@react-three/drei';
import * as THREE from 'three';
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';

/* Detect WebGL up-front so we can render a friendly fallback instead
   of letting three.js throw inside a Suspense boundary. */
function hasWebGL() {
  if (typeof window === 'undefined') return true; // SSR-safe assume yes
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/* ───── Config ─────────────────────────────────── */
const MODEL_URL     = '/models/vero-cloud-base.3mf';
const CARD_COUNT    = 3;
const CYCLE_SECONDS = 3.4;     // one full enter → tap → exit per card
const STAGGER       = 0.55;    // fraction of CYCLE_SECONDS each card waits
const TEAL          = '#00B3B8';
const TEAL_DARK     = '#00A9A5';

/* ───── 3MF model ──────────────────────────────── */
function VeroBody({ debugMeshes = false, rainbowMeshes = false }) {
  const group = useLoader(ThreeMFLoader, MODEL_URL);

  // Material setup — applied once on load.
  // The 3MF has 8 bodies. The one with the most vertices is the enclosure
  // (white satin plastic). Every other body is an extruded surface detail
  // (VERO letters + contactless icon) and gets the teal material.
  const prepared = useMemo(() => {
    const root = group.clone(true);

    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: '#f6f7f8',
      roughness: 0.55,
      metalness: 0.0,
      clearcoat: 0.25,
      clearcoatRoughness: 0.6,
      reflectivity: 0.15,
    });

    const tealMat = new THREE.MeshStandardMaterial({
      color: TEAL,
      roughness: 0.35,
      metalness: 0.05,
      emissive: TEAL_DARK,
      emissiveIntensity: 0.12,
    });

    // Whole model gets the white plastic material — teal branding is
    // applied via the SVG overlay in the parent (because the O + wifi
    // icon are fused into the main body in the CAD file).
    root.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.geometry?.computeVertexNormals?.();
      obj.castShadow    = true;
      obj.receiveShadow = true;
      obj.material = bodyMat;

      if (debugMeshes) {
        const verts = obj.geometry?.attributes?.position?.count ?? 0;
        // eslint-disable-next-line no-console
        console.log(`[VeroTapAnimation] mesh: "${obj.name}" verts=${verts}`);
      }
    });
    // Silence unused-var warnings now that rainbow/tealMat aren't applied
    void rainbowMeshes; void tealMat;

    // Step 1: rotate Z-up → Y-up
    root.rotation.x = -Math.PI / 2;

    // Step 2: measure pre-scale, then scale to a known size
    root.updateMatrixWorld(true);
    let box    = new THREE.Box3().setFromObject(root);
    let size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    root.scale.setScalar(2.0 / maxDim);

    // Step 3: re-measure AFTER scaling and re-center to origin
    root.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.sub(center);

    if (debugMeshes) {
      // eslint-disable-next-line no-console
      console.log('[VeroTapAnimation] final size:', size, 'scale:', root.scale.x);
    }

    return root;
  }, [group, debugMeshes]);

  return <primitive object={prepared} />;
}

/* ───── Card geometry (rounded rect, blank) ──── */
function makeCardGeometry(w = 1.4, h = 0.9, t = 0.04, r = 0.09) {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: t, bevelEnabled: true, bevelThickness: 0.006,
    bevelSize: 0.006, bevelSegments: 2, curveSegments: 12,
  });
  geo.center();
  return geo;
}

/* ───── Easing ─────────────────────────────────── */
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const easeOut   = (t) => 1 - Math.pow(1 - t, 3);

/* ───── A single animated card + ripple ─────────
 * Card is built in XY then extruded along Z, so its *face* lies in
 * the XY plane. To lay the face DOWN onto the (horizontal) top of the
 * product, the card needs a baseline -PI/2 rotation around X.
 * All animation rotations are layered on top of that baseline.
 */
const CARD_FLAT_ROT_X = -Math.PI / 2;
// Y position at which the card face contacts the product top.
// The product's top surface sits ~y=0.4 after centering at origin
// (model is scaled to longest-dim=2, then centered).
const TAP_Y    = 0.42;
const HOVER_Y  = 0.62;   // just before touchdown

function TappingCard({ index, startTime, cardGeom, cardMat, onTap, totalCycle }) {
  const cardRef   = useRef();
  const rippleRef = useRef();

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() - startTime) % totalCycle;
    if (t < 0) { if (cardRef.current) cardRef.current.visible = false; return; }

    // Phase split: 0.0-0.45 enter, 0.45-0.6 tap+hold, 0.6-1.0 exit
    const ENTER_END = 0.45;
    const TAP_END   = 0.60;

    let x, y, z, tiltX, tiltZ, opacity = 1;
    const visible = true;

    if (t < ENTER_END) {
      const p = easeInOut(t / ENTER_END);
      x = THREE.MathUtils.lerp(-2.0, 0,       p);
      y = THREE.MathUtils.lerp( 1.6, HOVER_Y, p);
      z = THREE.MathUtils.lerp(-0.8, 0,       p);
      // Slight wobble that flattens out — card arrives face-down, parallel
      tiltX = THREE.MathUtils.lerp(0.25, 0, p);
      tiltZ = THREE.MathUtils.lerp(0.30, 0, p);
    } else if (t < TAP_END) {
      const p = easeOut((t - ENTER_END) / (TAP_END - ENTER_END));
      // Card lowers flat onto the tap zone — face-to-face
      x = 0;
      y = THREE.MathUtils.lerp(HOVER_Y, TAP_Y, p);
      z = 0;
      tiltX = 0;
      tiltZ = 0;
      // Fire ripple at touchdown
      if (rippleRef.current) {
        rippleRef.current.userData.startedAt =
          rippleRef.current.userData.startedAt ?? clock.getElapsedTime();
      }
    } else {
      const p = easeInOut((t - TAP_END) / (1 - TAP_END));
      x = THREE.MathUtils.lerp(0,     2.2,  p);
      y = THREE.MathUtils.lerp(TAP_Y, 1.4,  p);
      z = THREE.MathUtils.lerp(0,    -0.7,  p);
      tiltX = THREE.MathUtils.lerp(0, 0.35, p);
      tiltZ = THREE.MathUtils.lerp(0,-0.45, p);
      opacity = 1 - p * 0.6;
      if (p > 0.95 && rippleRef.current) {
        rippleRef.current.userData.startedAt = null;
      }
    }

    if (cardRef.current) {
      cardRef.current.visible = visible;
      cardRef.current.position.set(x, y, z);
      // Baseline flat + layered animation tilt
      cardRef.current.rotation.set(CARD_FLAT_ROT_X + tiltX, 0, tiltZ);
      if (cardRef.current.material) cardRef.current.material.opacity = opacity;
    }

    // Ripple animation
    if (rippleRef.current?.userData.startedAt != null) {
      const rt = clock.getElapsedTime() - rippleRef.current.userData.startedAt;
      const RIPPLE = 0.9;
      if (rt < RIPPLE) {
        const rp = rt / RIPPLE;
        const s = 0.25 + rp * 1.4;
        rippleRef.current.scale.set(s, s, s);
        rippleRef.current.material.opacity = (1 - rp) * 0.55;
        rippleRef.current.visible = true;
      } else {
        rippleRef.current.visible = false;
      }
    } else if (rippleRef.current) {
      rippleRef.current.visible = false;
    }
  });

  return (
    <>
      <mesh ref={cardRef} geometry={cardGeom} material={cardMat} castShadow />
      {/* Teal ripple at the contactless point */}
      <mesh
        ref={rippleRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.18, 0]}
        visible={false}
      >
        <ringGeometry args={[0.18, 0.22, 64]} />
        <meshBasicMaterial
          color={TEAL}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* ───── Scene ──────────────────────────────────── */
function Scene({ loop, autoPlay, debugMeshes, rainbowMeshes, interactive }) {
  const cardGeom = useMemo(() => makeCardGeometry(), []);
  const cardMat  = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.42, metalness: 0.02,
    clearcoat: 0.4, clearcoatRoughness: 0.4,
    transparent: true, opacity: 1,
  }), []);

  // Build per-card start times
  const totalCycle = useMemo(
    () => (loop ? CYCLE_SECONDS : CYCLE_SECONDS * (1 + STAGGER * (CARD_COUNT - 1))),
    [loop],
  );

  // For non-looping mode we play once: each card has a unique start
  // and a long tail so the cycle math above never re-enters it.
  const starts = useMemo(
    () => Array.from({ length: CARD_COUNT }, (_, i) => i * CYCLE_SECONDS * STAGGER),
    [],
  );

  // When loop=false, freeze the clock after the sequence finishes
  const sceneRef = useRef();
  useFrame(({ clock }) => {
    if (loop || !autoPlay) return;
    const lastEnd = starts[starts.length - 1] + CYCLE_SECONDS;
    if (clock.getElapsedTime() > lastEnd) clock.stop();
  });

  return (
    <group ref={sceneRef}>
      {/* Product */}
      <VeroBody debugMeshes={debugMeshes} rainbowMeshes={rainbowMeshes} />

      {/* Cards (each independently timed) */}
      {starts.map((s, i) => (
        <TappingCard
          key={i}
          index={i}
          startTime={s}
          cardGeom={cardGeom}
          cardMat={cardMat.clone()}
          totalCycle={loop ? CYCLE_SECONDS : 1e6} // huge so non-loop never wraps
        />
      ))}

      {/* Soft contact shadow under product */}
      <ContactShadows
        position={[0, -0.95, 0]}
        opacity={0.35}
        scale={6}
        blur={2.2}
        far={2}
      />
    </group>
  );
}

/* ───── Public component ───────────────────────── */
export default function VeroTapAnimation({
  autoPlay = true,
  loop = false,
  className,
  debugMeshes = false,
  rainbowMeshes = false, // colour each mesh a unique HSL + log mapping
  interactive = false,   // show OrbitControls + "drag to spin" chip
  height = 420,
}) {
  const [ready, setReady] = useState(autoPlay);
  const [webgl] = useState(hasWebGL);

  if (!webgl) {
    return (
      <div className={className} style={{
        width: '100%', height, borderRadius: 18,
        background: 'linear-gradient(135deg, #f8fafa 0%, #eef3f3 100%)',
        border: '1px dashed var(--border)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: 24, textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'Bricolage Grotesque, sans-serif',
          fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)',
        }}>
          3D preview unavailable
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 320 }}>
          WebGL is disabled in this browser. Enable hardware acceleration in
          settings, or open this page in Chrome / Safari with a normal graphics
          driver to see the live CAD model.
        </div>
      </div>
    );
  }

  // Pause when offscreen to save GPU
  const wrapRef = useRef();
  useEffect(() => {
    if (!wrapRef.current || autoPlay) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setReady(true);
    }, { threshold: 0.2 });
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [autoPlay]);

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: '100%',
        height,
        borderRadius: 18,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #f8fafa 0%, #eef3f3 100%)',
        position: 'relative',
      }}
    >
      {ready && (
        <Canvas
          shadows
          dpr={[1, 2]}
          camera={{ position: [0.8, 1.2, 2.6], fov: 42 }}
          gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        >
          {/* Pure-local studio lighting — no remote HDRI fetch.
              Hemisphere gives sky/ground tint, two directionals plus
              a fill/back keep the white plastic looking lit from all
              sides without needing an environment map. */}
          <hemisphereLight args={['#ffffff', '#cdd6dd', 0.65]} />
          <ambientLight intensity={0.35} />
          <directionalLight
            position={[3, 5, 2]}
            intensity={1.15}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-bias={-0.0005}
          />
          <directionalLight position={[-3, 2, -2]} intensity={0.45} />
          <directionalLight position={[0, 2, -4]}  intensity={0.30} color="#dceeee" />

          <Suspense fallback={null}>
            <Scene
              loop={loop}
              autoPlay={autoPlay}
              debugMeshes={debugMeshes}
              rainbowMeshes={rainbowMeshes}
              interactive={interactive}
            />
          </Suspense>

          {(interactive || debugMeshes) && (
            <OrbitControls
              enablePan={false}
              minDistance={1.5}
              maxDistance={5}
              autoRotate={interactive && !debugMeshes}
              autoRotateSpeed={0.6}
            />
          )}
        </Canvas>
      )}

      {/* "Drag to interact" hint chip — only when interactive */}
      {interactive && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 14, right: 14,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 11px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.86)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: '0.72rem', fontWeight: 700,
            color: '#0F9898', letterSpacing: '0.02em',
            pointerEvents: 'none',
            animation: 'fadeIn 0.4s 0.6s ease both',
          }}
        >
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: '#00B3B8',
            boxShadow: '0 0 0 0 rgba(0,179,184,0.6)',
            animation: 'hintPulse 1.6s ease-out infinite',
          }} />
          Drag to spin · scroll to zoom
          <style>{`
            @keyframes hintPulse {
              0%   { box-shadow: 0 0 0 0    rgba(0,179,184,0.55); }
              80%  { box-shadow: 0 0 0 10px rgba(0,179,184,0);   }
              100% { box-shadow: 0 0 0 0    rgba(0,179,184,0);   }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
