import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Irrigation3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type Vec3 = [number, number, number];

const stageNotes = [
  'Answer the first question to measure the 10m by 4m school garden bed.',
  'The garden bed is measured. Add the soil moisture sensor next.',
  'The dry-soil sensor is reading the garden. Size the water tank next.',
  'The 80 litre water tank is ready. Connect the pipes to every crop row.',
  'Main and row pipes are laid. Install the sprinklers in the correct positions.',
  'Sprinklers are fixed. Finish the smart controller and test the system.',
  'Smart irrigation complete. Test the automatic watering system and watch the plants respond.'
];

const cropRows = [-1.35, -0.45, 0.45, 1.35];
const cropXs = [-2.0, -1.15, -0.3, 0.55, 1.4, 2.15];
const sprinklerPoints: [number, number][] = [
  [-1.8, -1.35], [0.6, -1.35],
  [-1.8, -0.45], [0.6, -0.45],
  [-1.8, 0.45], [0.6, 0.45],
  [-1.8, 1.35], [0.6, 1.35]
];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function Box({ position, scale, color, rotation = [0, 0, 0], roughness = 0.76 }: { position: Vec3; scale: Vec3; color: string; rotation?: Vec3; roughness?: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function Cylinder({ position, radius, height, color, rotation = [0, 0, 0], metalness = 0.05, roughness = 0.72 }: { position: Vec3; radius: number; height: number; color: string; rotation?: Vec3; metalness?: number; roughness?: number }) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}

function Leaf({ position, rotation, color, scale = [0.18, 0.04, 0.08] }: { position: Vec3; rotation: Vec3; color: string; scale?: Vec3 }) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} castShadow>
      <sphereGeometry args={[1, 16, 8]} />
      <meshStandardMaterial color={color} roughness={0.88} />
    </mesh>
  );
}

