import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';

type Props = { buildStage: number; feedback?: string };
type V3 = [number, number, number];
type V2 = [number, number];

type BoxProps = { p: V3; s: V3; c: string; r?: V3; opacity?: number };
type CylProps = { p: V3; rad: number; h: number; c: string; r?: V3; opacity?: number };

const slotPositions: V2[] = [
  [-4.9, -1.25],
  [-3.35, -1.25],
  [-1.8, -1.25],
  [-0.25, -1.25],
  [1.3, -1.25],
  [2.85, -1.25],
  [4.4, -1.25],
  [5.95, -1.25],
];

const carColours = ['#1d4ed8', '#dc2626', '#f59e0b', '#7c3aed', '#0f766e', '#22c55e'];

function clampStage(value: number) {
  return Math.max(0, Math.min(6, Math.floor(value)));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp01(t);
}

function pointOnPath(points: V2[], t: number) {
  if (points.length === 1) return { x: points[0][0], z: points[0][1], angle: 0 };
  const scaled = clamp01(t) * (points.length - 1);
  const index = Math.min(points.length - 2, Math.floor(scaled));
  const local = scaled - index;
  const [x1, z1] = points[index];
  const [x2, z2] = points[index + 1];
  const x = lerp(x1, x2, local);
  const z = lerp(z1, z2, local);
  const angle = Math.atan2(x2 - x1, z2 - z1);
  return { x, z, angle };
}

function Box({ p, s, c, r = [0, 0, 0], opacity = 1 }: BoxProps) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.72} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function Cyl({ p, rad, h, c, r = [0, 0, 0], opacity = 1 }: CylProps) {
  return (
    <mesh position={p} rotation={r} castShadow receiveShadow>
      <cylinderGeometry args={[rad, rad, h, 24]} />
      <meshStandardMaterial color={c} roughness={0.72} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function Sphere({ p, rad, c, opacity = 1 }: { p: V3; rad: number; c: string; opacity?: number }) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <sphereGeometry args={[rad, 24, 16]} />
      <meshStandardMaterial color={c} roughness={0.84} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}

function RoundedTree({ p, scale = 1, tint = '#22c55e' }: { p: V3; scale?: number; tint?: string }) {
  return (
    <group position={p} scale={scale}>
      <Cyl p={[0, 0.42, 0]} rad={0.08} h={0.84} c="#8b4513" />
      <Sphere p={[0, 1.0, 0]} rad={0.42} c={tint} />
      <Sphere p={[-0.28, 0.86, 0.08]} rad={0.32} c="#16a34a" />
      <Sphere p={[0.28, 0.88, -0.05]} rad={0.34} c="#4ade80" />
      <Sphere p={[0.05, 1.24, 0.02]} rad={0.31} c="#86efac" />
      <Sphere p={[0.2, 0.66, 0.18]} rad={0.23} c="#15803d" />
    </group>
  );
}

function FlowerPatch({ p, wide = 1.2 }: { p: V3; wide?: number }) {
  const colours = ['#fde047', '#fb7185', '#f97316', '#ffffff', '#a78bfa'];
  return (
    <group position={p}>
      <Box p={[0, 0.02, 0]} s={[wide, 0.04, 0.42]} c="#15803d" />
      {Array.from({ length: 18 }).map((_, i) => (
        <group key={i} position={[-wide / 2 + 0.08 + (i % 9) * (wide / 9), 0.12, -0.15 + Math.floor(i / 9) * 0.28]}>
          <Sphere p={[0, 0.02, 0]} rad={0.035} c={colours[i % colours.length]} />
          <Sphere p={[0.035, 0.02, 0.01]} rad={0.025} c={colours[(i + 1) % colours.length]} />
          <Sphere p={[-0.03, 0.02, 0.01]} rad={0.025} c={colours[(i + 2) % colours.length]} />
        </group>
      ))}
    </group>
  );
}

function Road({ p, s, r = [0, 0, 0] }: { p: V3; s: V3; r?: V3 }) {
  const long = s[0] > s[2];
  return (
    <group position={p} rotation={r}>
      <Box p={[0, 0.01, 0]} s={s} c="#27313f" />
      <Box p={[0, 0.075, -s[2] / 2 + 0.12]} s={[s[0], 0.035, 0.08]} c="#e5e7eb" />
      <Box p={[0, 0.075, s[2] / 2 - 0.12]} s={[s[0], 0.035, 0.08]} c="#e5e7eb" />
      {Array.from({ length: long ? 11 : 6 }).map((_, i) => (
        <Box key={i} p={long ? [-s[0] / 2 + 0.8 + i * 1.1, 0.09, 0] : [0, 0.09, -s[2] / 2 + 0.8 + i * 1.1]} s={long ? [0.44, 0.035, 0.055] : [0.055, 0.035, 0.44]} c="#facc15" />
      ))}
    </group>
  );
}

function ZebraCrossing({ p, r = [0, 0, 0] }: { p: V3; r?: V3 }) {
  return (
    <group position={p} rotation={r}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} p={[-0.55 + i * 0.22, 0.12, 0]} s={[0.12, 0.04, 0.95]} c="#f8fafc" />
      ))}
    </group>
  );
}

