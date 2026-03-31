# Arquitectura propuesta: React + sintetizadores + Render + agentes IA

## 1. Decisión principal

Se sustituye la idea original de `Unity + Supabase/Firebase` por una arquitectura pensada para validar más rápido el producto desde enlace compartible y móvil:

- **Frontend:** React + Vite + TypeScript
- **Runtime interactivo:** React Three Fiber + Drei
- **Estado cliente:** Zustand
- **UI:** Tailwind CSS + shadcn/ui
- **Audio:** Tone.js + Web Audio API
- **Backend:** FastAPI + Pydantic + SQLAlchemy
- **BD:** PostgreSQL gestionado en Render
- **Cache y colas ligeras:** Redis en Render si hiciera falta
- **Assets:** Render disk temporal + almacenamiento S3 compatible cuando el producto lo exija
- **Observabilidad:** PostHog o telemetría propia en PostgreSQL para MVP

## 2. Por qué este cambio encaja con el producto

Esta arquitectura prioriza:

- abrir una experiencia por enlace sin instalación dura
- móvil primero mediante PWA responsive
- editor guiado data-driven
- iteración rápida sobre plantillas y eventos
- telemetría desde el día uno
- audio generativo sin pipeline pesado de foley

## 3. Monorepo recomendado

```text
/apps/web
/apps/api
/services/agent-orchestrator
/packages/contracts
/packages/content
/packages/audio-engine
/docs
```

## 4. Responsabilidad por carpeta

### `/apps/web`
Aplicación React mobile-first.

Contendrá:
- onboarding
- selector de plantilla
- editor por capas
- playtest
- publicación
- perfil
- visor jugable por enlace
- panel básico de métricas

### `/apps/api`
Servicio FastAPI.

Contendrá:
- auth JWT
- CRUD de usuarios y proyectos
- publicación y slugs
- sesiones de juego
- métricas
- planes free/premium
- moderación básica

### `/services/agent-orchestrator`
Sistema de agentes para automatizar desarrollo y operación.

Contendrá:
- enrutado de tareas
- ejecución de prompts por rol
- validadores
- generación de issues y PRDs derivados
- chequeos de coherencia entre producto, código y datos

### `/packages/contracts`
Tipos y esquemas compartidos.

Ejemplos:
- `ProjectSchema`
- `PlaySessionSchema`
- `TemplateSchema`
- `ThreatSchema`
- `EventSchema`
- `EndingSchema`

### `/packages/content`
Contenido jugable completamente data-driven.

Ejemplos:
- plantillas MVP
- amenazas MVP
- eventos MVP
- presets visuales
- textos intro
- finales

### `/packages/audio-engine`
Núcleo sonoro procedural.

Contendrá:
- drones
- stingers
- glitches
- sub drops
- llamadas diegéticas
- interferencia de radio
- motor de mezcla por intensidad

## 5. Runtime jugable en React

### Motor recomendado
- `@react-three/fiber`
- `@react-three/drei`
- `three`

### Modelo técnico
El juego no debe ser un motor abierto, sino un runtime restringido que interpreta JSON de contenido.

Ejemplo de flujo:
1. el usuario elige plantilla
2. el editor modifica parámetros
3. se genera un `project payload`
4. el runtime carga ese payload
5. dispara eventos y finales según reglas simples

## 6. Audio con sintetizadores

### Librería
- `tone`

### Estrategia de audio
Sustituir gran parte del audio grabado por síntesis procedural para:
- reducir costes
- permitir variaciones
- adaptar intensidad en tiempo real
- generar identidad sonora propia

### Capas sonoras
- **Ambiente:** drones, ruido de cinta, zumbidos, room tone sintético
- **Eventos:** golpes, glitches, radio bursts, pulsos graves, respiraciones sintéticas
- **Amenaza:** motivo sonoro ligado a presencia, distancia e intensidad
- **Finales:** resolución sonora corta por estado

### Parámetros editables desde el editor
- tensión
- densidad
- distorsión
- modulación
- ruido
- wow/flutter
- filtro paso bajo
- filtro paso alto
- reverb
- probabilidad de stinger

## 7. Modelo de datos base en Render PostgreSQL

### Tablas mínimas
- `users`
- `profiles`
- `projects`
- `project_versions`
- `templates`
- `threats`
- `events_catalog`
- `project_events`
- `play_sessions`
- `generated_assets`
- `subscriptions`
- `feature_flags`
- `agent_runs`
- `agent_tasks`
- `agent_artifacts`

