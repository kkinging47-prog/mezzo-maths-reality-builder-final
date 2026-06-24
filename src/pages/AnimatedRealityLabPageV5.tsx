import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DECK_Y = 0.86;
const BRIDGE_LENGTH = 6.2;
const BRIDGE_WIDTH = 1.42;
const LEFT_DECK_END = -3.1;
const RIGHT_DECK_END = 3.1;
const LEFT_BANK_X = -4.85;
const RIGHT_BANK_X = 4.85;

const buildSteps = [
  { label: 'Survey', reward: '+5 XP', note: 'Mark the real crossing line from bank to bank.' },
  { label: 'Pillars', reward: '+15 coins', note: 'Build supports in the water.' },
  { label: 'Beams', reward: '+10 XP', note: 'Place the long beams first.' },
  { label: 'Deck', reward: '+20 coins', note: 'Add walking boards one by one.' },
  { label: 'Stairs & rails', reward: '+1 star', note: 'Connect stairs and safety rails.' },
  { label: 'Human test', reward: '+2 stars', note: 'Watch the learner climb, cross and descend.' },
];

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function clamp01(t: number) {
  return Math.max(0, Math.min(1, t));
}

function walkwayHeightAt(x: number) {
  if (x < LEFT_DECK_END) {
    const t = clamp01((x - LEFT_BANK_X) / (LEFT_DECK_END - LEFT_BANK_X));
    return THREE.MathUtils.lerp(0.2, DECK_Y + 0.1, easeInOut(t));
  }
  if (x > RIGHT_DECK_END) {
    const t = clamp01((x - RIGHT_DECK_END) / (RIGHT_BANK_X - RIGHT_DECK_END));
    return THREE.MathUtils.lerp(DECK_Y + 0.1, 0.2, easeInOut(t));
  }
  return DECK_Y + 0.1;
}

function walkingPath(progress: number) {
  const eased = easeInOut(progress);
  const x = THREE.MathUtils.lerp(LEFT_BANK_X - 0.35, RIGHT_BANK_X + 0.35, eased);
  const y = walkwayHeightAt(x);
  return { x, y };
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 0.5, 10]} />
        <meshStandardMaterial color="#7c3f13" roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.36, 0.76, 18]} />
        <meshStandardMaterial color="#15803d" roughness={0.75} />
      </mesh>
      <mesh position={[0.03, 0.94, 0]} castShadow>
        <coneGeometry args={[0.24, 0.48, 18]} />
        <meshStandardMaterial color="#22c55e" roughness={0.75} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={[0.24, 0.4, -0.12]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.15, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.92} />
    </mesh>
  );
}

