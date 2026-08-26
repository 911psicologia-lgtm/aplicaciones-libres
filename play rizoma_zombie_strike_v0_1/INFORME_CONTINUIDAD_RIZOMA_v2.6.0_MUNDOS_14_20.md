# INFORME DE CONTINUIDAD E IMPLEMENTACIÓN PENDIENTE
## Rizoma Zombie Strike — Base v2.6.0 · Mundos 14–20

Documento de relevo para continuar el proyecto en un nuevo chat sin perder decisiones, reglas, arquitectura, balance ni avances.

---

## 1. Orden de inicio para el nuevo chat

Continuar **Rizoma Zombie Strike** tomando como única base de trabajo:

**Rizoma_Zombie_Strike_v2.6.0_Banda_Sonora_Guardianes.zip**

No retroceder a una versión anterior.

La siguiente fase consiste en **auditar los assets existentes y completar los mundos 14–20**, preservando todos los sistemas de v2.6.0.

Antes de modificar código:
1. Descomprimir v2.6.0 en una nueva carpeta.
2. Auditar `assets/`, `js/game.js`, `index.html`, `manifest.json` y `sw.js`.
3. Crear un inventario verificable de fondos de aproximación/antesala, arenas de jefe, jefes, subjefes, esbirros menores y medios, planetas errantes, meteoritos, cometas, basura espacial, proyectiles, hazards, reliquias, naves capturables y música.
4. **No afirmar que un asset existe si no se ha comprobado físicamente.**
5. Clasificar cada elemento como `LISTO`, `RECUPERABLE` o `POR GENERAR`.
6. Solo después comenzar Mundo 14.

---

## 2. Estado actual

La rama vigente es **v2.6.0 · Banda Sonora de Guardianes**.

Sistemas ya existentes y que NO deben reconstruirse:
- campaña y progresión;
- Archivo y repetición de mundos;
- Entrenamiento;
- naves capturadas de Guardianes;
- formas DOMINIO;
- tienda y pausa táctica;
- poderes, críticos, fusiones y combos;
- Códice, Maestría, Doctrinas, Cartografía de Sinergias y Memoria de Expediciones;
- HUD;
- música procedural y música específica de Guardianes;
- control de música;
- guardado, recompensas y dificultad escalada;
- soporte PC/móvil.

---

## 3. Reglas que no se pueden romper

### Tienda
Abrir la tienda **SIEMPRE pausa el juego**. Al cerrar debe restaurar exactamente el estado previo.

### Fondos
No alterar fondos ya aprobados de M1–M13 salvo petición expresa. Especialmente M11–M13.

### Dificultad vigente desde v2.6.0
- Guardianes/jefes: **+10 % HP**
- escudos de Guardianes: **+10 %**
- subjefes/capitanes/élites equivalentes: **+10 % HP**
- esbirros: **+5 % HP**

Evitar acumulaciones accidentales de multiplicadores.

### Bomba Omega
- menores: eliminación 100 %
- medios: −45 % HP máximo
- élites/ecos: −25 %
- Guardianes: hasta −8 % HP máximo
- nunca ejecuta al Guardián
- limpia proyectiles hostiles

### Poderes
Los poderes temporales deben conservar, como regla general, duraciones de 8–12 s. La Bomba Omega es instantánea.

---

## 4. Música

### Mundo 1
Existe música ambiental exclusiva para el recorrido normal:
`world1_ambient_nucleo_meteorico`

Al aparecer el jefe:
- fade out del ambiente;
- fade in del tema del Guardián.

### Mundo 6
**Magnate Omega** conserva como tema principal **Iron Legion March**. La otra pista de jefe 6 queda como respaldo.

### Mundo 13
El ZIP recibido contenía 12 canciones de jefe. **Vulkarion aún no tiene pista externa específica confirmada.** Mantener su música actual hasta recibirla.

### Mundos 14–20
No inventar canciones. Usar música procedural provisional hasta que existan pistas dedicadas.

### Botón de música
Mantener el icono musical pequeño/titilante:
- clic/touch silencia solo música;
- SFX continúan;
- segundo clic recupera la música contextual correcta.

---

## 5. Estructura estándar recomendada para M14–M20

Cada mundo debe contener:
- 1 fondo de aproximación/antesala;
- 1 arena de Guardián;
- 1 Guardián;
- 3 familias de enemigos;
- cada familia con 1 menor + 1 medio + 1 subjefe;
- total recomendado: 3 menores, 3 medios, 3 subjefes y 1 Guardián;
- hazards propios;
- proyectiles propios;
- 3–6 elementos ambientales flotantes;
- 1 reliquia;
- 1 poder de Guardián;
- 1 nave capturable;
- historia de entrada;
- transición narrativa;
- 5 actos/etapas como base.

