# MVP elegido: escena del pasillo

## 1. Decisión de producto

El **MVP jugable** de `AMTEC_microterror` será una única experiencia centrada en la **escena del pasillo**.

Esta escena se elige porque concentra muy bien la promesa del producto:

- tensión inmediata
- lectura visual simple en móvil
- coste de producción controlado
- alto rendimiento en web
- mucho margen para audio procedural
- fácil variación mediante datos

No se construirá un juego completo con múltiples mapas en esta fase. Se construirá un **slice vertical** extremadamente claro que valide:

1. creación mínima
2. playtest
3. publicación por enlace
4. experiencia sonora coherente
5. retención suficiente para justificar expansión

## 2. Fantasía jugable del MVP

El jugador avanza por un pasillo aparentemente normal, pero el espacio empieza a deformarse de forma sutil. Algo lo observa. La amenaza no se muestra del todo al principio; se manifiesta por luz, sonido, distancia y pequeñas alteraciones del entorno.

El objetivo del MVP no es “ganar” en un sentido arcade, sino **sobrevivir a la tensión**, interpretar señales y alcanzar uno de varios finales breves.

## 3. Principio de diseño

La escena debe funcionar con estos criterios:

- una sola localización principal
- interacciones mínimas y claras
- pocos elementos visuales, muy bien sincronizados
- audio como sistema central de tensión
- rejugabilidad por eventos variables, no por complejidad espacial

## 4. Estructura de sesión del MVP

Duración objetivo por partida: **3 a 5 minutos**.

### Fase A — Inicio
- el jugador entra al pasillo
- se presenta la atmósfera base
- tutorial mínimo: avanzar, mirar atrás, interactuar

### Fase B — Incomodidad
- primeras anomalías ligeras
- cambios de luz
- ruidos lejanos
- aparición de señales ambiguas

### Fase C — Presencia
- la amenaza ya se siente de forma sistemática
- el jugador detecta patrones
- aumentan los falsos positivos y la presión sonora

### Fase D — Clímax
- se activa una secuencia de resolución
- puerta final, apagón, aparición o colapso espacial

### Fase E — Final
- final breve
- pantalla de resultado
- CTA: volver a jugar o compartir

## 5. Mecánicas del MVP

### Mecánicas obligatorias
- **avanzar**
- **detenerse**
- **mirar atrás**
- **interactuar con punto de interés**

### Mecánicas opcionales para versión 0.2
- correr corto con coste de ruido
- esconderse en hueco o puerta lateral
- cerrar ojos / contener respiración

## 6. Loop principal

```text
entrar al pasillo
→ percibir señales
→ decidir avanzar o frenar
→ gestionar la incertidumbre
→ activar evento
→ acercarse al final
→ sobrevivir o caer en un final malo
```

## 7. Amenaza principal del MVP

### Nombre de trabajo
`presencia_detras`

### Idea
La amenaza se expresa sobre todo por:
- cercanía sonora
- distorsión visual
- luz que parpadea
- sensación de que mirar atrás empeora o revela algo

### Regla base
La amenaza tiene una variable de **presión** que crece según:
- tiempo en escena
- velocidad de avance
- número de eventos activados
- errores del jugador

## 8. Interacciones clave del pasillo

### Elementos del escenario
- puerta al fondo
- luces del techo
- cuadro torcido o mancha en pared
- teléfono / interfono / radio mural
- sombra al final del pasillo
- una puerta lateral cerrada

### Eventos posibles
- parpadeo brusco de luz
- golpe detrás de pared
- llamada de teléfono imposible
- sombra que desaparece al mirar
- puerta del fondo cambia de distancia
- ruido de respiración sintetizada
- interferencia de radio
- apagón de menos de un segundo

## 9. Reactividad del escenario

El pasillo debe parecer más vivo con muy pocos sistemas:

- intensidad lumínica variable
- pequeñas deformaciones de perspectiva
- variación de niebla o grano
- texturas que cambian muy sutilmente
- puerta final que parece alejarse o acercarse

## 10. Dirección visual para React

### Enfoque
No buscar fotorrealismo. Buscar una estética:
- low-poly contenida
- realismo sucio ligero
- VHS / CCTV / found-footage digital
- tonos apagados
- contraste en momentos de evento

