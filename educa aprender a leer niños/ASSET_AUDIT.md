# Auditoría de assets Z.AI · integración v0.7.1

## Fuente recibida
- Paquete: `emilia_bosque_de_las_palabras_assets.zip`
- Manifest original: 82 archivos visuales, 60.35 MB.
- Biblioteca pedagógica nueva (sin contact sheets): 75 assets.
- Todos los PNG individuales declarados a 1024×1024 RGBA; fondos a 1344×768 RGB.
- Lumina/Lumi no forma parte del paquete y se preserva sin sustitución.

## Resultado de integración
- 75 assets nuevos se incorporaron a la biblioteca runtime, convertidos a WebP para reducir peso.
- 58 de esos assets quedan conectados directamente a contenidos, mundos, cuentos, logros o patrones de la v0.7.1.
- Los restantes quedan disponibles para expansión posterior sin aumentar complejidad pedagógica ahora.
- El fondo `fondo_gran_jardin_lector` fue saneado mediante recorte del área superior porque traía un elemento de interfaz incrustado ajeno al paisaje.

## Assets deliberadamente no usados como estímulo léxico directo
- `objects/noche`: la imagen es ambigua para representar la palabra “noche”; se mantiene la luna/escena nocturna anterior para enseñanza directa.
- `objects/remo`: representa una escena con animal y barca, no un remo aislado; se conserva en biblioteca, pero no como opción de reconocimiento de palabra.
- `characters/gigante_amable`: se usa solo como apoyo contextual en GE/GI, no como prueba de reconocimiento de “gigante”, porque la escala visual no demuestra por sí sola el concepto.

## Integraciones principales
- Nuevos fondos: R, C, B, F, G, Gran Jardín, Ñ, CH, QU, RR, CE/CI, GE/GI y Bosque de Secretos.
- Nuevos estímulos: rana, cama, casa, bota, bata, beso, foca, foto, gato, gusano, niño, niña, leche, moño, queso, perro, burro, carro, torre, cena, cine, cero, cima, gema y gel.
- PatternIntro ahora admite imagen + palabra + audio.
- Nuevas escenas en cuentos: cine familiar, chico con leche, perro con carro, rana en cama y niña leyendo.
- Nuevas recompensas: cofre de palabras, estrella confite, insignia de secretos y medalla de patrones.

## Lumina
Los cuatro archivos actuales permanecen byte a byte sin cambios:
- lumi_guide.png
- lumi_thinking.png
- lumi_cheer.png
- lumi_victory.png