---

## 6. Biblioteca ambiental que conviene auditar/generar

Antes de generar, verificar si ya existen:
meteoritos, asteroides, cometas, fragmentos metálicos, satélites destruidos, placas de casco, contenedores, restos de motores, reactores, minas, rocas cristalinas, planetas errantes y lunas.

Nuevos elementos útiles:
- satélite partido;
- antena orbital;
- cápsula de escape destruida;
- panel solar flotante;
- anillo de reactor;
- motor abandonado;
- caja de carga;
- fragmento de nave con luces;
- mina orbital;
- boya científica;
- casco de dron;
- restos de estación;
- cristal cósmico;
- microplaneta irregular;
- cometa pequeño;
- planeta errante;
- luna fragmentada.

Reglas:
- PNG/WebP transparente;
- silueta reconocible;
- nada abstracto o “sin forma”;
- recorte limpio;
- 3 tamaños;
- rotación lenta/parallax;
- no tapar al jugador.

---

# 7. Mundo 14 — Estrella Moribunda

**Guardián canónico:** Heliovorax · Némesis Nova  
**Poder:** Nova Agónica  
**Nave:** Trono Nova

Identidad: sistema estelar en colapso, luminoso, térmico, radial e inestable.

Silueta del jefe:
- entidad solar angular;
- corona rota;
- placas oscuras orbitando un núcleo blanco;
- extremidades de plasma.

Movimiento:
- desplazamientos radiales;
- teleport corto;
- expansión/contracción;
- aceleración al centro.

Ataques:
- llamaradas;
- arcos solares;
- ondas radiales;
- zonas calientes;
- explosiones retardadas;
- fragmentos de corona;
- colapso gravitacional.

Fases:
1. corona estable;
2. corona fracturada;
3. pérdida de masa;
4. núcleo desnudo, menor tamaño y mayor velocidad.

Familias:
- Corona: Chispa Coronal / Lancero Solar / Centurión de Protuberancia
- Plasma: Ácaro de Plasma / Raptor Helíaco / Arconte de Fulguración
- Colapso: Fragmento Degenerado / Devorador Fotónico / Caballero de la Penumbra Solar

Fondos:
- M14_approach: proximidad a estrella moribunda
- M14_bossArena: borde de corona/núcleo en colapso

Elementos flotantes:
placas solares quemadas, fragmentos de corona, mini cometas de plasma, lunas calcinadas, restos de observatorios, cristal solar.

---

# 8. Mundo 15 — Entrañas del Gusano Colosal

**Guardián:** Vermidrax · Gusano Primordial  
**Poder:** Peristalsis Devastadora  
**Nave:** Vermis Carapace

Identidad: interior orgánico, húmedo, pulsante y claustrofóbico.

Movimiento del jefe:
- emerge/desaparece;
- cruza la pantalla;
- ondula;
- embiste;
- pierde segmentos.

Ataques:
ácido, mordida, huevos, larvas, contracciones, paredes musculares y proyectiles orgánicos.

Familias:
- Parásitos: Larva Hemática / Garrapata Abisal / Reina Parasitaria
- Defensas internas: Macrófago Mutante / Fagocito Blindado / Centinela Inmunitario
- Tejido: Espora Ácida / Nódulo Mordedor / Esfínter Acorazado

Fondos:
- túnel intestinal/vascular;
- cámara cardíaco-digestiva para jefe.

Elementos:
células, burbujas, tejido, nervios, huesos internos, cristales biliares, cápsulas parasitarias.

---

# 9. Mundo 16 — Imperio de los Cerebros Asesinos

**Guardián:** Neurokhan · Neuroarca  
**Poder:** Sinapsis Letal  
**Nave:** Neuroarca Psiónica

Identidad: civilización psiónica de cerebros flotantes.

Silueta:
cerebro-catedral, ojos flotantes, nervios externos, módulos corticales y corona tecnológica.

Ataques:
pulsos psíquicos, ondas, proyectiles neurales, ojos centinela, rayos sinápticos y zonas de confusión. Si se usa inversión de controles, debe ser breve y anunciada.

Familias:
- Neuronas: Neurita Cazadora / Axón de Guerra / Ganglio Supremo
- Ojos: Ojo Sináptico / Vigía Cortical / Observador Triplex
- Cerebros: Cerebro Larvario / Córtex Blindado / Arconte Límbico

