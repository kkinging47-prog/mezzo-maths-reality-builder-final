import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DECK_Y = 0.82;
const BRIDGE_LENGTH = 6.4;
const BRIDGE_WIDTH = 1.35;
const LEFT_BANK_X = -4.7;
const RIGHT_BANK_X = 4.7;

const buildSteps = [
  { label: 'Survey', reward: '+5 XP', note: 'Mark a straight line from one bank to the other.' },
  { label: 'Pillars', reward: '+15 coins', note: 'Raise strong supports in the water.' },
  { label: 'Beams', reward: '+10 XP', note: 'Place two long beams across the river.' },
  { label: 'Deck', reward: '+20 coins', note: 'Lay the walking boards one by one.' },
  { label: 'Rails', reward: '+1 star', note: 'Add safety rails on both sides.' },
  { label: 'Test', reward: '+2 stars', note: 'Let the learner cross the bridge.' },
];

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.56, 10]} />
        <meshStandardMaterial color="#7c3f13" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.76, 0]} castShadow>
        <coneGeometry args={[0.35, 0.78, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.72} />
      </mesh>
      <mesh position={[0.03, 0.96, 0]} castShadow>
        <coneGeometry args={[0.24, 0.52, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.72} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={[0.22, 0.32, -0.1]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.9} />
    </mesh>
  );
}

function GrassTuft({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-0.07, 0, 0.07].map((x, index) => (
        <mesh key={index} position={[x, 0.1, 0]} rotation={[0, 0, x * 5]} castShadow>
          <coneGeometry args={[0.026, 0.24, 6]} />
          <meshStandardMaterial color={index === 1 ? '#16a34a' : '#15803d'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function FlowingRiver() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    linesRef.current.children.forEach((child, index) => {
      child.position.z = -3.4 + ((clock.elapsedTime * 0.5 + index * 0.85) % 6.8);
    });
  });

  return (
    <group>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[2.35, 0.05, 6.9]} />
        <meshStandardMaterial color="#22c7df" roughness={0.22} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[2.72, 0.04, 7.05]} />
        <meshStandardMaterial color="#1d8fa2" roughness={0.7} />
      </mesh>
      <group ref={linesRef} position={[0, 0.065, 0]}>
        {Array.from({ length: 9 }).map((_, index) => (
          <mesh key={index} position={[index % 2 ? -0.42 : 0.42, 0, -3.2 + index * 0.72]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.72, 0.035]} />
            <meshStandardMaterial color="#ecfeff" transparent opacity={0.62} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GroundAndEnvironment() {
  return (
    <group>
      <mesh position={[-3.7, -0.055, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.18, 7.05]} />
        <meshStandardMaterial color="#79d98d" roughness={0.92} />
      </mesh>
      <mesh position={[3.7, -0.055, 0]} receiveShadow>
        <boxGeometry args={[5.2, 0.18, 7.05]} />
        <meshStandardMaterial color="#79d98d" roughness={0.92} />
      </mesh>
      <FlowingRiver />

      <mesh position={[LEFT_BANK_X, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.15, 0.07, 1.5]} />
        <meshStandardMaterial color="#c7b37b" roughness={0.9} />
      </mesh>
      <mesh position={[RIGHT_BANK_X, 0.02, 0]} receiveShadow>
        <boxGeometry args={[1.15, 0.07, 1.5]} />
        <meshStandardMaterial color="#c7b37b" roughness={0.9} />
      </mesh>

      <Tree position={[-4.75, 0.02, -2.55]} scale={0.88} />
      <Tree position={[4.85, 0.02, 2.55]} scale={0.9} />
      <Tree position={[-3.35, 0.02, 2.75]} scale={0.62} />
      <Tree position={[3.3, 0.02, -2.75]} scale={0.65} />
      {[-1.42, 1.42].map((x) => [-2.7, 2.7].map((z) => <Rock key={`${x}-${z}`} position={[x, 0.1, z]} scale={0.86} />))}
      {[-5.1, -4.2, 4.2, 5.1].map((x) => [-1.55, 1.55].map((z) => <GrassTuft key={`${x}-${z}`} position={[x, 0.04, z]} scale={0.9} />))}
    </group>
  );
}

function SurveyLine({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 1) return null;
  return (
    <group>
      <mesh position={[0, 0.1, -0.88]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.5, 0.035]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {[LEFT_BANK_X + 0.75, RIGHT_BANK_X - 0.75].map((x) => (
        <group key={x} position={[x, 0.22, -0.88]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.32, 0.12, 0.035]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SupportPost({ x, z, delay = 0 }: { x: number; z: number; delay?: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const target = Math.min(1, Math.max(0.08, (clock.elapsedTime - delay) * 1.5));
    ref.current.scale.y = THREE.MathUtils.lerp(ref.current.scale.y, target, 0.12);
  });

  return (
    <group ref={ref} position={[x, 0.04, z]} scale={[1, 0.08, 1]}>
      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.74, 14]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.14, 0.18]} />
        <meshStandardMaterial color="#78350f" roughness={0.72} />
      </mesh>
    </group>
  );
}

function BridgeSupports({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 2) return null;
  return (
    <group>
      {[-0.82, 0, 0.82].map((x, rowIndex) =>
        [-0.52, 0.52].map((z, zIndex) => <SupportPost key={`${x}-${z}`} x={x} z={z} delay={rowIndex * 0.12 + zIndex * 0.05} />),
      )}
    </group>
  );
}

function LongBeams({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 3) return null;
  return (
    <group>
      {[-0.56, 0.56].map((z) => (
        <mesh key={z} position={[0, DECK_Y - 0.14, z]} castShadow receiveShadow>
          <boxGeometry args={[BRIDGE_LENGTH, 0.16, 0.16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.62} />
        </mesh>
      ))}
    </group>
  );
}

function AnimatedPlank({ index, x }: { index: number; x: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const delay = index * 0.12;
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - delay) * 1.7));
    ref.current.position.y = THREE.MathUtils.lerp(0.18, DECK_Y, progress);
    ref.current.rotation.z = THREE.MathUtils.lerp(index % 2 ? 0.22 : -0.22, 0, progress);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.64, 1, progress));
  });

  return (
    <mesh ref={ref} position={[x, 0.18, 0]} rotation={[0, 0, index % 2 ? 0.22 : -0.22]} castShadow receiveShadow>
      <boxGeometry args={[0.48, 0.14, BRIDGE_WIDTH]} />
      <meshStandardMaterial color={index % 2 ? '#a16207' : '#d08d2e'} roughness={0.74} />
    </mesh>
  );
}

