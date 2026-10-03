# AUDITORÍA FUNCIONAL Y DE CONTENIDOS · MMPI-2 APP

## ÍNDICE
1. Visión general
2. Arquitectura técnica
3. Estructura de archivos
4. Flujo de usuario (pantalla por pantalla)
5. Motor de cálculo MMPI-2
6. Baremos disponibles
7. Claves de corrección (items por escala)
8. Criterios interpretativos
9. Gráficos del informe
10. Sección de Análisis con IA
11. Exportación de informes
12. Persistencia de datos
13. Problemas conocidos y limitaciones
14. Caso de validación (Sandra Rodas)
15. Recomendaciones de auditoría

---

## 1. VISIÓN GENERAL

**Nombre:** MMPI-2 · Aplicación clínica
**Tipo:** Aplicación web (HTML+CSS+JS vanilla, sin frameworks, sin build step)
**Destino:** Cloudflare Pages (drag-and-drop o GitHub)
**Tamaño:** ~724 KB (ZIP), 36 archivos
**Idioma:** Español
**Licencia:** Uso clínico y educativo

### Funcionalidades principales
- Aplicación del test MMPI-2 (567 ítems) en modo interactivo o carga de Excel
- Corrección automática con 2 baremos: España (TEA, N=500) y EE.UU. (Minnesota, N=2.600)
- Selector de baremo en tiempo real desde el informe (recalcula todos los T)
- 79 escalas interpretadas con criterios por bandas T (0 escalas sin texto)
- 4 gráficos de perfil de líneas con referencias T=50 y T=65
- Configuraciones clínicas detectadas automáticamente (V de conversión, grito de ayuda, etc.)
- Tabla exhaustiva de Análisis de Resultados al final del informe
- Comparación con MMPI-2 anterior (gráfico dual + tabla ΔT)
- Sección de Análisis con IA externa (copiar prompt + 7 IAs + pegar JSON estructurado)
- Exportación: HTML standalone, Word (.docx), Excel (.xlsx), JSON
- Hoja de respuestas descargable (PDF imprimible)
- Perfil de escalas descargable (PDF, dibujado en Canvas)
- Firma digital (canvas o carga de imagen)
- Menú hamburguesa con casos guardados + export/import JSON

---

## 2. ARQUITECTURA TÉCNICA

### Stack
- **Frontend:** HTML5 + CSS3 + JavaScript ES6 (vanilla, sin React/Vue/Angular)
- **Persistencia:** localStorage API (sin backend, sin base de datos)
- **Gráficos:** Chart.js 4.4.1 (cargado desde /vendor/)
- **Excel:** SheetJS 0.20.3 (cargado desde /vendor/)
- **Word:** docx.js 8.5.0 (cargado desde /vendor/)
- **Firma:** HTML5 Canvas API

### Sin dependencias de build
- No requiere npm, webpack, vite ni ningún bundler
- Se despliega arrastrando la carpeta `app/` a Cloudflare Pages
- Funciona offline una vez cargados los datos

### Sin backend
- Todos los cálculos se hacen en el navegador
- Los datos se guardan en localStorage
- No hay servidor, API ni base de datos
- La "IA externa" funciona copiando un prompt al portapapeles y pegando el resultado JSON

---

## 3. ESTRUCTURA DE ARCHIVOS

