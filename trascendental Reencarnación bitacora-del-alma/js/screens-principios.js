/* ============================================================
   PRINCIPIOS — síntesis divulgativa de las tradiciones en que
   se inspira la app. No se presenta como doctrina propia de la
   app ni como verdad objetiva, sino como resumen de fuentes reales.
   ============================================================ */

const PRINCIPIOS = [
  {
    titulo: 'El espíritu es inmortal y evoluciona',
    texto: 'Para Allan Kardec, sistematizador del espiritismo en El Libro de los Espíritus (1857), el ser humano es un espíritu que atraviesa sucesivas existencias corporales para perfeccionarse moral e intelectualmente.',
  },
  {
    titulo: 'El perispíritu conecta cuerpo y espíritu',
    texto: 'Kardec describe el perispíritu como un cuerpo semi-material que envuelve al espíritu y sirve de puente entre lo físico y lo espiritual — la base de muchas ideas posteriores sobre sensaciones o marcas heredadas de otra vida.',
  },
  {
    titulo: 'Cada vida se elige como aprendizaje',
    texto: 'La doctrina kardecista sostiene que el espíritu elige, con ayuda de guías, las pruebas que necesita atravesar en cada encarnación para avanzar en su desarrollo.',
  },
  {
    titulo: 'Los patrones se repiten hasta comprenderse',
    texto: 'Brian Weiss, psiquiatra estadounidense autor de Muchas vidas, muchos maestros (1988), relata que los comportamientos y vínculos afectivos tienden a repetirse a través de distintas vidas hasta que la persona los reconoce y los transforma.',
  },
  {
    titulo: 'El perdón cierra ciclos',
    texto: 'En el trabajo de Weiss, perdonar —a otros y a uno mismo— aparece como el mecanismo central para sanar heridas que de otro modo se repetirían de vida en vida.',
  },
  {
    titulo: 'Las almas afines vuelven a encontrarse',
    texto: 'Weiss describe que las almas profundamente unidas en una vida tienden a reencarnar cerca unas de otras en vidas siguientes, a veces bajo relaciones familiares distintas.',
  },
  {
    titulo: 'Existen guías que acompañan el proceso',
    texto: 'Tanto Kardec como Weiss describen la existencia de espíritus más evolucionados —"Maestros" o guías— que orientan a otros espíritus entre encarnaciones o en momentos de crisis.',
  },
  {
    titulo: 'La psicografía como vía de comunicación',
    texto: 'Chico Xavier (1910-2002), el médium más prolífico del espiritismo brasileño, sostenía escribir mensajes dictados por espíritus guía con nombre propio, como Emmanuel — un modelo de guía con identidad y biografía reencarnatoria propia.',
  },
  {
    titulo: 'La caridad como práctica central',
    texto: 'Chico Xavier donó las regalías de sus más de 400 libros a obras de beneficencia, coherente con la idea espírita de que el servicio y la compasión son parte esencial del avance espiritual.',
  },
  {
    titulo: 'La búsqueda de la verdad interior',
    texto: 'Amalia Domingo Soler (1835-1909), figura central del espiritismo español y autora de Memorias del Padre Germán, promovía en su obra la compasión, el perdón y la búsqueda de la verdad interior como camino de sanación.',
  },
  {
    titulo: 'El universo está habitado por infinidad de mundos',
    texto: 'En Le Livre des Esprits (1857), Kardec dedica una sección a la pluralidad de mundos habitados: los espíritus encarnan en distintos mundos según su grado de avance material y moral — la Tierra sería uno de tantos, ni el más atrasado ni el más evolucionado.',
  },
  {
    titulo: 'El libre albedrío no queda anulado por el karma',
    texto: 'Entre las leyes morales que Kardec sistematiza en el Libro Tercero de Le Livre des Esprits está la Ley de Libertad: cada espíritu conserva su libre albedrío. Las consecuencias de los actos no son un destino fijo, sino el resultado de decisiones tomadas con libertad.',
  },
  {
    titulo: 'La caridad como eje moral central',
    texto: 'La Ley de Justicia, Amor y Caridad es otra de las leyes fundamentales del mismo Libro Tercero de Kardec. Ese principio inspiró directamente la práctica de Chico Xavier, que donó las regalías de sus libros, y de Amalia Domingo Soler, defensora de la compasión como camino espiritual.',
  },
];

registerRoute('principios', (s)=>{
  s.innerHTML = `
    <div class="eyebrow">Para entender mejor</div>
    <h2>13 principios de estas tradiciones</h2>
    <div class="spacer-sm"></div>
    <p class="body-text muted">Síntesis divulgativa de 13 ideas que postulan cuatro figuras del espiritismo y de la literatura sobre reencarnación: Allan Kardec, Brian Weiss, Chico Xavier y Amalia Domingo Soler. Es un resumen de lo que estas fuentes reales afirman — no una doctrina que esta app promueva como verdad, ni evidencia científica de reencarnación.</p>
    <div class="spacer-md"></div>
    <div id="principios-list"></div>
  `;
  const list = s.querySelector('#principios-list');
  PRINCIPIOS.forEach((p,i)=>{
    const card = document.createElement('div');
    card.className = 'option-card';
    card.style.cursor = 'default';
    card.innerHTML = `
      <div class="ocard-title">${i+1}. ${esc(p.titulo)}</div>
      <div class="ocard-sub" style="margin-top:6px; line-height:1.5;">${esc(p.texto)}</div>
    `;
    list.appendChild(card);
  });
  navFooter(s, [
    { label:'Volver', variant:'btn-ghost', onClick: ()=> go('home') },
  ]);
});
