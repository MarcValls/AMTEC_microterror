import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

interface CorridorSceneProps {
  pressure: number;
  progress: number;
  corridorLength: number;
  distanceLabel: string;
  eventId: string | null;
  stage: string;
  currentEventLabel: string;
  ending: 'escape' | 'loop' | 'caught' | null;
  isSessionStarted: boolean;
}

interface CorridorGeometryProps {
  pressure: number;
  progress: number;
  corridorLength: number;
  reduceMotion: boolean;
  eventId: string | null;
  ending: 'escape' | 'loop' | 'caught' | null;
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    applyPreference();
    mediaQuery.addEventListener('change', applyPreference);

    return () => {
      mediaQuery.removeEventListener('change', applyPreference);
    };
  }, []);

  return prefersReducedMotion;
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
  const lanternGroupRef = useRef<THREE.Group>(null);
  const silhouetteGroupRef = useRef<THREE.Group>(null);
  const frontLightRef = useRef<THREE.PointLight>(null);
  const midLightRef = useRef<THREE.PointLight>(null);
  const backLightRef = useRef<THREE.PointLight>(null);
  const doorRef = useRef<THREE.Mesh>(null);
  const lureLightARef = useRef<THREE.PointLight>(null);
  const lureLightBRef = useRef<THREE.PointLight>(null);
  const lureLightCRef = useRef<THREE.PointLight>(null);
  const backEntranceLightRef = useRef<THREE.PointLight>(null);

  const progressRatio = Math.min(Math.max(props.progress / props.corridorLength, 0), 1);
  const eventMode = props.eventId ?? 'ambient';
  const floorBoards = useMemo(
    () =>
      Array.from({ length: 22 }, (_, index) => ({
        key: `board-${index}`,
        x: index % 2 === 0 ? -0.34 : 0.34,
        z: -0.4 - Math.floor(index / 2) * 1.1,
        rotation: index % 2 === 0 ? Math.PI / 4 : -Math.PI / 4,
      })),
    [],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const sway = props.reduceMotion ? 0 : Math.sin(elapsed * 0.45) * props.pressure * 0.025;
    const tensionPulse = props.reduceMotion ? 1 : 0.94 + Math.sin(elapsed * 4.2) * (0.03 + props.pressure * 0.04);

    let flashBoost = 0;
    if (props.reduceMotion) {
      flashBoost = 0;
    } else if (eventMode === 'flicker_burst') {
      flashBoost = Math.max(0, Math.sin(elapsed * 24)) * 0.75;
    } else if (eventMode === 'micro_blackout') {
      flashBoost = -Math.max(0, Math.sin(elapsed * 20)) * 0.62;
    } else if (eventMode === 'radio_interference') {
      flashBoost = Math.abs(Math.sin(elapsed * 16)) * 0.22;
    } else if (eventMode === 'shadow_end' || eventMode === 'breath_near') {
      flashBoost = Math.abs(Math.sin(elapsed * 3.5)) * 0.12;
    }

    const lowLightClamp = props.ending === 'caught' ? 0.28 : 1;
    const frontIntensity = Math.max(0.3, (1.55 - props.pressure * 0.32 + flashBoost) * tensionPulse * lowLightClamp);
    const midIntensity = Math.max(0.08, (0.22 + props.pressure * 0.15 + flashBoost * 0.1) * lowLightClamp);
    const backIntensity = Math.max(0.16, (1.05 + props.pressure * 0.2 + flashBoost * 0.24) * lowLightClamp);

    if (corridorGroupRef.current) {
      corridorGroupRef.current.position.x = sway;
      corridorGroupRef.current.rotation.z = props.reduceMotion ? 0 : Math.sin(elapsed * 0.28) * props.pressure * 0.006;
    }

    if (lanternGroupRef.current) {
      lanternGroupRef.current.rotation.z = props.reduceMotion ? 0 : Math.sin(elapsed * 0.7) * 0.025;
      lanternGroupRef.current.position.x = props.reduceMotion ? 0 : Math.sin(elapsed * 0.38) * 0.04;
    }

    if (silhouetteGroupRef.current) {
      silhouetteGroupRef.current.position.x = props.reduceMotion ? 0 : Math.sin(elapsed * 0.42) * 0.08;
      silhouetteGroupRef.current.rotation.y = props.reduceMotion ? 0 : Math.sin(elapsed * 0.4) * 0.06;
      silhouetteGroupRef.current.scale.y = props.reduceMotion ? 1 : 1 + Math.sin(elapsed * 1.1) * 0.015;
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

    // Focal lure lights — amber sconces que parpadean y arrastran la mirada hacia la puerta
    const lurePulseA = props.reduceMotion
      ? 0.26
      : Math.max(0.04, 0.3 + Math.sin(elapsed * 2.1 + 0.8) * Math.cos(elapsed * 0.72) * 0.26);
    const lurePulseB = props.reduceMotion
      ? 0.2
      : Math.max(0.04, 0.24 + Math.sin(elapsed * 1.83 + 2.4) * Math.cos(elapsed * 0.59) * 0.2);
    const lurePulseC = props.reduceMotion
      ? 0.14 + progressRatio * 0.1
      : Math.max(0.02, 0.16 + Math.sin(elapsed * 1.38) * 0.12 + progressRatio * 0.12);
    // Luz fría de entrada — crece con presión para que el jugador sienta algo detrás
    const backPressure = props.reduceMotion
      ? props.pressure * 0.38
      : Math.max(0, props.pressure * 0.5 + Math.sin(elapsed * 0.86) * props.pressure * 0.14);

    if (lureLightARef.current) lureLightARef.current.intensity = lurePulseA * (1 - props.pressure * 0.28);
    if (lureLightBRef.current) lureLightBRef.current.intensity = lurePulseB * (1 - props.pressure * 0.18);
    if (lureLightCRef.current) lureLightCRef.current.intensity = lurePulseC;
    if (backEntranceLightRef.current) backEntranceLightRef.current.intensity = backPressure;

    if (doorRef.current) {
      doorRef.current.position.z = -13.5 + progressRatio * 1.15;
      doorRef.current.scale.x = 1 + progressRatio * 0.035;
      const material = doorRef.current.material as THREE.MeshStandardMaterial;
      material.color.set(props.ending === 'escape' ? '#7d8f76' : props.ending === 'caught' ? '#2c1616' : '#403127');
      material.emissive.set(props.ending === 'escape' ? '#546f51' : props.ending === 'loop' ? '#2f3150' : '#120707');
      material.emissiveIntensity = props.ending ? 0.18 : progressRatio * 0.04;
    }
  });

  return (
    <>
      <color attach="background" args={[props.ending === 'caught' ? '#070405' : '#0e0a09']} />
      <fog attach="fog" args={[props.ending === 'caught' ? '#090506' : '#100b09', 5.5, 18 - progressRatio * 1.8]} />
      <ambientLight intensity={0.14 - props.pressure * 0.04} color="#8f8375" />
      <pointLight ref={frontLightRef} position={[0, 3.25, -5.1]} intensity={1.4} color="#ffe3b2" distance={9} />
      <pointLight ref={midLightRef} position={[0, 0.3, -5.6]} intensity={0.2} color="#5a3f2c" distance={7} />
      <pointLight ref={backLightRef} position={[0, 2.15, -11.4]} intensity={1.05} color="#f7ead2" distance={5.5} />
      {/* Lure lights — ámbar parpadeante para arrastrar la mirada hacia la puerta */}
      <pointLight ref={lureLightARef} position={[0.9, 1.2, -4.2]} intensity={0.28} color="#e07818" distance={3.2} />
      <pointLight ref={lureLightBRef} position={[-0.9, 1.2, -7.6]} intensity={0.22} color="#d86810" distance={2.8} />
      <pointLight ref={lureLightCRef} position={[0.6, 0.9, -10.5]} intensity={0.14} color="#c85808" distance={2.4} />
      {/* Luz fría de entrada — azul-blanca a la espalda del jugador, crece con la presión */}
      <pointLight ref={backEntranceLightRef} position={[0, 1.7, 3.8]} intensity={0} color="#88aaee" distance={7} />
      <PerspectiveCamera makeDefault position={[0, 1.36, 5.15]} fov={34} />

      <group ref={corridorGroupRef}>
        <mesh position={[0, -1, -5]} receiveShadow>
          <boxGeometry args={[2.12, 0.08, 18.5]} />
          <meshStandardMaterial color="#2a1f1b" roughness={0.48} metalness={0.08} />
        </mesh>

        {floorBoards.map((board, index) => (
          <mesh key={board.key} position={[board.x, -0.94, board.z]} rotation={[-0.01, board.rotation, 0]}>
            <boxGeometry args={[0.72, 0.03, 0.5]} />
            <meshStandardMaterial
              color={index % 3 === 0 ? '#4a342a' : index % 3 === 1 ? '#3f2c24' : '#553b2f'}
              roughness={0.58}
              metalness={0.02}
            />
          </mesh>
        ))}

        <mesh position={[0, 2.95, -5]}>
          <boxGeometry args={[2.12, 0.12, 18.5]} />
          <meshStandardMaterial color="#c8bca8" roughness={0.95} />
        </mesh>

        <mesh position={[-1.06, 0.95, -5]}>
          <boxGeometry args={[0.12, 3.95, 18.5]} />
          <meshStandardMaterial color="#b8ac98" roughness={0.92} />
        </mesh>

        <mesh position={[1.06, 0.95, -5]}>
          <boxGeometry args={[0.12, 3.95, 18.5]} />
          <meshStandardMaterial color="#b8ac98" roughness={0.92} />
        </mesh>

        <mesh position={[-0.92, -0.56, -5]}>
          <boxGeometry args={[0.16, 0.34, 18.5]} />
          <meshStandardMaterial color="#4c3c33" roughness={0.84} />
        </mesh>

        <mesh position={[0.92, -0.56, -5]}>
          <boxGeometry args={[0.16, 0.34, 18.5]} />
          <meshStandardMaterial color="#4c3c33" roughness={0.84} />
        </mesh>

        {[-1, 1].map((side) => (
          <group key={`doorframe-a-${side}`} position={[side * 0.9, 0.2, -4.6]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.08, 2, 0.14]} />
              <meshStandardMaterial color="#2a221d" roughness={0.86} />
            </mesh>
            <mesh position={[0, 1.42, 0]}>
              <boxGeometry args={[0.48, 0.08, 0.14]} />
              <meshStandardMaterial color="#2a221d" roughness={0.86} />
            </mesh>
          </group>
        ))}

        {[-1, 1].map((side) => (
          <group key={`doorframe-b-${side}`} position={[side * 0.9, 0.2, -8.25]}>
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.08, 2, 0.14]} />
              <meshStandardMaterial color="#241d18" roughness={0.86} />
            </mesh>
            <mesh position={[0, 1.42, 0]}>
              <boxGeometry args={[0.48, 0.08, 0.14]} />
              <meshStandardMaterial color="#241d18" roughness={0.86} />
            </mesh>
          </group>
        ))}

        <group ref={lanternGroupRef} position={[0, 2.55, -5.4]}>
          <mesh position={[0, 0.44, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.82, 8]} />
            <meshStandardMaterial color="#22201c" roughness={0.7} metalness={0.35} />
          </mesh>
          <mesh position={[0, -0.06, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.52, 8]} />
            <meshStandardMaterial color="#30251d" roughness={0.58} metalness={0.2} />
          </mesh>
          <mesh position={[0, -0.08, 0]}>
            <cylinderGeometry args={[0.11, 0.14, 0.34, 8]} />
            <meshStandardMaterial color="#f6d8a0" emissive="#f4c978" emissiveIntensity={0.55} roughness={0.18} />
          </mesh>
        </group>

        <mesh position={[0, 1.58, -5.46]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.58, 24]} />
          <meshStandardMaterial color="#85664f" transparent opacity={0.18 + progressRatio * 0.08} />
        </mesh>

        <mesh ref={doorRef} position={[0, 0.12, -13.5]}>
          <boxGeometry args={[1.08, 2.48, 0.16]} />
          <meshStandardMaterial color="#403127" emissive="#000000" roughness={0.82} />
        </mesh>

        <mesh position={[0, 1.35, -13.42]}>
          <boxGeometry args={[1.34, 2.82, 0.08]} />
          <meshStandardMaterial color="#1f1713" roughness={0.94} />
        </mesh>

        <group ref={silhouetteGroupRef} position={[0, -0.12, -11.15]}>
          <mesh position={[0, 0.62, 0]}>
            <coneGeometry args={[0.42, 1.8, 12]} />
            <meshStandardMaterial color="#090807" roughness={0.96} emissive="#170b0a" emissiveIntensity={0.08 + props.pressure * 0.08} />
          </mesh>
          <mesh position={[0, 1.72, 0]}>
            <sphereGeometry args={[0.21, 18, 18]} />
            <meshStandardMaterial color="#0b0909" roughness={0.98} />
          </mesh>
          <mesh position={[-0.18, 0.28, 0.02]} rotation={[0, 0, 0.1]}>
            <cylinderGeometry args={[0.045, 0.05, 1.15, 8]} />
            <meshStandardMaterial color="#090807" roughness={0.96} />
          </mesh>
          <mesh position={[0.18, 0.28, 0.02]} rotation={[0, 0, -0.1]}>
            <cylinderGeometry args={[0.045, 0.05, 1.15, 8]} />
            <meshStandardMaterial color="#090807" roughness={0.96} />
          </mesh>
          <mesh position={[-0.12, -0.62, 0]} rotation={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.04, 0.05, 0.98, 8]} />
            <meshStandardMaterial color="#090807" roughness={0.96} />
          </mesh>
          <mesh position={[0.12, -0.66, 0]} rotation={[0, 0, -0.05]}>
            <cylinderGeometry args={[0.04, 0.05, 1.08, 8]} />
            <meshStandardMaterial color="#090807" roughness={0.96} />
          </mesh>
        </group>

        <mesh position={[0, -0.95, -11.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.82, 24]} />
          <meshStandardMaterial color="#150f0d" transparent opacity={0.34} />
        </mesh>
      </group>
    </>
  );
}

