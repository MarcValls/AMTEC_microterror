import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { HallwayEndingId } from './EndingResolver';
import type { useHallwayRuntime } from './useHallwayRuntime';
import {
  completeRemoteSession,
  createClientSessionId,
  startRemoteSession,
  trackRemoteTelemetryEvent,
} from '../../../lib/api';

type HallwayRuntimeController = ReturnType<typeof useHallwayRuntime>;
type TelemetrySyncState = 'idle' | 'syncing' | 'online' | 'degraded';

const TRACKABLE_EVENT_IDS = new Set([
  'flicker_burst',
  'wall_knock',
  'radio_interference',
  'shadow_end',
  'micro_blackout',
  'breath_near',
]);

function buildMetrics(runtime: HallwayRuntimeController) {
  return {
    progress: runtime.progress,
    eventsSeen: runtime.eventsSeen,
    lookBacks: runtime.lookBacks,
    interactions: runtime.interactions,
    pressurePeak: runtime.pressurePeak,
  };
}

export function useHallwayTelemetry(runtime: HallwayRuntimeController) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<TelemetrySyncState>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const previousLookBacksRef = useRef(0);
  const previousInteractionsRef = useRef(0);
  const previousEventKeyRef = useRef<string | null>(null);
  const previousEndingRef = useRef<HallwayEndingId | null>(null);
  const threatPeakTrackedRef = useRef(false);
  const finalizedRef = useRef(false);

  const markDegraded = useCallback((error: unknown) => {
    setSyncState('degraded');
    setLastError(error instanceof Error ? error.message : 'Telemetry sync failed');
  }, []);

  const resetTrackingRefs = useCallback(() => {
    previousLookBacksRef.current = 0;
    previousInteractionsRef.current = 0;
    previousEventKeyRef.current = null;
    previousEndingRef.current = null;
    threatPeakTrackedRef.current = false;
    finalizedRef.current = false;
  }, []);

  const syncLabel = useMemo(() => {
    if (syncState === 'idle') return 'Sincronización inactiva';
    if (syncState === 'syncing') return 'Sincronizando sesión';
    if (syncState === 'online') return 'Telemetría persistida';
    return 'Persistencia degradada';
  }, [syncState]);

  const beginSession = useCallback(async () => {
    if (runtime.isSessionStarted) {
      return;
    }

    const nextSessionId = createClientSessionId();
    setSessionId(nextSessionId);
    setSyncState('syncing');
    setLastError(null);
    resetTrackingRefs();
    runtime.startSession();

    try {
      await startRemoteSession({
        sessionId: nextSessionId,
        sceneId: 'corredor_v1',
        templateType: 'hallway',
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          viewport:
            typeof window !== 'undefined'
              ? { width: window.innerWidth, height: window.innerHeight }
              : { width: 0, height: 0 },
        },
      });
      await trackRemoteTelemetryEvent({
        sessionId: nextSessionId,
        sceneId: 'corredor_v1',
        name: 'session_started',
        payload: {
          stage: runtime.stage,
          pressure: runtime.pressure,
          progress: runtime.progress,
          pressurePeak: runtime.pressurePeak,
        },
      });
      setSyncState('online');
    } catch (error) {
      markDegraded(error);
    }
  }, [markDegraded, resetTrackingRefs, runtime]);

  const finalizeSession = useCallback(
    async (status: 'completed' | 'abandoned', ending: HallwayEndingId | null, keepalive = false) => {
      if (!sessionId || finalizedRef.current) {
        return;
      }

      finalizedRef.current = true;
      const metrics = buildMetrics(runtime);

      try {
        if (status === 'completed' && ending) {
          await trackRemoteTelemetryEvent(
            {
              sessionId,
              sceneId: 'corredor_v1',
              name: 'ending_reached',
              payload: {
                ending,
                ...metrics,
              },
            },
            keepalive,
          );
          await trackRemoteTelemetryEvent(
            {
              sessionId,
              sceneId: 'corredor_v1',
              name: 'session_completed',
              payload: {
                ending,
                ...metrics,
              },
            },
            keepalive,
          );
        } else {
          await trackRemoteTelemetryEvent(
            {
              sessionId,
              sceneId: 'corredor_v1',
              name: 'session_abandoned',
              payload: {
                ending: null,
                ...metrics,
              },
            },
            keepalive,
          );
        }

        await completeRemoteSession(
          sessionId,
          {
            status,
            ending,
            ...metrics,
          },
          keepalive,
        );
        setSyncState('online');
      } catch (error) {
        markDegraded(error);
      }
    },
    [markDegraded, runtime, sessionId],
  );

  const restart = useCallback(() => {
    if (sessionId && runtime.isSessionStarted && !runtime.ending && !finalizedRef.current) {
      void finalizeSession('abandoned', null, true);
    }

    runtime.restart();
    setSessionId(null);
    setSyncState('idle');
    setLastError(null);
    resetTrackingRefs();
  }, [finalizeSession, resetTrackingRefs, runtime, sessionId]);

  useEffect(() => {
    if (!sessionId || !runtime.isSessionStarted) {
      return;
    }

    if (runtime.lookBacks <= previousLookBacksRef.current) {
      return;
    }

    previousLookBacksRef.current = runtime.lookBacks;
    void trackRemoteTelemetryEvent({
      sessionId,
      sceneId: 'corredor_v1',
      name: 'look_back_used',
      payload: {
        lookBacks: runtime.lookBacks,
        progress: runtime.progress,
        pressure: runtime.pressure,
        pressurePeak: runtime.pressurePeak,
      },
    }).catch(markDegraded);
  }, [markDegraded, runtime.isSessionStarted, runtime.lookBacks, runtime.pressure, runtime.pressurePeak, runtime.progress, sessionId]);

  useEffect(() => {
    if (!sessionId || !runtime.isSessionStarted) {
      return;
    }

    if (runtime.interactions <= previousInteractionsRef.current) {
      return;
    }

    previousInteractionsRef.current = runtime.interactions;
    void trackRemoteTelemetryEvent({
      sessionId,
      sceneId: 'corredor_v1',
      name: 'interaction_triggered',
      payload: {
        interactions: runtime.interactions,
        progress: runtime.progress,
        pressure: runtime.pressure,
        pressurePeak: runtime.pressurePeak,
      },
    }).catch(markDegraded);
  }, [markDegraded, runtime.interactions, runtime.isSessionStarted, runtime.pressure, runtime.pressurePeak, runtime.progress, sessionId]);

  useEffect(() => {
    if (!sessionId || !runtime.isSessionStarted || !runtime.activeEventId) {
      return;
    }

    if (!TRACKABLE_EVENT_IDS.has(runtime.activeEventId)) {
      return;
    }

    const eventKey = `${runtime.activeEventId}:${runtime.eventsSeen}:${runtime.progress}`;
    if (previousEventKeyRef.current === eventKey) {
      return;
    }

    previousEventKeyRef.current = eventKey;
    void trackRemoteTelemetryEvent({
      sessionId,
      sceneId: 'corredor_v1',
      name: 'event_seen',
      payload: {
        eventId: runtime.activeEventId,
        label: runtime.currentEventLabel,
        progress: runtime.progress,
        pressure: runtime.pressure,
        pressurePeak: runtime.pressurePeak,
      },
    }).catch(markDegraded);
  }, [markDegraded, runtime.activeEventId, runtime.currentEventLabel, runtime.eventsSeen, runtime.isSessionStarted, runtime.pressure, runtime.pressurePeak, runtime.progress, sessionId]);

  useEffect(() => {
    if (!sessionId || !runtime.isSessionStarted || threatPeakTrackedRef.current) {
      return;
    }

    if (runtime.pressurePeak < 0.67) {
      return;
    }

    threatPeakTrackedRef.current = true;
    void trackRemoteTelemetryEvent({
      sessionId,
      sceneId: 'corredor_v1',
      name: 'threat_peak_reached',
      payload: {
        stage: runtime.stage,
        pressurePeak: runtime.pressurePeak,
        progress: runtime.progress,
      },
    }).catch(markDegraded);
  }, [markDegraded, runtime.isSessionStarted, runtime.pressurePeak, runtime.progress, runtime.stage, sessionId]);

  useEffect(() => {
    if (!sessionId || !runtime.ending) {
      return;
    }

    if (previousEndingRef.current === runtime.ending) {
      return;
    }

    previousEndingRef.current = runtime.ending;
    void finalizeSession('completed', runtime.ending);
  }, [finalizeSession, runtime.ending, sessionId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!sessionId || !runtime.isSessionStarted || runtime.ending || finalizedRef.current) {
        return;
      }

      void finalizeSession('abandoned', null, true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [finalizeSession, runtime.ending, runtime.isSessionStarted, sessionId]);

  return {
    sessionId,
    syncState,
    syncLabel,
    lastError,
    beginSession,
    advance: runtime.advance,
    lookBack: runtime.lookBack,
    interact: runtime.interact,
    holdPosition: runtime.holdPosition,
    restart,
  };
}