```
app/
├── index.html                          # Punto de entrada, carga todos los scripts
├── _redirects                          # Cloudflare SPA routing
├── .nojekyll                           # Desactiva Jekyll en GitHub Pages
├── README.md                           # Documentación
│
├── css/
│   └── styles.css                      # Todos los estilos (CSS vanilla)
│
├── js/
│   ├── app.js                          # Router principal + menú hamburguesa + toast + modal
│   │
│   ├── lib/
│   │   ├── utils.js                    # bindEvent() — binding seguro de event listeners
│   │   ├── storage.js                  # Storage: evaluador, casos, caso actual, export/import
│   │   ├── mmpi2.js                    # Motor de cálculo: PD, K-correction, T lookup, bandas, interpretaciones
│   │   ├── export.js                   # Exportación: HTML, Word, Excel, JSON (informe base + informe IA)
│   │   ├── signature.js                # SignaturePad: dibujo de firma en canvas
│   │   └── ai-prompt.js                # Constructor del prompt para IA externa (~27 KB)
│   │
│   └── screens/
│       ├── splash.js                   # Pantalla splash (2s) → detecta primera vez
│       ├── setup.js                    # Configuración del evaluador (con firma canvas o imagen)
│       ├── dashboard.js                # Panel principal + casos recientes
│       ├── case.js                      # Datos del paciente + antecedentes + motivo + MMPI previo
│       ├── capture.js                   # Captura: modo cargar Excel o modo aplicar test
│       └── report.js                    # Informe completo (82 KB: tablas, gráficos, IA, export)
│
├── data/
│   ├── items.json                      # 567 ítems del MMPI-2 (num + text)
│   ├── baremos.json                    # Baremo España (78 escalas × 2 sexos)
│   ├── baremo_us.json                  # Baremo EE.UU. (32 escalas × 2 sexos + Fp/S/Ho lineal)
│   ├── criterios.json                  # 79 escalas × 5 bandas T (407 bandas)
│   └── scale_items.json                # Mapeo escala → items (con V/F scoring weights)
│
├── assets/
│   ├── favicon.svg
│   └── MMPI2_Plantilla_Paciente.xlsx   # Plantilla Excel para pacientes
│
└── vendor/
    ├── chart.umd.min.js                # Chart.js 4.4.1
    ├── xlsx.full.min.js                # SheetJS 0.20.3
    └── docx.umd.min.js                 # docx.js 8.5.0
```

---

## 4. FLUJO DE USUARIO (pantalla por pantalla)

### Pantalla 1: Splash (2 segundos)
- Logo "M2" con animación pulse
- Título: "MMPI-2 · Aplicación clínica"
- Subtítulo con descripción breve
- Loader spinner
- Al terminar: si `Storage.isSetupDone()` → Dashboard; si no → Setup

### Pantalla 2: Setup del evaluador (solo primera vez)
- Nombre completo (requerido)
- Correo electrónico (requerido)
- Número de tarjeta profesional
- Registro profesional
- Número de teléfono
- Dirección (consultorio)
- Firma digital: dos modos
  - **Dibujar**: canvas con SignaturePad (mouse + táctil)
  - **Cargar imagen**: file picker (PNG/JPG), vista previa, quitar imagen
- Botón "Guardar y continuar"
- Se puede editar después desde menú hamburguesa → "Configuración evaluador"

### Pantalla 3: Dashboard
- Topbar: título + botón "+ Nuevo caso" + menú hamburguesa
- Card de bienvenida: avatar inicial, nombre, licencia/correo, botón "Editar perfil"
- Card "Casos recientes": últimos 5 casos guardados (click para abrir)
- Card "Acciones rápidas": Nuevo caso, Ver todos, Exportar JSON

### Menú hamburguesa (siempre disponible, top right)
- Sección "Evaluador": nombre, licencia, botón "Configuración evaluador"
- Sección "Mis casos (N)": lista de todos los casos guardados
- Sección "Datos":
  - Exportar caso actual (JSON)
  - Exportar todo (JSON)
  - Importar JSON
- Sección "Acerca de"

### Pantalla 4: Datos del paciente
- Nombre y apellidos (requerido)
- DNI / Pasaporte / CC
- Fecha de nacimiento (date picker)
- Edad (auto-calculada)
- Sexo: Mujer / Hombre (requerido — define el baremo)
- **Baremo (país)**: EE.UU. (Minnesota N=2.600) — recomendado / España (TEA N=500)
- Contexto: Clínico / Laboral / Forense / Otro
- Fecha de aplicación
- **Historia del caso** (textarea 5 filas): antecedentes biográficos, situación actual
- **Contexto pericial (opcional)** (textarea 3 filas): input del abogado, objeto del peritaje
- **MMPI-2 anterior (opcional)** (textarea 3 filas): pegar T-scores previos (formato: Hs=78, D=55, ...)
- Botón "Descargar Excel para respuestas" → genera plantilla pre-llenada con datos del paciente
- Botón "Continuar a captura"

### Pantalla 5: Captura de respuestas
Dos modos seleccionables:

