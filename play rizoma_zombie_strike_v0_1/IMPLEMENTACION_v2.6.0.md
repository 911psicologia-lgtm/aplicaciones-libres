# Rizoma Zombie Strike v2.6.0 · Banda Sonora de Guardianes

## Objetivo
Integrar las pistas de combate de jefes entregadas por el usuario, mantener la pista ya aprobada de Magnate Omega, añadir música ambiental exclusiva del Mundo 1, incorporar un control musical rápido en combate y aumentar la resistencia de enemigos sin alterar progresión, economía, fondos ni poderes.

## Banda sonora de jefes
El archivo `songs battle.zip` recibido contiene **12 MP3 numerados de boss1 a boss12**. No contiene un archivo `boss13`.

Mapeo implementado:

| Mundo | Tema de jefe | Archivo | Volumen base |
|---|---|---|---:|
| 1 | Núcleo Meteórico | boss_world1_nucleo_meteorico.mp3 | 0.280 |
| 2 | Matriz de Convergencia | boss_world2_matriz_convergencia.mp3 | 0.215 |
| 3 | Corazón Ígneo | boss_world3_corazon_igneo.mp3 | 0.240 |
| 4 | Sello Astral | boss_world4_sello_astral.mp3 | 0.235 |
| 5 | Fragmento del Vacío | boss_world5_fragmento_vacio.mp3 | 0.350 |
| 6 | Iron Legion March | boss_world6_magnate_omega.mp3 | 0.270 |
| 7 | Deep Current | boss_world7_deep_current.mp3 | 0.215 |
| 8 | Bio Pulse | boss_world8_bio_pulse.mp3 | 0.225 |
| 9 | Kurai Sekai | boss_world9_kurai_sekai.mp3 | 0.215 |
| 10 | End of Stars | boss_world10_end_of_stars.mp3 | 0.240 |
| 11 | Twin Suns | boss_world11_twin_suns.mp3 | 0.200 |
| 12 | Hadal Pulse | boss_world12_hadal_pulse.mp3 | 0.250 |
| 13 | Forge Below | fallback procedural existente | — |

### Magnate Omega
Se conserva **Iron Legion March** como tema principal de Magnate Omega, tal como estaba aprobado en v2.5.9. La nueva pista `boss6_cyber_assault.mp3.mp3` queda incorporada como **fallback técnico** si el navegador no puede reproducir Iron Legion March.

### Mundo 13
No se inventó ni se reasignó una pista incorrecta. Al no existir `boss13` dentro del ZIP recibido, Vulkarion mantiene temporalmente su música procedural `Forge Below`. El sistema ya queda preparado para sustituirla por un MP3 del Mundo 13 cuando se entregue.

## Ajuste sonoro
Las pistas fueron conservadas byte a byte; no se recomprimieron. Se midió loudness y pico para ajustar únicamente el volumen de reproducción. La mezcla usa un fade de entrada de 850 ms y un incremento discreto de aproximadamente 0.015 por fase, limitado a 0.40.

Mediciones relevantes del material entregado:
- Boss 1: -15.5 LUFS.
- Boss 2: -13.1 LUFS.
- Boss 3: -14.1 LUFS.
- Boss 4: -13.9 LUFS.
- Boss 5: -19.4 LUFS; por ello necesita mayor ganancia de reproducción.
- Boss 6 Cyber Assault: -13.3 LUFS.
- Boss 7: -13.1 LUFS.
- Boss 8: -13.5 LUFS.
- Boss 9: -13.1 LUFS.
- Boss 10: -14.1 LUFS.
- Boss 11: -12.6 LUFS.
- Boss 12: -14.5 LUFS.
- Iron Legion March: -15.1 LUFS.

Cada mundo precarga únicamente su pista de jefe, evitando descargar en memoria todas las canciones al iniciar la PWA.

## Música ambiental del Mundo 1
Se incorporó `world1_ambient_nucleo_meteorico.mp3.mp3` como:
`assets/audio/world1_ambient_nucleo_meteorico.mp3`

Características de implementación:
- dura 229.224 s;
- estéreo, 48 kHz;
- se reproduce únicamente durante el recorrido normal del Mundo 1;
- loop continuo;
- volumen base 0.13 para no cubrir efectos de combate;
- fade de entrada 1.1 s;
- cuando aparece el jefe, se detiene y entra el tema de Boss 1;
- no se reproduce en Mundos 2–13.

## Control musical rápido
Se añadió un botón `♫` dentro del rail de acciones del HUD:
- pequeño y compatible con horizontal móvil;
- titila y emite ondas visuales mientras la música está activa;
- al tocarlo silencia exclusivamente la música, no los efectos de sonido;
- en estado silenciado deja de animarse y muestra una línea de apagado;
- al tocar nuevamente, restaura la pista correcta según el contexto actual: ambiente de Mundo 1, combate de jefe o música procedural;
- sincroniza el interruptor `Música` de Ajustes y persiste la preferencia.

## Dureza de combate
Se añadió una capa global explícita:
`COMBAT_DURABILITY = { boss: 1.10, subboss: 1.10, minion: 1.05 }`

Aplicación:
- jefes principales: +10% HP;
- escudo base de jefes: +10%;
- Ecos de jefes: +10% HP;
- Capitanes/Prefectos de M1–M2: +10% neto;
- subjefes explícitos de M9, M10 y M13: +10% neto;
- esbirros comunes, escoltas y unidades de horda: +5% HP base.

Los subjefes que nacen a partir de una unidad normal usan una corrección `1.10 / 1.05`, evitando que reciban por accidente 15.5% en lugar del 10% solicitado.

## Sistemas preservados
No se modificaron:
- fondos ni assets visuales heredados;
- progresión de campaña;
- Archivo y repetición de mundos;
- Entrenamiento;
- economía;
- poderes, fusiones, doctrinas o Memoria de Expediciones;
- Bomba Omega;
- pausa obligatoria de la tienda táctica.

## Versión
- `VERSION`: 2.6.0
- manifest: 2.6.0
- cache name: `rizoma-zombie-strike-v2-6-0`
