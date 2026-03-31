import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CorridorSceneProps {
  pressure: number;
  progress: number;
  corridorLength: number;
  eventId: string | null;
  stage: string;
  currentEventLabel: string;
  ending: 'escape' | 'loop' | 'caught' | null;
}

interface CorridorGeometryProps {
  pressure: number;
  progress: number;
  corridorLength: number;
  eventId: string | null;
  ending: 'escape' | 'loop' | 'caught' | null;
}

function getEventAccent(eventId: string | null, ending: CorridorSceneProps['ending']): string {
  if (ending === 'escape') return 'rgba(118, 197, 160, 0.9)';
  if (ending === 'loop') return 'rgba(130, 150, 255, 0.92)';
  if (ending === 'caught') return 'rgba(255, 96, 96, 0.92)';
  if (eventId === 'flicker_burst' || eventId === 'micro_blackout') return 'rgba(197, 220, 255, 0.92)';
  if (eventId === 'radio_interference') return 'rgba(143, 255, 225, 0.92)';
  if (eventId === 'shadow_end' || eventId === 'breath_near') return 'rgba(255, 127, 127, 0.92)';
  return 'rgba(243, 246, 251, 0.88)';
}

function CorridorGeometry(props: CorridorGeometryProps) {
  const corridorGroupRef = useRef<THREE.Group>(null);
  const frontLightRef = useRef<THREE.PointLight>(null);
  const midLightRef = useRef<THREE.PointLight>(null);
  const backLightRef = useRef<THREE.PointLight>(null);
  const glowOneRef = useRef<THREE.Mesh>(null);
  const glowTwoRef = useRef<THREE.Mesh>(null);
  const glowThreeRef = useRef<THREE.Mesh>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const doorRef = useRef<THREE.Mesh>(null);

  const progressRatio = Math.min(Math.max(props.progress / props.corridorLength, 0), 1);
  const eventMode = props.eventId ?? 'ambient';

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const sway = Math.sin(elapsed * 0.7) * props.pressure * 0.045;
    const tensionPulse = 0.86 + Math.sin(elapsed * 6.8) * (0.05 + props.pressure * 0.05);

    let flashBoost = 0;
    if (eventMode === 'flicker_burst') {
      flashBoost = Math.max(0, Math.sin(elapsed * 28)) * 0.95;
    } else if (eventMode === 'micro_blackout') {
      flashBoost = Math.max(0, Math.sin(elapsed * 42)) * 1.15;
    } else if (eventMode === 'radio_interference') {
      flashBoost = Math.abs(Math.sin(elapsed * 18)) * 0.42;
    } else if (eventMode === 'shadow_end' || eventMode === 'breath_near') {
      flashBoost = Math.abs(Math.sin(elapsed * 4.5)) * 0.2;
    }

    const lowLightClamp = props.ending === 'caught' ? 0.28 : 1;
    const frontIntensity = Math.max(0.18, (1.9 - props.pressure * 0.75 + flashBoost) * tensionPulse * lowLightClamp);
    const midIntensity = Math.max(0.12, (1.55 - props.pressure * 0.6 + flashBoost * 0.65) * tensionPulse * lowLightClamp);
    const backIntensity = Math.max(0.08, (1.18 - props.pressure * 0.45 + flashBoost * 0.45) * tensionPulse * lowLightClamp);

    if (corridorGroupRef.current) {
      corridorGroupRef.current.position.x = sway;
      corridorGroupRef.current.rotation.z = Math.sin(elapsed * 0.33) * props.pressure * 0.01;
    }

    if (frontLightRef.current) {
      frontLightRef.current.intensity = frontIntensity;
    }
    if (midLightRef.current) {
      midLightRef.current.intensity = midIntensity;
    }
    if (backLightRef.current) {
      backLightRef.current.intensity = backIntensity;
    }

    const glowIntensity = 0.12 + props.pressure * 0.28 + flashBoost * 0.18;
    const glows = [glowOneRef.current, glowTwoRef.current, glowThreeRef.current];
    for (const glow of glows) {
      if (!glow) {
        continue;
      }
      const material = glow.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = glowIntensity;
    }

    if (shadowRef.current) {
      shadowRef.current.position.x = Math.sin(elapsed * 0.85) * 0.22;
      shadowRef.current.position.y = 0.65 + Math.sin(elapsed * 1.9) * 0.04;
      shadowRef.current.scale.setScalar(0.85 + props.pressure * 0.9 + progressRatio * 0.55);
      const material = shadowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = props.pressure * 0.32 + (props.ending === 'caught' ? 0.16 : 0);
    }

    if (doorRef.current) {
      doorRef.current.position.z = -13.3 + progressRatio * 1.25;
      doorRef.current.scale.x = 1 + progressRatio * 0.05;
      const material = doorRef.current.material as THREE.MeshStandardMaterial;
      material.color.set(props.ending === 'escape' ? '#7abf9a' : props.ending === 'caught' ? '#5c2525' : '#33281f');
      material.emissive.set(props.ending === 'escape' ? '#2c5f4b' : props.ending === 'loop' ? '#28315e' : '#140707');
      material.emissiveIntensity = props.ending ? 0.22 : progressRatio * 0.06;
    }
  });

  return (
    <>
      <color attach="background" args={[props.ending === 'caught' ? '#040405' : '#05070b']} />
      <fog attach="fog" args={[props.ending === 'caught' ? '#050506' : '#05070b', 5.2, 17 - progressRatio * 2.2]} />
      <ambientLight intensity={0.42 - props.pressure * 0.16} />
      <pointLight ref={frontLightRef} position={[0, 2.35, 1.2]} intensity={1.8} color="#d8e6ff" />
      <pointLight ref={midLightRef} position={[0, 2.3, -3.6]} intensity={1.4} color="#bfd5ff" />
      <pointLight ref={backLightRef} position={[0, 2.28, -8.4]} intensity={1.1} color="#aabfff" />
      <PerspectiveCamera makeDefault position={[0, 1.2, 4.6]} fov={42} />

      <group ref={corridorGroupRef}>
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

        <mesh position={[-1.05, 0.1, -4.7]}>
          <boxGeometry args={[0.18, 1.4, 0.02]} />
          <meshStandardMaterial color="#262932" roughness={0.9} />
        </mesh>

        <mesh position={[1.05, 0.4, -8.2]} rotation={[0, -0.08, 0]}>
          <boxGeometry args={[0.6, 0.6, 0.03]} />
          <meshStandardMaterial color="#2f333c" roughness={0.9} />
        </mesh>

        <mesh ref={doorRef} position={[0, 0.1, -13.3]}>
          <boxGeometry args={[1.2, 2.2, 0.12]} />
          <meshStandardMaterial color="#33281f" emissive="#000000" />
        </mesh>

        <mesh ref={glowOneRef} position={[0, 2, -2.2]}>
          <boxGeometry args={[0.55, 0.1, 1]} />
          <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={0.1} />
        </mesh>

        <mesh ref={glowTwoRef} position={[0, 2, -6]}>
          <boxGeometry args={[0.55, 0.1, 1]} />
          <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={0.1} />
        </mesh>

        <mesh ref={glowThreeRef} position={[0, 2, -9.8]}>
          <boxGeometry args={[0.55, 0.1, 1]} />
          <meshStandardMaterial color="#d5e6ff" emissive="#a6c8ff" emissiveIntensity={0.1} />
        </mesh>

        <mesh ref={shadowRef} position={[0, 0.62, -11.5]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#090909" emissive="#2b0909" emissiveIntensity={props.pressure * 0.25} />
        </mesh>
      </group>
    </>
  );
}

export function CorridorScene(props: CorridorSceneProps) {
  const accent = useMemo(() => getEventAccent(props.eventId, props.ending), [props.ending, props.eventId]);
  const progressRatio = Math.round((props.progress / props.corridorLength) * 100);

  return (
    <div className="corridor-frame corridor-frame--reactive">
      <Canvas>
        <CorridorGeometry
          pressure={props.pressure}
          progress={props.progress}
          corridorLength={props.corridorLength}
          eventId={props.eventId}
          ending={props.ending}
        />
      </Canvas>
      <div className="scene-overlay">
        <div className="scene-overlay__top">
          <span className="scene-chip" style={{ borderColor: accent, color: accent }}>
            {props.stage}
          </span>
          <span className="scene-chip">{progressRatio}% del pasillo</span>
        </div>
        <div className="scene-overlay__bottom">
          <p className="scene-event" style={{ borderColor: accent }}>
            {props.currentEventLabel}
          </p>
        </div>
      </div>
    </div>
  );
}
