import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';

interface CorridorSceneProps {
  pressure: number;
}

function CorridorGeometry({ pressure }: CorridorSceneProps) {
  const ambient = 0.45 - pressure * 0.15;
  const pointLightIntensity = 2.2 - pressure * 0.9;
  const emissiveStrength = 0.1 + pressure * 0.25;

  return (
    <>
      <color attach="background" args={["#05070b"]} />
      <fog attach="fog" args={["#05070b", 6, 18]} />
      <ambientLight intensity={ambient} />
      <pointLight position={[0, 2.4, 1]} intensity={pointLightIntensity} />
      <PerspectiveCamera makeDefault position={[0, 1.2, 4.5]} fov={42} />

      <mesh position={[0, -1, -5]} receiveShadow>
        <boxGeometry args={[2.8, 0.08, 18]} />
        <meshStandardMaterial color="#1a1c20" />
      </mesh>

      <mesh position={[0, 2.2, -5]}>
        <boxGeometry args={[2.8, 0.08, 18]} />
        <meshStandardMaterial color="#111318" />
      </mesh>

      <mesh position={[-1.4, 0.6, -5]}>
        <boxGeometry args={[0.08, 3.2, 18]} />
        <meshStandardMaterial color="#181a20" />
      </mesh>

      <mesh position={[1.4, 0.6, -5]}>
        <boxGeometry args={[0.08, 3.2, 18]} />
        <meshStandardMaterial color="#181a20" />
      </mesh>

      <mesh position={[0, 0.1, -13.3]}>
        <boxGeometry args={[1.2, 2.2, 0.12]} />
        <meshStandardMaterial color="#33281f" />
      </mesh>

      <mesh position={[0, 2, -2.2]}>
        <boxGeometry args={[0.55, 0.1, 1]} />
        <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={emissiveStrength} />
      </mesh>

      <mesh position={[0, 2, -6]}>
        <boxGeometry args={[0.55, 0.1, 1]} />
        <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={emissiveStrength} />
      </mesh>

      <mesh position={[0, 2, -9.8]}>
        <boxGeometry args={[0.55, 0.1, 1]} />
        <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={emissiveStrength} />
      </mesh>

      <mesh position={[0, 0.6, -11.6]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#090909" emissive="#220909" emissiveIntensity={pressure * 0.4} />
      </mesh>
    </>
  );
}

export function CorridorScene({ pressure }: CorridorSceneProps) {
  return (
    <div className="corridor-frame">
      <Canvas>
        <CorridorGeometry pressure={pressure} />
      </Canvas>
    </div>
  );
}
