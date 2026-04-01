import { CorridorScene } from './features/corridor/CorridorScene';
import { AudioDirector } from './features/corridor/runtime/AudioDirector';
import { useHallwayRuntime } from './features/corridor/runtime/useHallwayRuntime';
import { useHallwayTelemetry } from './features/corridor/runtime/useHallwayTelemetry';

function getDistanceLabel(progressRatio: number) {
  if (progressRatio < 0.2) return 'La entrada aun respira detras de ti';
  if (progressRatio < 0.45) return 'La salida sigue muy lejos';
  if (progressRatio < 0.75) return 'La puerta ya se insinua al fondo';
  return 'Estas rozando la salida';
}

function getTensionLabel(stage: string) {
  if (stage === 'Incomodidad') return 'Algo no encaja, pero todavia puedes marcar el ritmo.';
  if (stage === 'Presencia') return 'El pasillo ya responde a cada decision.';
  return 'La presencia ya no espera. Cada segundo pesa.';
}

function getSoundLabel(isSessionStarted: boolean, ending: 'escape' | 'loop' | 'caught' | null, tension: number) {
  if (!isSessionStarted) return 'Audio recomendado con auriculares. El silencio tambien forma parte del juego.';
  if (ending === 'escape') return 'El zumbido cae de golpe. Por fin entra aire limpio.';
  if (ending === 'loop') return 'El sonido se repliega y vuelve a empezar desde el mismo punto.';
  if (ending === 'caught') return 'Todo se corta demasiado cerca, como si algo te tapara la boca.';
  if (tension < 0.33) return 'Un zumbido lejano sostiene la tension.';
  if (tension < 0.66) return 'El aire vibra y cuesta distinguir de donde viene el ruido.';
  return 'La respiracion del pasillo ya casi te roza la nuca.';
}

function getEndingHeading(ending: 'escape' | 'loop' | 'caught' | null) {
  if (ending === 'escape') return 'Has cruzado la puerta';
  if (ending === 'loop') return 'El pasillo no te suelta';
  if (ending === 'caught') return 'Ha llegado antes que tu';
  return '';
}

