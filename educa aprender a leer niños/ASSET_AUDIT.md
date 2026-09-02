# Auditoría de assets · 0.4.5

## Regla de identidad
Las cuatro imágenes de Lumina/Lumi ya presentes en 0.4.4 se conservaron **sin modificación**:
- `assets/characters/lumi_guide.png`
- `assets/characters/lumi_thinking.png`
- `assets/characters/lumi_cheer.png`
- `assets/characters/lumi_victory.png`

Las variantes de Lumi incluidas en `emilia_assets.zip` no se activaron ni sustituyeron estas imágenes.

## Integración
Los demás assets válidos del ZIP se optimizaron a WebP y quedaron dentro de la biblioteca PWA. Se activaron especialmente en:
- mapa y fondos de cada mundo;
- imágenes de selección de palabras;
- letras decorativas de nodos y trazado;
- botón de escucha y navegación;
- recompensas, semillas y logros;
- historias y refuerzo tras construir palabras.

## Dos assets que no se activaron como estímulo pedagógico
- `objects/mesa.webp`: el archivo recibido no representa una mesa; se conserva en la biblioteca, pero no se usa como estímulo para evitar enseñar una asociación incorrecta.
- `characters/lola.webp`: la ilustración contiene la palabra “Lola” incrustada; se conserva en la biblioteca, pero no se usa como imagen principal de discriminación porque revelaría el nombre mediante texto.

El resto del paquete queda disponible para ampliar nuevas actividades sin rehacer la arquitectura.