### Motivo técnico
Esto favorece:
- rendimiento web
- rapidez de producción
- identidad visual
- compatibilidad móvil

## 11. Implementación recomendada en React

### Stack visual
- `react`
- `vite`
- `typescript`
- `@react-three/fiber`
- `@react-three/drei`
- `zustand`

### Componentes principales
- `CorridorScene`
- `CorridorLights`
- `ThreatController`
- `EventDirector`
- `InteractionPrompt`
- `EndingResolver`
- `AudioDirector`
- `HUDMinimal`

### Stores recomendados
- `useGameStateStore`
- `useThreatStore`
- `useAudioStore`
- `useSessionStore`

## 12. Audio procedural del pasillo

El audio es el sistema que más debe empujar la sensación de amenaza.

### Capas mínimas
- drone base
- zumbido eléctrico
- ruido de cinta
- subgrave de presencia
- glitches cortos
- stinger de evento
- respiración sintetizada muy sutil

### Parámetros dinámicos
- tensión
- cercanía de amenaza
- cantidad de distorsión
- frecuencia de glitches
- filtro paso bajo
- reverb
- densidad de ruido

### Regla sonora principal
Cuanto mayor sea la presión de la amenaza, más se degradan:
- estabilidad del ambiente
- claridad del espacio
- confianza perceptiva del jugador

## 13. Especificación jugable mínima

### Condiciones de avance
- el jugador avanza por segmentos del pasillo
- cada segmento puede disparar un evento
- la amenaza aumenta por tramo y por tiempo

### Condiciones de final
- **final bueno:** llega a la puerta y escapa
- **final ambiguo:** llega, abre, y el pasillo se repite
- **final malo:** la presencia lo alcanza o lo encierra

## 14. Telemetría mínima del MVP

Se deben registrar estos eventos:

- `session_started`
- `tutorial_completed`
- `look_back_used`
- `interaction_triggered`
- `event_seen`
- `threat_peak_reached`
- `ending_reached`
- `session_completed`
- `session_abandoned`
- `shared_link_opened`

## 15. Qué valida esta escena

Si la escena del pasillo funciona, validamos:

- que React web puede sostener una microexperiencia de terror
- que el audio sintético aporta valor real
- que la publicación por enlace tiene sentido
- que una estructura data-driven puede producir variaciones suficientes
- que el producto puede crecer a otras escenas sin rehacer el runtime

## 16. Qué queda fuera del MVP

No entra en esta fase:

- múltiples mapas completos
- multijugador
- chat social complejo
- IA generativa dentro de la partida
- inventario profundo
- combate
- narrativa ramificada extensa

## 17. Contrato de contenido recomendado

La escena debe describirse por datos, no por lógica dura esparcida por el código.

Campos mínimos:
- `sceneId`
- `templateType`
- `corridorLength`
- `lightPattern`
- `threatType`
- `threatPressureCurve`
- `eventPool`
- `endingSet`
- `audioPreset`
- `visualFilters`

## 18. Tareas del equipo IA para esta escena

### Product Owner Agent
- convertir esta escena en backlog priorizado

### Architect Agent
- fijar contrato JSON y estados del runtime

### Frontend Agent
- montar escena del pasillo y flujo de interacción

### Audio Agent
- crear preset sonoro `corridor_v1`

### Gameplay Agent
- diseñar eventos, curva de presión y finales

### Backend/Data Agent
- persistir proyectos, sesiones y telemetría

### QA Agent
- cubrir editor, partida y publicación

## 19. Criterio de aceptación del MVP

El MVP del pasillo estará aceptado cuando una persona pueda:

1. abrir la experiencia en móvil
2. jugar una partida completa de 3 a 5 minutos
3. notar al menos 3 eventos distintos
4. escuchar audio reactivo claro
5. alcanzar uno de 3 finales
6. compartir el enlace
7. quedar registrado todo en métricas básicas

## 20. Expansión natural posterior

Si esta escena valida el loop, las siguientes escenas candidatas deben derivar del mismo runtime:
- habitación
- escalera
- ascensor
- parking
- aula vacía

La escena del pasillo debe diseñarse desde el inicio como **plantilla fundacional** del sistema.