function TrainTrack({ p }: { p: V3 }) {
  return (
    <group position={p} rotation={[0, 0.52, 0]}>
      <Box p={[0, 0.08, -0.22]} s={[8.4, 0.08, 0.06]} c="#7c2d12" />
      <Box p={[0, 0.08, 0.22]} s={[8.4, 0.08, 0.06]} c="#7c2d12" />
      {Array.from({ length: 16 }).map((_, i) => (
        <Box key={i} p={[-4 + i * 0.52, 0.04, 0]} s={[0.08, 0.08, 0.72]} c="#92400e" />
      ))}
    </group>
  );
}

function IsometricBuilding({ p, name, wall, roof, floors = 1, shop = false }: { p: V3; name: string; wall: string; roof: string; floors?: number; shop?: boolean }) {
  return (
    <group position={p}>
      <Box p={[0, 0.45 + floors * 0.2, 0]} s={[1.62, 0.82 + floors * 0.38, 1.15]} c={wall} />
      <Box p={[0, 0.93 + floors * 0.38, 0]} s={[1.92, 0.2, 1.42]} c={roof} />
      <Box p={[0, 1.04 + floors * 0.38, -0.1]} s={[1.68, 0.09, 1.05]} c="#ffffff" opacity={0.25} />
      <Box p={[0, 0.28, 0.59]} s={[0.35, 0.52, 0.06]} c="#1e293b" />
      {shop && <Box p={[0, 0.56, 0.64]} s={[1.25, 0.28, 0.08]} c="#f97316" />}
      {Array.from({ length: floors * 4 }).map((_, i) => (
        <Box key={i} p={[-0.54 + (i % 4) * 0.36, 0.7 + Math.floor(i / 4) * 0.34, 0.61]} s={[0.18, 0.17, 0.05]} c="#bae6fd" />
      ))}
      <Text position={[0, 1.2 + floors * 0.39, 0.72]} fontSize={0.13} color="#0f172a" anchorX="center">
        {name}
      </Text>
    </group>
  );
}

function MiniPerson({ walking = false, c = '#2563eb', hair = '#3f2a1d' }: { walking?: boolean; c?: string; hair?: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    if (walking) {
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 9) * 0.035;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 9) * 0.035;
    }
  });
  return (
    <group ref={ref}>
      <Cyl p={[0, 0.42, 0]} rad={0.075} h={0.4} c={c} />
      <Sphere p={[0, 0.7, 0]} rad={0.13} c="#f2c7a2" />
      <Sphere p={[0, 0.82, 0]} rad={0.12} c={hair} />
      <Cyl p={[-0.095, 0.42, 0]} rad={0.022} h={0.3} c="#f2c7a2" r={[0, 0, 0.24]} />
      <Cyl p={[0.095, 0.42, 0]} rad={0.022} h={0.3} c="#f2c7a2" r={[0, 0, -0.24]} />
      <Cyl p={[-0.055, 0.17, 0]} rad={0.028} h={0.3} c="#111827" />
      <Cyl p={[0.055, 0.17, 0]} rad={0.028} h={0.3} c="#111827" />
      <Box p={[0, 0.47, -0.075]} s={[0.16, 0.18, 0.05]} c="#facc15" />
    </group>
  );
}

