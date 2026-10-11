/**
 * "Vault Orbit" — the home hero scene.
 *
 * Concept: the logo's orbit ring rendered as a swarm of paper sheets circling
 * a glowing vault core. Pointer tilts the system; scrolling pulls the sheets
 * inward ("files saved into the vault") and tightens the ring.
 *
 * Perf budget: 1 draw call for all sheets (InstancedMesh), 1 for the core,
 * 1 for the ring. DPR capped at 1.75, sheet count scales with viewport, and
 * the render loop stops when the canvas is off-screen or the tab is hidden.
 */
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const BLUE = new THREE.Color("#2d6bff");
const SKY = new THREE.Color("#4fc3ff");
const YELLOW = new THREE.Color("#ffc21a");
const PAPER = new THREE.Color("#eef1f8");

type Sheet = { radius: number; angle: number; speed: number; y: number; spin: THREE.Euler; spinSpeed: number; scale: number };

function makeSheets(count: number): Sheet[] {
  const rand = mulberry32(42); // deterministic: identical layout on every load
  return Array.from({ length: count }, () => {
    const band = rand() < 0.86; // most sheets ride the ring, a few drift in a halo
    // Halo stays inside r≈4.3 so no sheet swings close enough to the camera to fill the screen.
    const radius = band ? 3.1 + (rand() - 0.5) * 0.9 : 2.2 + rand() * 2.1;
    return {
      radius,
      angle: rand() * Math.PI * 2,
      speed: (0.05 + rand() * 0.07) * (band ? 1 : 0.5) * (4 / radius),
      y: (rand() - 0.5) * (band ? 0.45 : 2.4),
      spin: new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
      spinSpeed: 0.2 + rand() * 0.8,
      scale: 0.45 + rand() * 0.5,
    };
  });
}

function Sheets({ count, progress }: { count: number; progress: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const sheets = useMemo(() => makeSheets(count), [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Paper sheet: A-series aspect, slight thickness reads at grazing angles.
  const geometry = useMemo(() => new THREE.BoxGeometry(0.15, 0.212, 0.004), []);

  useEffect(() => {
    const rand = mulberry32(7);
    sheets.forEach((_, i) => {
      const r = rand();
      const c = r < 0.08 ? YELLOW : r < 0.2 ? BLUE : r < 0.3 ? SKY : PAPER;
      mesh.current.setColorAt(i, c);
    });
    mesh.current.instanceColor!.needsUpdate = true;
  }, [sheets]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progress.current ?? 0; // 0 = top of page, 1 = hero scrolled away
    const pull = THREE.MathUtils.smoothstep(p, 0, 1);
    sheets.forEach((s, i) => {
      s.angle += s.speed * delta * (1 + pull * 2.5);
      const r = THREE.MathUtils.lerp(s.radius, 0.35 + s.radius * 0.08, pull);
      dummy.position.set(Math.cos(s.angle) * r, s.y * (1 - pull * 0.9) + Math.sin(t * 0.6 + i) * 0.03, Math.sin(s.angle) * r);
      dummy.rotation.set(s.spin.x + t * s.spinSpeed * 0.3, s.spin.y + t * s.spinSpeed * 0.2, s.spin.z);
      dummy.scale.setScalar(s.scale * (1 - pull * 0.55));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}

const coreVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBlue;
  uniform vec3 uYellow;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
    float pulse = 0.85 + 0.15 * sin(uTime * 1.6);
    vec3 col = mix(uYellow * 1.25, uBlue, smoothstep(0.15, 0.95, fres));
    gl_FragColor = vec4(col * pulse + fres * 0.35, 1.0);
  }
`;

function Core({ progress }: { progress: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null!);
  const group = useRef<THREE.Group>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uBlue: { value: BLUE }, uYellow: { value: YELLOW } }), []);
  useFrame((state) => {
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    const s = 1 + (progress.current ?? 0) * 0.5;
    group.current.scale.setScalar(s);
    group.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.55, 6]} />
        <shaderMaterial ref={mat} vertexShader={coreVertex} fragmentShader={coreFragment} uniforms={uniforms} />
      </mesh>
      {/* Dial spokes, echoing the vault handle in the logo */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, (i / 6) * Math.PI * 2]} position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 0.035, 0.035]} />
          <meshStandardMaterial color="#cfd6e4" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
      <pointLight color={YELLOW} intensity={14} distance={9} decay={1.6} />
    </group>
  );
}

function OrbitRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, d) => (ref.current.rotation.z += d * 0.05));
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[3.1, 0.012, 8, 220]} />
      <meshBasicMaterial color={SKY} transparent opacity={0.55} />
    </mesh>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null!);
  const { pointer } = useThree();
  useFrame((_, d) => {
    // Damped pointer parallax, on top of the base tilt that matches the logo's ring.
    const k = 1 - Math.exp(-d * 3);
    group.current.rotation.x += (-0.42 + pointer.y * 0.12 - group.current.rotation.x) * k;
    group.current.rotation.z += (0.24 - pointer.x * 0.12 - group.current.rotation.z) * k;
    group.current.rotation.y += d * 0.04;
  });
  return <group ref={group}>{children}</group>;
}

export default function VaultScene({ progress }: { progress: React.RefObject<number> }) {
  const count = useMemo(() => {
    if (typeof window === "undefined") return 900;
    const w = window.innerWidth;
    return w < 640 ? 500 : w < 1200 ? 800 : 1100;
  }, []);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.6, 8.2], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop="always"
        onCreated={({ gl }) => gl.setClearAlpha(0)}
        aria-hidden
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 5]} intensity={1.2} color="#dfe8ff" />
        <directionalLight position={[-6, -2, -4]} intensity={0.6} color={BLUE} />
        <PauseWhenHidden />
        <ResponsiveCamera />
        <Rig>
          <Core progress={progress} />
          <OrbitRing />
          <Sheets count={count} progress={progress} />
        </Rig>
      </Canvas>
    </div>
  );
}

/** Pull the camera back on portrait screens so the orbit always fits the width. */
function ResponsiveCamera() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);
  useEffect(() => {
    const wide = aspect >= 1.2;
    const z = wide ? 9.6 : 8.2 * (1.25 / Math.max(aspect, 0.4)) * 0.95;
    // On wide screens look left of the vault so it sits to the right of the headline.
    camera.position.set(wide ? -2.4 : 0, wide ? 0.8 : 1.6, z);
    camera.lookAt(wide ? -2.4 : 0, wide ? 0.2 : 0.9, 0);
  }, [camera, aspect]);
  return null;
}

/** Stops rendering entirely while the hero is off-screen or the tab is hidden. */
function PauseWhenHidden() {
  const gl = useThree((s) => s.gl);
  const setFrameloop = useThree((s) => s.setFrameloop);
  useEffect(() => {
    let onScreen = true;
    const apply = () => setFrameloop(onScreen && !document.hidden ? "always" : "never");
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      apply();
    });
    io.observe(gl.domElement);
    document.addEventListener("visibilitychange", apply);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", apply);
    };
  }, [gl, setFrameloop]);
  return null;
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
