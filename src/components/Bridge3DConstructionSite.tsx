import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Bridge3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type Vec3 = [number, number, number];

type RevealProps = {
  show: boolean;
  children: ReactNode;
  delay?: number;
};

function Reveal({ show, children, delay = 0 }: RevealProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = show ? 1 : 0;
    progress.current = THREE.MathUtils.damp(progress.current, target, 7, delta);
    const scale = Math.max(0.001, progress.current);
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.y = (1 - progress.current) * 0.24 + delay;
  });

  if (!show) return null;
  return <group ref={groupRef}>{children}</group>;
}

function FlowingRiver() {
  const wavesRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (wavesRef.current) {
      wavesRef.current.position.z += delta * 1.05;
      if (wavesRef.current.position.z > 0.72) wavesRef.current.position.z = -0.72;
    }
    if (waterRef.current) {
      waterRef.current.position.y = 0.035 + Math.sin(state.clock.elapsedTime * 2.4) * 0.03;
    }
  });

  const waveLines = useMemo(() => Array.from({ length: 21 }, (_, index) => index - 10), []);

  return (
    <group>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[3.25, 13.4]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.82} roughness={0.22} metalness={0.05} />
      </mesh>
      <group ref={wavesRef} position={[0, 0.085, 0]}>
        {waveLines.map((z) => (
          <mesh key={z} position={[0, 0, z * 0.68]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.45, 0.035]} />
            <meshBasicMaterial color="#ecfeff" transparent opacity={0.62} />
          </mesh>
        ))}
      </group>
      {[-1.82, 1.82].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.48, 13.2]} />
          <meshStandardMaterial color="#a16207" roughness={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.85, 10]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.02, 0]} castShadow>
        <coneGeometry args={[0.5, 0.9, 12]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0.05, 1.38, 0.02]} castShadow>
        <coneGeometry args={[0.38, 0.75, 12]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function SimpleBuilding({ position, color, roofColor, label }: { position: Vec3; color: string; roofColor: string; label?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.85, 0.55, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.55} />
      </mesh>
      <mesh position={[0.02, 0.23, -0.47]}>
        <boxGeometry args={[0.24, 0.42, 0.04]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[-0.32, 0.55, -0.48]}>
        <boxGeometry args={[0.22, 0.22, 0.035]} />
        <meshStandardMaterial color="#bae6fd" emissive="#60a5fa" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.36, 0.55, -0.48]}>
        <boxGeometry args={[0.22, 0.22, 0.035]} />
        <meshStandardMaterial color="#bae6fd" emissive="#60a5fa" emissiveIntensity={0.1} />
      </mesh>
      {label && (
        <Text position={[0, 1.65, -0.05]} rotation={[-0.45, 0, 0]} fontSize={0.18} color="#1e1b4b" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

type HumanFigureProps = {
  position: Vec3;
  shirtColor?: string;
  pantsColor?: string;
  skinColor?: string;
  hairColor?: string;
  cheering?: boolean;
  walking?: boolean;
};

function HumanFigure({
  position,
  shirtColor = '#2563eb',
  pantsColor = '#1e293b',
  skinColor = '#d39b72',
  hairColor = '#111827',
  cheering = false,
  walking = false,
}: HumanFigureProps) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame((state) => {
    const wave = Math.sin(state.clock.elapsedTime * 6.2);
    const armSwing = walking ? wave * 0.52 : 0;
    const legSwing = walking ? wave * 0.34 : 0;
    const cheerLift = cheering ? 2.2 + Math.sin(state.clock.elapsedTime * 8) * 0.16 : 0.38;

    if (leftArm.current) leftArm.current.rotation.z = cheering ? cheerLift : 0.5 + armSwing;
    if (rightArm.current) rightArm.current.rotation.z = cheering ? -cheerLift : -0.5 - armSwing;
    if (leftLeg.current) leftLeg.current.rotation.x = legSwing;
    if (rightLeg.current) rightLeg.current.rotation.x = -legSwing;
    if (head.current) head.current.rotation.y = Math.sin(state.clock.elapsedTime * 2.2) * 0.05;
  });

  return (
    <group position={position}>
      <group ref={head}>
        <mesh position={[0, 0.92, 0.02]} castShadow>
          <sphereGeometry args={[0.15, 28, 28]} />
          <meshStandardMaterial color={skinColor} roughness={0.48} />
        </mesh>
        <mesh position={[0, 1.035, 0]} scale={[1, 0.55, 1]} castShadow>
          <sphereGeometry args={[0.145, 22, 16]} />
          <meshStandardMaterial color={hairColor} roughness={0.82} />
        </mesh>
        <mesh position={[-0.052, 0.94, 0.14]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0.052, 0.94, 0.14]}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[0, 0.895, 0.155]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.012, 0.052, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.85, 0.148]}>
          <boxGeometry args={[0.07, 0.012, 0.012]} />
          <meshStandardMaterial color="#7f1d1d" />
        </mesh>
      </group>

      <mesh position={[0, 0.71, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.095, 0.16, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.48, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.44, 12, 20]} />
        <meshStandardMaterial color={shirtColor} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.28, 0.005]} castShadow>
        <boxGeometry args={[0.27, 0.12, 0.18]} />
        <meshStandardMaterial color={pantsColor} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.54, -0.14]} castShadow>
        <boxGeometry args={[0.28, 0.32, 0.085]} />
        <meshStandardMaterial color="#111827" roughness={0.74} />
      </mesh>
      <mesh position={[-0.13, 0.65, -0.14]} rotation={[0.3, 0, -0.24]} castShadow>
        <capsuleGeometry args={[0.018, 0.26, 8, 10]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0.13, 0.65, -0.14]} rotation={[0.3, 0, 0.24]} castShadow>
        <capsuleGeometry args={[0.018, 0.26, 8, 10]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <group ref={leftArm} position={[-0.16, 0.57, 0]} rotation={[0, 0, 0.52]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 8, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.032, 0.18, 8, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} />
        </mesh>
        <mesh position={[0, -0.45, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.16, 0.57, 0]} rotation={[0, 0, -0.52]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.22, 8, 12]} />
          <meshStandardMaterial color={shirtColor} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.032, 0.18, 8, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} />
        </mesh>
        <mesh position={[0, -0.45, 0]} castShadow>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.52} />
        </mesh>
      </group>

      <group ref={leftLeg} position={[-0.075, 0.21, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.24, 8, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.038, 0.18, 8, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.45, 0.055]} castShadow>
          <boxGeometry args={[0.13, 0.045, 0.22]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.085, 0.21, 0]}>
        <mesh position={[0, -0.13, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.24, 8, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.33, 0]} castShadow>
          <capsuleGeometry args={[0.038, 0.18, 8, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.45, 0.055]} castShadow>
          <boxGeometry args={[0.13, 0.045, 0.22]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      </group>
    </group>
  );
}