function Pedestrian({ a, b, off, c }: { a: V2; b: V2; off: number; c: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const raw = (state.clock.elapsedTime * 0.08 + off) % 1;
    const t = raw < 0.5 ? raw * 2 : (1 - raw) * 2;
    if (ref.current) {
      ref.current.position.set(lerp(a[0], b[0], t), 0, lerp(a[1], b[1], t));
      ref.current.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]);
    }
  });
  return (
    <group ref={ref}>
      <MiniPerson walking c={c} />
    </group>
  );
}

function StylizedCar({ p, rot = 0, c, label }: { p: V3; rot?: number; c: string; label?: string }) {
  return (
    <group position={p} rotation={[0, rot, 0]}>
      <Box p={[0, 0.08, 0]} s={[0.9, 0.04, 1.22]} c="#000000" opacity={0.18} />
      <Box p={[0, 0.22, 0]} s={[0.66, 0.24, 1.02]} c={c} />
      <Box p={[0, 0.42, -0.08]} s={[0.48, 0.25, 0.46]} c={c} />
      <Box p={[0, 0.45, -0.35]} s={[0.38, 0.1, 0.06]} c="#bfdbfe" />
      <Box p={[0, 0.45, 0.16]} s={[0.38, 0.1, 0.06]} c="#dbeafe" />
      <Box p={[-0.36, 0.32, -0.08]} s={[0.05, 0.13, 0.36]} c="#93c5fd" />
      <Box p={[0.36, 0.32, -0.08]} s={[0.05, 0.13, 0.36]} c="#93c5fd" />
      <Box p={[-0.22, 0.2, -0.55]} s={[0.16, 0.07, 0.05]} c="#fde68a" />
      <Box p={[0.22, 0.2, -0.55]} s={[0.16, 0.07, 0.05]} c="#fde68a" />
      <Box p={[-0.22, 0.2, 0.55]} s={[0.16, 0.07, 0.05]} c="#ef4444" />
      <Box p={[0.22, 0.2, 0.55]} s={[0.16, 0.07, 0.05]} c="#ef4444" />
      {[-0.35, 0.35].map((x) =>
        [-0.38, 0.38].map((z) => <Cyl key={`${x}-${z}`} p={[x, 0.09, z]} rad={0.1} h={0.07} c="#020617" r={[Math.PI / 2, 0, 0]} />)
      )}
      {label && (
        <Text position={[0, 0.74, 0]} fontSize={0.12} color="#0f172a" anchorX="center">
          {label}
        </Text>
      )}
    </group>
  );
}

function SmartSensor({ p, occupied }: { p: V3; occupied: boolean }) {
  return (
    <group position={p}>
      <Sphere p={[0, 0.06, 0]} rad={0.11} c={occupied ? '#ef4444' : '#22c55e'} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.012, 8, 32]} />
        <meshStandardMaterial color={occupied ? '#fca5a5' : '#86efac'} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function ParkingSlot({ x, z, index, occupied, stage }: { x: number; z: number; index: number; occupied: boolean; stage: number }) {
  if (stage < 2) return null;
  return (
    <group position={[x, 0.18, z]}>
      <Box p={[0, 0, -0.62]} s={[1.1, 0.035, 0.04]} c="#f8fafc" />
      <Box p={[0, 0, 0.62]} s={[1.1, 0.035, 0.04]} c="#f8fafc" />
      <Box p={[-0.55, 0, 0]} s={[0.04, 0.035, 1.25]} c="#f8fafc" />
      <Box p={[0.55, 0, 0]} s={[0.04, 0.035, 1.25]} c="#f8fafc" />
      <Text position={[0, 0.08, -0.78]} fontSize={0.11} color="#111827" anchorX="center">
        {index + 1}
      </Text>
      {stage >= 3 && <SmartSensor p={[0, 0.08, 0]} occupied={occupied} />}
    </group>
  );
}

