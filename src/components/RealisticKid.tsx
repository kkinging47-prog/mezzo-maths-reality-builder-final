import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

type Vec3 = [number, number, number];

type RealisticKidProps = {
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  shirt?: string;
  shorts?: string;
  skin?: string;
  hair?: string;
  backpack?: string;
  name?: string;
  walking?: boolean;
  cheering?: boolean;
  sitting?: boolean;
  swing?: boolean;
};

export default function RealisticKid({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  shirt = '#2563eb',
  shorts = '#1e3a8a',
  skin = '#8b5a2b',
  hair = '#111827',
  backpack = '#f97316',
  name,
  walking = false,
  cheering = false,
  sitting = false,
  swing = false,
}: RealisticKidProps) {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const step = Math.sin(t * 7.5);
    const cheer = Math.sin(t * 9) * 0.12;

    if (group.current && swing) {
      group.current.rotation.x = Math.sin(t * 1.8) * 0.18;
    }
    if (leftArm.current) leftArm.current.rotation.z = cheering ? 2.22 + cheer : sitting ? 0.38 : -0.35 + (walking ? step * 0.45 : 0);
    if (rightArm.current) rightArm.current.rotation.z = cheering ? -2.22 - cheer : sitting ? -0.38 : 0.35 - (walking ? step * 0.45 : 0);
    if (leftLeg.current) leftLeg.current.rotation.x = sitting ? 1.05 : walking ? -step * 0.45 : 0;
    if (rightLeg.current) rightLeg.current.rotation.x = sitting ? 1.05 : walking ? step * 0.45 : 0;
  });

  const bodyY = sitting ? 0.48 : 0.58;
  const headY = sitting ? 0.95 : 1.05;

  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <mesh position={[0, headY, 0]} castShadow>
        <sphereGeometry args={[0.16, 28, 22]} />
        <meshStandardMaterial color={skin} roughness={0.45} />
      </mesh>
      <mesh position={[0, headY + 0.12, -0.015]} scale={[1.08, 0.62, 0.98]} castShadow>
        <sphereGeometry args={[0.165, 24, 14]} />
        <meshStandardMaterial color={hair} roughness={0.86} />
      </mesh>
      {[-0.055, 0.055].map((x) => (
        <mesh key={x} position={[x, headY + 0.005, 0.145]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
      ))}
      <mesh position={[0, headY - 0.055, 0.154]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      <mesh position={[0, bodyY, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.42, 10, 18]} />
        <meshStandardMaterial color={shirt} roughness={0.58} />
      </mesh>
      <mesh position={[0, bodyY + 0.09, 0.165]} castShadow>
        <boxGeometry args={[0.2, 0.08, 0.025]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      <mesh position={[0, bodyY - 0.02, -0.16]} castShadow>
        <boxGeometry args={[0.33, 0.32, 0.1]} />
        <meshStandardMaterial color={backpack} roughness={0.72} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={`arm-${side}`} ref={side < 0 ? leftArm : rightArm} position={[side * 0.18, bodyY + 0.04, 0]} rotation={[0, 0, side * 0.35]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <capsuleGeometry args={[0.04, 0.25, 8, 12]} />
            <meshStandardMaterial color={shirt} roughness={0.58} />
          </mesh>
          <mesh position={[0, -0.33, 0]} castShadow>
            <capsuleGeometry args={[0.033, 0.17, 8, 12]} />
            <meshStandardMaterial color={skin} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.44, 0.01]} castShadow>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color={skin} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <group key={`leg-${side}`} ref={side < 0 ? leftLeg : rightLeg} position={[side * 0.08, bodyY - 0.35, 0]}>
          <mesh position={[0, -0.12, 0]} castShadow>
            <capsuleGeometry args={[0.047, sitting ? 0.2 : 0.28, 8, 12]} />
            <meshStandardMaterial color={shorts} roughness={0.72} />
          </mesh>
          <mesh position={[0, -0.34, 0.055]} castShadow>
            <boxGeometry args={[0.17, 0.055, 0.23]} />
            <meshStandardMaterial color="#111827" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {name ? (
        <Text position={[0, headY + 0.38, 0]} fontSize={0.12} color="#0f172a" anchorX="center">
          {name}
        </Text>
      ) : null}
    </group>
  );
}