function TestingCrowd({ visible, testing, resetKey, crossed, onDone }: { visible: boolean; testing: boolean; resetKey: number; crossed: boolean; onDone: () => void }) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const progress = useRef([0, 0, 0, 0]);
  const done = useRef(false);
  const zOffsets = useMemo(() => [-0.44, -0.14, 0.16, 0.46], []);
  const shirts = useMemo(() => ['#f97316', '#2563eb', '#16a34a', '#db2777'], []);
  const pants = useMemo(() => ['#1e293b', '#334155', '#172554', '#3f3f46'], []);
  const skins = useMemo(() => ['#6f3d2e', '#a7643e', '#d39b72', '#8a4b30'], []);
  const hair = useMemo(() => ['#111827', '#1f2937', '#3f230f', '#0f172a'], []);

  useEffect(() => {
    progress.current = [0, 0, 0, 0];
    done.current = false;
    groupRefs.current.forEach((group, index) => {
      if (!group) return;
      group.position.set(-3.18 - index * 0.14, 1.34, zOffsets[index]);
      group.rotation.y = Math.PI / 2;
    });
  }, [resetKey, zOffsets]);

  useFrame((state, delta) => {
    if (!testing || done.current) return;
    let allDone = true;
    groupRefs.current.forEach((group, index) => {
      if (!group) return;
      progress.current[index] = Math.min(1, progress.current[index] + delta * (0.24 - index * 0.01));
      const t = progress.current[index];
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      group.position.x = THREE.MathUtils.lerp(-3.18 - index * 0.14, 3.22 + index * 0.12, eased);
      group.position.y = 1.34 + Math.sin(state.clock.elapsedTime * 8 + index) * 0.018;
      group.position.z = zOffsets[index];
      group.rotation.y = Math.PI / 2;
      if (t < 1) allDone = false;
    });

    if (allDone) {
      done.current = true;
      onDone();
    }
  });

  if (!visible) return null;

  return (
    <group>
      {zOffsets.map((z, index) => (
        <group
          key={z}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
          position={[-3.18 - index * 0.14, 1.34, z]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <HumanFigure
            position={[0, 0, 0]}
            shirtColor={shirts[index]}
            pantsColor={pants[index]}
            skinColor={skins[index]}
            hairColor={hair[index]}
            walking={testing && !crossed}
            cheering={crossed}
          />
        </group>
      ))}
      {crossed && (
        <Text position={[3.25, 2.58, 0]} rotation={[-0.25, -0.8, 0]} fontSize={0.18} color="#065f46" anchorX="center">
          Safe crossing! 👏
        </Text>
      )}
    </group>
  );
}