function MovingCar({ points, start, duration, c }: { points: V2[]; start: number; duration: number; c: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    const cycle = state.clock.elapsedTime % 16;
    const active = cycle >= start && cycle <= start + duration;
    if (!ref.current) return;
    ref.current.visible = active;
    const t = (cycle - start) / duration;
    const { x, z, angle } = pointOnPath(points, t);
    ref.current.position.set(x, 0.22, z);
    ref.current.rotation.y = angle;
  });
  return (
    <group ref={ref}>
      <StylizedCar p={[0, 0, 0]} c={c} />
    </group>
  );
}

function ParkedCar({ slot, c, hideAfter, showAfter = 0 }: { slot: number; c: string; hideAfter?: number; showAfter?: number }) {
  const ref = useRef<THREE.Group>(null);
  const [x, z] = slotPositions[slot];
  useFrame((state) => {
    if (!ref.current) return;
    const cycle = state.clock.elapsedTime % 16;
    const hidden = (hideAfter !== undefined && cycle > hideAfter) || cycle < showAfter;
    ref.current.visible = !hidden;
  });
  return (
    <group ref={ref}>
      <StylizedCar p={[x, 0.22, z]} c={c} />
    </group>
  );
}

function GateBarrier({ open }: { open: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const cycle = state.clock.elapsedTime % 16;
    const shouldOpen = open || cycle > 1.2;
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, shouldOpen ? -1.05 : 0, 0.08);
  });
  return (
    <group position={[6.85, 0, -0.35]}>
      <Cyl p={[0, 0.44, 0]} rad={0.055} h={0.88} c="#111827" />
      <group ref={ref} position={[0, 0.84, 0]}>
        <Box p={[-0.55, 0, 0]} s={[1.08, 0.06, 0.08]} c="#ef4444" />
        <Box p={[-0.17, 0.005, 0.005]} s={[0.18, 0.07, 0.085]} c="#fef3c7" />
      </group>
      <Cyl p={[0.42, 0.45, -0.08]} rad={0.07} h={0.32} c="#22c55e" />
      <Text position={[0.1, 1.2, -0.18]} fontSize={0.13} color="#064e3b" anchorX="center">
        Entry Gate
      </Text>
    </group>
  );
}

function SmartCounter({ stage }: { stage: number }) {
  const [free, setFree] = useState(3);
  useFrame((state) => {
    if (stage < 6) return;
    const cycle = state.clock.elapsedTime % 16;
    const nextFree = cycle > 12 ? 4 : cycle > 7 ? 5 : cycle > 3.2 ? 4 : 3;
    setFree((current) => (current === nextFree ? current : nextFree));
  });
  if (stage < 4) return null;
  return (
    <group position={[6.35, 1.18, 1.95]} rotation={[0, -0.72, 0]}>
      <Cyl p={[-0.55, 0.45, 0]} rad={0.035} h={0.9} c="#0f172a" />
      <Cyl p={[0.55, 0.45, 0]} rad={0.035} h={0.9} c="#0f172a" />
      <Box p={[0, 0.95, 0]} s={[1.55, 0.82, 0.08]} c="#0f172a" />
      <Box p={[0, 0.95, 0.055]} s={[1.35, 0.64, 0.04]} c="#022c22" />
      <Text position={[0, 1.18, 0.11]} fontSize={0.12} color="#bbf7d0" anchorX="center">
        SMART COUNTER
      </Text>
      <Text position={[0, 0.98, 0.11]} fontSize={0.12} color="#fde68a" anchorX="center">
        Occupied: {8 - free}
      </Text>
      <Text position={[0, 0.8, 0.11]} fontSize={0.12} color="#86efac" anchorX="center">
        Free: {free}
      </Text>
    </group>
  );
}

