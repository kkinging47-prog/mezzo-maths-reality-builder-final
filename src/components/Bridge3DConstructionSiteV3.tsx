import { ReactNode, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type Bridge3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type Vec3 = [number, number, number];
type WalkerPhase = 'waiting' | 'walking' | 'cheering';

const SOLDIER_MODEL_URL = 'https://threejs.org/examples/models/gltf/Soldier.glb';

function Reveal({ show, children }: { show: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!ref.current) return;
    progress.current = THREE.MathUtils.damp(progress.current, show ? 1 : 0, 7, delta);
    const scale = Math.max(0.001, progress.current);
    ref.current.scale.setScalar(scale);
    ref.current.position.y = (1 - progress.current) * 0.2;
  });

  if (!show) return null;
  return <group ref={ref}>{children}</group>;
}

function FlowingRiver() {
  const wavesRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);
  const waveLines = useMemo(() => Array.from({ length: 19 }, (_, index) => index - 9), []);

  useFrame((state, delta) => {
    if (wavesRef.current) {
      wavesRef.current.position.z += delta * 1.15;
      if (wavesRef.current.position.z > 0.7) wavesRef.current.position.z = -0.7;
    }
    if (waterRef.current) waterRef.current.position.y = 0.035 + Math.sin(state.clock.elapsedTime * 2.2) * 0.025;
  });

  return (
    <group>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[3.05, 12.6]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.82} roughness={0.24} />
      </mesh>
      <group ref={wavesRef} position={[0, 0.085, 0]}>
        {waveLines.map((z) => (
          <mesh key={z} position={[0, 0, z * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.32, 0.032]} />
            <meshBasicMaterial color="#ecfeff" transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
      {[-1.68, 1.68].map((x) => (
        <mesh key={x} position={[x, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.42, 12.4]} />
          <meshStandardMaterial color="#92400e" roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: Vec3 }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.13, 0.84, 10]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.03, 0]} castShadow>
        <coneGeometry args={[0.52, 0.92, 14]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh position={[0.04, 1.42, 0.02]} castShadow>
        <coneGeometry args={[0.38, 0.76, 14]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Building({ position, color, roofColor, label }: { position: Vec3; color: string; roofColor: string; label?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.9, 0.9]} />
        <meshStandardMaterial color={color} roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.06, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.86, 0.56, 4]} />
        <meshStandardMaterial color={roofColor} roughness={0.56} />
      </mesh>
      <mesh position={[0.03, 0.23, -0.48]}>
        <boxGeometry args={[0.24, 0.42, 0.04]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {[-0.33, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.56, -0.49]}>
          <boxGeometry args={[0.22, 0.22, 0.035]} />
          <meshStandardMaterial color="#bae6fd" emissive="#60a5fa" emissiveIntensity={0.1} />
        </mesh>
      ))}
      {label && (
        <Text position={[0, 1.66, -0.05]} rotation={[-0.45, 0, 0]} fontSize={0.17} color="#1e1b4b" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

function FallbackHuman({ position, cheering = false, walking = false, shirt = '#2563eb', skin = '#8a4b30' }: { position: Vec3; cheering?: boolean; walking?: boolean; shirt?: string; skin?: string }) {
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  useFrame((state) => {
    const wave = Math.sin(state.clock.elapsedTime * 7);
    if (leftArm.current) leftArm.current.rotation.z = cheering ? 2.25 + wave * 0.12 : 0.52 + (walking ? wave * 0.48 : 0);
    if (rightArm.current) rightArm.current.rotation.z = cheering ? -2.25 - wave * 0.12 : -0.52 - (walking ? wave * 0.48 : 0);
    if (leftLeg.current) leftLeg.current.rotation.x = walking ? wave * 0.35 : 0;
    if (rightLeg.current) rightLeg.current.rotation.x = walking ? -wave * 0.35 : 0;
  });

  return (
    <group position={position} rotation={[0, Math.PI / 2, 0]}>
      <mesh position={[0, 0.92, 0.03]} castShadow>
        <sphereGeometry args={[0.15, 28, 28]} />
        <meshStandardMaterial color={skin} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.035, 0.02]} scale={[1, 0.55, 1]} castShadow>
        <sphereGeometry args={[0.148, 20, 14]} />
        <meshStandardMaterial color="#111827" roughness={0.82} />
      </mesh>
      {[-0.052, 0.052].map((x) => (
        <mesh key={x} position={[x, 0.94, 0.15]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}
      <mesh position={[0, 0.48, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.46, 12, 20]} />
        <meshStandardMaterial color={shirt} roughness={0.62} />
      </mesh>
      <mesh position={[0, 0.54, -0.15]} castShadow>
        <boxGeometry args={[0.28, 0.34, 0.09]} />
        <meshStandardMaterial color="#111827" roughness={0.75} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? leftArm : rightArm} position={[side * 0.16, 0.57, 0]} rotation={[0, 0, side * -0.52]}>
          <mesh position={[0, -0.15, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.24, 8, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.62} />
          </mesh>
          <mesh position={[0, -0.36, 0]} castShadow>
            <capsuleGeometry args={[0.033, 0.18, 8, 12]} />
            <meshStandardMaterial color={skin} roughness={0.52} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side} ref={side === -1 ? leftLeg : rightLeg} position={[side * 0.075, 0.21, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.25, 8, 12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.72} />
          </mesh>
          <mesh position={[0, -0.37, 0.055]} castShadow>
            <boxGeometry args={[0.13, 0.045, 0.22]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function RiggedLearnerAvatar({ position, walking, cheering, shirt }: { position: Vec3; walking: boolean; cheering: boolean; shirt: string }) {
  const group = useRef<THREE.Group>(null);
  const gltf = useGLTF(SOLDIER_MODEL_URL);
  const clonedScene = useMemo(() => clone(gltf.scene), [gltf.scene]);
  const { actions } = useAnimations(gltf.animations, group);

  const bones = useMemo(() => {
    const find = (part: string) => {
      let found: THREE.Object3D | undefined;
      clonedScene.traverse((item) => {
        if (!found && item.type === 'Bone' && item.name.toLowerCase().includes(part)) found = item;
      });
      return found;
    };
    return { leftArm: find('leftarm'), rightArm: find('rightarm'), leftForeArm: find('leftforearm'), rightForeArm: find('rightforearm') };
  }, [clonedScene]);

  useEffect(() => {
    Object.values(actions).forEach((action) => action?.fadeOut(0.08));
    if (walking && actions.Walk) {
      actions.Walk.reset().fadeIn(0.1).play();
      return () => actions.Walk?.fadeOut(0.1);
    }
    if (!cheering && actions.Idle) {
      actions.Idle.reset().fadeIn(0.12).play();
      return () => actions.Idle?.fadeOut(0.12);
    }
    return undefined;
  }, [actions, walking, cheering]);

  useEffect(() => {
    clonedScene.traverse((item) => {
      if (item instanceof THREE.Mesh) {
        item.castShadow = true;
        item.receiveShadow = true;
        const isBody = item.material && 'color' in item.material;
        if (isBody && item.name.toLowerCase().includes('body')) {
          (item.material as THREE.MeshStandardMaterial).color.set(shirt);
        }
      }
    });
  }, [clonedScene, shirt]);

  useFrame((state) => {
    if (!cheering) return;
    const wave = Math.sin(state.clock.elapsedTime * 8) * 0.15;
    bones.leftArm?.rotation.set(0.2, 0, 1.95 + wave);
    bones.rightArm?.rotation.set(0.2, 0, -1.95 - wave);
    bones.leftForeArm?.rotation.set(0, 0, 0.6 + wave);
    bones.rightForeArm?.rotation.set(0, 0, -0.6 - wave);
  });

  return (
    <group ref={group} position={position} rotation={[0, -Math.PI / 2, 0]} scale={[0.42, 0.42, 0.42]}>
      <primitive object={clonedScene} />
    </group>
  );
}

function LearnerAvatar(props: { position: Vec3; walking: boolean; cheering: boolean; shirt: string }) {
  return (
    <Suspense fallback={<FallbackHuman position={props.position} walking={props.walking} cheering={props.cheering} shirt={props.shirt} />}>
      <RiggedLearnerAvatar {...props} />
    </Suspense>
  );
}

function Staircase({ side }: { side: -1 | 1 }) {
  const steps = useMemo(() => Array.from({ length: 7 }, (_, index) => index), []);
  return (
    <group>
      {steps.map((step) => {
        const height = (step + 1) * 0.15;
        const x = side === -1 ? -3.32 + step * 0.13 : 3.32 - step * 0.13;
        return (
          <mesh key={`${side}-${step}`} position={[x, height / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.18, height, 1.18]} />
            <meshStandardMaterial color={step % 2 ? '#a16207' : '#b45309'} roughness={0.78} />
          </mesh>
        );
      })}
      <Text position={[side * 3.2, 0.28, -0.76]} rotation={[-0.25, side * 0.15, 0]} fontSize={0.08} color="#431407" anchorX="center">
        STEPS
      </Text>
    </group>
  );
}

function TestingLearners({ visible, testing, resetKey, crossed, onDone }: { visible: boolean; testing: boolean; resetKey: number; crossed: boolean; onDone: () => void }) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const elapsed = useRef(0);
  const done = useRef(false);
  const lanes = useMemo(() => [-0.42, -0.14, 0.14, 0.42], []);
  const shirts = useMemo(() => ['#f97316', '#2563eb', '#16a34a', '#db2777'], []);
  const phaseRef = useRef<WalkerPhase[]>(['waiting', 'waiting', 'waiting', 'waiting']);
  const [phases, setPhases] = useState<WalkerPhase[]>(['waiting', 'waiting', 'waiting', 'waiting']);

  useEffect(() => {
    elapsed.current = 0;
    done.current = false;
    phaseRef.current = ['waiting', 'waiting', 'waiting', 'waiting'];
    setPhases(['waiting', 'waiting', 'waiting', 'waiting']);
    groupRefs.current.forEach((group, index) => {
      group?.position.set(-3.35, 0.04, lanes[index]);
    });
  }, [resetKey, lanes]);

  useFrame((_, delta) => {
    if (!testing || done.current) return;
    elapsed.current += delta;
    let allDone = true;
    let phaseChanged = false;
    const nextPhases = [...phaseRef.current];

    groupRefs.current.forEach((group, index) => {
      if (!group) return;
      const delay = index * 3.1;
      const duration = 3.0;
      const local = elapsed.current - delay;
      const t = THREE.MathUtils.clamp(local / duration, 0, 1);
      let nextPhase: WalkerPhase = 'waiting';

      if (local < 0) {
        allDone = false;
        group.position.set(-3.35, 0.04, lanes[index]);
      } else if (t < 1) {
        allDone = false;
        nextPhase = 'walking';
        if (t <= 0.24) {
          const p = t / 0.24;
          group.position.x = THREE.MathUtils.lerp(-3.35, -2.55, p);
          group.position.y = THREE.MathUtils.lerp(0.04, 1.17, p);
        } else if (t <= 0.76) {
          const p = (t - 0.24) / 0.52;
          group.position.x = THREE.MathUtils.lerp(-2.55, 2.55, p);
          group.position.y = 1.17;
        } else {
          const p = (t - 0.76) / 0.24;
          group.position.x = THREE.MathUtils.lerp(2.55, 3.55 + index * 0.18, p);
          group.position.y = THREE.MathUtils.lerp(1.17, 0.04, p);
        }
        group.position.z = lanes[index];
        group.rotation.y = 0;
      } else {
        nextPhase = 'cheering';
        group.position.set(3.55 + index * 0.18, 0.04, lanes[index]);
        group.rotation.y = 0;
      }

      if (nextPhases[index] !== nextPhase) {
        nextPhases[index] = nextPhase;
        phaseChanged = true;
      }
    });

    if (phaseChanged) {
      phaseRef.current = nextPhases;
      setPhases(nextPhases);
    }

    if (allDone && elapsed.current > 12.3) {
      done.current = true;
      onDone();
    }
  });

  if (!visible) return null;

  return (
    <group>
      {lanes.map((z, index) => {
        const phase = crossed ? 'cheering' : phases[index];
        return (
          <group
            key={z}
            ref={(node) => {
              groupRefs.current[index] = node;
            }}
            position={[-3.35, 0.04, z]}
          >
            <LearnerAvatar position={[0, 0, 0]} walking={phase === 'walking'} cheering={phase === 'cheering'} shirt={shirts[index]} />
          </group>
        );
      })}
      {crossed && (
        <Text position={[3.15, 1.15, 0]} rotation={[-0.25, -0.75, 0]} fontSize={0.18} color="#065f46" anchorX="center">
          Safe crossing! 👏
        </Text>
      )}
    </group>
  );
}

function WaitingLearners() {
  return (
    <group>
      <FallbackHuman position={[-3.35, 0.04, -0.34]} shirt="#2563eb" skin="#8a4b30" />
      <FallbackHuman position={[-3.62, 0.04, 0.38]} shirt="#16a34a" skin="#d39b72" />
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
        <Staircase side={-1} />
        <Staircase side={1} />
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
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14.4, 11.4]} />
          <meshStandardMaterial color="#86efac" roughness={0.9} />
        </mesh>
        <FlowingRiver />
        <BridgePieces stage={stage} />
        <Building position={[-4.85, 0, -2.7]} color="#fde68a" roofColor="#b91c1c" label="Homes" />
        <Building position={[-4.2, 0, 2.45]} color="#fed7aa" roofColor="#c2410c" />
        <Building position={[4.75, 0, 2.3]} color="#bfdbfe" roofColor="#3730a3" label="School" />
        <Building position={[4.9, 0, -2.4]} color="#ddd6fe" roofColor="#6d28d9" label="Community" />
        {[[-5.65, -2.2], [-4.55, 3.65], [4.55, -3.4], [5.65, 3.65]].map(([x, z]) => (
          <Tree key={`${x}-${z}`} position={[x, 0, z]} />
        ))}
        {[-4.8, -3.8, 3.4, 4.3].map((x, index) => (
          <mesh key={x} position={[x, 0.08, index % 2 === 0 ? 0.95 : -1.1]} castShadow>
            <dodecahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#78716c" roughness={0.95} />
          </mesh>
        ))}
        {stage < 6 && <WaitingLearners />}
        <TestingLearners visible={stage >= 6} testing={testing} resetKey={resetKey} crossed={crossed} onDone={onDone} />
      </group>
      <Clouds />
      <OrbitControls makeDefault enablePan enableZoom minDistance={4.2} maxDistance={12.5} maxPolarAngle={Math.PI / 2.08} target={[0, 1.05, 0]} />
    </>
  );
}

export default function Bridge3DConstructionSite({ buildStage, feedback }: Bridge3DConstructionSiteProps) {
  const stage = Math.min(Math.max(buildStage, 0), 6);
  const [testing, setTesting] = useState(false);
  const [crossed, setCrossed] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

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

  return (
    <section className={`bridge-3d-shell ${fullscreen ? 'is-fullscreen' : ''}`} aria-label="Animated 3D bridge builder scene">
      <div className="bridge-3d-scene-header">
        <div>
          <p className="bridge-3d-eyebrow">3D Bridge Builder</p>
          <h3>Real Animated Construction Mode</h3>
          <p>Rotate, zoom, and watch the bridge grow as you solve each maths step.</p>
        </div>
        <div className="bridge-3d-header-actions">
          <strong>{stage}/6 built</strong>
          <button type="button" className="bridge-3d-fullscreen" onClick={() => setFullscreen((value) => !value)}>
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
          </button>
        </div>
      </div>

      <div className="bridge-3d-canvas-wrap">
        <Canvas shadows camera={{ position: [6.1, 3.65, 6.25], fov: 42 }}>
          <Scene stage={stage} testing={testing} resetKey={resetKey} crossed={crossed} onDone={() => { setTesting(false); setCrossed(true); }} />
        </Canvas>
      </div>

      <div className="bridge-3d-control-panel">
        <span>{stage >= 6 ? 'Questions Set Complete. Run the movement test when ready.' : feedback || 'Solve each bridge question above to add the next 3D construction part.'}</span>
        <div className="bridge-3d-control-actions">
          {stage >= 6 && (
            <button type="button" onClick={startTest} disabled={testing} aria-label="Test the completed 3D bridge one learner at a time">
              {testing ? 'Testing one learner at a time...' : 'Test Bridge Movement'}
            </button>
          )}
          {(testing || crossed) && (
            <button type="button" className="secondary" onClick={resetTest} aria-label="Reset the 3D bridge crossing test">
              Reset Movement Test
            </button>
          )}
        </div>
      </div>
      {crossed && <div className="bridge-3d-success">Bridge Complete — Four learners crossed one after another and applauded! 👏</div>}

      <style>{`
        .bridge-3d-shell{position:relative;overflow:hidden;width:100%;border-radius:24px;background:linear-gradient(135deg,#e0f2fe,#eef2ff 48%,#dcfce7);border:1px solid rgba(99,102,241,.16);box-shadow:0 20px 55px rgba(30,41,59,.13);color:#0f172a}
        .bridge-3d-shell.is-fullscreen{position:fixed;inset:18px;z-index:9999;border-radius:28px;display:flex;flex-direction:column}.bridge-3d-shell.is-fullscreen .bridge-3d-canvas-wrap{height:calc(100vh - 205px);max-height:none;min-height:420px;flex:1}
        .bridge-3d-scene-header{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.85rem 1rem .7rem;background:rgba(255,255,255,.76);border-bottom:1px solid rgba(99,102,241,.14)}
        .bridge-3d-scene-header h3{margin:.1rem 0 .2rem;color:#1e1b4b;font-size:.98rem}.bridge-3d-scene-header p{margin:0;color:#475569;line-height:1.32;font-size:.84rem}.bridge-3d-eyebrow{color:#4f46e5!important;font-weight:900;text-transform:uppercase;letter-spacing:.09em;font-size:.66rem!important}.bridge-3d-header-actions{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;justify-content:flex-end}.bridge-3d-header-actions>strong{padding:.62rem .82rem;border-radius:999px;color:#312e81;white-space:nowrap;background:white;border:1px solid rgba(79,70,229,.14)}
        .bridge-3d-fullscreen{border:0;border-radius:999px;padding:.66rem .9rem;background:#eef2ff;color:#312e81;font-weight:900;cursor:pointer;border:1px solid rgba(79,70,229,.16)}
        .bridge-3d-canvas-wrap{min-height:340px;height:min(38vw,460px);max-height:490px;width:100%;background:linear-gradient(180deg,#dbeafe,#f0f9ff)}.bridge-3d-canvas-wrap canvas{display:block;width:100%!important;height:100%!important}
        .bridge-3d-control-panel{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.9rem 1rem;background:rgba(255,255,255,.92);border-top:1px solid rgba(99,102,241,.14);color:#334155;font-weight:800}.bridge-3d-control-actions{display:flex;gap:.6rem;flex-wrap:wrap;justify-content:flex-end}.bridge-3d-control-panel button{border:0;border-radius:999px;padding:.72rem 1rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;font-weight:900;cursor:pointer;box-shadow:0 12px 24px rgba(79,70,229,.22)}.bridge-3d-control-panel button:disabled{opacity:.72;cursor:wait}.bridge-3d-control-panel button.secondary{background:#f8fafc;color:#312e81;border:1px solid rgba(79,70,229,.18);box-shadow:none}.bridge-3d-success{margin:.85rem 1rem 1rem;padding:.9rem 1.1rem;border-radius:18px;color:#065f46;background:#dcfce7;border:1px solid rgba(16,185,129,.24);font-size:1rem;font-weight:1000;text-align:center}
        @media (max-width:760px){.bridge-3d-scene-header,.bridge-3d-control-panel{flex-direction:column;align-items:flex-start}.bridge-3d-canvas-wrap{min-height:330px;height:50vh}.bridge-3d-control-actions{width:100%}.bridge-3d-control-panel button,.bridge-3d-fullscreen{width:100%}.bridge-3d-header-actions{width:100%;justify-content:flex-start}.bridge-3d-shell.is-fullscreen{inset:8px}.bridge-3d-shell.is-fullscreen .bridge-3d-canvas-wrap{height:calc(100vh - 255px)}}
      `}</style>
    </section>
  );
}

useGLTF.preload(SOLDIER_MODEL_URL);
