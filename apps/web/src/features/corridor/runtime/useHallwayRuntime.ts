import { useMemo, useState } from 'react';
import { pickHallwayEvent } from './EventDirector';
import { resolveHallwayEnding, HallwayEndingId } from './EndingResolver';
import { corridorRuntimeTemplate } from './corridorTemplate';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function stageFromPressure(pressure: number): string {
  if (pressure < 0.34) return 'Incomodidad';
  if (pressure < 0.67) return 'Presencia';
  return 'Clímax';
}

export function useHallwayRuntime() {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [pressure, setPressure] = useState(0.12);
  const [progress, setProgress] = useState(0);
  const [lookBacks, setLookBacks] = useState(0);
  const [interactions, setInteractions] = useState(0);
  const [seenEventIds, setSeenEventIds] = useState<string[]>([]);
  const [currentEventLabel, setCurrentEventLabel] = useState('Pulsa “Iniciar sesión” para entrar al pasillo.');
  const [ending, setEnding] = useState<HallwayEndingId | null>(null);

  const tension = useMemo(() => clamp(pressure * 0.82 + progress * 0.04, 0, 1), [pressure, progress]);
  const stage = useMemo(() => stageFromPressure(pressure), [pressure]);

  const startSession = () => {
    setIsSessionStarted(true);
    setCurrentEventLabel('La luz del primer tramo vibra. El pasillo te acepta.');
  };

  const triggerEvent = (trigger: 'segment_enter' | 'interaction' | 'look_back') => {
    const event = pickHallwayEvent({
      trigger,
      pressure,
      seenEventIds,
      progressIndex: progress,
    });

    if (!event) {
      setCurrentEventLabel('No ocurre nada claro, y eso te inquieta más.');
      return;
    }

    setSeenEventIds((value) => [...value, event.eventId]);
    setCurrentEventLabel(event.label);
  };

  const settleEnding = (nextPressure: number, nextProgress: number, nextLookBacks: number, nextInteractions: number) => {
    const nextEnding = resolveHallwayEnding({
      pressure: nextPressure,
      progress: nextProgress,
      corridorLength: corridorRuntimeTemplate.corridorLength,
      lookBacks: nextLookBacks,
      interactions: nextInteractions,
    });

    if (!nextEnding) {
      return;
    }

    setEnding(nextEnding);
    setCurrentEventLabel(corridorRuntimeTemplate.endings[nextEnding]);
  };

  const advance = () => {
    if (!isSessionStarted || ending) {
      return;
    }

    const nextProgress = Math.min(progress + 1, corridorRuntimeTemplate.corridorLength);
    const nextPressure = clamp(pressure + 0.1, 0, 1);
    setProgress(nextProgress);
    setPressure(nextPressure);
    triggerEvent('segment_enter');
    settleEnding(nextPressure, nextProgress, lookBacks, interactions);
  };

  const lookBack = () => {
    if (!isSessionStarted || ending) {
      return;
    }

    const nextLookBacks = lookBacks + 1;
    const nextPressure = clamp(pressure + 0.07, 0, 1);
    setLookBacks(nextLookBacks);
    setPressure(nextPressure);
    triggerEvent('look_back');
    settleEnding(nextPressure, progress, nextLookBacks, interactions);
  };

  const interact = () => {
    if (!isSessionStarted || ending) {
      return;
    }

    const nextInteractions = interactions + 1;
    const nextPressure = clamp(pressure + 0.09, 0, 1);
    setInteractions(nextInteractions);
    setPressure(nextPressure);
    triggerEvent('interaction');
    settleEnding(nextPressure, progress, lookBacks, nextInteractions);
  };

  const holdPosition = () => {
    if (!isSessionStarted || ending) {
      return;
    }

    const nextPressure = clamp(pressure - 0.05, 0, 1);
    setPressure(nextPressure);
    setCurrentEventLabel('Te detienes. El zumbido no desaparece, pero respiras mejor.');
  };

  const restart = () => {
    setIsSessionStarted(false);
    setPressure(0.12);
    setProgress(0);
    setLookBacks(0);
    setInteractions(0);
    setSeenEventIds([]);
    setCurrentEventLabel('Pulsa “Iniciar sesión” para entrar al pasillo.');
    setEnding(null);
  };

  return {
    title: corridorRuntimeTemplate.title,
    corridorLength: corridorRuntimeTemplate.corridorLength,
    pressure,
    tension,
    progress,
    lookBacks,
    interactions,
    eventsSeen: seenEventIds.length,
    currentEventLabel,
    ending,
    isSessionStarted,
    stage,
    startSession,
    advance,
    lookBack,
    interact,
    holdPosition,
    restart,
  };
}
