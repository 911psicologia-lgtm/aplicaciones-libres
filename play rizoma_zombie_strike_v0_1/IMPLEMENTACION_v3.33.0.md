# RIZOMA ZOMBIE STRIKE v3.33.0
## Identidad de Naves Rizoma + lectura de build

### Base maestra

- Base exclusiva: `Rizoma_Zombie_Strike_v3.32.0_Accesibilidad_Haptica_Aliados_Rendimiento.zip`.
- SHA-256 de la base utilizada: `b1df5390fb2b6609513b497e2c7f11147e02b8744188bfb051f24a8059bfc51b`.
- Se conserva la campaña M1–M20. No se crea Mundo 21 jugable.
- Los 840 archivos heredados de `assets/` permanecen idénticos byte a byte.
- No se sustituyeron sprites, audio, música, videos ni VFX existentes.

### 1. Identidad táctica de las seis Naves Rizoma

Se añade una capa de lectura funcional que no modifica estadísticas ni IA:

- Fénix RZ-1: **FRONTAL · PERFORAR**.
- Mantis RZ-4: **PRECISIÓN · CAZAR**.
- Nébula RZ-8: **ESCOLTA · CONTROLAR**.
- Bastión RZ-12: **BASTIÓN · INTERCEPTAR**.
- Hydra RZ-16: **SATURACIÓN · PRESIONAR**.
- Rizoma Prime RZ-20: **HÍBRIDA · ADAPTAR**.

La nomenclatura resume la identidad que ya estaba implementada en pasivas, doctrina y especiales; no crea una segunda lógica de nave.

### 2. Banda táctica de Nave Rizoma en combate

Cuando el jugador usa una Nave Rizoma propia aparece una banda compacta con:

- código de nave;
- arquetipo táctico;
- etapa actual del arsenal E1–E4;
- verbo táctico;
- estado o segundos restantes del especial;
- barra de recarga.

La banda se oculta cuando el jugador usa Flota de Conquista o una forma DOMINIO. Durante combate con jefe se recoloca para no competir con la barra principal del Guardián.

### 3. Telegráfico previo del especial con assets reales

Durante los últimos ~0,85 s antes de un especial automático, la Nave Rizoma muestra de forma tenue sus propios frames `special_*` ya existentes.

- No se añaden sprites genéricos.
- No se altera daño.
- No se altera cooldown.
- No se altera la condición de disparo.
- El especial sigue ejecutando sus VFX reales particulares: Trident Beam, Vector Cut, Nebula Pulse, Aegis Field, Poly Volley y ciclos Prime.

El objetivo es mejorar anticipación y lectura, especialmente en pantalla pequeña.

### 4. Hangar: lectura de identidad más rápida

Las tarjetas de Naves Rizoma muestran ahora de forma compacta:

- arquetipo;
- verbo táctico;
- cooldown base del especial;
- nombre del especial;
- modificadores ya existentes.

El cooldown mostrado en Hangar es el valor base de identidad. En combate la banda muestra el cooldown real ajustado por etapa/doctrina.

### 5. Build y Memoria de Expediciones

La instantánea de build registra ahora, cuando corresponde:

- Nave Rizoma utilizada;
- rol táctico;
- especial propio;
- etapa del arsenal.

Esta información aparece en:

- pausa;
- resumen final;
- expedición archivada;
- referencia fijada de Memoria de Expediciones.

Los registros antiguos siguen siendo compatibles: si una expedición previa no contiene el campo `ship`, simplemente se omite esa línea.

### 6. Sistemas preservados

No se modificaron:

- curva M1–M20;
- HP de Guardianes;
- microenjambres;
- economía central;
- tractor gravitacional progresivo;
- RIFT ALLY = 10 s;
- Guardián Vinculado ≈ 12 s;
- Última Oportunidad = 5 s;
- Taller RIZOMA;
- DOMINIO;
- Flota de Conquista;
- háptica opcional de v3.32;
- modo de bajo rendimiento de v3.32;
- assets, música, SFX y cinematográficas.

### 7. Versionado PWA

Versionado sincronizado en:

- `js/game.js`: 3.33.0;
- `manifest.json`: 3.33.0;
- `index.html`: 3.33.0;
- `sw.js`: cache `rizoma-zombie-strike-v3-33-0`.

### Validación

Ver `VALIDACION_v3.33.0.txt`.

No se declara prueba física Android/iOS ni smoke test visual real de navegador. La validación entregada corresponde a sintaxis, estructura, integridad, referencias y empaquetado del proyecto.
