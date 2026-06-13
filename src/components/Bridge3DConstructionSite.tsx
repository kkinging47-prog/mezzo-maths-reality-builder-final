import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Bridge3DConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type RevealProps = {
  show: boolean;
  children: React.ReactNode;
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
    groupRef.current.position.y = (1 - progress.current) * 0.25 + delay;
  });

  if (!show) {
    return null;
  }

  return <group ref={groupRef}>{children}</group>;
}

function FlowingRiver() {
  const wavesRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (wavesRef.current) {
      wavesRef.current.position.z += delta * 0.9;
      if (wavesRef.current.position.z > 0.7) wavesRef.current.position.z = -0.7;
    }
    if (waterRef.current) {
      waterRef.current.position.y = 0.03 + Math.sin(state.clock.elapsedTime * 2.2) * 0.025;
    }
  });

  const waveLines = useMemo(() => Array.from({ length: 17 }, (_, index) => index - 8), []);

  return (
    <group>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
        <planeGeometry args={[3.15, 12]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.82} roughness={0.25} metalness={0.05} />
      </mesh>
      <group ref={wavesRef} position={[0, 0.075, 0]}>
        {waveLines.map((z) => (
          <mesh key={z} position={[0, 0, z * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.45, 0.035]} />
            <meshBasicMaterial color="#ecfeff" transparent opacity={0.62} />
          </mesh>
        ))}
      </group>
      {[-1.75, 1.75].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[0.42, 11.7]} />
          <meshStandardMaterial color="#a16207" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

function Tree({ position }: { position: [number, number, number] }) {
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

function SimpleBuilding({ position, color, roofColor, label }: { position: [number, number, number]; color: string; roofColor: string; label?: string }) {
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

function Person({ position, color = '#7c3aed' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#f6c89f" />
      </mesh>
      <mesh position={[0, 0.37, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.28, 8, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.07, 0.11, 0]} rotation={[0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.035, 0.22, 6, 8]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.07, 0.11, 0]} rotation={[-0.2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.035, 0.22, 6, 8]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
    </group>
  );
}

function TestingPerson({ testing, resetKey, onDone }: { testing: boolean; resetKey: number; onDone: () => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const progress = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    progress.current = 0;
    done.current = false;
    if (groupRef.current) groupRef.current.position.set(-3.15, 0.05, -0.22);
  }, [resetKey]);

  useFrame((_, delta) => {
    if (!groupRef.current || !testing || done.current) return;
    progress.current = Math.min(1, progress.current + delta * 0.19);
    const eased = progress.current < 0.5 ? 2 * progress.current * progress.current : 1 - Math.pow(-2 * progress.current + 2, 2) / 2;
    groupRef.current.position.x = THREE.MathUtils.lerp(-3.15, 3.15, eased);
    groupRef.current.position.y = 0.1 + Math.sin(progress.current * Math.PI * 18) * 0.025;
    groupRef.current.rotation.y = Math.PI / 2;
    if (progress.current >= 1) {
      done.current = true;
      onDone();
    }
  });

  return (
    <group ref={groupRef} position={[-3.15, 0.05, -0.22]}>
      <Person position={[0, 0, 0]} color="#f97316" />
    </group>
  );
}

function Clouds() {
  const cloudRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!cloudRef.current) return;
    cloudRef.current.position.x += delta * 0.12;
    if (cloudRef.current.position.x > 5.8) cloudRef.current.position.x = -5.8;
  });

  return (
    <group ref={cloudRef} position={[-2.8, 4.4, -3.8]}>
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

function Scene({ stage, testing, resetKey, onDone }: { stage: number; testing: boolean; resetKey: number; onDone: () => void }) {
  return (
    <>
      <Sky sunPosition={[4, 6, 3]} turbidity={5} rayleigh={1.2} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 7, 4]} intensity={1.45} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <group position={[0, 0, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[14, 11]} />
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
        <Person position={[-3.25, 0.05, -0.2]} color="#2563eb" />
        <Person position={[-3.55, 0.05, 0.55]} color="#16a34a" />
        <TestingPerson testing={testing} resetKey={resetKey} onDone={onDone} />
      </group>
      <Clouds />
      <OrbitControls makeDefault enablePan enableZoom minDistance={5} maxDistance={13} maxPolarAngle={Math.PI / 2.08} target={[0, 0.9, 0]} />
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
      <div className="bridge-3d-overlay">
        <div>
          <p className="bridge-3d-eyebrow">3D Bridge Builder</p>
          <h3>Real Animated Construction Mode</h3>
          <p>Rotate, zoom, and watch the bridge grow as you solve each maths step.</p>
        </div>
        <strong>{stage}/6 built</strong>
      </div>

      <div className="bridge-3d-canvas-wrap">
        <Canvas shadows camera={{ position: [6.8, 5.1, 7.6], fov: 48 }}>
          <Scene stage={stage} testing={testing} resetKey={resetKey} onDone={markDone} />
        </Canvas>
      </div>

      <div className="bridge-3d-controls">
        <span>{feedback || (stage < 6 ? 'Solve each bridge question to add the next real 3D construction part.' : 'Bridge is complete. Test the safe crossing now.')}</span>
        <div>
          {stage >= 6 && (
            <button type="button" onClick={startTest} disabled={testing} aria-label="Test the completed 3D bridge">
              {testing ? 'Testing...' : 'Test Bridge'}
            </button>
          )}
          {(testing || crossed) && (
            <button type="button" className="secondary" onClick={resetTest} aria-label="Reset the 3D bridge crossing test">
              Reset Test
            </button>
          )}
        </div>
      </div>

      {crossed && <div className="bridge-3d-success">Bridge Complete — Safe Crossing!</div>}

      <style>{`
        .bridge-3d-shell {
          position: relative;
          overflow: hidden;
          min-height: 540px;
          border-radius: 28px;
          background: linear-gradient(135deg, #e0f2fe, #eef2ff 48%, #dcfce7);
          border: 1px solid rgba(99, 102, 241, 0.16);
          box-shadow: 0 24px 70px rgba(30, 41, 59, 0.14);
        }

        .bridge-3d-canvas-wrap {
          min-height: 500px;
          height: 62vh;
          max-height: 680px;
        }

        .bridge-3d-overlay {
          position: absolute;
          z-index: 3;
          top: 18px;
          left: 18px;
          right: 18px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          pointer-events: none;
        }

        .bridge-3d-overlay > div,
        .bridge-3d-overlay > strong,
        .bridge-3d-controls,
        .bridge-3d-success {
          pointer-events: auto;
          border: 1px solid rgba(255, 255, 255, 0.72);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(12px);
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
        }

        .bridge-3d-overlay > div {
          max-width: 430px;
          padding: 1rem 1.15rem;
          border-radius: 22px;
        }

        .bridge-3d-overlay h3 {
          margin: 0.1rem 0 0.35rem;
          color: #1e1b4b;
          font-size: 1.15rem;
        }

        .bridge-3d-overlay p {
          margin: 0;
          color: #475569;
          line-height: 1.45;
          font-size: 0.92rem;
        }

        .bridge-3d-eyebrow {
          color: #4f46e5 !important;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          font-size: 0.72rem !important;
        }

        .bridge-3d-overlay > strong {
          padding: 0.78rem 1rem;
          border-radius: 999px;
          color: #312e81;
          white-space: nowrap;
        }

        .bridge-3d-controls {
          position: absolute;
          z-index: 3;
          left: 18px;
          right: 18px;
          bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.9rem 1rem;
          border-radius: 20px;
          color: #334155;
          font-weight: 700;
        }

        .bridge-3d-controls div {
          display: flex;
          gap: 0.65rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .bridge-3d-controls button {
          border: 0;
          border-radius: 999px;
          padding: 0.72rem 1rem;
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          color: white;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(79, 70, 229, 0.24);
        }

        .bridge-3d-controls button:disabled {
          opacity: 0.72;
          cursor: wait;
        }

        .bridge-3d-controls button.secondary {
          background: #f8fafc;
          color: #312e81;
          border: 1px solid rgba(79, 70, 229, 0.18);
          box-shadow: none;
        }

        .bridge-3d-success {
          position: absolute;
          z-index: 4;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          padding: 1rem 1.25rem;
          border-radius: 999px;
          color: #065f46;
          font-size: 1.05rem;
          font-weight: 1000;
          border-color: rgba(16, 185, 129, 0.28);
        }

        @media (max-width: 720px) {
          .bridge-3d-shell {
            min-height: 560px;
            border-radius: 20px;
          }

          .bridge-3d-canvas-wrap {
            min-height: 560px;
            height: 70vh;
          }

          .bridge-3d-overlay {
            flex-direction: column;
            align-items: flex-start;
            top: 12px;
            left: 12px;
            right: 12px;
          }

          .bridge-3d-overlay > div {
            padding: 0.85rem;
          }

          .bridge-3d-controls {
            left: 12px;
            right: 12px;
            bottom: 12px;
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
