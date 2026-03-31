import { CorridorScene } from './features/corridor/CorridorScene';
import { AudioDirector } from './features/corridor/runtime/AudioDirector';
import { ThreatController } from './features/corridor/runtime/ThreatController';
import { useHallwayRuntime } from './features/corridor/runtime/useHallwayRuntime';

export default function App() {
  const runtime = useHallwayRuntime();
  const isRuntimeLocked = !runtime.isSessionStarted || Boolean(runtime.ending);

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
            <span>Progreso</span>
            <strong>
              {runtime.progress} / {runtime.corridorLength}
            </strong>
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
          <CorridorScene
            pressure={runtime.pressure}
            progress={runtime.progress}
            corridorLength={runtime.corridorLength}
            eventId={runtime.activeEventId}
            stage={runtime.stage}
            currentEventLabel={runtime.currentEventLabel}
            ending={runtime.ending}
          />
        </section>

        <section className="controls-panel">
          <button onClick={runtime.startSession} disabled={runtime.isSessionStarted && !runtime.ending}>
            Iniciar sesión
          </button>
          <button onClick={runtime.advance} disabled={isRuntimeLocked}>
            Avanzar
          </button>
          <button onClick={runtime.lookBack} disabled={isRuntimeLocked}>
            Mirar atrás
          </button>
          <button onClick={runtime.interact} disabled={isRuntimeLocked}>
            Interactuar
          </button>
          <button onClick={runtime.holdPosition} disabled={isRuntimeLocked}>
            Detenerse
          </button>
          <button onClick={runtime.restart}>Reiniciar</button>
        </section>

        <section className="notes-panel">
          <div className="progress-block">
            <div className="progress-copy">
              <span>Avance hacia la puerta final</span>
              <strong>{Math.round(runtime.progressRatio * 100)}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${Math.round(runtime.progressRatio * 100)}%` }} />
            </div>
          </div>

          <p>
            <strong>Estado narrativo:</strong> {runtime.stage}
          </p>
          <p>
            <strong>Evento activo:</strong> {runtime.currentEventLabel}
          </p>
          <p>
            <strong>Look backs:</strong> {runtime.lookBacks} · <strong>Interacciones:</strong> {runtime.interactions}
          </p>

          {runtime.ending ? (
            <div className={`ending-banner ending-banner--${runtime.ending}`}>
              <strong>Final: {runtime.ending}</strong>
              <span>{runtime.currentEventLabel}</span>
            </div>
          ) : null}

          <AudioDirector enabled={runtime.isSessionStarted} pressure={runtime.pressure} tension={runtime.tension} />
        </section>
      </section>
    </main>
  );
}
