import { useMemo, useState } from 'react';
import { CorridorScene } from './features/corridor/CorridorScene';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function App() {
  const [pressure, setPressure] = useState(0.16);
  const [eventsSeen, setEventsSeen] = useState(0);
  const [lookBacks, setLookBacks] = useState(0);

  const status = useMemo(() => {
    if (pressure < 0.34) return 'Incomodidad';
    if (pressure < 0.67) return 'Presencia';
    return 'Clímax';
  }, [pressure]);

  return (
    <main className="app-shell">
      <section className="layout-column">
        <header className="hero-panel">
          <p className="eyebrow">AMTEC microterror · MVP pasillo</p>
          <h1>Pasillo interminable</h1>
          <p className="hero-copy">
            Slice vertical inicial en React para validar atmósfera, tensión, audio procedural y publicación por enlace.
          </p>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span>Presión</span>
            <strong>{Math.round(pressure * 100)}%</strong>
          </article>
          <article className="stat-card">
            <span>Eventos vistos</span>
            <strong>{eventsSeen}</strong>
          </article>
          <article className="stat-card">
            <span>Estado</span>
            <strong>{status}</strong>
          </article>
        </section>

        <section className="scene-panel">
          <CorridorScene pressure={pressure} />
        </section>

        <section className="controls-panel">
          <button onClick={() => setPressure((value) => clamp(value + 0.08, 0, 1))}>Avanzar</button>
          <button
            onClick={() => {
              setLookBacks((value) => value + 1);
              setPressure((value) => clamp(value + 0.05, 0, 1));
            }}
          >
            Mirar atrás
          </button>
          <button
            onClick={() => {
              setEventsSeen((value) => value + 1);
              setPressure((value) => clamp(value + 0.12, 0, 1));
            }}
          >
            Interactuar
          </button>
          <button onClick={() => setPressure((value) => clamp(value - 0.04, 0, 1))}>Detenerse</button>
        </section>

        <section className="notes-panel">
          <p>
            <strong>Look backs:</strong> {lookBacks}
          </p>
          <p>
            Este shell ya separa la lógica de presión del render del pasillo, que es justo la base que necesitaremos para el
            controlador de amenaza y el director de eventos.
          </p>
        </section>
      </section>
    </main>
  );
}