function GrassTuft({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-0.07, 0, 0.07].map((x, index) => (
        <mesh key={index} position={[x, 0.1, 0]} rotation={[0, 0, x * 5]} castShadow>
          <coneGeometry args={[0.026, 0.24, 6]} />
          <meshStandardMaterial color={index === 1 ? '#16a34a' : '#15803d'} roughness={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function FlowingRiver() {
  const waterLines = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    waterLines.current?.children.forEach((child, index) => {
      child.position.z = -3.45 + ((clock.elapsedTime * 0.55 + index * 0.78) % 6.9);
    });
  });

  return (
    <group>
      <mesh position={[0, -0.035, 0]} receiveShadow>
        <boxGeometry args={[2.8, 0.08, 7.1]} />
        <meshStandardMaterial color="#1d8fa2" roughness={0.66} />
      </mesh>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[2.35, 0.055, 6.9]} />
        <meshStandardMaterial color="#25c8df" roughness={0.18} metalness={0.08} />
      </mesh>
      <group ref={waterLines} position={[0, 0.075, 0]}>
        {Array.from({ length: 10 }).map((_, index) => (
          <mesh key={index} position={[index % 2 ? -0.45 : 0.45, 0, -3.2 + index * 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.72, 0.04]} />
            <meshStandardMaterial color="#e0faff" transparent opacity={0.62} roughness={0.2} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Environment() {
  return (
    <group>
      <mesh position={[-3.72, -0.055, 0]} receiveShadow>
        <boxGeometry args={[5.15, 0.18, 7.1]} />
        <meshStandardMaterial color="#80d891" roughness={0.94} />
      </mesh>
      <mesh position={[3.72, -0.055, 0]} receiveShadow>
        <boxGeometry args={[5.15, 0.18, 7.1]} />
        <meshStandardMaterial color="#80d891" roughness={0.94} />
      </mesh>
      <FlowingRiver />

      <mesh position={[LEFT_BANK_X, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.1, 1.55]} />
        <meshStandardMaterial color="#bca472" roughness={0.92} />
      </mesh>
      <mesh position={[RIGHT_BANK_X, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.1, 1.55]} />
        <meshStandardMaterial color="#bca472" roughness={0.92} />
      </mesh>

      <Tree position={[-5.25, 0.02, -2.6]} scale={0.82} />
      <Tree position={[5.25, 0.02, 2.55]} scale={0.86} />
      <Tree position={[-3.35, 0.02, 2.85]} scale={0.62} />
      <Tree position={[3.35, 0.02, -2.82]} scale={0.64} />
      {[-1.48, 1.48].map((x) => [-2.78, 2.78].map((z) => <Rock key={`${x}-${z}`} position={[x, 0.1, z]} scale={0.88} />))}
      {[-5.25, -4.25, 4.25, 5.25].map((x) => [-1.7, 1.7].map((z) => <GrassTuft key={`${x}-${z}`} position={[x, 0.04, z]} scale={0.92} />))}
    </group>
  );
}

function SurveyMarkers({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 1) return null;
  return (
    <group>
      <mesh position={[0, 0.11, -0.92]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7.7, 0.04]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      {[LEFT_BANK_X + 0.62, RIGHT_BANK_X - 0.62].map((x) => (
        <group key={x} position={[x, 0.26, -0.92]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.58, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <boxGeometry args={[0.3, 0.12, 0.035]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function SupportPost({ x, z, delay = 0 }: { x: number; z: number; delay?: number }) {
  const post = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!post.current) return;
    const target = Math.min(1, Math.max(0.08, (clock.elapsedTime - delay) * 1.45));
    post.current.scale.y = THREE.MathUtils.lerp(post.current.scale.y, target, 0.12);
  });

  return (
    <group ref={post} position={[x, 0.02, z]} scale={[1, 0.08, 1]}>
      <mesh position={[0, 0.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.78, 14]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.14, 0.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.74} />
      </mesh>
    </group>
  );
}

function BridgeSupports({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 2) return null;
  return (
    <group>
      {[-0.9, 0, 0.9].map((x, row) =>
        [-0.55, 0.55].map((z, col) => <SupportPost key={`${x}-${z}`} x={x} z={z} delay={row * 0.12 + col * 0.06} />),
      )}
    </group>
  );
}

function LongBeams({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 3) return null;
  return (
    <group>
      {[-0.57, 0.57].map((z) => (
        <mesh key={z} position={[0, DECK_Y - 0.16, z]} castShadow receiveShadow>
          <boxGeometry args={[BRIDGE_LENGTH, 0.16, 0.16]} />
          <meshStandardMaterial color="#7c2d12" roughness={0.62} />
        </mesh>
      ))}
      <mesh position={[0, DECK_Y - 0.23, 0]} castShadow receiveShadow>
        <boxGeometry args={[BRIDGE_LENGTH - 0.15, 0.08, 0.34]} />
        <meshStandardMaterial color="#92400e" roughness={0.7} />
      </mesh>
    </group>
  );
}

function AnimatedPlank({ index, x }: { index: number; x: number }) {
  const plank = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!plank.current) return;
    const delay = index * 0.1;
    const progress = clamp01((clock.elapsedTime - delay) * 1.85);
    plank.current.position.y = THREE.MathUtils.lerp(0.12, DECK_Y, easeInOut(progress));
    plank.current.rotation.z = THREE.MathUtils.lerp(index % 2 ? 0.22 : -0.22, 0, easeInOut(progress));
    plank.current.scale.setScalar(THREE.MathUtils.lerp(0.64, 1, progress));
  });
  return (
    <mesh ref={plank} position={[x, 0.12, 0]} rotation={[0, 0, index % 2 ? 0.22 : -0.22]} castShadow receiveShadow>
      <boxGeometry args={[0.48, 0.14, BRIDGE_WIDTH]} />
      <meshStandardMaterial color={index % 2 ? '#a16207' : '#d08d2e'} roughness={0.76} />
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

function BridgeRails({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;
  return (
    <group position={[0, DECK_Y + 0.33, 0]}>
      {[-0.79, 0.79].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.15, z]} castShadow receiveShadow>
            <boxGeometry args={[BRIDGE_LENGTH + 0.08, 0.08, 0.07]} />
            <meshStandardMaterial color="#92400e" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.12, z]} castShadow receiveShadow>
            <boxGeometry args={[BRIDGE_LENGTH - 0.25, 0.06, 0.055]} />
            <meshStandardMaterial color="#b45309" roughness={0.62} />
          </mesh>
          {[-2.85, -1.9, -0.95, 0, 0.95, 1.9, 2.85].map((x) => (
            <mesh key={`${x}-${z}`} position={[x, -0.04, z]} castShadow receiveShadow>
              <boxGeometry args={[0.075, 0.56, 0.075]} />
              <meshStandardMaterial color="#78350f" roughness={0.65} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function StairBlock({ x, width, height, depth = BRIDGE_WIDTH }: { x: number; width: number; height: number; depth?: number }) {
  return (
    <mesh position={[x, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color="#d9bd88" roughness={0.84} />
    </mesh>
  );
}

function BridgeStairs({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 5) return null;
  const stairWidth = 0.34;
  const leftStart = LEFT_BANK_X + 0.55;
  const rightStart = RIGHT_BANK_X - 0.55;
  const count = 6;
  return (
    <group>
      {Array.from({ length: count }).map((_, index) => {
        const t = index / (count - 1);
        const height = THREE.MathUtils.lerp(0.18, DECK_Y, t);
        return <StairBlock key={`left-${index}`} x={leftStart + index * stairWidth} width={stairWidth + 0.02} height={height} />;
      })}
      {Array.from({ length: count }).map((_, index) => {
        const t = index / (count - 1);
        const height = THREE.MathUtils.lerp(0.18, DECK_Y, t);
        return <StairBlock key={`right-${index}`} x={rightStart - index * stairWidth} width={stairWidth + 0.02} height={height} />;
      })}
      <mesh position={[LEFT_DECK_END - 0.18, DECK_Y - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.1, BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#b7925e" roughness={0.8} />
      </mesh>
      <mesh position={[RIGHT_DECK_END + 0.18, DECK_Y - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.1, BRIDGE_WIDTH]} />
        <meshStandardMaterial color="#b7925e" roughness={0.8} />
      </mesh>
    </group>
  );
}

function Limb({ side = 1, swing, color, upper = false }: { side?: number; swing: number; color: string; upper?: boolean }) {
  return (
    <group position={[0, upper ? 0.42 : 0.12, side * (upper ? 0.16 : 0.09)]} rotation={[0, 0, swing * side]}>
      <mesh position={[0, upper ? -0.15 : -0.17, 0]} castShadow>
        <capsuleGeometry args={[upper ? 0.035 : 0.045, upper ? 0.28 : 0.34, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.58} />
      </mesh>
    </group>
  );
}

function HumanWalker({ active }: { active: boolean }) {
  const person = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!person.current || !active) return;
    const loop = (clock.elapsedTime * 0.105) % 1;
    const { x, y } = walkingPath(loop);
    const bob = Math.abs(Math.sin(clock.elapsedTime * 7.2)) * 0.035;
    const swing = Math.sin(clock.elapsedTime * 7.2) * 0.42;

    person.current.position.set(x, y + bob, 0);
    person.current.rotation.y = Math.PI / 2;

    if (body.current) body.current.rotation.z = Math.sin(clock.elapsedTime * 3.2) * 0.035;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.75;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.75;
  });

  if (!active) return null;
  return (
    <group ref={person} position={[LEFT_BANK_X - 0.35, 0.22, 0]}>
      <mesh position={[0, -0.04, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.22, 24]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.18} />
      </mesh>
      <group ref={body}>
        <group ref={leftLeg} position={[0, 0.3, -0.07]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.36, 6, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.62} />
          </mesh>
          <mesh position={[0.02, -0.39, 0]} castShadow>
            <boxGeometry args={[0.18, 0.055, 0.08]} />
            <meshStandardMaterial color="#111827" roughness={0.65} />
          </mesh>
        </group>
        <group ref={rightLeg} position={[0, 0.3, 0.07]}>
          <mesh position={[0, -0.18, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.36, 6, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.62} />
          </mesh>
          <mesh position={[0.02, -0.39, 0]} castShadow>
            <boxGeometry args={[0.18, 0.055, 0.08]} />
            <meshStandardMaterial color="#111827" roughness={0.65} />
          </mesh>
        </group>
        <mesh position={[0, 0.56, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.42, 8, 16]} />
          <meshStandardMaterial color="#2563eb" roughness={0.5} />
        </mesh>
        <group ref={leftArm} position={[0.01, 0.68, -0.18]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.035, 0.32, 6, 12]} />
            <meshStandardMaterial color="#f2c28b" roughness={0.55} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.01, 0.68, 0.18]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.035, 0.32, 6, 12]} />
            <meshStandardMaterial color="#f2c28b" roughness={0.55} />
          </mesh>
        </group>
        <mesh position={[0, 0.98, 0]} castShadow>
          <sphereGeometry args={[0.15, 20, 20]} />
          <meshStandardMaterial color="#f2c28b" roughness={0.55} />
        </mesh>
        <mesh position={[0.02, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.16, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#111827" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function RealisticBridgeScene({ buildLevel }: { buildLevel: number }) {
  return (
    <>
      <color attach="background" args={["#c7ecff"]} />
      <fog attach="fog" args={["#c7ecff", 9, 16]} />
      <ambientLight intensity={0.64} />
      <hemisphereLight args={["#eff6ff", "#2f7d32", 1.18]} />
      <directionalLight position={[4.8, 7.5, 4.8]} intensity={2.05} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <group rotation={[0, -0.16, 0]}>
        <Environment />
        <SurveyMarkers buildLevel={buildLevel} />
        <BridgeSupports buildLevel={buildLevel} />
        <LongBeams buildLevel={buildLevel} />
        <BridgeDeck buildLevel={buildLevel} />
        <BridgeRails buildLevel={buildLevel} />
        <BridgeStairs buildLevel={buildLevel} />
        <HumanWalker active={buildLevel >= 6} />
      </group>
      <OrbitControls enablePan={false} minDistance={5.5} maxDistance={8.9} maxPolarAngle={Math.PI / 2.35} target={[0, 0.62, 0]} />
    </>
  );
}

function RiveStyleMascot({ buildLevel }: { buildLevel: number }) {
  const message = buildLevel >= 6 ? 'Watch the learner climb, cross and descend!' : buildLevel >= 4 ? 'The bridge is becoming a real crossing.' : 'Build it step by step!';
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

export default function AnimatedRealityLabPageV5() {
  const [buildLevel, setBuildLevel] = useState(0);
  const current = buildSteps[Math.min(buildLevel, buildSteps.length - 1)];
  const progress = Math.round((buildLevel / buildSteps.length) * 100);
  const addStep = () => setBuildLevel((level) => Math.min(buildSteps.length, level + 1));
  const reset = () => setBuildLevel(0);

  return (
    <main className="animated-reality-lab">
      <section className="lab-hero card">
        <div>
          <span className="eyebrow">Separate experiment branch · REALITY V5</span>
          <h1>Animated Reality Lab</h1>
          <p>
            Human crossing test: the learner now climbs the left stairs, walks across the bridge deck and descends on the other bank.
          </p>
        </div>
        <div className="lab-stack">
          <span>React Three Fiber</span>
          <span>Animated human</span>
          <span>Climb</span>
          <span>Cross</span>
          <span>Descend</span>
        </div>
      </section>

      <section className="lab-board card">
        <div className="lab-side-panel">
          <div className="lab-score-row">
            <span>🪙 {buildLevel * 15}</span>
            <span>⭐ {buildLevel >= 6 ? 3 : buildLevel >= 5 ? 1 : 0}</span>
            <span>⚡ {buildLevel * 10} XP</span>
          </div>
          <div className="lab-progress"><span style={{ width: `${progress}%` }} /></div>
          <h2>{buildLevel >= buildSteps.length ? 'Human test' : current.label}</h2>
          <p className="lab-compact-copy">{buildLevel >= buildSteps.length ? 'The child climbs, crosses and descends safely.' : current.note}</p>
          <div className="lab-action-row">
            <button className="btn btn-primary" onClick={addStep} disabled={buildLevel >= buildSteps.length}>Correct answer → Build</button>
            <button className="btn btn-secondary" onClick={reset}>Reset</button>
          </div>
          <div className="reward-pop-card" key={buildLevel}>{buildLevel === 0 ? 'Rewards appear here' : `${buildSteps[buildLevel - 1]?.reward} earned`}</div>
          <RiveStyleMascot buildLevel={buildLevel} />
        </div>

        <div className="lab-viewport">
          <span className="lab-version-badge">REALITY V5 · HUMAN CLIMBS · CROSSES · DESCENDS</span>
          <Canvas shadows camera={{ position: [6.2, 4.8, 5.9], fov: 42 }}>
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