Fondos:
- ciudad neural;
- catedral cortical/arena psíquica.

Elementos:
neuronas, fragmentos de cráneo, módulos cerebrales, cristales psiónicos, ojos, cápsulas sinápticas.

---

# 10. Mundo 17 — Tundra Salvaje

**Guardián:** Skaldr Glacial · Fenrir de la Tundra  
**Poder:** Ventisca Depredadora  
**Nave:** Fenrir Cryo-Ship

Movimiento:
saltos, cargas, derrapes y emboscadas.

Fases:
rompe armadura de hielo y se vuelve más pequeño, rápido y agresivo.

Familias:
- Lobos: Lobezno Criónico / Lobo de Escarcha / Alfa Boreal
- Bestias: Ácaro de Hielo / Mamut Mutante / Coloso Permafrost
- Espíritus: Espectro de Nieve / Cazador Aurora / Chamán Glacial

Fondos:
- tundra orbital/planicie;
- cañón de hielo para arena.

Elementos:
icebergs, bloques, restos congelados, árboles cristalizados, satélites congelados, auroras y esqueletos.

---

# 11. Mundo 18 — Biblioteca Anime Multiversal

**Regla estética:** TODO el mundo debe ser anime/manga.

**Guardián:** Kanzai Akasha · Shogun de la Biblioteca  
**Poder:** Corte de Viñeta Absoluta  
**Nave:** Akasha Manga-Ship

Movimiento:
dash, cortes, desaparición entre viñetas, portales-página y clones.

Ataques:
cortes de tinta, paneles, sellos, clones, páginas cortantes y cambio de “género” visual por fase.

Familias:
- Shōnen: Kōhai de Tinta / Ronin de Panel / Sensei Carmesí
- Mecha: Mini-Mecha / Samurái Mecánico / Daimyō Reactor
- Yokai: Yokai de Página / Oni Editorial / Bibliotecario Maldito

Fondos:
- biblioteca anime infinita;
- arena tipo página monumental.

Elementos:
páginas, viñetas, onomatopeyas, pinceles, pergaminos, sellos, libros y tinta viva.

---

# 12. Mundo 19 — Planeta de los Grises

Tratar “Grises” exclusivamente como **arquetipo ficticio de ciencia ficción**.

**Guardián:** Arconte Zhyr  
**Poder:** Dominio Psíquico  
**Nave:** Zhyr Disc

Movimiento:
teleport, flotación, cambios de eje, control espacial y desapariciones breves.

Ataques:
pulsos psíquicos, drones, inmovilización breve/telegráfica, rayos, campos y proyecciones.

Familias:
- Drones: Sonda Gris / Dron Clínico / Cirujano Orbital
- Psiónicos: Acólito Zhyr / Operador Mental / Prelado Telepático
- Bioingeniería: Clon Pálido / Híbrido Sintético / Custodio Genético

Fondos:
- planeta gris e infraestructura silenciosa;
- cámara clínica psiónica.

Elementos:
sondas, discos, cápsulas, monolitos, tubos, satélites clínicos y restos de laboratorio.

---

# 13. Mundo 20 — Planeta Zombie-Reptiloide

También es ciencia ficción.

**Guardián final:** Sauryx Necrorex  
**Poder:** Dominio Necroescama  
**Nave:** Necrorex Dreadship

Movimiento:
persecución, saltos, embestidas, cuerpo a cuerpo y cambios de tamaño por mutación.

Ataques:
garras de plasma, saliva tóxica, rugido, invocación, coletazo, infección y mutaciones.

Familias:
- Reptiloides: Lagarto Infectado / Guerrero Escama / Pretor Saurio
- Zombies: Larva Necro / Bruto Cadavérico / Abominación de Fosa
- Biotecnología: Dron Escama / Raptor Cibernético / Sacerdote Necroplasma

Fondos:
- planeta reptiloide devastado;
- trono necrobiológico/arena final.

Elementos:
huevos, huesos, placas, restos de naves, reactores orgánicos, estatuas, biocápsulas y fragmentos de templo.

---

# 14. Orden correcto de producción

No montar M14–M20 simultáneamente.

1. **Auditoría completa de assets**
2. Mundo 14 completo
3. Mundo 15 completo
4. Mundo 16 completo
5. Mundo 17 completo
6. Mundo 18 completo
7. Mundo 19 completo
8. Mundo 20 completo
9. Balance global M14–M20
10. Campaña completa, epílogo y cliffhanger
11. Banda sonora futura

