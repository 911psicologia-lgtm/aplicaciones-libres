# CHANGELOG · v1.7.0 · Lectura Autónoma + Escritura Responsive

- Frases Vivas incorpora retirada adaptativa del modelo sonoro: solo el nivel de apoyo conserva modelado completo inicial.
- En crecimiento/confianza, completar, ordenar, leer y escribir frases prioriza el intento visual antes de usar el oído.
- Nueva pista infantil mínima “👀 primero tú → 👂” para explicar la retirada de apoyo sin texto largo.
- Escritura de frases responsive: tablet/PC conserva lienzo completo; celular usa una ventana palabra por palabra con la frase global siempre visible.
- El trazador de palabra puede preservar mayúsculas cuando se usa dentro de una frase; el punto final sigue como estructura gráfica explícita.
- El uso voluntario del audio y de la pista visual queda registrado como apoyo; no se penaliza.
- Zona adulta añade señales descriptivas de intentos de lectura de frases sin/con ayuda y producción escrita de frases.
- Se preservan mundos, currículo, assets, progreso local, Tinta Mágica, Palabra Secreta, Gemas Lingüísticas, Rompecabezas y Ruta de puntos.

# v1.5.0 · Tinta Mágica + Palabra Secreta + Gemas Lingüísticas

- Añade Tinta Mágica para grafemas ya conquistados, con mayúscula/minúscula y máscara de tinta dorada dentro de la letra.
- Añade Palabra Secreta de Lumi con pista visual y ortografía constructiva no punitiva.
- Añade Gemas Lingüísticas en Mis tesoros con contenido legible y audio categorizado.
- Mantiene íntegros los sistemas y datos de progreso previos.

## v1.4.0 · Lectoescritura productiva inicial
- Nueva actividad **mayúscula ↔ minúscula** para letras simples ya enseñadas, sin adelantar grafemas futuros.
- Frases Vivas añade una quinta fase productiva cuando existe un objetivo apto: escribir con el dedo una frase corta de 2–3 palabras.
- Se incorporan 7 objetivos iniciales de escritura de frase, todos ligados a mundos ya aprendidos.
- El trazado de frase admite ayuda visual opcional, registra uso de ayuda y exige evidencia motriz mínima antes de permitir completar; no puntúa “bonita/fea” la letra.
- Frases modeladas y leídas muestran inicio en mayúscula y punto final para introducir estructura gráfica de oración sin explicación gramatical extensa.
- Gemas de vocales/sílabas por sendero: diamante claro, rubí, esmeralda y amatista; la vocal/sílaba pasa a ser el elemento visual dominante.
- Responsive específico para el lienzo de frase: área amplia en tablet y compactación controlada en celular.
- Se conserva el esquema de progreso y no se añaden mundos, historias ni grafemas nuevos.

## v1.3.0 · Álbum por senderos y vocales visibles
- El mundo de Vocales deja de aparecer como una sola ficha A·E·I·O·U: A, E, I, O y U se muestran como cinco conquistas independientes, reutilizando los cinco assets existentes.
- El Álbum se organiza visualmente por los cuatro senderos para que el progreso tenga continuidad espacial con el mapa.
- La última letra o patrón conquistado recibe un destello breve; `prefers-reduced-motion` lo desactiva.
- El patrón del tercer sendero se rotula R·RR en el Álbum para reflejar el contraste curricular ya existente.
- Se preservan mundos, misiones, habilidades, historias, Rescate adaptativo, progreso local y assets aprobados.
- Sin cambios de esquema de estado ni migración: los perfiles v1.2.0 continúan cargando con la misma clave local.