**Modo 1: Aplicar test (interactivo)**
- 567 ítems uno a uno
- Botones V (Verdadero) y F (Falso)
- Auto-advance al responder
- Slider de navegación
- Botones Anterior/Siguiente
- Progress bar con conteo
- Botón "Reiniciar respuestas"
- Botón "Finalizar y procesar"

**Modo 2: Cargar Excel**
- File picker para .xlsx
- Parser con detección automática de columnas (itemCol y respCol)
- Vista previa de respuestas cargadas
- Botón "Procesar y generar informe"

### Pantalla 6: Informe
- **Selector de baremo** en la parte superior: dropdown ES/US que recalcula en vivo
- Botones de exportación: HTML, Word, Excel, JSON, Imprimir/PDF
- Botones de descarga: Hoja de Respuestas (PDF), Perfil de Escalas (PDF)
- **Datos del paciente** (card): nombre, documento, DOB, edad, sexo, baremo, contexto, antecedentes, motivo
- **Datos del evaluador** (card): nombre, registro, correo, teléfono, dirección, firma
- **Síntesis interpretativa** automática (narrativa generada por el motor)
- **Tablas por grupos**:
  - Escalas de Validez: L, F, K, VRIN, TRIN, Fb, Fp, S
  - Escalas Clínicas Básicas: Hs, D, Hy, Pd, Mf, Pa, Pt, Sc, Ma, Si
  - Escalas de Contenido: ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN, ASP, TPA, LSE, SOD, FAM, WRK, TRT
  - Escalas Suplementarias: A, R, Es, MAC-R, AAS, APS, MDS, Ho, O-H, Do, Re, Mt, GM, GF, PK
  - Subescalas Harris-Lingoes: D1-D5, Hy1-Hy5, Pd1-Pd5, Pa1-Pa3, Sc1-Sc6, Ma1-Ma4, Si1-Si3
- Cada tabla tiene: Código, Escala, PD, PD+K, T, Banda, Interpretación
- **Síntesis por grupo** después de cada tabla
- **Configuraciones clínicas detectadas**: V de conversión, Grito de ayuda, 4-9, V psicótica, Defensivo cerrado
- **Índice F-K** con interpretación
- **Comparación con MMPI-2 anterior** (si existe): gráfico dual + tabla ΔT
- **Tabla de Análisis de Resultados** (exhaustiva, color-coded)
- **Recomendaciones clínicas** (generadas automáticamente según el perfil)
- **4 gráficos de perfil** (Chart.js, líneas con puntos):
  1. Perfil Básico (Validez + Clínicas)
  2. Perfil de Contenido
  3. Perfil Suplementario
  4. Subescalas Harris-Lingoes
- **Sección "Análisis con IA"** (ver sección 10)

---

## 5. MOTOR DE CÁLCULO MMPI-2 (mmpi2.js)

### Claves de corrección
- K-correction factors: Hs×0.5, Pd×0.4, Pt×1.0, Sc×1.0, Ma×0.2
- PDK_SCALES: Set con las escalas que usan K-correction
- PD directa: suma de items respondidos en la dirección clave

### Lookup T por sexo y país
- `lookupT(scaleCode, pd, sex)`:
  1. Verifica si la escala está en ONLINE_SCALES (ES: Fp, S, Ho; US: ninguna)
  2. Busca en `window.__BAREMOS__` (que apunta a ES o US según país seleccionado)
  3. Estrategia: encontrar el PD más alto ≤ pd_target y devolver su T
  4. Si no encuentra, devuelve null

### Bandas T
- Muy Alto (≥70): rojo #C00000
- Alto (60-69): naranja #ED7D31
- Promedio-Superior (56-59): amarillo #FFC000
- Modal (40-55): verde #548235
- Bajo (≤39): azul #2F5496

### Tratamiento de escalas online
- `ONLINE_SCALES_ES`: Set(['Fp', 'S', 'Ho']) — requieren TEAcorrige en ES
- `ONLINE_SCALES_US`: Set() — vacío, ninguna escala está bloqueada en US
- `getOnlineMessage(scaleCode)`:
  - US: "PD calculada. Conversión a T no disponible en el baremo extraído; utilice el sistema de corrección oficial de Minnesota (Pearson Assessments)."
  - ES: "Escala española vigente (4.ª ed. 2019). Conversión PD→T requiere TEAcorrige. No se ha publicado matriz completa en extracto abierto."

