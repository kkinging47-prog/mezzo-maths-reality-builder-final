import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Ferry3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const stageNotes = [
  'Answer the first question to measure the river crossing distance.',
  'The ferry route is measured and the guide line is marked across the river.',
  'Landing docks are now built on both river banks.',
  'The floating ferry platform has been constructed.',
  'Seats and safety rails are now fitted for passengers.',
  'The guide cable, motor support and safety equipment are installed.',
  'Ferry complete. Test the river crossing safely.'
];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.72} />
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

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.55, 0]} radius={0.12} height={1.1} color="#92400e" />
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.48, 18, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.86} />
      </mesh>
      <mesh position={[0.28, 1.06, 0.18]} castShadow>
        <sphereGeometry args={[0.35, 18, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.86} />
      </mesh>
    </group>
  );
}

function House({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <Box position={[0, 0.42, 0]} scale={[1.05, 0.85, 0.85]} color={color} />
      <mesh position={[0, 1.03, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.82, 0.55, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.68} />
      </mesh>
      <Box position={[0, 0.22, 0.44]} scale={[0.24, 0.42, 0.05]} color="#7c2d12" />
      <Box position={[-0.34, 0.52, 0.45]} scale={[0.24, 0.22, 0.05]} color="#bae6fd" />
      <Box position={[0.34, 0.52, 0.45]} scale={[0.24, 0.22, 0.05]} color="#bae6fd" />
    </group>
  );
}

function SchoolBuilding() {
  return (
    <group position={[4.9, 0, -3.2]}>
      <Box position={[0, 0.54, 0]} scale={[2.2, 1.08, 1.35]} color="#fde68a" />
      <Box position={[0, 1.18, 0]} scale={[2.55, 0.28, 1.55]} color="#fb923c" />
      <Box position={[0, 0.28, 0.7]} scale={[0.34, 0.55, 0.06]} color="#92400e" />
      <Box position={[-0.62, 0.62, 0.72]} scale={[0.38, 0.32, 0.06]} color="#bae6fd" />
      <Box position={[0.62, 0.62, 0.72]} scale={[0.38, 0.32, 0.06]} color="#bae6fd" />
      <Text position={[0, 1.48, 0.75]} fontSize={0.22} color="#78350f" anchorX="center">
        SCHOOL
      </Text>
    </group>
  );
}

function Person({ position, color = '#2563eb', rotation = [0, 0, 0] }: { position: [number, number, number]; color?: string; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation} scale={[0.82, 0.82, 0.82]}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh position={[0, 1.05, -0.02]} castShadow>
        <sphereGeometry args={[0.17, 18, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <Box position={[0, 0.55, 0]} scale={[0.32, 0.55, 0.2]} color={color} />
      <Box position={[-0.2, 0.5, 0]} scale={[0.08, 0.44, 0.08]} color="#8b5a2b" />
      <Box position={[0.2, 0.5, 0]} scale={[0.08, 0.44, 0.08]} color="#8b5a2b" />
      <Box position={[-0.1, 0.12, 0]} scale={[0.1, 0.46, 0.1]} color="#1e3a8a" />
      <Box position={[0.1, 0.12, 0]} scale={[0.1, 0.46, 0.1]} color="#1e3a8a" />
      <Box position={[-0.1, -0.14, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
      <Box position={[0.1, -0.14, 0.05]} scale={[0.18, 0.06, 0.18]} color="#111827" />
    </group>
  );
}

function FlowingRiver() {
  const waterRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (waterRef.current) waterRef.current.position.z = Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
  });

  return (
    <group>
      <Box position={[0, 0.02, 0]} scale={[4.2, 0.04, 8.6]} color="#38bdf8" />
      <group ref={waterRef}>
        {[-3, -1.8, -0.6, 0.6, 1.8, 3].map((z, index) => (
          <Box key={z} position={[0.15 * (index % 2), 0.06, z]} scale={[3.7, 0.025, 0.08]} color="#e0f2fe" />
        ))}
      </group>
      <Box position={[-2.25, 0.08, 0]} scale={[0.28, 0.18, 8.7]} color="#a16207" />
      <Box position={[2.25, 0.08, 0]} scale={[0.28, 0.18, 8.7]} color="#a16207" />
    </group>
  );
}

function RouteMarkers() {
  return (
    <group>
      <Box position={[0, 0.28, 0]} scale={[4.85, 0.05, 0.08]} color="#facc15" />
      <Cylinder position={[-2.25, 0.55, 0]} radius={0.08} height={1.1} color="#ef4444" />
      <Cylinder position={[2.25, 0.55, 0]} radius={0.08} height={1.1} color="#ef4444" />
      <Text position={[0, 0.8, 0.42]} fontSize={0.22} color="#854d0e" anchorX="center">
        river span measured
      </Text>
    </group>
  );
}

function Docks() {
  return (
    <group>
      {[-2.7, 2.7].map((x) => (
        <group key={x} position={[x, 0.18, 0]}>
          <Box position={[0, 0.02, 0]} scale={[1.35, 0.16, 1.35]} color="#92400e" />
          {[-0.46, 0, 0.46].map((z) => <Box key={z} position={[0, 0.16, z]} scale={[1.45, 0.06, 0.12]} color="#f59e0b" />)}
          <Cylinder position={[-0.58, 0.42, -0.58]} radius={0.06} height={0.65} color="#78350f" />
          <Cylinder position={[-0.58, 0.42, 0.58]} radius={0.06} height={0.65} color="#78350f" />
        </group>
      ))}
      <Text position={[0, 0.75, -1.05]} fontSize={0.22} color="#78350f" anchorX="center">
        safe landing docks
      </Text>
    </group>
  );
}

function FerryBoat({ x, z = 0, withDetails = true }: { x: number; z?: number; withDetails?: boolean }) {
  return (
    <group position={[x, 0.34, z]}>
      <Box position={[0, 0, 0]} scale={[1.6, 0.32, 1.05]} color="#fbbf24" />
      <Box position={[0, 0.18, 0]} scale={[1.75, 0.12, 1.18]} color="#92400e" />
      {withDetails && (
        <group>
          <Box position={[-0.42, 0.42, -0.18]} scale={[0.42, 0.18, 0.12]} color="#2563eb" />
          <Box position={[0.18, 0.42, -0.18]} scale={[0.42, 0.18, 0.12]} color="#2563eb" />
          <Box position={[0.58, 0.45, 0.34]} scale={[0.2, 0.48, 0.16]} color="#475569" />
          <Box position={[0.58, 0.72, 0.34]} scale={[0.55, 0.14, 0.14]} color="#334155" />
        </group>
      )}
    </group>
  );
}

function FerryRailsAndSafety({ x }: { x: number }) {
  return (
    <group position={[x, 0.65, 0]}>
      {[-0.74, 0.74].map((side) => (
        <group key={side}>
          <Box position={[0, 0.28, side]} scale={[1.75, 0.08, 0.08]} color="#1f2937" />
          {[-0.62, 0, 0.62].map((px) => <Cylinder key={px} position={[px, 0.05, side]} radius={0.035} height={0.52} color="#1f2937" />)}
        </group>
      ))}
      <Box position={[-0.72, 0.45, 0]} scale={[0.09, 0.09, 1.2]} color="#ef4444" />
      <Text position={[0, 0.7, 0]} fontSize={0.17} color="#111827" anchorX="center">
        MAX 8 PEOPLE
      </Text>
    </group>
  );
}

function GuideCable() {
  return (
    <group>
      <Cylinder position={[0, 1.05, -0.82]} radius={0.025} height={5.1} color="#111827" rotation={[0, 0, Math.PI / 2]} />
      <Cylinder position={[-2.55, 0.7, -0.82]} radius={0.06} height={1.4} color="#334155" />
      <Cylinder position={[2.55, 0.7, -0.82]} radius={0.06} height={1.4} color="#334155" />
      <Text position={[0, 1.4, -1.18]} fontSize={0.2} color="#0f172a" anchorX="center">
        guide cable + motor support
      </Text>
    </group>
  );
}

function TestingFerry({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) setProgress(0);
  }, [active]);
  useFrame((_, delta) => {
    if (active) setProgress((value) => Math.min(1, value + delta * 0.14));
  });

  const x = -2.25 + progress * 4.5;
  return (
    <group>
      <FerryBoat x={x} withDetails />
      <FerryRailsAndSafety x={x} />
      <Person position={[x - 0.35, 0.78, -0.12]} color="#dc2626" rotation={[0, Math.PI / 2, 0]} />
      <Person position={[x + 0.1, 0.78, 0.18]} color="#2563eb" rotation={[0, Math.PI / 2, 0]} />
      <Person position={[x + 0.42, 0.78, -0.12]} color="#16a34a" rotation={[0, Math.PI / 2, 0]} />
      {progress >= 1 && (
        <Text position={[2.1, 1.8, 1.05]} fontSize={0.24} color="#166534" anchorX="center">
          Safe landing!
        </Text>
      )}
    </group>
  );
}

