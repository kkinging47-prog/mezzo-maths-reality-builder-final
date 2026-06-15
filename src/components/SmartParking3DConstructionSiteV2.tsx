import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type SmartParking3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type Vec3 = [number, number, number];

const stageNotes = [
  'Answer the first question to mark the parking land inside the busy city centre.',
  'The 20m by 10m parking land is marked. Draw the first row of spaces.',
  'Four spaces fit in one row. Complete the second row to make 8 spaces.',
  'The 8-space parking layout is complete. Add a sensor to every parking space.',
  'Sensors are installed. Count parked cars and free spaces on the display board.',
  'Cars and counters are working. Finish the gate, display and smart control system.',
  'Smart parking complete. Test two cars leaving and one car entering the empty space.'
];

const slotPositions: Array<[number, number]> = [
  [-2.1, -0.95], [-0.7, -0.95], [0.7, -0.95], [2.1, -0.95],
  [-2.1, 0.95], [-0.7, 0.95], [0.7, 0.95], [2.1, 0.95]
];

const carColors = ['#1d4ed8', '#dc2626', '#f59e0b', '#7c3aed', '#059669', '#ea580c', '#0f766e', '#ec4899'];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Box({ position, scale, color, rotation = [0, 0, 0], roughness = 0.72 }: { position: Vec3; scale: Vec3; color: string; rotation?: Vec3; roughness?: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Cylinder({ position, radius, height, color, rotation = [0, 0, 0] }: { position: Vec3; radius: number; height: number; color: string; rotation?: Vec3 }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 28]} />
      <meshStandardMaterial color={color} roughness={0.72} />
    </mesh>
  );
}

function CityBuilding({ position, title, color, floors = 2, shop = false }: { position: Vec3; title: string; color: string; floors?: number; shop?: boolean }) {
  const windows = Array.from({ length: floors * 3 });
  return (
    <group position={position}>
      <Box position={[0, 0.35 + floors * 0.24, 0]} scale={[1.65, 0.7 + floors * 0.48, 1.1]} color={color} />
      <Box position={[0, 0.72 + floors * 0.48, 0]} scale={[1.9, 0.18, 1.28]} color={shop ? '#f97316' : '#1d4ed8'} />
      {shop && <Box position={[0, 0.18, 0.59]} scale={[1.35, 0.32, 0.06]} color="#fde68a" />}
      <Box position={[0, 0.32, 0.61]} scale={[0.34, 0.62, 0.06]} color="#1e293b" />
      {windows.map((_, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return <Box key={index} position={[-0.5 + col * 0.5, 0.68 + row * 0.42, 0.62]} scale={[0.24, 0.18, 0.05]} color="#dbeafe" />;
      })}
      <Text position={[0, 1.02 + floors * 0.5, 0.66]} fontSize={0.13} color="#0f172a" anchorX="center">
        {title}
      </Text>
    </group>
  );
}

function Tree({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.42, 0]} radius={0.07} height={0.84} color="#92400e" />
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.33, 18, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.86} />
      </mesh>
      <mesh position={[0.22, 0.82, 0.08]} castShadow>
        <sphereGeometry args={[0.25, 18, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.86} />
      </mesh>
    </group>
  );
}

function Person({ color = '#2563eb' }: { color?: string }) {
  return (
    <group>
      <Cylinder position={[0, 0.46, 0]} radius={0.09} height={0.42} color={color} />
      <mesh position={[0, 0.76, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color="#f8c7a4" roughness={0.6} />
      </mesh>
      <Cylinder position={[-0.07, 0.17, 0]} radius={0.035} height={0.35} color="#1e293b" />
      <Cylinder position={[0.07, 0.17, 0]} radius={0.035} height={0.35} color="#1e293b" />
      <Cylinder position={[-0.15, 0.48, 0]} radius={0.025} height={0.3} color="#f8c7a4" rotation={[0, 0, 0.35]} />
      <Cylinder position={[0.15, 0.48, 0]} radius={0.025} height={0.3} color="#f8c7a4" rotation={[0, 0, -0.35]} />
    </group>
  );
}

function MovingPerson({ start, end, offset, color }: { start: [number, number]; end: [number, number]; offset: number; color: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const p = (state.clock.elapsedTime * 0.07 + offset) % 1;
    const x = mix(start[0], end[0], p);
    const z = mix(start[1], end[1], p);
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z);
      groupRef.current.rotation.y = Math.atan2(end[0] - start[0], end[1] - start[1]);
    }
  });
  return (
    <group ref={groupRef}>
      <Person color={color} />
    </group>
  );
}

