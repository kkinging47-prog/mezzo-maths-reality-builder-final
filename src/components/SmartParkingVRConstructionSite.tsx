import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, Text } from '@react-three/drei';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import type * as THREE from 'three';
import { useParkingPuzzle, type ParkingPuzzleController } from '../parking/useParkingPuzzle';
import type { ParkingVehicle } from '../parking/trafficPuzzleEngine';
import ParkingPuzzleControls from './ParkingPuzzleControls';

type Props = { buildStage: number; feedback?: string };

function VRVehicle({ vehicle, selected, onSelect }: { vehicle: ParkingVehicle; selected: boolean; onSelect: () => void }) {
  const cell = 1;
  const x = -3 + (vehicle.col + (vehicle.orientation === 'horizontal' ? vehicle.length / 2 : .5)) * cell;
  const z = -3 + (vehicle.row + (vehicle.orientation === 'vertical' ? vehicle.length / 2 : .5)) * cell;
  const width = (vehicle.orientation === 'horizontal' ? vehicle.length : 1) * cell - .16;
  const depth = (vehicle.orientation === 'vertical' ? vehicle.length : 1) * cell - .16;
  return <group position={[x, .3, z]} onPointerDown={(event) => { event.stopPropagation(); onSelect(); }}>
    {selected ? <mesh position={[0, -.18, 0]}><boxGeometry args={[width + .18, .05, depth + .18]} /><meshStandardMaterial color="#facc15" emissive="#ca8a04" emissiveIntensity={.5} /></mesh> : null}
    <mesh castShadow><boxGeometry args={[width, .38, depth]} /><meshStandardMaterial color={vehicle.color} roughness={.55} /></mesh>
    <mesh castShadow position={[0, .28, 0]}><boxGeometry args={[width * .58, .26, depth * .58]} /><meshStandardMaterial color={vehicle.goal ? '#bfdbfe' : '#e2e8f0'} /></mesh>
    <Text position={[0, .55, 0]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.16} color="#fff" anchorX="center">{vehicle.goal ? 'MEZZO' : vehicle.name}</Text>
  </group>;
}

function VRParkingWorld({ game }: { game: ParkingPuzzleController }) {
  const exitZ = -3 + (game.state.exitRow + .5);
  return <group>
    <mesh receiveShadow position={[0, -.08, 0]}><boxGeometry args={[9, .15, 8]} /><meshStandardMaterial color="#86efac" /></mesh>
    <mesh receiveShadow><boxGeometry args={[6.25, .12, 6.25]} /><meshStandardMaterial color="#334155" /></mesh>
    {Array.from({ length: 7 }, (_, i) => <group key={i}>
      <mesh position={[-3 + i, .08, 0]}><boxGeometry args={[.025, .025, 6]} /><meshBasicMaterial color="#64748b" /></mesh>
      <mesh position={[0, .08, -3 + i]}><boxGeometry args={[6, .025, .025]} /><meshBasicMaterial color="#64748b" /></mesh>
    </group>)}
    <mesh position={[3.6, .08, exitZ]}><boxGeometry args={[1.2, .08, .82]} /><meshStandardMaterial color="#22c55e" /></mesh>
    <Text position={[3.65, .16, exitZ]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.2} color="#052e16" anchorX="center">EXIT</Text>
    {game.state.vehicles.map(vehicle => <VRVehicle key={vehicle.id} vehicle={vehicle} selected={game.selectedId === vehicle.id} onSelect={() => game.selectVehicle(vehicle.id)} />)}
    <Text position={[0, .1, -3.75]} rotation={[-Math.PI / 2, 0, 0]} fontSize={.28} color="#0f172a" anchorX="center">{game.state.title} · Select a vehicle</Text>
  </group>;
}

