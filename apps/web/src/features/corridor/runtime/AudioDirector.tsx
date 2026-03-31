import { useEffect, useMemo, useRef, useState } from 'react';

interface AudioDirectorProps {
  enabled: boolean;
  pressure: number;
  tension: number;
}

interface AudioNodes {
  context: AudioContext;
  masterGain: GainNode;
  droneGain: GainNode;
  humGain: GainNode;
  noiseGain: GainNode;
  lowpass: BiquadFilterNode;
  droneOscillator: OscillatorNode;
  humOscillator: OscillatorNode;
  noiseSource: AudioBufferSourceNode;
}

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const frameCount = context.sampleRate * 2;
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let index = 0; index < frameCount; index += 1) {
    channelData[index] = Math.random() * 2 - 1;
  }

  return buffer;
}

function createNodes(): AudioNodes {
  const context = new window.AudioContext();
  const masterGain = context.createGain();
  const droneGain = context.createGain();
  const humGain = context.createGain();
  const noiseGain = context.createGain();
  const lowpass = context.createBiquadFilter();
  const droneOscillator = context.createOscillator();
  const humOscillator = context.createOscillator();
  const noiseSource = context.createBufferSource();

  masterGain.gain.value = 0.14;
  droneGain.gain.value = 0.02;
  humGain.gain.value = 0.01;
  noiseGain.gain.value = 0.01;
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 1200;
  lowpass.Q.value = 1.2;

  droneOscillator.type = 'sawtooth';
  droneOscillator.frequency.value = 42;
  humOscillator.type = 'triangle';
  humOscillator.frequency.value = 93;

  noiseSource.buffer = createNoiseBuffer(context);
  noiseSource.loop = true;

  droneOscillator.connect(droneGain);
  humOscillator.connect(humGain);
  noiseSource.connect(noiseGain);
  droneGain.connect(lowpass);
  humGain.connect(lowpass);
  noiseGain.connect(lowpass);
  lowpass.connect(masterGain);
  masterGain.connect(context.destination);

  droneOscillator.start();
  humOscillator.start();
  noiseSource.start();

  return {
    context,
    masterGain,
    droneGain,
    humGain,
    noiseGain,
    lowpass,
    droneOscillator,
    humOscillator,
    noiseSource,
  };
}

export function AudioDirector(props: AudioDirectorProps) {
  const nodesRef = useRef<AudioNodes | null>(null);
  const [isReady, setIsReady] = useState(false);

  const label = useMemo(() => {
    if (!props.enabled) return 'Audio inactivo';
    return isReady ? 'Audio procedural activo' : 'Inicializando audio';
  }, [isReady, props.enabled]);

  useEffect(() => {
    if (!props.enabled || nodesRef.current) {
      return;
    }

    const nodes = createNodes();
    nodesRef.current = nodes;
    setIsReady(true);

    return () => {
      nodes.noiseSource.stop();
      nodes.droneOscillator.stop();
      nodes.humOscillator.stop();
      void nodes.context.close();
      nodesRef.current = null;
      setIsReady(false);
    };
  }, [props.enabled]);

  useEffect(() => {
    const nodes = nodesRef.current;

    if (!nodes) {
      return;
    }

    const pressure = Math.min(Math.max(props.pressure, 0), 1);
    const tension = Math.min(Math.max(props.tension, 0), 1);
    const now = nodes.context.currentTime;

    nodes.droneGain.gain.linearRampToValueAtTime(0.02 + pressure * 0.07, now + 0.12);
    nodes.humGain.gain.linearRampToValueAtTime(0.01 + tension * 0.04, now + 0.12);
    nodes.noiseGain.gain.linearRampToValueAtTime(0.01 + pressure * 0.05, now + 0.12);
    nodes.lowpass.frequency.linearRampToValueAtTime(1400 - pressure * 900, now + 0.12);
    nodes.droneOscillator.frequency.linearRampToValueAtTime(42 + pressure * 11, now + 0.12);
    nodes.humOscillator.frequency.linearRampToValueAtTime(93 + tension * 18, now + 0.12);
  }, [props.pressure, props.tension]);

  return <p>{label}</p>;
}
