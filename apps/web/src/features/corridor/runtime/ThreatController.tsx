interface ThreatControllerProps {
  pressure: number;
  progress: number;
  corridorLength: number;
}

export function ThreatController(props: ThreatControllerProps) {
  const stage = props.pressure < 0.34 ? 'Incomodidad' : props.pressure < 0.67 ? 'Presencia' : 'Clímax';
  const remainingSegments = Math.max(props.corridorLength - props.progress, 0);

  return (
    <article className="stat-card">
      <span>Amenaza</span>
      <strong>{stage}</strong>
      <span>Tramos restantes: {remainingSegments}</span>
    </article>
  );
}
