import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DECK_Y = 0.72;
const BRIDGE_LENGTH = 5.8;
const BRIDGE_WIDTH = 1.28;
const RIVER_WIDTH = 2.05;

const buildSteps = [
  { label: 'Survey', reward: '+5 XP', note: 'Mark the exact bridge line across the stream' },
  { label: 'Pillars', reward: '+15 coins', note: 'Raise supports inside the stream' },
  { label: 'Beams', reward: '+10 XP', note: 'Place the long beams from bank to bank' },
  { label: 'Planks', reward: '+20 coins', note: 'Lay deck boards one after another' },
  { label: 'Rails', reward: '+1 star', note: 'Add side rails for safety' },
  { label: 'Test', reward: '+2 stars', note: 'Let the learner cross the finished bridge' },
];

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.085, 0.56, 9]} />
        <meshStandardMaterial color="#7c3f13" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.32, 0.72, 14]} />
        <meshStandardMaterial color="#166534" roughness={0.72} />
      </mesh>
      <mesh position={[0.03, 0.92, 0]} castShadow>
        <coneGeometry args={[0.23, 0.48, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.72} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={[0.2, 0.3, -0.12]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.16, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.92} />
    </mesh>
  );
}

function GrassTuft({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-0.07, 0, 0.07].map((x, index) => (
        <mesh key={index} position={[x, 0.1, 0]} rotation={[0, 0, x * 4]} castShadow>
          <coneGeometry args={[0.027, 0.22, 6]} />
          <meshStandardMaterial color={index === 1 ? '#16a34a' : '#15803d'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function FlowingRiver() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.children.forEach((child, index) => {
      child.position.z = -2.8 + ((clock.elapsedTime * 0.38 + index * 0.85) % 5.6);
    });
  });

  return (
    <group>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[RIVER_WIDTH, 0.05, 5.8]} />
        <meshStandardMaterial color="#31c8df" roughness={0.28} metalness={0.06} />
      </mesh>
      <group ref={ref} position={[0, 0.06, 0]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <mesh key={index} position={[index % 2 ? -0.35 : 0.35, 0, -2.8 + index * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.65, 0.035]} />
            <meshStandardMaterial color="#ecfeff" transparent opacity={0.65} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GroundAndRiver() {
  return (
    <group>
      <mesh position={[-3.1, -0.045, 0]} receiveShadow>
        <boxGeometry args={[4.15, 0.16, 5.8]} />
        <meshStandardMaterial color="#70d889" roughness={0.92} />
      </mesh>
      <mesh position={[3.1, -0.045, 0]} receiveShadow>
        <boxGeometry args={[4.15, 0.16, 5.8]} />
        <meshStandardMaterial color="#70d889" roughness={0.92} />
      </mesh>
      <FlowingRiver />

      <mesh position={[-4.55, 0.012, 0]} receiveShadow>
        <boxGeometry args={[1.85, 0.03, 1.1]} />
        <meshStandardMaterial color="#c4b279" roughness={0.9} />
      </mesh>
      <mesh position={[4.55, 0.012, 0]} receiveShadow>
        <boxGeometry args={[1.85, 0.03, 1.1]} />
        <meshStandardMaterial color="#c4b279" roughness={0.9} />
      </mesh>

      <Tree position={[-4.2, 0.02, -2.15]} scale={0.9} />
      <Tree position={[4.3, 0.02, 2.2]} scale={0.95} />
      <Tree position={[-3.8, 0.02, 2.35]} scale={0.65} />
      <Tree position={[3.7, 0.02, -2.35]} scale={0.68} />

      {[-1.05, 1.05].map((x) => [-2.25, 2.25].map((z) => <Rock key={`${x}-${z}`} position={[x, 0.12, z]} scale={0.9} />))}
      {[-4.45, -3.75, 3.75, 4.45].map((x) => [-1.3, 1.35].map((z) => <GrassTuft key={`${x}-${z}`} position={[x, 0.03, z]} scale={0.9} />))}
    </group>
  );
}

function SurveyLine({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 1) return null;

  return (
    <group>
      <mesh position={[0, 0.12, -0.84]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.05, 0.035]} />
        <meshStandardMaterial color="#fde047" />
      </mesh>
      {[-3.52, 3.52].map((x) => (
        <group key={x} position={[x, 0.22, -0.84]}>
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
    <group ref={ref} position={[x, 0.05, z]} scale={[1, 0.08, 1]}>
      <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.72, 14]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.14, 0.18]} />
        <meshStandardMaterial color="#78350f" roughness={0.7} />
      </mesh>
    </group>
  );
}

function BridgeSupports({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 2) return null;

  return (
    <group>
      {[-0.76, 0, 0.76].map((x, rowIndex) =>
        [-0.5, 0.5].map((z, zIndex) => <SupportPost key={`${x}-${z}`} x={x} z={z} delay={rowIndex * 0.12 + zIndex * 0.05} />),
      )}
    </group>
  );
}

function LongBeams({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 3) return null;

  return (
    <group>
      {[-0.58, 0.58].map((z) => (
        <mesh key={z} position={[0, DECK_Y - 0.13, z]} castShadow receiveShadow>
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
    const delay = index * 0.14;
    const progress = Math.min(1, Math.max(0, (clock.elapsedTime - delay) * 1.7));
    ref.current.position.y = THREE.MathUtils.lerp(0.12, DECK_Y, progress);
    ref.current.rotation.z = THREE.MathUtils.lerp(index % 2 ? 0.28 : -0.28, 0, progress);
    ref.current.scale.setScalar(THREE.MathUtils.lerp(0.6, 1, progress));
  });

  return (
    <mesh ref={ref} position={[x, 0.12, 0]} rotation={[0, 0, index % 2 ? 0.28 : -0.28]} castShadow receiveShadow>
      <boxGeometry args={[0.48, 0.14, BRIDGE_WIDTH]} />
      <meshStandardMaterial color={index % 2 ? '#a16207' : '#c98a2e'} roughness={0.74} />
    </mesh>
  );
}

function BridgePlanks({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 4) return null;

  return (
    <group>
      {Array.from({ length: 11 }).map((_, index) => <AnimatedPlank key={index} index={index} x={-2.4 + index * 0.48} />)}
    </group>
  );
}

function Rails({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;

  return (
    <group position={[0, DECK_Y + 0.34, 0]}>
      {[-0.75, 0.75].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.12, z]} castShadow>
            <boxGeometry args={[BRIDGE_LENGTH + 0.1, 0.08, 0.07]} />
            <meshStandardMaterial color="#92400e" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.12, z]} castShadow>
            <boxGeometry args={[BRIDGE_LENGTH - 0.25, 0.06, 0.055]} />
            <meshStandardMaterial color="#b45309" roughness={0.62} />
          </mesh>
          {[-2.65, -1.75, -0.85, 0.05, 0.95, 1.85, 2.65].map((x) => (
            <mesh key={`${x}-${z}`} position={[x, -0.04, z]} castShadow>
              <boxGeometry args={[0.075, 0.54, 0.075]} />
              <meshStandardMaterial color="#78350f" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function StairCase({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  const direction = isLeft ? 1 : -1;
  const outerX = isLeft ? -4.05 : 4.05;
  const heights = [0.17, 0.32, 0.48, 0.64];

  return (
    <group>
      {heights.map((height, index) => {
        const x = outerX + direction * index * 0.37;
        return (
          <mesh key={`${side}-${index}`} position={[x, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.38, height, BRIDGE_WIDTH]} />
            <meshStandardMaterial color="#d7b47a" roughness={0.78} />
          </mesh>
        );
      })}
      <mesh position={[isLeft ? -2.56 : 2.56, DECK_Y - 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 0.1, BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#b08d57" roughness={0.78} />
      </mesh>
    </group>
  );
}

function BridgeStairs({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;
  return (
    <>
      <StairCase side="left" />
      <StairCase side="right" />
    </>
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
        <cylinderGeometry args={[0.12, 0.12, 0.42, 16]} />
        <meshStandardMaterial color="#2563eb" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color="#f2c28b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.67, 0]} castShadow>
        <sphereGeometry args={[0.17, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#111827" roughness={0.6} />
      </mesh>
    </group>
  );
}

function RealisticBridgeScene({ buildLevel }: { buildLevel: number }) {
  return (
    <>
      <color attach="background" args={["#c7ecff"]} />
      <fog attach="fog" args={["#c7ecff", 8, 15]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#eff6ff", "#2f7d32", 1.2]} />
      <directionalLight position={[4.4, 7.2, 4.8]} intensity={2.05} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

      <group rotation={[0, -0.28, 0]}>
        <GroundAndRiver />
        <SurveyLine buildLevel={buildLevel} />
        <BridgeSupports buildLevel={buildLevel} />
        <LongBeams buildLevel={buildLevel} />
        <BridgePlanks buildLevel={buildLevel} />
        <Rails buildLevel={buildLevel} />
        <BridgeStairs buildLevel={buildLevel} />
        <TestChild active={buildLevel >= 6} />
      </group>

      <OrbitControls enablePan={false} minDistance={5.7} maxDistance={8.9} maxPolarAngle={Math.PI / 2.35} target={[0, 0.55, 0]} />
    </>
  );
}

function RiveStyleMascot({ buildLevel }: { buildLevel: number }) {
  const message = buildLevel >= 6 ? 'Great job! The bridge is safe.' : buildLevel >= 4 ? 'Now it looks like a real bridge!' : 'Build it step by step!';

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
          <span className="eyebrow">Separate experiment branch · reality v3</span>
          <h1>Animated Reality Lab</h1>
          <p>
            This version keeps the clean child-friendly layout, but rebuilds the bridge as a real crossing over a flowing stream:
            banks, supports, beams, planks, rails, stairs and a learner test walk.
          </p>
        </div>
        <div className="lab-stack">
          <span>React Three Fiber</span>
          <span>Three.js</span>
          <span>Blender-ready</span>
          <span>Rive rewards</span>
          <span>Spline-ready</span>
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
          <span className="lab-version-badge">Reality v3 · aligned bridge</span>
          <Canvas shadows camera={{ position: [6.1, 4.75, 5.6], fov: 42 }}>
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