function FerryScene({ stage, testing }: { stage: number; testing: boolean }) {
  const ferryX = -0.25;
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 5]} intensity={1.12} castShadow shadow-mapSize={[1024, 1024]} />
      <Sky sunPosition={[10, 11, 6]} turbidity={4} rayleigh={0.55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
      <FlowingRiver />
      <House position={[-5.2, 0, 2.7]} color="#fecaca" />
      <House position={[-6.2, 0, 1.3]} color="#bfdbfe" />
      <SchoolBuilding />
      <Tree position={[-6.1, 0, -2.4]} />
      <Tree position={[5.8, 0, 2.8]} />
      <Tree position={[6.3, 0, 1.5]} />
      <Person position={[-4.0, 0.15, 0.9]} color="#f97316" rotation={[0, Math.PI / 2, 0]} />
      <Person position={[-3.65, 0.15, 1.25]} color="#7c3aed" rotation={[0, Math.PI / 2, 0]} />
      {stage >= 1 && <RouteMarkers />}
      {stage >= 2 && <Docks />}
      {stage >= 3 && !testing && <FerryBoat x={ferryX} withDetails={stage >= 4} />}
      {stage >= 4 && !testing && <FerryRailsAndSafety x={ferryX} />}
      {stage >= 5 && <GuideCable />}
      {stage >= 6 && <Text position={[0, 1.75, 1.45]} fontSize={0.25} color="#0f172a" anchorX="center">ferry ready for safe crossing</Text>}
      {stage >= 6 && <TestingFerry active={testing} />}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.55, 0]} />
    </>
  );
}

