import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type SmartParking3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const stageNotes = [
  'Answer the first question to mark the parking land.',
  'The 20m by 10m parking land is marked. Draw the first row of spaces.',
  'Four spaces fit in one row. Complete the second row to make 8 spaces.',
  'The 8-space parking layout is complete. Add a sensor to every space.',
  'Sensors are installed. Count parked cars and available spaces.',
  'Cars and counters are working. Finish the gate, display and control system.',
  'Smart parking complete. Test a car entering and parking automatically.'
];

const slotPositions: Array<[number, number]> = [
  [-1.8, -0.85], [-0.6, -0.85], [0.6, -0.85], [1.8, -0.85],
  [-1.8, 0.85], [-0.6, 0.85], [0.6, 0.85], [1.8, 0.85]
];

const carColors = ['#2563eb', '#dc2626', '#f59e0b', '#7c3aed', '#059669', '#ea580c', '#0f766e'];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.74} />
    </mesh>
  );
}

function Cylinder({ position, radius, height, color, rotation = [0, 0, 0] }: { position: [number, number, number]; radius: number; height: number; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 24]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function Building({ position, title, color }: { position: [number, number, number]; title: string; color: string }) {
  return (
    <group position={position}>
      <Box position={[0, 0.62, 0]} scale={[1.8, 1.24, 1.1]} color={color} />
      <Box position={[0, 1.32, 0]} scale={[2.08, 0.24, 1.28]} color="#1d4ed8" />
      <Box position={[0, 0.32, 0.58]} scale={[0.34, 0.62, 0.06]} color="#1e3a8a" />
      {[-0.58, 0.58].map((x) => <Box key={x} position={[x, 0.76, 0.6]} scale={[0.36, 0.28, 0.06]} color="#bfdbfe" />)}
      <Text position={[0, 1.66, 0.68]} fontSize={0.16} color="#1e3a8a" anchorX="center">
        {title}
      </Text>
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.5, 0]} radius={0.09} height={1.0} color="#92400e" />
      <mesh position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.42, 18, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.86} />
      </mesh>
    </group>
  );
}