export default function App() {
  const runtime = useHallwayRuntime();
  const telemetry = useHallwayTelemetry(runtime);
  const isRuntimeLocked = !runtime.isSessionStarted || Boolean(runtime.ending);
  const isDebugVisible = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug');
  const distanceLabel = getDistanceLabel(runtime.progressRatio);
  const tensionLabel = getTensionLabel(runtime.stage);
  const soundLabel = getSoundLabel(runtime.isSessionStarted, runtime.ending, runtime.tension);
  const endingHeading = getEndingHeading(runtime.ending);

  return (
    <main className="app-shell">
      <section className="layout-column experience-layout">
        <header className="hero-panel hero-panel--compact">
          <p className="eyebrow">Experiencia breve de microterror</p>
          <h1>{runtime.title}</h1>
          <p className="hero-copy">Avanza por un pasillo que se retuerce contigo. Escucha, decide y llega a la puerta antes de que algo llegue primero.</p>
          <div className="hero-meta" aria-label="Resumen de la experiencia">
            <span className="meta-chip">2-4 minutos</span>
            <span className="meta-chip">Mejor con auriculares</span>
            <span className="meta-chip">Tus decisiones cambian la tension y el final</span>
          </div>
        </header>

        <section className="play-layout">
          <section className="scene-panel scene-panel--stacked">
            <CorridorScene
              pressure={runtime.pressure}
              progress={runtime.progress}
              corridorLength={runtime.corridorLength}
              eventId={runtime.activeEventId}
              stage={runtime.stage}
              currentEventLabel={runtime.currentEventLabel}
              ending={runtime.ending}
              distanceLabel={distanceLabel}
              isSessionStarted={runtime.isSessionStarted}
            />

            {!runtime.isSessionStarted ? (
              <div className="scene-dialog-layer">
                <div className="scene-dialog-card" role="dialog" aria-labelledby="onboarding-title" aria-describedby="onboarding-copy">
                  <p className="scene-dialog-kicker">Antes de entrar</p>
                  <h2 id="onboarding-title">Una partida corta. Una salida posible.</h2>
                  <p id="onboarding-copy" className="scene-dialog-copy">
                    Cruza el pasillo y llega a la puerta final. El sonido, tu sangre fria y cada decision cambian lo que te espera al otro lado.
                  </p>
                  <ul className="onboarding-list">
                    <li>Duracion aproximada: 2 a 4 minutos.</li>
                    <li>Objetivo: avanzar sin dejar que la tension te rompa el ritmo.</li>
                    <li>Usa auriculares para notar las pistas del entorno.</li>
                    <li>Mirar, tocar o quedarte quieto altera el final.</li>
                  </ul>
                  <button
                    className="action-button action-button--primary action-button--large"
                    onClick={() => void telemetry.beginSession()}
                    aria-label="Empezar partida en el pasillo"
                  >
                    Empezar partida
                  </button>
                </div>
              </div>
            ) : null}

            {runtime.ending ? (
              <div className="scene-dialog-layer">
                <div className={`ending-card ending-card--${runtime.ending}`} role="dialog" aria-labelledby="ending-title" aria-describedby="ending-copy">
                  <p className="scene-dialog-kicker">Final</p>
                  <h2 id="ending-title">{endingHeading}</h2>
                  <p id="ending-copy" className="scene-dialog-copy">{runtime.currentEventLabel}</p>
                  <div className="ending-actions">
                    <button
                      className="action-button action-button--primary"
                      onClick={telemetry.restart}
                      aria-label="Jugar otra vez desde el principio"
                    >
                      Jugar otra vez
                    </button>
                    <button className="action-button action-button--ghost" disabled aria-label="Compartir esta experiencia proximamente">
                      Compartir pronto
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="story-panel" aria-labelledby="story-title">
            <div className="story-block">
              <p className="section-label">Estado narrativo</p>
              <h2 id="story-title">{runtime.isSessionStarted ? runtime.stage : 'Todavia estas a salvo'}</h2>
              <p className="narrative-copy" aria-live="polite">{runtime.currentEventLabel}</p>
            </div>

            <div className="signal-grid">
              <article className="signal-card">
                <span className="signal-label">Objetivo</span>
                <strong className="signal-value">{runtime.ending ? 'Salir del pasillo' : 'Llegar a la puerta'}</strong>
                <p className="signal-note">{distanceLabel}</p>
              </article>

              <article className="signal-card">
                <span className="signal-label">Sensacion</span>
                <strong className="signal-value">{runtime.stage}</strong>
                <p className="signal-note">{tensionLabel}</p>
              </article>

              <article className="signal-card">
                <span className="signal-label">Audio</span>
                <strong className="signal-value">Pista sonora</strong>
                <p className="signal-note">{soundLabel}</p>
              </article>
            </div>

            {runtime.isSessionStarted ? (
              <>
                <div className="progress-block progress-block--story" aria-label="Cercania a la salida">
                  <div className="progress-copy progress-copy--story">
                    <span>Entrada</span>
                    <strong>Cerca de la salida</strong>
                  </div>
                  <div className="progress-track" aria-hidden="true">
                    <div className="progress-fill" style={{ width: `${Math.round(runtime.progressRatio * 100)}%` }} />
                  </div>
                </div>

                <section className="controls-panel controls-panel--narrative" aria-label="Acciones de juego">
                  <div className="controls-primary">
                    <button
                      className="action-button action-button--primary"
                      onClick={telemetry.advance}
                      disabled={isRuntimeLocked}
                      aria-label="Avanzar por el pasillo"
                    >
                      Seguir adelante
                    </button>
                  </div>

                  <div className="action-grid">
                    <button
                      className="action-button"
                      onClick={telemetry.lookBack}
                      disabled={isRuntimeLocked}
                      aria-label="Mirar atras para comprobar si algo te sigue"
                    >
                      Mirar atras
                    </button>
                    <button
                      className="action-button"
                      onClick={telemetry.interact}
                      disabled={isRuntimeLocked}
                      aria-label="Tocar o investigar lo que tienes cerca"
                    >
                      Tocar lo que encuentres
                    </button>
                    <button
                      className="action-button"
                      onClick={telemetry.holdPosition}
                      disabled={isRuntimeLocked}
                      aria-label="Quedarte inmovil para bajar la tension"
                    >
                      Quedarte inmovil
                    </button>
                    <button className="action-button action-button--ghost" onClick={telemetry.restart} aria-label="Reiniciar la partida">
                      Reiniciar
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <section className="quiet-panel" aria-label="Guia antes de empezar">
                <p className="section-label">Antes de empezar</p>
                <p className="narrative-copy">
                  Entra cuando quieras. Solo necesitas un momento de calma, auriculares y decidir si avanzas, investigas o aguantas la respiracion.
                </p>
              </section>
            )}
          </section>
        </section>

        {isDebugVisible ? (
          <section className="debug-panel" aria-label="Panel debug">
            <div className="telemetry-row">
              <span className={`telemetry-pill telemetry-pill--${telemetry.syncState}`}>{telemetry.syncLabel}</span>
              <span className="telemetry-pill">
                {telemetry.sessionId ? `Sesion ${telemetry.sessionId.slice(0, 8)}` : 'Sin sesion persistida'}
              </span>
            </div>

            {telemetry.lastError ? <p className="telemetry-error">{telemetry.lastError}</p> : null}

            <div className="debug-grid">
              <article className="debug-card">
                <span>Presion</span>
                <strong>{Math.round(runtime.pressure * 100)}%</strong>
              </article>
              <article className="debug-card">
                <span>Pico</span>
                <strong>{Math.round(runtime.pressurePeak * 100)}%</strong>
              </article>
              <article className="debug-card">
                <span>Progreso</span>
                <strong>
                  {runtime.progress} / {runtime.corridorLength}
                </strong>
              </article>
              <article className="debug-card">
                <span>Eventos vistos</span>
                <strong>{runtime.eventsSeen}</strong>
              </article>
              <article className="debug-card">
                <span>Look backs</span>
                <strong>{runtime.lookBacks}</strong>
              </article>
              <article className="debug-card">
                <span>Interacciones</span>
                <strong>{runtime.interactions}</strong>
              </article>
            </div>
          </section>
        ) : null}

        <AudioDirector enabled={runtime.isSessionStarted} pressure={runtime.pressure} tension={runtime.tension} />
        <p className="sr-only" aria-live="polite">
          {runtime.currentEventLabel}
        </p>
      </section>
    </main>
  );
}
