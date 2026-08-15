# Blueprint Técnico DSEBI v1
## Proyecto: Inglés para Dummies

**Versión objetivo:** MVP 1.0  
**Stack base:** HTML5 + CSS3 + JavaScript puro  
**Modo de operación:** offline-first compatible + listo para publicación online  
**Persistencia:** localStorage con clave `ingles_dummies_app_v1_0`

## 1. Propósito técnico
La versión 1.0 debe permitir que una persona entre, entienda qué hacer, complete una ruta breve de aprendizaje, vea progreso real y pueda salir y volver sin perder avance. El criterio de éxito es continuidad, claridad y sensación de logro.

## 2. Decisión de arquitectura
La arquitectura recomendada es una app simple con vistas internas, estado central y persistencia local. No usa frameworks ni backend. El contenido se puede leer desde `content/content.v1.json` cuando se publique en web y, para apertura directa desde carpeta local, la app incluye un respaldo embebido en `app.js`.

## 3. Estructura recomendada
```txt
/ingles-para-dummies/
│
├── index.html
├── app.css
├── app.js
├── content/
│   └── content.v1.json
├── assets/
│   ├── icons/
│   └── images/
├── docs/
│   ├── documento_rector_dsebi_v1.md
│   └── blueprint_tecnico_dsebi_v1.md
└── manifest.json
```

## 4. Módulos funcionales
- **Estado:** carga, guarda, migra y reinicia.
- **Contenido:** expone rutas, lecciones y ejercicios.
- **Render:** pinta vistas internas.
- **Navegación:** controla transiciones.
- **Progreso:** calcula porcentaje y siguiente paso.
- **Feedback UX:** toasts, confirmaciones y microcopy.

## 5. Modelo del estado
El estado central contiene:
- `profile`
- `progress`
- `preferences`
- `meta`

Incluye control de tema, reducción de movimiento y último punto visitado.

## 6. Funciones del núcleo
Las funciones mínimas son:
- `loadState()`
- `saveState()`
- `migrateState()`
- `resetState()`
- `updateProgress()`
- `setView()`
- `renderApp()`
- getters de rutas, lecciones y ejercicios

## 7. Contrato de contenido
El contenido debe vivir en un JSON con tres entidades:
- `routes`
- `lessons`
- `exercises`

Cada una con `id` único y relaciones explícitas por referencia.

## 8. Vistas oficiales
- WelcomeView
- OnboardingView
- DashboardView
- RouteView
- LessonView
- ExerciseView
- CompletionView
- SettingsView

Cada pantalla debe tener una acción principal clara y un propósito dominante.

## 9. Regla del progreso
Cada lección vale una unidad:
- lección vista = 40%
- ejercicios completos = 60%

El porcentaje global resulta de la suma de unidades parciales y completas respecto del total de lecciones disponibles.

## 10. Reglas UX
- una intención principal por pantalla
- botones visibles en cualquier fondo
- textos legibles y breves
- retroalimentación inmediata
- navegación clara
- nada escolar, nada frío, nada sobrecargado

## 11. Responsive
La app es mobile-first, pero debe verse sólida en escritorio. Debe evitar grids complejos y priorizar tarjetas, botones amplios y navegación vertical.

## 12. Criterios de aceptación
El MVP se considera listo cuando:
1. se entiende sin ayuda externa,
2. permite completar una sesión breve,
3. guarda avance al recargar,
4. muestra progreso real,
5. se siente cálido, claro y no escolar.

## 13. Auditoría obligatoria
Antes de cualquier entrega debe pasar por tres revisiones:
- identidad
- funcionalidad
- experiencia
