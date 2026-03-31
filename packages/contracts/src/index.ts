export type ThreatType = 'presencia_detras';
export type EndingType = 'good' | 'ambiguous' | 'bad';

export interface ThreatPressureCurve {
  base: number;
  timeMultiplier: number;
  movementMultiplier: number;
  lookBackRiskMultiplier: number;
  interactionRiskMultiplier: number;
  maxPressure: number;
}

export interface HallwayEventDefinition {
  eventId: string;
  label: string;
  trigger: 'segment_enter' | 'time_elapsed' | 'interaction' | 'look_back';
  minPressure: number;
  maxPressure: number;
  weight: number;
}

export interface EndingDefinition {
  endingId: string;
  type: EndingType;
  label: string;
}

export interface CorridorAudioPreset {
  presetId: string;
  tensionBase: number;
  droneLevel: number;
  humLevel: number;
  noiseLevel: number;
  glitchProbability: number;
  subPresence: number;
  reverb: number;
}

export interface CorridorTemplate {
  sceneId: string;
  templateType: 'hallway';
  title: string;
  description: string;
  durationTargetSeconds: number;
  corridorLength: number;
  threatType: ThreatType;
  threatPressureCurve: ThreatPressureCurve;
  eventPool: HallwayEventDefinition[];
  endingSet: EndingDefinition[];
  audioPreset: CorridorAudioPreset;
}

export interface TelemetryEvent {
  name:
    | 'session_started'
    | 'tutorial_completed'
    | 'look_back_used'
    | 'interaction_triggered'
    | 'event_seen'
    | 'threat_peak_reached'
    | 'ending_reached'
    | 'session_completed'
    | 'session_abandoned'
    | 'shared_link_opened';
  sceneId: string;
  sessionId: string;
  createdAt: string;
}