function RealisticCar({ position, color, rotationY = 0, label, scale = 1 }: { position: Vec3; color: string; rotationY?: number; label?: string; scale?: number }) {
  const wheelXs = [-0.28, 0.28];
  const wheelZs = [-0.37, 0.37];
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={[scale, scale, scale]}>
      <Box position={[0, 0.2, 0]} scale={[0.58, 0.25, 0.96]} color={color} roughness={0.48} />
      <Box position={[0, 0.39, -0.05]} scale={[0.45, 0.23, 0.45]} color={color} roughness={0.44} />
      <Box position={[0, 0.43, -0.31]} scale={[0.36, 0.1, 0.06]} color="#bfdbfe" />
      <Box position={[0, 0.43, 0.16]} scale={[0.36, 0.1, 0.06]} color="#dbeafe" />
      <Box position={[-0.31, 0.35, -0.04]} scale={[0.04, 0.12, 0.28]} color="#bfdbfe" />
      <Box position={[0.31, 0.35, -0.04]} scale={[0.04, 0.12, 0.28]} color="#bfdbfe" />
      <Box position={[0, 0.19, -0.53]} scale={[0.42, 0.08, 0.05]} color="#fef3c7" />
      <Box position={[-0.17, 0.19, 0.53]} scale={[0.12, 0.07, 0.05]} color="#fecaca" />
      <Box position={[0.17, 0.19, 0.53]} scale={[0.12, 0.07, 0.05]} color="#fecaca" />
      {wheelXs.flatMap((x) => wheelZs.map((z) => (
        <group key={`${x}-${z}`} position={[x, 0.08, z]}>
          <Cylinder position={[0, 0, 0]} radius={0.105} height={0.07} color="#020617" rotation={[Math.PI / 2, 0, 0]} />
          <Cylinder position={[0, 0, 0.01]} radius={0.055} height={0.075} color="#94a3b8" rotation={[Math.PI / 2, 0, 0]} />
        </group>
      )))}
      {label && (
        <Text position={[0, 0.72, 0]} fontSize={0.16} color="#0f172a" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

function Slot({ x, z, occupied }: { x: number; z: number; occupied: boolean }) {
  return (
    <group position={[x, 0.16, z]}>
      <Box position={[0, 0, -0.6]} scale={[1.08, 0.035, 0.045]} color="#f8fafc" />
      <Box position={[0, 0, 0.6]} scale={[1.08, 0.035, 0.045]} color="#f8fafc" />
      <Box position={[-0.54, 0, 0]} scale={[0.045, 0.035, 1.2]} color="#f8fafc" />
      <Box position={[0.54, 0, 0]} scale={[0.045, 0.035, 1.2]} color="#f8fafc" />
      <mesh position={[0, 0.03, 0]} receiveShadow>
        <boxGeometry args={[0.92, 0.01, 1.05]} />
        <meshStandardMaterial color={occupied ? '#334155' : '#475569'} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Sensor({ position, occupied }: { position: Vec3; occupied: boolean }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 3.4) * 0.13;
      pulseRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.12, 18, 12]} />
        <meshStandardMaterial color={occupied ? '#ef4444' : '#22c55e'} emissive={occupied ? '#991b1b' : '#16a34a'} emissiveIntensity={0.45} />
      </mesh>
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.012, 8, 32]} />
        <meshStandardMaterial color={occupied ? '#fca5a5' : '#86efac'} transparent opacity={0.68} />
      </mesh>
    </group>
  );
}

