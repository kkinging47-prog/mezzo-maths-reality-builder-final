import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Irrigation3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

const stageNotes = [
  'Answer the first question to mark the 10m by 4m school garden bed.',
  'The garden bed is measured. Add the soil moisture sensor next.',
  'The dry-soil sensor is reading the garden. Size the water tank next.',
  'The 80 litre water tank is ready. Connect the pipes to every crop row.',
  'Main and row pipes are laid. Install the sprinklers in the correct positions.',
  'Sprinklers are fixed. Finish the smart controller and test the system.',
  'Smart irrigation complete. Test the automatic watering system.'
];

const cropRows = [-1.35, -0.45, 0.45, 1.35];
const cropXs = [-1.8, -0.6, 0.6, 1.8];
const sprinklerPoints = [
  [-1.8, -1.35], [0.6, -1.35],
  [-1.8, -0.45], [0.6, -0.45],
  [-1.8, 0.45], [0.6, 0.45],
  [-1.8, 1.35], [0.6, 1.35]
];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color, rotation = [0, 0, 0] }: { position: [number, number, number]; scale: [number, number, number]; color: string; rotation?: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.76} />
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

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.55, 0]} radius={0.1} height={1.1} color="#92400e" />
      <mesh position={[0, 1.18, 0]} castShadow>
        <sphereGeometry args={[0.44, 18, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.84} />
      </mesh>
      <mesh position={[0.25, 1.0, 0.18]} castShadow>
        <sphereGeometry args={[0.32, 18, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.84} />
      </mesh>
    </group>
  );
}

function Building({ position, title, color }: { position: [number, number, number]; title: string; color: string }) {
  return (
    <group position={position}>
      <Box position={[0, 0.48, 0]} scale={[1.55, 0.95, 1.05]} color={color} />
      <mesh position={[0, 1.08, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.1, 0.62, 4]} />
        <meshStandardMaterial color="#f97316" roughness={0.7} />
      </mesh>
      <Box position={[0, 0.25, 0.54]} scale={[0.28, 0.5, 0.06]} color="#78350f" />
      <Box position={[-0.42, 0.58, 0.56]} scale={[0.28, 0.25, 0.06]} color="#bfdbfe" />
      <Box position={[0.42, 0.58, 0.56]} scale={[0.28, 0.25, 0.06]} color="#bfdbfe" />
      <Text position={[0, 1.45, 0.67]} fontSize={0.18} color="#78350f" anchorX="center">
        {title}
      </Text>
    </group>
  );
}

function Plant({ position, watered }: { position: [number, number, number]; watered: boolean }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.18, 0]} radius={0.035} height={0.36} color={watered ? '#15803d' : '#854d0e'} />
      <mesh position={[-0.12, 0.38, 0]} rotation={[0, 0, -0.7]} castShadow>
        <sphereGeometry args={[0.14, 14, 10]} />
        <meshStandardMaterial color={watered ? '#22c55e' : '#ca8a04'} roughness={0.82} />
      </mesh>
      <mesh position={[0.12, 0.44, 0]} rotation={[0, 0, 0.7]} castShadow>
        <sphereGeometry args={[0.14, 14, 10]} />
        <meshStandardMaterial color={watered ? '#4ade80' : '#b45309'} roughness={0.82} />
      </mesh>
    </group>
  );
}

function GardenBed({ stage, watered }: { stage: number; watered: boolean }) {
  return (
    <group>
      <Box position={[0, 0.08, 0]} scale={[5.0, 0.16, 3.35]} color={watered ? '#7c4a16' : '#6b3410'} />
      {stage >= 1 && (
        <group>
          <Box position={[0, 0.21, -1.72]} scale={[5.12, 0.06, 0.05]} color="#facc15" />
          <Box position={[0, 0.21, 1.72]} scale={[5.12, 0.06, 0.05]} color="#facc15" />
          <Box position={[-2.56, 0.21, 0]} scale={[0.05, 0.06, 3.48]} color="#facc15" />
          <Box position={[2.56, 0.21, 0]} scale={[0.05, 0.06, 3.48]} color="#facc15" />
          <Text position={[0, 0.48, -2.05]} fontSize={0.22} color="#713f12" anchorX="center">
            10m × 4m = 40m² garden bed
          </Text>
        </group>
      )}
      {cropRows.map((z) => (
        <group key={z}>
          {stage >= 1 && <Box position={[0, 0.23, z]} scale={[4.5, 0.03, 0.035]} color="#facc15" />}
          {cropXs.map((x) => <Plant key={`${x}-${z}`} position={[x, 0.18, z + 0.18]} watered={watered} />)}
        </group>
      ))}
    </group>
  );
}

