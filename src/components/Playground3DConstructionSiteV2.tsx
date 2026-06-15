import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Playground3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const stageNotes = [
  'Answer the first question to measure the school field.',
  'Boundary pegs and measuring ropes are now in place.',
  'The safe play zone is marked inside the field.',
  'Soft safety mats have been laid in the play zone.',
  'The swing set is installed with children ready to swing safely.',
  'The slide is complete: children climb the ladder on one side and slide down the opposite side.',
  'Playground set complete. Test the playground safely.'
];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.78} />
    </mesh>
  );
}

function Cylinder({ position, radius, height, color, rotation = [0, 0, 0] }: { position: [number, number, number]; radius: number; height: number; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 20]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function SchoolBuilding() {
  return (
    <group position={[-5.6, 0, -3.4]}>
      <Box position={[0, 0.55, 0]} scale={[3, 1.1, 1.7]} color="#fde68a" />
      <mesh position={[0, 1.25, 0]} castShadow>
        <coneGeometry args={[2.05, 0.9, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} />
      </mesh>
      <Box position={[0, 0.33, 0.88]} scale={[0.45, 0.65, 0.06]} color="#7c2d12" />
      <Box position={[-0.82, 0.65, 0.9]} scale={[0.5, 0.42, 0.05]} color="#bae6fd" />
      <Box position={[0.82, 0.65, 0.9]} scale={[0.5, 0.42, 0.05]} color="#bae6fd" />
      <Text position={[0, 1.45, 0.96]} fontSize={0.26} color="#78350f" anchorX="center" anchorY="middle">
        SCHOOL
      </Text>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.5, 0]} radius={0.12} height={1} color="#92400e" />
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.48, 18, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.85} />
      </mesh>
      <mesh position={[0.26, 1.0, 0.18]} castShadow>
        <sphereGeometry args={[0.34, 18, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.85} />
      </mesh>
    </group>
  );
}

function BoundaryPegs() {
  const points: [number, number][] = [[-3.6, -2.1], [3.6, -2.1], [3.6, 2.1], [-3.6, 2.1]];
  return (
    <group>
      {points.map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <Cylinder position={[x, 0.28, z]} radius={0.07} height={0.55} color="#ef4444" />
          <mesh position={[x, 0.6, z]} castShadow>
            <sphereGeometry args={[0.16, 16, 12]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        </group>
      ))}
      <Box position={[0, 0.18, -2.1]} scale={[7.2, 0.05, 0.06]} color="#f97316" />
      <Box position={[0, 0.18, 2.1]} scale={[7.2, 0.05, 0.06]} color="#f97316" />
      <Box position={[-3.6, 0.18, 0]} scale={[0.06, 0.05, 4.2]} color="#f97316" />
      <Box position={[3.6, 0.18, 0]} scale={[0.06, 0.05, 4.2]} color="#f97316" />
      <Text position={[0, 0.5, -2.55]} fontSize={0.23} color="#854d0e" anchorX="center">
        12m × 8m boundary measured
      </Text>
    </group>
  );
}

function SafetyZone() {
  return (
    <group>
      <Box position={[0, 0.04, 0]} scale={[5.1, 0.04, 2.75]} color="#d9f99d" />
      <Box position={[0, 0.12, -1.37]} scale={[5.05, 0.035, 0.05]} color="#2563eb" />
      <Box position={[0, 0.12, 1.37]} scale={[5.05, 0.035, 0.05]} color="#2563eb" />
      <Box position={[-2.52, 0.12, 0]} scale={[0.05, 0.035, 2.75]} color="#2563eb" />
      <Box position={[2.52, 0.12, 0]} scale={[0.05, 0.035, 2.75]} color="#2563eb" />
      <Text position={[0, 0.42, 1.7]} fontSize={0.22} color="#1e3a8a" anchorX="center">
        4m safe play zone
      </Text>
    </group>
  );
}

