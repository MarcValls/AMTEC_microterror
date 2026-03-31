import { CorridorScene } from './features/corridor/CorridorScene';
import { AudioDirector } from './features/corridor/runtime/AudioDirector';
import { ThreatController } from './features/corridor/runtime/ThreatController';
import { useHallwayRuntime } from './features/corridor/runtime/useHallwayRuntime';

export default function App() {
  const runtime = useHallwayRuntime();

  return (
    <main className="app-shell">
      <section className="layout-column">
        <header className="hero-panel">
          <p className="eyebrow">AMTEC microterror · runtime jugable</p>
          <h1>{runtime.title}</h1>
          <p className="hero-copy">
            Slice vertical del pasillo con progreso por tramos, eventos reactivos, amenaza persistente y audio procedural.
          </p>
        </header>

        <section className="stats-grid">
          <article className="stat-card">
            <span>Presión</span>
            <strong>{Math.round(runtime.pressure * 100)}%</strong>
          </article>
          <article className="stat-card">
            <span>Eventos vistos</span>
            <strong>{runtime.eventsSeen}</strong>
          </article>
          <ThreatController
            pressure={runtime.pressure}
            progress={runtime.progress}
            corridorLength={runtime.corridorLength}
          />
        </section>

        <section className="scene-panel">
          <CorridorScene pressure={runtime.pressure} />
        </section>

        <section className="controls-panel">
          <button onClick={runtime.startSession} disabled={runtime.isSessionStarted && !runtime.ending}>
            Iniciar sesión
          </button>
          <button onClick={runtime.advance}>Avanzar</button>
          <button onClick={runtime.lookBack}>Mirar atrás</button>
          <button onClick={runtime.interact}>Interactuar</button>
          <button onClick={runtime.holdPosition}>Detenerse</button>
          <button onClick={runtime.restart}>Reiniciar</button>
        </section>

        <section className="notes-panel">
          <p>
            <strong>Tramo:</strong> {runtime.progress} / {runtime.corridorLength}
          </p>
          <p>
            <strong>Estado narrativo:</strong> {runtime.stage}
          </p>
          <p>
            <strong>Evento actual:</strong> {runtime.currentEventLabel}
          </p>
          <p>
            <strong>Look backs:</strong> {runtime.lookBacks} · <strong>Interacciones:</strong> {runtime.interactions}
          </p>
          <AudioDirector enabled={runtime.isSessionStarted} pressure={runtime.pressure} tension={runtime.tension} />
        </section>
      </section>
    </main>
  );
}