function MoistureSensor({ watered }: { watered: boolean }) {
  return (
    <group position={[-3.05, 0, -0.05]}>
      <Cylinder position={[0, 0.45, 0]} radius={0.07} height={0.9} color="#334155" />
      <mesh position={[0, 0.98, 0]} castShadow>
        <sphereGeometry args={[0.18, 20, 14]} />
        <meshStandardMaterial color={watered ? '#22c55e' : '#f97316'} roughness={0.5} />
      </mesh>
      <Box position={[0, 0.24, -0.35]} scale={[0.8, 0.34, 0.09]} color="#0f172a" />
      <Text position={[0, 0.26, -0.42]} fontSize={0.15} color="#fde68a" anchorX="center">
        25% DRY
      </Text>
    </group>
  );
}

function WaterTank({ active }: { active: boolean }) {
  const waterRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (waterRef.current) waterRef.current.position.y = 1.0 + Math.sin(state.clock.elapsedTime * 2.2) * (active ? 0.04 : 0.01);
  });
  return (
    <group position={[3.6, 0, -1.15]}>
      <Cylinder position={[0, 1.0, 0]} radius={0.62} height={1.8} color="#075985" />
      <mesh ref={waterRef} position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 1.55, 28]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.78} roughness={0.35} />
      </mesh>
      <Text position={[0, 2.15, 0.05]} fontSize={0.22} color="#082f49" anchorX="center">
        80L tank
      </Text>
    </group>
  );
}

function Pipes({ active }: { active: boolean }) {
  return (
    <group>
      <Cylinder position={[2.85, 0.34, -1.15]} radius={0.06} height={1.45} color={active ? '#0ea5e9' : '#0284c7'} rotation={[0, 0, Math.PI / 2]} />
      <Cylinder position={[2.15, 0.34, 0]} radius={0.06} height={2.3} color={active ? '#0ea5e9' : '#0284c7'} rotation={[Math.PI / 2, 0, 0]} />
      {cropRows.map((z) => (
        <Cylinder key={z} position={[0, 0.35, z]} radius={0.045} height={4.7} color={active ? '#38bdf8' : '#0369a1'} rotation={[0, 0, Math.PI / 2]} />
      ))}
    </group>
  );
}

