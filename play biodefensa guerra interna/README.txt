BioDefensa Guerra Interna v0.4.28 — Hub estable y arranque corregido

BioDefensa: Guerra Interna v0.4.18 — Mundo vivo e infección tisular

Cómo abrir:
1. Descomprime el ZIP.
2. Entra a la carpeta.
3. Abre index.html en navegador.

Cambios de esta versión:
- Pantallas enriquecidas con células y tejidos simbólicos según el bioma del nivel.
- Células móviles: respiratorias, intestinales, cutáneas, sanguíneas, inmunes o de tejido profundo según el escenario.
- El tejido cambia de color según carga infecciosa: sano, amarillo, verdoso, rojo y oscuro/necrosis simbólica en fases graves.
- Recursos como ATP, proteínas, ADN, ARN y memoria pueden activar microanticuerpos cooperadores temporales.
- Los microanticuerpos ayudan a proteger/reparar células dañadas y también apoyan con disparos menores.
- Se mantiene el motor de combate, niveles, laboratorio, perfiles, BioDex y aprendizaje adaptativo.
- El aprendizaje final explica que la representación es educativa y no consejo médico.

Base conceptual:
La representación diferencia virus, bacterias, hongos, parásitos, toxinas e inflamación y se mantiene como ficción educativa inspirada en inmunología básica y fuentes biomédicas confiables como CDC, NIH/NIAID, NCBI Bookshelf y OMS/WHO.


Correcciones v0.4.28:
- Se corrigió el arranque desde el botón principal para que no pase el evento de clic como número de nivel.
- currentLevel() y cellBiome() ahora tienen fallback seguro.
- Se corrigió ReferenceError: dmg is not defined en updateTissueCells().
- Se preservan Hub de niveles, logros, medallas, BioDex y campaña neuro/multisistémica.


Actualización v0.4.30
- Morfologías de patógenos más diversas según familia biológica.
- Mayor anidamiento celular sin saturación.
- Botón de laboratorio más compacto.

Actualización v0.4.31 — anticuerpos, BioDex inmune y capas tisulares
- Añade clases de anticuerpos IgM, IgG, IgA, IgE e IgD con funciones jugables diferenciadas.
- Amplía BioDex con entradas inmunológicas: anticuerpos, células inmunes, organelos y daño tisular.
- Integra capas simbólicas de daño tisular: inflamación, edema, necrosis y rescate.
- Añade eventos biológicos emergentes por microambiente: hipoxia simbólica, barrera intestinal/cutánea, neuroinflamación y riesgo séptico.
- Mantiene el motor, campaña, HUD, hub de niveles, logros, guardado y BioDex previo.


Versión v0.4.35 — estable sin demo
- Basada en la v0.4.31 estable.
- Se descarta el Modo Demo cinematográfico porque dejaba estado activo y afectaba la visual.
- Conserva laboratorio, BioDex inmune, anticuerpos por clases, daño tisular por capas, hub/logros si estaban en la base estable, y visual sobria.


Actualización v0.4.36
- Corrección visual del nivel 2: se reducen capas tisulares invasivas y se evita que parezcan fondos móviles activos.
- Se mantiene un único HTML estable; no se usa iframe ni segundo HTML para evitar problemas de rendimiento y origen file://.
- Reset defensivo de estado gráfico al iniciar o pasar de nivel.


Actualización v0.4.37
- Corrige ReferenceError: drawInfected is not defined.
- Evita que el loop de render se rompa al aparecer enemigos infectados o genéricos después del nivel 1.
- Mantiene base v0.4.36 sin demo ni fondos animados invasivos.


Actualización v0.4.38
- Corrige el problema del nivel 6: se agregó la función capsule() usada por el render de bacterias/bacilos.
- Adenovirus y jefes virales ahora se dibujan como virus, no como bacterias.
- Se endureció el catch del loop para que un error futuro no deje el juego vivo debajo del menú.


Actualización v0.4.39
- Macro-patógeno aparece entre 2 y 4 veces según el avance de campaña (nivel 1 conserva 1 aparición suave).
- HUD y cinta superior muestran porcentaje discreto de avance de misión, con posible retroceso si sube la infección.
- Instrucciones de misión más claras: patógeno objetivo, cómo actúa, condición de victoria y cantidad de macro-patógenos.
- ¿Sabías que? reforzado con datos históricos/biomédicos breves por patógeno, en clave educativa y no clínica.


Actualización v0.4.40
- Cierre de aprendizaje reforzado por nivel.
- Cada reporte final incluye agente, idea clave, dato para recordar, estrategia usada y cuidado/previsión.
- Mantiene base estable v0.4.39.


Actualización v0.5.0
- Expansión niveles 31–40: Archivo viral histórico.
- Nuevos virus: viruela, influenza 1918, VIH, SARS-CoV-2 pandémico, Ébola, rabia, Marburg, sarampión, fiebre amarilla y zoonosis emergentes.
- Objetivos, reportes y aprendizaje final ampliados para la nueva campaña.


v0.5.1 prueba expansión
- Agrega botón de inicio 'Probar expansión 31–40'.
- Permite abrir los niveles 31–40 desde el hub sin pasar los 30 anteriores.
- No desbloquea logros ni registros automáticamente; solo permite testear.


Actualización v0.5.2
- Robustez inmune acumulativa por nivel completado.
- Puntos de especialización: Ataque, Memoria, Reparación y Contención.
- Bono de memoria histórica viral para niveles 31–40.
- El jugador gana resistencia, integridad, daño, ATP y control de infección sin volverse invencible.


Actualización v0.5.3
- Recursos flotantes inteligentes: antígeno, interferón, plaquetas, oxígeno, anticuerpo aliado, memoria vacunal y cuidado sistémico.
- Ayudas adaptativas cuando baja la integridad, sube la infección o hay riesgo sistémico.
- Micro-misiones por nivel con recompensa inmediata.
- HUD e informe final muestran la micro-misión táctica.


Actualización v0.5.4
- Balance progresivo para niveles 31-40.
- Recursos flotantes más inteligentes por estado real del nivel.
- Ayudas de emergencia críticas.
- Micro-misiones más variadas en la expansión histórica.
- Lectura de jefe por fases: fase 1, fase 2 y mutación final.
- Premios por estrategia: micro-misión, células salvadas, infección baja y evitar necrosis.

Actualización v0.5.5
- Mapa inmune por sistemas.
- Prueba por bloques 1–10, 11–16, 17–22, 23–26, 27–30 y 31–40.
- Panel de prueba/desarrollo para saltar a nivel, dar recursos, marcar nivel y limpiar progreso local.
- Hub de niveles reconoce bloques de prueba sin alterar campaña normal.


Actualización v0.5.6
- Alertas tisulares aleatorias, no invasivas.
- Defensa breve de células, tejidos y órganos con flecha direccional.
- Penalización suave si se ignora y recompensa estratégica si se protege.
