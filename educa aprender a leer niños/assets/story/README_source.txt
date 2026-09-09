====================================================================
 EMILIA · EL BOSQUE DE LAS PALABRAS
 Paquete de assets visuales · v1.0.0
====================================================================

App de iniciación lectora para niñas y niños de 5 a 7 años.
Optimizado para pantallas de celular y tablet.

--------------------------------------------------------------------
1. ESTRUCTURA DEL PAQUETE
--------------------------------------------------------------------
emilia_story_assets/
├── backgrounds/   8 fondos en WebP · 1920x1080 · sin texto
├── characters/    9 personajes en PNG · 1024x1024 · fondo transparente
├── props/        18 objetos en PNG · 1024x1024 · fondo transparente
├── preview/      4 hojas de contacto para revisión rápida
├── manifest.json  inventario completo (nombre, ruta, medidas, peso)
└── README.txt     este archivo

--------------------------------------------------------------------
2. FONDOS (backgrounds/) — WebP horizontal 1920x1080
--------------------------------------------------------------------
fondo_parque_vocales.webp    Parque de diversiones infantil, alegre y seguro
fondo_picnic.webp            Picnic en el césped: manta, canasta, flores
fondo_cocina_hogar.webp      Cocina/comedor cálida del hogar (mamá, papá, sopa)
fondo_masa_mesa.webp         Mesa sencilla de madera lista para amasar
fondo_noche_luna.webp        Noche serena con luna grande, estética tierna
fondo_lupa_exploracion.webp  Sendero de jardín para explorar con la lupa
fondo_domo_d.webp            Interior mágico del Domo de la D
fondo_jardin_palabras.webp   Jardín mágico lector con arcos de flores y libros

--------------------------------------------------------------------
3. PERSONAJES (characters/) — PNG transparente 1024x1024
--------------------------------------------------------------------
mama.png   Mamá: joven, cabello castaño ondulado, blusa crema
papa.png   Papá: joven, cabello castaño oscuro, camisa azul
mimi.png   Gatita crema y blanca con lacito rosa
susi.png   Osita canela de peluche con moño rosa
lola.png   Coneja blanca de orejas rosadas
nana.png   Ovejita abuela con gafas y chal lila
tito.png   Osito canela pequeño y juguetón
paloma.png Palomita blanca amable
sapo.png   Saperito verde de ojos grandes y mejillas rosadas

--------------------------------------------------------------------
4. OBJETOS / PROPS (props/) — PNG transparente 1024x1024
--------------------------------------------------------------------
lupa.png            Lupa de aumentos con mango menta
luna.png            Luna creciente dorada dormilona
sopa.png            Tazón de sopa caliente con zanahorias y cuchara
masa.png            Bollo de masa suave sobre tabla de madera
mesa.png            Mesa infantil de madera redondeada
dado.png            Dado de peluche con puntos (sin números)
nido.png            Nido de ramitas con tres huevitos pastel
mapa.png            Mapa del tesoro solo con símbolos (sin letras)
rama.png            Rama de árbol con hojitas verdes
taza.png            Taza rosa de chocolate caliente con malvaviscos
pan.png             Pan dorado redondito
paloma_objeto.png   Figura de paloma tallada en madera
pino.png            Pinito de follaje suave
mano.png            Manito de niño saludando
mono.png            Monito de peluche marrón
limonada.png        Limonada fresca con pajita y rodajas de limón
cofre_pequeno.png   Cofre pequeño de madera con brillo dorado
estrella_premio.png Estrella dorada de premio con carita feliz

--------------------------------------------------------------------
5. GUÍA DE ESTILO
--------------------------------------------------------------------
- Ilustración 3D suave tipo plastilina/peluche, alta calidad, sin
  realismo duro.
- Paleta pastel cálida: cremas, verdes suaves, rosados, miel.
- Sin texto dentro de las imágenes (los textos los dibuja la app).
- Fondos despejados, con zona central tranquila para UI y personajes.
- Personajes tiernos, ojos grandes, siluetas claras.
- Objetos reconocibles de un vistazo, ideales para juegos de
  vocabulario fonético (p-a-n, l-u-p-a, m-e-s-a...).

--------------------------------------------------------------------
6. USO RECOMENDADO EN LA APP
--------------------------------------------------------------------
- Fondos: usar directamente como capa de escena; el WebP pesa poco
  en móvil y tablet. Las zonas centrales están pensadas para
  alojar diálogos, botones y personajes.
- Personajes y objetos: PNG con canal alfa listos para animar
  (aparecer, escalar, flotar). El margen del lienzo 1024 permite
  sombras y brillos sin recortes.
- La estrella y el cofre funcionan como recompensas; la luna como
  transición a modo noche; la lupa para minijuegos de buscar
  palabras en el jardín.

--------------------------------------------------------------------
7. NOTAS TÉCNICAS
--------------------------------------------------------------------
- Generación: modelos de imagen con dirección de arte unificada.
- Recortes: clave por color + limpieza de bordes con suavizado.
- manifest.json contiene el inventario completo con rutas listas
  para consumir desde código.

¿Dudas, ajustes de estilo o nuevas escenas? Escríbenos y iteramos
el paquete manteniendo la coherencia visual.