function Flower({ position, color = '#f472b6' }: { position: Vec3; color?: string }) {
  const petalPositions: Vec3[] = [
    [0.045, 0.012, 0], [-0.045, 0.012, 0], [0, 0.012, 0.045], [0, 0.012, -0.045], [0.032, 0.018, 0.032], [-0.032, 0.018, -0.032]
  ];
  return (
    <group position={position}>
      {petalPositions.map((petal, index) => (
        <mesh key={index} position={petal} castShadow>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color={color} roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} castShadow>
        <sphereGeometry args={[0.032, 10, 8]} />
        <meshStandardMaterial color="#facc15" roughness={0.55} />
      </mesh>
    </group>
  );
}

function RealisticPlant({ position, watered, index }: { position: Vec3; watered: boolean; index: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    const sway = Math.sin(state.clock.elapsedTime * 1.5 + index * 0.73) * (watered ? 0.055 : 0.025);
    groupRef.current.rotation.z = sway;
  });

  const stem = watered ? '#15803d' : '#7c4a16';
  const leafA = watered ? '#22c55e' : '#a16207';
  const leafB = watered ? '#4ade80' : '#ca8a04';
  const heightBoost = watered ? 1.18 : 0.86;
  const flowerColors = ['#f472b6', '#fb7185', '#facc15', '#a78bfa'];

  return (
    <group ref={groupRef} position={position} scale={[heightBoost, heightBoost, heightBoost]}>
      <Cylinder position={[0, 0.22, 0]} radius={0.025} height={0.46} color={stem} />
      <Cylinder position={[0.045, 0.43, 0]} radius={0.018} height={0.34} color={stem} rotation={[0.45, 0.1, -0.55]} />
      <Cylinder position={[-0.05, 0.45, 0.03]} radius={0.018} height={0.3} color={stem} rotation={[0.48, 0.2, 0.6]} />
      <Leaf position={[-0.12, 0.34, 0.03]} rotation={[0.15, 0.6, -0.65]} color={leafA} scale={[0.18, 0.04, 0.075]} />
      <Leaf position={[0.13, 0.42, -0.02]} rotation={[0.25, -0.55, 0.62]} color={leafB} scale={[0.2, 0.045, 0.08]} />
      <Leaf position={[-0.09, 0.54, -0.04]} rotation={[0.2, -0.15, -0.8]} color={leafB} scale={[0.17, 0.04, 0.07]} />
      <Leaf position={[0.08, 0.61, 0.04]} rotation={[0.2, 0.15, 0.8]} color={leafA} scale={[0.16, 0.038, 0.068]} />
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color={watered ? '#16a34a' : '#b45309'} roughness={0.85} />
      </mesh>
      {watered && (
        <>
          <Flower position={[0, 0.82, 0]} color={flowerColors[index % flowerColors.length]} />
          {(index + 1) % 3 === 0 && <Flower position={[0.13, 0.62, -0.04]} color="#fde047" />}
        </>
      )}
    </group>
  );
}

function Tree({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <Cylinder position={[0, 0.65, 0]} radius={0.12} height={1.3} color="#92400e" />
      <mesh position={[0, 1.38, 0]} castShadow>
        <sphereGeometry args={[0.5, 22, 16]} />
        <meshStandardMaterial color="#16a34a" roughness={0.84} />
      </mesh>
      <mesh position={[0.28, 1.13, 0.18]} castShadow>
        <sphereGeometry args={[0.34, 20, 14]} />
        <meshStandardMaterial color="#22c55e" roughness={0.84} />
      </mesh>
      <mesh position={[-0.26, 1.08, -0.18]} castShadow>
        <sphereGeometry args={[0.32, 20, 14]} />
        <meshStandardMaterial color="#15803d" roughness={0.84} />
      </mesh>
    </group>
  );
}

function Building({ position, title, color }: { position: Vec3; title: string; color: string }) {
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

function SoilRidges({ watered }: { watered: boolean }) {
  const ridges = useMemo(() => [-1.55, -1.1, -0.65, -0.2, 0.25, 0.7, 1.15, 1.55], []);
  return (
    <group>
      {ridges.map((z, index) => (
        <Cylinder
          key={z}
          position={[0, 0.21 + (index % 2) * 0.015, z]}
          radius={0.045}
          height={5.0}
          color={watered ? '#5f3b1b' : '#8b4513'}
          rotation={[0, 0, Math.PI / 2]}
          roughness={0.96}
        />
      ))}
    </group>
  );
}

function GardenBed({ stage, watered }: { stage: number; watered: boolean }) {
  return (
    <group>
      <Box position={[0, 0.06, 0]} scale={[5.25, 0.12, 3.6]} color={watered ? '#5b3417' : '#7c3f12'} roughness={0.98} />
      <SoilRidges watered={watered} />
      {watered && (
        <>
          <mesh position={[-1.2, 0.245, -0.88]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.42, 28]} />
            <meshStandardMaterial color="#3b82f6" transparent opacity={0.23} roughness={0.25} />
          </mesh>
          <mesh position={[1.3, 0.246, 0.92]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.36, 28]} />
            <meshStandardMaterial color="#38bdf8" transparent opacity={0.22} roughness={0.25} />
          </mesh>
        </>
      )}
      {stage >= 1 && (
        <group>
          <Box position={[0, 0.25, -1.84]} scale={[5.28, 0.06, 0.05]} color="#facc15" />
          <Box position={[0, 0.25, 1.84]} scale={[5.28, 0.06, 0.05]} color="#facc15" />
          <Box position={[-2.64, 0.25, 0]} scale={[0.05, 0.06, 3.68]} color="#facc15" />
          <Box position={[2.64, 0.25, 0]} scale={[0.05, 0.06, 3.68]} color="#facc15" />
          <Text position={[0, 0.55, -2.15]} fontSize={0.22} color="#713f12" anchorX="center">
            10m × 4m = 40m² garden bed
          </Text>
        </group>
      )}
      {stage >= 1 && cropRows.map((z, rowIndex) => (
        <group key={z}>
          <Box position={[0, 0.28, z]} scale={[4.85, 0.035, 0.035]} color="#facc15" />
          {cropXs.map((x, plantIndex) => (
            <RealisticPlant
              key={`${x}-${z}`}
              position={[x, 0.22, z + 0.12]}
              watered={watered}
              index={rowIndex * cropXs.length + plantIndex}
            />
          ))}
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
        <meshStandardMaterial color={watered ? '#22c55e' : '#f97316'} emissive={watered ? '#16a34a' : '#ea580c'} emissiveIntensity={0.28} roughness={0.5} />
      </mesh>
      <Box position={[0, 0.24, -0.35]} scale={[0.88, 0.38, 0.09]} color="#0f172a" />
      <Text position={[0, 0.29, -0.42]} fontSize={0.13} color={watered ? '#bbf7d0' : '#fde68a'} anchorX="center">
        {watered ? '68% MOIST' : '25% DRY'}
      </Text>
      <Text position={[0, 1.25, 0.05]} fontSize={0.16} color="#334155" anchorX="center">
        Soil sensor
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
    <group position={[3.65, 0, -1.25]}>
      <Cylinder position={[0, 1.0, 0]} radius={0.62} height={1.8} color="#075985" metalness={0.18} roughness={0.42} />
      <mesh ref={waterRef} position={[0, 1.0, 0]} castShadow>
        <cylinderGeometry args={[0.58, 0.58, 1.48, 32]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.72} roughness={0.18} />
      </mesh>
      <Cylinder position={[-0.45, 0.25, -0.45]} radius={0.045} height={0.5} color="#475569" />
      <Cylinder position={[0.45, 0.25, -0.45]} radius={0.045} height={0.5} color="#475569" />
      <Cylinder position={[-0.45, 0.25, 0.45]} radius={0.045} height={0.5} color="#475569" />
      <Cylinder position={[0.45, 0.25, 0.45]} radius={0.045} height={0.5} color="#475569" />
      <Cylinder position={[-0.7, 0.95, 0]} radius={0.035} height={0.45} color="#0f172a" rotation={[0, 0, Math.PI / 2]} />
      <mesh position={[-0.95, 0.95, 0]} castShadow>
        <torusGeometry args={[0.11, 0.018, 12, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.55, 0.64]} castShadow>
        <circleGeometry args={[0.18, 28]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>
      <Text position={[0, 2.15, 0.05]} fontSize={0.22} color="#082f49" anchorX="center">
        80L smart tank
      </Text>
    </group>
  );
}

function Pipes({ active }: { active: boolean }) {
  const pipeColor = active ? '#38bdf8' : '#0369a1';
  return (
    <group>
      <Cylinder position={[2.85, 0.36, -1.15]} radius={0.06} height={1.45} color={pipeColor} rotation={[0, 0, Math.PI / 2]} metalness={0.12} />
      <Cylinder position={[2.15, 0.36, 0]} radius={0.06} height={2.3} color={pipeColor} rotation={[Math.PI / 2, 0, 0]} metalness={0.12} />
      <mesh position={[2.15, 0.36, -1.15]} castShadow>
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshStandardMaterial color="#0ea5e9" roughness={0.28} metalness={0.16} />
      </mesh>
      {cropRows.map((z) => (
        <group key={z}>
          <Cylinder position={[0, 0.36, z]} radius={0.047} height={4.85} color={pipeColor} rotation={[0, 0, Math.PI / 2]} metalness={0.12} />
          <mesh position={[-2.45, 0.36, z]} castShadow>
            <sphereGeometry args={[0.075, 14, 10]} />
            <meshStandardMaterial color="#0284c7" metalness={0.18} roughness={0.3} />
          </mesh>
          <mesh position={[2.45, 0.36, z]} castShadow>
            <sphereGeometry args={[0.075, 14, 10]} />
            <meshStandardMaterial color="#0284c7" metalness={0.18} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterDroplets({ active }: { active: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current || !active) return;
    groupRef.current.children.forEach((child, index) => {
      const mesh = child as THREE.Mesh;
      const phase = (state.clock.elapsedTime * 1.8 + index * 0.34) % 1;
      mesh.position.y = 0.65 + Math.sin(phase * Math.PI) * 0.55;
      mesh.scale.setScalar(0.65 + phase * 0.9);
    });
  });

  if (!active) return null;
  return (
    <group ref={groupRef}>
      {sprinklerPoints.flatMap(([x, z], pointIndex) => [0, 1, 2].map((drop) => (
        <mesh key={`${pointIndex}-${drop}`} position={[x + (drop - 1) * 0.28, 0.85, z + 0.2 * Math.sin(drop)]} castShadow>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#bae6fd" transparent opacity={0.72} roughness={0.16} />
        </mesh>
      )))}
    </group>
  );
}

function Sprinkler({ position, active }: { position: Vec3; active: boolean }) {
  const sprayRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (sprayRef.current) {
      const pulse = active ? 1 + Math.sin(state.clock.elapsedTime * 5) * 0.08 : 0.75;
      sprayRef.current.scale.set(pulse, pulse, pulse);
      sprayRef.current.rotation.y += active ? 0.035 : 0;
    }
    if (headRef.current) headRef.current.rotation.y += active ? 0.04 : 0;
  });
  return (
    <group position={position}>
      <Cylinder position={[0, 0.22, 0]} radius={0.045} height={0.38} color="#0f172a" />
      <mesh ref={headRef} position={[0, 0.45, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.4} metalness={0.12} />
      </mesh>
      <group ref={sprayRef} visible={active} position={[0, 0.56, 0]}>
        {[0, Math.PI / 3, Math.PI * 0.67, Math.PI, Math.PI * 1.33, Math.PI * 1.67].map((rotation) => (
          <mesh key={rotation} rotation={[0, rotation, -0.72]} position={[0.45 * Math.cos(rotation), 0.2, 0.45 * Math.sin(rotation)]}>
            <coneGeometry args={[0.075, 0.82, 12]} />
            <meshStandardMaterial color="#bae6fd" transparent opacity={0.48} roughness={0.18} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ControllerPanel({ active }: { active: boolean }) {
  return (
    <group position={[-4.0, 0, 1.55]}>
      <Box position={[0, 0.7, 0]} scale={[0.95, 1.05, 0.14]} color="#0f172a" />
      <Box position={[0, 1.0, -0.09]} scale={[0.7, 0.22, 0.03]} color={active ? '#22c55e' : '#475569'} />
      <mesh position={[-0.24, 0.75, -0.09]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={active ? '#22c55e' : '#facc15'} emissive={active ? '#16a34a' : '#ca8a04'} emissiveIntensity={active ? 0.55 : 0.2} />
      </mesh>
      <mesh position={[0.24, 0.75, -0.09]} castShadow>
        <sphereGeometry args={[0.09, 16, 12]} />
        <meshStandardMaterial color={active ? '#38bdf8' : '#64748b'} emissive={active ? '#0ea5e9' : '#000000'} emissiveIntensity={active ? 0.55 : 0} />
      </mesh>
      <Text position={[0, 0.45, -0.1]} fontSize={0.12} color="#e0f2fe" anchorX="center">
        AUTO WATER
      </Text>
      <Text position={[0, 1.32, 0.05]} fontSize={0.15} color="#0f172a" anchorX="center">
        Smart controller
      </Text>
    </group>
  );
}

function GardenEnvironment({ watered }: { watered: boolean }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 11]} />
        <meshStandardMaterial color={watered ? '#86efac' : '#a7f3d0'} roughness={0.92} />
      </mesh>
      <Box position={[0, 0.035, 3.25]} scale={[14, 0.07, 1.2]} color="#65a30d" />
      <Box position={[0, 0.05, -3.85]} scale={[14, 0.08, 0.5]} color="#d6d3d1" />
      <Cylinder position={[-6.5, 0.08, -0.2]} radius={0.035} height={7.6} color="#a16207" rotation={[Math.PI / 2, 0, 0]} />
      <Cylinder position={[6.5, 0.08, -0.2]} radius={0.035} height={7.6} color="#a16207" rotation={[Math.PI / 2, 0, 0]} />
      <Building position={[-5.2, 0, -2.8]} title="SCHOOL" color="#fef3c7" />
      <Building position={[5.25, 0, 2.5]} title="FARM SHED" color="#fee2e2" />
      <Tree position={[-5.7, 0, 1.8]} />
      <Tree position={[5.6, 0, -2.5]} />
      <Tree position={[4.7, 0, -3.4]} />
      <Tree position={[-4.6, 0, 2.9]} />
    </group>
  );
}

function IrrigationScene({ stage, testing }: { stage: number; testing: boolean }) {
  const watered = stage >= 6 && testing;
  return (
    <>
      <ambientLight intensity={0.82} />
      <directionalLight position={[5, 8, 5]} intensity={1.15} castShadow shadow-mapSize={[1536, 1536]} />
      <Sky sunPosition={[10, 12, 6]} turbidity={3.6} rayleigh={0.55} />
      <GardenEnvironment watered={watered} />
      <GardenBed stage={stage} watered={watered} />
      {stage >= 2 && <MoistureSensor watered={watered} />}
      {stage >= 3 && <WaterTank active={watered} />}
      {stage >= 4 && <Pipes active={watered} />}
      {stage >= 5 && sprinklerPoints.map(([x, z]) => <Sprinkler key={`${x}-${z}`} position={[x, 0.36, z]} active={watered} />)}
      {stage >= 5 && <WaterDroplets active={watered} />}
      {stage >= 6 && <ControllerPanel active={watered} />}
      {stage >= 6 && (
        <Text position={[0, 2.55, 2.35]} fontSize={0.24} color={watered ? '#166534' : '#0f172a'} anchorX="center">
          {watered ? 'Garden watered: leaves are greener and flowers bloom!' : 'System ready for test'}
        </Text>
      )}
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={14} target={[0, 0.7, 0]} />
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
          <p className="irrigation3d-eyebrow">Realistic 3D Farm Technology Builder</p>
          <h3>Build a Smart Irrigation System</h3>
          <span>{stage}/6 stages built</span>
        </div>
        <strong className={stage === 6 ? 'ready' : ''}>{stage === 6 ? 'Ready to water crops' : 'Solve to build'}</strong>
      </div>

      <div className="irrigation3d-canvas" role="img" aria-label="Interactive realistic 3D smart irrigation construction scene">
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
        .irrigation3d-shell { width: 100%; min-height: 560px; border-radius: 26px; background: linear-gradient(135deg, #f0fdf4, #dcfce7 45%, #e0f2fe); border: 1px solid rgba(34, 197, 94, 0.24); box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); padding: 1rem; display: grid; gap: 0.85rem; }
        .irrigation3d-header, .irrigation3d-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; border-radius: 18px; background: rgba(255, 255, 255, 0.9); padding: 0.85rem 1rem; box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18); }
        .irrigation3d-eyebrow { margin: 0; color: #16a34a; font-size: 0.78rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; }
        .irrigation3d-header h3 { margin: 0.15rem 0; color: #0f172a; font-size: clamp(1.2rem, 2vw, 1.75rem); }
        .irrigation3d-header span { color: #475569; font-weight: 800; }
        .irrigation3d-header strong { background: #dcfce7; color: #15803d; border-radius: 999px; padding: 0.55rem 0.85rem; white-space: nowrap; }
        .irrigation3d-header strong.ready { background: #bbf7d0; color: #166534; }
        .irrigation3d-canvas { height: clamp(460px, 59vh, 660px); overflow: hidden; border-radius: 22px; background: linear-gradient(#bfdbfe, #dcfce7); border: 1px solid rgba(34, 197, 94, 0.24); }
        .irrigation3d-controls p { margin: 0; color: #334155; font-weight: 800; line-height: 1.45; }
        .irrigation3d-controls button { border: 0; border-radius: 999px; padding: 0.75rem 1rem; background: linear-gradient(135deg, #16a34a, #0284c7); color: white; font-weight: 900; cursor: pointer; box-shadow: 0 14px 30px rgba(22, 163, 74, 0.28); white-space: nowrap; }
        @media (max-width: 760px) { .irrigation3d-shell { padding: 0.75rem; min-height: 480px; } .irrigation3d-header, .irrigation3d-controls { align-items: flex-start; flex-direction: column; } .irrigation3d-canvas { height: 450px; } }
      `}</style>
    </section>
  );
}