export default function Ferry3DConstructionSite({ buildStage, feedback }: Ferry3DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : stageNotes[stage];

  return (
    <section className="ferry3d-shell" aria-label={`3D ferry builder stage ${stage} of 6`}>
      <div className="ferry3d-header">
        <div>
          <p className="ferry3d-eyebrow">3D Ferry Builder</p>
          <h3>Build a Ferry for River Crossing</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready for river test' : 'Solve to build'}</strong>
      </div>

      <div className="ferry3d-canvas" role="img" aria-label="Interactive 3D ferry construction scene">
        <Canvas shadows camera={{ position: [5.8, 5.0, 6.8], fov: 42 }}>
          <FerryScene stage={stage} testing={testing} />
        </Canvas>
      </div>

      <div className="ferry3d-controls">
        <p>{visibleFeedback}</p>
        {stage >= 6 && (
          <button type="button" onClick={() => setTesting((value) => !value)}>
            {testing ? 'Reset Ferry Test' : 'Test Ferry Crossing'}
          </button>
        )}
      </div>

      <style>{`
        .ferry3d-shell { width: 100%; min-height: 520px; border-radius: 26px; background: linear-gradient(135deg, #eff6ff, #e0f2fe 45%, #ecfdf5); border: 1px solid rgba(14, 165, 233, 0.22); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .ferry3d-header, .ferry3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.86); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .ferry3d-eyebrow { margin: 0; color: #0284c7; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .ferry3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .ferry3d-header span { color: #475569; font-weight: 800; }
        .ferry3d-header strong { background: #e0f2fe; color: #0369a1; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .ferry3d-header strong.ready { background: #dcfce7; color: #166534; }
        .ferry3d-canvas { height: clamp(420px, 55vh, 620px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(14, 165, 233, 0.22); }
        .ferry3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .ferry3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #0284c7, #2563eb); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .ferry3d-shell { padding: 0.75rem; min-height: 460px; } .ferry3d-header, .ferry3d-controls { align-items: flex-start; flex-direction: column; } .ferry3d-canvas { height: 430px; } }
      `}</style>
    </section>
  );
}
