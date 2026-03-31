export interface CorridorMixState {
  pressure: number;
  tension: number;
}

export interface CorridorSynthMix {
  droneLevel: number;
  humLevel: number;
  noiseLevel: number;
  subLevel: number;
  glitchProbability: number;
  reverbMix: number;
}

export const corridorV1Preset: CorridorSynthMix = {
  droneLevel: 0.55,
  humLevel: 0.4,
  noiseLevel: 0.22,
  subLevel: 0.18,
  glitchProbability: 0.12,
  reverbMix: 0.31,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getCorridorMix(state: CorridorMixState): CorridorSynthMix {
  const pressure = clamp(state.pressure, 0, 1);
  const tension = clamp(state.tension, 0, 1);

  return {
    droneLevel: clamp(corridorV1Preset.droneLevel + pressure * 0.18, 0, 1),
    humLevel: clamp(corridorV1Preset.humLevel + tension * 0.1, 0, 1),
    noiseLevel: clamp(corridorV1Preset.noiseLevel + pressure * 0.14, 0, 1),
    subLevel: clamp(corridorV1Preset.subLevel + pressure * 0.28, 0, 1),
    glitchProbability: clamp(corridorV1Preset.glitchProbability + pressure * 0.22, 0, 1),
    reverbMix: clamp(corridorV1Preset.reverbMix + tension * 0.12, 0, 1),
  };
}
