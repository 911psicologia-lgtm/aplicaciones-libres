# STARFALL FRONTIER v0.4.3 — AUDITORÍA E INTEGRACIÓN DE AUDIO

## Paquete recibido
Se auditó `STARFALL_FRONTIER_AUDIO_PACK_v1.zip` y se integró completo en `assets/audio/`.

### Resultado de la auditoría
- **449 archivos OGG** decodificables correctamente.
- **20 mundos** con estructura completa.
- `audio_manifest.json` presente con 449 entradas.
- `README_AUDIO.md` presente.
- **Sample rate uniforme:** 44.1 kHz en los 449 audios.
- **251 archivos mono** y **198 estéreo**.
- Ambientes por mundo: entre **25.66 y 35.90 s**, media aproximada **32.06 s**.
- Boss SFX: 125 archivos, media aproximada **2.44 s**.
- Minion SFX: 120 archivos, media aproximada **0.60 s**.
- Subjefes A: 60 archivos; Subjefes B: 60 archivos.
- Reliquias: 20 archivos, media aproximada **2.58 s**.

Los dos archivos entregados también de forma individual (`player_emp_burst.ogg` y `world_15_subboss_a_death.ogg`) se compararon contra los contenidos del ZIP y son **idénticos byte a byte** a sus versiones internas.

## Adaptación a la entrega real
El paquete usa nombres uniformes como `world_XX_minion_hunter_attack.ogg` y `world_XX_minion_sentinel_attack.ogg`, en lugar de algunos nombres específicos del prompt inicial (`hunter_dash`, `sentinel_shield`). La integración se adaptó a los **nombres realmente entregados**, sin renombrar ni duplicar archivos.

## Sistema implementado
Se añadió `js/audio.js` con un gestor de audio independiente y escalable:
- carga diferida por mundo;
- precalentamiento de los audios del mundo actual;
- ambientación en loop por mundo;
- categorías de volumen separadas;
- control de polifonía para evitar saturación;
- cooldown por efecto para que enjambres grandes no disparen cientos de sonidos simultáneamente;
- pausa/reanudación coordinada de ambiente y motores;
- fallback silencioso: si un archivo falla, el juego sigue funcionando.

## Mapeo implementado
### Global
- UI: menú, confirmación, volver, checkpoint, pausa, reanudación, advertencia de poca vida, Game Over, victoria.
- Stingers: bonus, amazing, alerta de jefe, sector limpio y power-up.
- Jugador: disparo básico, ráfaga, láser, misiles, dron y EMP.
- Poderes: imán, reparación, vida extra, multiplicador, reliquia.
- Defensa: escudo activo, impacto y rotura.
- Movimiento: loop de motor ligero/pesado según nave.
- FX: impactos, explosiones, destrucción de enemigos y subjefes.
- Obstáculos: pass-by y destrucción diferenciada para meteoros/restos.

### Por mundo
- `world_XX_ambience_loop.ogg` cambia automáticamente al entrar en el mundo.
- Cada tipo de esbirro reproduce el ataque propio de su familia.
- Subjefe A/B: intro, ataque y muerte específicos.
- Jefe: intro, phase shift, ataque primario/secundario/control, muerte y revive cuando aplica.
- Reliquia: liberación desde el jefe y sonido global de adhesión al jugador.

## Rendimiento
No se cargan los 449 audios simultáneamente. El gestor prepara globales bajo demanda y precalienta solo el mundo activo. Se limita la polifonía secundaria a 24 voces y se aplican cooldowns por evento para mantener estabilidad especialmente en celular.