Para cada mundo:
historia → fondos → ambiente → familias → subjefes → Guardián → fases → poder → nave → reliquia → progresión → QA → ZIP.

---

# 15. Numeración recomendada

- v2.6.1 — Auditoría y preparación M14
- v2.7.0 — Mundo 14
- v2.8.0 — Mundo 15
- v2.9.0 — Mundo 16
- v3.0.0 — Mundo 17
- v3.1.0 — Mundo 18
- v3.2.0 — Mundo 19
- v3.3.0 — Mundo 20
- v3.4.0 — Saga II completa / balance / cierre

Hotfix: `.1`, `.2`, `.3`.

---

# 16. QA obligatorio por mundo

### Código
- `node --check js/game.js`

### Assets
- 0 referencias faltantes;
- transparencia correcta;
- sin imágenes rotas;
- sin rectángulos;
- sin placeholders;
- sin assets “sin forma”.

### Guardián
- tamaño razonable;
- hitbox proporcional;
- fases perceptibles;
- movilidad propia;
- ataques distinguibles;
- telegraphs;
- resistencia correcta.

### Móvil
- horizontal;
- controles táctiles funcionales;
- HUD reducido;
- textos no invasivos;
- jefe dentro de pantalla.

### Progresión
- desbloqueo del mundo siguiente;
- repetir no altera campaña;
- Entrenamiento no altera progreso;
- nave y reliquia se registran;
- Códice se actualiza.

### Audio
- sin solapamientos;
- botón musical correcto;
- SFX independientes;
- tema de jefe entra/sale bien.

### Tienda
- pausa total;
- compra;
- cierre;
- recuperación exacta.

### Entrega
- `unzip -t`;
- enlace sandbox clicable.

---

# 17. Regresiones que no deben volver

- fondo de historia encima del combate;
- planetas/basura espacial sin imagen;
- sprites rectangulares;
- jefes inmóviles;
- jefes demasiado grandes;
- barra de vida invasiva;
- mensajes permanentes;
- PWA sin giro;
- touch roto;
- pérdida de progresión;
- placeholders;
- poderes demasiado breves;
- Bomba Omega matando élites/jefes;
- tienda sin pausa;
- alterar fondos aprobados;
- reutilizar un jefe antiguo cambiando solo el color.

---

# 18. Principios de diseño

Cada Guardián debe diferenciarse en:
1. silueta;
2. lenguaje de movimiento;
3. lenguaje de ataque;
4. transformaciones por fase;
5. animación viva.

Cada mundo debe tener una ecología de tres familias con roles distintos:
- presión directa;
- control/zonificación;
- soporte/amenaza especial.

Si dos Guardianes pueden intercambiar sprite y seguir jugando casi igual, el diseño no está terminado.

---

# 19. Prompt exacto para iniciar el siguiente chat

**“Toma v2.6.0 como base. Primero audita todos los assets existentes que podamos reutilizar para M14–M20 y construye una matriz LISTO / RECUPERABLE / POR GENERAR. No alteres nada del juego todavía. Después de mostrarme el inventario, inicia Mundo 14 · Estrella Moribunda siguiendo el informe de continuidad. Conserva todos los sistemas, reglas de balance, música, poderes, progresión y pausa obligatoria de la tienda descritos en el informe.”**

---

# 20. Resumen canónico

| Mundo | Tema | Guardián | Poder |
|---|---|---|---|
| 14 | Estrella moribunda | Heliovorax · Némesis Nova | Nova Agónica |
| 15 | Entrañas de gusano colosal | Vermidrax · Gusano Primordial | Peristalsis Devastadora |
| 16 | Cerebros asesinos | Neurokhan · Neuroarca | Sinapsis Letal |
| 17 | Tundra salvaje | Skaldr Glacial · Fenrir | Ventisca Depredadora |
| 18 | Biblioteca anime multiversal | Kanzai Akasha · Shogun de la Biblioteca | Corte de Viñeta Absoluta |
| 19 | Planeta ficticio de los Grises | Arconte Zhyr | Dominio Psíquico |
| 20 | Planeta zombie-reptiloide | Sauryx Necrorex | Dominio Necroescama |

---

## Meta final de Saga II

Al completar Mundo 20:
- siete ecosistemas claramente distintos;
- naves de Guardianes capturadas;
- poderes identitarios integrados al arsenal;
- M20 como culminación real, no simple acumulación;
- cierre narrativo;
- cliffhanger para la siguiente saga.

**Base obligatoria: v2.6.0.  
Siguiente acción: auditoría verificable de assets → Mundo 14.  
No modificar M1–M13 durante la auditoría.**
