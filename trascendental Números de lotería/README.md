# Fortuna Quantum v4.2 · Laboratorio de auditoría relacional

Aplicación web estática y multiarchivo para estudiar relaciones entre datos, transformaciones simbólicas, controles aleatorios y sesgos interpretativos.

## Problema corregido

La edición anterior delegaba a una IA externa la creación de secuencias completas y repetía en exceso advertencias defensivas. Esa arquitectura tenía cuatro fallas:

1. podía activar respuestas de negativa antes de iniciar el análisis;
2. llamaba “anonimización” a conservar exactamente la misma estructura operativa del referente;
3. permitía que la IA sustituyera valores por palabras o símbolos inventados;
4. confundía controles sintéticos con matrices históricas o celestes realmente verificadas.

## Arquitectura v4.2

La nueva edición divide el proceso en dos capas:

### 1. Motor local de auditoría

El navegador genera controles internos y publica únicamente:

- identificadores FQ;
- métricas agregadas de estructura;
- paridad, suma, media, amplitud y dispersión;
- distribución por tercios y pares consecutivos;
- huellas de integridad por control y por ejecución;
- estado de verificabilidad de matrices externas.

Los estados individuales no aparecen en el informe ni se reconstruyen en el prompt.

### 2. Análisis externo

El prompt solicita a la IA:

- comprobar fuentes cuando realmente estén disponibles;
- distinguir dato, descripción, simbolismo y azar;
- no inventar historiales, efemérides, enlaces, cálculos ni huellas;
- reconocer qué matrices fueron ejecutadas y cuáles permanecen no verificadas;
- analizar sesgos, convergencias, dependencias y falacia del jugador;
- conservar los identificadores y métricas del paquete local.

## Cambios principales

- Versión de interfaz actualizada a `v4.2 AUDITORÍA`.
- Presets comerciales sustituidos por escenarios sintéticos FQ-LAB.
- Nuevo módulo `js/utils/audit-engine.js`.
- Exportación del paquete local en JSON.
- Vista previa separada para paquete local y prompt externo.
- Eliminación del bloque que exigía publicar secuencias individuales.
- Prohibición expresa de sustituir resultados por palabras fantasiosas.
- Controles históricos y celestes marcados como pendientes hasta disponer de fuentes verificables.
- Caché PWA renovada para evitar que se cargue la edición anterior.

## Estructura

```text
Fortuna_Quantum_v4_2_Auditoria/
├── index.html
├── manifest.webmanifest
├── sw.js
├── README.md
├── TEST_REPORT.md
├── assets/
│   └── icon.svg
├── css/
│   └── styles.css
└── js/
    ├── app.js
    ├── prompt-engine.js
    ├── data/
    │   ├── lotteries.js
    │   └── matrices.js
    └── utils/
        ├── random.js
        ├── numerology.js
        └── audit-engine.js
```

## Ejecución

La aplicación puede abrirse directamente mediante `index.html`. Para utilizar la instalación PWA y el service worker:

```bash
python -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Alcance metodológico

El paquete local sirve para probar trazabilidad, consistencia y lectura agregada. No demuestra capacidad predictiva y no convierte una correspondencia simbólica o una regularidad histórica en causalidad.
