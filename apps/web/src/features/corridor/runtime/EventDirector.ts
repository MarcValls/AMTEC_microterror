import { HallwayRuntimeEvent, HallwayTrigger, corridorRuntimeTemplate } from './corridorTemplate';

interface PickEventArgs {
  trigger: HallwayTrigger;
  pressure: number;
  seenEventIds: string[];
  progressIndex: number;
}

export function pickHallwayEvent(args: PickEventArgs): HallwayRuntimeEvent | null {
  const candidates = corridorRuntimeTemplate.eventPool.filter((event) => {
    return (
      event.trigger === args.trigger &&
      args.pressure >= event.minPressure &&
      args.pressure <= event.maxPressure &&
      !args.seenEventIds.includes(event.eventId)
    );
  });

  if (candidates.length === 0) {
    return null;
  }

  const weighted = [...candidates].sort((left, right) => right.weight - left.weight);
  const index = args.progressIndex % weighted.length;
  return weighted[index];
}