function Car({ position, color, rotation = [0, 0, 0], label }: { position: [number, number, number]; color: string; rotation?: [number, number, number]; label?: string }) {
  return (
    <group position={position} rotation={rotation}>
      <Box position={[0, 0.18, 0]} scale={[0.78, 0.25, 0.42]} color={color} />
      <Box position={[0, 0.38, -0.02]} scale={[0.48, 0.24, 0.32]} color={color} />
      <Box position={[-0.12, 0.42, -0.23]} scale={[0.22, 0.12, 0.04]} color="#bfdbfe" />
      <Box position={[0.16, 0.42, -0.23]} scale={[0.22, 0.12, 0.04]} color="#bfdbfe" />
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <Cylinder position={[x, 0.08, -0.24]} radius={0.09} height={0.05} color="#111827" rotation={[Math.PI / 2, 0, 0]} />
          <Cylinder position={[x, 0.08, 0.24]} radius={0.09} height={0.05} color="#111827" rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      {label && (
        <Text position={[0, 0.58, 0]} fontSize={0.18} color="#ffffff" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

function ParkingLand({ stage }: { stage: number }) {
  return (
    <group>
      <Box position={[0, 0.05, 0]} scale={[5.45, 0.1, 3.45]} color="#1f2937" />
      <Text position={[0, 0.36, -2.08]} fontSize={0.23} color="#0f172a" anchorX="center">
        20m × 10m smart parking land
      </Text>
      {stage >= 1 && (
        <group>
          <Box position={[0, 0.16, -1.78]} scale={[5.62, 0.05, 0.05]} color="#facc15" />
          <Box position={[0, 0.16, 1.78]} scale={[5.62, 0.05, 0.05]} color="#facc15" />
          <Box position={[-2.82, 0.16, 0]} scale={[0.05, 0.05, 3.62]} color="#facc15" />
          <Box position={[2.82, 0.16, 0]} scale={[0.05, 0.05, 3.62]} color="#facc15" />
          {[[-2.82, -1.78], [2.82, -1.78], [-2.82, 1.78], [2.82, 1.78]].map(([x, z]) => <Cylinder key={`${x}-${z}`} position={[x, 0.35, z]} radius={0.07} height={0.7} color="#ef4444" />)}
        </group>
      )}
      {stage >= 2 && slotPositions.slice(0, 4).map(([x, z]) => <Slot key={`${x}-${z}`} x={x} z={z} />)}
      {stage >= 3 && slotPositions.slice(4).map(([x, z]) => <Slot key={`${x}-${z}`} x={x} z={z} />)}
      {stage >= 3 && <Box position={[0, 0.18, 0]} scale={[5.1, 0.05, 0.06]} color="#facc15" />}
    </group>
  );
}

function Slot({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0.18, z]}>
      <Box position={[0, 0, -0.55]} scale={[0.95, 0.035, 0.045]} color="#f8fafc" />
      <Box position={[0, 0, 0.55]} scale={[0.95, 0.035, 0.045]} color="#f8fafc" />
      <Box position={[-0.48, 0, 0]} scale={[0.045, 0.035, 1.1]} color="#f8fafc" />
      <Box position={[0.48, 0, 0]} scale={[0.045, 0.035, 1.1]} color="#f8fafc" />
    </group>
  );
}

function Sensor({ position, occupied }: { position: [number, number, number]; occupied: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.12;
      pulseRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.13, 18, 12]} />
        <meshStandardMaterial color={occupied ? '#ef4444' : '#22c55e'} emissive={occupied ? '#991b1b' : '#16a34a'} emissiveIntensity={0.35} />
      </mesh>
      <mesh ref={pulseRef}>
        <torusGeometry args={[0.24, 0.015, 8, 32]} />
        <meshStandardMaterial color={occupied ? '#fca5a5' : '#86efac'} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function ParkedCars({ count }: { count: number }) {
  return (
    <group>
      {slotPositions.slice(0, count).map(([x, z], index) => (
        <Car key={index} position={[x, 0.22, z]} color={carColors[index % carColors.length]} rotation={[0, 0, 0]} label={`${index + 1}`} />
      ))}
    </group>
  );
}

function DisplayBoard({ available }: { available: number }) {
  return (
    <group position={[0, 0, -2.85]}>
      <Cylinder position={[-0.95, 0.75, 0]} radius={0.06} height={1.5} color="#334155" />
      <Cylinder position={[0.95, 0.75, 0]} radius={0.06} height={1.5} color="#334155" />
      <Box position={[0, 1.35, 0]} scale={[2.35, 0.9, 0.14]} color="#020617" />
      <Text position={[0, 1.55, -0.09]} fontSize={0.2} color="#67e8f9" anchorX="center">
        SMART PARKING
      </Text>
      <Text position={[0, 1.18, -0.09]} fontSize={0.28} color="#22c55e" anchorX="center">
        {available} SPACES FREE
      </Text>
    </group>
  );
}

function Barrier({ open }: { open: boolean }) {
  const armRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (armRef.current) {
      const target = open ? -Math.PI / 3 : 0;
      const wave = open ? Math.sin(state.clock.elapsedTime * 2) * 0.05 : 0;
      armRef.current.rotation.z = target + wave;
    }
  });
  return (
    <group position={[-3.75, 0, 1.78]}>
      <Cylinder position={[0, 0.48, 0]} radius={0.09} height={0.96} color="#1f2937" />
      <group ref={armRef} position={[0, 0.96, 0]}>
        <Box position={[0.85, 0, 0]} scale={[1.7, 0.08, 0.08]} color="#ef4444" />
        <Box position={[0.85, 0.01, 0.01]} scale={[1.7, 0.04, 0.09]} color="#fef2f2" />
      </group>
      <Text position={[0.65, 1.35, 0]} fontSize={0.15} color="#7f1d1d" anchorX="center">
        ENTRY GATE
      </Text>
    </group>
  );
}