### Síntesis narrativa automática
- `buildNarrative(results, name, age, sex, country)`:
  - Cuenta escalas en cada banda (Muy Alto, Alto, Bajo, Online)
  - Genera texto en español con el baremo utilizado
  - Menciona configuraciones clínicas detectadas

---

## 6. BAREMOS DISPONIBLES

### Baremo España (baremos.json)
- Fuente: Manual MMPI-2 adaptación española, TEA Ediciones
- Muestra: N=500 por grupo (varones + mujeres)
- Tablas: E.1-E.6 (Apéndice E, páginas 94-99 del manual)
- Harris-Lingoes: A.7-A.10 (Apéndice A, páginas 86-93)
- Tablas verificadas: O-H, MDS, APS, AAS (Informe técnico)
- Total: 78 escalas con datos PD→T

### Baremo Estados Unidos (baremo_us.json)
- Fuente: Extraído de archivos MMPI_2_MUJERES vacío.xlsx y MMPI_2_VARONES vacío.xls
- Muestra: N=2.600 (censo estadounidense 1980, University of Minnesota Press)
- Verificación: 1.366/1.366 valores idénticos a los archivos originales (100% coincidencia)
- Total: 29 escalas con datos PD→T (basicas + contenido + suplementarias)
- Fp, S, Ho: generados con conversión lineal T (media y SD del manual oficial)
  - Fp: M(M)=1.46, SD=1.84; M(H)=2.21, SD=2.32
  - S: M(M)=8.30, SD=4.56; M(H)=7.19, SD=4.12
  - Ho: M(M)=13.97, SD=5.12; M(H)=13.18, SD=4.61
- TAS (argentino): tabla PD→T extraída del libro de Silin & Sanz (página 40)

### Selector de país
- `setCountry(country)`: cambia `window.__BAREMOS__` entre ES y US
- El selector en el informe recalcula TODOS los T en vivo
- Guarda el cambio en el caso permanentemente

---

## 7. CLAVES DE CORRECCIÓN (scale_items.json)

### Resumen de items por escala

| Escala | Items esperados | Items en app | Estado |
|--------|:---:|:---:|:---:|
| L | 15 | 15 | ✓ |
| F | 64 | 58 | ⚠ Faltan 6 (Claves_revision no resueltas) |
| K | 30 | 30 | ✓ |
| Hs | 33 | 32 | ⚠ Falta 1 |
| D | 60 | 55 | ⚠ Faltan 5 |
| Hy | 60 | 60 | ✓ |
| Pd | 50 | 50 | ✓ |
| Mf | 60 | 55 | ⚠ Faltan 5 |
| Pa | 40 | 37 | ⚠ Faltan 3 |
| Pt | 48 | 48 | ✓ |
| Sc | 78 | 78 | ✓ |
| Ma | 46 | 46 | ✓ |
| Si | 70 | 69 | ⚠ Falta 1 |
| ANX | 23 | 23 | ✓ |
| FRS | 25 | 23 | ⚠ Faltan 2 |
| OBS | 16 | 16 | ✓ |
| DEP | 33 | 33 | ✓ |
| HEA | 33 | 35 | ⚠ 2 extra (posible duplicado) |
| BIZ | 24 | 22 | ⚠ Faltan 2 |
| ANG | 17 | 15 | ⚠ Faltan 2 |
| CYN | 23 | 23 | ✓ |
| ASP | 22 | 22 | ✓ |
| TPA | 19 | 19 | ✓ |
| LSE | 24 | 23 | ⚠ Falta 1 |
| SOD | 24 | 24 | ✓ (agregado de Claves_revision) |
| FAM | 25 | 25 | ✓ |
| WRK | 33 | 32 | ⚠ Falta 1 |
| TRT | 26 | 26 | ✓ (agregado de Claves_revision) |
| Fp | 21 | 21 | ✓ (items oficiales Arbisi & Ben-Porath 1995) |
| S | 24 | 24 | ✓ (items oficiales Butcher & Han 1995) |
| Ho | 27 | 27 | ✓ (items oficiales Cook & Medley 1954) |