function Sprinkler({ position, active }: { position: [number, number, number]; active: boolean }) {
  const sprayRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (sprayRef.current) {
      const pulse = active ? 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08 : 0.75;
      sprayRef.current.scale.set(pulse, pulse, pulse);
      sprayRef.current.rotation.y += active ? 0.03 : 0;
    }
  });
  return (
    <group position={position}>
      <Cylinder position={[0, 0.2, 0]} radius={0.055} height={0.36} color="#0f172a" />
      <mesh position={[0, 0.43, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.4} />
      </mesh>
      <group ref={sprayRef} visible={active} position={[0, 0.5, 0]}>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rotation) => (
          <mesh key={rotation} rotation={[0, rotation, -0.72]} position={[0.42 * Math.cos(rotation), 0.16, 0.42 * Math.sin(rotation)]}>
            <coneGeometry args={[0.08, 0.75, 12]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.52} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ControllerPanel({ active }: { active: boolean }) {
  return (
    <group position={[-4.0, 0, 1.55]}>
      <Box position={[0, 0.7, 0]} scale={[0.9, 1.0, 0.12]} color="#0f172a" />
      <mesh position={[-0.22, 0.85, -0.08]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#facc15'} emissive={active ? '#16a34a' : '#ca8a04'} emissiveIntensity={active ? 0.55 : 0.2} />
      </mesh>
      <mesh position={[0.22, 0.85, -0.08]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={active ? '#38bdf8' : '#64748b'} emissive={active ? '#0ea5e9' : '#000000'} emissiveIntensity={active ? 0.55 : 0} />
      </mesh>
      <Text position={[0, 0.45, -0.09]} fontSize={0.12} color="#e0f2fe" anchorX="center">
        AUTO WATER
      </Text>
    </group>
  );
}

function IrrigationScene({ stage, testing }: { stage: number; testing: boolean }) {
  const watered = stage >= 6 && testing;
  return (
    <>
      <ambientLight intensity={0.72} />
      <directionalLight position={[5, 8, 5]} intensity={1.08} castShadow shadow-mapSize={[1024, 1024]} />
      <Sky sunPosition={[10, 12, 6]} turbidity={4} rayleigh={0.55} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#86efac" roughness={0.92} />
      </mesh>
      <Box position={[0, 0.03, 3.25]} scale={[14, 0.06, 1.2]} color="#65a30d" />
      <Building position={[-5.2, 0, -2.8]} title="SCHOOL" color="#fef3c7" />
      <Building position={[5.25, 0, 2.5]} title="FARM SHED" color="#fee2e2" />
      <Tree position={[-5.7, 0, 1.8]} />
      <Tree position={[5.6, 0, -2.5]} />
      <Tree position={[4.7, 0, -3.4]} />
      <GardenBed stage={stage} watered={watered} />
      {stage >= 2 && <MoistureSensor watered={watered} />}
      {stage >= 3 && <WaterTank active={watered} />}
      {stage >= 4 && <Pipes active={watered} />}
      {stage >= 5 && sprinklerPoints.map(([x, z]) => <Sprinkler key={`${x}-${z}`} position={[x, 0.36, z]} active={watered} />)}
      {stage >= 6 && <ControllerPanel active={watered} />}
      {stage >= 6 && (
        <Text position={[0, 2.2, 2.25]} fontSize={0.24} color={watered ? '#166534' : '#0f172a'} anchorX="center">
          {watered ? 'Garden watered automatically!' : 'System ready for test'}
        </Text>
      )}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.55, 0]} />
    </>
  );
}

export default function Irrigation3DConstructionSite({ buildStage, feedback }: Irrigation3DConstructionSiteProps) {
  const stage = clampStage(buildStage);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (stage < 6) setTesting(false);
  }, [stage]);

  const visibleFeedback = feedback && !feedback.includes('Not quite') ? feedback : stageNotes[stage];

  return (
    <section className="irrigation3d-shell" aria-label={`3D smart irrigation builder stage ${stage} of 6`}>
      <div className="irrigation3d-header">
        <div>
          <p className="irrigation3d-eyebrow">3D Farm Technology Builder</p>
          <h3>Build a Smart Irrigation System</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready to water crops' : 'Solve to build'}</strong>
      </div>

      <div className="irrigation3d-canvas" role="img" aria-label="Interactive 3D smart irrigation construction scene">
        <Canvas shadows camera={{ position: [6.6, 5.3, 6.6], fov: 42 }}>
          <IrrigationScene stage={stage} testing={testing} />
        </Canvas>
      </div>

      <div className="irrigation3d-controls">
        <p>{visibleFeedback}</p>
        {stage >= 6 && (
          <button type="button" onClick={() => setTesting((value) => !value)}>
            {testing ? 'Reset Irrigation Test' : 'Test Smart Irrigation'}
          </button>
        )}
      </div>

      <style>{`
        .irrigation3d-shell { width: 100%; min-height: 520px; border-radius: 26px; background: linear-gradient(135deg, #f0fdf4, #dcfce7 45%, #e0f2fe); border: 1px solid rgba(34, 197, 94, 0.24); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .irrigation3d-header, .irrigation3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.88); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .irrigation3d-eyebrow { margin: 0; color: #16a34a; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .irrigation3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .irrigation3d-header span { color: #475569; font-weight: 800; }
        .irrigation3d-header strong { background: #dcfce7; color: #15803d; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .irrigation3d-header strong.ready { background: #bbf7d0; color: #166534; }
        .irrigation3d-canvas { height: clamp(420px, 55vh, 620px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(34, 197, 94, 0.24); }
        .irrigation3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .irrigation3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #16a34a, #0284c7); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(22, 163, 74, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .irrigation3d-shell { padding: 0.75rem; min-height: 460px; } .irrigation3d-header, .irrigation3d-controls { align-items: flex-start; flex-direction: column; } .irrigation3d-canvas { height: 430px; } }
      `}</style>
    </section>
  );
}
