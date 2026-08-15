/**
 * ============================================================================
 * CARTILLA AVENTURA MINECRAFT — Base de Datos de Preguntas
 * ============================================================================
 * Evaluación gamificada para niños colombianos de 8 años (grado 4)
 * Basada en la prueba SAI Prueba Punto C
 *
 * Estructura: 5 áreas × 4 misiones × 5 preguntas = 100 preguntas totales
 *
 * Áreas evaluadas:
 *   1. Inglés
 *   2. Lenguaje
 *   3. Matemáticas
 *   4. Ciencias Naturales y Educación Ambiental
 *   5. Sociales y Ciudadanas
 * ============================================================================
 */

const QUESTIONS_DB = {
  "ingles": {
    "id": "ingles",
    "name": "Inglés",
    "biome": "The End",
    "icon": "🕷️",
    "color": "#1a0a2e",
    "accentColor": "#c084fc",
    "resource": "Ender Pearls",
    "resourceIcon": "🟣",
    "missions": [
      {
        "id": "ingles_m1",
        "name": "Misión 1: Palabras del Other Side",
        "questions": [
          {
            "id": 1,
            "type": "image-word",
            "instruction": "Observa la imagen y selecciona la palabra correcta en inglés.",
            "image": null,
            "imageDesc": "Person with wavy/kinky curly hair",
            "stem": "What type of hair is shown in the picture?",
            "options": [
              "A. Curly",
              "B. Straight",
              "C. Blonde",
              "D. Short"
            ],
            "correct": 0,
            "xp": 8,
            "hint": "Piensa en el tipo de cabello que tiene rizos."
          },
          {
            "id": 2,
            "type": "image-word",
            "instruction": "Look at the picture and choose the correct word.",
            "image": null,
            "imageDesc": "A person with brown skin and dark straight hair",
            "stem": "What color is the person's hair?",
            "options": [
              "A. Red",
              "B. Blonde",
              "C. Black",
              "D. White"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Es el color más oscuro de cabello."
          },
          {
            "id": 3,
            "type": "image-word",
            "instruction": "Observa la imagen y elige la palabra en inglés.",
            "image": null,
            "imageDesc": "A boy wearing glasses",
            "stem": "What is the boy wearing on his face?",
            "options": [
              "A. A hat",
              "B. Glasses",
              "C. A mask",
              "D. Earrings"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Son dos lentes conectados por un puente."
          },
          {
            "id": 4,
            "type": "image-word",
            "instruction": "Look at the image and select the correct word.",
            "image": null,
            "imageDesc": "A tall building with many windows in a city",
            "stem": "What type of building is this?",
            "options": [
              "A. A house",
              "B. A hospital",
              "C. A skyscraper",
              "D. A school"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Es un edificio muy alto que se ve en las ciudades grandes."
          },
          {
            "id": 5,
            "type": "image-word",
            "instruction": "Observa la imagen y elige la opción correcta.",
            "image": null,
            "imageDesc": "A family of four: father, mother, son, and daughter eating lunch",
            "stem": "How many people are in this family?",
            "options": [
              "A. Two",
              "B. Three",
              "C. Five",
              "D. Four"
            ],
            "correct": 3,
            "xp": 10,
            "hint": "Cuenta a cada persona: papá, mamá, hijo e hija."
          }
        ]
      },
      {
        "id": "ingles_m2",
        "name": "Misión 2: Carteles del Nether",
        "questions": [
          {
            "id": 6,
            "type": "sign-matching",
            "instruction": "Read the sign and choose the correct location.",
            "image": null,
            "imageDesc": "A sign that reads: RESTAURANT - Food and Drinks",
            "stem": "Where can you find this sign?",
            "options": [
              "A. At school",
              "B. At a restaurant",
              "C. At the park",
              "D. At home"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Es un lugar donde vas a comer."
          },
          {
            "id": 7,
            "type": "sign-matching",
            "instruction": "Lee la señal y selecciona el lugar correcto.",
            "image": null,
            "imageDesc": "A sign that reads: HOSPITAL - Emergency Room",
            "stem": "Where would you see this sign?",
            "options": [
              "A. In a library",
              "B. In a hospital",
              "C. In a supermarket",
              "D. In a park"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Es un lugar donde van los enfermos."
          },
          {
            "id": 8,
            "type": "sign-matching",
            "instruction": "Read the signs and match the location.",
            "image": null,
            "imageDesc": "A sign that reads: SILENCE PLEASE - Library Zone",
            "stem": "What should you do in this place?",
            "options": [
              "A. Run and shout",
              "B. Be quiet",
              "C. Eat food",
              "D. Play soccer"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Silencio significa que no debes hacer ruido."
          },
          {
            "id": 9,
            "type": "sign-matching",
            "instruction": "Observa las señales y elige la respuesta correcta.",
            "image": null,
            "imageDesc": "A sign that reads: EXIT with an arrow pointing right",
            "stem": "What does this sign mean?",
            "options": [
              "A. Enter here",
              "B. Danger ahead",
              "C. Way out",
              "D. Stop here"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Exit en inglés significa salida."
          },
          {
            "id": 10,
            "type": "sign-matching",
            "instruction": "Read the signs and choose the correct answer.",
            "image": null,
            "imageDesc": "Two signs: one reads PUSH, the other reads PULL",
            "stem": "If a door says PULL, what should you do?",
            "options": [
              "A. Push the door",
              "B. Pull the door toward you",
              "C. Don't touch the door",
              "D. Wait for someone"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Pull significa jalar hacia ti."
          }
        ]
      },
      {
        "id": "ingles_m3",
        "name": "Misión 3: Diálogos del Villager",
        "questions": [
          {
            "id": 11,
            "type": "dialogue",
            "instruction": "Completa el diálogo con la opción correcta.",
            "image": null,
            "imageDesc": "Two children greeting each other",
            "stem": "—Hello! My name is Carlos. ___?\n—Hi Carlos! I am María.",
            "options": [
              "A. How old are you",
              "B. What is your name",
              "C. Where are you from",
              "D. What time is it"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Carlos dice su nombre, así que pregunta el nombre del otro."
          },
          {
            "id": 12,
            "type": "dialogue",
            "instruction": "Complete the dialogue with the correct option.",
            "image": null,
            "imageDesc": "A child asking about age",
            "stem": "—How old are you, Sofía?\n—___",
            "options": [
              "A. I am nine years old",
              "B. My name is Sofía",
              "C. I am from Colombia",
              "D. I like pizza"
            ],
            "correct": 0,
            "xp": 8,
            "hint": "La pregunta es sobre la edad."
          },
          {
            "id": 13,
            "type": "dialogue",
            "instruction": "Completa el diálogo seleccionando la respuesta correcta.",
            "image": null,
            "imageDesc": "Two friends talking about food",
            "stem": "—Do you like arepas?\n—Yes, ___.",
            "options": [
              "A. I do",
              "B. I am",
              "C. I can",
              "D. I have"
            ],
            "correct": 0,
            "xp": 9,
            "hint": "Para responder \"Do you...?\" usamos \"Yes, I do.\""
          },
          {
            "id": 14,
            "type": "dialogue",
            "instruction": "Read the dialogue and choose the correct option.",
            "image": null,
            "imageDesc": "A child asking for directions",
            "stem": "—Excuse me, where is the bathroom?\n—It is ___ the library.",
            "options": [
              "A. between",
              "B. under",
              "C. next to",
              "D. behind"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Next to significa \"al lado de\"."
          },
          {
            "id": 15,
            "type": "dialogue",
            "instruction": "Completa la conversación con la mejor opción.",
            "image": null,
            "imageDesc": "A teacher talking to a student in class",
            "stem": "—What day is it today?\n—Today is ___.",
            "options": [
              "A. March",
              "B. Monday",
              "C. Morning",
              "D. Winter"
            ],
            "correct": 1,
            "xp": 11,
            "hint": "La pregunta es sobre el día de la semana."
          }
        ]
      },
      {
        "id": "ingles_m4",
        "name": "Misión 4: El Libro de los Encantamientos",
        "questions": [
          {
            "id": 16,
            "type": "reading-fill",
            "instruction": "Lee el texto y completa con la palabra correcta.",
            "image": null,
            "imageDesc": "A short text about a pet dog",
            "stem": "My ___ is Max. He is a big dog. He likes to ___ in the park.",
            "options": [
              "A. cat / sleep",
              "B. dog / play",
              "C. bird / fly",
              "D. fish / swim"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Max es un nombre común para perros y le gusta ir al parque."
          },
          {
            "id": 17,
            "type": "reading-fill",
            "instruction": "Read the text and choose the correct word.",
            "image": null,
            "imageDesc": "A Colombian child doing their morning routine",
            "stem": "Every morning, I ___ up at six o'clock. I ___ breakfast with my family.",
            "options": [
              "A. wake / eat",
              "B. go / make",
              "C. stand / cook",
              "D. sit / buy"
            ],
            "correct": 0,
            "xp": 9,
            "hint": "Wake up significa despertar y eat significa comer."
          },
          {
            "id": 18,
            "type": "reading-fill",
            "instruction": "Lee el texto y elige la opción que completa correctamente.",
            "image": null,
            "imageDesc": "A text about school subjects",
            "stem": "My favorite ___ is English. I like it because the ___ is very fun.",
            "options": [
              "A. food / dog",
              "B. sport / ball",
              "C. class / teacher",
              "D. game / player"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Se habla de una clase y de la persona que la enseña."
          },
          {
            "id": 19,
            "type": "reading-comprehension",
            "instruction": "Read the text and answer the question.",
            "image": null,
            "imageDesc": "A text about a family trip to Cartagena",
            "stem": "María lives in Bogotá. Last vacation, she went to Cartagena with her family. They swam in the sea and ate coconuts. María was very happy.\n\nWhere did María go on vacation?",
            "options": [
              "A. Bogotá",
              "B. Medellín",
              "C. Cartagena",
              "D. Santa Marta"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Busca el nombre del lugar de vacaciones en el texto."
          },
          {
            "id": 20,
            "type": "reading-comprehension",
            "instruction": "Read the text and choose the correct answer.",
            "image": null,
            "imageDesc": "A text about seasons and weather in Colombia",
            "stem": "In Colombia, some places are hot all year. The Caribbean coast is sunny and warm. But in the mountains, it can be cold and rainy.\n\nHow is the weather in the Caribbean coast?",
            "options": [
              "A. Cold and snowy",
              "B. Hot and sunny",
              "C. Rainy and dark",
              "D. Windy and dry"
            ],
            "correct": 1,
            "xp": 11,
            "hint": "El texto dice que la costa Caribe es sunny and warm."
          }
        ]
      }
    ]
  },
  "lenguaje": {
    "id": "lenguaje",
    "name": "Lenguaje",
    "biome": "Llanuras",
    "icon": "📚",
    "color": "#1a3a1a",
    "accentColor": "#4ade80",
    "resource": "Libros Encantados",
    "resourceIcon": "📗",
    "missions": [
      {
        "id": "lenguaje_m1",
        "name": "Misión 1: Pósters de la Aldea",
        "questions": [
          {
            "id": 21,
            "type": "poster-analysis",
            "instruction": "Observa el póster y responde la pregunta.",
            "image": null,
            "imageDesc": "A poster: CUIDA EL AGUA - Cierra la llave cuando te cepilles los dientes",
            "stem": "¿Cuál es el propósito principal de este póster?",
            "options": [
              "A. Vender agua embotellada",
              "B. Invitar a nadar en el río",
              "C. Invitar a cuidar y ahorrar agua",
              "D. Anunciar un juego de agua"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Piensa en qué mensaje quiere dar el póster sobre el agua."
          },
          {
            "id": 22,
            "type": "poster-analysis",
            "instruction": "Lee el póster y selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A poster: FERIA DEL LIBRO - Viernes 15 de noviembre - Biblioteca escolar",
            "stem": "¿Dónde se realizará la Feria del Libro?",
            "options": [
              "A. En el parque",
              "B. En la biblioteca escolar",
              "C. En la tienda",
              "D. En el auditorio"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Busca la palabra que indica el lugar en el póster."
          },
          {
            "id": 23,
            "type": "poster-analysis",
            "instruction": "Observa el póster y responde.",
            "image": null,
            "imageDesc": "A poster about recycling: Verde=Orgánicos, Azul=Reciclaje, Negro=No reciclable",
            "stem": "Si tienes una cáscara de plátano, ¿en qué caneca la depositas?",
            "options": [
              "A. Caneca verde",
              "B. Caneca azul",
              "C. Caneca negra",
              "D. Ninguna caneca"
            ],
            "correct": 0,
            "xp": 9,
            "hint": "La cáscara de plátano es residuo orgánico."
          },
          {
            "id": 24,
            "type": "poster-analysis",
            "instruction": "Analiza el póster y elige la respuesta correcta.",
            "image": null,
            "imageDesc": "A school schedule: Lunes=Mate y Español, Martes=Ciencias e Inglés, Miércoles=Sociales y Ed. Física",
            "stem": "¿Qué materias se tienen el martes según el horario?",
            "options": [
              "A. Matemáticas y Español",
              "B. Ciencias e Inglés",
              "C. Sociales y Educación Física",
              "D. Arte y Música"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Busca la palabra \"Martes\" en el póster."
          },
          {
            "id": 25,
            "type": "poster-analysis",
            "instruction": "Lee el póster y contesta la pregunta.",
            "image": null,
            "imageDesc": "A vaccination campaign poster: JORNADA DE VACUNACIÓN - Niños de 5 a 12 años",
            "stem": "¿Quiénes pueden asistir a esta jornada de vacunación?",
            "options": [
              "A. Adultos mayores",
              "B. Niños de 5 a 12 años",
              "C. Bebés de 1 año",
              "D. Todas las personas"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Busca el rango de edad mencionado en el póster."
          }
        ]
      },
      {
        "id": "lenguaje_m2",
        "name": "Misión 2: El Diario del Explorador",
        "questions": [
          {
            "id": 26,
            "type": "reading-comprehension",
            "instruction": "Lee el texto y responde la pregunta.",
            "image": null,
            "imageDesc": "A diary entry about a trip to the countryside",
            "stem": "Hoy fui a la finca de mi abuelo. Vi vacas, caballos y cerdos. Mi abuela me preparó sancocho para el almuerzo. Fue el mejor día de mi semana.\n\n¿Qué comió el niño en la finca?",
            "options": [
              "A. Arepas",
              "B. Sancocho",
              "C. Bandeja paisa",
              "D. Ajiaco"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Busca la palabra que describe la comida en el texto."
          },
          {
            "id": 27,
            "type": "reading-comprehension",
            "instruction": "Lee el siguiente texto y contesta.",
            "image": null,
            "imageDesc": "A story about a pet parrot named Lorenzo",
            "stem": "Lorenzo es un loro verde que vive en el patio de mi casa. Cada mañana canta muy fuerte y despierta a toda la familia. A Lorenzo le gusta comer frutas, especialmente mango y papaya.\n\n¿Qué le gusta comer a Lorenzo?",
            "options": [
              "A. Pan y queso",
              "B. Semillas y agua",
              "C. Mango y papaya",
              "D. Carne y arroz"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "El texto menciona las frutas que le gustan al loro."
          },
          {
            "id": 28,
            "type": "reading-comprehension",
            "instruction": "Observa el texto y elige la opción correcta.",
            "image": null,
            "imageDesc": "A fable about a tortoise and a rabbit",
            "stem": "La liebre corría muy rápido y se burlaba de la tortuga por ser lenta. —¡Yo soy la más veloz! —decía. Pero la tortuga, con paciencia y sin detenerse, llegó primero a la meta.\n\n¿Cuál es la enseñanza de esta fábula?",
            "options": [
              "A. Correr rápido siempre gana",
              "B. La paciencia y la constancia son importantes",
              "C. Las liebres son mejores que las tortugas",
              "D. No hay que participar en carreras"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Piensa qué virtud demostró la tortuga para ganar."
          },
          {
            "id": 29,
            "type": "reading-comprehension",
            "instruction": "Lee la noticia y responde.",
            "image": null,
            "imageDesc": "A news article about a new park in Medellín",
            "stem": "En Medellín inauguraron un nuevo parque público con juegos para niños, canchas deportivas y muchos árboles. El alcalde dijo que este espacio es para que todas las familias disfruten de la naturaleza en la ciudad.\n\n¿Para qué fue creado el nuevo parque?",
            "options": [
              "A. Para construir edificios",
              "B. Para que las familias disfruten de la naturaleza",
              "C. Para hacer un estadio de fútbol",
              "D. Para vender lotes de terreno"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Lee lo que dijo el alcalde sobre el propósito del parque."
          },
          {
            "id": 30,
            "type": "reading-comprehension",
            "instruction": "Lee el poema y contesta la pregunta.",
            "image": null,
            "imageDesc": "A short poem about the rainforest",
            "stem": "Bosque verde, bosque grande,\nlleno de vida y cantores,\ndonde el viento entre las hojas\nhace música de colores.\n\n¿Qué hace el viento entre las hojas según el poema?",
            "options": [
              "A. Rompe las ramas",
              "B. Hace música de colores",
              "C. Apaga los árboles",
              "D. Lleva las hojas lejos"
            ],
            "correct": 1,
            "xp": 11,
            "hint": "Busca la última línea del poema."
          }
        ]
      },
      {
        "id": "lenguaje_m3",
        "name": "Misión 3: Runas Gramaticales",
        "questions": [
          {
            "id": 31,
            "type": "grammar",
            "instruction": "Elige la opción que complete correctamente la oración.",
            "image": null,
            "imageDesc": "A sentence with a blank space",
            "stem": "Los niños ___ jugar en el parque todos los días.",
            "options": [
              "A. gustan",
              "B. gusta",
              "C. gustan de",
              "D. le gusta"
            ],
            "correct": 0,
            "xp": 8,
            "hint": "Cuando el sujeto es plural (los niños), el verbo debe ser plural."
          },
          {
            "id": 32,
            "type": "grammar",
            "instruction": "Selecciona la palabra que complete correctamente.",
            "image": null,
            "imageDesc": "A sentence about a female friend",
            "stem": "Mi amiga Ana ___ muy simpática e inteligente.",
            "options": [
              "A. son",
              "B. es",
              "C. eres",
              "D. somos"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Ana es una sola persona, así que usamos el verbo ser para él/ella."
          },
          {
            "id": 33,
            "type": "grammar",
            "instruction": "Elige la forma correcta del verbo.",
            "image": null,
            "imageDesc": "A sentence about going to school",
            "stem": "Ayer yo ___ a la escuela en bicicleta.",
            "options": [
              "A. voy",
              "B. iré",
              "C. fui",
              "D. iba"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "La palabra \"ayer\" indica que la acción ya pasó (pasado)."
          },
          {
            "id": 34,
            "type": "grammar",
            "instruction": "Selecciona la opción que complete bien la oración.",
            "image": null,
            "imageDesc": "A sentence requiring an adjective",
            "stem": "Las flores del jardín de mi abuela son ___ que las del parque.",
            "options": [
              "A. más bonitas",
              "B. más bonito",
              "C. menos bonita",
              "D. muy bonito"
            ],
            "correct": 0,
            "xp": 10,
            "hint": "Las flores son femenino plural, así que el adjetivo debe concordar."
          },
          {
            "id": 35,
            "type": "grammar",
            "instruction": "Elige el sinónimo correcto de la palabra resaltada.",
            "image": null,
            "imageDesc": "A word and four synonym options",
            "stem": "La palabra GRANDE tiene como sinónimo:",
            "options": [
              "A. Pequeño",
              "B. Enorme",
              "C. Delgado",
              "D. Corto"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Un sinónimo es una palabra que significa lo mismo."
          }
        ]
      },
      {
        "id": "lenguaje_m4",
        "name": "Misión 4: Crónicas del Bioma",
        "questions": [
          {
            "id": 36,
            "type": "text-interpretation",
            "instruction": "Lee el texto y responde.",
            "image": null,
            "imageDesc": "A recipe for Colombian arepas",
            "stem": "Para hacer arepas necesitas: 2 tazas de harina de maíz, 1 taza de agua, sal al gusto y un poco de aceite. Mezcla todo, haz bolitas y aplástalas. Luego cocínalas en un sartén caliente.\n\n¿Cuál es el primer paso para hacer arepas?",
            "options": [
              "A. Cocinarlas en el sartén",
              "B. Hacer bolitas y aplastarlas",
              "C. Mezclar los ingredientes",
              "D. Agregar queso"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "El primer paso siempre es preparar o mezclar los ingredientes."
          },
          {
            "id": 37,
            "type": "text-interpretation",
            "instruction": "Lee el texto y selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "An informational text about the Andean condor",
            "stem": "El cóndor de los Andes es el ave voladora más grande del mundo. Puede medir hasta 3 metros con las alas abiertas. Vive en las montañas altas de los Andes, desde Venezuela hasta Argentina. Es un símbolo de libertad.\n\n¿Cuánto puede medir el cóndor con las alas abiertas?",
            "options": [
              "A. 1 metro",
              "B. 2 metros",
              "C. 3 metros",
              "D. 5 metros"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "Busca el número que indica la medida en el texto."
          },
          {
            "id": 38,
            "type": "text-interpretation",
            "instruction": "Observa el texto y elige la opción correcta.",
            "image": null,
            "imageDesc": "A letter from a child to a friend",
            "stem": "Querido Andrés: Te escribo para contarte que me mudé a una nueva casa. Está cerca del río y hay muchos árboles. ¡Ven a visitarme algún fin de semana! Tu amigo, Camilo.\n\n¿Por qué le escribe Camilo a Andrés?",
            "options": [
              "A. Para pedirle un favor",
              "B. Para contarle que se mudó",
              "C. Para invitarlo a su cumpleaños",
              "D. Para pedirle un libro"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Lee la primera oración de la carta para encontrar la razón."
          },
          {
            "id": 39,
            "type": "text-interpretation",
            "instruction": "Lee el texto y responde la pregunta.",
            "image": null,
            "imageDesc": "A short story about a lost puppy",
            "stem": "El perrito se perdió en el mercado. Estaba asustado y no encontraba a su dueña. Una niña llamada Valentina lo vio, le dio agua y lo llevó a la caseta de animales perdidos. Cuando la dueña llegó, estaba muy agradecida.\n\n¿Qué hizo Valentina cuando encontró al perrito?",
            "options": [
              "A. Se lo llevó a su casa",
              "B. Le dio agua y lo llevó a la caseta",
              "C. Ignoró al perrito",
              "D. Llamó a la policía"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Busca las acciones que realizó Valentina en el texto."
          },
          {
            "id": 40,
            "type": "text-interpretation",
            "instruction": "Lee el texto y contesta.",
            "image": null,
            "imageDesc": "An invitation card for a birthday party",
            "stem": "¡ESTÁS INVITADO! Cumpleaños de Lucía — Sábado 10 de marzo — 3:00 p.m. — Parque El Salado — Trae tu traje de baño, ¡habrá piscina!\n\n¿Qué debes llevar a la fiesta de Lucía?",
            "options": [
              "A. Un regalo costoso",
              "B. Un pastel",
              "C. Traje de baño",
              "D. Una bicicleta"
            ],
            "correct": 2,
            "xp": 11,
            "hint": "La invitación dice explícitamente qué debes traer."
          }
        ]
      }
    ]
  },
  "matematicas": {
    "id": "matematicas",
    "name": "Matemáticas",
    "biome": "Nether",
    "icon": "🔮",
    "color": "#3a0a0a",
    "accentColor": "#f87171",
    "resource": "Esmeraldas",
    "resourceIcon": "💚",
    "missions": [
      {
        "id": "matematicas_m1",
        "name": "Misión 1: Cofres del Tesoro",
        "questions": [
          {
            "id": 41,
            "type": "word-problem",
            "instruction": "Resuelve el siguiente problema.",
            "image": null,
            "imageDesc": "Minecraft chest with emeralds inside",
            "stem": "María tiene 15 esmeraldas y su hermano le da 12 más. ¿Cuántas esmeraldas tiene en total?",
            "options": [
              "A. 25",
              "B. 27",
              "C. 28",
              "D. 30"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Suma las esmeraldas que tenía con las que le dieron."
          },
          {
            "id": 42,
            "type": "word-problem",
            "instruction": "Lee y resuelve el problema.",
            "image": null,
            "imageDesc": "A group of Minecraft villagers",
            "stem": "En una aldea hay 48 aldeanos. Si se van 15 de viaje, ¿cuántos aldeanos quedan en la aldea?",
            "options": [
              "A. 23",
              "B. 33",
              "C. 37",
              "D. 43"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Resta los aldeanos que se fueron del total."
          },
          {
            "id": 43,
            "type": "word-problem",
            "instruction": "Resuelve el problema.",
            "image": null,
            "imageDesc": "Apples being distributed among children",
            "stem": "La profesora reparte 36 manzanas por igual entre 4 niños. ¿Cuántas manzanas le toca a cada niño?",
            "options": [
              "A. 8",
              "B. 9",
              "C. 10",
              "D. 12"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Divide 36 entre el número de niños."
          },
          {
            "id": 44,
            "type": "word-problem",
            "instruction": "Lee y resuelve.",
            "image": null,
            "imageDesc": "A school buying notebooks",
            "stem": "Una escuela compra 8 cajas de cuadernos. Cada caja contiene 12 cuadernos. ¿Cuántos cuadernos compró en total?",
            "options": [
              "A. 80",
              "B. 84",
              "C. 96",
              "D. 108"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Multiplica el número de cajas por los cuadernos en cada caja."
          },
          {
            "id": 45,
            "type": "word-problem",
            "instruction": "Resuelve el siguiente problema.",
            "image": null,
            "imageDesc": "A piggy bank with coins",
            "stem": "Pedro ahorró $5.200 pesos. Gastó $1.850 en un cuaderno y $950 en un lápiz. ¿Cuánto dinero le quedó?",
            "options": [
              "A. $2.400",
              "B. $2.300",
              "C. $2.450",
              "D. $3.350"
            ],
            "correct": 0,
            "xp": 11,
            "hint": "Primero suma lo que gastó, luego réstalo de lo que ahorró."
          }
        ]
      },
      {
        "id": "matematicas_m2",
        "name": "Misión 2: Patrones de Redstone",
        "questions": [
          {
            "id": 46,
            "type": "pattern",
            "instruction": "Observa el patrón y completa la secuencia.",
            "image": null,
            "imageDesc": "A sequence of colored blocks: red, blue, red, blue, red, ?",
            "stem": "¿Cuál es el siguiente bloque en la secuencia? 🔴 🔵 🔴 🔵 🔴 ___",
            "options": [
              "A. 🔴 Rojo",
              "B. 🔵 Azul",
              "C. 🟢 Verde",
              "D. 🟡 Amarillo"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "El patrón alterna entre rojo y azul."
          },
          {
            "id": 47,
            "type": "pattern",
            "instruction": "Completa la siguiente secuencia numérica.",
            "image": null,
            "imageDesc": "Number sequence: 2, 5, 8, 11, ?",
            "stem": "¿Qué número sigue en la secuencia? 2, 5, 8, 11, ___",
            "options": [
              "A. 12",
              "B. 13",
              "C. 14",
              "D. 15"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Cada número suma 3 al anterior."
          },
          {
            "id": 48,
            "type": "pattern",
            "instruction": "Observa y completa el patrón.",
            "image": null,
            "imageDesc": "Number sequence: 3, 6, 9, 12, ?",
            "stem": "¿Qué número completa la secuencia? 3, 6, 9, 12, ___",
            "options": [
              "A. 13",
              "B. 14",
              "C. 15",
              "D. 18"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "Es la tabla del 3: cada número es 3 más que el anterior."
          },
          {
            "id": 49,
            "type": "pattern",
            "instruction": "Analiza la secuencia y elige la opción correcta.",
            "image": null,
            "imageDesc": "Number sequence: 50, 45, 40, 35, ?",
            "stem": "¿Cuál es el siguiente número? 50, 45, 40, 35, ___",
            "options": [
              "A. 25",
              "B. 28",
              "C. 30",
              "D. 32"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Cada número resta 5 al anterior."
          },
          {
            "id": 50,
            "type": "pattern",
            "instruction": "Completa el patrón con la opción correcta.",
            "image": null,
            "imageDesc": "Shape pattern: circle, square, triangle, circle, square, ?",
            "stem": "¿Qué figura sigue en el patrón? ● ■ ▲ ● ■ ___",
            "options": [
              "A. ● Círculo",
              "B. ■ Cuadrado",
              "C. ▲ Triángulo",
              "D. ⬟ Pentágono"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "El patrón se repite: círculo, cuadrado, triángulo."
          }
        ]
      },
      {
        "id": "matematicas_m3",
        "name": "Misión 3: Construcción en Bloques",
        "questions": [
          {
            "id": 51,
            "type": "geometry",
            "instruction": "Responde la pregunta sobre figuras geométricas.",
            "image": null,
            "imageDesc": "A rectangle with sides labeled 4 and 6",
            "stem": "Un rectángulo mide 4 cm de ancho y 6 cm de largo. ¿Cuánto es su perímetro?",
            "options": [
              "A. 10 cm",
              "B. 16 cm",
              "C. 20 cm",
              "D. 24 cm"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "El perímetro es la suma de todos los lados: 4 + 6 + 4 + 6."
          },
          {
            "id": 52,
            "type": "geometry",
            "instruction": "Calcula y selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A square with sides labeled 5",
            "stem": "¿Cuál es el área de un cuadrado de 5 cm de lado?",
            "options": [
              "A. 10 cm²",
              "B. 15 cm²",
              "C. 20 cm²",
              "D. 25 cm²"
            ],
            "correct": 3,
            "xp": 9,
            "hint": "El área del cuadrado es lado × lado."
          },
          {
            "id": 53,
            "type": "geometry",
            "instruction": "Observa la figura y responde.",
            "image": null,
            "imageDesc": "A triangle with base 8 and height 6",
            "stem": "¿Cuántos lados tiene un triángulo?",
            "options": [
              "A. 2",
              "B. 3",
              "C. 4",
              "D. 5"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "\"Triángulo\" empieza con \"tri\" que significa tres."
          },
          {
            "id": 54,
            "type": "geometry",
            "instruction": "Calcula el área del rectángulo.",
            "image": null,
            "imageDesc": "A rectangle with length 7 and width 3",
            "stem": "¿Cuál es el área de un rectángulo de 7 m de largo y 3 m de ancho?",
            "options": [
              "A. 10 m²",
              "B. 14 m²",
              "C. 20 m²",
              "D. 21 m²"
            ],
            "correct": 3,
            "xp": 10,
            "hint": "El área del rectángulo es largo × ancho."
          },
          {
            "id": 55,
            "type": "geometry",
            "instruction": "Identifica la figura correcta.",
            "image": null,
            "imageDesc": "Several geometric shapes displayed",
            "stem": "¿Cuál de las siguientes figuras NO tiene ángulos rectos?",
            "options": [
              "A. Cuadrado",
              "B. Rectángulo",
              "C. Círculo",
              "D. Triángulo rectángulo"
            ],
            "correct": 2,
            "xp": 11,
            "hint": "Piensa en qué figura es completamente redonda."
          }
        ]
      },
      {
        "id": "matematicas_m4",
        "name": "Misión 4: Mercado del Villager",
        "questions": [
          {
            "id": 56,
            "type": "measurement",
            "instruction": "Responde la pregunta sobre medidas.",
            "image": null,
            "imageDesc": "A ruler measuring a pencil",
            "stem": "¿Cuántos centímetros tiene 1 metro?",
            "options": [
              "A. 10 cm",
              "B. 50 cm",
              "C. 100 cm",
              "D. 1.000 cm"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "El prefijo \"centi\" significa una centésima parte."
          },
          {
            "id": 57,
            "type": "data-interpretation",
            "instruction": "Observa la tabla y responde.",
            "image": null,
            "imageDesc": "A bar chart: mango=8, banana=12, apple=6, orange=10",
            "stem": "Según la gráfica, ¿cuál es la fruta preferida por más niños?",
            "options": [
              "A. Mango",
              "B. Banano",
              "C. Manzana",
              "D. Naranja"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Busca la barra más alta en la gráfica."
          },
          {
            "id": 58,
            "type": "measurement",
            "instruction": "Resuelve el problema de medida.",
            "image": null,
            "imageDesc": "A liter bottle of water",
            "stem": "Si una botella tiene 1 litro de agua y se reparte en 4 vasos iguales, ¿cuántos mililitros hay en cada vaso?",
            "options": [
              "A. 100 ml",
              "B. 200 ml",
              "C. 250 ml",
              "D. 400 ml"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "1 litro = 1.000 ml. Divide entre 4 vasos."
          },
          {
            "id": 59,
            "type": "data-interpretation",
            "instruction": "Lee la tabla y contesta.",
            "image": null,
            "imageDesc": "A table: Grado 3=25, Grado 4=30, Grado 5=28, Grado 6=22",
            "stem": "¿Cuántos estudiantes hay en total entre grado 3 y grado 5?",
            "options": [
              "A. 53",
              "B. 55",
              "C. 83",
              "D. 105"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Suma los estudiantes de grado 3, 4 y 5."
          },
          {
            "id": 60,
            "type": "time",
            "instruction": "Resuelve el problema de tiempo.",
            "image": null,
            "imageDesc": "A clock showing time",
            "stem": "La clase de matemáticas empieza a las 8:00 a.m. y termina a las 9:30 a.m. ¿Cuánto dura la clase?",
            "options": [
              "A. 1 hora",
              "B. 1 hora y media",
              "C. 2 horas",
              "D. 30 minutos"
            ],
            "correct": 1,
            "xp": 11,
            "hint": "Cuenta cuántas horas y minutos hay de 8:00 a 9:30."
          }
        ]
      }
    ]
  },
  "naturales": {
    "id": "naturales",
    "name": "Ciencias Naturales y Educación Ambiental",
    "biome": "Selva",
    "icon": "🌿",
    "color": "#0a2e1a",
    "accentColor": "#34d399",
    "resource": "Diamantes",
    "resourceIcon": "💎",
    "missions": [
      {
        "id": "naturales_m1",
        "name": "Misión 1: Criaturas del Bioma",
        "questions": [
          {
            "id": 61,
            "type": "living-things",
            "instruction": "Responde la pregunta sobre seres vivos.",
            "image": null,
            "imageDesc": "Images of a plant, a rock, a dog, and a river",
            "stem": "¿Cuál de los siguientes es un ser vivo?",
            "options": [
              "A. Una piedra",
              "B. Un río",
              "C. Una planta",
              "D. Una montaña"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Los seres vivos nacen, crecen, se reproducen y mueren."
          },
          {
            "id": 62,
            "type": "living-things",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A plant with labeled parts: roots, stem, leaves, flower",
            "stem": "¿Cuál es la función de las raíces de una planta?",
            "options": [
              "A. Hacer la fotosíntesis",
              "B. Absorber agua y nutrientes del suelo",
              "C. Reproducir la planta",
              "D. Darle color a la planta"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Las raíces están bajo la tierra."
          },
          {
            "id": 63,
            "type": "living-things",
            "instruction": "Observa y contesta.",
            "image": null,
            "imageDesc": "A frog life cycle: egg, tadpole, froglet, adult frog",
            "stem": "¿Cuál de estos animales es un anfibio?",
            "options": [
              "A. Lagartija",
              "B. Rana",
              "C. Águila",
              "D. Tiburón"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Los anfibios viven tanto en el agua como en la tierra."
          },
          {
            "id": 64,
            "type": "living-things",
            "instruction": "Responde sobre los seres vivos.",
            "image": null,
            "imageDesc": "Animals in different habitats: fish, bird, camel",
            "stem": "¿Qué adaptación tiene el pez para vivir en el agua?",
            "options": [
              "A. Patas para correr",
              "B. Alas para volar",
              "C. Aletas para nadar",
              "D. Pelaje para el frío"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Piensa en qué parte del cuerpo del pez le ayuda a moverse en el agua."
          },
          {
            "id": 65,
            "type": "living-things",
            "instruction": "Elige la respuesta correcta.",
            "image": null,
            "imageDesc": "A food chain: grass, rabbit, snake, eagle",
            "stem": "En la cadena alimentaria: pasto → conejo → serpiente → águila. ¿Quién es el productor?",
            "options": [
              "A. El conejo",
              "B. La serpiente",
              "C. El águila",
              "D. El pasto"
            ],
            "correct": 3,
            "xp": 10,
            "hint": "Los productores son los que producen su propio alimento."
          }
        ]
      },
      {
        "id": "naturales_m2",
        "name": "Misión 2: Fuerzas y Movimiento",
        "questions": [
          {
            "id": 66,
            "type": "forces",
            "instruction": "Responde la pregunta sobre fuerzas.",
            "image": null,
            "imageDesc": "A child pushing a box across the floor",
            "stem": "Cuando empujas una caja pesada, ¿qué tipo de fuerza estás aplicando?",
            "options": [
              "A. Fuerza de gravedad",
              "B. Fuerza de empuje",
              "C. Fuerza magnética",
              "D. Fuerza de fricción"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Empujar es aplicar fuerza con las manos para mover algo."
          },
          {
            "id": 67,
            "type": "forces",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A ball rolling down a hill",
            "stem": "¿Qué fuerza hace que los objetos caigan al suelo cuando los soltamos?",
            "options": [
              "A. Fuerza de empuje",
              "B. Fuerza magnética",
              "C. Gravedad",
              "D. Electricidad"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Es la fuerza que nos mantiene pegados al suelo."
          },
          {
            "id": 68,
            "type": "forces",
            "instruction": "Observa y responde.",
            "image": null,
            "imageDesc": "A magnet with iron filings being attracted",
            "stem": "¿Qué tipo de fuerza atrae los metales hacia un imán?",
            "options": [
              "A. Gravedad",
              "B. Fricción",
              "C. Fuerza magnética",
              "D. Fuerza de empuje"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "Los imanes tienen una fuerza especial para atraer metales."
          },
          {
            "id": 69,
            "type": "forces",
            "instruction": "Responde la siguiente pregunta.",
            "image": null,
            "imageDesc": "A toy car on different surfaces",
            "stem": "¿Por qué es más fácil que un carrito ruede en un piso liso que en una alfombra?",
            "options": [
              "A. Por la gravedad",
              "B. Por la fricción",
              "C. Por el magnetismo",
              "D. Por la electricidad"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "La fricción es la fuerza que se opone al movimiento entre dos superficies."
          },
          {
            "id": 70,
            "type": "forces",
            "instruction": "Elige la opción correcta.",
            "image": null,
            "imageDesc": "A lever lifting a rock",
            "stem": "Una palanca es una máquina simple que nos ayuda a:",
            "options": [
              "A. Medir la temperatura",
              "B. Levantar objetos pesados con menos esfuerzo",
              "C. Comunicarnos a distancia",
              "D. Calcular distancias"
            ],
            "correct": 1,
            "xp": 11,
            "hint": "Piensa en cómo usas una barra para levantar algo pesado."
          }
        ]
      },
      {
        "id": "naturales_m3",
        "name": "Misión 3: Ecosistemas Colombianos",
        "questions": [
          {
            "id": 71,
            "type": "ecosystems",
            "instruction": "Responde sobre los ecosistemas de Colombia.",
            "image": null,
            "imageDesc": "A mangrove forest on the Pacific coast",
            "stem": "¿Cuál de estos es un ecosistema acuático?",
            "options": [
              "A. El desierto de la Guajira",
              "B. El páramo de Sumapaz",
              "C. Un arrecife de coral",
              "D. La selva del Amazonas"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Los ecosistemas acuáticos tienen agua como elemento principal."
          },
          {
            "id": 72,
            "type": "ecosystems",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "Andes mountains with paramo vegetation",
            "stem": "¿Qué característica tiene el ecosistema de páramo en Colombia?",
            "options": [
              "A. Es muy caluroso todo el año",
              "B. Es frío y tiene frailejones",
              "C. Está bajo el mar",
              "D. No tiene ninguna vegetación"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Los páramos están en las montañas altas de los Andes."
          },
          {
            "id": 73,
            "type": "ecosystems",
            "instruction": "Observa y contesta.",
            "image": null,
            "imageDesc": "A lush tropical rainforest",
            "stem": "¿Por qué la selva tropical tiene tanta variedad de animales y plantas?",
            "options": [
              "A. Porque hace mucho frío",
              "B. Porque hay poca agua",
              "C. Porque tiene calor, lluvia y mucho sol",
              "D. Porque no hay depredadores"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "La selva tropical tiene condiciones que favorecen la vida."
          },
          {
            "id": 74,
            "type": "ecosystems",
            "instruction": "Responde sobre la contaminación del agua.",
            "image": null,
            "imageDesc": "A polluted river vs. a clean river",
            "stem": "¿Cuál es una consecuencia de contaminar los ríos?",
            "options": [
              "A. Los peces crecen más grandes",
              "B. Las plantas acuáticas se multiplican",
              "C. Los animales y plantas mueren o se enferman",
              "D. El agua se vuelve más limpia"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Piensa en qué pasa cuando el agua tiene basura y químicos."
          },
          {
            "id": 75,
            "type": "ecosystems",
            "instruction": "Elige la opción que muestra una acción para cuidar el medio ambiente.",
            "image": null,
            "imageDesc": "Environmental actions: recycling, planting, littering",
            "stem": "¿Cuál de estas acciones ayuda a proteger el medio ambiente?",
            "options": [
              "A. Quemar la basura",
              "B. Tirar plásticos al río",
              "C. Plantar árboles y reciclar",
              "D. Cortar todos los árboles"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Piensa qué acción beneficia a la naturaleza."
          }
        ]
      },
      {
        "id": "naturales_m4",
        "name": "Misión 4: Laboratorio de Pociones",
        "questions": [
          {
            "id": 76,
            "type": "human-body",
            "instruction": "Responde sobre el cuerpo humano.",
            "image": null,
            "imageDesc": "A diagram of the human skeletal system",
            "stem": "¿Cuál es la función principal de los huesos en nuestro cuerpo?",
            "options": [
              "A. Bombear sangre",
              "B. Dar forma y protección al cuerpo",
              "C. Hacer que el cuerpo se mueva solo",
              "D. Digestionar los alimentos"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Los huesos forman el esqueleto que nos sostiene."
          },
          {
            "id": 77,
            "type": "human-body",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A diagram of the digestive system",
            "stem": "¿Por dónde empieza la digestión de los alimentos?",
            "options": [
              "A. En el estómago",
              "B. En la boca",
              "C. En el intestino",
              "D. En la garganta"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Los dientes y la saliva son los primeros en actuar sobre la comida."
          },
          {
            "id": 78,
            "type": "human-body",
            "instruction": "Observa y responde.",
            "image": null,
            "imageDesc": "A diagram of the five senses",
            "stem": "¿Cuál órgano usamos para percibir los olores?",
            "options": [
              "A. Los ojos",
              "B. Los oídos",
              "C. La nariz",
              "D. La lengua"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "Es el órgano que está en el centro de nuestra cara."
          },
          {
            "id": 79,
            "type": "scientific-method",
            "instruction": "Responde sobre el método científico.",
            "image": null,
            "imageDesc": "Steps of the scientific method",
            "stem": "¿Cuál es el primer paso del método científico?",
            "options": [
              "A. Hacer un experimento",
              "B. Observar y hacer una pregunta",
              "C. Sacar una conclusión",
              "D. Comunicar los resultados"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Todo empieza cuando observamos algo y nos preguntamos por qué pasa."
          },
          {
            "id": 80,
            "type": "scientific-method",
            "instruction": "Elige la respuesta correcta.",
            "image": null,
            "imageDesc": "An experiment with two plants under different light conditions",
            "stem": "Sofía quiere saber si las plantas crecen más con luz solar. Pone una planta al sol y otra en un armario oscuro. Ambas reciben la misma cantidad de agua. ¿Qué es la variable que Sofía está cambiando?",
            "options": [
              "A. La cantidad de agua",
              "B. El tipo de planta",
              "C. La cantidad de luz",
              "D. El tamaño de la maceta"
            ],
            "correct": 2,
            "xp": 11,
            "hint": "La variable es lo que cambia en el experimento para probar la hipótesis."
          }
        ]
      }
    ]
  },
  "sociales": {
    "id": "sociales",
    "name": "Sociales y Ciudadanas",
    "biome": "Taiga",
    "icon": "🏛️",
    "color": "#1a2a0a",
    "accentColor": "#facc15",
    "resource": "Oro",
    "resourceIcon": "🟡",
    "missions": [
      {
        "id": "sociales_m1",
        "name": "Misión 1: Mapas de Colombia",
        "questions": [
          {
            "id": 81,
            "type": "colombian-regions",
            "instruction": "Responde la pregunta sobre las regiones de Colombia.",
            "image": null,
            "imageDesc": "Map of Colombia showing the Caribbean region",
            "stem": "¿Cuál región de Colombia tiene costas sobre el mar Caribe?",
            "options": [
              "A. Región Andina",
              "B. Región Caribe",
              "C. Región Amazónica",
              "D. Región Pacífica"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "El nombre de la región coincide con el nombre del mar."
          },
          {
            "id": 82,
            "type": "colombian-regions",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "Map showing the Andes mountain range",
            "stem": "¿En qué región de Colombia se encuentra la mayoría de la población del país?",
            "options": [
              "A. Región Orinoquía",
              "B. Región Pacífica",
              "C. Región Andina",
              "D. Región Insular"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Es la región donde están las tres cordilleras y las ciudades principales."
          },
          {
            "id": 83,
            "type": "colombian-regions",
            "instruction": "Observa el mapa y responde.",
            "image": null,
            "imageDesc": "Map showing Bogotá in the Andean region",
            "stem": "¿En cuál región natural está ubicada Bogotá, la capital de Colombia?",
            "options": [
              "A. Región Caribe",
              "B. Región Andina",
              "C. Región Amazónica",
              "D. Región Pacífica"
            ],
            "correct": 1,
            "xp": 9,
            "hint": "Bogotá está en la Cordillera Oriental, en los Andes."
          },
          {
            "id": 84,
            "type": "colombian-regions",
            "instruction": "Responde sobre la geografía de Colombia.",
            "image": null,
            "imageDesc": "Map showing two oceans bordering Colombia",
            "stem": "¿Por cuántos océanos tiene costa Colombia?",
            "options": [
              "A. Uno: el océano Atlántico",
              "B. Dos: el océano Pacífico y el océano Atlántico",
              "C. Tres: Pacífico, Atlántico e Índico",
              "D. Ninguno"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Colombia es el único país de Sudamérica con costas en dos océanos."
          },
          {
            "id": 85,
            "type": "colombian-regions",
            "instruction": "Elige la opción correcta.",
            "image": null,
            "imageDesc": "Map showing the Amazon in southern Colombia",
            "stem": "¿Qué ecosistema cubre la mayor parte de la Región Amazónica colombiana?",
            "options": [
              "A. El desierto",
              "B. La selva tropical",
              "C. El páramo",
              "D. La sabana"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "La Amazonía es conocida por su vasta selva tropical."
          }
        ]
      },
      {
        "id": "sociales_m2",
        "name": "Misión 2: Brújula y Coordenadas",
        "questions": [
          {
            "id": 86,
            "type": "geography",
            "instruction": "Responde usando los puntos cardinales.",
            "image": null,
            "imageDesc": "A compass rose showing N, S, E, W",
            "stem": "Si estás en Bogotá y viajas hacia el norte, ¿hacia qué departamento te acercas?",
            "options": [
              "A. Huila",
              "B. Cundinamarca",
              "C. Boyacá",
              "D. Meta"
            ],
            "correct": 2,
            "xp": 8,
            "hint": "Boyacá está al norte de Bogotá."
          },
          {
            "id": 87,
            "type": "geography",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "A map of Colombia with cardinal directions",
            "stem": "¿En qué dirección está el océano Pacífico respecto a Bogotá?",
            "options": [
              "A. Al norte",
              "B. Al sur",
              "C. Al oriente",
              "D. Al occidente"
            ],
            "correct": 3,
            "xp": 9,
            "hint": "El Pacífico está al lado izquierdo (oeste) del mapa de Colombia."
          },
          {
            "id": 88,
            "type": "geography",
            "instruction": "Observa y responde.",
            "image": null,
            "imageDesc": "Physical map showing three cordilleras",
            "stem": "¿Cómo se llaman las tres cordilleras que atraviesan Colombia?",
            "options": [
              "A. Oriental, Central y Occidental",
              "B. Norte, Sur y Este",
              "C. Blanca, Verde y Negra",
              "D. Alta, Media y Baja"
            ],
            "correct": 0,
            "xp": 10,
            "hint": "Se nombran según su posición geográfica en el país."
          },
          {
            "id": 89,
            "type": "geography",
            "instruction": "Responde sobre la geografía de Colombia.",
            "image": null,
            "imageDesc": "Map showing major rivers of Colombia",
            "stem": "¿Cuál es el río más largo de Colombia?",
            "options": [
              "A. Río Cauca",
              "B. Río Magdalena",
              "C. Río Orinoco",
              "D. Río Amazonas"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Este río recorre Colombia de sur a norte."
          },
          {
            "id": 90,
            "type": "geography",
            "instruction": "Elige la opción correcta.",
            "image": null,
            "imageDesc": "Map of continents with Colombia highlighted",
            "stem": "¿En qué continente está ubicado Colombia?",
            "options": [
              "A. América del Norte",
              "B. América Central",
              "C. América del Sur",
              "D. Europa"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Colombia está en la parte norte de Sudamérica."
          }
        ]
      },
      {
        "id": "sociales_m3",
        "name": "Misión 3: Ciudadanos del Servidor",
        "questions": [
          {
            "id": 91,
            "type": "citizenship",
            "instruction": "Responde sobre los derechos de los niños.",
            "image": null,
            "imageDesc": "Diverse children studying together",
            "stem": "¿Cuál de los siguientes es un derecho de los niños según la Convención sobre los Derechos del Niño?",
            "options": [
              "A. Trabajar en fábricas",
              "B. Ir a la escuela y recibir educación",
              "C. No obedecer a los padres",
              "D. Comprar lo que quieran"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Todos los niños tienen derecho a aprender."
          },
          {
            "id": 92,
            "type": "citizenship",
            "instruction": "Selecciona la mejor acción ciudadana.",
            "image": null,
            "imageDesc": "A traffic light and pedestrian crossing",
            "stem": "¿Qué debemos hacer cuando el semáforo para peatones está en rojo?",
            "options": [
              "A. Cruzar corriendo",
              "B. Esperar a que cambie a verde",
              "C. Ignorar el semáforo",
              "D. Cruzar por cualquier lado"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Las normas de tránsito nos protegen."
          },
          {
            "id": 93,
            "type": "citizenship",
            "instruction": "Observa la situación y responde.",
            "image": null,
            "imageDesc": "Two children: one bullying another",
            "stem": "Si ves que un compañero es víctima de bullying en el colegio, ¿qué deberías hacer?",
            "options": [
              "A. Reírte de la situación",
              "B. Ignorar y mirar hacia otro lado",
              "C. Informar a un profesor o adulto",
              "D. Unirte al bullying"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "Debemos pedir ayuda a un adulto de confianza."
          },
          {
            "id": 94,
            "type": "citizenship",
            "instruction": "Responde sobre la convivencia.",
            "image": null,
            "imageDesc": "Children working in groups cooperatively",
            "stem": "¿Cuál de estas acciones demuestra respeto en el salón de clase?",
            "options": [
              "A. Interrumpir cuando alguien habla",
              "B. Escuchar con atención a los compañeros",
              "C. Burlarse de las respuestas de otros",
              "D. Lanzar objetos a los compañeros"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "El respeto incluye saber escuchar a los demás."
          },
          {
            "id": 95,
            "type": "citizenship",
            "instruction": "Elige la opción que muestra un buen uso de los recursos públicos.",
            "image": null,
            "imageDesc": "A public park: clean vs. dirty",
            "stem": "¿Cuál de estas acciones demuestra cuidado por los espacios públicos?",
            "options": [
              "A. Pintar grafitis en las paredes",
              "B. Tirar basura en el parque",
              "C. Cuidar las plantas y no ensuciar",
              "D. Romper los juegos del parque"
            ],
            "correct": 2,
            "xp": 10,
            "hint": "Los espacios públicos son de todos y debemos cuidarlos."
          }
        ]
      },
      {
        "id": "sociales_m4",
        "name": "Misión 4: Reliquias Ancestrales",
        "questions": [
          {
            "id": 96,
            "type": "history",
            "instruction": "Responde sobre los pueblos indígenas de Colombia.",
            "image": null,
            "imageDesc": "An indigenous village with traditional houses",
            "stem": "¿Cuáles eran los pueblos indígenas más importantes que habitaban el territorio colombiano antes de la llegada de los españoles?",
            "options": [
              "A. Incas y Aztecas",
              "B. Muiscas, Tayronas y Quimbayas",
              "C. Vikingos y Romanos",
              "D. Egipcios y Griegos"
            ],
            "correct": 1,
            "xp": 8,
            "hint": "Piensa en los pueblos originarios del territorio que hoy es Colombia."
          },
          {
            "id": 97,
            "type": "cultural-heritage",
            "instruction": "Selecciona la respuesta correcta.",
            "image": null,
            "imageDesc": "Colombian cultural expressions: cumbia, vallenato, handicrafts",
            "stem": "¿Cuál de estas expresiones es parte del patrimonio cultural de Colombia?",
            "options": [
              "A. La cumbia y el vallenato",
              "B. El tango y la samba",
              "C. El flamenco y la sevillana",
              "D. El ballet clásico y la ópera"
            ],
            "correct": 0,
            "xp": 8,
            "hint": "La cumbia y el vallenato son ritmos tradicionales de Colombia."
          },
          {
            "id": 98,
            "type": "history",
            "instruction": "Observa y responde.",
            "image": null,
            "imageDesc": "Timeline: 1492 Columbus, 1810 Independence",
            "stem": "¿En qué año se celebró el Grito de Independencia en Colombia?",
            "options": [
              "A. 1492",
              "B. 1700",
              "C. 1810",
              "D. 1900"
            ],
            "correct": 2,
            "xp": 9,
            "hint": "El 20 de julio es la fecha que celebramos como Día de la Independencia."
          },
          {
            "id": 99,
            "type": "cultural-heritage",
            "instruction": "Responde sobre la diversidad cultural de Colombia.",
            "image": null,
            "imageDesc": "Diversity of Colombian people",
            "stem": "¿Cuáles son los tres grupos culturales que forman la diversidad de la población colombiana?",
            "options": [
              "A. Europeos, asiáticos y africanos",
              "B. Indígenas, afrocolombianos y mestizos",
              "C. Norteamericanos, mexicanos y brasileños",
              "D. Japoneses, chinos y árabes"
            ],
            "correct": 1,
            "xp": 10,
            "hint": "Piensa en los grupos que han habitado históricamente Colombia."
          },
          {
            "id": 100,
            "type": "history",
            "instruction": "Elige la opción correcta.",
            "image": null,
            "imageDesc": "Statue of Simón Bolívar and the Colombian flag",
            "stem": "¿Quién fue Simón Bolívar en la historia de Colombia?",
            "options": [
              "A. Un rey de España",
              "B. El presidente actual",
              "C. Un líder de la independencia",
              "D. Un explorador de América"
            ],
            "correct": 2,
            "xp": 11,
            "hint": "Lo conocemos como \"El Libertador\" de varios países de América."
          }
        ]
      }
    ]
  }
};
