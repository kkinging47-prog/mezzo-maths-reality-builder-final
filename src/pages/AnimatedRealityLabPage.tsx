import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const DECK_Y = 0.58;
const BANK_Y = 0.22;

const buildSteps = [
  { label: 'Survey', reward: '+5 XP', note: 'Measure the river and mark both banks' },
  { label: 'Pillars', reward: '+15 coins', note: 'Raise strong support posts from the riverbed' },
  { label: 'Planks', reward: '+20 coins', note: 'Lay wooden planks across the stream' },
  { label: 'Rails', reward: '+10 XP', note: 'Add safe side rails for children' },
  { label: 'Stairs', reward: '+1 star', note: 'Connect the stairs neatly to both bridge ends' },
  { label: 'Test', reward: '+2 stars', note: 'Let a learner cross the finished bridge safely' },
];

function FloatingCoin({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + delay;
    ref.current.rotation.y = t * 2.4;
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.08;
  });

  return (
    <mesh ref={ref} position={position} castShadow>
      <cylinderGeometry args={[0.14, 0.14, 0.04, 32]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.2} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.34, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.68, 10]} />
        <meshStandardMaterial color="#854d0e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.83, 0]} castShadow>
        <coneGeometry args={[0.4, 0.88, 14]} />
        <meshStandardMaterial color="#166534" roughness={0.72} />
      </mesh>
      <mesh position={[0.08, 1.05, 0.04]} castShadow>
        <coneGeometry args={[0.3, 0.68, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.72} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} rotation={[0.2, 0.35, -0.12]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.18, 0]} />
      <meshStandardMaterial color="#64748b" roughness={0.9} />
    </mesh>
  );
}