function ParkingLot({ stage }: { stage: number }) {
  const parkedBefore = [0, 1, 2, 3, 4];
  const finalParked = [2, 3, 4, 5];
  return (
    <group>
      {stage >= 1 && <Box p={[0, 0.12, -1.1]} s={[14.5, 0.1, 5.2]} c="#facc15" />}
      <Box p={[0, 0.17, -1.1]} s={[13.7, 0.08, 4.5]} c="#1f2937" />
      <Box p={[0, 0.21, 0.8]} s={[12.9, 0.04, 0.16]} c="#facc15" />
      <Box p={[0, 0.21, -3]} s={[12.9, 0.04, 0.16]} c="#facc15" />
      <Box p={[6.55, 0.22, -1.1]} s={[0.18, 0.05, 4.45]} c="#facc15" />
      {slotPositions.map(([x, z], index) => (
        <ParkingSlot key={index} x={x} z={z} index={index} occupied={(stage >= 6 ? finalParked : parkedBefore).includes(index)} stage={stage} />
      ))}
      {stage >= 5 && (
        <>
          <ParkedCar slot={0} c="#0f766e" hideAfter={3.2} />
          <ParkedCar slot={1} c="#2563eb" hideAfter={7.1} />
          <ParkedCar slot={2} c="#dc2626" />
          <ParkedCar slot={3} c="#f59e0b" />
          <ParkedCar slot={4} c="#7c3aed" />
          {stage >= 6 && <ParkedCar slot={5} c="#22c55e" showAfter={12.0} />}
        </>
      )}
      {stage >= 6 && (
        <>
          <MovingCar points={[[-4.9, -1.25], [-4.9, -2.85], [2.4, -2.85], [6.8, -2.3], [8.4, -1.4]]} start={0.8} duration={3.2} c="#0f766e" />
          <MovingCar points={[[-3.35, -1.25], [-3.35, -2.85], [1.5, -2.85], [6.8, -2.3], [8.4, -1.4]]} start={4.6} duration={3.1} c="#2563eb" />
          <MovingCar points={[[8.2, -2.6], [6.85, -2.2], [4.8, -2.85], [2.85, -2.85], [2.85, -1.25]]} start={9.0} duration={3.5} c="#22c55e" />
        </>
      )}
      {stage >= 5 && <GateBarrier open={false} />}
      <SmartCounter stage={stage} />
      {stage >= 3 && (
        <Text position={[-5.45, 0.42, 1.22]} fontSize={0.16} color="#ecfeff" anchorX="center">
          Sensor slots track occupied and free spaces
        </Text>
      )}
    </group>
  );
}

