const API_BASE_URL = import.meta.env.VITE_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

interface SessionStartPayload {
  sessionId: string;
  sceneId: string;
  templateType: string;
  metadata: Record<string, unknown>;
}

interface TelemetryPayload {
  sessionId: string;
  sceneId: string;
  name:
    | 'session_started'
    | 'tutorial_completed'
    | 'look_back_used'
    | 'interaction_triggered'
    | 'event_seen'
    | 'threat_peak_reached'
    | 'ending_reached'
    | 'session_completed'
    | 'session_abandoned'
    | 'shared_link_opened';
  payload: Record<string, unknown>;
}

interface SessionCompletePayload {
  status: 'completed' | 'abandoned';
  ending: string | null;
  progress: number;
  eventsSeen: number;
  lookBacks: number;
  interactions: number;
  pressurePeak: number;
}

async function postJson<TResponse>(path: string, payload: unknown, keepalive = false): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    keepalive,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TResponse;
}

export function createClientSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}`;
}

export function startRemoteSession(payload: SessionStartPayload) {
  return postJson('/sessions/start', payload);
}

export function trackRemoteTelemetryEvent(payload: TelemetryPayload, keepalive = false) {
  return postJson('/telemetry/events', payload, keepalive);
}

export function completeRemoteSession(sessionId: string, payload: SessionCompletePayload, keepalive = false) {
  return postJson(`/sessions/${sessionId}/complete`, payload, keepalive);
}
