# AMTEC_microterror

Repositorio base para construir una plataforma de microterror jugable y compartible con:

- frontend en React
- runtime interactivo con React Three Fiber
- audio procedural con sintetizadores Web Audio / Tone.js
- backend y orquestación de agentes IA en Python sobre Render
- base de datos PostgreSQL en Render

## Objetivo

Validar el loop:

crear → publicar → jugar → reaccionar → remixar

sin sobredesarrollar el stack antes de confirmar publicación, partidas y repetición.

## Estructura objetivo

- `/apps/web` → aplicación React mobile-first
- `/apps/api` → API y auth
- `/services/agent-orchestrator` → equipo IA y automatizaciones de desarrollo
- `/packages/contracts` → esquemas compartidos
- `/packages/content` → plantillas, eventos, amenazas y finales en formato data-driven
- `/packages/audio-engine` → presets y utilidades de sonido sintético
- `/docs` → arquitectura, roadmap, prompts y ADRs

## Prioridad operativa

1. publicar una experiencia funcional
2. abrirla por enlace en móvil
3. registrar métricas básicas
4. automatizar partes del desarrollo sin meter la IA en el camino crítico del runtime

## Documento inicial

- `/docs/arquitectura-react-render-agentes.md`