## v1.2.0 · Rescate adaptativo y Álbum de letras
- Nuevo modo **Rescate de palabras**: 3 actividades de habilidades ya aprendidas que conviene recuperar, priorizando variedad de mecánica y debilidad real.
- Si las 3 se resuelven con independencia, la racha abre un cofre usando el sistema de tesoros existente.
- Ajuste de ayuda por confianza: en repasos consolidados se retiran pistas gestuales y ciertas consignas dejan de reproducirse automáticamente; el oído permanece disponible.
- Nuevo **Álbum de letras conquistadas** dentro de Mis tesoros: letras/patrones completados encendidos y pendientes dormidos, sin porcentajes complejos.
- Las estrellas de tesoro ahora producen destellos dorados crecientes en el bosque: la recompensa modifica visualmente el mapa.
- Acceso rápido al Rescate desde el bosque y desde Práctica inteligente cuando hay contenido suficiente.
- Sin nuevas letras ni assets; se preservan cuentos mágicos, progresión y contenido existente.


## 0.9.9 · Orientación Infantil
- Árbol de salida siempre visible en la barra superior del cuento.
- Al terminar el cuento, el árbol se resalta y aparece una pista gestual animada.
- Se elimina el botón de bosque del final inferior: la salida se enseña arriba de forma consistente.
- Mundos terminados reciben check grande, aro verde y estado visual persistente; el último completado se anima al volver.
- Al terminar una misión, el mapa regresa al mismo sendero donde se completó.
- Consignas de vocales y sílabas reducidas a una única instrucción corta: escuchar y tocar.

## v0.9.6 · Gestos intuitivos y lectura guiada
- Pantalla de resultado simplificada: progreso, cofre y regreso principal al bosque.
- El libro del bosque pulsa si existe un cuento nuevo pendiente.
- Botón grande “Leer cuento” antes del texto.
- Lectura guiada palabra por palabra con animación de letras sincronizada.
- Consignas de sílabas y gemas más breves.
- Preguntas finales con reintento suave sin reconstruir la pantalla.
- Microvibración opcional en dispositivos compatibles y respeto por `prefers-reduced-motion`.

## 0.9.4 · Balance pedagógico
- Director de variedad para alternar escucha, reconocimiento, trazo, construcción y lectura.
- Variantes reinsertadas en su posición curricular declarada, evitando que frases aparezcan antes de tiempo.
- Repasos espaciados dentro de la misión: recuperación inicial + recuperación intermedia.
- Reducción de rachas largas de la misma familia de actividad cuando existen alternativas.
- Selección de variantes con criterio adicional de diversidad de mecánica.
- Sin cambios en assets ni expansión curricular.

## 0.9.3 · Ritmo de sesión
- Microtramos de 4 actividades en misiones largas.
- Pausa segura con continuar / guardar / salir.
- Indicador infantil por tramos y menor énfasis en el total.
- Cuento desbloqueado priorizado como transición narrativa.
- Continuación directa cuento → siguiente aventura.
- Sin cambios en assets ni en la secuencia curricular.

# CHANGELOG · v0.9.2 · Tercer sendero por patrones

- Profundización de Ñ, CH, QU, R/RR, CE/CI y GE/GI.
- 6 habilidades nuevas de lectura de frase.
- 37 actividades nuevas dentro de las misiones del tercer sendero respecto a v0.9.1.
- 6 nuevas Escaleras de escritura: NIÑA, LECHE, QUESO, PERRO, CINE y GEMA.
- 6 nuevas Frases Vivas asociadas a esos mundos.
- 6 refuerzos de frase incorporados a Semillas que vuelven.
- Cuento propio desbloqueable para cada uno de los seis mundos y un cuento final integrador.
- QU ya no usa CE/GE como distractores antes de ser enseñados.
- GE/GI ya no usa GUE/GUI como distractores; ese patrón permanece reservado para una etapa posterior.
- R/RR incorpora contraste PERO/PERRO y CARO/CARRO.
- CE/CI compara CA·CO·CU con CE·CI; GE/GI compara GA·GO·GU con GE·GI.
- PWA y exportación de progreso actualizadas a 0.9.2.

## 0.9.8 · Gestos y Espacio
- Mecánicas visualmente diferenciadas mediante pistas gestuales discretas.
- Arrastre opcional para construir palabras y ordenar frases, conservando toque como alternativa.
- Mejoras responsive de espacio, tarjetas y destinos.
- Sin cambios de currículo ni assets.
