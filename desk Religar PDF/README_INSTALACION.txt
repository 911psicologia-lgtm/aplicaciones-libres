RELIGAPDF LOCAL v2.0 - SIN NPM
================================

Esta versión corrige el error:
"npm no se reconoce como un comando interno o externo".

La aplicación NO requiere:
- Node.js
- npm
- instalación de dependencias
- conexión a internet

INSTALACIÓN RECOMENDADA
----------------------
1. Extraer el ZIP completo.
2. Ejecutar: INSTALAR_RELIGAPDF_LOCAL.bat
3. Usar el acceso "ReligaPDF Local.bat" creado en el escritorio.

RESPALDO SIN INSTALAR
---------------------
Si el equipo bloquea el instalador, abrir la carpeta y ejecutar:
EJECUTAR_SIN_INSTALAR.bat

También se puede abrir directamente:
app\index.html

FUNCIONALIDAD CONSERVADA
------------------------
- Agregar PDFs uno a uno.
- Agregar carpeta con PDFs.
- Arrastrar PDFs.
- Ordenar documentos.
- Clasificar por tipo documental.
- Elegir "Otro" en Tipo y escribir de qué se trata.
- Agregar observaciones.
- Generar manifiesto HTML.
- Consolidar en un solo PDF.
- Activar o desactivar portada neutra.
- Activar o desactivar separadores por tipo.
- Guardar/abrir proyecto JSON.

CAMBIOS v2.0
------------
- Instalación neutra, sin dependencia de Node.js ni npm.
- Apertura preferente en Microsoft Edge o Google Chrome cuando estén disponibles.
- Limpieza de accesos y carpetas locales anteriores de ReligaPDF antes de instalar.
- La portada y los separadores generados por la app no incluyen marca institucional.
- La portada y los separadores ahora son opcionales.
- Si el usuario selecciona "Otro" en Tipo, la app exige escribir de qué se trata antes de consolidar o generar manifiesto.
- El nombre de salida depura automáticamente marcas institucionales escritas por error en campos generados por la app.

NOTA IMPORTANTE
---------------
La app une documentos PDF. No borra ni modifica palabras que ya estén dentro de los PDFs originales cargados por el usuario. Si una página fuente ya contiene una marca o membrete, esa página se conservará tal como fue cargada.

Si aparece nuevamente el error de npm, se está ejecutando un instalador viejo, no este paquete v2.0.