### Origen de las claves
- **Excel híbrido**: 27 escalas básicas y de contenido (extraídas de fórmulas IF)
- **Claves_revision**: 7 items adicionales para F, SOD, TRT, GF, Fb, S, Pd4
- **Fuentes oficiales**: Fp (Arbisi & Ben-Porath), S (Butcher & Han), Ho (Cook & Medley)

### Items faltantes conocidos
- **F**: 6 items no extraídos (fórmulas Claves_revision con valores 0,0 — dead items)
- **D**: 5 items no extraídos
- **Mf**: 5 items no extraídos
- **Pa**: 3 items no extraídos
- Varios escalas con 1-2 items faltantes

---

## 8. CRITERIOS INTERPRETATIVOS (criterios.json)

### Estructura
Cada escala tiene:
- `description`: texto descriptivo de qué mide la escala
- `bands`: array de 5 bandas, cada una con [t_min, t_max, label, interpretation]

### Bandas T estándar
1. Muy Alto (≥70 o ≥76 según escala)
2. Alto (66-75 o 60-69)
3. Promedio-Superior (56-65 o 56-59)
4. Modal (41-55 o 40-55)
5. Bajo (≤40 o ≤39)

### Escalas sex-specific
- L, F, K, Mf: tienen bandas separadas para H y M

### Total
- 79 escalas con criterios completos
- 407 bandas interpretativas en total
- Fuentes: apunte_mmpi_2.pdf, Butcher (2011), Graham (2006), Harris & Lingoes (1955), Ben-Porath & Tellegen

---

## 9. GRÁFICOS DEL INFORME

