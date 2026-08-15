# Auditoría DSEBI F4 — Voz de los Libros v0.10.28

## Alcance y base auditada

Base intervenida: `voz-de-los-libros-v0.10.28`. La auditoría se hizo sobre la app estática completa: `index.html`, `css/estilos.css`, `js/app.js`, `js/audio.js`, `js/biblioteca.js`, `js/prompt.js`, `sw.js`, `manifest.webmanifest`, datos demo y documentación. El contexto de producto venía con campos sin diligenciar (`Propósito`, `A quién va dirigida`, `Identidad`, `Qué no debe transmitir`), por lo que el dictamen usa la identidad ya presente en la app: lectura acompañada, escuchable, organizable, clara, sobria y cuidadosa.

---

## A1 — Evaluador

| Dimensión | Estado | Hallazgo principal |
|---|---|---|
| 1. Funcionalidad real | ACEPTABLE | La app crea sesiones, biblioteca, playlists rápidas, playlists personalizadas, TTS y audio externo. Persistían riesgos en selector multiusuario, mini-barra demasiado persistente y prompt de situación sesgado por autores del perfil. |
| 2. Coherencia con propósito | ÓPTIMO | La evolución hacia lectura acompañada, escuchable, organizable y compartible es coherente. |
| 3. Fidelidad identitaria | ACEPTABLE | La identidad cálida/verde/liviana está clara, pero algunos módulos nuevos podían sentirse técnicos o invasivos. |
| 4. Claridad de UX | ACEPTABLE | El hub y el drawer limpian la interfaz. El modal de audio mejoró, aunque requería cierres más naturales y mayor control de mini-barra. |
| 5. Consistencia visual | ACEPTABLE | Hay buena continuidad visual. Faltaba reducir solapamientos potenciales y reforzar foco/estados. |
| 6. Accesibilidad básica | ACEPTABLE | Hay aria-labels y cierre con Esc. Faltaban cierre por fondo de modal y refuerzo de foco visible en elementos nuevos. |
| 7. Robustez técnica | ACEPTABLE | JS sin errores sintácticos. Se detectó riesgo de JSON de prompt inválido si nombres o campos contenían comillas. |
| 8. Calidad formativa | ÓPTIMO | Los modos/capas y el prompt refuerzan paráfrasis, cuidado, no diagnóstico y derechos de autor. |
| 9. Traducibilidad sin autor | INSUFICIENTE | El prompt de situación seguía mostrando autores favoritos del perfil; aunque decía no usarlos, podía sesgar al modelo. |
| 10. Pertinencia contextual | ACEPTABLE | Buena estructura de destinatario/acompañante. Requería regla más fuerte para pacientes y casos clínicos. |

---

## A2 — Cuestionador

A1 no vio con suficiente fuerza estos puntos:

1. El selector de perfiles no cumplía plenamente la regla posterior al splash: si había varios perfiles y un usuario actual ya estaba en localStorage, la app podía entrar directo al inicio sin preguntar “¿Quién está aquí hoy?”. Esto es crítico en dispositivos compartidos.
2. El prompt podía romper su propio JSON de ejemplo cuando nombres o campos contenían comillas. Es un error silencioso de robustez: la app no falla, pero la IA puede devolver una estructura mal copiada.
3. La mini-barra global no solo debía esconderse ante modales, sino aparecer solo cuando hay una escucha real o una pausa retomable. Si aparece solo porque existe una sesión actual, parece ruido de navegación.
4. En “Lectura para una situación”, mostrar autores favoritos aunque se diga “no obligatorios” sigue siendo una inducción de sesgo. Para casos de pacientes o destinatarios concretos, conviene omitirlos por defecto.

---

## A3 — Integrador y decisor

Dictamen: la app está en estado funcional y coherente, pero v0.10.28 requería una pasada F4 para cerrar riesgos de confianza: identidad de perfiles, antisesgo en situaciones, mini-barra, cierres de modal, portapapeles y robustez del prompt. Se implementaron las mejoras críticas y altas directamente en v0.10.28.

### Mejoras priorizadas

#### CRÍTICO

1. Forzar selector de perfil cuando existan varios perfiles y no haya confirmación de perfil en la sesión actual del navegador.
2. Evitar sesgo de autores favoritos en lecturas para situación: omitirlos del prompt salvo fuentes explícitas del caso.
3. Hacer seguro el JSON de ejemplo del prompt ante nombres con comillas u otros caracteres.
4. Evitar que la mini-barra global aparezca encima de modales/drawer o sin escucha real.

#### ALTO

1. Cierre de modales tocando el fondo, además de Esc y botón cerrar.
2. Fallback de copiado de guion: si el portapapeles falla, abrir vista de guion para copia manual.
3. Eliminar etiquetas también del cierre de audio limpio, incluyendo “Recuerda:”.
4. Reforzar regla de paciente/caso clínico: no simular psicoterapia, diagnóstico o intervención cerrada.
5. Mejorar foco visible y evitar que la mini-barra tape contenido.

#### MEDIO

1. Profundizar selección de tarjetas individuales dentro de playlists, no solo sesiones.
2. Añadir orden configurable para playlists guardadas.
3. Añadir auditoría visual automatizada con navegador real cuando el entorno lo permita.
4. Crear guía de estilo editable para adaptar la app a otras identidades sin tocar código.

---

## Mejoras implementadas en v0.10.28

- Selector multiusuario reforzado con `sessionStorage`: si hay más de un perfil, la app pregunta “¿Quién está aquí hoy?” hasta que se confirme un perfil en esa sesión del navegador.
- Mini-barra global más precisa: aparece fuera de sesión solo si hay reproducción activa o pausa retomable, y nunca sobre modales o drawer.
- Cierre por fondo para modales, además de Esc y botón de cierre.
- Prompt de situación sin arrastre de autores del perfil. Los autores favoritos se omiten por defecto para evitar sesgo.
- Regla antisesgo reforzada: si no hay fuentes explícitas, se trabaja desde situación, emoción, objetivo y tono.
- Regla específica para pacientes: acompañamiento psicoeducativo general, sin diagnóstico, pronóstico ni psicoterapia simulada.
- JSON de ejemplo del prompt protegido con `JSON.stringify` para campos de usuario y destinatario.
- Copiado de guion con fallback manual si falla `navigator.clipboard`.
- Guion limpio elimina etiquetas también del cierre de audio.
- Foco visible reforzado en drawer, conversores, playlists y tarjetas.
- Padding inferior cuando aparece la mini-barra para no tapar contenido.
- Manual actualizado en “Lectura para una situación”.
- Versión/cache/backup actualizados a `v0.10.28`.

---

## Validaciones realizadas

- `node --check` sobre `js/app.js`, `js/audio.js`, `js/biblioteca.js`, `js/prompt.js`, `js/pwa.js` y `sw.js`.
- Validación JSON de `manifest.webmanifest`, `data/ejemplo-respuesta.json` y `data/demos-biblioteca.json`.
- Revisión de IDs duplicados en `index.html`: sin duplicados.
- Revisión de referencias locales `href/src`: sin archivos faltantes.
- Prueba sintética del prompt con nombres que contienen comillas: el JSON de ejemplo se mantiene válido y no arrastra autores favoritos en situación.

## Limitación honesta

No se ejecutó una prueba visual interactiva con navegador real dentro de este entorno. La auditoría visual se hizo por inspección de HTML/CSS y por las capturas/fallos reportados. La siguiente iteración debería incluir Playwright/Chromium o prueba manual en Chrome/Edge móvil y PC.