## 8. Servicios en Render

### Servicio 1
`web-app`
- React build estático o servido por Node según convenga

### Servicio 2
`api`
- FastAPI

### Servicio 3
`agent-orchestrator`
- FastAPI o worker Python

### Servicio 4
`postgres`
- Render PostgreSQL

### Servicio opcional 5
`redis`
- colas, rate limiting, jobs cortos

## 9. Equipo IA recomendado

La IA debe trabajar sobre desarrollo, QA, contenido y documentación. No debe gobernar el loop central del juego en MVP.

### Agente 1 — Product Owner
- convierte PRD en backlog
- prioriza epics
- protege foco MVP

### Agente 2 — Arquitecto Técnico
- decide contratos
- revisa límites entre frontend, backend y paquetes
- escribe ADRs

### Agente 3 — Frontend React
- implementa editor, runtime y UI
- propone refactors
- vigila rendimiento móvil

### Agente 4 — Backend / Datos
- diseña API
- migra esquema
- valida integridad de métricas y publicación

### Agente 5 — Audio Synth Designer
- define presets Tone.js
- crea mappings entre amenaza, tensión y sonido
- evita saturación sonora

### Agente 6 — Diseñador de Gameplay Data-Driven
- diseña plantillas, eventos y finales en JSON
- asegura rejugabilidad sin scripting libre

### Agente 7 — QA / Test Engineer
- genera tests E2E
- verifica editor, publicación y enlace jugable
- detecta regresiones

### Agente 8 — Telemetry Analyst
- define eventos
- vigila North Star Metric
- reporta fricción por cohorte

### Agente 9 — DevOps / Release
- define despliegues en Render
- controla variables de entorno, ramas y promociones

### Agente 10 — Repo Curator
- mantiene estructura, prompts, plantillas de issue y normas de commit

## 10. Reglas de orquestación para agentes

1. ningún agente modifica arquitectura sin ADR
2. ningún agente mete features sociales profundas antes de validar publicación y consumo
3. ningún agente añade IA generativa al runtime MVP
4. todo cambio que afecte datos actualiza contratos compartidos
5. todo cambio de gameplay actualiza fixtures y tests
6. todo agente deja artefacto verificable: issue, ADR, diff, test o dashboard

## 11. Roadmap técnico corto

### Fase 0
- inicializar repo
- definir contratos
- crear docs de arquitectura y agentes

### Fase 1
- levantar React app y FastAPI
- conectar PostgreSQL Render
- auth y modelo `Project`

### Fase 2
- implementar 3 plantillas MVP
- editor por capas
- runtime restringido

### Fase 3
- audio procedural
- publicación por enlace
- métricas base

### Fase 4
- teaser automático simple
- perfil de creador
- gating free/premium

### Fase 5
- remix
- retos ligeros
- ranking básico

## 12. Decisiones importantes

### Decisión A
**PWA antes que app nativa.**

Motivo: acelera validación, compartición y testing.

### Decisión B
**Contenido en JSON antes que libertad total.**

Motivo: reduce complejidad y encaja con el PRD.

### Decisión C
**Audio sintético antes que librería masiva de audio grabado.**

Motivo: coste, variabilidad y control procedural.

### Decisión D
**Agentes como copilotos del proceso, no como sustitutos del criterio de producto.**

Motivo: evitar ruido operativo y sobrediseño temprano.

## 13. Riesgos específicos de esta versión

### Riesgo
React web no iguala toda la potencia de un motor dedicado.

### Mitigación
Reducir alcance a escenas contenidas, cámara restringida y estética low-poly / VHS.

### Riesgo
Web Audio requiere interacción del usuario para arrancar en móvil.

### Mitigación
Activar audio tras gesto explícito en onboarding o inicio de partida.

### Riesgo
Exceso de agentes generando trabajo irrelevante.

### Mitigación
Un orquestador con gates duros por fase y métricas.

## 14. Criterio de éxito técnico del MVP

Se considera una base válida si un usuario puede:
- crear proyecto
- modificar atmósfera, amenaza y eventos
- jugarlo en móvil desde enlace
- escuchar audio procedural coherente
- publicar y revisar métricas básicas

## 15. Siguiente ampliación recomendada

Después de validar el loop básico:
- remix enlazado al original
- comparativa social ligera
- generación de teaser más rica
- cámara de reacción opcional
