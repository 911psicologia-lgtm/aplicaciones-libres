# KBIT Protocolo Cognitivo v0.6.0

Aplicación multiarchivo estática preparada para Cloudflare Pages.

## Cambios principales
- Cobertura visual completa de los reactivos disponibles en la app.
- Se integraron estímulos sustitutivos aprobados para VE-2 Tenedor, VE-3 Rana y DEF-27 Conversación.
- Los sustitutos se sirven como WebP livianos (aprox. 12–18 KB) y quedan trazados en `data/stimuli-manifest.json`.
- Precarga de reactivos vecinos y caché de estímulos para reducir esperas.
- Plantilla original de respuestas incluida sin modificaciones en `docs/plantillas/Plantilla_KBIT_respuestas_original.pdf`.
- Informe técnico enriquecido: puntuaciones directas, PT/CI, banda de error, IC, percentil, categoría, z, eneatipo, perfil gráfico y discrepancia verbal/no verbal.
- Informe contextualizado conserva el núcleo técnico y separa datos observados, condiciones asociadas e hipótesis interpretativas.
- Datos del profesional responsable incorporados al informe.

## Publicación
Subir el contenido de esta carpeta a Cloudflare Pages. `index.html` es el punto de entrada.
