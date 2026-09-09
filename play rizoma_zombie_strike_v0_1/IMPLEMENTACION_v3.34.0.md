# RIZOMA ZOMBIE STRIKE v3.34.0
## Firma de impacto + identidad de combate

### Base maestra

- Base exclusiva: `Rizoma_Zombie_Strike_v3.33.0_Identidad_Naves_Lectura_Build.zip`.
- SHA-256 de la base utilizada: `713a2b7b1c7b3b2e6ba1890c77a6386dc5e6bd60c34757c76493fc5b838950af`.
- Se conserva la campaña completa M1–M20. No se crea Mundo 21 jugable.
- Los 840 archivos heredados de `assets/` permanecen idénticos byte a byte.
- No se incorporan placeholders ni se sustituyen sprites reales.

### 1. Firma de impacto por Nave Rizoma

Se añade una capa visual de microimpacto que reutiliza únicamente VFX ya existentes. La capa no modifica daño, estados, IA, perforación ni cooldowns.

- **Fénix RZ-1 · PERFORAR:** usa `trident_charge_*` y una microcontinuación lineal para comunicar penetración frontal.
- **Mantis RZ-4 · CAZAR:** usa `vector_arc_*` como corte de precisión en el punto de impacto.
- **Nébula RZ-8 · CONTROLAR:** usa `drone_link_*` y un pulso breve para reforzar lectura de control de área.
- **Bastión RZ-12 · INTERCEPTAR:** usa `aegis_charge_*` y un pulso Aegis compacto.
- **Hydra RZ-16 · PRESIONAR:** usa `hydra_sidebeam_*` y una microseñal transversal para hacer legible la saturación lateral.
- **Rizoma Prime RZ-20 · ADAPTAR:** alterna `hyperlaser_*`, `synaptic_chain_*` y `defensive_nova_*` según el modo Prime registrado en el proyectil.

### 2. La identidad viaja con el proyectil

Cada proyectil del jugador registra, cuando corresponde, la Nave Rizoma que lo originó. En Prime también registra el modo de impacto. Esto evita que un proyectil en vuelo cambie visualmente de identidad si el jugador cambia de nave/configuración antes de que el disparo alcance al enemigo.

### 3. Partícula sprite reutilizable

Se amplía el renderer de partículas con un tipo `sprite` que permite dibujar VFX reales con:

- fade breve;
- escala controlada;
- rotación opcional;
- composición `screen`;
- crecimiento mínimo y desactivable.

No se agregan imágenes nuevas. Todos los sprites proceden del paquete v3.33.0.

### 4. Control de ruido y rendimiento

La firma de impacto está deliberadamente limitada:

- throttle aproximado: escritorio 58 ms, móvil 92 ms, bajo rendimiento 165 ms;
- si la carga de partículas es alta, se omiten impactos decorativos no esenciales;
- en modo de bajo rendimiento se reduce escala/opacidad;
- con movimiento reducido se elimina crecimiento y giro;
- el feedback no altera la cantidad de enemigos, proyectiles, pickups ni hazards.

### 5. Sistemas preservados

No se modificaron:

- curva de dificultad M1–M20;
- HP de Guardianes;
- función `damageEnemy`;
- microenjambres;
- economía;
- tractor gravitacional progresivo;
- RIFT ALLY = 10 s;
- Guardián Vinculado = 12 s;
- Última Oportunidad = 5 s;
- Taller RIZOMA;
- DOMINIO;
- Flota de Conquista;
- identidad/build de v3.33;
- háptica y bajo rendimiento de v3.32;
- música, SFX, videos y assets.

### 6. Versionado PWA

Versionado sincronizado en:

- `js/game.js`: 3.34.0;
- `manifest.json`: 3.34.0;
- `index.html`: 3.34.0;
- `sw.js`: cache `rizoma-zombie-strike-v3-34-0`.

### Validación

Ver `VALIDACION_v3.34.0.txt`.

No se declara smoke test visual real ni prueba física Android/iOS. La validación entregada corresponde a sintaxis, estructura, integridad de assets, referencias, preservación de reglas y empaquetado.