function SafetyMats() {
  const colors = ['#fde047', '#93c5fd', '#86efac', '#fca5a5'];
  return (
    <group>
      {Array.from({ length: 8 }, (_, index) => {
        const x = -1.55 + (index % 4) * 1.03;
        const z = -0.58 + Math.floor(index / 4) * 1.08;
        return <Box key={index} position={[x, 0.12, z]} scale={[0.96, 0.06, 0.96]} color={colors[index % colors.length]} />;
      })}
      <Text position={[0, 0.45, -1.65]} fontSize={0.22} color="#166534" anchorX="center">
        8 soft safety mats
      </Text>
    </group>
  );
}

function ChildFigure({ color = '#2563eb', sitting = false }: { color?: string; sitting?: boolean }) {
  const skin = '#8b5a2b';
  return (
    <group scale={sitting ? [0.72, 0.72, 0.72] : [1, 1, 1]}>
      <mesh position={[0, sitting ? 0.72 : 0.82, 0]} castShadow>
        <sphereGeometry args={[0.17, 20, 16]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[0, sitting ? 0.9 : 1.0, -0.02]} castShadow>
        <sphereGeometry args={[0.18, 18, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Box position={[0, sitting ? 0.43 : 0.52, 0]} scale={[0.34, 0.55, 0.2]} color={color} />
      <Box position={[-0.2, sitting ? 0.45 : 0.5, 0]} scale={[0.08, 0.46, 0.08]} color={skin} />
      <Box position={[0.2, sitting ? 0.45 : 0.5, 0]} scale={[0.08, 0.46, 0.08]} color={skin} />
      <Box position={[-0.1, sitting ? 0.08 : 0.12, sitting ? 0.12 : 0]} scale={[0.1, 0.48, 0.1]} color="#1e3a8a" rotation={sitting ? [0.75, 0, 0] : [0, 0, 0]} />
      <Box position={[0.1, sitting ? 0.08 : 0.12, sitting ? 0.12 : 0]} scale={[0.1, 0.48, 0.1]} color="#1e3a8a" rotation={sitting ? [0.75, 0, 0] : [0, 0, 0]} />
      <Box position={[-0.1, sitting ? -0.18 : -0.17, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
      <Box position={[0.1, sitting ? -0.18 : -0.17, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
    </group>
  );
}

function SwingSeat({ x, color, speed, offset }: { x: number; color: string; speed: number; offset: number }) {
  const swingRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (swingRef.current) swingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed + offset) * 0.22;
  });

  return (
    <group ref={swingRef} position={[x, 1.2, 0]}>
      <Box position={[-0.14, 0.15, 0]} scale={[0.035, 1.24, 0.035]} color="#111827" />
      <Box position={[0.14, 0.15, 0]} scale={[0.035, 1.24, 0.035]} color="#111827" />
      <Box position={[0, -0.52, 0]} scale={[0.48, 0.08, 0.34]} color={color} />
      <group position={[0, -0.28, 0.02]}>
        <ChildFigure color={color} sitting />
      </group>
    </group>
  );
}

function SwingSet() {
  return (
    <group position={[-1.85, 0.12, 0.75]}>
      <Cylinder position={[-1.1, 1.0, 0]} radius={0.06} height={2} color="#475569" />
      <Cylinder position={[1.1, 1.0, 0]} radius={0.06} height={2} color="#475569" />
      <Box position={[0, 2.02, 0]} scale={[2.55, 0.12, 0.12]} color="#334155" />
      <SwingSeat x={-0.7} color="#ef4444" speed={1.55} offset={0} />
      <SwingSeat x={0} color="#3b82f6" speed={1.75} offset={1.2} />
      <SwingSeat x={0.7} color="#f59e0b" speed={1.45} offset={2.1} />
      <Text position={[0, 2.42, 0]} fontSize={0.18} color="#0f172a" anchorX="center">
        children swinging safely
      </Text>
    </group>
  );
}

function SlideSet({ testing }: { testing: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!testing) setProgress(0);
  }, [testing]);
  useFrame((_, delta) => {
    if (testing) setProgress((value) => (value >= 1 ? 1 : value + delta * 0.16));
  });

  const p = progress;
  const climbing = p < 0.35;
  const sliding = p >= 0.35 && p < 0.78;
  const landing = p >= 0.78;
  const childX = climbing ? -0.72 : sliding ? -0.45 + (p - 0.35) / 0.43 * 2.35 : 1.95;
  const childY = climbing ? 0.15 + p / 0.35 * 1.28 : sliding ? 1.38 - (p - 0.35) / 0.43 * 1.08 : 0.2;
  const childZ = climbing ? 0.58 : sliding ? -0.18 : -0.32;

  return (
    <group position={[1.65, 0.12, 0.55]}>
      <Box position={[0, 0.85, 0]} scale={[0.86, 1.28, 0.86]} color="#2563eb" />
      <Box position={[0, 1.52, 0]} scale={[1.05, 0.16, 1.0]} color="#1d4ed8" />
      <Text position={[0, 1.78, 0.06]} fontSize={0.16} color="#1e3a8a" anchorX="center">
        climb here → slide down
      </Text>

      {/* Ladder is on the opposite side of the slide chute. */}
      <Box position={[-0.72, 0.76, 0.52]} scale={[0.12, 1.36, 0.08]} color="#92400e" />
      <Box position={[-0.25, 0.76, 0.52]} scale={[0.12, 1.36, 0.08]} color="#92400e" />
      {Array.from({ length: 5 }, (_, index) => (
        <Box key={index} position={[-0.48, 0.25 + index * 0.24, 0.55]} scale={[0.62, 0.06, 0.08]} color="#fef3c7" />
      ))}

      {/* Slide extends away from the ladder, on the other side of the platform. */}
      <Box position={[0.95, 0.42, -0.18]} scale={[1.9, 0.16, 0.56]} color="#ef4444" rotation={[0, 0, -0.5]} />
      <Box position={[0.96, 0.48, -0.47]} scale={[1.85, 0.06, 0.08]} color="#b91c1c" rotation={[0, 0, -0.5]} />
      <Box position={[0.96, 0.48, 0.11]} scale={[1.85, 0.06, 0.08]} color="#b91c1c" rotation={[0, 0, -0.5]} />
      <Box position={[1.9, 0.16, -0.18]} scale={[0.85, 0.08, 0.75]} color="#fef08a" />

      <group position={[childX, childY, childZ]} rotation={[0, sliding ? -0.3 : 0.5, 0]}>
        <ChildFigure color={landing ? '#16a34a' : '#a855f7'} sitting={sliding} />
      </group>
      <Text position={[0.35, 1.95, 0.1]} fontSize={0.18} color="#7f1d1d" anchorX="center">
        ladder opposite slide
      </Text>
    </group>
  );
}

function Fence() {
  const xs = [-3.8, -2.7, -1.6, -0.5, 0.6, 1.7, 2.8, 3.8];
  return (
    <group>
      {xs.map((x) => <Cylinder key={`front-${x}`} position={[x, 0.46, 2.42]} radius={0.055} height={0.9} color="#78350f" />)}
      {xs.map((x) => <Cylinder key={`back-${x}`} position={[x, 0.46, -2.42]} radius={0.055} height={0.9} color="#78350f" />)}
      <Box position={[0, 0.72, 2.42]} scale={[7.6, 0.08, 0.08]} color="#92400e" />
      <Box position={[0, 0.72, -2.42]} scale={[7.6, 0.08, 0.08]} color="#92400e" />
      <Box position={[-4.02, 0.72, 0]} scale={[0.08, 0.08, 4.85]} color="#92400e" />
      <Box position={[4.02, 0.72, 0]} scale={[0.08, 0.08, 3.05]} color="#92400e" />
      <Text position={[0, 1.05, 2.75]} fontSize={0.21} color="#78350f" anchorX="center">
        36m fence with safe gate
      </Text>
    </group>
  );
}

function TestingChildren({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) setProgress(0);
  }, [active]);
  useFrame((_, delta) => {
    if (active) setProgress((value) => Math.min(1, value + delta * 0.14));
  });

  const children = [
    { delay: 0, z: -0.68, color: '#dc2626' },
    { delay: -0.18, z: -0.38, color: '#2563eb' },
    { delay: -0.36, z: -0.06, color: '#16a34a' }
  ];

  return (
    <group>
      {children.map((child, index) => {
        const p = Math.max(0, Math.min(1, progress + child.delay));
        const x = -3.2 + p * 5.9;
        const y = 0.16 + Math.sin(p * Math.PI) * 0.14;
        return <group key={index} position={[x, y, child.z]} rotation={[0, -0.35 + p * 0.7, 0]}><ChildFigure color={child.color} /></group>;
      })}
    </group>
  );
}