function XRLaunchButton({ renderer }: { renderer: THREE.WebGLRenderer | null }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!renderer || !host.current) return;
    renderer.xr.enabled = true;
    const button = VRButton.createButton(renderer);
    button.style.position = 'static'; button.style.width = '100%'; button.style.margin = '0'; button.style.opacity = '1';
    host.current.appendChild(button);
    return () => button.remove();
  }, [renderer]);
  return <div ref={host} className="parking-xr-launch" />;
}

export default function SmartParkingVRConstructionSite({ buildStage, feedback }: Props) {
  const game = useParkingPuzzle();
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'q' || event.key === 'Q') game.selectAdjacent(-1);
      if (event.key === 'e' || event.key === 'E') game.selectAdjacent(1);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') game.requestMove(-1);
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') game.requestMove(1);
      if (game.pendingMove && /^[1-4]$/.test(event.key)) game.answer(Number(event.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game]);

  if (buildStage < 6) return <section className="parking-vr-locked"><h3>VR Smart Parking is being assembled</h3><p>Complete all six Smart Parking mission questions to unlock the immersive traffic levels.</p><strong>{Math.max(0, buildStage)}/6 construction stages complete</strong></section>;
  return <section className="parking-vr">
    <header><div><span>IMMERSIVE SMART PARKING</span><h3>VR Traffic Mathematics Lab</h3><p>Look around the parking world, select a vehicle and solve the mathematics challenge before every move.</p></div><div><strong>{game.state.moves}</strong><span>moves</span><strong>{game.correctAnswers}</strong><span>unlocked</span></div></header>
    <div className="parking-vr-layout">
      <div><div className="parking-vr-canvas"><Canvas shadows camera={{ position: [7, 8, 8], fov: 52 }} onCreated={({ gl }) => setRenderer(gl)}><color attach="background" args={['#dbeafe']} /><ambientLight intensity={1.2} /><directionalLight position={[6, 10, 4]} intensity={2} castShadow /><VRParkingWorld game={game} /><Environment preset="city" /><OrbitControls target={[0, 0, 0]} minDistance={6} maxDistance={16} /></Canvas></div><XRLaunchButton renderer={renderer} /><p className="parking-vr-help">Headset/desktop controls: Q/E changes vehicle · arrow keys request movement · keys 1–4 answer the active question. Mouse or gaze pointer can select vehicles.</p>{feedback ? <p className="parking-vr-feedback">{feedback}</p> : null}</div>
      <ParkingPuzzleControls game={game} compact />
    </div>
    <style>{`.parking-vr{padding:1rem;border-radius:24px;background:linear-gradient(135deg,#0f172a,#172554);color:#fff}.parking-vr>header{display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem}.parking-vr header span{font-size:.72rem;font-weight:900;letter-spacing:.08em;color:#93c5fd}.parking-vr h3{font-size:clamp(1.35rem,3vw,2rem);margin:.2rem 0}.parking-vr header p{margin:0;color:#cbd5e1}.parking-vr header>div:last-child{display:grid;grid-template-columns:auto auto;gap:.15rem .5rem;align-content:start;padding:.7rem;border:1px solid #475569;border-radius:14px}.parking-vr header>div:last-child strong{color:#facc15}.parking-vr-layout{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(280px,.6fr);gap:1rem}.parking-vr-canvas{height:620px;min-height:480px;border-radius:18px;overflow:hidden;border:2px solid #60a5fa}.parking-xr-launch{margin-top:.65rem}.parking-vr-help,.parking-vr-feedback{padding:.7rem;border-radius:10px;background:#1e293b;color:#dbeafe;font-weight:700;font-size:.82rem}.parking-vr-locked{padding:2rem;text-align:center;border-radius:22px;background:#eff6ff;color:#1e3a8a;border:2px solid #93c5fd}@media(max-width:900px){.parking-vr-layout{grid-template-columns:1fr}.parking-vr-canvas{height:520px}}@media(max-width:540px){.parking-vr>header{display:grid}.parking-vr-canvas{height:430px}}`}</style>
  </section>;
}
