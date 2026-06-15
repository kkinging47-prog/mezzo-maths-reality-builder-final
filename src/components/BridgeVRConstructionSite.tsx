import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, PointerLockControls, Sky } from '@react-three/drei';
import * as THREE from 'three';

type BridgeVRConstructionSiteProps = {
  buildStage: number;
  feedback?: string;
};

type RendererWithXR = THREE.WebGLRenderer & {
  xr: THREE.WebXRManager;
};

const stageLabels = [
  'Explore the river site',
  'Measure the bridge span',
  'Set foundations on both banks',
  'Raise the support posts',
  'Lay the walking deck',
  'Add rails and braces',
  'Test the completed bridge',
];

function GroundBox({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 1.4, 10]} />
        <meshStandardMaterial color="#8b5a2b" />
      </mesh>
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color="#21a65b" roughness={0.8} />
      </mesh>
    </group>
  );
}

function House({ position, color, label }: { position: [number, number, number]; color: string; label: string }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.9, 0.9, 0.75]} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
      <mesh castShadow position={[0, 1.08, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.68, 0.55, 4]} />
        <meshStandardMaterial color="#7c2d12" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.32, 0.39]}>
        <boxGeometry args={[0.2, 0.38, 0.03]} />
        <meshStandardMaterial color="#3b2f2f" />
      </mesh>
      <Html center position={[0, 1.55, 0]} style={{ pointerEvents: 'none' }}>
        <span className="vr-site-label">{label}</span>
      </Html>
    </group>
  );
}