function GrassTuft({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-0.08, 0, 0.08].map((x, index) => (
        <mesh key={index} position={[x, 0.13, 0]} rotation={[0, 0, x * 4]} castShadow>
          <coneGeometry args={[0.035, 0.28, 6]} />
          <meshStandardMaterial color={index === 1 ? '#16a34a' : '#15803d'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function WaterRipples() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.x = Math.sin(clock.elapsedTime * 0.8) * 0.12;
    groupRef.current.children.forEach((child, index) => {
      child.position.x += Math.sin(clock.elapsedTime * 1.4 + index) * 0.0018;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0.048, 0]}>
      {[-0.62, -0.25, 0.12, 0.48, 0.78].map((z, index) => (
        <mesh key={z} position={[index % 2 ? -0.35 : 0.4, 0, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.8 - index * 0.35, 0.035]} />
          <meshStandardMaterial color="#dffcff" transparent opacity={0.55} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function SurveyMarkers({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 1) return null;

  return (
    <group>
      {[-3.45, 3.45].map((x) => (
        <group key={x} position={[x, BANK_Y + 0.18, -1.25]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[0.38, 0.16, 0.035]} />
            <meshStandardMaterial color="#fef3c7" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.08, -1.22]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.7, 0.035]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

function StepBlock({ x, height, width = 0.34 }: { x: number; height: number; width?: number }) {
  return (
    <mesh position={[x, BANK_Y + height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, 1.26]} />
      <meshStandardMaterial color="#d6a86c" roughness={0.78} />
    </mesh>
  );
}

function EntryStairs({ side }: { side: 'left' | 'right' }) {
  const direction = side === 'left' ? 1 : -1;
  const outerX = side === 'left' ? -4.32 : 4.32;
  const stepHeights = [0.12, 0.22, 0.32, 0.42];

  return (
    <group>
      {stepHeights.map((height, index) => (
        <StepBlock key={`${side}-${height}`} x={outerX + direction * index * 0.36} height={height} />
      ))}
      <mesh position={[outerX + direction * 1.1, BANK_Y + 0.235, side === 'left' ? -0.74 : 0.74]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.48, 8]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
    </group>
  );
}

function BridgeDeck({ buildLevel }: { buildLevel: number }) {
  const visiblePlanks = Math.max(0, Math.min(10, buildLevel >= 3 ? 10 : buildLevel >= 2 ? 5 : 0));

  return (
    <group position={[0, DECK_Y, 0]}>
      {visiblePlanks > 0 && (
        <>
          <mesh position={[0, -0.08, -0.55]} castShadow receiveShadow>
            <boxGeometry args={[6.85, 0.12, 0.14]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.08, 0.55]} castShadow receiveShadow>
            <boxGeometry args={[6.85, 0.12, 0.14]} />
            <meshStandardMaterial color="#7c2d12" roughness={0.62} />
          </mesh>
        </>
      )}

      {Array.from({ length: visiblePlanks }).map((_, index) => {
        const x = -3.05 + index * 0.68;
        return (
          <mesh key={index} position={[x, 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.56, 0.14, 1.38]} />
            <meshStandardMaterial color={index % 2 ? '#a16207' : '#c47c24'} roughness={0.68} />
          </mesh>
        );
      })}
    </group>
  );
}

function BridgeSupports({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 2) return null;

  return (
    <group>
      {[-2.85, -1.4, 0, 1.4, 2.85].map((x, index) => (
        <group key={x}>
          {[-0.58, 0.58].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0.31, z]} castShadow receiveShadow>
              <cylinderGeometry args={[0.11, 0.16, 0.76, 14]} />
              <meshStandardMaterial color={index === 2 ? '#6b7280' : '#8b5a2b'} roughness={0.78} />
            </mesh>
          ))}
          <mesh position={[x, 0.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.16, 0.13, 1.42]} />
            <meshStandardMaterial color="#78350f" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BridgeRails({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 4) return null;

  return (
    <group position={[0, DECK_Y + 0.34, 0]}>
      {[-0.84, 0.84].map((z) => (
        <group key={z}>
          <mesh position={[0, 0.15, z]} castShadow>
            <boxGeometry args={[6.75, 0.09, 0.08]} />
            <meshStandardMaterial color="#92400e" roughness={0.55} />
          </mesh>
          <mesh position={[0, -0.12, z]} castShadow>
            <boxGeometry args={[6.55, 0.07, 0.065]} />
            <meshStandardMaterial color="#b45309" roughness={0.6} />
          </mesh>
        </group>
      ))}
      {[-3.18, -2.05, -0.92, 0.22, 1.36, 2.5, 3.2].map((x) =>
        [-0.84, 0.84].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.04, z]} castShadow>
            <boxGeometry args={[0.08, 0.58, 0.08]} />
            <meshStandardMaterial color="#78350f" roughness={0.65} />
          </mesh>
        )),
      )}
    </group>
  );
}

function TestChild({ active }: { active: boolean }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current || !active) return;
    const t = (Math.sin(clock.elapsedTime * 0.78) + 1) / 2;
    ref.current.position.x = -3.25 + t * 6.5;
    ref.current.position.y = DECK_Y + 0.48 + Math.sin(clock.elapsedTime * 5) * 0.025;
    ref.current.rotation.y = t > 0.5 ? Math.PI / 2 : -Math.PI / 2;
  });

  if (!active) return null;

  return (
    <group ref={ref} position={[-3.25, DECK_Y + 0.48, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.15, 0.42, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.17, 18, 18]} />
        <meshStandardMaterial color="#f2c28b" />
      </mesh>
      <mesh position={[0, 0.67, 0]} castShadow>
        <sphereGeometry args={[0.18, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function EnvironmentDetails() {
  const grassPositions: [number, number, number][] = [
    [-4.7, 0.05, -2.1], [-3.9, 0.05, 1.72], [-2.2, 0.05, -2.28], [2.35, 0.05, 2.2], [3.8, 0.05, -1.75], [4.7, 0.05, 1.2],
  ];

  return (
    <group>
      <Tree position={[-4.35, 0.05, -1.9]} scale={0.96} />
      <Tree position={[4.35, 0.05, 1.9]} scale={1.08} />
      <Tree position={[-3.65, 0.05, 2.15]} scale={0.76} />
      <Tree position={[3.55, 0.05, -2.18]} scale={0.8} />
      {grassPositions.map((position, index) => <GrassTuft key={index} position={position} scale={index % 2 ? 0.8 : 1} />)}
      <Rock position={[-1.7, 0.08, -0.95]} />
      <Rock position={[1.8, 0.08, 0.98]} scale={0.8} />
      <Rock position={[0.4, 0.07, -1.02]} scale={0.68} />
      <mesh position={[-4.85, 0.4, 0.9]} rotation={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.76, 0.46, 0.08]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.65} />
      </mesh>
      <mesh position={[-4.85, 0.16, 0.9]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.48, 8]} />
        <meshStandardMaterial color="#854d0e" />
      </mesh>
    </group>
  );
}

function LabBridgeScene({ buildLevel }: { buildLevel: number }) {
  const riverRef = useRef<THREE.Mesh>(null);
  const waterMaterial = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#1fb6d7', transparent: true, opacity: 0.78, roughness: 0.18, metalness: 0.02, transmission: 0.1 }),
    [],
  );

  useFrame(({ clock }) => {
    if (!riverRef.current) return;
    riverRef.current.position.z = Math.sin(clock.elapsedTime * 1.2) * 0.035;
  });

  return (
    <>
      <color attach="background" args={["#bde8ff"]} />
      <fog attach="fog" args={["#dbeafe", 9, 18]} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[4.4, 7.2, 3.6]} intensity={2.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <hemisphereLight args={["#e0f2fe", "#14532d", 1.05]} />

      <group rotation={[0, -0.1, 0]}>
        <mesh receiveShadow position={[0, -0.045, 0]}>
          <boxGeometry args={[10.3, 0.09, 5.8]} />
          <meshStandardMaterial color="#5ccf68" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9.4, 2.08, 32, 6]} />
          <meshStandardMaterial color="#0e7490" roughness={0.52} />
        </mesh>
        <mesh ref={riverRef} position={[0, 0.052, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.9, 1.78, 42, 8]} />
          <primitive object={waterMaterial} attach="material" />
        </mesh>
        <WaterRipples />

        <mesh position={[-4.08, BANK_Y / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.75, BANK_Y, 2.75]} />
          <meshStandardMaterial color="#7ec850" roughness={0.88} />
        </mesh>
        <mesh position={[4.08, BANK_Y / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[1.75, BANK_Y, 2.75]} />
          <meshStandardMaterial color="#7ec850" roughness={0.88} />
        </mesh>

        <mesh position={[-3.45, BANK_Y + 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.12, 1.48]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.76} />
        </mesh>
        <mesh position={[3.45, BANK_Y + 0.06, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.12, 1.48]} />
          <meshStandardMaterial color="#a3a3a3" roughness={0.76} />
        </mesh>

        <SurveyMarkers buildLevel={buildLevel} />
        <BridgeSupports buildLevel={buildLevel} />
        <BridgeDeck buildLevel={buildLevel} />
        <BridgeRails buildLevel={buildLevel} />
        {buildLevel >= 5 && <EntryStairs side="left" />}
        {buildLevel >= 5 && <EntryStairs side="right" />}
        <TestChild active={buildLevel >= 6} />

        {buildLevel >= 1 && <FloatingCoin position={[-3.25, 1.42, -1.15]} />}
        {buildLevel >= 3 && <FloatingCoin position={[0, 1.55, -1.25]} delay={1.1} />}
        {buildLevel >= 5 && <FloatingCoin position={[3.25, 1.42, -1.15]} delay={2.2} />}
        <EnvironmentDetails />
      </group>

      <OrbitControls enablePan={false} minDistance={6.4} maxDistance={10.4} maxPolarAngle={Math.PI / 2.18} target={[0, 0.45, 0]} />
    </>
  );
}

function RiveStyleMascot({ buildLevel }: { buildLevel: number }) {
  const message = buildLevel >= 6 ? 'Great job! The bridge is safe.' : buildLevel >= 3 ? 'Keep building, champion!' : 'Answer and watch it build!';

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
          <span className="eyebrow">Separate experiment branch</span>
          <h1>Animated Reality Lab</h1>
          <p>
            A safer, more realistic test space for the Mezzo Maths bridge: aligned stairs, stronger 3D materials,
            river movement, banks, rocks, trees, rewards, and a Spline-ready homepage slot.
          </p>
        </div>
        <div className="lab-stack">
          <span>React Three Fiber</span>
          <span>Three.js</span>
          <span>Blender-ready</span>
          <span>Rive-style rewards</span>
          <span>Spline slot</span>
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
            {buildLevel >= buildSteps.length
              ? 'The learner can now cross the bridge safely.'
              : `${current.note}. Click build to simulate a correct answer.`}
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
          <div className="lab-viewport-label">Live 3D build preview</div>
          <Canvas shadows dpr={[1, 1.65]} camera={{ position: [6.6, 4.7, 6.2], fov: 42 }}>
            <Suspense fallback={null}>
              <LabBridgeScene buildLevel={buildLevel} />
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