function Clouds() {
  const cloudRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!cloudRef.current) return;
    cloudRef.current.position.x += delta * 0.13;
    if (cloudRef.current.position.x > 5.8) cloudRef.current.position.x = -5.8;
  });

  return (
    <group ref={cloudRef} position={[-2.8, 4.5, -3.8]}>
      {[0, 0.32, 0.66].map((x, index) => (
        <mesh key={x} position={[x, index === 1 ? 0.08 : 0, 0]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.86} />
        </mesh>
      ))}
    </group>
  );
}

function BridgePieces({ stage }: { stage: number }) {
  const deckPlanks = [-0.95, -0.55, -0.15, 0.25, 0.65, 1.05];
  const railPosts = [-2.35, -1.45, -0.55, 0.35, 1.25, 2.15];

  return (
    <group>
      <Reveal show={stage >= 1}>
        <mesh position={[0, 0.22, -0.82]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 5.25, 12]} />
          <meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={0.15} />
        </mesh>
        <Text position={[0, 0.55, -1.02]} fontSize={0.16} color="#7c2d12" anchorX="center">
          Span measured
        </Text>
        {[-2.55, 2.55].map((x) => (
          <mesh key={x} position={[x, 0.33, -0.82]} castShadow>
            <boxGeometry args={[0.08, 0.66, 0.08]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}
      </Reveal>

      <Reveal show={stage >= 2}>
        {[-2.25, 2.25].map((x) => (
          <group key={x} position={[x, 0.14, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.92, 0.28, 1.52]} />
              <meshStandardMaterial color="#9ca3af" roughness={0.84} />
            </mesh>
            <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.72, 0.18, 1.22]} />
              <meshStandardMaterial color="#d1d5db" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </Reveal>

      <Reveal show={stage >= 3}>
        {[-2.25, -1.1, 1.1, 2.25].map((x) => (
          <group key={x} position={[x, 0.55, 0]}>
            {[-0.52, 0.52].map((z) => (
              <mesh key={z} position={[0, 0, z]} castShadow>
                <cylinderGeometry args={[0.09, 0.12, 0.95, 14]} />
                <meshStandardMaterial color="#6b7280" roughness={0.72} />
              </mesh>
            ))}
          </group>
        ))}
      </Reveal>

      <Reveal show={stage >= 4}>
        <mesh position={[0, 1.08, 0]} castShadow receiveShadow>
          <boxGeometry args={[5.25, 0.2, 1.28]} />
          <meshStandardMaterial color="#92400e" roughness={0.68} />
        </mesh>
        {deckPlanks.map((x) => (
          <mesh key={x} position={[x, 1.23, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.32, 0.08, 1.45]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
        ))}
      </Reveal>

      <Reveal show={stage >= 5}>
        {[-0.78, 0.78].map((z) => (
          <group key={z}>
            <mesh position={[0, 1.72, z]} castShadow>
              <boxGeometry args={[5.55, 0.08, 0.08]} />
              <meshStandardMaterial color="#7c2d12" roughness={0.7} />
            </mesh>
            {railPosts.map((x) => (
              <mesh key={`${x}-${z}`} position={[x, 1.48, z]} castShadow>
                <boxGeometry args={[0.08, 0.62, 0.08]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.72} />
              </mesh>
            ))}
          </group>
        ))}
        {[-1.75, -0.7, 0.35, 1.4].map((x) => (
          <mesh key={x} position={[x, 1.45, -0.79]} rotation={[0, 0, -0.5]} castShadow>
            <boxGeometry args={[0.08, 0.98, 0.08]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
        ))}
        {[-1.4, -0.35, 0.7, 1.75].map((x) => (
          <mesh key={x} position={[x, 1.45, 0.79]} rotation={[0, 0, 0.5]} castShadow>
            <boxGeometry args={[0.08, 0.98, 0.08]} />
            <meshStandardMaterial color="#a16207" />
          </mesh>
        ))}
      </Reveal>

      <Reveal show={stage >= 6}>
        <mesh position={[2.98, 1.62, -0.9]} rotation={[0, -0.35, 0]} castShadow>
          <boxGeometry args={[0.58, 0.36, 0.06]} />
          <meshStandardMaterial color="#22c55e" emissive="#166534" emissiveIntensity={0.08} />
        </mesh>
        <Text position={[2.98, 1.63, -0.94]} rotation={[0, -0.35, 0]} fontSize={0.08} color="#052e16" anchorX="center">
          SAFE\nCROSSING
        </Text>
      </Reveal>
    </group>
  );
}

function Scene({ stage, testing, resetKey, crossed, onDone }: { stage: number; testing: boolean; resetKey: number; crossed: boolean; onDone: () => void }) {
  return (
    <>
      <Sky sunPosition={[4, 6, 3]} turbidity={5} rayleigh={1.2} />
      <ambientLight intensity={0.58} />
      <directionalLight position={[5, 7, 4]} intensity={1.55} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14.4, 11.4]} />
          <meshStandardMaterial color="#86efac" roughness={0.9} />
        </mesh>
        <FlowingRiver />
        <BridgePieces stage={stage} />
        <SimpleBuilding position={[-4.85, 0, -2.7]} color="#fde68a" roofColor="#b91c1c" label="Homes" />
        <SimpleBuilding position={[-4.2, 0, 2.45]} color="#fed7aa" roofColor="#c2410c" />
        <SimpleBuilding position={[4.75, 0, 2.3]} color="#bfdbfe" roofColor="#3730a3" label="School" />
        <SimpleBuilding position={[4.9, 0, -2.4]} color="#ddd6fe" roofColor="#6d28d9" label="Community" />
        {[-5.65, -3.45, 3.4, 5.65].map((x, index) => (
          <Tree key={x} position={[x, 0, index % 2 === 0 ? -0.1 : 3.65]} />
        ))}
        {[-4.8, -3.8, 3.4, 4.3].map((x, index) => (
          <mesh key={x} position={[x, 0.08, index % 2 === 0 ? 0.95 : -1.1]} castShadow>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#78716c" roughness={0.95} />
          </mesh>
        ))}
        {stage < 6 && (
          <>
            <HumanFigure position={[-3.25, 0.05, -0.2]} shirtColor="#2563eb" skinColor="#8a4b30" />
            <HumanFigure position={[-3.55, 0.05, 0.55]} shirtColor="#16a34a" skinColor="#d39b72" />
          </>
        )}
        <TestingCrowd visible={stage >= 6} testing={testing} resetKey={resetKey} crossed={crossed} onDone={onDone} />
      </group>
      <Clouds />
      <OrbitControls makeDefault enablePan enableZoom minDistance={4.4} maxDistance={12.5} maxPolarAngle={Math.PI / 2.08} target={[0, 1.2, 0]} />
    </>
  );
}

export default function Bridge3DConstructionSite({ buildStage, feedback }: Bridge3DConstructionSiteProps) {
  const stage = Math.min(Math.max(buildStage, 0), 6);
  const [testing, setTesting] = useState(false);
  const [crossed, setCrossed] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const startTest = () => {
    if (stage < 6) return;
    setCrossed(false);
    setTesting(true);
    setResetKey((value) => value + 1);
  };

  const resetTest = () => {
    setTesting(false);
    setCrossed(false);
    setResetKey((value) => value + 1);
  };

  const markDone = () => {
    setTesting(false);
    setCrossed(true);
  };

  return (
    <section className="bridge-3d-shell" aria-label="Animated 3D bridge builder scene">
      <div className="bridge-3d-scene-header">
        <div>
          <p className="bridge-3d-eyebrow">3D Bridge Builder</p>
          <h3>Wide Real Animated Construction Mode</h3>
          <p>Rotate, zoom, and watch the bridge grow as you solve each maths step.</p>
        </div>
        <strong>{stage}/6 built</strong>
      </div>

      <div className="bridge-3d-canvas-wrap">
        <Canvas shadows camera={{ position: [6.3, 4.15, 6.55], fov: 39 }}>
          <Scene stage={stage} testing={testing} resetKey={resetKey} crossed={crossed} onDone={markDone} />
        </Canvas>
      </div>

      <div className="bridge-3d-control-panel">
        {stage >= 6 ? (
          <div className="bridge-3d-complete-copy">
            <strong>✅ Questions Set Complete</strong>
            <span>The bridge is fully built. You can now run the movement test below.</span>
          </div>
        ) : (
          <span>{feedback || 'Solve each bridge question above to add the next real 3D construction part.'}</span>
        )}
        <div className="bridge-3d-control-actions">
          {stage >= 6 && (
            <button type="button" onClick={startTest} disabled={testing} aria-label="Test the completed 3D bridge with four learners">
              {testing ? 'Testing four learners...' : 'Test Bridge Movement'}
            </button>
          )}
          {(testing || crossed) && (
            <button type="button" className="secondary" onClick={resetTest} aria-label="Reset the 3D bridge crossing test">
              Reset Movement Test
            </button>
          )}
        </div>
      </div>

      {crossed && <div className="bridge-3d-success">Bridge Complete — Four learners crossed safely and applauded! 👏</div>}

      <style>{`
        .bridge-3d-shell{position:relative;overflow:hidden;width:100%;border-radius:28px;background:linear-gradient(135deg,#e0f2fe,#eef2ff 48%,#dcfce7);border:1px solid rgba(99,102,241,.16);box-shadow:0 24px 70px rgba(30,41,59,.14);color:#0f172a}
        .bridge-3d-scene-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:1rem 1.1rem .75rem;background:rgba(255,255,255,.72);border-bottom:1px solid rgba(99,102,241,.14)}
        .bridge-3d-scene-header h3{margin:.1rem 0 .25rem;color:#1e1b4b;font-size:1rem}.bridge-3d-scene-header p{margin:0;color:#475569;line-height:1.38;font-size:.86rem}.bridge-3d-eyebrow{color:#4f46e5!important;font-weight:900;text-transform:uppercase;letter-spacing:.09em;font-size:.68rem!important}.bridge-3d-scene-header>strong{padding:.7rem .9rem;border-radius:999px;color:#312e81;white-space:nowrap;background:white;border:1px solid rgba(79,70,229,.14)}
        .bridge-3d-canvas-wrap{min-height:520px;height:min(58vw,720px);max-height:760px;width:100%;background:linear-gradient(180deg,#dbeafe,#f0f9ff)}.bridge-3d-canvas-wrap canvas{display:block;width:100%!important;height:100%!important}
        .bridge-3d-control-panel{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.1rem;background:rgba(255,255,255,.9);border-top:1px solid rgba(99,102,241,.14);color:#334155;font-weight:800}.bridge-3d-complete-copy{display:grid;gap:.25rem}.bridge-3d-complete-copy strong{color:#065f46}.bridge-3d-complete-copy span{color:#475569;font-weight:700}.bridge-3d-control-actions{display:flex;gap:.65rem;flex-wrap:wrap;justify-content:flex-end}.bridge-3d-control-panel button{border:0;border-radius:999px;padding:.78rem 1.05rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;font-weight:900;cursor:pointer;box-shadow:0 12px 24px rgba(79,70,229,.24)}.bridge-3d-control-panel button:disabled{opacity:.72;cursor:wait}.bridge-3d-control-panel button.secondary{background:#f8fafc;color:#312e81;border:1px solid rgba(79,70,229,.18);box-shadow:none}.bridge-3d-success{margin:1rem 1.1rem 1.1rem;padding:1rem 1.25rem;border-radius:20px;color:#065f46;background:#dcfce7;border:1px solid rgba(16,185,129,.24);font-size:1.05rem;font-weight:1000;text-align:center}.bridge-3d-shell:focus-within{outline:3px solid rgba(14,165,233,.35);outline-offset:4px}
        @media (max-width:760px){.bridge-3d-scene-header,.bridge-3d-control-panel{flex-direction:column;align-items:flex-start}.bridge-3d-canvas-wrap{min-height:420px;height:68vh}.bridge-3d-control-actions{width:100%}.bridge-3d-control-panel button{width:100%}}
      `}</style>
    </section>
  );
}