export function CorridorScene(props: CorridorSceneProps) {
  const accent = useMemo(() => getEventAccent(props.eventId, props.ending), [props.ending, props.eventId]);
  const prefersReducedMotion = useReducedMotionPreference();
  const [showIntroFlash, setShowIntroFlash] = useState(false);
  const progressRatio = Math.min(Math.max(props.progress / props.corridorLength, 0), 1);

  useEffect(() => {
    if (!props.isSessionStarted) return;
    setShowIntroFlash(true);
    const timer = setTimeout(() => setShowIntroFlash(false), 2600);
    return () => clearTimeout(timer);
  }, [props.isSessionStarted]);

  return (
    <div className="corridor-frame corridor-frame--reactive">
      <Canvas dpr={[1, 1.5]}>
        <CorridorGeometry
          pressure={props.pressure}
          progress={props.progress}
          corridorLength={props.corridorLength}
          reduceMotion={prefersReducedMotion}
          eventId={props.eventId}
          ending={props.ending}
        />
      </Canvas>

      {showIntroFlash && !prefersReducedMotion ? (
        <div className="corridor-intro-flash" aria-hidden="true" />
      ) : null}

      <div
        className="overlay-entrance-lure"
        aria-hidden="true"
        style={{ opacity: props.isSessionStarted ? Math.min(0.9, props.pressure * 0.8 + 0.05) : 0 }}
      />
      <div
        className="overlay-door-lure"
        aria-hidden="true"
        style={{ opacity: props.isSessionStarted ? Math.min(0.85, progressRatio * 0.7 + 0.06) : 0 }}
      />

      <div className="scene-overlay">
        <div className="scene-overlay__top">
          {props.isSessionStarted ? (
            <span className="scene-chip" style={{ borderColor: accent, color: accent }}>
              {props.stage}
            </span>
          ) : null}
          <span className="scene-chip">{props.distanceLabel}</span>
        </div>
        <div className="scene-overlay__subtitle">
          {props.isSessionStarted ? (
            <p
              className="subtitle-event"
              key={props.currentEventLabel}
              style={{ borderLeftColor: accent }}
            >
              {props.currentEventLabel}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
