export type HallwayTrigger = 'session_started' | 'segment_enter' | 'interaction' | 'look_back';

export interface HallwayRuntimeEvent {
  eventId: string;
  label: string;
  trigger: HallwayTrigger;
  minPressure: number;
  maxPressure: number;
  weight: number;
}

export const corridorRuntimeTemplate = {
  sceneId: 'corredor_v1',
  title: 'Pasillo interminable',
  corridorLength: 7,
  eventPool: [
    {
      eventId: 'flicker_burst',
      label: 'La luz del techo tiembla como si algo acabara de cruzarla',
      trigger: 'segment_enter',
      minPressure: 0.1,
      maxPressure: 0.9,
      weight: 1,
    },
    {
      eventId: 'wall_knock',
      label: 'Un golpe seco vibra al otro lado de la pared izquierda',
      trigger: 'segment_enter',
      minPressure: 0.2,
      maxPressure: 1,
      weight: 0.9,
    },
    {
      eventId: 'radio_interference',
      label: 'La radio escupe una interferencia que no deberia existir',
      trigger: 'interaction',
      minPressure: 0.25,
      maxPressure: 1,
      weight: 0.7,
    },
    {
      eventId: 'shadow_end',
      label: 'Algo se recorta al fondo y desaparece justo cuando enfocas la vista',
      trigger: 'look_back',
      minPressure: 0.35,
      maxPressure: 1,
      weight: 0.8,
    },
    {
      eventId: 'micro_blackout',
      label: 'Un apagon breve lo cambia todo. El pasillo vuelve distinto.',
      trigger: 'segment_enter',
      minPressure: 0.45,
      maxPressure: 1,
      weight: 0.75,
    },
    {
      eventId: 'breath_near',
      label: 'Escuchas una respiracion demasiado cerca de tu hombro.',
      trigger: 'interaction',
      minPressure: 0.55,
      maxPressure: 1,
      weight: 0.65,
    },
  ] satisfies HallwayRuntimeEvent[],
  endings: {
    escape: 'La puerta cede, entra aire limpio y el zumbido queda atras. Sales, pero no te atreves a mirar quien no ha cruzado contigo.',
    loop: 'Cruzas el umbral y el mismo pasillo vuelve a desplegarse ante ti. Has llegado a algun sitio, pero no era la salida.',
    caught: 'Algo te alcanza antes del pomo. El sonido se corta de golpe y el pasillo termina donde tu tambien.',
  },
} as const;