function PlaygroundScene({ stage, testing }: { stage: number; testing: boolean }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 8, 6]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <Sky sunPosition={[10, 12, 4]} turbidity={4} rayleigh={0.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      <Box position={[0, 0.025, 0]} scale={[8.4, 0.05, 5.0]} color="#a3e635" />
      <SchoolBuilding />
      <Tree position={[-6.1, 0, 2.4]} />
      <Tree position={[5.9, 0, -2.8]} />
      <Tree position={[6.2, 0, 2.8]} />
      <Box position={[5.2, 0.14, -3.9]} scale={[1.6, 0.28, 0.35]} color="#92400e" />
      <Box position={[4.65, 0.38, -3.9]} scale={[0.4, 0.32, 0.35]} color="#64748b" />
      {stage >= 1 && <BoundaryPegs />}
      {stage >= 2 && <SafetyZone />}
      {stage >= 3 && <SafetyMats />}
      {stage >= 4 && <SwingSet />}
      {stage >= 5 && <SlideSet testing={testing} />}
      {stage >= 6 && <Fence />}
      {stage < 6 && (
        <group>
          <group position={[-4.4, 0.16, 2.4]}><ChildFigure color="#2563eb" /></group>
          <group position={[-4.0, 0.16, 2.1]}><ChildFigure color="#dc2626" /></group>
        </group>
      )}
      {stage >= 6 && <TestingChildren active={testing} />}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.5, 0]} />
    </>
  );
}