function SimpleLearner({ color = '#2563eb' }: { color?: string }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#7c3f22" />
      </mesh>
      <mesh castShadow position={[0, 0.46, 0]}>
        <capsuleGeometry args={[0.11, 0.3, 6, 12]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh castShadow position={[-0.08, 0.16, 0]}>
        <capsuleGeometry args={[0.035, 0.25, 4, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh castShadow position={[0.08, 0.16, 0]}>
        <capsuleGeometry args={[0.035, 0.25, 4, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh castShadow position={[-0.16, 0.48, 0]} rotation={[0, 0, -0.55]}>
        <capsuleGeometry args={[0.03, 0.24, 4, 8]} />
        <meshStandardMaterial color="#7c3f22" />
      </mesh>
      <mesh castShadow position={[0.16, 0.48, 0]} rotation={[0, 0, 0.55]}>
        <capsuleGeometry args={[0.03, 0.24, 4, 8]} />
        <meshStandardMaterial color="#7c3f22" />
      </mesh>
    </group>
  );
}

function StageLabel({ buildStage }: { buildStage: number }) {
  const label = stageLabels[Math.min(buildStage, stageLabels.length - 1)];
  return (
    <Html center position={[0, 2.35, 0]} style={{ pointerEvents: 'none' }}>
      <div className="vr-stage-badge">
        <strong>VR Bridge Builder</strong>
        <span>{label}</span>
      </div>
    </Html>
  );
}

function FlowingWater() {
  const mat = useRef<THREE.MeshStandardMaterial | null>(null);
  useFrame(({ clock }) => {
    if (mat.current) {
      const pulse = 0.62 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
      mat.current.opacity = pulse;
    }
  });

  return (
    <group>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.2, 9.4, 14, 14]} />
        <meshStandardMaterial ref={mat} color="#38bdf8" transparent opacity={0.68} roughness={0.25} metalness={0.05} />
      </mesh>
      {[-3, -1.6, -0.2, 1.2, 2.7].map((z, index) => (
        <mesh key={z} position={[Math.sin(index) * 0.35, 0.03, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 8, 48]} />
          <meshStandardMaterial color="#e0f2fe" transparent opacity={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function BridgeBuild({ buildStage }: { buildStage: number }) {
  const stage = Math.min(buildStage, 6);
  return (
    <group>
      {stage >= 1 && (
        <group>
          <mesh position={[0, 0.18, -2.9]}>
            <boxGeometry args={[6.6, 0.04, 0.04]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
          <mesh position={[-3.3, 0.28, -2.9]}>
            <boxGeometry args={[0.08, 0.42, 0.08]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
          <mesh position={[3.3, 0.28, -2.9]}>
            <boxGeometry args={[0.08, 0.42, 0.08]} />
            <meshStandardMaterial color="#f97316" />
          </mesh>
          <Html center position={[0, 0.65, -2.9]} style={{ pointerEvents: 'none' }}>
            <span className="vr-site-label yellow">Span measured: safe crossing width</span>
          </Html>
        </group>
      )}

      {stage >= 2 && (
        <group>
          {[-2.85, 2.85].map((x) => (
            <mesh key={x} castShadow receiveShadow position={[x, 0.15, 0]}>
              <boxGeometry args={[0.8, 0.3, 1.25]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.78} />
            </mesh>
          ))}
        </group>
      )}

      {stage >= 3 && (
        <group>
          {[-2.75, -1.1, 1.1, 2.75].map((x) => (
            <group key={x}>
              <mesh castShadow position={[x, 0.78, -0.48]}>
                <boxGeometry args={[0.16, 1.25, 0.16]} />
                <meshStandardMaterial color="#8b5a2b" />
              </mesh>
              <mesh castShadow position={[x, 0.78, 0.48]}>
                <boxGeometry args={[0.16, 1.25, 0.16]} />
                <meshStandardMaterial color="#8b5a2b" />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {stage >= 4 && (
        <group>
          <mesh castShadow receiveShadow position={[0, 1.05, 0]}>
            <boxGeometry args={[5.7, 0.18, 1.05]} />
            <meshStandardMaterial color="#b7791f" roughness={0.8} />
          </mesh>
          {[-2.1, -1.3, -0.5, 0.3, 1.1, 1.9].map((x) => (
            <mesh key={x} castShadow position={[x, 1.18, 0]}>
              <boxGeometry args={[0.08, 0.1, 1.16]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          ))}
          <mesh castShadow receiveShadow position={[-3.35, 0.55, 0]} rotation={[0, 0, -0.42]}>
            <boxGeometry args={[1.1, 0.13, 1.05]} />
            <meshStandardMaterial color="#c0843e" />
          </mesh>
          <mesh castShadow receiveShadow position={[3.35, 0.55, 0]} rotation={[0, 0, 0.42]}>
            <boxGeometry args={[1.1, 0.13, 1.05]} />
            <meshStandardMaterial color="#c0843e" />
          </mesh>
        </group>
      )}

      {stage >= 5 && (
        <group>
          {[-0.62, 0.62].map((z) => (
            <group key={z}>
              <mesh castShadow position={[0, 1.55, z]}>
                <boxGeometry args={[5.8, 0.11, 0.11]} />
                <meshStandardMaterial color="#78350f" />
              </mesh>
              {[-2.6, -1.6, -0.6, 0.4, 1.4, 2.4].map((x) => (
                <mesh key={`${z}-${x}`} castShadow position={[x, 1.36, z]}>
                  <boxGeometry args={[0.09, 0.48, 0.09]} />
                  <meshStandardMaterial color="#92400e" />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {stage >= 6 && (
        <group>
          <Html center position={[0, 1.95, 0]} style={{ pointerEvents: 'none' }}>
            <span className="vr-site-label complete">Completed bridge ready for testing</span>
          </Html>
          <mesh position={[0, 1.72, -0.72]}>
            <boxGeometry args={[4.8, 0.05, 0.05]} />
            <meshStandardMaterial color="#22c55e" emissive="#0f766e" emissiveIntensity={0.15} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AnimatedLearners({ buildStage, testStart }: { buildStage: number; testStart: number | null }) {
  const learners = useRef<(THREE.Group | null)[]>([]);

  useFrame(() => {
    learners.current.forEach((learner, index) => {
      if (!learner) return;
      const lane = -0.36 + index * 0.24;
      learner.rotation.y = Math.PI / 2;

      if (!testStart || buildStage < 6) {
        learner.position.set(-4.45, 0.05, lane);
        return;
      }

      const elapsed = (Date.now() - testStart) / 1000 - index * 2.15;
      if (elapsed <= 0) {
        learner.position.set(-4.45, 0.05, lane);
        return;
      }

      const climbDuration = 0.8;
      const crossDuration = 1.65;
      const descendDuration = 0.8;
      const celebrateStart = climbDuration + crossDuration + descendDuration;

      if (elapsed < climbDuration) {
        const t = elapsed / climbDuration;
        learner.position.set(THREE.MathUtils.lerp(-4.45, -3.0, t), THREE.MathUtils.lerp(0.05, 1.12, t), lane);
      } else if (elapsed < climbDuration + crossDuration) {
        const t = (elapsed - climbDuration) / crossDuration;
        learner.position.set(THREE.MathUtils.lerp(-3.0, 3.0, t), 1.16 + Math.sin(t * Math.PI * 8) * 0.03, lane);
      } else if (elapsed < celebrateStart) {
        const t = (elapsed - climbDuration - crossDuration) / descendDuration;
        learner.position.set(THREE.MathUtils.lerp(3.0, 4.45, t), THREE.MathUtils.lerp(1.12, 0.05, t), lane);
      } else {
        learner.position.set(4.45, 0.05 + Math.abs(Math.sin(elapsed * 5)) * 0.04, lane);
        learner.rotation.y = -Math.PI / 2;
      }
    });
  });

  const colors = ['#2563eb', '#db2777', '#16a34a', '#f97316'];
  return (
    <group>
      {colors.map((color, index) => (
        <group key={color} ref={(node) => { learners.current[index] = node; }}>
          <SimpleLearner color={color} />
        </group>
      ))}
    </group>
  );
}

function DesktopMovement() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const down = (event: KeyboardEvent) => { keys.current[event.code] = true; };
    const up = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  useFrame((_, delta) => {
    const speed = 2.4 * delta;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    direction.y = 0;
    direction.normalize();
    const side = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.current.KeyW) camera.position.addScaledVector(direction, speed);
    if (keys.current.KeyS) camera.position.addScaledVector(direction, -speed);
    if (keys.current.KeyA) camera.position.addScaledVector(side, speed);
    if (keys.current.KeyD) camera.position.addScaledVector(side, -speed);

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -6.5, 6.5);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -5.3, 5.3);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.85, 2.2);
  });

  return <PointerLockControls />;
}

function NativeXRBridge({ onRendererReady }: { onRendererReady: (renderer: RendererWithXR) => void }) {
  const { gl, camera } = useThree();
  useEffect(() => {
    const renderer = gl as RendererWithXR;
    renderer.xr.enabled = true;
    camera.position.set(-4.6, 1.35, 2.6);
    camera.lookAt(0, 1, 0);
    onRendererReady(renderer);
  }, [camera, gl, onRendererReady]);
  return null;
}

function BridgeVRScene({ buildStage, testStart, onRendererReady }: { buildStage: number; testStart: number | null; onRendererReady: (renderer: RendererWithXR) => void }) {
  return (
    <>
      <NativeXRBridge onRendererReady={onRendererReady} />
      <DesktopMovement />
      <Sky sunPosition={[4, 8, 4]} turbidity={8} rayleigh={2} />
      <ambientLight intensity={0.55} />
      <directionalLight castShadow position={[4, 7, 4]} intensity={1.2} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <StageLabel buildStage={buildStage} />
      <GroundBox position={[-4.0, -0.08, 0]} scale={[4.6, 0.16, 9.4]} color="#65a30d" />
      <GroundBox position={[4.0, -0.08, 0]} scale={[4.6, 0.16, 9.4]} color="#84cc16" />
      <FlowingWater />
      <GroundBox position={[-4.5, 0.01, 0]} scale={[1.2, 0.05, 6.4]} color="#d9f99d" />
      <GroundBox position={[4.5, 0.01, 0]} scale={[1.2, 0.05, 6.4]} color="#bbf7d0" />
      <BridgeBuild buildStage={buildStage} />
      <AnimatedLearners buildStage={buildStage} testStart={testStart} />

      <House position={[-5.35, 0.03, -2.3]} color="#fde68a" label="Homes" />
      <House position={[-5.15, 0.03, 1.95]} color="#bfdbfe" label="Community" />
      <House position={[5.1, 0.03, -2.1]} color="#fbcfe8" label="School" />
      <House position={[5.35, 0.03, 2.0]} color="#ddd6fe" label="Clinic" />

      <Tree position={[-5.8, 0, -3.8]} scale={0.9} />
      <Tree position={[-5.55, 0, 3.45]} scale={0.75} />
      <Tree position={[5.6, 0, -3.6]} scale={0.85} />
      <Tree position={[5.85, 0, 3.25]} scale={0.78} />
      {[-2.2, -0.9, 0.7, 2.0].map((x) => (
        <mesh key={x} castShadow position={[x, 0.1, 3.55]}>
          <dodecahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color="#64748b" roughness={0.9} />
        </mesh>
      ))}

      <Html center position={[-4.7, 1.15, 3.15]} style={{ pointerEvents: 'none' }}>
        <div className="vr-help-card">WASD to walk • Click scene to look around • Enter VR if your browser supports WebXR</div>
      </Html>
    </>
  );
}

export default function BridgeVRConstructionSite({ buildStage, feedback }: BridgeVRConstructionSiteProps) {
  const [testStart, setTestStart] = useState<number | null>(null);
  const [xrStatus, setXrStatus] = useState('Browser immersive view ready');
  const [renderer, setRenderer] = useState<RendererWithXR | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const canTest = buildStage >= 6;

  async function enterVR() {
    try {
      const xr = (navigator as Navigator & { xr?: { isSessionSupported?: (mode: string) => Promise<boolean>; requestSession?: (mode: string, options?: unknown) => Promise<XRSession> } }).xr;
      if (renderer && xr?.isSessionSupported && xr?.requestSession) {
        const supported = await xr.isSessionSupported('immersive-vr');
        if (supported) {
          const session = await xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
          await renderer.xr.setSession(session);
          setXrStatus('VR headset session started');
          return;
        }
      }
      await frameRef.current?.requestFullscreen?.();
      setXrStatus('Fullscreen immersive classroom view started');
    } catch (error) {
      await frameRef.current?.requestFullscreen?.();
      setXrStatus('VR headset not available here, using fullscreen immersive view');
    }
  }

  return (
    <section className="bridge-vr-shell">
      <div className="bridge-vr-head">
        <div>
          <span className="eyebrow">VR Bridge Builder</span>
          <h3>Stand beside the stream and experience the bridge mission.</h3>
          <p>Look around the site, follow the staged construction, then test the completed bridge as learners cross safely.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={enterVR}>Enter VR / Fullscreen</button>
      </div>

      <div ref={frameRef} className="bridge-vr-canvas-wrap">
        <Canvas shadows camera={{ position: [-4.6, 1.35, 2.6], fov: 70 }}>
          <BridgeVRScene buildStage={buildStage} testStart={testStart} onRendererReady={setRenderer} />
        </Canvas>
      </div>

      <div className="bridge-vr-controls">
        <span>{xrStatus}</span>
        <strong>{buildStage}/6 bridge stages unlocked</strong>
        {canTest ? (
          <div className="bridge-vr-buttons">
            <button type="button" className="btn btn-primary" onClick={() => setTestStart(Date.now())}>Test Bridge Movement</button>
            <button type="button" className="btn btn-ghost" onClick={() => setTestStart(null)}>Reset Movement Test</button>
          </div>
        ) : (
          <em>Complete the maths questions to unlock the VR movement test.</em>
        )}
      </div>
      {feedback && <div className={`feedback ${feedback.startsWith('Correct') ? 'success' : 'warning'}`}>{feedback}</div>}

      <style>{`
        .bridge-vr-shell{display:grid;gap:1rem}.bridge-vr-head{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;background:linear-gradient(135deg,#eef2ff,#ecfeff);border:1px solid rgba(79,70,229,.12);border-radius:24px;padding:1.1rem}.bridge-vr-head h3{margin:.25rem 0;color:#172554}.bridge-vr-head p{margin:0;color:#475569}.bridge-vr-canvas-wrap{height:560px;min-height:460px;border-radius:28px;overflow:hidden;border:1px solid rgba(15,23,42,.12);background:#0f172a;box-shadow:0 22px 60px rgba(15,23,42,.16)}.bridge-vr-controls{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;background:#fff;border:1px solid rgba(15,23,42,.08);border-radius:20px;padding:1rem;color:#334155}.bridge-vr-buttons{display:flex;gap:.75rem;flex-wrap:wrap}.vr-stage-badge{background:rgba(255,255,255,.92);border:1px solid rgba(15,23,42,.12);box-shadow:0 12px 30px rgba(15,23,42,.18);border-radius:18px;padding:.65rem .85rem;text-align:center;color:#0f172a;min-width:220px}.vr-stage-badge strong{display:block;color:#4f46e5}.vr-stage-badge span{font-size:.84rem}.vr-site-label{display:inline-flex;background:rgba(255,255,255,.92);border:1px solid rgba(15,23,42,.12);box-shadow:0 8px 20px rgba(15,23,42,.18);border-radius:999px;padding:.28rem .55rem;font-size:.72rem;font-weight:800;color:#0f172a;white-space:nowrap}.vr-site-label.yellow{background:#fef3c7;color:#92400e}.vr-site-label.complete{background:#dcfce7;color:#166534}.vr-help-card{max-width:250px;background:rgba(15,23,42,.84);color:white;border-radius:16px;padding:.65rem .8rem;font-size:.76rem;line-height:1.35;box-shadow:0 10px 30px rgba(2,6,23,.24)}@media(max-width:800px){.bridge-vr-head{flex-direction:column}.bridge-vr-canvas-wrap{height:460px}.bridge-vr-controls{align-items:flex-start;flex-direction:column}}
      `}</style>
    </section>
  );
}