function ParkingLand({ stage, occupiedSlots }: { stage: number; occupiedSlots: number[] }) {
  return (
    <group>
      <Box position={[0, 0.045, 0]} scale={[6.35, 0.09, 3.95]} color="#1f2937" />
      <Box position={[0, 0.105, 0]} scale={[6.0, 0.04, 3.55]} color="#273449" />
      <Text position={[0, 0.38, -2.38]} fontSize={0.22} color="#0f172a" anchorX="center">
        20m × 10m city-centre smart parking
      </Text>
      {stage >= 1 && (
        <group>
          <Box position={[0, 0.16, -1.98]} scale={[6.58, 0.05, 0.05]} color="#facc15" />
          <Box position={[0, 0.16, 1.98]} scale={[6.58, 0.05, 0.05]} color="#facc15" />
          <Box position={[-3.28, 0.16, 0]} scale={[0.05, 0.05, 4.02]} color="#facc15" />
          <Box position={[3.28, 0.16, 0]} scale={[0.05, 0.05, 4.02]} color="#facc15" />
        </group>
      )}
      {stage >= 2 && slotPositions.slice(0, 4).map(([x, z], index) => <Slot key={`${x}-${z}`} x={x} z={z} occupied={occupiedSlots.includes(index)} />)}
      {stage >= 3 && slotPositions.slice(4).map(([x, z], index) => <Slot key={`${x}-${z}`} x={x} z={z} occupied={occupiedSlots.includes(index + 4)} />)}
      {stage >= 3 && <Box position={[0, 0.18, 0]} scale={[5.85, 0.05, 0.06]} color="#facc15" />}
    </group>
  );
}

function DisplayBoard({ available, total }: { available: number; total: number }) {
  return (
    <group position={[0, 0, -3.15]}>
      <Cylinder position={[-1.05, 0.78, 0]} radius={0.055} height={1.55} color="#334155" />
      <Cylinder position={[1.05, 0.78, 0]} radius={0.055} height={1.55} color="#334155" />
      <Box position={[0, 1.38, 0]} scale={[2.65, 0.95, 0.15]} color="#020617" />
      <Text position={[0, 1.62, -0.1]} fontSize={0.18} color="#67e8f9" anchorX="center">
        SMART PARKING COUNTER
      </Text>
      <Text position={[0, 1.32, -0.1]} fontSize={0.26} color="#22c55e" anchorX="center">
        {available} FREE • {total} PARKED
      </Text>
      <Text position={[0, 1.05, -0.1]} fontSize={0.14} color="#fef3c7" anchorX="center">
        updates as cars leave and enter
      </Text>
    </group>
  );
}

function Barrier({ open }: { open: boolean }) {
  const armRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (armRef.current) {
      const target = open ? -Math.PI / 3 : 0;
      const wave = open ? Math.sin(state.clock.elapsedTime * 2) * 0.04 : 0;
      armRef.current.rotation.z = target + wave;
    }
  });
  return (
    <group position={[-4.2, 0, 2.25]}>
      <Cylinder position={[0, 0.5, 0]} radius={0.08} height={1.0} color="#1f2937" />
      <group ref={armRef} position={[0, 1.02, 0]}>
        <Box position={[0.95, 0, 0]} scale={[1.9, 0.08, 0.08]} color="#ef4444" />
        <Box position={[0.95, 0.012, 0.012]} scale={[1.9, 0.04, 0.09]} color="#fef2f2" />
      </group>
      <Text position={[0.7, 1.42, 0]} fontSize={0.14} color="#7f1d1d" anchorX="center">
        ENTRY GATE
      </Text>
    </group>
  );
}

function movingExitPose(slotIndex: number, progress: number, start: number, duration: number, side: 'left' | 'right') {
  const p = clamp01((progress - start) / duration);
  const [sx, sz] = slotPositions[slotIndex];
  if (p < 0.45) {
    const t = p / 0.45;
    return { x: sx, z: mix(sz, 2.35, t), rot: 0 };
  }
  const t = (p - 0.45) / 0.55;
  const targetX = side === 'left' ? -6.7 : 6.7;
  return { x: mix(sx, targetX, t), z: mix(2.35, 2.55, t), rot: side === 'left' ? -Math.PI / 2 : Math.PI / 2 };
}

