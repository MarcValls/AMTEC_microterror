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
      label: 'Parpadeo brusco en la luz del techo',
      trigger: 'segment_enter',
      minPressure: 0.1,
      maxPressure: 0.9,
      weight: 1,
    },
    {
      eventId: 'wall_knock',
      label: 'Golpe seco detrás de la pared izquierda',
      trigger: 'segment_enter',
      minPressure: 0.2,
      maxPressure: 1,
      weight: 0.9,
    },
    {
      eventId: 'radio_interference',
      label: 'La radio escupe una interferencia imposible',
      trigger: 'interaction',
      minPressure: 0.25,
      maxPressure: 1,
      weight: 0.7,
    },
    {
      eventId: 'shadow_end',
      label: 'Algo se recorta al fondo y desaparece al mirar',
      trigger: 'look_back',
      minPressure: 0.35,
      maxPressure: 1,
      weight: 0.8,
    },
    {
      eventId: 'micro_blackout',
      label: 'Apagón breve. El pasillo vuelve distinto.',
      trigger: 'segment_enter',
      minPressure: 0.45,
      maxPressure: 1,
      weight: 0.75,
    },
    {
      eventId: 'breath_near',
      label: 'Escuchas una respiración demasiado cerca.',
      trigger: 'interaction',
      minPressure: 0.55,
      maxPressure: 1,
      weight: 0.65,
    },
  ] satisfies HallwayRuntimeEvent[],
  endings: {
    escape: 'Llegas a la puerta, gira el pomo y el aire cambia. Sales, pero no sabes qué te seguía.',
    loop: 'Cruzas el umbral y vuelves al inicio del mismo pasillo. Nada ha terminado.',
    caught: 'La presencia te alcanza antes de abrir la puerta. El sonido se corta de golpe.',
  },
} as const;
