# Changelog

## v0.2.0 — Combat Acceleration

### Rendimiento
- VFX activos migrados de sprites PNG escalados por frame a render procedural ligero.
- EMP con presupuesto de destrucción visual limitado.
- Caché LRU de sprites reescalados.
- Colisiones críticas sin creación repetitiva de cajas temporales.
- Presupuesto adaptativo de partículas según frame time.
- DPR adaptativo según área de pantalla.
- PNG conceptuales de VFX diferidos de la precarga inicial.

### Jugabilidad
- Cadencia, proyectiles, scroll y movimiento general acelerados.
- Formación inicial 9×5.
- Hasta 9 columnas en orientación vertical y 14 en horizontal, según progresión.
- Filas más próximas y columnas compactas.
- Barrido lateral de formación normalizado también para pantallas anchas.
- Subconjunto de invasores con desplazamiento diagonal local.
- Guardián de formación desde nivel 2, con HP escalable, movimiento propio y disparo múltiple.
- Cada quinto nivel conserva la formación; el jefe sectorial aparece después de destruirla.
- Transición entre sectores reducida.
- Powerups descienden más rápido.

### Audio
- Firma sonora independiente para Dispersión, Plasma, Misiles, Escudo, Cadena y EMP.
- Sonido específico para lanzamiento periódico de misiles.

### Balance
- Aumento gradual de frecuencia y velocidad de disparo enemigo.
- Obstáculos continúan siendo secundarios: se aceleran con el nivel, pero su máximo visible permanece limitado.
- Límite de balas y partículas explícito en configuración.