function incomingPose(progress: number) {
  const p = clamp01((progress - 0.28) / 0.58);
  if (p < 0.38) {
    const t = p / 0.38;
    return { x: mix(-7.0, -1.2, t), z: 2.72, rot: Math.PI / 2 };
  }
  if (p < 0.68) {
    const t = (p - 0.38) / 0.3;
    return { x: mix(-1.2, 0.6, t), z: mix(2.72, 1.35, t), rot: mix(Math.PI / 2, Math.PI / 5, t) };
  }
  const t = (p - 0.68) / 0.32;
  return { x: mix(0.6, 0.7, t), z: mix(1.35, 0.95, t), rot: mix(Math.PI / 5, 0, t) };
}

function CityCentre() {
  return (
    <group>
      <Box position={[-5.0, 0.05, 2.65]} scale={[4.6, 0.08, 1.05]} color="#334155" />
      <Box position={[4.8, 0.05, 2.65]} scale={[5.0, 0.08, 1.05]} color="#334155" />
      <Box position={[0, 0.065, 3.18]} scale={[14.5, 0.045, 0.12]} color="#f8fafc" />
      <Box position={[0, 0.06, -3.65]} scale={[15.0, 0.06, 1.3]} color="#94a3b8" />
      <Box position={[-5.5, 0.04, -2.55]} scale={[4.6, 0.08, 1.0]} color="#e5e7eb" />
      <Box position={[5.3, 0.04, -2.55]} scale={[4.8, 0.08, 1.0]} color="#e5e7eb" />
      {[-5.8, -4.5, -3.2].map((x, index) => <CityBuilding key={x} position={[x, 0, -3.45]} title={['BANK', 'BAKERY', 'CAFE'][index]} color={['#dbeafe', '#fef3c7', '#fee2e2'][index]} shop floors={1} />)}
      {[3.7, 5.15, 6.55].map((x, index) => <CityBuilding key={x} position={[x, 0, -3.45]} title={['PHARMACY', 'MART', 'SHOP'][index]} color={['#dcfce7', '#e0e7ff', '#fde68a'][index]} shop floors={1} />)}
      <CityBuilding position={[-6.3, 0, 0.15]} title="OFFICE" color="#e0f2fe" floors={3} />
      <CityBuilding position={[6.35, 0, 0.2]} title="HOTEL" color="#ede9fe" floors={3} />
      <Tree position={[-7.15, 0, -1.0]} />
      <Tree position={[7.2, 0, -1.1]} />
      <Tree position={[-3.8, 0, 3.45]} />
      <Tree position={[3.9, 0, 3.45]} />
      <MovingPerson start={[-6.4, 3.25]} end={[-1.2, 3.25]} offset={0.1} color="#ef4444" />
      <MovingPerson start={[6.2, -2.65]} end={[1.4, -2.65]} offset={0.35} color="#2563eb" />
      <MovingPerson start={[-2.7, -2.65]} end={[-6.8, -2.65]} offset={0.62} color="#16a34a" />
      <MovingPerson start={[2.2, 3.25]} end={[6.8, 3.25]} offset={0.78} color="#f59e0b" />
    </group>
  );
}

