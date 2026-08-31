# Rizoma Zombie Strike v3.6.0
## Flota de Conquista completa · Firmas heredadas

### Alcance
Esta versión continúa exclusivamente desde v3.5.0. Se mantienen 20 mundos jugables, Saga II cerrada, historia estática desactivada, M1 sin carrito, DOMINIO, reliquias e Invocación de Guardianes. No se crea Mundo 21.

### Flota de Conquista · Fase II
La Flota pasa de 5 a 10 cascos. Se reutilizan únicamente assets ya presentes que son visualmente reconocibles como vehículos/cazas, evitando monstruos convertidos en nave y placeholders.

Hitos:
1. M1 · Lanza Meteórica — `mirrorShip`
2. M4 · Ala Astral Carmesí — `world4Enemy1`
3. M7 · Raya Abisal Vector — `world7Enemy3`
4. M9 · Kaiser Blade-Frame — `world9Subboss1`
5. M12 · Hadal Spear — `world12Enemy3`
6. M14 · Lanza Nova — `world14Ship`
7. M16 · Neuroarca Psiónica — `world16Ship`
8. M17 · Fenrir Cryo-Ship — `world17Ship`
9. M18 · Akasha Manga-Ship — `world18Ship`
10. M19 · Zhyr Disc — `world19Ship`

### Firmas mecánicas
Cada nave incorpora una firma automática de baja frecuencia (6.8–8.8 s) que complementa el disparo normal y no sustituye los poderes, DOMINIO ni Guardianes:
- Perforación del Núcleo: lanza cinética perforante.
- Corte Astral Gemelo: doble filo orbital + microfase.
- Onda de Presión: pulso corto con ralentización.
- Corte Multiversal: ráfaga de tres filos.
- Lanza de Presión: beam hadal + recuperación mínima de escudo.
- Pulso Nova: descarga radial.
- Cadena Sináptica: daño encadenado.
- Colmillo Criogénico: proyectil penetrante con hielo.
- Corte de Viñeta: cortes secuenciales.
- Agujas Psiónicas: proyectiles guiados.

En móvil se reduce el número de objetivos/proyectiles de las firmas que podrían saturar pantalla.

### Persistencia y migración
`fleetSignatureTimer` se guarda dentro del snapshot de la partida. `reconcileConquestRewards()` continúa siendo la única capa de migración de Flota/Guardianes: una partida antigua desbloquea automáticamente las naves correspondientes a mundos ya completados. No se modifica ni borra `bossShips`, DOMINIO, reliquias, `completedMaps`, Saga II ni los Guardianes invocables.

### Compatibilidad
La Flota sigue operando solamente cuando la forma activa es RIZOMA. Activar una forma DOMINIO no elimina ni reinicia la recarga de la Flota, evitando explotar cambios de forma para disparar firmas repetidamente.
