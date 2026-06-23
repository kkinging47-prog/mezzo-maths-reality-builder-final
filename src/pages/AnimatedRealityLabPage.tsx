import { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const buildSteps = [
  { label: 'Survey', reward: '+5 XP', note: 'Measure river width' },
  { label: 'Pillars', reward: '+15 coins', note: 'Raise supports' },
  { label: 'Planks', reward: '+20 coins', note: 'Add bridge deck' },
  { label: 'Rails', reward: '+10 XP', note: 'Make it safe' },
  { label: 'Stairs', reward: '+1 star', note: 'Correct entry steps' },
  { label: 'Test', reward: '+2 stars', note: 'Cross safely' },
];

function FloatingCoin({ position, delay = 0 }: { position: [number, number, number]; delay?: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime + delay;
    ref.current.rotation.y = t * 2;
    ref.current.position.y = position[1] + Math.sin(t * 2) * 0.08;
  });

  return (
    <mesh ref={ref} position={position}>
      <cylinderGeometry args={[0.13, 0.13, 0.035, 28]} />
      <meshStandardMaterial color="#fbbf24" metalness={0.4} roughness={0.28} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.65, 10]} />
        <meshStandardMaterial color="#854d0e" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.38, 0.85, 12]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
    </group>
  );
}

function StepBlock({ x, height, width = 0.36 }: { x: number; height: number; width?: number }) {
  return (
    <mesh position={[x, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, height, 1.15]} />
      <meshStandardMaterial color="#d6a86c" roughness={0.65} />
    </mesh>
  );
}

function EntryStairs({ side }: { side: 'left' | 'right' }) {
  const direction = side === 'left' ? 1 : -1;
  const startX = side === 'left' ? -4.08 : 4.08;
  const steps = [0.1, 0.18, 0.26, 0.34];

  return (
    <group>
      {steps.map((height, index) => (
        <StepBlock key={`${side}-${height}`} x={startX + direction * index * 0.36} height={height} />
      ))}
    </group>
  );
}

function BridgeDeck({ buildLevel }: { buildLevel: number }) {
  const visiblePlanks = Math.max(0, Math.min(8, buildLevel >= 3 ? 8 : buildLevel >= 2 ? 4 : 0));

  return (
    <group position={[0, 0.48, 0]}>
      {Array.from({ length: visiblePlanks }).map((_, index) => {
        const x = -2.8 + index * 0.8;
        return (
          <mesh key={index} position={[x, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.68, 0.13, 1.35]} />
            <meshStandardMaterial color={index % 2 ? '#b7791f' : '#d99a32'} roughness={0.55} />
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
      {[-2.7, -1.35, 0, 1.35, 2.7].map((x, index) => (
        <group key={x}>
          <mesh position={[x, 0.28, -0.55]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.65, 12]} />
            <meshStandardMaterial color={index === 2 ? '#64748b' : '#8b5a2b'} />
          </mesh>
          <mesh position={[x, 0.28, 0.55]} castShadow receiveShadow>
            <cylinderGeometry args={[0.1, 0.13, 0.65, 12]} />
            <meshStandardMaterial color={index === 2 ? '#64748b' : '#8b5a2b'} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BridgeRails({ buildLevel }: { buildLevel: number }) {
  if (buildLevel < 4) return null;

  return (
    <group position={[0, 0.86, 0]}>
      {[-0.82, 0.82].map((z) => (
        <mesh key={z} position={[0, 0, z]} castShadow>
          <boxGeometry args={[6.2, 0.09, 0.08]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}
      {[-2.9, -1.7, -0.5, 0.7, 1.9, 3.1].map((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.18, z]} castShadow>
            <boxGeometry args={[0.08, 0.42, 0.08]} />
            <meshStandardMaterial color="#78350f" />
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
    const t = (Math.sin(clock.elapsedTime * 0.8) + 1) / 2;
    ref.current.position.x = -3 + t * 6;
    ref.current.position.y = 0.96 + Math.sin(clock.elapsedTime * 5) * 0.025;
  });

  if (!active) return null;

  return (
    <group ref={ref} position={[-3, 0.96, 0]}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.36, 8, 16]} />
        <meshStandardMaterial color="#2563eb" />
      </mesh>
      <mesh position={[0, 0.68, 0]} castShadow>
        <sphereGeometry args={[0.17, 18, 18]} />
        <meshStandardMaterial color="#f2c28b" />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.19, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function LabBridgeScene({ buildLevel }: { buildLevel: number }) {
  const riverRef = useRef<THREE.Mesh>(null);
  const glowMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#22d3ee', transparent: true, opacity: 0.76 }), []);

  useFrame(({ clock }) => {
    if (!riverRef.current) return;
    riverRef.current.position.z = Math.sin(clock.elapsedTime * 1.4) * 0.04;
  });

  return (
    <>
      <color attach="background" args={["#bde8ff"]} />
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 6, 3]} intensity={1.8} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <hemisphereLight args={["#e0f2fe", "#14532d", 1.1]} />

      <group rotation={[0, -0.18, 0]}>
        <mesh receiveShadow position={[0, -0.03, 0]}>
          <boxGeometry args={[9.5, 0.08, 5.3]} />
          <meshStandardMaterial color="#4ade80" roughness={0.85} />
        </mesh>

        <mesh ref={riverRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[8.9, 1.85, 32, 4]} />
          <primitive object={glowMaterial} attach="material" />
        </mesh>

        <mesh position={[-4.2, 0.12, 0]} receiveShadow>
          <boxGeometry args={[1.2, 0.25, 2.5]} />
          <meshStandardMaterial color="#84cc16" />
        </mesh>
        <mesh position={[4.2, 0.12, 0]} receiveShadow>
          <boxGeometry args={[1.2, 0.25, 2.5]} />
          <meshStandardMaterial color="#84cc16" />
        </mesh>

        <BridgeSupports buildLevel={buildLevel} />
        <BridgeDeck buildLevel={buildLevel} />
        <BridgeRails buildLevel={buildLevel} />
        {buildLevel >= 5 && <EntryStairs side="left" />}
        {buildLevel >= 5 && <EntryStairs side="right" />}
        <TestChild active={buildLevel >= 6} />

        {buildLevel >= 1 && <FloatingCoin position={[-3.25, 1.35, -1.15]} />}
        {buildLevel >= 3 && <FloatingCoin position={[0, 1.45, -1.25]} delay={1.1} />}
        {buildLevel >= 5 && <FloatingCoin position={[3.25, 1.35, -1.15]} delay={2.2} />}

        <Tree position={[-4.2, 0.05, -1.9]} scale={0.9} />
        <Tree position={[4.3, 0.05, 1.9]} scale={1.05} />
        <Tree position={[-3.5, 0.05, 2.05]} scale={0.72} />
        <Tree position={[3.4, 0.05, -2.1]} scale={0.78} />
      </group>

      <OrbitControls enablePan={false} minDistance={6.5} maxDistance={10} maxPolarAngle={Math.PI / 2.25} />
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
            A safe test space for the new Mezzo Maths 3D style: React Three Fiber for the bridge, Blender-ready model slots,
            Rive-style rewards, and a Spline-ready homepage panel.
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
              ? 'The child can now test the bridge safely.'
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
          <Canvas shadows camera={{ position: [6.8, 5.2, 6.8], fov: 43 }}>
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