function TestCar({ active }: { active: boolean }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!active) setProgress(0);
  }, [active]);
  useFrame((_, delta) => {
    if (active) setProgress((value) => Math.min(1, value + delta * 0.18));
  });
  const x = -5.5 + progress * 4.9;
  const z = 2.35 - Math.max(0, progress - 0.55) * 7.1;
  return (
    <group>
      <Car position={[x, 0.2, z]} color="#0ea5e9" rotation={[0, progress > 0.55 ? 0 : Math.PI / 2, 0]} label="IN" />
      {progress >= 1 && (
        <Text position={[-0.4, 1.65, -0.95]} fontSize={0.22} color="#166534" anchorX="center">
          Car parked. Counter updated!
        </Text>
      )}
    </group>
  );
}

function ParkingScene({ stage, testing }: { stage: number; testing: boolean }) {
  const parkedCars = stage >= 6 ? (testing ? 7 : 6) : stage >= 5 ? 5 : 0;
  const available = Math.max(0, 8 - parkedCars);
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 5]} intensity={1.08} castShadow shadow-mapSize={[1024, 1024]} />
      <Sky sunPosition={[10, 12, 6]} turbidity={4} rayleigh={0.55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 10]} />
        <meshStandardMaterial color="#86efac" roughness={0.92} />
      </mesh>
      <Box position={[-4.0, 0.04, 2.35]} scale={[4.2, 0.08, 0.9]} color="#334155" />
      <Box position={[4.2, 0.04, 2.35]} scale={[4.6, 0.08, 0.9]} color="#334155" />
      <Building position={[-5.4, 0, -2.8]} title="COMMUNITY" color="#e0f2fe" />
      <Building position={[5.4, 0, -2.7]} title="SHOPPING" color="#dbeafe" />
      <Tree position={[-6.3, 0, 0.3]} />
      <Tree position={[6.1, 0, 0.2]} />
      <ParkingLand stage={stage} />
      {stage >= 4 && slotPositions.map(([x, z], index) => <Sensor key={index} position={[x, 0.4, z]} occupied={index < parkedCars} />)}
      {stage >= 5 && <ParkedCars count={parkedCars} />}
      {stage >= 5 && <Text position={[3.7, 1.15, 0]} fontSize={0.24} color="#0f172a" anchorX="center">{available} spaces available</Text>}
      {stage >= 6 && <DisplayBoard available={available} />}
      {stage >= 6 && <Barrier open={testing} />}
      {stage >= 6 && <TestCar active={testing} />}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.55, 0]} />
    </>
  );
}

export default function SmartParking3DConstructionSite({ buildStage, feedback }: SmartParking3DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : stageNotes[stage];

  return (
    <section className="parking3d-shell" aria-label={`3D smart parking builder stage ${stage} of 6`}>
      <div className="parking3d-header">
        <div>
          <p className="parking3d-eyebrow">3D Smart City Builder</p>
          <h3>Build a Smart Car Parking System</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready for car test' : 'Solve to build'}</strong>
      </div>

      <div className="parking3d-canvas" role="img" aria-label="Interactive 3D smart parking construction scene">
        <Canvas shadows camera={{ position: [6.6, 5.3, 6.6], fov: 42 }}>
          <ParkingScene stage={stage} testing={testing} />
        </Canvas>
      </div>

      <div className="parking3d-controls">
        <p>{visibleFeedback}</p>
        {stage >= 6 && (
          <button type="button" onClick={() => setTesting((value) => !value)}>
            {testing ? 'Reset Parking Test' : 'Test Car Entry'}
          </button>
        )}
      </div>

      <style>{`
        .parking3d-shell { width: 100%; min-height: 520px; border-radius: 26px; background: linear-gradient(135deg, #eff6ff, #e0f2fe 45%, #fef3c7); border: 1px solid rgba(37, 99, 235, 0.22); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .parking3d-header, .parking3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.88); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .parking3d-eyebrow { margin: 0; color: #2563eb; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .parking3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .parking3d-header span { color: #475569; font-weight: 800; }
        .parking3d-header strong { background: #dbeafe; color: #1d4ed8; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .parking3d-header strong.ready { background: #dcfce7; color: #166534; }
        .parking3d-canvas { height: clamp(420px, 55vh, 620px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(37, 99, 235, 0.22); }
        .parking3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .parking3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .parking3d-shell { padding: 0.75rem; min-height: 460px; } .parking3d-header, .parking3d-controls { align-items: flex-start; flex-direction: column; } .parking3d-canvas { height: 430px; } }
      `}</style>
    </section>
  );
}