function ParkingScene({ stage, testing }: { stage: number; testing: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!testing) setProgress(0);
  }, [testing]);

  useFrame((_, delta) => {
    if (testing) setProgress((value) => Math.min(1, value + delta * 0.15));
  });

  const firstOutStarted = testing && progress > 0.05;
  const firstOutDone = testing && progress > 0.32;
  const secondOutStarted = testing && progress > 0.34;
  const secondOutDone = testing && progress > 0.62;
  const incomingStarted = testing && progress > 0.28;
  const incomingParked = testing && progress > 0.86;

  let occupiedSlots = stage >= 6 ? [0, 1, 2, 3, 4, 5] : stage >= 5 ? [0, 1, 2, 3, 4] : [];
  if (firstOutStarted) occupiedSlots = occupiedSlots.filter((slot) => slot !== 4);
  if (secondOutStarted) occupiedSlots = occupiedSlots.filter((slot) => slot !== 5);
  if (incomingParked) occupiedSlots = [...occupiedSlots, 6];

  const available = stage >= 5 ? Math.max(0, 8 - occupiedSlots.length) : 8;
  const exitingOne = movingExitPose(4, progress, 0.05, 0.28, 'left');
  const exitingTwo = movingExitPose(5, progress, 0.34, 0.28, 'right');
  const incoming = incomingPose(progress);

  return (
    <>
      <ambientLight intensity={0.82} />
      <directionalLight position={[5, 9, 5]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <Sky sunPosition={[10, 12, 6]} turbidity={4} rayleigh={0.55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[17, 11]} />
        <meshStandardMaterial color="#9ee7a3" roughness={0.92} />
      </mesh>
      <CityCentre />
      <ParkingLand stage={stage} occupiedSlots={occupiedSlots} />
      {stage >= 4 && slotPositions.map(([x, z], index) => <Sensor key={index} position={[x, 0.38, z]} occupied={occupiedSlots.includes(index)} />)}
      {stage >= 5 && occupiedSlots.map((slot) => {
        const [x, z] = slotPositions[slot];
        return <RealisticCar key={slot} position={[x, 0.24, z]} color={carColors[slot % carColors.length]} rotationY={0} label={`${slot + 1}`} />;
      })}
      {firstOutStarted && !firstOutDone && <RealisticCar position={[exitingOne.x, 0.24, exitingOne.z]} color={carColors[4]} rotationY={exitingOne.rot} label="OUT" />}
      {secondOutStarted && !secondOutDone && <RealisticCar position={[exitingTwo.x, 0.24, exitingTwo.z]} color={carColors[5]} rotationY={exitingTwo.rot} label="OUT" />}
      {incomingStarted && !incomingParked && <RealisticCar position={[incoming.x, 0.24, incoming.z]} color="#0ea5e9" rotationY={incoming.rot} label="IN" />}
      {stage >= 5 && <Text position={[4.25, 1.3, 0.15]} fontSize={0.22} color="#0f172a" anchorX="center">{available} spaces available now</Text>}
      {stage >= 6 && <DisplayBoard available={available} total={occupiedSlots.length} />}
      {stage >= 6 && <Barrier open={testing && progress < 0.9} />}
      {testing && progress >= 1 && (
        <Text position={[0, 1.8, -0.95]} fontSize={0.22} color="#166534" anchorX="center">
          Two cars left. One car parked. Counter updated live!
        </Text>
      )}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.55, 0]} />
    </>
  );
}

export default function SmartParking3DConstructionSiteV2({ buildStage, feedback }: SmartParking3DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : stageNotes[stage];

  return (
    <section className="parking3d-shell" aria-label={`3D smart parking city-centre builder stage ${stage} of 6`}>
      <div className="parking3d-header">
        <div>
          <p className="parking3d-eyebrow">3D Smart City Centre</p>
          <h3>Build a Smart Car Parking System</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready for live parking test' : 'Solve to build'}</strong>
      </div>

      <div className="parking3d-canvas" role="img" aria-label="Interactive 3D smart parking city-centre scene with cars, shops, people and live counter">
        <Canvas shadows camera={{ position: [7.2, 5.5, 7.4], fov: 42 }}>
          <ParkingScene stage={stage} testing={testing} />
        </Canvas>
      </div>

      <div className="parking3d-controls">
        <p>{visibleFeedback}</p>
        {stage >= 6 && (
          <button type="button" onClick={() => setTesting((value) => !value)}>
            {testing ? 'Reset Live Parking Test' : 'Test: 2 Cars Out, 1 Car In'}
          </button>
        )}
      </div>

      <style>{`
        .parking3d-shell { width: 100%; min-height: 560px; border-radius: 26px; background: linear-gradient(135deg, #eff6ff, #e0f2fe 45%, #fef3c7); border: 1px solid rgba(37, 99, 235, 0.22); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .parking3d-header, .parking3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.9); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .parking3d-eyebrow { margin: 0; color: #2563eb; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .parking3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .parking3d-header span { color: #475569; font-weight: 800; }
        .parking3d-header strong { background: #dbeafe; color: #1d4ed8; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .parking3d-header strong.ready { background: #dcfce7; color: #166534; }
        .parking3d-canvas { height: clamp(460px, 58vh, 660px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(37, 99, 235, 0.22); }
        .parking3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .parking3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(37, 99, 235, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .parking3d-shell { padding: 0.75rem; min-height: 460px; } .parking3d-header, .parking3d-controls { align-items: flex-start; flex-direction: column; } .parking3d-canvas { height: 450px; } }
      `}</style>
    </section>
  );
}