function CityWorld({ stage }: { stage: number }) {
  return (
    <group>
      <Box p={[0, -0.04, 0]} s={[22, 0.08, 15]} c="#7ed957" />
      <Box p={[0, -0.02, 0]} s={[20.5, 0.04, 13.5]} c="#86efac" opacity={0.75} />
      <Road p={[0, 0.02, -6.3]} s={[19, 0.08, 1.2]} />
      <Road p={[0, 0.02, 5.9]} s={[19, 0.08, 1.2]} />
      <Road p={[-9.2, 0.02, 0]} s={[1.2, 0.08, 12]} />
      <Road p={[9.1, 0.02, 0]} s={[1.2, 0.08, 12]} />
      <ZebraCrossing p={[6.7, 0.12, -5.95]} r={[0, Math.PI / 2, 0]} />
      <TrainTrack p={[-5.3, 0.02, 5.05]} />
      <IsometricBuilding p={[-7.1, 0, -4.2]} name="Book Shop" wall="#fef3c7" roof="#22c55e" shop />
      <IsometricBuilding p={[-4.9, 0, -4.25]} name="Cafe" wall="#fed7aa" roof="#f97316" shop />
      <IsometricBuilding p={[-2.55, 0, -4.25]} name="Office" wall="#e0f2fe" roof="#2563eb" floors={3} />
      <IsometricBuilding p={[1.45, 0, -4.35]} name="Learning Centre" wall="#fce7f3" roof="#ec4899" floors={2} />
      <IsometricBuilding p={[6.9, 0, 4.0]} name="Pharmacy" wall="#dcfce7" roof="#ef4444" shop />
      <IsometricBuilding p={[-7.05, 0, 3.7]} name="Homes" wall="#f8fafc" roof="#0ea5e9" floors={2} />
      <IsometricBuilding p={[-4.4, 0, 3.9]} name="Station" wall="#e0f2fe" roof="#14b8a6" />
      {[
        [-8.2, 0, -1.9],
        [-8.1, 0, 1.7],
        [8.05, 0, 2.35],
        [8.05, 0, -3.1],
        [-1.4, 0, 3.55],
        [3.7, 0, 3.45],
        [0.25, 0, 4.95],
        [-6.6, 0, 5.2],
        [7.7, 0, 5.25],
      ].map((p, i) => (
        <RoundedTree key={i} p={p as V3} scale={i % 3 === 0 ? 1.08 : 0.9} tint={i % 2 ? '#22c55e' : '#4ade80'} />
      ))}
      <FlowerPatch p={[-2.2, 0.02, 3.1]} wide={1.8} />
      <FlowerPatch p={[3.2, 0.02, 3.15]} wide={1.8} />
      <FlowerPatch p={[7.3, 0.02, 2.6]} wide={1.3} />
      <FlowerPatch p={[-7.35, 0.02, 1.95]} wide={1.1} />
      <Box p={[4.45, 0.18, 4.65]} s={[1.35, 0.12, 0.18]} c="#92400e" />
      <Cyl p={[3.95, 0.45, 4.65]} rad={0.05} h={0.7} c="#374151" />
      <Cyl p={[4.95, 0.45, 4.65]} rad={0.05} h={0.7} c="#374151" />
      <Cyl p={[4.45, 0.8, 4.65]} rad={0.08} h={0.12} c="#fde68a" />
      <Pedestrian a={[-8.3, -5.7]} b={[-4.2, -5.7]} off={0.1} c="#2563eb" />
      <Pedestrian a={[1.8, 5.45]} b={[6.3, 5.45]} off={0.45} c="#f97316" />
      <Pedestrian a={[8.45, -2.4]} b={[8.45, 2.4]} off={0.23} c="#16a34a" />
      <Pedestrian a={[-6.8, 5.45]} b={[-3.3, 5.45]} off={0.64} c="#9333ea" />
      <group position={[6.55, 0, -0.08]} rotation={[0, -0.6, 0]}>
        <MiniPerson c="#1d4ed8" />
        <Text position={[0, 1.05, 0.25]} fontSize={0.13} color="#0f172a" anchorX="center">
          Attendant
        </Text>
      </group>
      <ParkingLot stage={stage} />
    </group>
  );
}

export default function SmartParking3DConstructionSiteV3({ buildStage, feedback }: Props) {
  const stage = clampStage(buildStage);
  return (
    <div className="bridge-3d-wrap smart-parking-v3-wrap" style={{ width: '100%' }}>
      <div className="bridge-3d-header">
        <div>
          <strong>Hybrid Isometric Smart Parking Mini-City</strong>
          <p>Original Mezzo mini-world style with a larger view, richer roads, shops, trees, pedestrians, sensors and moving cars.</p>
        </div>
        <span>{stage}/6 built</span>
      </div>
      <div className="bridge-3d-canvas smart-parking-v3-canvas" style={{ minHeight: 760, height: '74vh', maxHeight: 920, width: '100%' }}>
        <Canvas shadows dpr={[1, 1.8]} camera={{ position: [10, 9, 10], near: 0.1, far: 120 }}>
          <OrthographicCamera makeDefault position={[12, 10.5, 12]} zoom={76} near={0.1} far={120} />
          <Sky sunPosition={[5, 12, 5]} distance={450000} />
          <ambientLight intensity={0.86} />
          <hemisphereLight args={["#e0f2fe", "#bbf7d0", 1.05]} />
          <directionalLight position={[7, 12, 5]} intensity={1.75} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <CityWorld stage={stage} />
          <OrbitControls enablePan={false} minPolarAngle={0.74} maxPolarAngle={1.12} minZoom={58} maxZoom={110} target={[0, 0.15, -0.6]} />
        </Canvas>
      </div>
      <div className="bridge-3d-controls">
        <div className="bridge-3d-status">
          <strong>{stage >= 6 ? 'System complete: two cars leave, one car enters, and the counter updates.' : 'Solve the mission questions to build the smart parking mini-city.'}</strong>
          <span>{feedback || 'This hybrid isometric scene is bigger in the layout and uses original child-friendly mini-world assets.'}</span>
        </div>
      </div>
    </div>
  );
}
