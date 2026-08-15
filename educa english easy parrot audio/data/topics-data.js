/**
 * BANCO DE DATOS — Easy Parrot
 * 18 familias. Multi-idioma completo: cada frase incluye es, en, fr, pt.
 * Versión curada 3: ajuste de equivalencia cultural, brevedad y naturalidad ES/FR/PT-BR.
 * Criterio: traducir sentido comunicativo, no literalidad de modismos.
 * tipo: 'frase' | 'modismo' | 'pregunta'
 */

window.TOPICS = [
  {
    "id": "trabajo",
    "titulo": "Trabajo",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "Pongámonos al día",
        "en": "Let's catch up",
        "fr": "On fait le point.",
        "pt": "Vamos pôr a conversa em dia.",
        "tipo": "frase"
      },
      {
        "es": "¿Cómo va todo por aquí?",
        "en": "How's everything going here?",
        "fr": "Comment ça se passe par ici ?",
        "pt": "Como vão as coisas por aqui?",
        "tipo": "pregunta"
      },
      {
        "es": "Tengo la agenda copada hoy",
        "en": "My schedule is packed today",
        "fr": "J'ai un agenda très chargé aujourd'hui.",
        "pt": "Estou com a agenda cheia hoje.",
        "tipo": "modismo"
      },
      {
        "es": "Vamos directo al grano",
        "en": "Let's get straight to the point",
        "fr": "Allons droit au but",
        "pt": "Vamos direto ao ponto",
        "tipo": "modismo"
      },
      {
        "es": "¿Tienes un minuto para hablar?",
        "en": "Do you have a minute to talk?",
        "fr": "Tu as une minute pour parler ?",
        "pt": "Você tem um minuto para conversar?",
        "tipo": "pregunta"
      },
      {
        "es": "Estoy revisando los pendientes",
        "en": "I'm going through the to-do list",
        "fr": "Je suis en train de passer en revue les tâches en attente",
        "pt": "Estou revisando as pendências",
        "tipo": "frase"
      },
      {
        "es": "Tú decides",
        "en": "That's up to you",
        "fr": "C'est toi qui vois.",
        "pt": "Você decide.",
        "tipo": "modismo"
      },
      {
        "es": "Vamos a repasar los puntos clave",
        "en": "Let's go over the key points",
        "fr": "Passons en revue les points clés",
        "pt": "Vamos revisar os pontos principais",
        "tipo": "frase"
      },
      {
        "es": "Te aviso cualquier novedad",
        "en": "I'll let you know if anything comes up",
        "fr": "Je te préviens s'il y a du nouveau",
        "pt": "Eu te aviso se surgir alguma novidade",
        "tipo": "frase"
      },
      {
        "es": "Hoy se viene pesado el día",
        "en": "Today's going to be a heavy day",
        "fr": "La journée va être lourde aujourd'hui",
        "pt": "Hoje o dia vai ser pesado",
        "tipo": "frase"
      },
      {
        "es": "Ya cerré por hoy",
        "en": "I'm wrapping up for today",
        "fr": "J'ai terminé pour aujourd'hui",
        "pt": "Já encerrei por hoje",
        "tipo": "frase"
      },
      {
        "es": "Me voy a desconectar un rato",
        "en": "I'm going to log off for a bit",
        "fr": "Je vais me déconnecter un moment",
        "pt": "Vou me desconectar um pouco",
        "tipo": "frase"
      },
      {
        "es": "Por fin terminé",
        "en": "I finally finished",
        "fr": "J'ai enfin terminé",
        "pt": "Finalmente terminei",
        "tipo": "frase"
      },
      {
        "es": "Fue un día largo",
        "en": "It was a long day",
        "fr": "Ce fut une longue journée",
        "pt": "Foi um dia longo",
        "tipo": "frase"
      },
      {
        "es": "Dejo esto pendiente para mañana",
        "en": "I'll leave this for tomorrow",
        "fr": "Je laisse cela en suspens pour demain",
        "pt": "Vou deixar isso pendente para amanhã",
        "tipo": "frase"
      },
      {
        "es": "Estoy desbordado de trabajo",
        "en": "I'm swamped with work",
        "fr": "Je suis débordé de travail",
        "pt": "Estou atolado de trabalho",
        "tipo": "modismo"
      },
      {
        "es": "¿Cómo va el proyecto?",
        "en": "How's the project coming along?",
        "fr": "Comment avance le projet ?",
        "pt": "Como está indo o projeto?",
        "tipo": "pregunta"
      },
      {
        "es": "Cometí un error, lo voy a corregir",
        "en": "I made a mistake, I'll fix it",
        "fr": "J'ai fait une erreur, je vais la corriger",
        "pt": "Cometi um erro, vou corrigir",
        "tipo": "frase"
      },
      {
        "es": "Necesito más tiempo para esto",
        "en": "I need more time for this",
        "fr": "J'ai besoin de plus de temps pour ça",
        "pt": "Preciso de mais tempo para isso",
        "tipo": "frase"
      },
      {
        "es": "Buen trabajo en equipo",
        "en": "Good teamwork",
        "fr": "Beau travail d'équipe",
        "pt": "Bom trabalho em equipe",
        "tipo": "frase"
      },
      {
        "es": "Se me venció el plazo",
        "en": "I missed the deadline",
        "fr": "J'ai dépassé la date limite",
        "pt": "Perdi o prazo",
        "tipo": "frase"
      },
      {
        "es": "Vamos a priorizar lo urgente",
        "en": "Let's prioritize what's urgent",
        "fr": "Priorisons ce qui est urgent",
        "pt": "Vamos priorizar o que é urgente",
        "tipo": "frase"
      },
      {
        "es": "Me siento estancado en esto",
        "en": "I feel stuck on this",
        "fr": "Je me sens bloqué là-dessus",
        "pt": "Estou travado nisso",
        "tipo": "frase"
      },
      {
        "es": "Estoy orgulloso de cómo quedó",
        "en": "I'm proud of how it turned out",
        "fr": "Je suis fier du résultat",
        "pt": "Estou orgulhoso de como ficou",
        "tipo": "frase"
      },
      {
        "es": "¿Me ayudas a revisar esto?",
        "en": "Can you help me look this over?",
        "fr": "Tu peux m'aider à revoir ça ?",
        "pt": "Você me ajuda a revisar isso?",
        "tipo": "pregunta"
      },
      {
        "es": "Buen trabajo hoy",
        "en": "Good work today",
        "fr": "Bon travail aujourd'hui",
        "pt": "Bom trabalho hoje",
        "tipo": "frase"
      },
      {
        "es": "Voy a tomarme cinco minutos",
        "en": "I'm going to take five",
        "fr": "Je vais faire une pause de cinq minutes.",
        "pt": "Vou fazer uma pausa de cinco minutos.",
        "tipo": "modismo"
      },
      {
        "es": "Estamos contra el reloj",
        "en": "We're racing against the clock",
        "fr": "On fait la course contre la montre.",
        "pt": "Estamos correndo contra o tempo.",
        "tipo": "modismo"
      },
      {
        "es": "Eso no estaba en mis planes",
        "en": "That wasn't part of the plan",
        "fr": "Ce n'était pas dans mes plans",
        "pt": "Isso não estava nos meus planos",
        "tipo": "frase"
      },
      {
        "es": "Lo dejamos listo para mañana",
        "en": "We'll have it ready for tomorrow",
        "fr": "Nous aurons cela prêt pour demain",
        "pt": "Vamos deixar isso pronto para amanhã",
        "tipo": "frase"
      },
      {
        "es": "Volvamos al punto de partida",
        "en": "Let's go back to the drawing board",
        "fr": "On reprend tout depuis le début.",
        "pt": "Vamos repensar tudo do zero.",
        "tipo": "modismo"
      },
      {
        "es": "Pongamos esto en marcha",
        "en": "Let's get the ball rolling",
        "fr": "On lance ça.",
        "pt": "Vamos dar início a isso.",
        "tipo": "modismo"
      },
      {
        "es": "Metió la pata en el trabajo",
        "en": "He dropped the ball at work",
        "fr": "Il a fait une bourde au travail.",
        "pt": "Ele pisou na bola no trabalho.",
        "tipo": "modismo"
      },
      {
        "es": "Improvisó el discurso",
        "en": "He gave the speech off the cuff",
        "fr": "Il a fait son discours sans préparation.",
        "pt": "Ele fez o discurso de improviso.",
        "tipo": "modismo"
      },
      {
        "es": "Lo hizo en un abrir y cerrar de ojos",
        "en": "She did it in the blink of an eye",
        "fr": "Elle l'a fait en un clin d'œil",
        "pt": "Ela fez isso num piscar de olhos",
        "tipo": "modismo"
      },
      {
        "es": "Está quemándose las pestañas",
        "en": "He's burning the midnight oil",
        "fr": "Il travaille tard dans la nuit.",
        "pt": "Ele está trabalhando até tarde.",
        "tipo": "modismo"
      },
      {
        "es": "Deja de dar largas y hazlo",
        "en": "Stop dragging your feet and do it",
        "fr": "Arrête de traîner les pieds et fais-le",
        "pt": "Pare de enrolar e faça",
        "tipo": "modismo"
      },
      {
        "es": "Se la jugó con esa decisión",
        "en": "She went out on a limb",
        "fr": "Elle a pris un vrai risque.",
        "pt": "Ela assumiu um risco.",
        "tipo": "modismo"
      },
      {
        "es": "Diste justo en el clavo",
        "en": "You hit the nail on the head",
        "fr": "Tu as mis le doigt dessus",
        "pt": "Você acertou em cheio",
        "tipo": "modismo"
      },
      {
        "es": "Le salió clavado",
        "en": "You nailed it",
        "fr": "Tu as assuré",
        "pt": "Você mandou bem",
        "tipo": "modismo"
      },
      {
        "es": "No te andes por las ramas",
        "en": "Don't beat around the bush",
        "fr": "Ne tourne pas autour du pot.",
        "pt": "Não fique enrolando.",
        "tipo": "modismo"
      },
      {
        "es": "Tengo que resolver esto",
        "en": "I need to figure this out",
        "fr": "Je dois trouver une solution à ça",
        "pt": "Preciso resolver isso",
        "tipo": "modismo"
      },
      {
        "es": "Va a ser difícil reemplazarlo",
        "en": "It'll be hard to fill his boots",
        "fr": "Il sera difficile d'être à sa hauteur.",
        "pt": "Vai ser difícil estar à altura dele.",
        "tipo": "modismo"
      },
      {
        "es": "Despidieron a varios empleados",
        "en": "They gave several workers the boot",
        "fr": "Ils ont renvoyé plusieurs employés",
        "pt": "Demitiram vários funcionários",
        "tipo": "modismo"
      },
      {
        "es": "Ella destaca entre todos",
        "en": "She stands out from the rest",
        "fr": "Elle sort du lot",
        "pt": "Ela se destaca entre todos",
        "tipo": "modismo"
      },
      {
        "es": "Eso le da ventaja",
        "en": "That gives him a leg up",
        "fr": "Ça lui donne une longueur d'avance.",
        "pt": "Isso dá uma vantagem a ele.",
        "tipo": "modismo"
      },
      {
        "es": "No da la talla para el puesto",
        "en": "He can't cut it for the job",
        "fr": "Il n'est pas à la hauteur du poste",
        "pt": "Ele não dá conta do cargo",
        "tipo": "modismo"
      },
      {
        "es": "Replantearlo",
        "en": "Go back to the drawing board",
        "fr": "Repartir de zéro",
        "pt": "Repensar do zero",
        "tipo": "modismo"
      },
      {
        "es": "Poner algo en marcha",
        "en": "Get the ball rolling",
        "fr": "Mettre quelque chose en marche",
        "pt": "Colocar algo em andamento",
        "tipo": "modismo"
      },
      {
        "es": "Trabajar durísimo",
        "en": "Work one's fingers to the bone",
        "fr": "Travailler d'arrache-pied.",
        "pt": "Trabalhar duro até se acabar.",
        "tipo": "modismo"
      },
      {
        "es": "Meter la pata",
        "en": "Drop the ball",
        "fr": "Faire une bourde",
        "pt": "Pisar na bola",
        "tipo": "modismo"
      },
      {
        "es": "Dar largas",
        "en": "Drag one's feet",
        "fr": "Traîner des pieds",
        "pt": "Ficar enrolando",
        "tipo": "modismo"
      },
      {
        "es": "Del amanecer al atardecer",
        "en": "From dawn till dusk",
        "fr": "Du lever au coucher du soleil",
        "pt": "Do amanhecer ao anoitecer",
        "tipo": "modismo"
      },
      {
        "es": "Hasta arriba de trabajo",
        "en": "Swamped at work",
        "fr": "Débordé de travail.",
        "pt": "Atolado de trabalho.",
        "tipo": "modismo"
      },
      {
        "es": "Despedir a alguien",
        "en": "Give someone the boot",
        "fr": "Renvoyer quelqu'un",
        "pt": "Demitir alguém",
        "tipo": "modismo"
      },
      {
        "es": "Reemplazar a alguien valioso",
        "en": "Fill someone's boots",
        "fr": "Être à la hauteur de quelqu'un.",
        "pt": "Estar à altura de alguém.",
        "tipo": "modismo"
      },
      {
        "es": "No dar la talla",
        "en": "Can't cut it",
        "fr": "Ne pas être à la hauteur",
        "pt": "Não dar conta",
        "tipo": "modismo"
      },
      {
        "es": "¿A qué te dedicas?",
        "en": "What do you do?",
        "fr": "Tu fais quoi dans la vie ?",
        "pt": "Com o que você trabalha?",
        "tipo": "pregunta"
      },
      {
        "es": "Una chapuza",
        "en": "A botched job",
        "fr": "Un travail bâclé",
        "pt": "Um serviço malfeito",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "negocios",
    "titulo": "Negocios",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "Pongamos esto por escrito",
        "en": "Let's put this in writing",
        "fr": "Mettons cela par écrit",
        "pt": "Vamos colocar isso por escrito",
        "tipo": "frase"
      },
      {
        "es": "¿Cuáles son los próximos pasos?",
        "en": "What are the next steps?",
        "fr": "Quelles sont les prochaines étapes ?",
        "pt": "Quais são os próximos passos?",
        "tipo": "pregunta"
      },
      {
        "es": "Necesitamos cerrar este trato",
        "en": "We need to close this deal",
        "fr": "Nous devons conclure cette affaire",
        "pt": "Precisamos fechar este acordo",
        "tipo": "frase"
      },
      {
        "es": "Eso está fuera de nuestro presupuesto",
        "en": "That's outside our budget",
        "fr": "Cela dépasse notre budget",
        "pt": "Isso está fora do nosso orçamento",
        "tipo": "frase"
      },
      {
        "es": "Vamos a negociar los términos",
        "en": "Let's negotiate the terms",
        "fr": "Négocions les conditions",
        "pt": "Vamos negociar os termos",
        "tipo": "frase"
      },
      {
        "es": "Esa propuesta no me convence",
        "en": "That proposal doesn't convince me",
        "fr": "Cette proposition ne me convainc pas",
        "pt": "Essa proposta não me convence",
        "tipo": "frase"
      },
      {
        "es": "Firmemos el contrato esta semana",
        "en": "Let's sign the contract this week",
        "fr": "Signons le contrat cette semaine",
        "pt": "Vamos assinar o contrato esta semana",
        "tipo": "frase"
      },
      {
        "es": "¿Podemos reprogramar la reunión?",
        "en": "Can we reschedule the meeting?",
        "fr": "Pouvons-nous reporter la réunion ?",
        "pt": "Podemos remarcar a reunião?",
        "tipo": "pregunta"
      },
      {
        "es": "Estamos en la misma página",
        "en": "We're on the same page",
        "fr": "Nous sommes sur la même longueur d'onde.",
        "pt": "Estamos alinhados.",
        "tipo": "modismo"
      },
      {
        "es": "Eso queda pendiente para revisión",
        "en": "That's still pending review",
        "fr": "Cela reste en attente de révision",
        "pt": "Isso fica pendente para revisão",
        "tipo": "frase"
      },
      {
        "es": "Necesitamos más datos antes de decidir",
        "en": "We need more data before deciding",
        "fr": "Nous avons besoin de plus de données avant de décider",
        "pt": "Precisamos de mais dados antes de decidir",
        "tipo": "frase"
      },
      {
        "es": "¿Cuál es el plan B?",
        "en": "What's the backup plan?",
        "fr": "Quel est le plan B ?",
        "pt": "Qual é o plano B?",
        "tipo": "pregunta"
      },
      {
        "es": "Esto podría ser un punto de quiebre",
        "en": "This could be a turning point",
        "fr": "Cela pourrait être un tournant",
        "pt": "Isso pode ser um ponto de virada",
        "tipo": "frase"
      },
      {
        "es": "Vamos a presentar la propuesta",
        "en": "Let's pitch the proposal",
        "fr": "Présentons la proposition",
        "pt": "Vamos apresentar a proposta",
        "tipo": "frase"
      },
      {
        "es": "El cliente quedó satisfecho",
        "en": "The client was satisfied",
        "fr": "Le client était satisfait",
        "pt": "O cliente ficou satisfeito",
        "tipo": "frase"
      },
      {
        "es": "Hay que ajustar el presupuesto",
        "en": "We need to adjust the budget",
        "fr": "Il faut ajuster le budget",
        "pt": "Precisamos ajustar o orçamento",
        "tipo": "frase"
      },
      {
        "es": "Esto requiere luz verde de arriba",
        "en": "This needs the green light from above",
        "fr": "Il faut le feu vert de la direction.",
        "pt": "Isso precisa do aval da direção.",
        "tipo": "modismo"
      },
      {
        "es": "Vamos a evaluar los riesgos",
        "en": "Let's weigh the risks",
        "fr": "Évaluons les risques",
        "pt": "Vamos avaliar os riscos",
        "tipo": "frase"
      },
      {
        "es": "El mercado está cambiando rápido",
        "en": "The market is changing fast",
        "fr": "Le marché change rapidement",
        "pt": "O mercado está mudando rápido",
        "tipo": "frase"
      },
      {
        "es": "Tenemos que diferenciarnos",
        "en": "We need to stand out",
        "fr": "Nous devons nous différencier",
        "pt": "Precisamos nos diferenciar",
        "tipo": "frase"
      },
      {
        "es": "Esa cifra no cuadra",
        "en": "That number doesn't add up",
        "fr": "Ce chiffre ne colle pas",
        "pt": "Esse número não fecha",
        "tipo": "frase"
      },
      {
        "es": "Vamos a apostar por esta estrategia",
        "en": "Let's go with this strategy",
        "fr": "Misons sur cette stratégie",
        "pt": "Vamos apostar nessa estratégia",
        "tipo": "frase"
      },
      {
        "es": "El socio se retiró del trato",
        "en": "The partner backed out of the deal",
        "fr": "L'associé s'est retiré de l'affaire",
        "pt": "O sócio saiu do acordo",
        "tipo": "frase"
      },
      {
        "es": "Necesitamos un plan de respaldo",
        "en": "We need a contingency plan",
        "fr": "Nous avons besoin d'un plan de secours",
        "pt": "Precisamos de um plano de contingência",
        "tipo": "frase"
      },
      {
        "es": "La competencia nos pisa los talones",
        "en": "The competition is right on our heels",
        "fr": "La concurrence nous talonne",
        "pt": "A concorrência está no nosso encalço",
        "tipo": "modismo"
      },
      {
        "es": "Estamos creciendo más rápido de lo esperado",
        "en": "We're growing faster than expected",
        "fr": "Nous grandissons plus vite que prévu",
        "pt": "Estamos crescendo mais rápido do que o esperado",
        "tipo": "frase"
      },
      {
        "es": "Eso fue una jugada arriesgada",
        "en": "That was a risky move",
        "fr": "C'était un coup risqué",
        "pt": "Isso foi uma jogada arriscada",
        "tipo": "frase"
      },
      {
        "es": "Vamos a revisar los números otra vez",
        "en": "Let's go over the numbers again",
        "fr": "Repassons les chiffres en revue",
        "pt": "Vamos revisar os números outra vez",
        "tipo": "frase"
      },
      {
        "es": "El trato quedó cerrado",
        "en": "The deal is sealed",
        "fr": "L'affaire est conclue",
        "pt": "O acordo ficou fechado",
        "tipo": "frase"
      },
      {
        "es": "Eso suma valor al negocio",
        "en": "That adds value to the business",
        "fr": "Cela ajoute de la valeur à l'entreprise",
        "pt": "Isso agrega valor ao negócio",
        "tipo": "frase"
      },
      {
        "es": "No diversifiques todo en una sola apuesta",
        "en": "Don't put all your eggs in one basket",
        "fr": "Ne mise pas tout sur une seule option.",
        "pt": "Não aposte tudo em uma coisa só.",
        "tipo": "modismo"
      },
      {
        "es": "El negocio no llegó a cubrir gastos",
        "en": "The business didn't break even",
        "fr": "L'entreprise n'a pas couvert ses coûts.",
        "pt": "O negócio não cobriu os custos.",
        "tipo": "modismo"
      },
      {
        "es": "Mató dos pájaros de un tiro",
        "en": "She killed two birds with one stone",
        "fr": "Elle a fait d'une pierre deux coups.",
        "pt": "Ela resolveu duas coisas de uma vez.",
        "tipo": "modismo"
      },
      {
        "es": "Lanzó el guante",
        "en": "He threw down the gauntlet",
        "fr": "Il a lancé le défi",
        "pt": "Ele lançou o desafio",
        "tipo": "modismo"
      },
      {
        "es": "Causó sensación en la entrevista",
        "en": "She made a splash at the interview",
        "fr": "Elle a fait sensation à l'entretien",
        "pt": "Ela causou sensação na entrevista",
        "tipo": "modismo"
      },
      {
        "es": "Se subió al carro ganador",
        "en": "She jumped on the bandwagon",
        "fr": "Elle a suivi le mouvement.",
        "pt": "Ela entrou na onda.",
        "tipo": "modismo"
      },
      {
        "es": "Ambas partes salieron ganando",
        "en": "They scratched each other's backs",
        "fr": "Ils se sont rendu service par intérêt.",
        "pt": "Eles se ajudaram por conveniência.",
        "tipo": "modismo"
      },
      {
        "es": "Aprovecharon la oportunidad al vuelo",
        "en": "They jumped at the chance",
        "fr": "Ils ont saisi l'occasion au vol.",
        "pt": "Eles agarraram a oportunidade na hora.",
        "tipo": "modismo"
      },
      {
        "es": "Dejó escapar la oportunidad",
        "en": "He let the opportunity slip through his fingers",
        "fr": "Il a laissé filer l'occasion.",
        "pt": "Ele deixou a oportunidade escapar.",
        "tipo": "modismo"
      },
      {
        "es": "No dejó piedra sin remover",
        "en": "She left no stone unturned",
        "fr": "Elle n'a rien laissé au hasard.",
        "pt": "Ela não mediu esforços.",
        "tipo": "modismo"
      },
      {
        "es": "Es superior a los demás",
        "en": "It's a cut above the rest",
        "fr": "C'est au-dessus du lot.",
        "pt": "Está um nível acima dos demais.",
        "tipo": "modismo"
      },
      {
        "es": "Invirtieron juntos en el proyecto",
        "en": "They went in on the project together",
        "fr": "Ils se sont associés sur le projet.",
        "pt": "Eles entraram juntos no projeto.",
        "tipo": "modismo"
      },
      {
        "es": "Esa marca perdura en el tiempo",
        "en": "That brand stands the test of time",
        "fr": "Cette marque résiste à l'épreuve du temps",
        "pt": "Essa marca resiste ao tempo",
        "tipo": "modismo"
      },
      {
        "es": "Vamos a defender nuestra postura",
        "en": "Let's stand up for our position",
        "fr": "Défendons notre position",
        "pt": "Vamos defender nossa posição",
        "tipo": "modismo"
      },
      {
        "es": "Eso significa más trabajo",
        "en": "That stands for more work",
        "fr": "Cela signifie plus de travail",
        "pt": "Isso significa mais trabalho",
        "tipo": "modismo"
      },
      {
        "es": "Quedar en tablas",
        "en": "Break even",
        "fr": "Rentrer dans ses frais",
        "pt": "Ficar no zero a zero",
        "tipo": "modismo"
      },
      {
        "es": "Ayudarse mutuamente por conveniencia",
        "en": "Scratch each other's backs",
        "fr": "Se rendre service par intérêt.",
        "pt": "Ajudar-se por conveniência.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "viajes",
    "titulo": "Viajes",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "¿A qué hora sale el vuelo?",
        "en": "What time does the flight leave?",
        "fr": "À quelle heure part le vol ?",
        "pt": "A que horas sai o voo?",
        "tipo": "pregunta"
      },
      {
        "es": "Se me retrasó el vuelo",
        "en": "My flight got delayed",
        "fr": "Mon vol a été retardé",
        "pt": "Meu voo atrasou",
        "tipo": "frase"
      },
      {
        "es": "¿Dónde queda la sala de espera?",
        "en": "Where's the waiting area?",
        "fr": "Où se trouve la salle d'attente ?",
        "pt": "Onde fica a sala de espera?",
        "tipo": "pregunta"
      },
      {
        "es": "Voy a facturar el equipaje",
        "en": "I'm going to check my luggage",
        "fr": "Je vais enregistrer les bagages",
        "pt": "Vou despachar a bagagem",
        "tipo": "frase"
      },
      {
        "es": "¿Tienes el pasaporte a la mano?",
        "en": "Do you have your passport handy?",
        "fr": "Tu as ton passeport sous la main ?",
        "pt": "Você está com o passaporte à mão?",
        "tipo": "pregunta"
      },
      {
        "es": "Perdimos la conexión",
        "en": "We missed our connection",
        "fr": "Nous avons manqué notre correspondance",
        "pt": "Perdemos a conexão",
        "tipo": "frase"
      },
      {
        "es": "¿Cuánto cuesta una habitación doble?",
        "en": "How much is a double room?",
        "fr": "Combien coûte une chambre double ?",
        "pt": "Quanto custa um quarto duplo?",
        "tipo": "pregunta"
      },
      {
        "es": "Quisiera hacer el check-in",
        "en": "I'd like to check in",
        "fr": "Je voudrais faire l'enregistrement",
        "pt": "Gostaria de fazer o check-in",
        "tipo": "frase"
      },
      {
        "es": "¿Hay wifi en el hotel?",
        "en": "Is there wifi at the hotel?",
        "fr": "Y a-t-il du wifi à l'hôtel ?",
        "pt": "Tem wifi no hotel?",
        "tipo": "pregunta"
      },
      {
        "es": "Se me perdió el equipaje",
        "en": "My luggage got lost",
        "fr": "Mes bagages ont été perdus",
        "pt": "Minha bagagem foi perdida",
        "tipo": "frase"
      },
      {
        "es": "¿Cómo llego al centro desde aquí?",
        "en": "How do I get downtown from here?",
        "fr": "Comment aller au centre-ville d'ici ?",
        "pt": "Como chego ao centro daqui?",
        "tipo": "pregunta"
      },
      {
        "es": "Vamos a explorar un poco",
        "en": "Let's explore a bit",
        "fr": "Allons explorer un peu",
        "pt": "Vamos explorar um pouco",
        "tipo": "frase"
      },
      {
        "es": "Esto no estaba en el itinerario",
        "en": "This wasn't in the itinerary",
        "fr": "Ce n'était pas dans l'itinéraire",
        "pt": "Isso não estava no itinerário",
        "tipo": "frase"
      },
      {
        "es": "¿Aceptan moneda extranjera?",
        "en": "Do you accept foreign currency?",
        "fr": "Acceptez-vous les devises étrangères ?",
        "pt": "Vocês aceitam moeda estrangeira?",
        "tipo": "pregunta"
      },
      {
        "es": "Nos perdimos en el camino",
        "en": "We got lost on the way",
        "fr": "Nous nous sommes perdus en route",
        "pt": "Nós nos perdemos no caminho",
        "tipo": "frase"
      },
      {
        "es": "Vale la pena el viaje",
        "en": "It's worth the trip",
        "fr": "Le voyage en vaut la peine",
        "pt": "Vale a pena a viagem",
        "tipo": "modismo"
      },
      {
        "es": "¿Cuál es la mejor época para visitar?",
        "en": "What's the best time to visit?",
        "fr": "Quelle est la meilleure période pour visiter ?",
        "pt": "Qual é a melhor época para visitar?",
        "tipo": "pregunta"
      },
      {
        "es": "Quiero alquilar un auto",
        "en": "I'd like to rent a car",
        "fr": "Je voudrais louer une voiture",
        "pt": "Quero alugar um carro",
        "tipo": "frase"
      },
      {
        "es": "Se nos hizo tarde para el tour",
        "en": "We're running late for the tour",
        "fr": "Nous sommes en retard pour la visite",
        "pt": "Estamos atrasados para o tour",
        "tipo": "frase"
      },
      {
        "es": "¿Es seguro caminar de noche aquí?",
        "en": "Is it safe to walk here at night?",
        "fr": "Est-ce sûr de marcher ici la nuit ?",
        "pt": "É seguro caminhar aqui à noite?",
        "tipo": "pregunta"
      },
      {
        "es": "Tomamos el tren equivocado",
        "en": "We took the wrong train",
        "fr": "Nous avons pris le mauvais train",
        "pt": "Pegamos o trem errado",
        "tipo": "frase"
      },
      {
        "es": "Me encantó cada minuto del viaje",
        "en": "I loved every minute of the trip",
        "fr": "J'ai aimé chaque minute du voyage",
        "pt": "Eu adorei cada minuto da viagem",
        "tipo": "frase"
      },
      {
        "es": "¿Dónde puedo cambiar dinero?",
        "en": "Where can I exchange money?",
        "fr": "Où puis-je changer de l'argent ?",
        "pt": "Onde posso trocar dinheiro?",
        "tipo": "pregunta"
      },
      {
        "es": "Empacamos de más",
        "en": "We overpacked",
        "fr": "On a trop chargé",
        "pt": "Levamos coisa demais",
        "tipo": "frase"
      },
      {
        "es": "Vamos con el itinerario justo",
        "en": "We're cutting it close",
        "fr": "On est un peu justes côté timing.",
        "pt": "Estamos com o tempo apertado.",
        "tipo": "modismo"
      },
      {
        "es": "¿Hay descuento para estudiantes?",
        "en": "Is there a student discount?",
        "fr": "Y a-t-il une réduction pour les étudiants ?",
        "pt": "Tem desconto para estudantes?",
        "tipo": "pregunta"
      },
      {
        "es": "Esta ciudad me sorprendió",
        "en": "This city surprised me",
        "fr": "Cette ville m'a surpris",
        "pt": "Esta cidade me surpreendeu",
        "tipo": "frase"
      },
      {
        "es": "Voy a pedir el visado con tiempo",
        "en": "I'm going to apply for the visa early",
        "fr": "Je vais demander le visa à l'avance",
        "pt": "Vou pedir o visto com antecedência",
        "tipo": "frase"
      },
      {
        "es": "No hay nada como volver a casa",
        "en": "There's nothing like coming home",
        "fr": "Rien de tel que de rentrer chez soi",
        "pt": "Não há nada como voltar para casa",
        "tipo": "modismo"
      },
      {
        "es": "Guardemos esto de recuerdo",
        "en": "Let's keep this as a souvenir",
        "fr": "Gardons cela comme souvenir",
        "pt": "Vamos guardar isso de lembrança",
        "tipo": "frase"
      },
      {
        "es": "Llovía a cántaros",
        "en": "It was raining cats and dogs",
        "fr": "Il pleuvait des cordes.",
        "pt": "Chovia muito.",
        "tipo": "modismo"
      },
      {
        "es": "Salió de la nada",
        "en": "It came out of the blue",
        "fr": "C'est arrivé sans prévenir.",
        "pt": "Veio do nada.",
        "tipo": "modismo"
      },
      {
        "es": "Voló en lista de espera",
        "en": "She flew stand-by",
        "fr": "Elle a voyagé en liste d'attente.",
        "pt": "Ela viajou em lista de espera.",
        "tipo": "modismo"
      },
      {
        "es": "Madruga para no perder el vuelo",
        "en": "Be an early bird to catch the flight",
        "fr": "Pars tôt pour ne pas rater le vol.",
        "pt": "Saia cedo para não perder o voo.",
        "tipo": "modismo"
      },
      {
        "es": "Surgió un imprevisto",
        "en": "Something came up out of the blue",
        "fr": "Un imprévu est survenu",
        "pt": "Surgiu um imprevisto",
        "tipo": "modismo"
      },
      {
        "es": "Tener el gusanillo de viajar",
        "en": "Have the travel bug",
        "fr": "Avoir toujours envie de voyager.",
        "pt": "Ter vontade de viajar o tempo todo.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "familia",
    "titulo": "Familia",
    "franjaSugerida": "noche",
    "frases": [
      {
        "es": "¿Cómo te fue hoy?",
        "en": "How did it go today?",
        "fr": "Comment s'est passée ta journée ?",
        "pt": "Como foi seu dia hoje?",
        "tipo": "pregunta"
      },
      {
        "es": "La cena ya casi está lista",
        "en": "Dinner's almost ready",
        "fr": "Le dîner est presque prêt",
        "pt": "O jantar está quase pronto",
        "tipo": "frase"
      },
      {
        "es": "Cuéntame algo de tu día",
        "en": "Tell me something about your day",
        "fr": "Raconte-moi quelque chose de ta journée",
        "pt": "Conte-me algo do seu dia",
        "tipo": "frase"
      },
      {
        "es": "¿Qué se te antoja cenar?",
        "en": "What do you feel like having for dinner?",
        "fr": "Qu'est-ce qui te ferait envie pour le dîner ?",
        "pt": "O que você está com vontade de jantar?",
        "tipo": "pregunta"
      },
      {
        "es": "Pongamos la mesa",
        "en": "Let's set the table",
        "fr": "Mettons la table",
        "pt": "Vamos pôr a mesa",
        "tipo": "frase"
      },
      {
        "es": "Estuvo riquísimo",
        "en": "That was delicious",
        "fr": "C'était délicieux",
        "pt": "Estava delicioso",
        "tipo": "frase"
      },
      {
        "es": "¿Quién lava los platos hoy?",
        "en": "Who's doing the dishes tonight?",
        "fr": "Qui fait la vaisselle ce soir ?",
        "pt": "Quem lava a louça hoje?",
        "tipo": "pregunta"
      },
      {
        "es": "Hoy tuve un día de locos",
        "en": "I had a crazy day today",
        "fr": "J'ai eu une journée de folie aujourd'hui.",
        "pt": "Hoje tive um dia corrido.",
        "tipo": "modismo"
      },
      {
        "es": "Vamos a ver algo juntos",
        "en": "Let's watch something together",
        "fr": "Regardons quelque chose ensemble",
        "pt": "Vamos assistir a alguma coisa juntos",
        "tipo": "frase"
      },
      {
        "es": "Me encantó pasar este rato contigo",
        "en": "I loved spending this time with you",
        "fr": "J'ai adoré passer ce moment avec toi",
        "pt": "Adorei passar esse tempo com você",
        "tipo": "frase"
      },
      {
        "es": "Buenas noches",
        "en": "Good night",
        "fr": "Bonne nuit",
        "pt": "Boa noite",
        "tipo": "frase"
      },
      {
        "es": "Ya me caigo de sueño",
        "en": "I'm dead tired",
        "fr": "Je suis épuisé.",
        "pt": "Estou morto de cansado.",
        "tipo": "modismo"
      },
      {
        "es": "Que duermas bien",
        "en": "Sleep well",
        "fr": "Dors bien",
        "pt": "Durma bem",
        "tipo": "frase"
      },
      {
        "es": "Mañana será otro día",
        "en": "Tomorrow's another day",
        "fr": "Demain est un autre jour",
        "pt": "Amanhã será outro dia",
        "tipo": "frase"
      },
      {
        "es": "Hablamos mañana",
        "en": "We'll talk tomorrow",
        "fr": "On en reparle demain",
        "pt": "Falamos amanhã",
        "tipo": "frase"
      },
      {
        "es": "Dulces sueños",
        "en": "Sweet dreams",
        "fr": "Fais de beaux rêves",
        "pt": "Bons sonhos",
        "tipo": "frase"
      },
      {
        "es": "Mis papás vienen de visita",
        "en": "My parents are coming to visit",
        "fr": "Mes parents viennent nous rendre visite",
        "pt": "Meus pais vêm nos visitar",
        "tipo": "frase"
      },
      {
        "es": "Extraño mucho a la familia",
        "en": "I really miss my family",
        "fr": "Ma famille me manque beaucoup",
        "pt": "Sinto muita saudade da família",
        "tipo": "frase"
      },
      {
        "es": "Vamos a llamar a la abuela",
        "en": "Let's call grandma",
        "fr": "Appelons grand-mère",
        "pt": "Vamos ligar para a avó",
        "tipo": "frase"
      },
      {
        "es": "Esto se quedará en familia",
        "en": "This will stay within the family",
        "fr": "Cela restera en famille",
        "pt": "Isso vai ficar em família",
        "tipo": "modismo"
      },
      {
        "es": "Cuidemos esta tradición",
        "en": "Let's keep this tradition alive",
        "fr": "Gardons cette tradition vivante",
        "pt": "Vamos manter essa tradição viva",
        "tipo": "frase"
      },
      {
        "es": "Se parece tanto a su papá",
        "en": "He looks so much like his dad",
        "fr": "Il ressemble tellement à son père",
        "pt": "Ele se parece tanto com o pai",
        "tipo": "frase"
      },
      {
        "es": "La familia siempre apoya",
        "en": "Family always has your back",
        "fr": "La famille est toujours là pour soutenir",
        "pt": "A família sempre apoia",
        "tipo": "frase"
      },
      {
        "es": "¿Nos reunimos este domingo?",
        "en": "Should we get together this Sunday?",
        "fr": "On se retrouve ce dimanche ?",
        "pt": "Vamos nos reunir neste domingo?",
        "tipo": "pregunta"
      },
      {
        "es": "Cada quien aportó algo",
        "en": "Everyone pitched in",
        "fr": "Chacun a apporté quelque chose",
        "pt": "Cada um contribuiu com algo",
        "tipo": "frase"
      },
      {
        "es": "Eso quedará entre nosotros",
        "en": "That stays between us",
        "fr": "Cela reste entre nous",
        "pt": "Isso fica entre nós",
        "tipo": "frase"
      },
      {
        "es": "Es bueno tener con quién contar",
        "en": "It's good to have someone to count on",
        "fr": "C'est bon d'avoir quelqu'un sur qui compter",
        "pt": "É bom ter com quem contar",
        "tipo": "frase"
      },
      {
        "es": "Vamos a organizar la celebración",
        "en": "Let's plan the celebration",
        "fr": "Organisons la célébration",
        "pt": "Vamos organizar a celebração",
        "tipo": "frase"
      },
      {
        "es": "Crecí rodeado de mucho cariño",
        "en": "I grew up surrounded by a lot of love",
        "fr": "J'ai grandi entouré de beaucoup d'amour",
        "pt": "Cresci cercado de muito carinho",
        "tipo": "frase"
      },
      {
        "es": "La familia es lo primero",
        "en": "Family comes first",
        "fr": "La famille passe avant tout",
        "pt": "A família vem em primeiro lugar",
        "tipo": "frase"
      },
      {
        "es": "¿Te suena de algo?",
        "en": "Does that ring a bell?",
        "fr": "Ça te dit quelque chose ?",
        "pt": "Isso te diz alguma coisa?",
        "tipo": "modismo"
      },
      {
        "es": "¿Recuerdas los viejos tiempos?",
        "en": "Do you remember the good old days?",
        "fr": "Tu te souviens du bon vieux temps ?",
        "pt": "Você se lembra dos velhos tempos?",
        "tipo": "modismo"
      },
      {
        "es": "Echó leña al fuego",
        "en": "She added fuel to the fire",
        "fr": "Elle a jeté de l'huile sur le feu",
        "pt": "Ela jogou lenha na fogueira",
        "tipo": "modismo"
      },
      {
        "es": "Perdió los estribos",
        "en": "He blew his top",
        "fr": "Il a explosé de colère.",
        "pt": "Ele perdeu a cabeça.",
        "tipo": "modismo"
      },
      {
        "es": "Lo aceptó sin rechistar",
        "en": "He took it on the chin",
        "fr": "Il a encaissé sans broncher.",
        "pt": "Ele aguentou firme sem reclamar.",
        "tipo": "modismo"
      },
      {
        "es": "Se levantó con el pie izquierdo",
        "en": "She got up on the wrong side of the bed",
        "fr": "Elle s'est levée du mauvais pied.",
        "pt": "Ela acordou de mau humor.",
        "tipo": "modismo"
      },
      {
        "es": "Me encargo de las flores",
        "en": "I'll see to the flowers",
        "fr": "Je m'occupe des fleurs",
        "pt": "Eu cuido das flores",
        "tipo": "modismo"
      },
      {
        "es": "Ya pasará, mañana será mejor",
        "en": "Get over it, tomorrow will be better",
        "fr": "Ça va passer, demain ira mieux.",
        "pt": "Vai passar, amanhã será melhor.",
        "tipo": "modismo"
      },
      {
        "es": "No te inventes cuentos",
        "en": "Don't make up stories",
        "fr": "N'invente pas d'histoires",
        "pt": "Não invente histórias",
        "tipo": "modismo"
      },
      {
        "es": "Hagamos las paces",
        "en": "Let's make up",
        "fr": "Faisons la paix",
        "pt": "Vamos fazer as pazes",
        "tipo": "modismo"
      },
      {
        "es": "Ya enciendo la computadora",
        "en": "I'll boot up the computer",
        "fr": "Je vais démarrer l'ordinateur.",
        "pt": "Vou ligar o computador.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "amigos",
    "titulo": "Amigos",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "¿Qué tal todo?",
        "en": "How's everything going?",
        "fr": "Comment ça va ?",
        "pt": "Como vão as coisas?",
        "tipo": "pregunta"
      },
      {
        "es": "Cuánto tiempo sin verte",
        "en": "Long time no see",
        "fr": "Ça fait longtemps !",
        "pt": "Quanto tempo!",
        "tipo": "modismo"
      },
      {
        "es": "¿Cómo va tu semana?",
        "en": "How's your week going?",
        "fr": "Comment se passe ta semaine ?",
        "pt": "Como está indo sua semana?",
        "tipo": "pregunta"
      },
      {
        "es": "Está haciendo un calor tremendo",
        "en": "It's so hot out",
        "fr": "Il fait une chaleur terrible",
        "pt": "Está fazendo um calor enorme",
        "tipo": "frase"
      },
      {
        "es": "¿Tienes planes para el fin de semana?",
        "en": "Do you have plans for the weekend?",
        "fr": "Tu as des projets pour le week-end ?",
        "pt": "Você tem planos para o fim de semana?",
        "tipo": "pregunta"
      },
      {
        "es": "Nada nuevo por aquí",
        "en": "Nothing new on my end",
        "fr": "Rien de nouveau de mon côté",
        "pt": "Nada novo por aqui",
        "tipo": "frase"
      },
      {
        "es": "Se nos fue el tiempo volando",
        "en": "Time really flew by",
        "fr": "Le temps a vraiment filé",
        "pt": "O tempo voou",
        "tipo": "modismo"
      },
      {
        "es": "Qué gusto verte por aquí",
        "en": "Good to see you around here",
        "fr": "Ça fait plaisir de te voir par ici",
        "pt": "Que bom te ver por aqui",
        "tipo": "frase"
      },
      {
        "es": "¿Y tú qué cuentas?",
        "en": "So what's up with you?",
        "fr": "Et toi, quoi de neuf ?",
        "pt": "E você, quais são as novidades?",
        "tipo": "pregunta"
      },
      {
        "es": "Mantengámonos en contacto",
        "en": "Let's keep in touch",
        "fr": "Restons en contact",
        "pt": "Vamos manter contato",
        "tipo": "frase"
      },
      {
        "es": "Eres como mi hermano",
        "en": "You're like a brother to me",
        "fr": "Tu es comme un frère pour moi",
        "pt": "Você é como um irmão para mim",
        "tipo": "frase"
      },
      {
        "es": "Hace tiempo no salimos juntos",
        "en": "We haven't hung out in a while",
        "fr": "Ça fait un moment qu'on n'est pas sortis ensemble",
        "pt": "Faz tempo que não saímos juntos",
        "tipo": "frase"
      },
      {
        "es": "Siempre puedes contar conmigo",
        "en": "You can always count on me",
        "fr": "Tu peux toujours compter sur moi",
        "pt": "Você sempre pode contar comigo",
        "tipo": "frase"
      },
      {
        "es": "¿Nos vemos este finde?",
        "en": "Should we meet up this weekend?",
        "fr": "On se voit ce week-end ?",
        "pt": "A gente se vê neste fim de semana?",
        "tipo": "pregunta"
      },
      {
        "es": "Esa broma estuvo buenísima",
        "en": "That joke was hilarious",
        "fr": "Cette blague était excellente",
        "pt": "Essa piada foi ótima",
        "tipo": "frase"
      },
      {
        "es": "Gracias por escucharme",
        "en": "Thanks for listening to me",
        "fr": "Merci de m'avoir écouté",
        "pt": "Obrigado por me ouvir",
        "tipo": "frase"
      },
      {
        "es": "Eres un amigo de verdad",
        "en": "You're a true friend",
        "fr": "Tu es un vrai ami",
        "pt": "Você é um amigo de verdade",
        "tipo": "frase"
      },
      {
        "es": "Vamos a ponernos al día",
        "en": "Let's catch up",
        "fr": "Mettons-nous à jour",
        "pt": "Vamos colocar o papo em dia",
        "tipo": "frase"
      },
      {
        "es": "No cambiaría nuestra amistad por nada",
        "en": "I wouldn't trade our friendship for anything",
        "fr": "Je n'échangerais notre amitié pour rien au monde",
        "pt": "Eu não trocaria nossa amizade por nada",
        "tipo": "frase"
      },
      {
        "es": "Cuenta conmigo para lo que sea",
        "en": "I'm here for whatever you need",
        "fr": "Je suis là pour tout ce dont tu as besoin",
        "pt": "Conte comigo para o que precisar",
        "tipo": "frase"
      },
      {
        "es": "Lamento mucho llegar tarde",
        "en": "I'm really sorry I'm late",
        "fr": "Je suis vraiment désolé d'être en retard",
        "pt": "Sinto muito por chegar tarde",
        "tipo": "frase"
      },
      {
        "es": "Te debo una",
        "en": "I owe you one",
        "fr": "Je t'en dois une",
        "pt": "Fico te devendo uma",
        "tipo": "modismo"
      },
      {
        "es": "Gracias por estar ahí",
        "en": "Thanks for being there",
        "fr": "Merci d'être là",
        "pt": "Obrigado por estar aí",
        "tipo": "frase"
      },
      {
        "es": "Se me complicó algo de último momento",
        "en": "Something came up last minute",
        "fr": "Quelque chose est survenu à la dernière minute",
        "pt": "Surgiu algo de última hora",
        "tipo": "frase"
      },
      {
        "es": "¿Te molesta si cancelo?",
        "en": "Do you mind if I cancel?",
        "fr": "Ça te dérange si j'annule ?",
        "pt": "Você se importa se eu cancelar?",
        "tipo": "pregunta"
      },
      {
        "es": "Cuenta conmigo",
        "en": "Count me in",
        "fr": "Compte sur moi",
        "pt": "Conte comigo",
        "tipo": "frase"
      },
      {
        "es": "No fue mi intención ofenderte",
        "en": "I didn't mean to offend you",
        "fr": "Je ne voulais pas te vexer",
        "pt": "Não foi minha intenção te ofender",
        "tipo": "frase"
      },
      {
        "es": "Hagamos las paces",
        "en": "Let's make up",
        "fr": "Faisons la paix",
        "pt": "Vamos fazer as pazes",
        "tipo": "frase"
      },
      {
        "es": "Me encantaría que vinieras",
        "en": "I'd love for you to come",
        "fr": "J'aimerais beaucoup que tu viennes",
        "pt": "Eu adoraria que você viesse",
        "tipo": "frase"
      },
      {
        "es": "Hablamos pronto",
        "en": "We'll talk soon",
        "fr": "On se parle bientôt",
        "pt": "Falamos em breve",
        "tipo": "frase"
      },
      {
        "es": "¿Me estás tomando el pelo?",
        "en": "Are you pulling my leg?",
        "fr": "Tu me fais marcher ?",
        "pt": "Você está brincando comigo?",
        "tipo": "modismo"
      },
      {
        "es": "¿Lo guardas en secreto?",
        "en": "Will you keep it under your hat?",
        "fr": "Tu gardes ça pour toi ?",
        "pt": "Você guarda isso para você?",
        "tipo": "modismo"
      },
      {
        "es": "¿Puedes mantenerlo en secreto?",
        "en": "Can you keep this under wraps?",
        "fr": "Tu peux garder ça entre nous ?",
        "pt": "Você pode manter isso em segredo?",
        "tipo": "modismo"
      },
      {
        "es": "Échale tierra al asunto",
        "en": "Let's keep it under wraps",
        "fr": "Gardons ça entre nous.",
        "pt": "Vamos manter isso em segredo.",
        "tipo": "modismo"
      },
      {
        "es": "No le des más vueltas, ve al grano",
        "en": "Let's cut to the chase",
        "fr": "Allons droit au but.",
        "pt": "Vamos direto ao ponto.",
        "tipo": "modismo"
      },
      {
        "es": "Hagan las paces",
        "en": "Make up with each other",
        "fr": "Faites la paix",
        "pt": "Façam as pazes",
        "tipo": "modismo"
      },
      {
        "es": "Son tal para cual",
        "en": "They're birds of a feather",
        "fr": "Ils se ressemblent beaucoup.",
        "pt": "Eles são muito parecidos.",
        "tipo": "modismo"
      },
      {
        "es": "No nos llevamos bien",
        "en": "We don't get along",
        "fr": "On ne s'entend pas bien",
        "pt": "Não nos damos bem",
        "tipo": "modismo"
      },
      {
        "es": "Saldremos adelante juntos",
        "en": "We'll get through this together",
        "fr": "Nous nous en sortirons ensemble",
        "pt": "Vamos superar isso juntos",
        "tipo": "modismo"
      },
      {
        "es": "No te eches faroles",
        "en": "Don't put on airs",
        "fr": "Ne te donne pas des airs.",
        "pt": "Não se ache tanto.",
        "tipo": "modismo"
      },
      {
        "es": "Deja de menospreciar a la gente",
        "en": "Stop putting people down",
        "fr": "Arrête de rabaisser les gens",
        "pt": "Pare de menosprezar as pessoas",
        "tipo": "modismo"
      },
      {
        "es": "Estamos de acuerdo en todo",
        "en": "We see eye to eye",
        "fr": "On est sur la même longueur d'onde.",
        "pt": "A gente se entende muito bem.",
        "tipo": "modismo"
      },
      {
        "es": "Cuenta conmigo",
        "en": "I'll stand by you",
        "fr": "Je suis là pour toi",
        "pt": "Estou do seu lado",
        "tipo": "modismo"
      },
      {
        "es": "Es buena gente de verdad",
        "en": "He's a really good egg",
        "fr": "C'est vraiment quelqu'un de bien",
        "pt": "Ele é gente boa de verdade",
        "tipo": "modismo"
      },
      {
        "es": "Personas muy parecidas",
        "en": "Birds of a feather",
        "fr": "Des personnes très semblables.",
        "pt": "Pessoas muito parecidas.",
        "tipo": "modismo"
      },
      {
        "es": "Buena persona",
        "en": "A good egg",
        "fr": "Une bonne personne",
        "pt": "Boa pessoa",
        "tipo": "modismo"
      },
      {
        "es": "¡Eres genial!",
        "en": "You rock!",
        "fr": "Tu es génial !",
        "pt": "Você é demais!",
        "tipo": "frase"
      },
      {
        "es": "¿Tomamos algo?",
        "en": "Fancy a drink?",
        "fr": "On prend un verre ?",
        "pt": "Vamos tomar algo?",
        "tipo": "pregunta"
      },
      {
        "es": "Irse de fiesta, de parranda",
        "en": "Paint the town red",
        "fr": "Sortir faire la fête.",
        "pt": "Sair para comemorar.",
        "tipo": "modismo"
      },
      {
        "es": "Como dos gotas de agua",
        "en": "Like two peas in a pod",
        "fr": "Comme deux gouttes d'eau",
        "pt": "Como duas gotas d'água",
        "tipo": "modismo"
      },
      {
        "es": "¿Te apuntas?, ¿te apetece?",
        "en": "Are you up for it?",
        "fr": "Ça te dit ?",
        "pt": "Você topa?",
        "tipo": "pregunta"
      },
      {
        "es": "Salir a ligar",
        "en": "Be out on the pull",
        "fr": "Sortir pour draguer.",
        "pt": "Sair para paquerar.",
        "tipo": "modismo"
      },
      {
        "es": "Tomarle el pelo a alguien",
        "en": "Pull someone's leg",
        "fr": "Se moquer gentiment de quelqu'un",
        "pt": "Tirar sarro de alguém",
        "tipo": "modismo"
      },
      {
        "es": "¿Tú y cuántos más?",
        "en": "You and what army?",
        "fr": "Toi et quelle armée ?",
        "pt": "Você e quantos mais?",
        "tipo": "frase"
      },
      {
        "es": "Reírse a carcajadas",
        "en": "Crack up",
        "fr": "Rire aux éclats",
        "pt": "Rir às gargalhadas",
        "tipo": "modismo"
      },
      {
        "es": "Tomarte el pelo, bromear",
        "en": "Pulling your leg",
        "fr": "Je te taquine",
        "pt": "Estou brincando com você",
        "tipo": "modismo"
      },
      {
        "es": "Solo te estaba tomando el pelo",
        "en": "I was just pulling your leg",
        "fr": "Je te taquinais seulement",
        "pt": "Eu só estava brincando com você",
        "tipo": "frase"
      },
      {
        "es": "Mejor me retiro solo",
        "en": "I'll show myself out",
        "fr": "Je vais me retirer tout seul",
        "pt": "Melhor eu me retirar sozinho",
        "tipo": "frase"
      },
      {
        "es": "Le faltan algunos tornillos",
        "en": "A few sandwiches short of a picnic",
        "fr": "Il lui manque quelques cases.",
        "pt": "Ele não bate muito bem.",
        "tipo": "modismo"
      },
      {
        "es": "Estoy corriendo como pollo sin cabeza",
        "en": "I'm running around like a headless chicken",
        "fr": "Je cours partout dans tous les sens.",
        "pt": "Estou correndo para todos os lados.",
        "tipo": "modismo"
      },
      {
        "es": "Tengo el cerebro frito",
        "en": "My brain is fried",
        "fr": "J'ai le cerveau grillé",
        "pt": "Meu cérebro está frito",
        "tipo": "modismo"
      },
      {
        "es": "Saldré por mi cuenta",
        "en": "I'll see myself out",
        "fr": "Je vais sortir par moi-même",
        "pt": "Vou sair por minha conta",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "amor",
    "titulo": "Amor",
    "franjaSugerida": "noche",
    "frases": [
      {
        "es": "Me haces muy feliz",
        "en": "You make me really happy",
        "fr": "Tu me rends très heureux",
        "pt": "Você me faz muito feliz",
        "tipo": "frase"
      },
      {
        "es": "Te extrañé todo el día",
        "en": "I missed you all day",
        "fr": "Tu m'as manqué toute la journée",
        "pt": "Senti sua falta o dia todo",
        "tipo": "frase"
      },
      {
        "es": "Eres lo mejor que me ha pasado",
        "en": "You're the best thing that's happened to me",
        "fr": "Tu es la meilleure chose qui me soit arrivée",
        "pt": "Você é a melhor coisa que me aconteceu",
        "tipo": "frase"
      },
      {
        "es": "¿Qué tal una cita esta noche?",
        "en": "How about a date tonight?",
        "fr": "Que dirais-tu d'un rendez-vous ce soir ?",
        "pt": "Que tal um encontro hoje à noite?",
        "tipo": "pregunta"
      },
      {
        "es": "Me encanta pasar tiempo contigo",
        "en": "I love spending time with you",
        "fr": "J'adore passer du temps avec toi",
        "pt": "Adoro passar tempo com você",
        "tipo": "frase"
      },
      {
        "es": "Hablemos las cosas con calma",
        "en": "Let's talk things through calmly",
        "fr": "Parlons-en calmement",
        "pt": "Vamos conversar com calma",
        "tipo": "frase"
      },
      {
        "es": "Perdóname, no quise herirte",
        "en": "I'm sorry, I didn't mean to hurt you",
        "fr": "Pardonne-moi, je ne voulais pas te blesser",
        "pt": "Perdoe-me, eu não quis te machucar",
        "tipo": "frase"
      },
      {
        "es": "Eres mi persona favorita",
        "en": "You're my favorite person",
        "fr": "Tu es ma personne préférée",
        "pt": "Você é minha pessoa favorita",
        "tipo": "frase"
      },
      {
        "es": "Quiero que sepas que cuentas conmigo",
        "en": "I want you to know you can count on me",
        "fr": "Je veux que tu saches que tu peux compter sur moi",
        "pt": "Quero que você saiba que pode contar comigo",
        "tipo": "frase"
      },
      {
        "es": "Te amo con todo el corazón",
        "en": "I love you with all my heart",
        "fr": "Je t'aime de tout mon cœur",
        "pt": "Eu te amo com todo o meu coração",
        "tipo": "frase"
      },
      {
        "es": "Me enamoré de ti poco a poco",
        "en": "I fell for you little by little",
        "fr": "Je suis tombé amoureux de toi petit à petit",
        "pt": "Fui me apaixonando por você aos poucos",
        "tipo": "frase"
      },
      {
        "es": "Eres mi persona",
        "en": "You're my person",
        "fr": "Tu comptes beaucoup pour moi.",
        "pt": "Você é muito importante para mim.",
        "tipo": "modismo"
      },
      {
        "es": "No me canso de mirarte",
        "en": "I never get tired of looking at you",
        "fr": "Je ne me lasse pas de te regarder",
        "pt": "Não me canso de olhar para você",
        "tipo": "frase"
      },
      {
        "es": "Vamos a construir algo lindo juntos",
        "en": "Let's build something beautiful together",
        "fr": "Construisons quelque chose de beau ensemble",
        "pt": "Vamos construir algo bonito juntos",
        "tipo": "frase"
      },
      {
        "es": "Me haces sentir en casa",
        "en": "You make me feel at home",
        "fr": "Tu me fais me sentir chez moi",
        "pt": "Você me faz sentir em casa",
        "tipo": "frase"
      },
      {
        "es": "Lo nuestro vale la pena",
        "en": "What we have is worth it",
        "fr": "Ce que nous avons en vaut la peine",
        "pt": "O que temos vale a pena",
        "tipo": "frase"
      },
      {
        "es": "Quiero envejecer a tu lado",
        "en": "I want to grow old with you",
        "fr": "Je veux vieillir à tes côtés",
        "pt": "Quero envelhecer ao seu lado",
        "tipo": "frase"
      },
      {
        "es": "Discúlpame, me equivoqué",
        "en": "Forgive me, I was wrong",
        "fr": "Excuse-moi, j'ai eu tort",
        "pt": "Desculpe, eu errei",
        "tipo": "frase"
      },
      {
        "es": "Hagamos las paces",
        "en": "Let's make up",
        "fr": "Faisons la paix",
        "pt": "Vamos fazer as pazes",
        "tipo": "frase"
      },
      {
        "es": "Eres mi lugar seguro",
        "en": "You're my safe place",
        "fr": "Tu es mon endroit sûr",
        "pt": "Você é meu lugar seguro",
        "tipo": "frase"
      },
      {
        "es": "Confío plenamente en ti",
        "en": "I trust you completely",
        "fr": "Je te fais entièrement confiance",
        "pt": "Confio plenamente em você",
        "tipo": "frase"
      },
      {
        "es": "Me robaste el corazón",
        "en": "You stole my heart",
        "fr": "Tu m'as volé le cœur",
        "pt": "Você roubou meu coração",
        "tipo": "modismo"
      },
      {
        "es": "Te elijo cada día",
        "en": "I choose you every day",
        "fr": "Je te choisis chaque jour",
        "pt": "Eu escolho você todos os dias",
        "tipo": "frase"
      },
      {
        "es": "No hay nadie como tú",
        "en": "There's no one like you",
        "fr": "Il n'y a personne comme toi",
        "pt": "Não há ninguém como você",
        "tipo": "frase"
      },
      {
        "es": "Vamos a celebrar nuestro aniversario",
        "en": "Let's celebrate our anniversary",
        "fr": "Célébrons notre anniversaire",
        "pt": "Vamos celebrar nosso aniversário",
        "tipo": "frase"
      },
      {
        "es": "Me siento afortunado de tenerte",
        "en": "I feel lucky to have you",
        "fr": "Je me sens chanceux de t'avoir",
        "pt": "Sinto-me sortudo por ter você",
        "tipo": "frase"
      },
      {
        "es": "Hablemos de lo que sentimos",
        "en": "Let's talk about how we feel",
        "fr": "Parlons de ce que nous ressentons",
        "pt": "Vamos falar sobre o que sentimos",
        "tipo": "frase"
      },
      {
        "es": "Estoy loco por ti",
        "en": "I'm crazy about you",
        "fr": "Je suis fou de toi",
        "pt": "Sou louco por você",
        "tipo": "modismo"
      },
      {
        "es": "Construyamos algo duradero",
        "en": "Let's build something lasting",
        "fr": "Construisons quelque chose de durable",
        "pt": "Vamos construir algo duradouro",
        "tipo": "frase"
      },
      {
        "es": "Eres mi razón para sonreír",
        "en": "You're my reason to smile",
        "fr": "Tu es ma raison de sourire",
        "pt": "Você é minha razão para sorrir",
        "tipo": "frase"
      },
      {
        "es": "Le resbala todo",
        "en": "She lets it roll off her back",
        "fr": "Elle ne se laisse pas atteindre.",
        "pt": "Ela não se deixa abalar.",
        "tipo": "modismo"
      },
      {
        "es": "Tenía mariposas en el estómago antes de la cita",
        "en": "He had butterflies before the date",
        "fr": "Il avait le trac avant le rendez-vous.",
        "pt": "Ele estava com frio na barriga antes do encontro.",
        "tipo": "modismo"
      },
      {
        "es": "No le importa el qué dirán",
        "en": "She doesn't care what others think",
        "fr": "Elle se fiche de ce que les autres pensent.",
        "pt": "Ela não liga para o que os outros pensam.",
        "tipo": "modismo"
      },
      {
        "es": "Hicimos las paces tras la pelea",
        "en": "We made up after the argument",
        "fr": "Nous avons fait la paix après la dispute",
        "pt": "Fizemos as pazes depois da briga",
        "tipo": "modismo"
      },
      {
        "es": "Están saliendo juntos",
        "en": "They're seeing each other",
        "fr": "Ils sortent ensemble",
        "pt": "Eles estão saindo juntos",
        "tipo": "modismo"
      },
      {
        "es": "Voy a apoyarte pase lo que pase",
        "en": "I'll stand by you no matter what",
        "fr": "Je vais te soutenir quoi qu'il arrive",
        "pt": "Vou te apoiar aconteça o que acontecer",
        "tipo": "modismo"
      },
      {
        "es": "Aprendí a tolerar sus manías",
        "en": "I learned to put up with his quirks",
        "fr": "J'ai appris à supporter ses manies",
        "pt": "Aprendi a tolerar as manias dele",
        "tipo": "modismo"
      },
      {
        "es": "Superé esa relación",
        "en": "I got over that relationship",
        "fr": "J'ai tourné la page après cette relation.",
        "pt": "Eu superei esse relacionamento.",
        "tipo": "modismo"
      },
      {
        "es": "Tener mariposas en el estómago",
        "en": "Have butterflies in one's stomach",
        "fr": "Avoir le trac.",
        "pt": "Ficar com frio na barriga.",
        "tipo": "modismo"
      },
      {
        "es": "Hacer las paces",
        "en": "Kiss and make up",
        "fr": "Se réconcilier.",
        "pt": "Fazer as pazes.",
        "tipo": "modismo"
      },
      {
        "es": "Estar colado por alguien",
        "en": "Have a crush on someone",
        "fr": "Avoir un faible pour quelqu'un.",
        "pt": "Ter uma quedinha por alguém.",
        "tipo": "modismo"
      },
      {
        "es": "Tener una aventura",
        "en": "Have a fling",
        "fr": "Avoir une aventure",
        "pt": "Ter um caso",
        "tipo": "modismo"
      },
      {
        "es": "Dejar o abandonar a alguien",
        "en": "Drop / ditch someone",
        "fr": "Quitter ou laisser tomber quelqu'un",
        "pt": "Deixar ou abandonar alguém",
        "tipo": "modismo"
      },
      {
        "es": "Cariño",
        "en": "Sweetheart",
        "fr": "Mon cœur",
        "pt": "Meu bem",
        "tipo": "frase"
      },
      {
        "es": "Cariño",
        "en": "Honey",
        "fr": "Mon cœur",
        "pt": "Meu bem",
        "tipo": "frase"
      },
      {
        "es": "Me dejas sin aliento",
        "en": "You take my breath away",
        "fr": "Tu me coupes le souffle",
        "pt": "Você me deixa sem fôlego",
        "tipo": "frase"
      },
      {
        "es": "Te ves espectacular",
        "en": "You look gorgeous",
        "fr": "Tu es magnifique",
        "pt": "Você está espetacular",
        "tipo": "frase"
      },
      {
        "es": "Eres la niña de mis ojos",
        "en": "You are the apple of my eye",
        "fr": "Tu es la prunelle de mes yeux.",
        "pt": "Você é meu xodó.",
        "tipo": "modismo"
      },
      {
        "es": "Tienes un corazón de oro",
        "en": "You have a heart of gold",
        "fr": "Tu as un cœur d'or",
        "pt": "Você tem um coração de ouro",
        "tipo": "modismo"
      },
      {
        "es": "Iluminas mi vida",
        "en": "You light up my life",
        "fr": "Tu illumines ma vie",
        "pt": "Você ilumina minha vida",
        "tipo": "frase"
      },
      {
        "es": "Enamorarse perdidamente",
        "en": "Fall head over heels",
        "fr": "Tomber fou amoureux.",
        "pt": "Apaixonar-se perdidamente.",
        "tipo": "modismo"
      },
      {
        "es": "Me estoy enamorando perdidamente de ti",
        "en": "I'm falling head over heels for you",
        "fr": "Je tombe éperdument amoureux de toi",
        "pt": "Estou me apaixonando perdidamente por você",
        "tipo": "frase"
      },
      {
        "es": "Estar flechado",
        "en": "To be smitten",
        "fr": "Être sous le charme",
        "pt": "Estar encantado",
        "tipo": "modismo"
      },
      {
        "es": "Estoy completamente flechado contigo",
        "en": "I am completely smitten with you",
        "fr": "Je suis complètement sous ton charme",
        "pt": "Estou completamente encantado por você",
        "tipo": "frase"
      },
      {
        "es": "Pareja hecha en el cielo",
        "en": "Match made in heaven",
        "fr": "Un couple fait l'un pour l'autre.",
        "pt": "Um casal feito um para o outro.",
        "tipo": "modismo"
      },
      {
        "es": "Estamos hechos el uno para el otro",
        "en": "We are a match made in heaven",
        "fr": "Nous sommes faits l'un pour l'autre",
        "pt": "Fomos feitos um para o outro",
        "tipo": "frase"
      },
      {
        "es": "Eres mi media naranja",
        "en": "You're my better half",
        "fr": "Tu es ma moitié.",
        "pt": "Você é minha cara-metade.",
        "tipo": "modismo"
      },
      {
        "es": "Significas el mundo para mí",
        "en": "You mean the world to me",
        "fr": "Tu représentes le monde pour moi",
        "pt": "Você significa o mundo para mim",
        "tipo": "frase"
      },
      {
        "es": "Solo tengo ojos para ti",
        "en": "I only have eyes for you",
        "fr": "Je n'ai d'yeux que pour toi",
        "pt": "Só tenho olhos para você",
        "tipo": "frase"
      },
      {
        "es": "Eres mi todo",
        "en": "You're my everything",
        "fr": "Tu es tout pour moi",
        "pt": "Você é meu tudo",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "mascotas",
    "titulo": "Mascotas",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "¿Ya sacaste a pasear al perro?",
        "en": "Did you take the dog out yet?",
        "fr": "Tu as déjà sorti le chien ?",
        "pt": "Você já levou o cachorro para passear?",
        "tipo": "pregunta"
      },
      {
        "es": "Mi gato no me deja dormir",
        "en": "My cat won't let me sleep",
        "fr": "Mon chat ne me laisse pas dormir",
        "pt": "Meu gato não me deixa dormir",
        "tipo": "frase"
      },
      {
        "es": "Tiene que ir al veterinario",
        "en": "He needs to go to the vet",
        "fr": "Il doit aller chez le vétérinaire",
        "pt": "Ele precisa ir ao veterinário",
        "tipo": "frase"
      },
      {
        "es": "Se portó muy bien hoy",
        "en": "He behaved really well today",
        "fr": "Il s'est très bien comporté aujourd'hui",
        "pt": "Ele se comportou muito bem hoje",
        "tipo": "frase"
      },
      {
        "es": "Le encanta que lo consientan",
        "en": "He loves being spoiled",
        "fr": "Il adore qu'on le chouchoute",
        "pt": "Ele adora receber carinho",
        "tipo": "frase"
      },
      {
        "es": "¿Le diste de comer?",
        "en": "Did you feed him?",
        "fr": "Tu lui as donné à manger ?",
        "pt": "Você deu comida para ele?",
        "tipo": "pregunta"
      },
      {
        "es": "Se hizo dueño del sofá",
        "en": "He's taken over the couch",
        "fr": "Il a pris possession du canapé",
        "pt": "Ele tomou conta do sofá",
        "tipo": "modismo"
      },
      {
        "es": "Es parte de la familia",
        "en": "He's part of the family",
        "fr": "Il fait partie de la famille",
        "pt": "Ele faz parte da família",
        "tipo": "frase"
      },
      {
        "es": "Necesita más ejercicio",
        "en": "He needs more exercise",
        "fr": "Il a besoin de plus d'exercice",
        "pt": "Ele precisa de mais exercício",
        "tipo": "frase"
      },
      {
        "es": "Me derrite cada vez que me mira",
        "en": "He melts my heart every time he looks at me",
        "fr": "Il me fait fondre chaque fois qu'il me regarde",
        "pt": "Ele derrete meu coração toda vez que me olha",
        "tipo": "frase"
      },
      {
        "es": "Está creciendo muy rápido",
        "en": "He's growing up so fast",
        "fr": "Il grandit très vite",
        "pt": "Ele está crescendo muito rápido",
        "tipo": "frase"
      },
      {
        "es": "Le tiene miedo a los truenos",
        "en": "He's scared of thunder",
        "fr": "Il a peur du tonnerre",
        "pt": "Ele tem medo de trovões",
        "tipo": "frase"
      },
      {
        "es": "Vamos a bañarlo este fin de semana",
        "en": "Let's give him a bath this weekend",
        "fr": "Nous allons lui donner un bain ce week-end",
        "pt": "Vamos dar banho nele neste fim de semana",
        "tipo": "frase"
      },
      {
        "es": "Aprendió un truco nuevo",
        "en": "He learned a new trick",
        "fr": "Il a appris un nouveau tour",
        "pt": "Ele aprendeu um truque novo",
        "tipo": "frase"
      },
      {
        "es": "Se la pasa durmiendo todo el día",
        "en": "He sleeps all day long",
        "fr": "Il passe toute la journée à dormir",
        "pt": "Ele passa o dia todo dormindo",
        "tipo": "frase"
      },
      {
        "es": "Es bastante juguetón",
        "en": "He's pretty playful",
        "fr": "Il est assez joueur",
        "pt": "Ele é bastante brincalhão",
        "tipo": "frase"
      },
      {
        "es": "Necesita sus vacunas al día",
        "en": "He needs his shots up to date",
        "fr": "Il doit avoir ses vaccins à jour",
        "pt": "Ele precisa estar com as vacinas em dia",
        "tipo": "frase"
      },
      {
        "es": "Le compré un juguete nuevo",
        "en": "I bought him a new toy",
        "fr": "Je lui ai acheté un nouveau jouet",
        "pt": "Comprei um brinquedo novo para ele",
        "tipo": "frase"
      },
      {
        "es": "Se llevan muy bien los dos",
        "en": "The two of them get along really well",
        "fr": "Ils s'entendent très bien tous les deux",
        "pt": "Os dois se dão muito bem",
        "tipo": "frase"
      },
      {
        "es": "Tiene una energía sin límites",
        "en": "He has endless energy",
        "fr": "Il a une énergie sans limites",
        "pt": "Ele tem energia sem limites",
        "tipo": "frase"
      },
      {
        "es": "Está entrenado para sentarse",
        "en": "He's trained to sit",
        "fr": "Il est dressé pour s'asseoir",
        "pt": "Ele é treinado para sentar",
        "tipo": "frase"
      },
      {
        "es": "Le encanta el parque",
        "en": "He loves the park",
        "fr": "Il adore le parc",
        "pt": "Ele adora o parque",
        "tipo": "frase"
      },
      {
        "es": "Me sigue a todos lados",
        "en": "He follows me everywhere",
        "fr": "Il me suit partout",
        "pt": "Ele me segue por todos os lados",
        "tipo": "frase"
      },
      {
        "es": "Es muy cariñoso conmigo",
        "en": "He's very affectionate with me",
        "fr": "Il est très affectueux avec moi",
        "pt": "Ele é muito carinhoso comigo",
        "tipo": "frase"
      },
      {
        "es": "Se asusta con los fuegos artificiales",
        "en": "He gets scared of fireworks",
        "fr": "Il a peur des feux d'artifice",
        "pt": "Ele se assusta com fogos de artifício",
        "tipo": "frase"
      },
      {
        "es": "Voy a adoptar otro pronto",
        "en": "I'm going to adopt another one soon",
        "fr": "Je vais bientôt en adopter un autre",
        "pt": "Vou adotar outro em breve",
        "tipo": "frase"
      },
      {
        "es": "Le encanta que lo rasquen detrás de la oreja",
        "en": "He loves getting scratched behind the ear",
        "fr": "Il adore qu'on lui gratte derrière l'oreille",
        "pt": "Ele adora carinho atrás da orelha",
        "tipo": "frase"
      },
      {
        "es": "Es el rey de la casa",
        "en": "He's the king of the house",
        "fr": "C'est le roi de la maison",
        "pt": "Ele é o rei da casa",
        "tipo": "modismo"
      },
      {
        "es": "No sé qué haría sin él",
        "en": "I don't know what I'd do without him",
        "fr": "Je ne sais pas ce que je ferais sans lui",
        "pt": "Não sei o que faria sem ele",
        "tipo": "frase"
      },
      {
        "es": "Es mi mejor compañía",
        "en": "He's my best company",
        "fr": "C'est ma meilleure compagnie",
        "pt": "Ele é minha melhor companhia",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "salud",
    "titulo": "Salud",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "Amanecí fatal",
        "en": "I woke up feeling awful",
        "fr": "Je me suis réveillé très mal",
        "pt": "Acordei me sentindo péssimo",
        "tipo": "frase"
      },
      {
        "es": "Me duele la cabeza",
        "en": "I have a headache",
        "fr": "J'ai mal à la tête",
        "pt": "Estou com dor de cabeça",
        "tipo": "frase"
      },
      {
        "es": "Necesito desconectarme un poco",
        "en": "I need to unplug for a bit",
        "fr": "J'ai besoin de me déconnecter un peu",
        "pt": "Preciso me desconectar um pouco",
        "tipo": "frase"
      },
      {
        "es": "He estado durmiendo mal",
        "en": "I haven't been sleeping well",
        "fr": "Je dors mal ces derniers temps",
        "pt": "Tenho dormido mal",
        "tipo": "frase"
      },
      {
        "es": "Me siento agotado mentalmente",
        "en": "I feel mentally drained",
        "fr": "Je me sens mentalement épuisé",
        "pt": "Sinto-me mentalmente esgotado",
        "tipo": "frase"
      },
      {
        "es": "Voy a tomarme un respiro",
        "en": "I'm going to take a breather",
        "fr": "Je vais prendre une pause",
        "pt": "Vou tomar um respiro",
        "tipo": "frase"
      },
      {
        "es": "Últimamente ando estresado",
        "en": "I've been stressed lately",
        "fr": "Je suis stressé ces derniers temps",
        "pt": "Ultimamente tenho andado estressado",
        "tipo": "frase"
      },
      {
        "es": "Cuídate mucho",
        "en": "Take good care of yourself",
        "fr": "Prends bien soin de toi",
        "pt": "Cuide-se muito",
        "tipo": "frase"
      },
      {
        "es": "Necesito unas vacaciones urgente",
        "en": "I desperately need a vacation",
        "fr": "J'ai urgemment besoin de vacances",
        "pt": "Preciso urgentemente de férias",
        "tipo": "frase"
      },
      {
        "es": "Estoy intentando cuidar más mi mente",
        "en": "I'm trying to take better care of my mind",
        "fr": "J'essaie de mieux prendre soin de mon esprit",
        "pt": "Estou tentando cuidar melhor da minha mente",
        "tipo": "frase"
      },
      {
        "es": "Estoy un poco abrumado",
        "en": "I'm a bit overwhelmed",
        "fr": "Je suis un peu dépassé",
        "pt": "Estou um pouco sobrecarregado",
        "tipo": "frase"
      },
      {
        "es": "Me siento súper contento",
        "en": "I feel really happy",
        "fr": "Je me sens super content",
        "pt": "Estou super feliz",
        "tipo": "frase"
      },
      {
        "es": "Estoy tenso",
        "en": "I'm on edge",
        "fr": "Je suis à cran.",
        "pt": "Estou no limite.",
        "tipo": "modismo"
      },
      {
        "es": "Eso me hizo el día",
        "en": "That made my day",
        "fr": "Ça a illuminé ma journée",
        "pt": "Isso fez o meu dia",
        "tipo": "modismo"
      },
      {
        "es": "Estoy hecho polvo",
        "en": "I'm wiped out",
        "fr": "Je suis épuisé.",
        "pt": "Estou acabado.",
        "tipo": "modismo"
      },
      {
        "es": "Me da un poco de ansiedad",
        "en": "It gives me a bit of anxiety",
        "fr": "Ça me donne un peu d'anxiété",
        "pt": "Isso me dá um pouco de ansiedade",
        "tipo": "frase"
      },
      {
        "es": "Se me hizo un nudo en el estómago",
        "en": "I got butterflies in my stomach",
        "fr": "J'ai eu une boule au ventre.",
        "pt": "Fiquei com um nó no estômago.",
        "tipo": "modismo"
      },
      {
        "es": "No tengo ánimos hoy",
        "en": "I'm not feeling up to it today",
        "fr": "Je n'ai pas le moral aujourd'hui",
        "pt": "Hoje não estou com ânimo",
        "tipo": "frase"
      },
      {
        "es": "Voy a pedir una cita con el médico",
        "en": "I'm going to book a doctor's appointment",
        "fr": "Je vais prendre rendez-vous chez le médecin",
        "pt": "Vou marcar uma consulta com o médico",
        "tipo": "frase"
      },
      {
        "es": "Tengo que tomarme esto en serio",
        "en": "I need to take this seriously",
        "fr": "Je dois prendre cela au sérieux",
        "pt": "Preciso levar isso a sério",
        "tipo": "frase"
      },
      {
        "es": "Estoy tratando de comer más sano",
        "en": "I'm trying to eat healthier",
        "fr": "J'essaie de manger plus sainement",
        "pt": "Estou tentando comer de forma mais saudável",
        "tipo": "frase"
      },
      {
        "es": "Necesito dormir más temprano",
        "en": "I need to sleep earlier",
        "fr": "J'ai besoin de dormir plus tôt",
        "pt": "Preciso dormir mais cedo",
        "tipo": "frase"
      },
      {
        "es": "Me hizo bien hablarlo con alguien",
        "en": "It helped to talk it out with someone",
        "fr": "Ça m'a fait du bien d'en parler avec quelqu'un",
        "pt": "Fez-me bem falar sobre isso com alguém",
        "tipo": "frase"
      },
      {
        "es": "Hoy me siento con más energía",
        "en": "I feel more energetic today",
        "fr": "Aujourd'hui je me sens avec plus d'énergie",
        "pt": "Hoje me sinto com mais energia",
        "tipo": "frase"
      },
      {
        "es": "Estoy aprendiendo a poner límites",
        "en": "I'm learning to set boundaries",
        "fr": "J'apprends à poser des limites",
        "pt": "Estou aprendendo a colocar limites",
        "tipo": "frase"
      },
      {
        "es": "Eso ya no me afecta tanto",
        "en": "That doesn't get to me as much anymore",
        "fr": "Cela m'affecte moins qu'avant",
        "pt": "Isso já não me afeta tanto",
        "tipo": "frase"
      },
      {
        "es": "Voy mejorando poco a poco",
        "en": "I'm getting better little by little",
        "fr": "Je vais mieux petit à petit",
        "pt": "Estou melhorando pouco a pouco",
        "tipo": "frase"
      },
      {
        "es": "No hay nada como un buen descanso",
        "en": "There's nothing like a good rest",
        "fr": "Rien de tel qu'un bon repos",
        "pt": "Não há nada como um bom descanso",
        "tipo": "frase"
      },
      {
        "es": "Hoy elegí cuidarme",
        "en": "Today I chose to take care of myself",
        "fr": "Aujourd'hui j'ai choisi de prendre soin de moi",
        "pt": "Hoje escolhi cuidar de mim",
        "tipo": "frase"
      },
      {
        "es": "Pedir ayuda también es valiente",
        "en": "Asking for help is brave too",
        "fr": "Demander de l'aide est aussi courageux",
        "pt": "Pedir ajuda também é coragem",
        "tipo": "frase"
      },
      {
        "es": "Ya se recuperó",
        "en": "She's back on her feet",
        "fr": "Elle s'est déjà remise",
        "pt": "Ela já se recuperou",
        "tipo": "modismo"
      },
      {
        "es": "Estaba por los suelos",
        "en": "She was down in the dumps",
        "fr": "Elle avait le moral à zéro.",
        "pt": "Ela estava muito para baixo.",
        "tipo": "modismo"
      },
      {
        "es": "Se sentía decaída",
        "en": "She felt blue",
        "fr": "Elle avait le cafard.",
        "pt": "Ela estava triste.",
        "tipo": "modismo"
      },
      {
        "es": "Aún no está fuera de peligro",
        "en": "He's not out of the woods yet",
        "fr": "Il n'est pas encore tiré d'affaire",
        "pt": "Ele ainda não está fora de perigo",
        "tipo": "modismo"
      },
      {
        "es": "Se puso blanca como el papel",
        "en": "She turned as white as a sheet",
        "fr": "Elle est devenue blanche comme un linge",
        "pt": "Ela ficou branca como papel",
        "tipo": "modismo"
      },
      {
        "es": "Eso fue por los pelos",
        "en": "That was a close shave",
        "fr": "On l'a échappé belle.",
        "pt": "Essa foi por um triz.",
        "tipo": "modismo"
      },
      {
        "es": "Por fin le agarró el truco",
        "en": "I finally got the hang of it",
        "fr": "J'ai enfin pris le coup de main.",
        "pt": "Finalmente peguei o jeito.",
        "tipo": "modismo"
      },
      {
        "es": "No logro superar este resfriado",
        "en": "I can't get over this cold",
        "fr": "Je n'arrive pas à me remettre de ce rhume.",
        "pt": "Não consigo me recuperar deste resfriado.",
        "tipo": "modismo"
      },
      {
        "es": "Tardó en recuperarse",
        "en": "It took her a while to get over it",
        "fr": "Il lui a fallu du temps pour s'en remettre",
        "pt": "Ela demorou para se recuperar",
        "tipo": "modismo"
      },
      {
        "es": "Ese ruido me saca de quicio",
        "en": "That noise gets on my nerves",
        "fr": "Ce bruit me tape sur les nerfs.",
        "pt": "Esse barulho me tira do sério.",
        "tipo": "modismo"
      },
      {
        "es": "Estoy de capa caída",
        "en": "I'm feeling down in the dumps",
        "fr": "Je me sens au plus bas",
        "pt": "Estou para baixo",
        "tipo": "modismo"
      },
      {
        "es": "Hay que asumir una postura firme",
        "en": "You have to take a stand",
        "fr": "Il faut adopter une position ferme",
        "pt": "É preciso assumir uma postura firme",
        "tipo": "modismo"
      },
      {
        "es": "Recuperarse, ponerse de pie otra vez",
        "en": "Back on one's feet",
        "fr": "Se remettre sur pied.",
        "pt": "Voltar a ficar bem.",
        "tipo": "modismo"
      },
      {
        "es": "Ir a peor",
        "en": "Take a turn for the worse",
        "fr": "Empirer",
        "pt": "Piorar",
        "tipo": "modismo"
      },
      {
        "es": "Blanco como el papel",
        "en": "As white as a sheet",
        "fr": "Blanc comme un linge",
        "pt": "Branco como papel",
        "tipo": "modismo"
      },
      {
        "es": "Decaído, triste",
        "en": "Down in the dumps",
        "fr": "Déprimé, triste",
        "pt": "Desanimado, triste",
        "tipo": "modismo"
      },
      {
        "es": "Fuera de peligro",
        "en": "Out of the woods",
        "fr": "Hors de danger",
        "pt": "Fora de perigo",
        "tipo": "modismo"
      },
      {
        "es": "Lleno de energía",
        "en": "Full of beans",
        "fr": "Plein d'énergie.",
        "pt": "Cheio de energia.",
        "tipo": "modismo"
      },
      {
        "es": "Sentirse triste",
        "en": "Feel blue",
        "fr": "Se sentir triste",
        "pt": "Sentir-se triste",
        "tipo": "modismo"
      },
      {
        "es": "Persona sedentaria",
        "en": "Couch potato",
        "fr": "Personne très sédentaire.",
        "pt": "Pessoa muito sedentária.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "dinero",
    "titulo": "Dinero",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "¿Cuánto cuesta esto?",
        "en": "How much is this?",
        "fr": "Combien ça coûte ?",
        "pt": "Quanto custa isso?",
        "tipo": "pregunta"
      },
      {
        "es": "Está carísimo",
        "en": "It's really expensive",
        "fr": "C'est vraiment très cher",
        "pt": "Está caríssimo",
        "tipo": "frase"
      },
      {
        "es": "¿Tiene algún descuento?",
        "en": "Is there any discount?",
        "fr": "Y a-t-il une réduction ?",
        "pt": "Tem algum desconto?",
        "tipo": "pregunta"
      },
      {
        "es": "Esto está a buen precio",
        "en": "This is a good price",
        "fr": "C'est un bon prix",
        "pt": "Isso está a um bom preço",
        "tipo": "frase"
      },
      {
        "es": "Voy a pensarlo",
        "en": "I'll think about it",
        "fr": "Je vais y réfléchir",
        "pt": "Vou pensar sobre isso",
        "tipo": "frase"
      },
      {
        "es": "¿Aceptan tarjeta?",
        "en": "Do you take card?",
        "fr": "Vous acceptez la carte ?",
        "pt": "Vocês aceitam cartão?",
        "tipo": "pregunta"
      },
      {
        "es": "Me quedé corto de dinero",
        "en": "I'm a bit short on cash",
        "fr": "Je suis un peu à court d'argent",
        "pt": "Fiquei meio sem dinheiro",
        "tipo": "frase"
      },
      {
        "es": "Eso sale del presupuesto",
        "en": "That's outside the budget",
        "fr": "Cela dépasse le budget",
        "pt": "Isso está fora do orçamento",
        "tipo": "frase"
      },
      {
        "es": "Quiero devolver esto",
        "en": "I'd like to return this",
        "fr": "Je voudrais retourner ceci",
        "pt": "Quero devolver isto",
        "tipo": "frase"
      },
      {
        "es": "Me sale más a cuenta el otro",
        "en": "The other one's a better deal",
        "fr": "L'autre est une meilleure affaire",
        "pt": "O outro compensa mais",
        "tipo": "frase"
      },
      {
        "es": "Tengo que pasar al banco",
        "en": "I need to stop by the bank",
        "fr": "Je dois passer à la banque",
        "pt": "Preciso passar no banco",
        "tipo": "frase"
      },
      {
        "es": "¿Tiene cita programada?",
        "en": "Do you have an appointment scheduled?",
        "fr": "Avez-vous un rendez-vous prévu ?",
        "pt": "Você tem horário marcado?",
        "tipo": "pregunta"
      },
      {
        "es": "Me tienen esperando una eternidad",
        "en": "They've had me waiting forever",
        "fr": "Ils me font attendre une éternité",
        "pt": "Estão me fazendo esperar uma eternidade",
        "tipo": "frase"
      },
      {
        "es": "Se me venció el trámite",
        "en": "My paperwork expired",
        "fr": "Mes démarches ont expiré",
        "pt": "Meu trâmite venceu",
        "tipo": "frase"
      },
      {
        "es": "Necesito sacar una copia",
        "en": "I need to make a copy",
        "fr": "J'ai besoin de faire une copie",
        "pt": "Preciso tirar uma cópia",
        "tipo": "frase"
      },
      {
        "es": "Estoy ahorrando para algo importante",
        "en": "I'm saving up for something important",
        "fr": "J'économise pour quelque chose d'important",
        "pt": "Estou economizando para algo importante",
        "tipo": "frase"
      },
      {
        "es": "Gasté más de lo que pensaba",
        "en": "I spent more than I thought",
        "fr": "J'ai dépensé plus que je ne pensais",
        "pt": "Gastei mais do que pensava",
        "tipo": "frase"
      },
      {
        "es": "Voy a hacer un presupuesto este mes",
        "en": "I'm going to make a budget this month",
        "fr": "Je vais faire un budget ce mois-ci",
        "pt": "Vou fazer um orçamento este mês",
        "tipo": "frase"
      },
      {
        "es": "Eso no vale lo que cuesta",
        "en": "That's not worth what it costs",
        "fr": "Ça ne vaut pas ce que ça coûte",
        "pt": "Isso não vale o que custa",
        "tipo": "frase"
      },
      {
        "es": "Conviene comprarlo ahora",
        "en": "It's worth buying now",
        "fr": "Ça vaut la peine de l'acheter maintenant",
        "pt": "Vale a pena comprar agora",
        "tipo": "frase"
      },
      {
        "es": "Estoy pagando esto a plazos",
        "en": "I'm paying this off in installments",
        "fr": "Je paie cela en plusieurs fois",
        "pt": "Estou pagando isso em parcelas",
        "tipo": "frase"
      },
      {
        "es": "Se me fue de las manos el gasto",
        "en": "My spending got out of hand",
        "fr": "Mes dépenses sont devenues incontrôlables.",
        "pt": "Meus gastos saíram do controle.",
        "tipo": "modismo"
      },
      {
        "es": "Cada centavo cuenta",
        "en": "Every penny counts",
        "fr": "Chaque centime compte",
        "pt": "Cada centavo conta",
        "tipo": "modismo"
      },
      {
        "es": "Voy a invertir en esto",
        "en": "I'm going to invest in this",
        "fr": "Je vais investir là-dedans",
        "pt": "Vou investir nisso",
        "tipo": "frase"
      },
      {
        "es": "Me cobraron de más",
        "en": "They overcharged me",
        "fr": "Ils m'ont fait payer trop cher",
        "pt": "Cobraram-me a mais",
        "tipo": "frase"
      },
      {
        "es": "Ese precio es un robo",
        "en": "That price is a rip-off",
        "fr": "Ce prix est abusif.",
        "pt": "Esse preço é abusivo.",
        "tipo": "modismo"
      },
      {
        "es": "Aprendí a no gastar de más",
        "en": "I learned not to overspend",
        "fr": "J'ai appris à ne pas trop dépenser",
        "pt": "Aprendi a não gastar demais",
        "tipo": "frase"
      },
      {
        "es": "Eso fue una buena inversión",
        "en": "That was a good investment",
        "fr": "C'était un bon investissement",
        "pt": "Isso foi um bom investimento",
        "tipo": "frase"
      },
      {
        "es": "Tengo que cuadrar las cuentas",
        "en": "I need to balance the books",
        "fr": "Je dois équilibrer les comptes",
        "pt": "Preciso fechar as contas",
        "tipo": "frase"
      },
      {
        "es": "Más vale ahorrar que lamentar",
        "en": "Better to save than to regret it later",
        "fr": "Mieux vaut économiser que le regretter plus tard",
        "pt": "É melhor economizar do que lamentar depois",
        "tipo": "modismo"
      },
      {
        "es": "Guarda algo para tiempos difíciles",
        "en": "Save some money for a rainy day",
        "fr": "Mets de l'argent de côté pour les imprévus.",
        "pt": "Guarde dinheiro para imprevistos.",
        "tipo": "modismo"
      },
      {
        "es": "Están ahorrando cada centavo",
        "en": "They're pinching pennies",
        "fr": "Ils font des économies sur tout.",
        "pt": "Eles estão economizando cada centavo.",
        "tipo": "modismo"
      },
      {
        "es": "Están en aprietos económicos",
        "en": "They're in hot water financially",
        "fr": "Ils sont dans une mauvaise passe financière.",
        "pt": "Eles estão em apuros financeiros.",
        "tipo": "modismo"
      },
      {
        "es": "La bolsa es una montaña rusa",
        "en": "The stock market is like a roller coaster",
        "fr": "La bourse est comme des montagnes russes",
        "pt": "A bolsa é como uma montanha-russa",
        "tipo": "modismo"
      },
      {
        "es": "Lograron llegar a fin de mes",
        "en": "They made ends meet",
        "fr": "Ils ont réussi à joindre les deux bouts.",
        "pt": "Eles conseguiram fechar as contas do mês.",
        "tipo": "modismo"
      },
      {
        "es": "Vive al día",
        "en": "He lives from hand to mouth",
        "fr": "Il vit au jour le jour.",
        "pt": "Ele vive no aperto.",
        "tipo": "modismo"
      },
      {
        "es": "Repasemos las cuentas",
        "en": "Let's go over the accounts",
        "fr": "Repassons les comptes en revue",
        "pt": "Vamos revisar as contas",
        "tipo": "modismo"
      },
      {
        "es": "Voy a invertir en eso",
        "en": "I'm going to go in on that",
        "fr": "Je vais investir dans ça",
        "pt": "Vou investir nisso",
        "tipo": "modismo"
      },
      {
        "es": "Hay que apretarse el cinturón",
        "en": "We need to tighten our belts",
        "fr": "Il faut se serrer la ceinture.",
        "pt": "Precisamos apertar o cinto.",
        "tipo": "modismo"
      },
      {
        "es": "Ahorrar por si vienen tiempos difíciles",
        "en": "Save for a rainy day",
        "fr": "Économiser pour les temps difficiles",
        "pt": "Economizar para tempos difíceis",
        "tipo": "modismo"
      },
      {
        "es": "Llegar a fin de mes",
        "en": "Make ends meet",
        "fr": "Joindre les deux bouts",
        "pt": "Fechar as contas",
        "tipo": "modismo"
      },
      {
        "es": "Ahorrar cada centavo",
        "en": "Pinch pennies",
        "fr": "Économiser chaque centime",
        "pt": "Economizar cada centavo",
        "tipo": "modismo"
      },
      {
        "es": "Es una estafa, un timo",
        "en": "It's a rip-off",
        "fr": "C'est de l'abus.",
        "pt": "É um absurdo de caro.",
        "tipo": "modismo"
      },
      {
        "es": "Vivir del subsidio",
        "en": "Be on the dole",
        "fr": "Toucher le chômage",
        "pt": "Receber auxílio-desemprego",
        "tipo": "modismo"
      },
      {
        "es": "Estamos en paz",
        "en": "We're even",
        "fr": "Nous sommes quittes",
        "pt": "Estamos quites",
        "tipo": "frase"
      },
      {
        "es": "Quédate con el cambio",
        "en": "Keep the change",
        "fr": "Gardez la monnaie",
        "pt": "Fique com o troco",
        "tipo": "frase"
      },
      {
        "es": "Pagar en negro",
        "en": "Pay under the table",
        "fr": "Payer au noir.",
        "pt": "Pagar por fora.",
        "tipo": "modismo"
      },
      {
        "es": "¡Qué clavada!, ¡vaya timo!",
        "en": "What a rip-off!",
        "fr": "Quelle arnaque !",
        "pt": "Que roubo!",
        "tipo": "frase"
      },
      {
        "es": "Estoy sin plata",
        "en": "I'm skint",
        "fr": "Je suis fauché.",
        "pt": "Estou duro.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "tecnologia",
    "titulo": "Tecnología",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "Se me cortó la llamada",
        "en": "My call got cut off",
        "fr": "L'appel a été coupé",
        "pt": "A ligação caiu",
        "tipo": "frase"
      },
      {
        "es": "No me llegó tu mensaje",
        "en": "I didn't get your message",
        "fr": "Je n'ai pas reçu ton message",
        "pt": "Não recebi sua mensagem",
        "tipo": "frase"
      },
      {
        "es": "Te escribo en un rato",
        "en": "I'll text you in a bit",
        "fr": "Je t'écris dans un moment",
        "pt": "Eu te escrevo daqui a pouco",
        "tipo": "frase"
      },
      {
        "es": "Mi celular se apagó",
        "en": "My phone died",
        "fr": "Mon téléphone est mort.",
        "pt": "Meu celular morreu.",
        "tipo": "frase"
      },
      {
        "es": "¿Me puedes mandar el enlace?",
        "en": "Can you send me the link?",
        "fr": "Tu peux m'envoyer le lien ?",
        "pt": "Você pode me mandar o link?",
        "tipo": "pregunta"
      },
      {
        "es": "Está fallando el internet",
        "en": "The internet's acting up",
        "fr": "Internet fonctionne mal",
        "pt": "A internet está falhando",
        "tipo": "frase"
      },
      {
        "es": "Te dejé en visto sin querer",
        "en": "I accidentally left you on read",
        "fr": "Je t'ai laissé en vu sans faire exprès.",
        "pt": "Deixei você no vácuo sem querer.",
        "tipo": "modismo"
      },
      {
        "es": "Vamos a hacer una videollamada",
        "en": "Let's hop on a video call",
        "fr": "Faisons un appel vidéo",
        "pt": "Vamos fazer uma videochamada",
        "tipo": "frase"
      },
      {
        "es": "Mándame eso por correo",
        "en": "Send that to me by email",
        "fr": "Envoie-moi ça par mail",
        "pt": "Mande isso para mim por e-mail",
        "tipo": "frase"
      },
      {
        "es": "Se me trabó la pantalla",
        "en": "My screen froze",
        "fr": "Mon écran s'est figé",
        "pt": "Minha tela travou",
        "tipo": "frase"
      },
      {
        "es": "Necesito actualizar la aplicación",
        "en": "I need to update the app",
        "fr": "Je dois mettre l'application à jour",
        "pt": "Preciso atualizar o aplicativo",
        "tipo": "frase"
      },
      {
        "es": "Se me olvidó la contraseña",
        "en": "I forgot my password",
        "fr": "J'ai oublié mon mot de passe",
        "pt": "Esqueci minha senha",
        "tipo": "frase"
      },
      {
        "es": "Este enlace no funciona",
        "en": "This link is broken",
        "fr": "Ce lien ne fonctionne pas",
        "pt": "Este link não funciona",
        "tipo": "frase"
      },
      {
        "es": "Voy a reiniciar el router",
        "en": "I'm going to restart the router",
        "fr": "Je vais redémarrer le routeur",
        "pt": "Vou reiniciar o roteador",
        "tipo": "frase"
      },
      {
        "es": "¿Tienes el archivo a la mano?",
        "en": "Do you have the file handy?",
        "fr": "Tu as le fichier sous la main ?",
        "pt": "Você tem o arquivo à mão?",
        "tipo": "pregunta"
      },
      {
        "es": "Subí el documento a la nube",
        "en": "I uploaded the document to the cloud",
        "fr": "J'ai téléversé le document dans le nuage",
        "pt": "Subi o documento para a nuvem",
        "tipo": "frase"
      },
      {
        "es": "Se me llenó el almacenamiento",
        "en": "My storage is full",
        "fr": "Mon espace de stockage est plein",
        "pt": "Meu armazenamento está cheio",
        "tipo": "frase"
      },
      {
        "es": "Esta app va muy lenta",
        "en": "This app is so slow",
        "fr": "Cette application est très lente",
        "pt": "Este app está muito lento",
        "tipo": "frase"
      },
      {
        "es": "Activa las notificaciones",
        "en": "Turn on notifications",
        "fr": "Active les notifications",
        "pt": "Ative as notificações",
        "tipo": "frase"
      },
      {
        "es": "Comparte tu pantalla, por favor",
        "en": "Share your screen, please",
        "fr": "Partage ton écran, s'il te plaît",
        "pt": "Compartilhe sua tela, por favor",
        "tipo": "frase"
      },
      {
        "es": "Se me cayó el celular",
        "en": "I dropped my phone",
        "fr": "J'ai fait tomber mon téléphone",
        "pt": "Meu celular caiu",
        "tipo": "frase"
      },
      {
        "es": "Eso quedó desactualizado",
        "en": "That's outdated now",
        "fr": "Cela est devenu obsolète",
        "pt": "Isso ficou desatualizado",
        "tipo": "frase"
      },
      {
        "es": "Voy a respaldar mis archivos",
        "en": "I'm going to back up my files",
        "fr": "Je vais sauvegarder mes fichiers",
        "pt": "Vou fazer backup dos meus arquivos",
        "tipo": "frase"
      },
      {
        "es": "Esta función vino con la última actualización",
        "en": "This feature came with the latest update",
        "fr": "Cette fonction est arrivée avec la dernière mise à jour",
        "pt": "Esta função veio com a última atualização",
        "tipo": "frase"
      },
      {
        "es": "No me deja iniciar sesión",
        "en": "It won't let me log in",
        "fr": "Ça ne me laisse pas me connecter",
        "pt": "Não me deixa fazer login",
        "tipo": "frase"
      },
      {
        "es": "Está en mantenimiento el servidor",
        "en": "The server's under maintenance",
        "fr": "Le serveur est en maintenance",
        "pt": "O servidor está em manutenção",
        "tipo": "frase"
      },
      {
        "es": "Cambié de proveedor de internet",
        "en": "I switched internet providers",
        "fr": "J'ai changé de fournisseur Internet",
        "pt": "Troquei de provedor de internet",
        "tipo": "frase"
      },
      {
        "es": "Voy a silenciar las notificaciones",
        "en": "I'm going to mute notifications",
        "fr": "Je vais couper les notifications",
        "pt": "Vou silenciar as notificações",
        "tipo": "frase"
      },
      {
        "es": "Se desconectó solo",
        "en": "It disconnected on its own",
        "fr": "Ça s'est déconnecté tout seul",
        "pt": "Desconectou sozinho",
        "tipo": "frase"
      },
      {
        "es": "Funciona mejor ahora",
        "en": "It's working better now",
        "fr": "Ça fonctionne mieux maintenant",
        "pt": "Está funcionando melhor agora",
        "tipo": "frase"
      },
      {
        "es": "Estamos en el mismo barco",
        "en": "We're all in the same boat",
        "fr": "Nous sommes tous dans le même bateau",
        "pt": "Estamos todos no mesmo barco",
        "tipo": "modismo"
      },
      {
        "es": "Lo hizo a toda prisa",
        "en": "She did it in a rush",
        "fr": "Elle l'a fait à la va-vite.",
        "pt": "Ela fez isso às pressas.",
        "tipo": "modismo"
      },
      {
        "es": "Voy a encender la computadora",
        "en": "I'm going to boot up the computer",
        "fr": "Je vais allumer l'ordinateur",
        "pt": "Vou ligar o computador",
        "tipo": "modismo"
      },
      {
        "es": "Necesito resolver este error",
        "en": "I need to figure out this error",
        "fr": "Je dois résoudre cette erreur",
        "pt": "Preciso resolver este erro",
        "tipo": "modismo"
      },
      {
        "es": "Tuve que reiniciar todo de cero",
        "en": "I had to start with a clean slate",
        "fr": "J'ai dû repartir de zéro.",
        "pt": "Tive que começar do zero.",
        "tipo": "modismo"
      },
      {
        "es": "La señal va y viene",
        "en": "The signal comes and goes",
        "fr": "Le signal va et vient",
        "pt": "O sinal vai e vem",
        "tipo": "modismo"
      },
      {
        "es": "Encender el computador",
        "en": "Boot up the computer",
        "fr": "Démarrer l'ordinateur",
        "pt": "Ligar o computador",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "comida",
    "titulo": "Comida",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "Una mesa para dos, por favor",
        "en": "A table for two, please",
        "fr": "Une table pour deux, s'il vous plaît",
        "pt": "Uma mesa para dois, por favor",
        "tipo": "frase"
      },
      {
        "es": "¿Qué nos recomienda?",
        "en": "What do you recommend?",
        "fr": "Que nous recommandez-vous ?",
        "pt": "O que vocês recomendam?",
        "tipo": "pregunta"
      },
      {
        "es": "Está para chuparse los dedos",
        "en": "It's finger-licking good",
        "fr": "C'est à s'en lécher les doigts.",
        "pt": "Está de dar água na boca.",
        "tipo": "modismo"
      },
      {
        "es": "La cuenta, por favor",
        "en": "The check, please",
        "fr": "L'addition, s'il vous plaît",
        "pt": "A conta, por favor",
        "tipo": "frase"
      },
      {
        "es": "Quedé satisfecho",
        "en": "I'm full",
        "fr": "Je suis rassasié",
        "pt": "Fiquei satisfeito",
        "tipo": "frase"
      },
      {
        "es": "¿Tienen algo sin gluten?",
        "en": "Do you have anything gluten-free?",
        "fr": "Avez-vous quelque chose sans gluten ?",
        "pt": "Vocês têm algo sem glúten?",
        "tipo": "pregunta"
      },
      {
        "es": "Esto me sobró",
        "en": "I have leftovers",
        "fr": "Il me reste des restes",
        "pt": "Sobrou comida para mim",
        "tipo": "frase"
      },
      {
        "es": "Pedimos demasiado",
        "en": "We ordered too much",
        "fr": "Nous avons trop commandé",
        "pt": "Pedimos demais",
        "tipo": "frase"
      },
      {
        "es": "Se ve delicioso",
        "en": "That looks delicious",
        "fr": "Ça a l'air délicieux",
        "pt": "Parece delicioso",
        "tipo": "frase"
      },
      {
        "es": "¿Aceptan reservaciones?",
        "en": "Do you take reservations?",
        "fr": "Prenez-vous les réservations ?",
        "pt": "Vocês aceitam reservas?",
        "tipo": "pregunta"
      },
      {
        "es": "¿Quieres café o té?",
        "en": "Do you want coffee or tea?",
        "fr": "Tu veux du café ou du thé ?",
        "pt": "Você quer café ou chá?",
        "tipo": "pregunta"
      },
      {
        "es": "Lo necesito cargado",
        "en": "I need it strong",
        "fr": "Je le veux fort",
        "pt": "Preciso dele forte",
        "tipo": "frase"
      },
      {
        "es": "No funciono sin mi café",
        "en": "I don't function without my coffee",
        "fr": "Je ne fonctionne pas sans mon café",
        "pt": "Não funciono sem meu café",
        "tipo": "modismo"
      },
      {
        "es": "¿Ya desayunaste?",
        "en": "Have you had breakfast yet?",
        "fr": "Tu as déjà pris ton petit-déjeuner ?",
        "pt": "Você já tomou café da manhã?",
        "tipo": "pregunta"
      },
      {
        "es": "Voy a comer algo rápido",
        "en": "I'm going to grab a quick bite",
        "fr": "Je vais manger quelque chose rapidement",
        "pt": "Vou comer algo rápido",
        "tipo": "frase"
      },
      {
        "es": "Se me acabó la leche",
        "en": "I ran out of milk",
        "fr": "Je n'ai plus de lait",
        "pt": "Acabou o leite",
        "tipo": "frase"
      },
      {
        "es": "Café para llevar, por favor",
        "en": "Coffee to go, please",
        "fr": "Un café à emporter, s’il vous plaît",
        "pt": "Café para viagem, por favor",
        "tipo": "frase"
      },
      {
        "es": "Me muero de hambre",
        "en": "I'm starving",
        "fr": "Je meurs de faim",
        "pt": "Estou morrendo de fome",
        "tipo": "modismo"
      },
      {
        "es": "¿Pedimos para llevar?",
        "en": "Should we order to go?",
        "fr": "On commande à emporter ?",
        "pt": "Pedimos para levar?",
        "tipo": "pregunta"
      },
      {
        "es": "Comí de más, estoy lleno",
        "en": "I overate, I feel stuffed",
        "fr": "J’ai trop mangé, je suis calé",
        "pt": "Comi demais, estou cheio",
        "tipo": "frase"
      },
      {
        "es": "¿Compartimos esto?",
        "en": "Should we split this?",
        "fr": "On partage ça ?",
        "pt": "Vamos dividir isso?",
        "tipo": "pregunta"
      },
      {
        "es": "Esto está condimentado de más",
        "en": "This is over-seasoned",
        "fr": "C'est trop assaisonné",
        "pt": "Isso está temperado demais",
        "tipo": "frase"
      },
      {
        "es": "Quedó en su punto",
        "en": "It's cooked just right",
        "fr": "C'est cuit juste comme il faut",
        "pt": "Ficou no ponto certo",
        "tipo": "frase"
      },
      {
        "es": "Esta receta es de familia",
        "en": "This recipe's a family one",
        "fr": "Cette recette vient de la famille",
        "pt": "Esta receita é de família",
        "tipo": "frase"
      },
      {
        "es": "Vamos a probar algo nuevo hoy",
        "en": "Let's try something new today",
        "fr": "Essayons quelque chose de nouveau aujourd'hui",
        "pt": "Vamos experimentar algo novo hoje",
        "tipo": "frase"
      },
      {
        "es": "Eso le falta sal",
        "en": "That needs more salt",
        "fr": "Il manque du sel à ça",
        "pt": "Falta sal nisso",
        "tipo": "frase"
      },
      {
        "es": "Huele delicioso desde aquí",
        "en": "It smells delicious from here",
        "fr": "Ça sent délicieux d'ici",
        "pt": "Cheira delicioso daqui",
        "tipo": "frase"
      },
      {
        "es": "No dejé ni las migajas",
        "en": "I didn't leave a crumb",
        "fr": "Je n'ai même pas laissé une miette",
        "pt": "Não deixei nem migalhas",
        "tipo": "modismo"
      },
      {
        "es": "Cociné de más a propósito",
        "en": "I cooked extra on purpose",
        "fr": "J'ai cuisiné plus exprès",
        "pt": "Cozinhei a mais de propósito",
        "tipo": "frase"
      },
      {
        "es": "Esto se come con las manos",
        "en": "You eat this with your hands",
        "fr": "Ça se mange avec les mains",
        "pt": "Isso se come com as mãos",
        "tipo": "frase"
      },
      {
        "es": "Este examen es pan comido",
        "en": "This test is a piece of cake",
        "fr": "Cet examen est un jeu d'enfant.",
        "pt": "Essa prova é moleza.",
        "tipo": "modismo"
      },
      {
        "es": "No reveles el secreto",
        "en": "Don't spill the beans",
        "fr": "Ne vends pas la mèche.",
        "pt": "Não conte o segredo.",
        "tipo": "modismo"
      },
      {
        "es": "Es buena gente",
        "en": "He's a good egg",
        "fr": "C'est quelqu'un de bien",
        "pt": "Ele é gente boa",
        "tipo": "modismo"
      },
      {
        "es": "Despierta y abre los ojos",
        "en": "Wake up and smell the coffee",
        "fr": "Réveille-toi et ouvre les yeux.",
        "pt": "Acorda para a vida.",
        "tipo": "modismo"
      },
      {
        "es": "Lo resolvió sin esfuerzo",
        "en": "She solved it like a hot knife through butter",
        "fr": "Elle l'a résolu très facilement.",
        "pt": "Ela resolveu com muita facilidade.",
        "tipo": "modismo"
      },
      {
        "es": "Se hartó de papas fritas",
        "en": "She pigged out on French fries",
        "fr": "Elle s'est empiffrée de frites.",
        "pt": "Ela se empanturrou de batata frita.",
        "tipo": "modismo"
      },
      {
        "es": "Está lleno de energía hoy",
        "en": "He's full of beans today",
        "fr": "Il est plein d'énergie aujourd'hui",
        "pt": "Ele está cheio de energia hoje",
        "tipo": "modismo"
      },
      {
        "es": "Ese sitio es superior a los demás",
        "en": "That place is a cut above the rest",
        "fr": "Cet endroit est au-dessus du lot.",
        "pt": "Esse lugar está acima dos demais.",
        "tipo": "modismo"
      },
      {
        "es": "Reponte y disfruta la comida",
        "en": "Get over it and enjoy the meal",
        "fr": "Passe à autre chose et profite du repas.",
        "pt": "Deixe isso para lá e aproveite a comida.",
        "tipo": "modismo"
      },
      {
        "es": "Hartarse",
        "en": "Pig out",
        "fr": "Se gaver",
        "pt": "Empanturrar-se",
        "tipo": "modismo"
      },
      {
        "es": "¡A comer!",
        "en": "Dig in!",
        "fr": "Bon appétit !",
        "pt": "Pode começar!",
        "tipo": "frase"
      },
      {
        "es": "Invita la casa",
        "en": "It's on the house",
        "fr": "C'est offert par la maison",
        "pt": "É por conta da casa",
        "tipo": "modismo"
      },
      {
        "es": "¿Te apetece una taza de té?",
        "en": "Fancy a cuppa?",
        "fr": "Tu as envie d'une tasse de thé ?",
        "pt": "Você quer uma xícara de chá?",
        "tipo": "pregunta"
      }
    ]
  },
  {
    "id": "estudio",
    "titulo": "Estudio",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "Tengo examen la próxima semana",
        "en": "I have an exam next week",
        "fr": "J'ai un examen la semaine prochaine",
        "pt": "Tenho prova na próxima semana",
        "tipo": "frase"
      },
      {
        "es": "Me está costando entender esto",
        "en": "I'm struggling to understand this",
        "fr": "J'ai du mal à comprendre cela",
        "pt": "Estou tendo dificuldade para entender isso",
        "tipo": "frase"
      },
      {
        "es": "Saqué buena nota",
        "en": "I got a good grade",
        "fr": "J'ai eu une bonne note",
        "pt": "Tirei uma boa nota",
        "tipo": "frase"
      },
      {
        "es": "Voy a repasar antes del examen",
        "en": "I'm going to review before the exam",
        "fr": "Je vais réviser avant l'examen",
        "pt": "Vou revisar antes da prova",
        "tipo": "frase"
      },
      {
        "es": "Se me complicó esta materia",
        "en": "This subject's been tough for me",
        "fr": "Cette matière a été difficile pour moi",
        "pt": "Essa matéria ficou difícil para mim",
        "tipo": "frase"
      },
      {
        "es": "Por fin entendí",
        "en": "I finally got it",
        "fr": "J'ai enfin compris",
        "pt": "Finalmente entendi",
        "tipo": "frase"
      },
      {
        "es": "Necesito estudiar con más calma",
        "en": "I need to study more carefully",
        "fr": "Je dois étudier plus calmement",
        "pt": "Preciso estudar com mais calma",
        "tipo": "frase"
      },
      {
        "es": "Vamos a hacer un repaso rápido",
        "en": "Let's do a quick review",
        "fr": "Faisons une révision rapide",
        "pt": "Vamos fazer uma revisão rápida",
        "tipo": "frase"
      },
      {
        "es": "Estoy orgulloso de mi esfuerzo",
        "en": "I'm proud of my effort",
        "fr": "Je suis fier de mon effort",
        "pt": "Estou orgulhoso do meu esforço",
        "tipo": "frase"
      },
      {
        "es": "Aprender un idioma toma tiempo",
        "en": "Learning a language takes time",
        "fr": "Apprendre une langue prend du temps",
        "pt": "Aprender um idioma leva tempo",
        "tipo": "frase"
      },
      {
        "es": "Me quedé estudiando hasta tarde",
        "en": "I stayed up late studying",
        "fr": "Je suis resté tard à étudier",
        "pt": "Fiquei estudando até tarde",
        "tipo": "frase"
      },
      {
        "es": "Voy a tomar este curso en línea",
        "en": "I'm going to take this online course",
        "fr": "Je vais suivre ce cours en ligne",
        "pt": "Vou fazer este curso on-line",
        "tipo": "frase"
      },
      {
        "es": "No me alcanzó el tiempo para terminar",
        "en": "I didn't have enough time to finish",
        "fr": "Je n'ai pas eu assez de temps pour finir",
        "pt": "Não tive tempo suficiente para terminar",
        "tipo": "frase"
      },
      {
        "es": "Vamos a formar un grupo de estudio",
        "en": "Let's form a study group",
        "fr": "Formons un groupe d'étude",
        "pt": "Vamos formar um grupo de estudo",
        "tipo": "frase"
      },
      {
        "es": "Esa clase fue muy útil",
        "en": "That class was really helpful",
        "fr": "Ce cours a été très utile",
        "pt": "Essa aula foi muito útil",
        "tipo": "frase"
      },
      {
        "es": "Se me fue la mente en blanco",
        "en": "My mind went blank",
        "fr": "J'ai eu un blanc.",
        "pt": "Me deu um branco.",
        "tipo": "modismo"
      },
      {
        "es": "Necesito un descanso entre tema y tema",
        "en": "I need a break between subjects",
        "fr": "J'ai besoin d'une pause entre les sujets",
        "pt": "Preciso de uma pausa entre um tema e outro",
        "tipo": "frase"
      },
      {
        "es": "Voy a inscribirme en otro semestre",
        "en": "I'm going to enroll for another semester",
        "fr": "Je vais m'inscrire à un autre semestre",
        "pt": "Vou me matricular em outro semestre",
        "tipo": "frase"
      },
      {
        "es": "Por fin se me hizo clic",
        "en": "It finally clicked for me",
        "fr": "J'ai enfin compris.",
        "pt": "Finalmente caiu a ficha para mim.",
        "tipo": "modismo"
      },
      {
        "es": "Practicar es la clave",
        "en": "Practice is key",
        "fr": "La pratique est la clé",
        "pt": "Praticar é a chave",
        "tipo": "frase"
      },
      {
        "es": "Apunté todo lo importante",
        "en": "I wrote down everything important",
        "fr": "J'ai noté tout ce qui était important",
        "pt": "Anotei tudo o que era importante",
        "tipo": "frase"
      },
      {
        "es": "Esa lectura fue densa",
        "en": "That reading was dense",
        "fr": "Cette lecture était dense",
        "pt": "Essa leitura foi densa",
        "tipo": "frase"
      },
      {
        "es": "Vamos paso a paso con esto",
        "en": "Let's go through this step by step",
        "fr": "Allons-y étape par étape",
        "pt": "Vamos passo a passo com isso",
        "tipo": "frase"
      },
      {
        "es": "Me equivoqué, pero aprendí",
        "en": "I made a mistake, but I learned",
        "fr": "Je me suis trompé, mais j'ai appris",
        "pt": "Errei, mas aprendi",
        "tipo": "frase"
      },
      {
        "es": "Necesito mejorar mi pronunciación",
        "en": "I need to improve my pronunciation",
        "fr": "Je dois améliorer ma prononciation",
        "pt": "Preciso melhorar minha pronúncia",
        "tipo": "frase"
      },
      {
        "es": "Cada error es una lección",
        "en": "Every mistake is a lesson",
        "fr": "Chaque erreur est une leçon",
        "pt": "Cada erro é uma lição",
        "tipo": "frase"
      },
      {
        "es": "Voy a pedir ayuda al profesor",
        "en": "I'm going to ask the teacher for help",
        "fr": "Je vais demander de l'aide au professeur",
        "pt": "Vou pedir ajuda ao professor",
        "tipo": "frase"
      },
      {
        "es": "Esto se entiende mejor con ejemplos",
        "en": "This makes more sense with examples",
        "fr": "Cela se comprend mieux avec des exemples",
        "pt": "Isso se entende melhor com exemplos",
        "tipo": "frase"
      },
      {
        "es": "Estudiar de noche no me funciona",
        "en": "Studying at night doesn't work for me",
        "fr": "Étudier la nuit ne marche pas pour moi",
        "pt": "Estudar à noite não funciona para mim",
        "tipo": "frase"
      },
      {
        "es": "Lo logré gracias a la constancia",
        "en": "I made it thanks to consistency",
        "fr": "J'y suis arrivé grâce à la constance",
        "pt": "Consegui graças à constância",
        "tipo": "frase"
      },
      {
        "es": "Es hora de empezar de cero",
        "en": "It's time to start with a clean slate",
        "fr": "Il est temps de repartir de zéro",
        "pt": "É hora de começar do zero",
        "tipo": "modismo"
      },
      {
        "es": "Estaba totalmente perdido",
        "en": "I was all at sea",
        "fr": "J'étais complètement perdu.",
        "pt": "Eu estava completamente perdido.",
        "tipo": "modismo"
      },
      {
        "es": "Lo logró con una mano atada a la espalda",
        "en": "He did it with one hand tied behind his back",
        "fr": "Il l'a fait les doigts dans le nez.",
        "pt": "Ele fez isso com um pé nas costas.",
        "tipo": "modismo"
      },
      {
        "es": "Por fin lo entendí de golpe",
        "en": "It came to me out of the blue",
        "fr": "Ça m'est venu d'un coup.",
        "pt": "Isso me veio do nada.",
        "tipo": "modismo"
      },
      {
        "es": "No sabía ni jota del tema",
        "en": "I didn't know beans about it",
        "fr": "Je n'y connaissais rien.",
        "pt": "Eu não entendia nada do assunto.",
        "tipo": "modismo"
      },
      {
        "es": "Lo resolvió de cabeza",
        "en": "She figured it out in her head",
        "fr": "Elle l'a résolu de tête.",
        "pt": "Ela resolveu de cabeça.",
        "tipo": "modismo"
      },
      {
        "es": "Tengo que reponer el examen",
        "en": "I have to make up the test",
        "fr": "Je dois repasser l'examen",
        "pt": "Tenho que fazer a prova de reposição",
        "tipo": "modismo"
      },
      {
        "es": "Repasemos esto antes de la clase",
        "en": "Let's go over this before class",
        "fr": "Révisons cela avant le cours",
        "pt": "Vamos revisar isso antes da aula",
        "tipo": "modismo"
      },
      {
        "es": "Voy a entrar en detalles",
        "en": "I'll go into the details",
        "fr": "Je vais entrer dans les détails",
        "pt": "Vou entrar em detalhes",
        "tipo": "modismo"
      },
      {
        "es": "Sigue, vas bien",
        "en": "Go on, you're doing fine",
        "fr": "Continue, tu t’en sors bien",
        "pt": "Continue, você está indo bem",
        "tipo": "modismo"
      },
      {
        "es": "Lo resolví por mi cuenta",
        "en": "I figured it out on my own",
        "fr": "J'ai trouvé la solution tout seul.",
        "pt": "Resolvi sozinho.",
        "tipo": "modismo"
      },
      {
        "es": "Es lo mejor que hay",
        "en": "It's the best thing since sliced bread",
        "fr": "C'est ce qu'il y a de mieux.",
        "pt": "É o máximo.",
        "tipo": "modismo"
      },
      {
        "es": "Estudiar hasta muy tarde",
        "en": "Burn the midnight oil",
        "fr": "Étudier très tard",
        "pt": "Estudar até muito tarde",
        "tipo": "modismo"
      },
      {
        "es": "Agarrarle el truco a algo",
        "en": "Get the hang of something",
        "fr": "Prendre le coup de main de quelque chose",
        "pt": "Pegar o jeito de algo",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "deportes",
    "titulo": "Deportes",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "¿A qué hora es el partido?",
        "en": "What time's the game?",
        "fr": "À quelle heure est le match ?",
        "pt": "A que horas é o jogo?",
        "tipo": "pregunta"
      },
      {
        "es": "Vamos a hacer ejercicio juntos",
        "en": "Let's work out together",
        "fr": "Faisons du sport ensemble",
        "pt": "Vamos fazer exercício juntos",
        "tipo": "frase"
      },
      {
        "es": "Quedé agotado después del entrenamiento",
        "en": "I was exhausted after training",
        "fr": "J'étais épuisé après l'entraînement",
        "pt": "Fiquei exausto depois do treino",
        "tipo": "frase"
      },
      {
        "es": "¿Quién va ganando?",
        "en": "Who's winning?",
        "fr": "Qui gagne ?",
        "pt": "Quem está ganhando?",
        "tipo": "pregunta"
      },
      {
        "es": "Empataron en el último minuto",
        "en": "They tied in the last minute",
        "fr": "Ils ont égalisé à la dernière minute",
        "pt": "Eles empataram no último minuto",
        "tipo": "frase"
      },
      {
        "es": "Necesito estirar antes de correr",
        "en": "I need to stretch before running",
        "fr": "Je dois m'étirer avant de courir",
        "pt": "Preciso alongar antes de correr",
        "tipo": "frase"
      },
      {
        "es": "Hoy toca pierna en el gimnasio",
        "en": "Today's leg day at the gym",
        "fr": "Aujourd'hui c'est le jour des jambes à la salle",
        "pt": "Hoje é dia de perna na academia",
        "tipo": "frase"
      },
      {
        "es": "Perdimos por poco",
        "en": "We lost by a little",
        "fr": "Nous avons perdu de peu",
        "pt": "Perdemos por pouco",
        "tipo": "frase"
      },
      {
        "es": "Vamos a calentar primero",
        "en": "Let's warm up first",
        "fr": "Échauffons-nous d'abord",
        "pt": "Vamos aquecer primeiro",
        "tipo": "frase"
      },
      {
        "es": "Estoy entrenando para una carrera",
        "en": "I'm training for a race",
        "fr": "Je m'entraîne pour une course",
        "pt": "Estou treinando para uma corrida",
        "tipo": "frase"
      },
      {
        "es": "Metieron gol en el último segundo",
        "en": "They scored in the last second",
        "fr": "Ils ont marqué à la dernière seconde",
        "pt": "Fizeram gol no último segundo",
        "tipo": "frase"
      },
      {
        "es": "Hoy no tengo ganas de entrenar",
        "en": "I don't feel like working out today",
        "fr": "Je n'ai pas envie de m'entraîner aujourd'hui",
        "pt": "Hoje não estou com vontade de treinar",
        "tipo": "frase"
      },
      {
        "es": "Hay que mantenerse en forma",
        "en": "You've got to stay in shape",
        "fr": "Il faut rester en forme",
        "pt": "É preciso manter-se em forma",
        "tipo": "frase"
      },
      {
        "es": "Esa jugada fue increíble",
        "en": "That play was amazing",
        "fr": "Cette action était incroyable",
        "pt": "Essa jogada foi incrível",
        "tipo": "frase"
      },
      {
        "es": "Vamos a empezar con calentamiento ligero",
        "en": "Let's start with a light warm-up",
        "fr": "Commençons par un échauffement léger",
        "pt": "Vamos começar com um aquecimento leve",
        "tipo": "frase"
      },
      {
        "es": "Me lesioné el tobillo",
        "en": "I hurt my ankle",
        "fr": "Je me suis blessé à la cheville",
        "pt": "Machucou meu tornozelo",
        "tipo": "frase"
      },
      {
        "es": "El equipo jugó en grande",
        "en": "The team played their hearts out",
        "fr": "L'équipe a tout donné.",
        "pt": "O time deu tudo de si.",
        "tipo": "modismo"
      },
      {
        "es": "¿Vienes a correr conmigo mañana?",
        "en": "Are you coming for a run with me tomorrow?",
        "fr": "Tu viens courir avec moi demain ?",
        "pt": "Você vem correr comigo amanhã?",
        "tipo": "pregunta"
      },
      {
        "es": "Le dieron vuelta al marcador",
        "en": "They turned the score around",
        "fr": "Ils ont renversé le score",
        "pt": "Eles viraram o placar",
        "tipo": "modismo"
      },
      {
        "es": "Estoy mejorando mi resistencia",
        "en": "I'm building up my endurance",
        "fr": "J'améliore mon endurance",
        "pt": "Estou melhorando minha resistência",
        "tipo": "frase"
      },
      {
        "es": "Vamos a ver el partido en mi casa",
        "en": "Let's watch the game at my place",
        "fr": "Regardons le match chez moi",
        "pt": "Vamos assistir ao jogo na minha casa",
        "tipo": "frase"
      },
      {
        "es": "Quedé sin aire",
        "en": "I'm out of breath",
        "fr": "Je suis à bout de souffle",
        "pt": "Fiquei sem fôlego",
        "tipo": "frase"
      },
      {
        "es": "Esta semana entreno tres veces",
        "en": "I'm training three times this week",
        "fr": "Cette semaine je m'entraîne trois fois",
        "pt": "Esta semana treino três vezes",
        "tipo": "frase"
      },
      {
        "es": "El árbitro se equivocó",
        "en": "The referee made a mistake",
        "fr": "L'arbitre s'est trompé",
        "pt": "O árbitro errou",
        "tipo": "frase"
      },
      {
        "es": "Dieron lo mejor de sí",
        "en": "They gave it their all",
        "fr": "Ils ont donné le meilleur d'eux-mêmes",
        "pt": "Deram o melhor de si",
        "tipo": "frase"
      },
      {
        "es": "Vamos por la revancha",
        "en": "Let's go for a rematch",
        "fr": "Allons chercher la revanche",
        "pt": "Vamos pela revanche",
        "tipo": "frase"
      },
      {
        "es": "Subió mucho su nivel",
        "en": "His level has improved a lot",
        "fr": "Son niveau s'est beaucoup amélioré",
        "pt": "O nível dele melhorou muito",
        "tipo": "frase"
      },
      {
        "es": "Es mi equipo favorito desde niño",
        "en": "It's been my favorite team since I was a kid",
        "fr": "C'est mon équipe préférée depuis que je suis enfant",
        "pt": "É meu time favorito desde criança",
        "tipo": "frase"
      },
      {
        "es": "Hoy rompí mi propio récord",
        "en": "I broke my own record today",
        "fr": "Aujourd'hui j'ai battu mon propre record",
        "pt": "Hoje bati meu próprio recorde",
        "tipo": "frase"
      },
      {
        "es": "El esfuerzo vale la pena",
        "en": "The effort is worth it",
        "fr": "L'effort en vaut la peine",
        "pt": "O esforço vale a pena",
        "tipo": "frase"
      },
      {
        "es": "Cogió el toro por los cuernos",
        "en": "She took the bull by the horns",
        "fr": "Elle a pris le taureau par les cornes.",
        "pt": "Ela encarou a situação de frente.",
        "tipo": "modismo"
      },
      {
        "es": "Trabajan sin descanso",
        "en": "They're working their fingers to the bone",
        "fr": "Ils travaillent d'arrache-pied.",
        "pt": "Eles estão trabalhando duro.",
        "tipo": "modismo"
      },
      {
        "es": "Trabaja de sol a sol",
        "en": "He works from dawn till dusk",
        "fr": "Il travaille du matin au soir",
        "pt": "Ele trabalha de sol a sol",
        "tipo": "modismo"
      },
      {
        "es": "La situación empeoró",
        "en": "The situation took a turn for the worse",
        "fr": "La situation a empiré",
        "pt": "A situação piorou",
        "tipo": "modismo"
      },
      {
        "es": "No llegamos a ningún lado",
        "en": "We're getting nowhere",
        "fr": "Nous n'allons nulle part",
        "pt": "Não chegamos a lugar nenhum",
        "tipo": "modismo"
      },
      {
        "es": "Es el menos conocido de la competencia",
        "en": "He's the dark horse of the competition",
        "fr": "C'est l'outsider de la compétition.",
        "pt": "Ele é o azarão da competição.",
        "tipo": "modismo"
      },
      {
        "es": "Llegó en la última etapa de la carrera",
        "en": "He came in on the last leg of the race",
        "fr": "Il est arrivé dans la dernière étape de la course",
        "pt": "Ele chegou na última etapa da corrida",
        "tipo": "modismo"
      },
      {
        "es": "Madrugó para entrenar",
        "en": "He's an early bird at training",
        "fr": "Il s'est levé tôt pour s'entraîner",
        "pt": "Ele acordou cedo para treinar",
        "tipo": "modismo"
      },
      {
        "es": "Dio el todo por el todo",
        "en": "He gave it his all",
        "fr": "Il a tout donné",
        "pt": "Ele deu tudo de si",
        "tipo": "modismo"
      },
      {
        "es": "No se rindió, siguió",
        "en": "He didn't give up, he went on",
        "fr": "Il n’a pas lâché, il a continué",
        "pt": "Ele não desistiu, seguiu em frente",
        "tipo": "modismo"
      },
      {
        "es": "Última parte de una carrera",
        "en": "Last leg of a race",
        "fr": "Dernière partie d'une course",
        "pt": "Última parte de uma corrida",
        "tipo": "modismo"
      },
      {
        "es": "Sin esfuerzo no hay logro",
        "en": "No pain, no gain",
        "fr": "Sans effort, pas de progrès",
        "pt": "Sem esforço, sem resultado",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "cotidiano",
    "titulo": "Expresiones cotidianas",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "Llueve a cántaros",
        "en": "It's raining cats and dogs",
        "fr": "Il pleut des cordes.",
        "pt": "Está chovendo muito.",
        "tipo": "modismo"
      },
      {
        "es": "Pan comido",
        "en": "A piece of cake",
        "fr": "Très facile",
        "pt": "Moleza",
        "tipo": "modismo"
      },
      {
        "es": "Perder la oportunidad",
        "en": "Miss the boat",
        "fr": "Rater le coche.",
        "pt": "Perder a oportunidade.",
        "tipo": "modismo"
      },
      {
        "es": "Guardarlo en secreto",
        "en": "Keep it under your hat",
        "fr": "Garder ça pour soi.",
        "pt": "Guardar segredo.",
        "tipo": "modismo"
      },
      {
        "es": "En un abrir y cerrar de ojos",
        "en": "In the blink of an eye",
        "fr": "En un clin d'œil",
        "pt": "Num piscar de olhos",
        "tipo": "modismo"
      },
      {
        "es": "Matar dos pájaros de un tiro",
        "en": "Kill two birds with one stone",
        "fr": "Faire d'une pierre deux coups",
        "pt": "Matar dois coelhos com uma cajadada só",
        "tipo": "modismo"
      },
      {
        "es": "Entre la espada y la pared",
        "en": "Between the devil and the deep blue sea",
        "fr": "Être entre le marteau et l'enclume.",
        "pt": "Estar entre a cruz e a espada.",
        "tipo": "modismo"
      },
      {
        "es": "Por poco, por un pelo",
        "en": "A close shave",
        "fr": "De justesse.",
        "pt": "Por um triz.",
        "tipo": "modismo"
      },
      {
        "es": "Los buenos viejos tiempos",
        "en": "The good old days",
        "fr": "Le bon vieux temps",
        "pt": "Os bons velhos tempos",
        "tipo": "modismo"
      },
      {
        "es": "Me suena",
        "en": "Ring a bell",
        "fr": "Ça me dit quelque chose.",
        "pt": "Isso me soa familiar.",
        "tipo": "modismo"
      },
      {
        "es": "Empezar con borrón y cuenta nueva",
        "en": "Start with a clean slate",
        "fr": "Repartir de zéro.",
        "pt": "Começar do zero.",
        "tipo": "modismo"
      },
      {
        "es": "Coger el toro por los cuernos",
        "en": "Take the bull by the horns",
        "fr": "Prendre le taureau par les cornes",
        "pt": "Pegar o touro pelos chifres",
        "tipo": "modismo"
      },
      {
        "es": "Sumarse a la tendencia",
        "en": "Jump on the bandwagon",
        "fr": "Suivre le mouvement.",
        "pt": "Entrar na onda.",
        "tipo": "modismo"
      },
      {
        "es": "Darse cuenta",
        "en": "See the light",
        "fr": "Comprendre enfin",
        "pt": "Cair a ficha",
        "tipo": "modismo"
      },
      {
        "es": "No dejar piedra sin remover",
        "en": "Leave no stone unturned",
        "fr": "Ne rien laisser au hasard.",
        "pt": "Não deixar nada passar.",
        "tipo": "modismo"
      },
      {
        "es": "Lanzar un reto",
        "en": "Throw down the gauntlet",
        "fr": "Lancer un défi",
        "pt": "Lançar um desafio",
        "tipo": "modismo"
      },
      {
        "es": "Clavarlo",
        "en": "Nail it",
        "fr": "Assurer",
        "pt": "Mandar bem",
        "tipo": "modismo"
      },
      {
        "es": "Dar en el clavo",
        "en": "Hit the nail on the head",
        "fr": "Mettre le doigt dessus",
        "pt": "Acertar em cheio",
        "tipo": "modismo"
      },
      {
        "es": "Estar en la misma situación",
        "en": "In the same boat",
        "fr": "Être dans la même situation.",
        "pt": "Estar na mesma situação.",
        "tipo": "modismo"
      },
      {
        "es": "Mantenerse al margen de problemas",
        "en": "Keep one's nose clean",
        "fr": "Rester à l'écart des problèmes",
        "pt": "Manter-se longe de problemas",
        "tipo": "modismo"
      },
      {
        "es": "Dejar que algo le resbale a uno",
        "en": "Let it roll off one's back",
        "fr": "Ne pas se laisser atteindre.",
        "pt": "Não se deixar abalar.",
        "tipo": "modismo"
      },
      {
        "es": "Levantarse con el pie izquierdo",
        "en": "Get up on the wrong side of the bed",
        "fr": "Se lever du mauvais pied",
        "pt": "Acordar com o pé esquerdo",
        "tipo": "modismo"
      },
      {
        "es": "Perder los estribos",
        "en": "Blow one's top",
        "fr": "Perdre son sang-froid",
        "pt": "Perder a cabeça",
        "tipo": "modismo"
      },
      {
        "es": "Arriesgarse",
        "en": "Go out on a limb",
        "fr": "Prendre un risque",
        "pt": "Arriscar-se",
        "tipo": "modismo"
      },
      {
        "es": "Mantener en secreto",
        "en": "Keep under wraps",
        "fr": "Garder secret",
        "pt": "Manter em segredo",
        "tipo": "modismo"
      },
      {
        "es": "No llegar a ninguna parte",
        "en": "Get nowhere",
        "fr": "N'arriver à rien",
        "pt": "Não chegar a lugar nenhum",
        "tipo": "modismo"
      },
      {
        "es": "Echar leña al fuego",
        "en": "Add fuel to the fire",
        "fr": "Jeter de l'huile sur le feu",
        "pt": "Jogar lenha na fogueira",
        "tipo": "modismo"
      },
      {
        "es": "Aceptarlo sin quejarse",
        "en": "Take it on the chin",
        "fr": "L'accepter sans se plaindre",
        "pt": "Aceitar sem reclamar",
        "tipo": "modismo"
      },
      {
        "es": "A toda prisa",
        "en": "In a rush",
        "fr": "À toute vitesse",
        "pt": "Às pressas",
        "tipo": "frase"
      },
      {
        "es": "Con los ojos cerrados, con mucha facilidad",
        "en": "With one hand tied behind one's back",
        "fr": "Avec une grande facilité.",
        "pt": "Com um pé nas costas.",
        "tipo": "modismo"
      },
      {
        "es": "Perdido, confundido",
        "en": "All at sea",
        "fr": "Complètement perdu.",
        "pt": "Completamente perdido.",
        "tipo": "modismo"
      },
      {
        "es": "Engañar, vender humo",
        "en": "Sell someone a bridge",
        "fr": "Faire croire n'importe quoi à quelqu'un.",
        "pt": "Passar a perna em alguém.",
        "tipo": "modismo"
      },
      {
        "es": "Causar sensación",
        "en": "Make a splash",
        "fr": "Faire sensation",
        "pt": "Causar sensação",
        "tipo": "modismo"
      },
      {
        "es": "Con extrema facilidad",
        "en": "Like a hot knife through butter",
        "fr": "Avec une facilité déconcertante.",
        "pt": "Com muita facilidade.",
        "tipo": "modismo"
      },
      {
        "es": "Aprovechar la oportunidad al instante",
        "en": "Jump at the chance",
        "fr": "Saisir l'occasion immédiatement",
        "pt": "Aproveitar a oportunidade imediatamente",
        "tipo": "modismo"
      },
      {
        "es": "Escaparse de las manos",
        "en": "Slip through one's fingers",
        "fr": "Filer entre les doigts.",
        "pt": "Escapar por entre os dedos.",
        "tipo": "modismo"
      },
      {
        "es": "Como una montaña rusa",
        "en": "Like a roller coaster",
        "fr": "Comme des montagnes russes",
        "pt": "Como uma montanha-russa",
        "tipo": "modismo"
      },
      {
        "es": "En problemas, en un aprieto",
        "en": "In hot water",
        "fr": "Dans de beaux draps.",
        "pt": "Em apuros.",
        "tipo": "modismo"
      },
      {
        "es": "Importarle un comino",
        "en": "Not give a damn",
        "fr": "S'en ficher complètement.",
        "pt": "Não estar nem aí.",
        "tipo": "modismo"
      },
      {
        "es": "Resistir el paso del tiempo",
        "en": "Stand the test of time",
        "fr": "Résister à l'épreuve du temps",
        "pt": "Resistir ao passar do tempo",
        "tipo": "modismo"
      },
      {
        "es": "Una persona madrugadora",
        "en": "An early bird",
        "fr": "Une personne matinale",
        "pt": "Uma pessoa madrugadora",
        "tipo": "modismo"
      },
      {
        "es": "Revelar el secreto",
        "en": "Spill the beans",
        "fr": "Vendre la mèche.",
        "pt": "Contar o segredo.",
        "tipo": "modismo"
      },
      {
        "es": "No saber ni jota",
        "en": "Not know beans",
        "fr": "Ne rien y connaître.",
        "pt": "Não entender nada do assunto.",
        "tipo": "modismo"
      },
      {
        "es": "De la nada",
        "en": "Out of the blue",
        "fr": "Sans prévenir",
        "pt": "Do nada",
        "tipo": "modismo"
      },
      {
        "es": "Lo mejor que hay",
        "en": "Best thing since sliced bread",
        "fr": "Ce qu'il y a de mieux",
        "pt": "O melhor que existe",
        "tipo": "modismo"
      },
      {
        "es": "Adivinar, especular",
        "en": "Take a shot in the dark",
        "fr": "Tenter au hasard.",
        "pt": "Chutar no escuro.",
        "tipo": "modismo"
      },
      {
        "es": "Talento oculto",
        "en": "A dark horse",
        "fr": "Un outsider",
        "pt": "Uma surpresa",
        "tipo": "modismo"
      },
      {
        "es": "Superior a los demás",
        "en": "A cut above the rest",
        "fr": "Au-dessus du lot",
        "pt": "Superior aos demais",
        "tipo": "modismo"
      },
      {
        "es": "Inquieto, preocupado por algo",
        "en": "In a stew about something",
        "fr": "Se faire du souci pour quelque chose.",
        "pt": "Estar preocupado com algo.",
        "tipo": "modismo"
      },
      {
        "es": "Sacar de quicio",
        "en": "Get on one's nerves",
        "fr": "Taper sur les nerfs.",
        "pt": "Tirar do sério.",
        "tipo": "modismo"
      },
      {
        "es": "Tener ventaja",
        "en": "Get a leg up",
        "fr": "Avoir un coup de pouce",
        "pt": "Ter uma vantagem",
        "tipo": "modismo"
      },
      {
        "es": "Empezar de cero",
        "en": "Start from scratch",
        "fr": "Recommencer de zéro",
        "pt": "Começar do zero",
        "tipo": "modismo"
      },
      {
        "es": "Antes",
        "en": "Back in the day",
        "fr": "À l'époque",
        "pt": "Naquela época",
        "tipo": "modismo"
      },
      {
        "es": "¡Qué lata!, ¡qué fastidio!",
        "en": "What a drag!",
        "fr": "Quelle galère !",
        "pt": "Que saco!, que chatice!",
        "tipo": "frase"
      },
      {
        "es": "¡Date prisa!",
        "en": "Hurry up!",
        "fr": "Dépêche-toi !",
        "pt": "Depressa!",
        "tipo": "frase"
      },
      {
        "es": "Cuanto antes, mejor",
        "en": "The sooner the better",
        "fr": "Le plus tôt sera le mieux",
        "pt": "Quanto antes, melhor",
        "tipo": "frase"
      },
      {
        "es": "Preparados, listos, ya",
        "en": "Ready, steady, go!",
        "fr": "À vos marques, prêts, partez !",
        "pt": "Preparados, prontos, já!",
        "tipo": "frase"
      },
      {
        "es": "Hacer un recado",
        "en": "Run an errand",
        "fr": "Faire une course",
        "pt": "Fazer um recado",
        "tipo": "frase"
      },
      {
        "es": "Es heterosexual",
        "en": "He's straight",
        "fr": "Il est hétérosexuel",
        "pt": "Ele é heterossexual",
        "tipo": "frase"
      },
      {
        "es": "Estoy en racha",
        "en": "I'm on a roll",
        "fr": "Je suis lancé.",
        "pt": "Estou numa boa fase.",
        "tipo": "modismo"
      },
      {
        "es": "De ahora en adelante",
        "en": "From now on",
        "fr": "À partir de maintenant",
        "pt": "De agora em diante",
        "tipo": "frase"
      },
      {
        "es": "No seas tan quisquilloso",
        "en": "Don't be so fussy",
        "fr": "Ne sois pas si difficile",
        "pt": "Não seja tão exigente",
        "tipo": "frase"
      },
      {
        "es": "¡Hasta luego!",
        "en": "Catch you later!",
        "fr": "À plus tard !",
        "pt": "Até logo!",
        "tipo": "frase"
      },
      {
        "es": "¡No te rindas!, aguanta",
        "en": "Hang in there!",
        "fr": "Tiens bon !",
        "pt": "Não desista, aguente firme!",
        "tipo": "frase"
      },
      {
        "es": "¡Deja de hacer tonterías!",
        "en": "Stop mucking about!",
        "fr": "Arrête de faire l'idiot !",
        "pt": "Pare de fazer bobagens!",
        "tipo": "frase"
      },
      {
        "es": "Nunca se sabe",
        "en": "You never know",
        "fr": "On ne sait jamais",
        "pt": "Nunca se sabe",
        "tipo": "frase"
      },
      {
        "es": "¡Para el carro!, espera",
        "en": "Hold your horses!",
        "fr": "Doucement ! Attends !",
        "pt": "Calma aí!",
        "tipo": "modismo"
      },
      {
        "es": "¡Cuidado dónde pisas!",
        "en": "Watch your step!",
        "fr": "Fais attention où tu mets les pieds !",
        "pt": "Cuidado onde pisa!",
        "tipo": "frase"
      },
      {
        "es": "Tranquilo, relájate",
        "en": "Chill out, man!",
        "fr": "Calme-toi, détends-toi",
        "pt": "Calma, relaxe",
        "tipo": "frase"
      },
      {
        "es": "¿De qué hablas?",
        "en": "What are you on about?",
        "fr": "De quoi tu parles ?",
        "pt": "Do que você está falando?",
        "tipo": "pregunta"
      },
      {
        "es": "¡Qué desastre!",
        "en": "What a mess!",
        "fr": "Quel désastre !",
        "pt": "Que desastre!",
        "tipo": "frase"
      },
      {
        "es": "Luego te llamo",
        "en": "I'll call you back",
        "fr": "Je te rappelle plus tard",
        "pt": "Depois eu te ligo",
        "tipo": "frase"
      },
      {
        "es": "Estás en la cuerda floja",
        "en": "You're on thin ice",
        "fr": "Tu joues avec le feu.",
        "pt": "Você está na corda bamba.",
        "tipo": "modismo"
      },
      {
        "es": "Quedar en segundo plano",
        "en": "Play second fiddle",
        "fr": "Jouer les seconds rôles.",
        "pt": "Ficar em segundo plano.",
        "tipo": "modismo"
      },
      {
        "es": "No es asunto mío",
        "en": "It's not my business",
        "fr": "Ce ne sont pas mes affaires",
        "pt": "Não é da minha conta",
        "tipo": "frase"
      },
      {
        "es": "¡Muévete!, espabila",
        "en": "Shake a leg!",
        "fr": "Dépêche-toi !",
        "pt": "Anda logo!",
        "tipo": "modismo"
      },
      {
        "es": "No te preocupes",
        "en": "Not to worry",
        "fr": "Ne t'inquiète pas",
        "pt": "Não se preocupe",
        "tipo": "frase"
      },
      {
        "es": "Es una decisión difícil",
        "en": "It's a tough call",
        "fr": "C'est une décision difficile",
        "pt": "É uma decisão difícil",
        "tipo": "modismo"
      },
      {
        "es": "¡Se acabó el tiempo!",
        "en": "Time's up!",
        "fr": "Le temps est écoulé !",
        "pt": "Acabou o tempo!",
        "tipo": "frase"
      },
      {
        "es": "Irse a dormir",
        "en": "Hit the sack",
        "fr": "Aller se coucher.",
        "pt": "Ir para a cama.",
        "tipo": "modismo"
      },
      {
        "es": "No es trigo limpio",
        "en": "He's bad news",
        "fr": "Il n'est pas fréquentable.",
        "pt": "Ele é problema.",
        "tipo": "modismo"
      },
      {
        "es": "En un callejón sin salida",
        "en": "At a dead end",
        "fr": "Dans une impasse.",
        "pt": "Em um beco sem saída.",
        "tipo": "modismo"
      },
      {
        "es": "Irse sin pagar",
        "en": "Do a runner",
        "fr": "Partir sans payer",
        "pt": "Dar no pé sem pagar",
        "tipo": "modismo"
      },
      {
        "es": "Día sí, día no",
        "en": "Every other day",
        "fr": "Un jour sur deux",
        "pt": "Dia sim, dia não",
        "tipo": "frase"
      },
      {
        "es": "Acéptalo",
        "en": "Deal with it!",
        "fr": "Fais avec",
        "pt": "Lide com isso",
        "tipo": "frase"
      },
      {
        "es": "No tengo ganas",
        "en": "I can't be bothered",
        "fr": "J'ai la flemme",
        "pt": "Não estou a fim",
        "tipo": "frase"
      },
      {
        "es": "Hablando del rey de Roma",
        "en": "Speak of the devil",
        "fr": "Quand on parle du loup !",
        "pt": "Falando nele!",
        "tipo": "modismo"
      },
      {
        "es": "¡Tengo que irme corriendo!",
        "en": "I gotta dash!",
        "fr": "Je dois filer !",
        "pt": "Tenho que sair correndo!",
        "tipo": "frase"
      },
      {
        "es": "Por extraño que parezca",
        "en": "Oddly enough",
        "fr": "Curieusement",
        "pt": "Por estranho que pareça",
        "tipo": "frase"
      },
      {
        "es": "Hace mucho tiempo",
        "en": "A long while ago",
        "fr": "Il y a longtemps",
        "pt": "Há muito tempo",
        "tipo": "frase"
      },
      {
        "es": "Ya pasé por eso",
        "en": "Been there, done that",
        "fr": "Je suis déjà passé par là",
        "pt": "Já passei por isso",
        "tipo": "modismo"
      },
      {
        "es": "Aquí hay gato encerrado",
        "en": "I smell a rat",
        "fr": "Il y a quelque chose de louche.",
        "pt": "Tem algo estranho aí.",
        "tipo": "modismo"
      },
      {
        "es": "¡Eso es todo!",
        "en": "That's it!",
        "fr": "C'est tout !",
        "pt": "É isso!",
        "tipo": "frase"
      },
      {
        "es": "No vale la pena el lío",
        "en": "It's not worth the fuss",
        "fr": "Ça ne vaut pas les ennuis",
        "pt": "Não vale a pena o transtorno",
        "tipo": "modismo"
      },
      {
        "es": "¡Yo también!",
        "en": "Same here!",
        "fr": "Moi aussi !",
        "pt": "Eu também!",
        "tipo": "frase"
      },
      {
        "es": "Me pone la piel de gallina",
        "en": "It gives me goosebumps",
        "fr": "Ça me donne la chair de poule.",
        "pt": "Isso me dá arrepios.",
        "tipo": "modismo"
      },
      {
        "es": "Dame un respiro",
        "en": "Give me a break",
        "fr": "Laisse-moi souffler",
        "pt": "Me dá um respiro",
        "tipo": "frase"
      },
      {
        "es": "Ni idea",
        "en": "Beats me!",
        "fr": "Aucune idée !",
        "pt": "Não faço ideia!",
        "tipo": "frase"
      },
      {
        "es": "Guardar rencor",
        "en": "Hold a grudge",
        "fr": "Garder rancune.",
        "pt": "Guardar rancor.",
        "tipo": "modismo"
      },
      {
        "es": "Estoy súper contento",
        "en": "I'm chuffed to bits",
        "fr": "Je suis super content.",
        "pt": "Estou muito feliz.",
        "tipo": "modismo"
      },
      {
        "es": "Fuera de tu alcance",
        "en": "Out of your league",
        "fr": "Hors de ta portée.",
        "pt": "Fora do seu alcance.",
        "tipo": "modismo"
      },
      {
        "es": "Perdón por la expresión",
        "en": "Pardon my French",
        "fr": "Pardon pour l'expression",
        "pt": "Desculpe a expressão",
        "tipo": "frase"
      },
      {
        "es": "Estoy alucinado, patidifuso",
        "en": "I'm gobsmacked",
        "fr": "Je suis abasourdi.",
        "pt": "Estou de queixo caído.",
        "tipo": "modismo"
      }
    ]
  },
  {
    "id": "phrasal",
    "titulo": "Phrasal verbs",
    "franjaSugerida": "tarde",
    "frases": [
      {
        "es": "Encargarse de algo difícil",
        "en": "Take on something",
        "fr": "S'occuper de quelque chose de difficile",
        "pt": "Encarregar-se de algo difícil",
        "tipo": "frase"
      },
      {
        "es": "Apóyame",
        "en": "Stand by me",
        "fr": "Soutiens-moi",
        "pt": "Fique do meu lado",
        "tipo": "frase"
      },
      {
        "es": "Espera atento",
        "en": "Stand by",
        "fr": "Reste prêt",
        "pt": "Fique de prontidão",
        "tipo": "frase"
      },
      {
        "es": "En espera",
        "en": "Stand-by",
        "fr": "En attente",
        "pt": "Em espera",
        "tipo": "frase"
      },
      {
        "es": "Representar",
        "en": "Stand for",
        "fr": "Représenter",
        "pt": "Representar",
        "tipo": "frase"
      },
      {
        "es": "Defender",
        "en": "Stand up for",
        "fr": "Défendre",
        "pt": "Defender",
        "tipo": "frase"
      },
      {
        "es": "Sustituir a alguien",
        "en": "Stand in for",
        "fr": "Remplacer quelqu'un",
        "pt": "Substituir alguém",
        "tipo": "frase"
      },
      {
        "es": "Destacarse",
        "en": "Stand out",
        "fr": "Se démarquer",
        "pt": "Destacar-se",
        "tipo": "frase"
      },
      {
        "es": "Desistir, retirarse",
        "en": "Stand down",
        "fr": "Se retirer",
        "pt": "Desistir, retirar-se",
        "tipo": "frase"
      },
      {
        "es": "Asumir una postura",
        "en": "Take a stand",
        "fr": "Prendre position",
        "pt": "Assumir uma postura",
        "tipo": "frase"
      },
      {
        "es": "Arreglárselas",
        "en": "Get by",
        "fr": "S'en sortir",
        "pt": "Se virar",
        "tipo": "frase"
      },
      {
        "es": "Superarlo",
        "en": "Get over something",
        "fr": "S'en remettre",
        "pt": "Superar isso",
        "tipo": "frase"
      },
      {
        "es": "Relacionarse con un grupo",
        "en": "Get in with",
        "fr": "Se rapprocher d'un groupe",
        "pt": "Relacionar-se com um grupo",
        "tipo": "frase"
      },
      {
        "es": "Superar algo",
        "en": "Get through",
        "fr": "Surmonter une difficulté",
        "pt": "Superar uma dificuldade",
        "tipo": "frase"
      },
      {
        "es": "Llevarse bien",
        "en": "Get along",
        "fr": "Bien s'entendre",
        "pt": "Dar-se bem",
        "tipo": "frase"
      },
      {
        "es": "Salir con alguien",
        "en": "Go out with",
        "fr": "Sortir avec quelqu'un",
        "pt": "Sair com alguém",
        "tipo": "frase"
      },
      {
        "es": "Seguir",
        "en": "Go on",
        "fr": "Continuer",
        "pt": "Continuar",
        "tipo": "frase"
      },
      {
        "es": "Pasar por algo",
        "en": "Go through",
        "fr": "Traverser quelque chose",
        "pt": "Passar por algo",
        "tipo": "frase"
      },
      {
        "es": "Seguir la idea",
        "en": "Go along with",
        "fr": "Suivre l'idée",
        "pt": "Seguir a ideia",
        "tipo": "frase"
      },
      {
        "es": "Repasar",
        "en": "Go over",
        "fr": "Réviser",
        "pt": "Revisar",
        "tipo": "frase"
      },
      {
        "es": "Dividir gastos",
        "en": "Go in on",
        "fr": "Partager les frais",
        "pt": "Dividir o custo",
        "tipo": "frase"
      },
      {
        "es": "Detallar",
        "en": "Go into",
        "fr": "Détailler",
        "pt": "Detalhar",
        "tipo": "frase"
      },
      {
        "es": "Resolver, entender",
        "en": "Figure out",
        "fr": "Résoudre, comprendre",
        "pt": "Resolver, entender",
        "tipo": "frase"
      },
      {
        "es": "Tener un papel en algo",
        "en": "Figure in something",
        "fr": "Avoir un rôle dans quelque chose",
        "pt": "Ter um papel em algo",
        "tipo": "frase"
      },
      {
        "es": "Tolerar, aguantar",
        "en": "Put up with",
        "fr": "Tolérer, supporter",
        "pt": "Tolerar, aguentar",
        "tipo": "frase"
      },
      {
        "es": "Darse aires",
        "en": "Put on airs",
        "fr": "Se donner des airs",
        "pt": "Fazer pose",
        "tipo": "frase"
      },
      {
        "es": "Humillar a alguien",
        "en": "Put someone down",
        "fr": "Rabaisser quelqu'un",
        "pt": "Humilhar alguém",
        "tipo": "frase"
      },
      {
        "es": "Estar saliendo con alguien",
        "en": "See someone",
        "fr": "Sortir avec quelqu'un",
        "pt": "Estar saindo com alguém",
        "tipo": "frase"
      },
      {
        "es": "Encargarse de algo",
        "en": "See to something",
        "fr": "S'occuper de quelque chose",
        "pt": "Encarregar-se de algo",
        "tipo": "frase"
      },
      {
        "es": "Hacer las paces con alguien",
        "en": "Make up with someone",
        "fr": "Faire la paix avec quelqu'un",
        "pt": "Fazer as pazes com alguém",
        "tipo": "frase"
      },
      {
        "es": "Reponer un examen",
        "en": "Make up a test",
        "fr": "Repasser un examen",
        "pt": "Fazer prova de reposição",
        "tipo": "frase"
      },
      {
        "es": "Inventar algo",
        "en": "Make up something",
        "fr": "Inventer quelque chose",
        "pt": "Inventar algo",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "comunicacion",
    "titulo": "Comunicación",
    "franjaSugerida": "manana",
    "frases": [
      {
        "es": "Andarse por las ramas",
        "en": "Beat around the bush",
        "fr": "Tourner autour du pot",
        "pt": "Ficar dando voltas",
        "tipo": "modismo"
      },
      {
        "es": "Ir al grano",
        "en": "Cut to the chase",
        "fr": "Aller droit au but",
        "pt": "Ir direto ao ponto",
        "tipo": "modismo"
      },
      {
        "es": "De improviso",
        "en": "Off the cuff",
        "fr": "Au pied levé",
        "pt": "De improviso",
        "tipo": "modismo"
      },
      {
        "es": "Estar de acuerdo",
        "en": "See eye to eye",
        "fr": "Être d'accord",
        "pt": "Estar de acordo",
        "tipo": "modismo"
      },
      {
        "es": "Con eso terminamos",
        "en": "That wraps it up",
        "fr": "Voilà qui conclut cela",
        "pt": "Com isso encerramos",
        "tipo": "frase"
      },
      {
        "es": "Resulta que…",
        "en": "It turns out that…",
        "fr": "Il se trouve que…",
        "pt": "Acontece que…",
        "tipo": "frase"
      },
      {
        "es": "Capto la idea",
        "en": "I get the picture",
        "fr": "Je saisis l'idée",
        "pt": "Entendi a ideia",
        "tipo": "frase"
      },
      {
        "es": "¡Déjame terminar!",
        "en": "Hear me out!",
        "fr": "Laisse-moi finir !",
        "pt": "Deixe-me terminar!",
        "tipo": "frase"
      },
      {
        "es": "Retractarme de lo dicho",
        "en": "Eat my words",
        "fr": "Ravaler mes paroles.",
        "pt": "Morder a língua.",
        "tipo": "modismo"
      },
      {
        "es": "Mantente firme",
        "en": "Stand your ground",
        "fr": "Reste ferme",
        "pt": "Mantenha-se firme",
        "tipo": "modismo"
      },
      {
        "es": "Poner un límite",
        "en": "Draw the line",
        "fr": "Mettre une limite",
        "pt": "Colocar um limite",
        "tipo": "modismo"
      },
      {
        "es": "Defiéndete",
        "en": "Speak up for yourself",
        "fr": "Défends-toi",
        "pt": "Defenda-se",
        "tipo": "frase"
      },
      {
        "es": "Estar alineados",
        "en": "To be on the same page",
        "fr": "Être alignés",
        "pt": "Estar alinhados",
        "tipo": "modismo"
      },
      {
        "es": "Míralo desde mi perspectiva",
        "en": "See it from my perspective",
        "fr": "Regarde-le de mon point de vue",
        "pt": "Veja isso da minha perspectiva",
        "tipo": "frase"
      },
      {
        "es": "Acordemos no estar de acuerdo",
        "en": "Let's agree to disagree",
        "fr": "Acceptons de ne pas être d'accord",
        "pt": "Vamos concordar em discordar",
        "tipo": "frase"
      },
      {
        "es": "Entiendo de dónde viene tu punto",
        "en": "I see where you're coming from",
        "fr": "Je vois d'où vient ton point de vue",
        "pt": "Entendo de onde vem seu ponto",
        "tipo": "frase"
      },
      {
        "es": "No nos desviemos del tema",
        "en": "Let's not get off track",
        "fr": "Ne nous éloignons pas du sujet",
        "pt": "Não vamos nos desviar do tema",
        "tipo": "frase"
      },
      {
        "es": "Encontrémonos a mitad de camino",
        "en": "Let's meet halfway",
        "fr": "Trouvons un compromis.",
        "pt": "Vamos chegar a um meio-termo.",
        "tipo": "modismo"
      },
      {
        "es": "¿Podemos encontrar un punto medio?",
        "en": "Can we find a middle ground?",
        "fr": "Pouvons-nous trouver un terrain d'entente ?",
        "pt": "Podemos encontrar um ponto médio?",
        "tipo": "pregunta"
      },
      {
        "es": "¿Qué tienes en mente?",
        "en": "What do you have in mind?",
        "fr": "Qu'as-tu en tête ?",
        "pt": "O que você tem em mente?",
        "tipo": "pregunta"
      },
      {
        "es": "Voy con poco tiempo, así que…",
        "en": "I'm on a tight schedule, so…",
        "fr": "Je suis pressé, donc…",
        "pt": "Estou sem tempo, então…",
        "tipo": "frase"
      },
      {
        "es": "Hasta cierto punto, pero…",
        "en": "To some extent, but…",
        "fr": "Jusqu'à un certain point, mais…",
        "pt": "Até certo ponto, mas…",
        "tipo": "frase"
      },
      {
        "es": "No tengo palabras para agradecerte",
        "en": "I can't thank you enough",
        "fr": "Je ne te remercierai jamais assez",
        "pt": "Não tenho palavras para te agradecer",
        "tipo": "frase"
      },
      {
        "es": "Lo aprecio mucho",
        "en": "I really appreciate it",
        "fr": "J'apprécie beaucoup",
        "pt": "Aprecio muito isso",
        "tipo": "frase"
      },
      {
        "es": "Es muy amable de tu parte",
        "en": "That's very kind of you",
        "fr": "C'est très aimable de ta part",
        "pt": "É muito gentil da sua parte",
        "tipo": "frase"
      },
      {
        "es": "Se lo agradecería mucho",
        "en": "I would be much obliged",
        "fr": "Je vous en serais très reconnaissant",
        "pt": "Eu agradeceria muito",
        "tipo": "frase"
      },
      {
        "es": "Estoy verdaderamente agradecido por tu ayuda",
        "en": "I am truly grateful for your help",
        "fr": "Je suis vraiment reconnaissant pour ton aide",
        "pt": "Sou verdadeiramente grato pela sua ajuda",
        "tipo": "frase"
      },
      {
        "es": "No tenías por qué molestarte",
        "en": "You shouldn't have",
        "fr": "Tu n'aurais pas dû te déranger",
        "pt": "Você não precisava se incomodar",
        "tipo": "frase"
      },
      {
        "es": "¡Mil gracias!",
        "en": "Thanks a million",
        "fr": "Merci infiniment !",
        "pt": "Muito obrigado!",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "ninos",
    "titulo": "Niños y crianza",
    "franjaSugerida": "noche",
    "frases": [
      {
        "es": "Pequeñito, pequeñita",
        "en": "Little one",
        "fr": "Petit, petite",
        "pt": "Pequenino, pequenina",
        "tipo": "frase"
      },
      {
        "es": "Cosita, pequeñín",
        "en": "Little thing",
        "fr": "Petite chose, petit bout",
        "pt": "Coisinha, pequenino",
        "tipo": "frase"
      },
      {
        "es": "Pequeño tesoro (un bebé)",
        "en": "Bundle of joy",
        "fr": "Petit trésor, un bébé",
        "pt": "Pequeno tesouro, um bebê",
        "tipo": "frase"
      },
      {
        "es": "Cariño, cielo",
        "en": "Sweetie",
        "fr": "Chéri, mon cœur",
        "pt": "Querido, meu bem",
        "tipo": "frase"
      },
      {
        "es": "Mi pequeña princesa",
        "en": "My little princess",
        "fr": "Ma petite princesse",
        "pt": "Minha pequena princesa",
        "tipo": "frase"
      },
      {
        "es": "Mi principito",
        "en": "My little prince",
        "fr": "Mon petit prince",
        "pt": "Meu principezinho",
        "tipo": "frase"
      },
      {
        "es": "¡Cucú!, ¡aquí está!",
        "en": "Peek-a-boo!",
        "fr": "Coucou, te voilà !",
        "pt": "Cadê? Achou!",
        "tipo": "frase"
      },
      {
        "es": "Rico, rico para la barriguita",
        "en": "Yummy in my tummy",
        "fr": "Miam miam dans mon petit ventre",
        "pt": "Delícia na barriguinha",
        "tipo": "frase"
      },
      {
        "es": "¡Abre grande la boca!",
        "en": "Open wide!",
        "fr": "Ouvre grand la bouche !",
        "pt": "Abra bem a boca!",
        "tipo": "frase"
      },
      {
        "es": "Se acabó",
        "en": "All gone",
        "fr": "C'est fini",
        "pt": "Acabou",
        "tipo": "frase"
      },
      {
        "es": "Palmas palmitas",
        "en": "Pat-a-cake",
        "fr": "Tape, tape dans les mains",
        "pt": "Bate palminha",
        "tipo": "frase"
      },
      {
        "es": "¡Qué estirón!",
        "en": "Big stretch!",
        "fr": "Quel grand étirement !",
        "pt": "Que espreguiçada grande!",
        "tipo": "frase"
      },
      {
        "es": "¡Arriba!, ¡aúpa!",
        "en": "Upsie-daisy!",
        "fr": "Hop, on se lève !",
        "pt": "Para cima!",
        "tipo": "frase"
      },
      {
        "es": "¡Besitos!",
        "en": "Kissy kissy!",
        "fr": "Bisous !",
        "pt": "Beijinhos!",
        "tipo": "frase"
      },
      {
        "es": "Dame un besito",
        "en": "Give me a kiss",
        "fr": "Donne-moi un bisou",
        "pt": "Me dá um beijinho",
        "tipo": "frase"
      },
      {
        "es": "Buenas noches (a un niño)",
        "en": "Night night",
        "fr": "Bonne nuit, petit",
        "pt": "Boa noite, pequeno",
        "tipo": "frase"
      },
      {
        "es": "Que duermas bien",
        "en": "Sleep tight",
        "fr": "Dors bien",
        "pt": "Durma bem",
        "tipo": "frase"
      },
      {
        "es": "Es hora de ir a la cama",
        "en": "Time for bed",
        "fr": "C'est l'heure d'aller au lit",
        "pt": "É hora de ir para a cama",
        "tipo": "frase"
      }
    ]
  },
  {
    "id": "reflexion",
    "titulo": "Reflexión y vida",
    "franjaSugerida": "noche",
    "frases": [
      {
        "es": "Pensarlo con calma",
        "en": "Sleep on it",
        "fr": "Y réfléchir à tête reposée",
        "pt": "Pensar com calma",
        "tipo": "modismo"
      },
      {
        "es": "Respira hondo",
        "en": "Take a deep breath",
        "fr": "Respire profondément",
        "pt": "Respire fundo",
        "tipo": "frase"
      },
      {
        "es": "Al fin y al cabo",
        "en": "At the end of the day",
        "fr": "Au bout du compte.",
        "pt": "No fim das contas.",
        "tipo": "modismo"
      },
      {
        "es": "Tengo un presentimiento",
        "en": "I've got a gut feeling",
        "fr": "J'ai un pressentiment",
        "pt": "Tenho um pressentimento",
        "tipo": "frase"
      },
      {
        "es": "La vida es maravillosa",
        "en": "Life is a bowl of cherries",
        "fr": "La vie est merveilleuse",
        "pt": "A vida é maravilhosa",
        "tipo": "modismo"
      },
      {
        "es": "La dulce vida",
        "en": "La Dolce Vita",
        "fr": "La douce vie",
        "pt": "A doce vida",
        "tipo": "frase"
      },
      {
        "es": "Las mejores cosas de la vida son gratis",
        "en": "The best things in life are free",
        "fr": "Les meilleures choses de la vie sont gratuites",
        "pt": "As melhores coisas da vida são de graça",
        "tipo": "modismo"
      },
      {
        "es": "Ver la vida color de rosa",
        "en": "La vie en rose",
        "fr": "Voir la vie en rose",
        "pt": "Ver a vida cor-de-rosa",
        "tipo": "frase"
      },
      {
        "es": "La vida es demasiado corta",
        "en": "Life is too short",
        "fr": "La vie est trop courte",
        "pt": "A vida é curta demais",
        "tipo": "frase"
      },
      {
        "es": "No hay mal que por bien no venga",
        "en": "Every cloud has a silver lining",
        "fr": "À quelque chose malheur est bon.",
        "pt": "Há males que vêm para o bem.",
        "tipo": "modismo"
      },
      {
        "es": "¿Cómo te está funcionando eso?",
        "en": "How is that working for you?",
        "fr": "Comment cela fonctionne-t-il pour toi ?",
        "pt": "Como isso está funcionando para você?",
        "tipo": "pregunta"
      },
      {
        "es": "No controlas la situación, sí tu reacción",
        "en": "You can't control the situation, but you can control your reaction",
        "fr": "Tu ne contrôles pas la situation, mais ta réaction",
        "pt": "Você não controla a situação, mas sua reação",
        "tipo": "frase"
      },
      {
        "es": "¿Cómo se vería eso para ti?",
        "en": "What would that look like to you?",
        "fr": "À quoi cela ressemblerait-il pour toi ?",
        "pt": "Como isso seria para você?",
        "tipo": "pregunta"
      },
      {
        "es": "Lo que resistes, persiste",
        "en": "What you resist, persists",
        "fr": "Ce à quoi tu résistes persiste.",
        "pt": "Aquilo a que você resiste persiste.",
        "tipo": "modismo"
      },
      {
        "es": "La incomodidad es información",
        "en": "Discomfort is information",
        "fr": "L'inconfort est une information",
        "pt": "O desconforto é informação",
        "tipo": "frase"
      },
      {
        "es": "A lo hecho, pecho",
        "en": "Don't cry over spilled milk",
        "fr": "Ce qui est fait est fait.",
        "pt": "Não adianta chorar pelo leite derramado.",
        "tipo": "modismo"
      }
    ]
  }
];
