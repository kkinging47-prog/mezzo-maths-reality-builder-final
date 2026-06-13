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
  'The swing set is installed and ready.',
  'The slide, ladder and climbing platform are ready.',
  'Playground set complete. Test the playground safely.'
];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.78} />
    </mesh>
  );
}

function Cylinder({ position, radius, height, color }: { position: [number, number, number]; radius: number; height: number; color: string }) {
  return (
    <mesh position={position} castShadow receiveShadow>
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
      {points.map(([x, z], index) => (
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
      <Box position={[0, 0.12, 0]} scale={[5.05, 0.035, 0.05]} color="#2563eb" />
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

function SwingSet() {
  const swingRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (swingRef.current) swingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.6) * 0.16;
  });

  return (
    <group position={[-1.65, 0.12, 0.65]}>
      <Cylinder position={[-1.1, 1.0, 0]} radius={0.06} height={2} color="#475569" />
      <Cylinder position={[1.1, 1.0, 0]} radius={0.06} height={2} color="#475569" />
      <Box position={[0, 2.02, 0]} scale={[2.55, 0.12, 0.12]} color="#334155" />
      {[-0.7, 0, 0.7].map((x, index) => (
        <group key={x} ref={index === 1 ? swingRef : undefined} position={[x, 1.2, 0]}>
          <Box position={[-0.14, 0.15, 0]} scale={[0.035, 1.24, 0.035]} color="#111827" />
          <Box position={[0.14, 0.15, 0]} scale={[0.035, 1.24, 0.035]} color="#111827" />
          <Box position={[0, -0.52, 0]} scale={[0.48, 0.08, 0.34]} color={['#ef4444', '#3b82f6', '#f59e0b'][index]} />
        </group>
      ))}
      <Text position={[0, 2.35, 0]} fontSize={0.18} color="#0f172a" anchorX="center">
        3 swings • 6 chains
      </Text>
    </group>
  );
}

function SlideSet() {
  return (
    <group position={[1.65, 0.12, 0.55]}>
      <Box position={[0, 0.85, 0]} scale={[0.8, 1.28, 0.8]} color="#2563eb" />
      <Box position={[0.95, 0.42, -0.12]} scale={[1.8, 0.16, 0.52]} color="#ef4444" />
      <group rotation={[0, 0, -0.53]} position={[0.95, 0.74, -0.12]}>
        <Box position={[0, 0, 0]} scale={[1.75, 0.08, 0.48]} color="#f87171" />
      </group>
      <Box position={[-0.65, 0.72, 0.48]} scale={[0.12, 1.3, 0.08]} color="#92400e" />
      <Box position={[-0.25, 0.72, 0.48]} scale={[0.12, 1.3, 0.08]} color="#92400e" />
      {Array.from({ length: 5 }, (_, index) => (
        <Box key={index} position={[-0.45, 0.2 + index * 0.23, 0.52]} scale={[0.55, 0.06, 0.08]} color="#fef3c7" />
      ))}
      <Text position={[0.35, 1.65, 0.1]} fontSize={0.18} color="#7f1d1d" anchorX="center">
        slide ladder: 5 steps
      </Text>
    </group>
  );
}

function Fence() {
  const xs = [-3.8, -2.7, -1.6, -0.5, 0.6, 1.7, 2.8, 3.8];
  return (
    <group>
      {xs.map((x) => (
        <Cylinder key={`front-${x}`} position={[x, 0.46, 2.42]} radius={0.055} height={0.9} color="#78350f" />
      ))}
      {xs.map((x) => (
        <Cylinder key={`back-${x}`} position={[x, 0.46, -2.42]} radius={0.055} height={0.9} color="#78350f" />
      ))}
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

function Child({ position, color, active }: { position: [number, number, number]; color: string; active?: boolean }) {
  const body = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (body.current && active) {
      body.current.rotation.z = Math.sin(state.clock.elapsedTime * 7) * 0.08;
    }
  });
  return (
    <group ref={body} position={position}>
      <mesh position={[0, 0.82, 0]} castShadow>
        <sphereGeometry args={[0.17, 20, 16]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      <mesh position={[0, 1.0, -0.02]} castShadow>
        <sphereGeometry args={[0.18, 18, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Box position={[0, 0.52, 0]} scale={[0.34, 0.55, 0.2]} color={color} />
      <Box position={[-0.2, 0.5, 0]} scale={[0.08, 0.46, 0.08]} color="#8b4513" />
      <Box position={[0.2, 0.5, 0]} scale={[0.08, 0.46, 0.08]} color="#8b4513" />
      <Box position={[-0.1, 0.12, 0]} scale={[0.1, 0.5, 0.1]} color="#1e3a8a" />
      <Box position={[0.1, 0.12, 0]} scale={[0.1, 0.5, 0.1]} color="#1e3a8a" />
      <Box position={[-0.1, -0.17, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
      <Box position={[0.1, -0.17, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
    </group>
  );
}

function TestingChildren({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) setProgress(0);
  }, [active]);
  useFrame((_, delta) => {
    if (active) setProgress((value) => Math.min(1, value + delta * 0.18));
  });

  const trail = [0, -0.12, -0.24, -0.36];
  return (
    <group>
      {trail.map((delay, index) => {
        const p = Math.max(0, Math.min(1, progress + delay));
        const x = -2.7 + p * 5.4;
        const z = index % 2 === 0 ? -0.15 : 0.18;
        const y = 0.16 + Math.sin(p * Math.PI) * 0.18;
        return <Child key={index} position={[x, y, z]} color={['#dc2626', '#2563eb', '#16a34a', '#f59e0b'][index]} active={p > 0 && p < 1} />;
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
      {stage >= 5 && <SlideSet />}
      {stage >= 6 && <Fence />}
      {stage < 6 && (
        <group>
          <Child position={[-4.4, 0.16, 2.4]} color="#2563eb" />
          <Child position={[-4.0, 0.16, 2.1]} color="#dc2626" />
        </group>
      )}
      {stage >= 6 && <TestingChildren active={testing} />}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.5, 0]} />
    </>
  );
}

export default function Playground3DConstructionSite({ buildStage, feedback }: Playground3DConstructionSiteProps) {
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
        .playground3d-shell {
          width: 100%;
          min-height: 520px;
          border-radius: 26px;
          background: linear-gradient(135deg, #eff6ff, #ecfdf5 45%, #fefce8);
          border: 1px solid rgba(148, 163, 184, 0.28);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
          padding: 1rem;
          display: grid;
          gap: 0.85rem;
        }
        .playground3d-header, .playground3d-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.84);
          padding: 0.85rem 1rem;
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
        }
        .playground3d-eyebrow {
          margin: 0;
          color: #2563eb;
          font-size: 0.78rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .playground3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .playground3d-header span { color: #475569; font-weight: 800; }
        .playground3d-header strong {
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 999px;
          padding: 0.55rem 0.85rem;
          white-space: nowrap;
        }
        .playground3d-header strong.ready { background: #dcfce7; color: #166534; }
        .playground3d-canvas {
          height: clamp(420px, 55vh, 620px);
          overflow: hidden;
          border-radius: 22px;
          background: linear-gradient(#bfdbfe, #dcfce7);
          border: 1px solid rgba(37, 99, 235, 0.18);
        }
        .playground3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .playground3d-controls button {
          border: 0;
          border-radius: 999px;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: white;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28);
          white-space: nowrap;
        }
        @media (max-width: 760px) {
          .playground3d-shell { padding: 0.75rem; min-height: 460px; }
          .playground3d-header, .playground3d-controls { align-items: flex-start; flex-direction: column; }
          .playground3d-canvas { height: 430px; }
        }
      `}</style>
    </section>
  );
}