export default function Playground3DConstructionSiteV2({ buildStage, feedback }: Playground3DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : stageNotes[stage];

  return (
    <section className="playground3d-shell" aria-label={`3D school playground builder stage ${stage} of 6`}>
      <div className="playground3d-header">
        <div>
          <p className="playground3d-eyebrow">3D Playground Builder</p>
          <h3>Build a Safe School Playground</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready for safe test' : 'Solve to build'}</strong>
      </div>

      <div className="playground3d-canvas" role="img" aria-label="Interactive 3D playground construction scene">
        <Canvas shadows camera={{ position: [5.8, 5.0, 6.6], fov: 42 }}>
          <PlaygroundScene stage={stage} testing={testing} />
        </Canvas>
      </div>

      <div className="playground3d-controls">
        <p>{visibleFeedback}</p>
        {stage >= 6 && (
          <button type="button" onClick={() => setTesting((value) => !value)}>
            {testing ? 'Reset Playground Test' : 'Test Playground Safely'}
          </button>
        )}
      </div>

      <style>{`
        .playground3d-shell { width: 100%; min-height: 520px; border-radius: 26px; background: linear-gradient(135deg, #eff6ff, #ecfdf5 45%, #fefce8); border: 1px solid rgba(148, 163, 184, 0.28); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .playground3d-header, .playground3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.84); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .playground3d-eyebrow { margin: 0; color: #2563eb; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .playground3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .playground3d-header span { color: #475569; font-weight: 800; }
        .playground3d-header strong { background: #dbeafe; color: #1d4ed8; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .playground3d-header strong.ready { background: #dcfce7; color: #166534; }
        .playground3d-canvas { height: clamp(420px, 55vh, 620px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(37, 99, 235, 0.18); }
        .playground3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .playground3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .playground3d-shell { padding: 0.75rem; min-height: 460px; } .playground3d-header, .playground3d-controls { align-items: flex-start; flex-direction: column; } .playground3d-canvas { height: 430px; } }
      `}</style>
    </section>
  );
}
