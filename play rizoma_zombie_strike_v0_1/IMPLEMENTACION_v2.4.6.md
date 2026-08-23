# IMPLEMENTACIÓN v2.4.6 · Poderes vivos

## Alcance
Continuación ordenada del arsenal. Esta pasada no modifica fondos ni progresión. Se transforma dos poderes existentes para evitar acumulación innecesaria y darles una identidad visual y táctica mucho más clara.

### Llama Quimérica
- Reemplaza funcionalmente a **Fuego expansivo** conservando el ID `fire` para compatibilidad con partidas y fusiones.
- Duración: **9 s**.
- Mantiene la capacidad de incendiar disparos normales, pero añade una **entidad ígnea serpenteante** que aparece por pulsos.
- La quimera lanza bandas curvas de fuego, algunas con persecución, que atraviesan varios enemigos.
- El daño se reduce frente a Guardianes y se apoya más en combustión residual que en daño instantáneo.
- Añade aura visual propia a RIZOMA y formas DOMINIO.

### Misil Voraz
- Evoluciona **Torpedos perseguidores** conservando el ID `torpedo`.
- Duración: **8 s**.
- Dispara salvas de 2–6 misiles según nivel y dispositivo.
- Distribuye objetivos priorizando élites, medios y amenazas cercanas antes que concentrar todo sobre el Guardián.
- Si un misil destruye su presa puede **retargetear** otro enemigo, consumiendo cargas de persecución.
- Mantiene compatibilidad con la fusión **Enjambre infeccioso**.
- Nueva silueta visual tipo depredador/mantis y estela diferenciada.

### Bomba Omega · consistencia corregida
- Se eliminó la antigua lógica automática que todavía podía borrar todos los enemigos no jefes.
- Tanto la recogida directa como la activación por poder usan ahora **una sola función canónica**.
- Menores: destrucción total.
- Medios: merma de vida máxima.
- Élites/ecos: merma menor.
- Guardianes: hasta 8% de vida máxima y nunca remata por sí sola.
- Limpia proyectiles hostiles.
- La activación al obtener el poder se dispara prácticamente de inmediato.

## Compatibilidad
No se añaden IDs nuevos a la persistencia. `fire` y `torpedo` se actualizan internamente, por lo que backups anteriores siguen siendo compatibles.