function BridgeDeck({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 4) return null;
  return (
    <group>
      {Array.from({ length: 12 }).map((_, index) => <AnimatedPlank key={index} index={index} x={-2.64 + index * 0.48} />)}
    </group>
  );
}

function Rails({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;
  return (
    <group position={[0, DECK_Y + 0.34, 0]}>
      {[-0.76, 0.76].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.13, z]} castShadow>
            <boxGeometry args={[BRIDGE_LENGTH + 0.1, 0.08, 0.07]} />
            <meshStandardMaterial color="#92400e" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.12, z]} castShadow>
            <boxGeometry args={[BRIDGE_LENGTH - 0.28, 0.06, 0.055]} />
            <meshStandardMaterial color="#b45309" roughness={0.62} />
          </mesh>
          {[-2.85, -1.9, -0.95, 0, 0.95, 1.9, 2.85].map((x) => (
            <mesh key={`${x}-${z}`} position={[x, -0.05, z]} castShadow>
              <boxGeometry args={[0.075, 0.55, 0.075]} />
              <meshStandardMaterial color="#78350f" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function StairBlock({ x, height }: { x: number; height: number }) {
  return (
    <mesh position={[x, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[0.42, height, BRIDGE_WIDTH]} />
      <meshStandardMaterial color="#d9bd88" roughness={0.8} />
    </mesh>
  );
}

function BridgeStairs({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;
  const heights = [0.2, 0.38, 0.56, 0.74];
  const leftXs = [-4.15, -3.72, -3.29, -2.86];
  const rightXs = [4.15, 3.72, 3.29, 2.86];

  return (
    <group>
      {heights.map((h, index) => <StairBlock key={`l-${h}`} x={leftXs[index]} height={h} />)}
      {heights.map((h, index) => <StairBlock key={`r-${h}`} x={rightXs[index]} height={h} />)}
      <mesh position={[-2.58, DECK_Y - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.1, BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#b7925e" roughness={0.78} />
      </mesh>
      <mesh position={[2.58, DECK_Y - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.1, BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#b7925e" roughness={0.78} />
      </mesh>
    </group>
  );
}

function TestChild({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = (Math.sin(clock.elapsedTime * 0.75) + 1) / 2;
    ref.current.position.x = -2.55 + t * 5.1;
    ref.current.position.y = DECK_Y + 0.17 + Math.sin(clock.elapsedTime * 5) * 0.018;
  });

  if (!active) return null;
  return (
    <group ref={ref} position={[-2.55, DECK_Y + 0.17, 0]}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.11, 0.4, 16]} />
        <meshStandardMaterial color="#2563eb" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.51, 0]} castShadow>
        <sphereGeometry args={[0.15, 18, 18]} />
        <meshStandardMaterial color="#f2c28b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RealisticBridgeScene({ buildLevel }: { buildLevel: number }) {
  return (
    <>
      <color attach="background" args={["#c7ecff"]} />
      <fog attach="fog" args={["#c7ecff", 9, 16]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#eff6ff", "#2f7d32", 1.2]} />
      <directionalLight position={[4.6, 7.4, 4.8]} intensity={2.05} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <group rotation={[0, -0.18, 0]}>
        <GroundAndEnvironment />
        <SurveyLine buildLevel={buildLevel} />
        <BridgeSupports buildLevel={buildLevel} />
        <LongBeams buildLevel={buildLevel} />
        <BridgeDeck buildLevel={buildLevel} />
        <Rails buildLevel={buildLevel} />
        <BridgeStairs buildLevel={buildLevel} />
        <TestChild active={buildLevel >= 6} />
      </group>

      <OrbitControls enablePan={false} minDistance={5.6} maxDistance={8.8} maxPolarAngle={Math.PI / 2.35} target={[0, 0.58, 0]} />
    </>
  );
}

function RiveStyleMascot({ buildLevel }: { buildLevel: number }) {
  const message = buildLevel >= 6 ? 'Great job! The bridge is safe.' : buildLevel >= 4 ? 'Now it builds like a real crossing!' : 'Build it step by step!';

  return (
    <div className="rive-mascot-card">
      <div className="mascot-bounce" aria-hidden="true">🦉</div>
      <div>
        <strong>Mezzo Mascot</strong>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function AnimatedRealityLabPage() {
  const [buildLevel, setBuildLevel] = useState(0);
  const current = buildSteps[Math.min(buildLevel, buildSteps.length - 1)];
  const progress = Math.round((buildLevel / buildSteps.length) * 100);

  const addStep = () => setBuildLevel((level) => Math.min(buildSteps.length, level + 1));
  const reset = () => setBuildLevel(0);

  return (
    <main className="animated-reality-lab">
      <section className="lab-hero card">
        <div>
          <span className="eyebrow">Separate experiment branch · REALITY V4</span>
          <h1>Animated Reality Lab</h1>
          <p>
            This is a clearly different version: a straight bridge crossing from left bank to right bank, with the river flowing underneath and stairs aligned to the deck.
          </p>
        </div>
        <div className="lab-stack">
          <span>React Three Fiber</span>
          <span>Three.js</span>
          <span>Straight crossing</span>
          <span>Aligned stairs</span>
          <span>Reality V4</span>
        </div>
      </section>

      <section className="lab-board card">
        <div className="lab-side-panel">
          <div className="lab-score-row">
            <span>🪙 {buildLevel * 15}</span>
            <span>⭐ {buildLevel >= 6 ? 3 : buildLevel >= 5 ? 1 : 0}</span>
            <span>⚡ {buildLevel * 10} XP</span>
          </div>

          <div className="lab-progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <h2>{buildLevel >= buildSteps.length ? 'Bridge complete' : current.label}</h2>
          <p className="lab-compact-copy">
            {buildLevel >= buildSteps.length ? 'The child can now cross the bridge safely.' : current.note}
          </p>

          <div className="lab-action-row">
            <button className="btn btn-primary" onClick={addStep} disabled={buildLevel >= buildSteps.length}>
              Correct answer → Build
            </button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>

          <div className="reward-pop-card" key={buildLevel}>
            {buildLevel === 0 ? 'Rewards appear here' : `${buildSteps[buildLevel - 1]?.reward} earned`}
          </div>

          <RiveStyleMascot buildLevel={buildLevel} />
        </div>

        <div className="lab-viewport">
          <span className="lab-version-badge">REALITY V4 · STRAIGHT BRIDGE CROSSING</span>
          <Canvas shadows camera={{ position: [6.1, 4.85, 5.7], fov: 42 }}>
            <Suspense fallback={null}>
              <RealisticBridgeScene buildLevel={buildLevel} />
            </Suspense>
          </Canvas>
        </div>

        <div className="lab-side-panel slim">
          <h3>Build steps</h3>
          <div className="lab-step-list">
            {buildSteps.map((step, index) => (
              <div className={`lab-step ${index < buildLevel ? 'done' : index === buildLevel ? 'current' : ''}`} key={step.label}>
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </div>
            ))}
          </div>

          <div className="spline-ready-card">
            <span>Homepage Spline slot</span>
            <p>Later we can paste a Spline scene URL here for a polished 3D homepage without touching the mission engine.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
