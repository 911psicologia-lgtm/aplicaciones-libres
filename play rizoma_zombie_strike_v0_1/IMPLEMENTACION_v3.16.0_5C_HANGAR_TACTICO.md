# Rizoma Zombie Strike v3.16.0 — Paso 5C + Hangar Táctico

## 5C · Balance individual de Flota de Conquista
La Flota de Conquista fue revisada nave por nave. Cada casco posee ahora un rol táctico explícito, una ventaja principal y una renuncia. El objetivo es evitar una progresión lineal en la que la última nave sea automáticamente la mejor en todo.

### Roles finales
- M1 · Lanza Meteórica — **Cazajefes**: perforación y daño focal; sacrifica parte del escudo.
- M4 · Ala Astral Carmesí — **Duelista**: movilidad y microfase; menor protección.
- M7 · Raya Abisal Vector — **Control**: ralentización y espacio; daño directo reducido.
- M9 · Kaiser Blade-Frame — **Burst**: ráfaga precisa; escudo menor.
- M12 · Hadal Spear — **Defensa**: escudo y presión; movilidad menor.
- M14 · Lanza Nova — **Área**: limpieza radial; velocidad menor.
- M16 · Neuroarca Psiónica — **Cadena**: multiblanco y control; blindaje menor.
- M17 · Fenrir Cryo-Ship — **Movilidad**: cacería y criocontrol; escudo algo menor.
- M18 · Akasha Manga-Ship — **Crítico**: ráfaga precisa y fase; fragilidad a saturación.
- M19 · Zhyr Disc — **Precisión**: guiado y control selectivo; daño bruto moderado.

También se reajustaron cooldowns y daño de firma para reforzar esos roles sin invalidar las resonancias introducidas en v3.15.0.

## 6 · Hangar Táctico reconstruido
El antiguo hangar permanecía oculto desde versiones previas. En v3.16.0 no se restaura el panel viejo: se construye un **Hangar Táctico nuevo**, conectado al Centro de mando.

### Bahía central
Muestra el casco realmente preparado para la próxima salida:
- Nave Rizoma o Flota de Conquista.
- Núcleo Rizoma que determina la resonancia.
- Guardián invocable seleccionado.
- contexto de la próxima misión.

### Comparador táctico
Compara la configuración preparada con la recomendación automática en cuatro ejes:
- daño,
- velocidad,
- escudo,
- cadencia.

### Recomendación contextual
El hangar analiza:
- próximo mundo disponible,
- dificultad,
- Naves Rizoma desbloqueadas,
- Flota conquistada,
- resonancias disponibles,
- Guardianes invocables.

La recomendación puede aplicarse con un único botón, pero no se impone al jugador.

### Doctrinas / presets
Se incorporan presets:
- Auto,
- Equilibrado,
- Asalto,
- Control,
- Supervivencia,
- Cazajefes.

Cada preset puede guardar la configuración actual de:
- Nave Rizoma,
- nave de Flota,
- Guardián invocable.

Los presets guardados son persistentes y pueden cargarse posteriormente.

### Módulos permanentes
El hangar vuelve a mostrar el estado real de:
- Motor,
- Alerones,
- Cañón,
- Núcleo.

No compra ni regala mejoras: solo muestra la progresión estructural ya conseguida.

### Selección de Naves Rizoma
Las seis Naves Rizoma se muestran con:
- fase,
- rol,
- habilidad propia,
- pasiva,
- estadísticas,
- estado de núcleo/activa/bloqueada.

### Flota de Conquista
Las diez naves muestran:
- mundo de conquista,
- rol 5C,
- firma,
- cooldown efectivo con resonancia,
- ventaja,
- renuncia,
- resonancia con la Nave Rizoma preparada.

### Guardianes
El Hangar permite cambiar rápidamente el Guardián invocable ya desbloqueado.

## Compatibilidad
- 20 mundos preservados.
- Mundo 21 no creado.
- DOMINIO preservado.
- Invocación de Guardianes preservada.
- playlist ambiental preservada.
- historia estática continúa desactivada.
- selección de nave sigue siendo segura para la siguiente salida; no se habilita hot-swap durante combate.