### Tipo: Líneas con puntos (NO barras)
- Chart.js type: 'line'
- Puntos azules (#1F3864) conectados por líneas
- 2 líneas de referencia horizontales:
  - T=50 (gris punteada): media
  - T=65 (rojo punteada): corte clínico
- Eje Y: 30-90, grid cada 10
- Eje X: códigos de escala, rotados 45°
- Altura: 300px por gráfico
- maintainAspectRatio: false

### 4 gráficos
1. **Perfil Básico** (Validez + Clínicas): L, F, K, Hs, D, Hy, Pd, Mf, Pa, Pt, Sc, Ma, Si
2. **Perfil de Contenido**: ANX, FRS, OBS, DEP, HEA, BIZ, ANG, CYN, ASP, TPA, LSE, SOD, FAM, WRK, TRT
3. **Perfil Suplementario**: A, R, Es, MAC-R, AAS, APS, MDS, Ho, O-H, Do, Re, Mt, GM, GF, PK
4. **Harris-Lingoes**: D1-D5, Hy1-Hy5, Pd1-Pd5, Pa1-Pa3, Sc1-Sc6, Ma1-Ma4, Si1-Si3

### Gráfico comparativo (si hay MMPI-2 anterior)
- Línea dual: T actual vs T anterior
- Tabla: Escala | T anterior | T actual | ΔT

---

## 10. SECCIÓN "ANÁLISIS CON IA"

### Flujo
1. Botón verde "Copiar Prompt" → copia ~27 KB al portapapeles
2. Toast: "Prompt copiado. Abre una IA externa, pega el prompt, genera el JSON y pégalo aquí abajo."
3. Botones de acceso rápido a 7 IAs (abren en pestaña nueva):
   - Z.AI, ChatGPT, Google Gemini, Claude, Microsoft Copilot, DeepSeek, Perplexity
4. Textarea para pegar el JSON devuelto
5. Botón "Generar informe contextualizado" → parsea y renderiza

### Prompt generado (ai-prompt.js)
El prompt incluye:
- Rol: psicólogo clínico y pericial experto en MMPI-2
- Datos completos del paciente (nombre, edad, sexo, contexto)
- Historia del caso (si se proporcionó)
- Contexto pericial (si se proporcionó)
- MMPI-2 anterior (si se proporcionó)
- Datos del evaluador
- TODAS las 79 escalas con PD, PD+K, T, banda, interpretación
- Síntesis narrativa automática
- Configuraciones clínicas detectadas
- Índice F-K
- Country-awareness: US no menciona TEAcorrige; ES sí
- 15 secciones obligatorias con tablas y gráficos
- 4 figuras obligatorias especificadas
- 15 reglas críticas (no mezclar baremos, no disclaimer IA, PD=0 válido, etc.)
- 10 verificaciones de coherencia antes de responder
- Esquema JSON estructurado con bloques (parrafo, tabla, grafico, lista, firma)

### Esquema JSON solicitado
```json
{
  "titulo": "INFORME DE VALORACIÓN PSICOLÓGICA · MMPI-2",
  "metadatos": {evaluado, documento, edad, sexo, fecha_aplicacion, ...},
  "secciones": [
    {
      "numero": 1,
      "titulo": "Motivo y objetivo de la evaluación",
      "bloques": [
        {"tipo": "parrafo", "contenido": "..."},
        {"tipo": "tabla", "titulo": "...", "columnas": [...], "filas": [...]},
        {"tipo": "grafico", "figura": 1, "grafico_tipo": "linea", ...},
        {"tipo": "lista", "items": [...]}
      ]
    }
  ],
  "referencias": [...],
  "firma": {nombre, profesion, registro, ...}
}
```

### Renderizado del JSON
- `parrafo` → `<p>` con texto justificado
- `tabla` → `<table>` real con columnas, filas, encabezados sombreados
- `grafico` → `<canvas>` renderizado con Chart.js
- `lista` → `<ul>` con bullets
- `referencias` → `<ol>` numerada
- `firma` → div con datos del evaluador

---

## 11. EXPORTACIÓN DE INFORMES

### Informe base (generado por la app)
- **HTML standalone**: archivo único con CSS embebido, gráficos como base64
- **Word (.docx)**: docx.js con tablas, imágenes de gráficos, firma
- **Excel (.xlsx)**: SheetJS, multi-hoja (paciente, evaluador, puntuaciones, interpretaciones)
- **JSON**: caso completo con todos los datos

### Informe IA (generado desde JSON pegado)
- **HTML**: standalone con secciones estructuradas
- **Word (.docx)**: con bloques (tablas, listas, referencias, firma)
- **Excel (.xlsx)**: tablas de cada sección
- **JSON**: backup del informe IA

### Descargas adicionales
- **Hoja de Respuestas (PDF)**: imprimible, con datos del paciente/evaluador, 567 items con V/F marcadas
- **Perfil de Escalas (PDF)**: dibujado en Canvas, 4 gráficos con líneas de perfil
- **Excel para respuestas**: plantilla pre-llenada con datos del paciente, 567 items vacíos

---

## 12. PERSISTENCIA DE DATOS

### localStorage
- `mmpi2_evaluator`: datos del evaluador (nombre, correo, registro, firma)
- `mmpi2_cases`: array de todos los casos guardados
- `mmpi2_current_case`: caso en curso
- `mmpi2_setup_done`: flag "true" después del setup inicial

### Estructura de un caso
```json
{
  "id": "case_1234567890_abc",
  "createdAt": "2026-10-01T...",
  "updatedAt": "2026-10-01T...",
  "patient": {
    "name": "Sandra Milena Rodas Tamayo",
    "document": "30.401.100",
    "dob": "1979-05-11",
    "age": 47,
    "sex": "M",
    "country": "US",
    "context": "Clínico",
    "applicationDate": "2026-09-28",
    "caseHistory": "...",
    "legalContext": "...",
    "previousMMPI": "Hs=78, D=55, Hy=68..."
  },
  "responses": [1, 2, 1, 2, ...],  // 567 values
  "results": {
    "L": {"code": "L", "name": "L (Mentira)", "pd": 5, "pdK": 5, "t": 51, "band": {...}, "interpretation": "..."},
    "F": {"code": "F", "name": "F (Infrecuencia)", "pd": 25, "pdK": 25, "t": 90, ...},
    ...
  },
  "narrative": "La persona evaluada...",
  "aiReport": {...}  // si se generó con IA
}
```

### Export/Import JSON
- Exportar caso actual: descarga un .json con el caso + datos del evaluador
- Exportar todo: descarga todos los casos + evaluador
- Importar JSON: carga casos desde un archivo .json

---

## 13. PROBLEMAS CONOCIDOS Y LIMITACIONES

### Items faltantes en claves de corrección
- **F**: faltan 6 items (fórmulas Claves_revision no resueltas)
- **D**: faltan 5 items
- **Mf**: faltan 5 items
- **Pa**: faltan 3 items
- **Hs, Si, FRS, BIZ, ANG, LSE, WRK**: faltan 1-2 items cada uno
- Impacto: los PD calculados pueden diferir del software oficial Pearson

### Fp: discrepancia con informe de referencia
- Nuestra lista de items Fp produce PD=9 para Sandra
- El informe de referencia dice Fp T=49 → PD≈1
- Causa probable: la lista de items Fp de fuente académica puede no coincidir exactamente con el software oficial
- Solución: requerir claves oficiales de Pearson Assessments

### Escalas sin baremo ES
- Pa, Pt, Sc (PD+K): el baremo ES no tiene valores para PD+K altos
- La app muestra "—" cuando no encuentra el PD en el baremo ES

### Escalas sin baremo US
- O-H, MDS, APS, AAS: tienen baremo ES (verificado del Informe técnico) pero no US
- Para US, estas escalas muestran "PD calculada. Conversión a T no disponible"
- Ho: tiene baremo US (conversión lineal) pero items pueden no coincidir con software oficial

### Comparación con informe de referencia (PhD. Andrade)
- El informe de referencia fue generado con software oficial de Pearson
- Diferencias en: F (PD=25 vs PD≈3), Mf (PD=30 vs PD≈27), TRT (PD=9 vs PD≈4), SOD (PD=14 vs PD≈11)
- Causa: items faltantes en nuestras claves de corrección
- Solución: completar las claves con los items oficiales del manual MMPI-2

### Limitaciones del prompt IA
- El prompt pide JSON estructurado, pero algunas IAs pueden no respetar el formato
- El prompt es muy largo (~27 KB) — algunas IAs pueden truncar
- Las gráficas solicitadas en el JSON son descripciones, no imágenes reales

---

## 14. CASO DE VALIDACIÓN (Sandra Rodas)

### Datos del paciente
- Nombre: Sandra Milena Rodas Tamayo
- Documento: 30.401.100
- DOB: 11/05/1979 (47 años)
- Sexo: Mujer (M)
- Contexto: Clínico-jurídico laboral

### Respuestas
- 567 respuestas (213 Verdaderas, 354 Falsas, 0 omisiones)
- Fuente: RESPUESTAS MMPI 2 Sandra Rodas.xlsx

### Comparación de T values (baremo US Mujer)

| Escala | PD | PD+K | T (app US) | T (ref) | Δ | Causa Δ |
|--------|-----|------|-----------|---------|---|---------|
| L | 5 | 5 | 51 | 51 | 0 | ✓ correcto |
| F | 25 | 25 | 90 | 43 | +47 | Items faltantes |
| K | 19 | 19 | 61 | 60 | +1 | ≈ correcto |
| Hs | 13 | 23 | 66 | 68 | -2 | ≈ correcto |
| D | 26 | 26 | 53 | 58 | -5 | Items faltantes |
| Hy | 31 | 31 | 66 | 68 | -2 | ≈ correcto |
| Pd | 15 | 23 | 49 | 48 | +1 | ✓ correcto |
| Mf | 30 | 30 | 55 | 63 | -8 | Items faltantes |
| Pa | 12 | 12 | 51 | 53 | -2 | ≈ correcto |
| Pt | 13 | 32 | 51 | 54 | -3 | ≈ correcto |
| Sc | 15 | 34 | 54 | 54 | 0 | ✓ correcto |
| Ma | 12 | 16 | 42 | 40 | +2 | ≈ correcto |
| Si | 26 | 26 | 48 | 48 | 0 | ✓ correcto |
| Fp | 9 | 9 | 91 | 49 | +42 | Items incorrectos |
| S | 14 | 14 | 62 | 55 | +7 | Items parcialmente incorrectos |
| Ho | 10 | 10 | 42 | 46 | -4 | ≈ correcto |

### Escalas que coinciden (Δ=0): L, Sc, Si (3 de 16)
### Escalas aproximadamente correctas (|Δ|≤3): K, Hs, Hy, Pd, Pa, Pt, Ma, Ho (8 de 16)
### Escalas con discrepancia significativa (|Δ|≥5): F (+47), D (-5), Mf (-8), Fp (+42), S (+7) (5 de 16)

---

## 15. RECOMENDACIONES DE AUDITORÍA

### Para ChatGPT o IA auditora

Al subir el archivo `MMPI2_App.zip` y este documento a ChatGPT, solicitar:

1. **Auditoría de claves de corrección**: Comparar los items en `scale_items.json` con las claves oficiales del MMPI-2 (publicadas en Butcher et al., 2001 o Graham, 2012). Identificar items faltantes o incorrectos.

2. **Auditoría de baremos**: Verificar que los valores PD→T en `baremo_us.json` coincidan con las tablas oficiales del MMPI-2 Manual (Appendix H). Prestar especial atención a escalas con discrepancias (F, D, Mf, Fp, S).

3. **Auditoría del prompt IA**: Revisar `ai-prompt.js` para verificar que el prompt generado incluye todas las instrucciones necesarias, que no menciona TEAcorrige cuando baremo=US, y que el esquema JSON solicitado es completo.

4. **Auditoría de criterios interpretativos**: Verificar que `criterios.json` tenga 79 escalas con 5 bandas cada una, que los textos interpretativos sean clínicamente apropiados, y que las bandas T sean correctas.

5. **Auditoría de consistencia**: Verificar que el motor `mmpi2.js` use correctamente:
   - K-correction (Hs×0.5, Pd×0.4, Pt×1.0, Sc×1.0, Ma×0.2)
   - Lookup de límite inferior (PD más alto ≤ target)
   - Bandas T correctas (≥70 Muy Alto, 60-69 Alto, 56-59 Promedio-Sup, 40-55 Modal, ≤39 Bajo)
   - Mensajes diferenciados por país (ES vs US)

6. **Auditoría de seguridad**: Verificar que no haya XSS (escapado de HTML en `_esc()`), que localStorage no almacene datos sensibles sin cifrar, y que el file upload valide tipos de archivo.

7. **Auditoría de accesibilidad**: Verificar que los botones tengan aria-labels, que las tablas tengan headers accesibles, y que los gráficos tengan descripciones alternativas.

8. **Auditoría de rendimiento**: Verificar que los gráficos se destruyan antes de recrearse (memory leak prevention), que el parser de Excel maneje archivos grandes, y que localStorage no exceda límites del navegador.

### Archivos a subir a ChatGPT para auditoría
1. `MMPI2_App.zip` (archivo completo de la app)
2. `MMPI2_Plantilla_Paciente.xlsx` (plantilla para pacientes)
3. Este documento de auditoría

---

## REFERENCIAS

- Butcher, J. N., Graham, J. R., Ben-Porath, Y. S., Tellegen, A., Dahlstrom, W. G., & Kaemmer, B. (2001). MMPI-2: Manual for Administration, Scoring, and Interpretation (Rev. ed.). University of Minnesota Press.
- Graham, J. R. (2012). MMPI-2: Assessing Personality and Psychopathology (5th ed.). Oxford University Press.
- Greene, R. L. (2011). The MMPI-2/MMPI-2-RF: An Interpretive Manual (3rd ed.). Pearson.
- Harris, R. E. & Lingoes, J. C. (1955). Subscales for the MMPI.
- Arbisi, P. A. & Ben-Porath, Y. S. (1995). An MMPI-2 infrequency response scale for use with psychopathological populations: the Infrequency Psychopathology scale (Fp). Psychological Assessment, 7, 424-431.
- Butcher, J. N. & Han, K. (1995). Development of an MMPI-2 scale to assess the presentation of self in a superlative manner: the S scale. In J. N. Butcher & C. D. Spielberger (Eds.), Advances in personality assessment (Vol. 10, pp. 25-50). Hillsdale, NJ: Erlbaum.
- Cook, W. W. & Medley, D. M. (1954). Proposed hostility and pharisaic-virtue scales for the MMPI. Journal of Applied Psychology, 38(6), 414-418.
- Silin, P. & Sanz, I. A. E. (2024). Evaluación de la personalidad e interpretaciones clínicas con el MMPI-2. Buenos Aires.
- Casullo, M. M. et al. (1996/1999). Studies of the MMPI-2 in Argentina / Aplicaciones del MMPI-2. Paidós.
- Manual MMPI-2 adaptación española. TEA Ediciones.

---

*Documento generado para auditoría funcional y de contenidos.*
*Fecha: Octubre 2026*
