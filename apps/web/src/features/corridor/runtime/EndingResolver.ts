interface ResolveEndingArgs {
  pressure: number;
  progress: number;
  corridorLength: number;
  lookBacks: number;
  interactions: number;
}

export type HallwayEndingId = 'escape' | 'loop' | 'caught';

export function resolveHallwayEnding(args: ResolveEndingArgs): HallwayEndingId | null {
  if (args.progress < args.corridorLength) {
    return null;
  }

  const riskScore = args.pressure + args.lookBacks * 0.04 + args.interactions * 0.02;

  if (riskScore < 0.72) {
    return 'escape';
  }

  if (riskScore < 0.98) {
    return 'loop';
  }

  return 'caught';
}
