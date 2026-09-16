# Emilia: La Saga de los 20 Reinos (v3.0)

Juego de acción arcade con sprites e imágenes reales, fondos realistas generados con IA, y poderes mágicos mejorados.

## Novedades v3.0

### Assets reales basados en imágenes adjuntas
- **12 princesas** extraídas del collage Disney estilo chibi/kawaii
- **6 villanos** extraídos del collage de villanos Disney (Maléfica, Jafar, etc.)
- **9 criaturas** extraídas del collage de monstruos amistosos
- **6 estados de cofres** (cerrado, abierto vacío, abierto con oro, etc.)
- **35 iconos** kawaii y lavanda para power-ups y UI
- **20 fondos realistas** generados con IA específicos para cada mundo

### Fondos realistas por mundo (generados con IA)
Cada uno de los 20 reinos tiene su propio fondo atmosférico único:
1. Reino Slime → Prado verde con criaturas
2. Bosque Dulce → Bosque de caramelo
3. Valle Fuego → Paisaje volcánico
4. Cumbres Hielo → Picos helados con aurora
5. Ciudad Neón → Ciudad cyberpunk nocturna
6. Mundo Galleta → Mundo de dulces
7. Océano Perla → Arrecife submarino
8. Desierto Dorado → Dunas con pirámide
9. Selva Mágica → Jungla con templo antiguo
10. Castillo Fantasma → Castillo encantado
11. Nubes Algodón → Ciudad flotante en nubes
12. Espacio Estelar → Nebulosa cósmica
13. Jardín Rosas → Jardín romántico
14. Mina Gemas → Cueva de cristales
15. Reino del Sol → Templo solar
16. Tierra Dragones → Cumbres volcánicas
17. Pantano Oscuro → Pantano tóxico
18. Cuna Juguetes → Taller de juguetes
19. Dimensión Cristal → Dimensión espejo
20. Trono Supremo → Trono oscuro

### Poderes mágicos mejorados (10 poderes)
8 poderes originales + 2 nuevos:
- **Lluvia de Estrellas**: estrellas caen del cielo eliminando enemigos en columna
- **Distorsión Temporal**: ralentiza el tiempo para los enemigos

Cada poder tiene efectos visuales mágicos mejorados:
- Anillos de partículas al recoger
- Destellos orbitantes
- Auras pulsantes
- Sonidos únicos

### Sistema de imágenes con fallback
- `ImageLoader.js` carga 77 imágenes asíncronamente al inicio
- Cada sprite usa imagen real si está disponible, sino dibujo canvas como fallback
- Las imágenes tienen glow mágico, sombras y animaciones de flotación

## Cómo jugar

Abre `index.html` en cualquier navegador moderno.

```bash
# Servidor local recomendado
python3 -m http.server 8765
# O
npx http-server -p 8765
```

Abre `http://localhost:8765` en el navegador.

## Controles

- **Mouse / Touch**: mueve a Emilia (disparo automático)
- **Botón sonido** (abajo derecha): activa/silencia audio
- **Botón pausa** (abajo derecha): pausa la partida
- **Botón hangar** (abajo derecha): abre la tienda de mejoras

## Estructura del proyecto

```
emilia-saga/
├── index.html
├── README.md
├── css/
│   ├── styles.css
│   └── themes.css
├── js/
│   ├── storage.js
│   ├── audio.js
│   ├── imageloader.js     [NUEVO] Carga 77 imágenes
│   ├── assets.js          [ACTUALIZADO] Usa imágenes reales con fallback
│   ├── particles.js
│   ├── levels.js          [ACTUALIZADO] bgImage por nivel
│   ├── bosses.js          [ACTUALIZADO] Usa imágenes de villanos
│   ├── obstacles.js
│   ├── entities.js        [ACTUALIZADO] Boss usa imagen + animaciones
│   ├── combos.js
│   ├── powers.js          [MEJORADO] 10 poderes mágicos
│   ├── hangar.js
│   ├── prizes.js
│   ├── hero.js
│   ├── ui.js
│   └── game.js            [ACTUALIZADO] Fondos realistas con scroll
└── assets/                [NUEVO] Todas las imágenes
    ├── princesses/        (14 imágenes)
    ├── villains/          (7 imágenes)
    ├── enemies/           (10 imágenes)
    ├── chests/            (7 imágenes)
    ├── backgrounds/       (27 imágenes)
    └── icons/             (37 imágenes)
```

## Características heredadas (v2.0)

- 20 niveles con trama narrativa única
- 20 jefes con poderes especiales animados (División Babosa, Lluvia de Magma, Eclipse Final...)
- Sistema de combos (7 tiers + 6 combinaciones de poderes)
- Hangar con 10 mejoras permanentes
- 4 tipos de obstáculos
- Cofres mágicos con premios
- Audio sintetizado (20+ efectos)
- Persistencia en localStorage
- Subjefes periódicos

## Compatibilidad
- Chrome / Edge 88+
- Firefox 87+
- Safari 14+
- Móvil: Android Chrome, iOS Safari

## Notas técnicas
- Las imágenes se cargan asíncronamente para no bloquear el inicio
- El sistema de fallback garantiza que el juego funcione incluso si faltan imágenes
- Los fondos tienen scroll vertical sutil para sensación de movimiento
- Cada nivel aplica un overlay de color sutil sobre el fondo para mantener identidad temática
