(function(){
  const A='assets/';
  const O=A+'objects/';
  const skill=(id,label,group,order,prereqs=[])=>({id,label,group,order,prereqs});
  window.EMILIA_CONTENT={
    version:4.0,
    title:'Emilia · El Bosque de las Palabras',
    mascot:{name:'Lumi',src:A+'characters/lumi.svg'},
    skills:[
      skill('hear_vowels','Escucha vocales','Escucha',1),
      skill('vowel_symbols','Reconoce vocales','Letras',2,[{skill:'hear_vowels',score:35}]),
      skill('hear_m','Sonido inicial M','Escucha',3,[{skill:'vowel_symbols',score:35}]),
      skill('m_symbol','Reconoce M','Letras',4,[{skill:'hear_m',score:40}]),
      skill('m_family','Familia M','Sílabas',5,[{skill:'m_symbol',score:40}]),
      skill('blend_m','Combina con M','Combinar',6,[{skill:'m_family',score:45}]),
      skill('word_mama','Lee mamá','Palabras',7,[{skill:'blend_m',score:45}]),
      skill('hear_p','Sonido inicial P','Escucha',8,[{skill:'m_family',score:50}]),
      skill('p_symbol','Reconoce P','Letras',9,[{skill:'hear_p',score:40}]),
      skill('p_family','Familia P','Sílabas',10,[{skill:'p_symbol',score:40}]),
      skill('blend_p','Combina con P','Combinar',11,[{skill:'p_family',score:45},{skill:'m_family',score:40}]),
      skill('word_papa','Lee papá','Palabras',12,[{skill:'blend_p',score:45}]),
      skill('hear_s','Sonido inicial S','Escucha',13,[{skill:'p_family',score:50}]),
      skill('s_symbol','Reconoce S','Letras',14,[{skill:'hear_s',score:40}]),
      skill('s_family','Familia S','Sílabas',15,[{skill:'s_symbol',score:40}]),
      skill('blend_s','Combina con S','Combinar',16,[{skill:'s_family',score:45},{skill:'p_family',score:40}]),
      skill('word_sapo','Lee sapo','Palabras',17,[{skill:'blend_s',score:45}]),
      skill('hear_l','Sonido inicial L','Escucha',18,[{skill:'s_family',score:50}]),
      skill('l_symbol','Reconoce L','Letras',19,[{skill:'hear_l',score:40}]),
      skill('l_family','Familia L','Sílabas',20,[{skill:'l_symbol',score:40}]),
      skill('blend_l','Combina con L','Combinar',21,[{skill:'l_family',score:45},{skill:'p_family',score:40}]),
      skill('word_lupa','Lee lupa','Palabras',22,[{skill:'blend_l',score:45}]),
      skill('hear_n','Sonido inicial N','Escucha',23,[{skill:'l_family',score:45}]),
      skill('n_symbol','Reconoce N','Letras',24,[{skill:'hear_n',score:40}]),
      skill('n_family','Familia N','Sílabas',25,[{skill:'n_symbol',score:40}]),
      skill('blend_n','Combina con N','Combinar',26,[{skill:'n_family',score:45},{skill:'m_family',score:40}]),
      skill('word_nido','Lee nido','Palabras',27,[{skill:'blend_n',score:45}]),
      skill('hear_t','Sonido inicial T','Escucha',28,[{skill:'n_family',score:45}]),
      skill('t_symbol','Reconoce T','Letras',29,[{skill:'hear_t',score:40}]),
      skill('t_family','Familia T','Sílabas',30,[{skill:'t_symbol',score:40}]),
      skill('blend_t','Combina con T','Combinar',31,[{skill:'t_family',score:45},{skill:'p_family',score:40}]),
      skill('word_taza','Lee palabras con T','Palabras',32,[{skill:'blend_t',score:45}]),
      skill('hear_d','Sonido inicial D','Escucha',33,[{skill:'t_family',score:45}]),
      skill('d_symbol','Reconoce D','Letras',34,[{skill:'hear_d',score:40}]),
      skill('d_family','Familia D','Sílabas',35,[{skill:'d_symbol',score:40}]),
      skill('blend_d','Combina con D','Combinar',36,[{skill:'d_family',score:45},{skill:'n_family',score:40}]),
      skill('word_dado','Lee palabras con D','Palabras',37,[{skill:'blend_d',score:45}]),
      skill('sentence_mp','Lee frase M/P','Lectura',38,[{skill:'word_mama',score:45},{skill:'word_papa',score:45}]),
      skill('sentence_l','Lee frase L','Lectura',39,[{skill:'word_lupa',score:45},{skill:'s_family',score:40}]),
      skill('sentence_ntd','Lee frases ampliadas','Lectura',40,[{skill:'word_nido',score:40},{skill:'word_taza',score:40},{skill:'word_dado',score:40}]),
      skill('comprehension_1','Comprende frases','Comprensión',41,[{skill:'sentence_mp',score:35}])
    ],
    worlds:[
      {id:'forest_vowels',letter:'A·E·I·O·U',name:'Claro de las Vocales',short:'Vocales',x:50,y:88},
      {id:'forest_m',letter:'M',name:'Puerta de M',short:'M',x:22,y:72},
      {id:'forest_p',letter:'P',name:'Puente de P',short:'P',x:72,y:63},
      {id:'forest_s',letter:'S',name:'Laguna de S',short:'S',x:28,y:52},
      {id:'forest_l',letter:'L',name:'Casa de L',short:'L',x:70,y:41},
      {id:'forest_n',letter:'N',name:'Nido de N',short:'N',x:27,y:30},
      {id:'forest_t',letter:'T',name:'Torre de T',short:'T',x:70,y:20},
      {id:'forest_d',letter:'D',name:'Domo de D',short:'D',x:48,y:8}
    ],
    missions:[
      {
        id:'forest_vowels',order:1,world:'Bosque de los Ecos',title:'El claro de las vocales',subtitle:'Escucha las cinco voces que iluminan el bosque.',letter:'A·E·I·O·U',masteryTarget:55,requires:[],
        skillIds:['hear_vowels','vowel_symbols'],
        activities:[
          {id:'v_intro',type:'syllableTrail',assess:false,skill:'hear_vowels',prompt:'Despierta las cinco luciérnagas',items:['a','e','i','o','u'],sayPrefix:'Vocal '},
          {id:'v_a',type:'listenPick',skill:'hear_vowels',prompt:'¿Qué vocal escuchas?',say:'a',options:['a','e','o'],answer:'a',coach:'Escucha otra vez: aaa. La boca se abre mucho.'},
          {id:'v_i',type:'listenPick',skill:'hear_vowels',prompt:'¿Cuál suena finita?',say:'i',options:['u','i','a'],answer:'i',coach:'Escucha: iii.'},
          {id:'v_o',type:'symbolPick',skill:'vowel_symbols',prompt:'Busca la letra que suena así',say:'o',options:['e','o','u','a'],answer:'o',coach:'La O hace la boca redonda: ooo.'},
          {id:'v_u',type:'symbolPick',skill:'vowel_symbols',prompt:'Una última luz',say:'u',options:['i','u','e','o'],answer:'u',coach:'Escucha: uuu. Busca la U.'}
        ]
      },
      {
        id:'forest_m',order:2,world:'Bosque de los Ecos',title:'La puerta de la M',subtitle:'Escucha palabras que empiezan con M, juega con MA·ME·MI·MO·MU y construye MAMÁ.',letter:'M',masteryTarget:58,requires:[{mission:'forest_vowels'},{skill:'vowel_symbols',score:45}],
        skillIds:['hear_m','m_symbol','m_family','blend_m','word_mama'],
        activities:[
          {id:'m_hunt',type:'picturePick',skill:'hear_m',prompt:'Escucha la palabra de Lumi. ¿Qué dibujo empieza igual?',say:'mesa',audioKind:'word',options:[{value:'mamá',src:O+'mama.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'mamá',coach:'Escucha el comienzo de MESA y MAMÁ. Las dos empiezan con el mismo sonido.'},
          {id:'m_symbol',type:'symbolPick',skill:'m_symbol',prompt:'¿Con qué letra empieza la palabra de Lumi?',say:'mesa',audioKind:'word',options:['m','p','s'],answer:'m',coach:'MESA empieza con M. Mira y escucha la primera parte: ME.'},
          {id:'m_trace',type:'trace',assess:false,skill:'m_symbol',letter:'m',prompt:'Dibuja el camino de la M',say:'Esta es la M, como en mamá.',audioKind:'instruction'},
          {id:'m_trail',type:'syllableTrail',assess:false,skill:'m_family',prompt:'Haz sonar las piedras de M',items:['ma','me','mi','mo','mu']},
          {id:'m_family',type:'symbolPick',skill:'m_family',prompt:'Escucha y toca la sílaba',say:'mi',options:['ma','mi','mo','mu'],answer:'mi',coach:'Escucha MI completa. Empieza como MESA y termina con I.'},
          {id:'m_build',type:'build',skill:'blend_m',prompt:'Construye la palabra',say:'mamá',parts:['ma','má'],answerParts:['ma','má'],word:'mamá',coach:'Primero MA. Después MÁ: ma-má.'},
          {id:'m_read',type:'wordReveal',assess:false,skill:'word_mama',prompt:'Ahora intenta leerla tú',word:'mamá',parts:['ma','má'],say:'mamá'},
          {id:'m_mimo',type:'build',variant:true,skill:'blend_m',prompt:'Arma MIMO',say:'mimo',parts:['mi','mo'],answerParts:['mi','mo'],word:'mimo',coach:'MI y después MO.'},
          {id:'m_mima',type:'build',variant:true,skill:'blend_m',prompt:'Arma MIMA',say:'mima',parts:['mi','ma'],answerParts:['mi','ma'],word:'mima',coach:'MI y después MA.'},
          {id:'m_word',type:'symbolPick',skill:'word_mama',prompt:'¿Dónde dice MAMÁ?',say:'mamá',options:['mamá','mimo','mima'],answer:'mamá',coach:'Mira cómo empieza: MA.'}
        ]
      },
      {
        id:'forest_p',order:3,world:'Bosque de los Ecos',title:'El puente de la P',subtitle:'Escucha palabras que empiezan con P y cruza formando PA·PE·PI·PO·PU.',letter:'P',masteryTarget:58,requires:[{mission:'forest_m'},{skill:'m_family',score:50}],
        skillIds:['hear_p','p_symbol','p_family','blend_p','word_papa'],
        activities:[
          {id:'p_hunt',type:'picturePick',skill:'hear_p',prompt:'Escucha la palabra de Lumi. ¿Qué dibujo empieza igual?',say:'pato',audioKind:'word',options:[{value:'papá',src:O+'papa.svg'},{value:'mesa',src:O+'mesa.svg'},{value:'sapo',src:O+'sapo.svg'}],answer:'papá',coach:'PATO y PAPÁ empiezan con el mismo sonido.'},
          {id:'p_symbol',type:'symbolPick',skill:'p_symbol',prompt:'¿Con qué letra empieza la palabra de Lumi?',say:'pato',audioKind:'word',options:['m','p','l'],answer:'p',coach:'PATO empieza con P. Escucha PA al comienzo.'},
          {id:'p_trace',type:'trace',assess:false,skill:'p_symbol',letter:'p',prompt:'Sigue el camino de la P',say:'Esta es la P, como en papá.',audioKind:'instruction'},
          {id:'p_trail',type:'syllableTrail',assess:false,skill:'p_family',prompt:'Haz sonar el puente de P',items:['pa','pe','pi','po','pu']},
          {id:'p_family',type:'symbolPick',skill:'p_family',prompt:'¿Qué sílaba escuchas?',say:'pu',options:['pa','pi','pu','po'],answer:'pu',coach:'Escucha PU completa. Empieza como PUMA y termina con U.'},
          {id:'p_build',type:'build',skill:'blend_p',prompt:'Construye PAPÁ',say:'papá',parts:['pa','pá'],answerParts:['pa','pá'],word:'papá',coach:'Primero PA. Después PÁ.'},
          {id:'p_mix',type:'build',skill:'blend_p',prompt:'M y P pueden trabajar juntas',say:'puma',parts:['pu','ma'],answerParts:['pu','ma'],word:'puma',coach:'Primero PU. Después MA.'},
          {id:'p_read',type:'wordReveal',assess:false,skill:'word_papa',prompt:'Intenta leer esta palabra',word:'papá',parts:['pa','pá'],say:'papá'},
          {id:'p_pipa',type:'build',variant:true,skill:'blend_p',prompt:'Arma PIPA',say:'pipa',parts:['pi','pa'],answerParts:['pi','pa'],word:'pipa',coach:'PI y después PA.'},
          {id:'p_mapa',type:'build',variant:true,skill:'blend_p',prompt:'Arma MAPA',say:'mapa',parts:['ma','pa'],answerParts:['ma','pa'],word:'mapa',coach:'MA y después PA.'},
          {id:'p_word',type:'symbolPick',skill:'word_papa',prompt:'¿Dónde dice PAPÁ?',say:'papá',options:['papá','puma','pipa'],answer:'papá',coach:'Busca PA al principio.'}
        ]
      },
      {
        id:'forest_s',order:4,world:'Bosque de los Ecos',title:'La laguna de la S',subtitle:'Escucha palabras que empiezan con S y mezcla lo nuevo con P para leer SAPO y SOPA.',letter:'S',masteryTarget:58,requires:[{mission:'forest_p'},{skill:'p_family',score:50}],
        skillIds:['hear_s','s_symbol','s_family','blend_s','word_sapo'],
        activities:[
          {id:'s_hunt',type:'picturePick',skill:'hear_s',prompt:'Escucha la palabra de Lumi. ¿Qué dibujo empieza igual?',say:'sol',audioKind:'word',options:[{value:'sapo',src:O+'sapo.svg'},{value:'papá',src:O+'papa.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'sapo',coach:'SOL y SAPO empiezan con el mismo sonido.'},
          {id:'s_symbol',type:'symbolPick',skill:'s_symbol',prompt:'¿Con qué letra empieza la palabra de Lumi?',say:'sol',audioKind:'word',options:['s','m','p'],answer:'s',coach:'SOL empieza con S. Mira la curva de la S.'},
          {id:'s_trace',type:'trace',assess:false,skill:'s_symbol',letter:'s',prompt:'Recorre la curva de la S',say:'Esta es la S, como en sapo.',audioKind:'instruction'},
          {id:'s_trail',type:'syllableTrail',assess:false,skill:'s_family',prompt:'Haz sonar las hojas de S',items:['sa','se','si','so','su']},
          {id:'s_family',type:'symbolPick',skill:'s_family',prompt:'¿Cuál escuchas?',say:'so',options:['sa','so','su','si'],answer:'so',coach:'Escucha SO completa. Es el comienzo de SOPA.'},
          {id:'s_build',type:'build',skill:'blend_s',prompt:'Construye SAPO',say:'sapo',parts:['sa','po'],answerParts:['sa','po'],word:'sapo',coach:'Primero SA. Después PO.'},
          {id:'s_build2',type:'build',skill:'blend_s',prompt:'Ahora construye SOPA',say:'sopa',parts:['so','pa'],answerParts:['so','pa'],word:'sopa',coach:'SO y después PA.'},
          {id:'s_read',type:'wordReveal',assess:false,skill:'word_sapo',prompt:'Intenta leer esta palabra',word:'sapo',parts:['sa','po'],say:'sapo'},
          {id:'s_suma',type:'build',variant:true,skill:'blend_s',prompt:'Arma SUMA',say:'suma',parts:['su','ma'],answerParts:['su','ma'],word:'suma',coach:'SU y después MA.'},
          {id:'s_masa',type:'build',variant:true,skill:'blend_s',prompt:'Arma MASA',say:'masa',parts:['ma','sa'],answerParts:['ma','sa'],word:'masa',coach:'MA y después SA.'},
          {id:'s_missing',type:'missingPart',variant:true,skill:'blend_s',prompt:'Completa la palabra',say:'sopa',word:'sopa',display:['so','__'],options:['pa','ma','la'],answer:'pa',coach:'Escucha SO-PA.'},
          {id:'s_word',type:'symbolPick',skill:'word_sapo',prompt:'¿Dónde dice SAPO?',say:'sapo',options:['sapo','sopa','suma'],answer:'sapo',coach:'Busca SA y después PO.'}
        ]
      },
      {
        id:'forest_l',order:5,world:'Bosque de los Ecos',title:'La casa de la L',subtitle:'Escucha palabras que empiezan con L y usa lo aprendido para leer LUPA y LOLA.',letter:'L',masteryTarget:58,requires:[{mission:'forest_s'},{skill:'s_family',score:50}],
        skillIds:['hear_l','l_symbol','l_family','blend_l','word_lupa'],
        activities:[
          {id:'l_hunt',type:'picturePick',skill:'hear_l',prompt:'Escucha la palabra de Lumi. ¿Qué dibujo empieza igual?',say:'luna',audioKind:'word',options:[{value:'lupa',src:O+'lupa.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'mesa',src:O+'mesa.svg'}],answer:'lupa',coach:'LUNA y LUPA empiezan con el mismo sonido.'},
          {id:'l_symbol',type:'symbolPick',skill:'l_symbol',prompt:'¿Con qué letra empieza la palabra de Lumi?',say:'luna',audioKind:'word',options:['l','p','m'],answer:'l',coach:'LUNA empieza con L. Escucha LU al comienzo.'},
          {id:'l_trace',type:'trace',assess:false,skill:'l_symbol',letter:'l',prompt:'Traza el camino de la L',say:'Esta es la L, como en lupa.',audioKind:'instruction'},
          {id:'l_trail',type:'syllableTrail',assess:false,skill:'l_family',prompt:'Enciende las ventanas de L',items:['la','le','li','lo','lu']},
          {id:'l_family',type:'symbolPick',skill:'l_family',prompt:'¿Cuál escuchas?',say:'lu',options:['lo','lu','la','li'],answer:'lu',coach:'Escucha LU completa. Es el comienzo de LUPA.'},
          {id:'l_build',type:'build',skill:'blend_l',prompt:'Construye LUPA',say:'lupa',parts:['lu','pa'],answerParts:['lu','pa'],word:'lupa',coach:'LU y después PA.'},
          {id:'l_build2',type:'build',skill:'blend_l',prompt:'Construye LOLA',say:'Lola',parts:['lo','la'],answerParts:['lo','la'],word:'Lola',coach:'LO y después LA.'},
          {id:'l_read',type:'wordReveal',assess:false,skill:'word_lupa',prompt:'Intenta leer esta palabra',word:'lupa',parts:['lu','pa'],say:'lupa'},
          {id:'l_loma',type:'build',variant:true,skill:'blend_l',prompt:'Arma LOMA',say:'loma',parts:['lo','ma'],answerParts:['lo','ma'],word:'loma',coach:'LO y después MA.'},
          {id:'l_lima',type:'build',variant:true,skill:'blend_l',prompt:'Arma LIMA',say:'lima',parts:['li','ma'],answerParts:['li','ma'],word:'lima',coach:'LI y después MA.'},
          {id:'l_pala',type:'build',variant:true,skill:'blend_l',prompt:'Arma PALA',say:'pala',parts:['pa','la'],answerParts:['pa','la'],word:'pala',coach:'PA y después LA.'},
          {id:'l_bubbles',type:'soundBubbles',variant:true,skill:'l_family',prompt:'Atrapa la sílaba que escuchas',say:'lo',options:['la','lo','lu','li'],answer:'lo',coach:'Escucha LO.'},
          {id:'l_word',type:'symbolPick',skill:'word_lupa',prompt:'¿Dónde dice LUPA?',say:'lupa',options:['lupa','Lola','loma'],answer:'lupa',coach:'Busca LU y después PA.'}
        ]
      }
      ,{
        id:'forest_n',order:6,world:'Bosque de los Ecos',title:'El nido de la N',subtitle:'Descubre NA·NE·NI·NO·NU y combina lo conocido para leer NIDO, MANO y MONO.',letter:'N',masteryTarget:60,requires:[{mission:'forest_l'},{skill:'l_family',score:48}],
        skillIds:['hear_n','n_symbol','n_family','blend_n','word_nido'],
        activities:[
          {id:'n_hear',type:'symbolPick',skill:'hear_n',prompt:'Escucha NIDO y encuentra su comienzo',say:'nido',audioKind:'word',options:['n','m','l'],answer:'n',coach:'NIDO empieza con N.'},
          {id:'n_symbol',type:'symbolPick',skill:'n_symbol',prompt:'Escucha y encuentra la letra',say:'nido',audioKind:'word',options:['n','m','l'],answer:'n',coach:'NIDO empieza con N.'},
          {id:'n_trace',type:'trace',assess:false,skill:'n_symbol',letter:'n',prompt:'Sigue la N con tu dedo',say:'Esta es la N, como en nido.',audioKind:'instruction'},
          {id:'n_trail',type:'syllableTrail',assess:false,skill:'n_family',prompt:'Haz sonar las piedras de N',items:['na','ne','ni','no','nu']},
          {id:'n_family',type:'soundBubbles',skill:'n_family',prompt:'Atrapa la sílaba',say:'ni',options:['na','ni','no','nu'],answer:'ni',coach:'Escucha NI.'},
          {id:'n_build',type:'build',skill:'blend_n',prompt:'Arma NIDO',say:'nido',parts:['ni','do'],answerParts:['ni','do'],word:'nido',coach:'NI y después DO.'},
          {id:'n_mano',type:'build',variant:true,skill:'blend_n',prompt:'Arma MANO',say:'mano',parts:['ma','no'],answerParts:['ma','no'],word:'mano',coach:'MA y después NO.'},
          {id:'n_mono',type:'build',variant:true,skill:'blend_n',prompt:'Arma MONO',say:'mono',parts:['mo','no'],answerParts:['mo','no'],word:'mono',coach:'MO y después NO.'},
          {id:'n_luna',type:'build',variant:true,skill:'blend_n',prompt:'Arma LUNA',say:'luna',parts:['lu','na'],answerParts:['lu','na'],word:'luna',coach:'LU y después NA.'},
          {id:'n_pino',type:'build',variant:true,skill:'blend_n',prompt:'Arma PINO',say:'pino',parts:['pi','no'],answerParts:['pi','no'],word:'pino',coach:'PI y después NO.'},
          {id:'n_paloma',type:'build',variant:true,skill:'blend_n',prompt:'Arma PALOMA',say:'paloma',parts:['pa','lo','ma'],answerParts:['pa','lo','ma'],word:'paloma',coach:'PA, LO y MA.'},
          {id:'n_missing',type:'missingPart',variant:true,skill:'word_nido',prompt:'Completa NIDO',say:'nido',word:'nido',display:['ni','__'],options:['do','no','to'],answer:'do',coach:'Escucha NI-DO.'},
          {id:'n_word',type:'symbolPick',skill:'word_nido',prompt:'¿Dónde dice NIDO?',say:'nido',options:['nido','nene','mono'],answer:'nido',coach:'Busca NI y después DO.'}
        ]
      },
      {
        id:'forest_t',order:7,world:'Bosque de los Ecos',title:'La torre de la T',subtitle:'Juega con TA·TE·TI·TO·TU y lee TINA, TOMA, PATO y LATA.',letter:'T',masteryTarget:60,requires:[{mission:'forest_n'},{skill:'n_family',score:48}],
        skillIds:['hear_t','t_symbol','t_family','blend_t','word_taza'],
        activities:[
          {id:'t_hear',type:'symbolPick',skill:'hear_t',prompt:'Escucha TINA y encuentra su comienzo',say:'tina',audioKind:'word',options:['t','n','p'],answer:'t',coach:'TINA empieza con T.'},
          {id:'t_symbol',type:'symbolPick',skill:'t_symbol',prompt:'Escucha y encuentra la letra',say:'tina',audioKind:'word',options:['t','n','p'],answer:'t',coach:'TINA empieza con T.'},
          {id:'t_trace',type:'trace',assess:false,skill:'t_symbol',letter:'t',prompt:'Sigue la T con tu dedo',say:'Esta es la T, como en tina.',audioKind:'instruction'},
          {id:'t_trail',type:'syllableTrail',assess:false,skill:'t_family',prompt:'Haz sonar las piedras de T',items:['ta','te','ti','to','tu']},
          {id:'t_family',type:'soundBubbles',skill:'t_family',prompt:'Atrapa la sílaba',say:'to',options:['ta','ti','to','tu'],answer:'to',coach:'Escucha TO.'},
          {id:'t_tina',type:'build',skill:'blend_t',prompt:'Arma TINA',say:'tina',parts:['ti','na'],answerParts:['ti','na'],word:'tina',coach:'TI y después NA.'},
          {id:'t_toma',type:'build',variant:true,skill:'blend_t',prompt:'Arma TOMA',say:'toma',parts:['to','ma'],answerParts:['to','ma'],word:'toma',coach:'TO y después MA.'},
          {id:'t_pato',type:'build',variant:true,skill:'blend_t',prompt:'Arma PATO',say:'pato',parts:['pa','to'],answerParts:['pa','to'],word:'pato',coach:'PA y después TO.'},
          {id:'t_lata',type:'build',variant:true,skill:'blend_t',prompt:'Arma LATA',say:'lata',parts:['la','ta'],answerParts:['la','ta'],word:'lata',coach:'LA y después TA.'},
          {id:'t_tela',type:'build',variant:true,skill:'blend_t',prompt:'Arma TELA',say:'tela',parts:['te','la'],answerParts:['te','la'],word:'tela',coach:'TE y después LA.'},
          {id:'t_moto',type:'build',variant:true,skill:'blend_t',prompt:'Arma MOTO',say:'moto',parts:['mo','to'],answerParts:['mo','to'],word:'moto',coach:'MO y después TO.'},
          {id:'t_pelota',type:'build',variant:true,skill:'blend_t',prompt:'Arma PELOTA',say:'pelota',parts:['pe','lo','ta'],answerParts:['pe','lo','ta'],word:'pelota',coach:'PE, LO y TA.'},
          {id:'t_tomate',type:'build',variant:true,skill:'blend_t',prompt:'Arma TOMATE',say:'tomate',parts:['to','ma','te'],answerParts:['to','ma','te'],word:'tomate',coach:'TO, MA y TE.'},
          {id:'t_maleta',type:'build',variant:true,skill:'blend_t',prompt:'Arma MALETA',say:'maleta',parts:['ma','le','ta'],answerParts:['ma','le','ta'],word:'maleta',coach:'MA, LE y TA.'},
          {id:'t_missing',type:'missingPart',variant:true,skill:'word_taza',prompt:'Completa PATO',say:'pato',word:'pato',display:['pa','__'],options:['to','do','no'],answer:'to',coach:'Escucha PA-TO.'}
        ]
      },
      {
        id:'forest_d',order:8,world:'Bosque de los Ecos',title:'El domo de la D',subtitle:'Explora DA·DE·DI·DO·DU y combina para leer DADO, DEDO, NIDO y LADO.',letter:'D',masteryTarget:60,requires:[{mission:'forest_t'},{skill:'t_family',score:48}],
        skillIds:['hear_d','d_symbol','d_family','blend_d','word_dado'],
        activities:[
          {id:'d_hear',type:'symbolPick',skill:'hear_d',prompt:'Escucha DADO y encuentra su comienzo',say:'dado',audioKind:'word',options:['d','t','n'],answer:'d',coach:'DADO empieza con D.'},
          {id:'d_symbol',type:'symbolPick',skill:'d_symbol',prompt:'Escucha y encuentra la letra',say:'dado',audioKind:'word',options:['d','t','n'],answer:'d',coach:'DADO empieza con D.'},
          {id:'d_trace',type:'trace',assess:false,skill:'d_symbol',letter:'d',prompt:'Sigue la D con tu dedo',say:'Esta es la D, como en dado.',audioKind:'instruction'},
          {id:'d_trail',type:'syllableTrail',assess:false,skill:'d_family',prompt:'Haz sonar las piedras de D',items:['da','de','di','do','du']},
          {id:'d_family',type:'soundBubbles',skill:'d_family',prompt:'Atrapa la sílaba',say:'de',options:['da','de','di','do'],answer:'de',coach:'Escucha DE.'},
          {id:'d_dado',type:'build',skill:'blend_d',prompt:'Arma DADO',say:'dado',parts:['da','do'],answerParts:['da','do'],word:'dado',coach:'DA y después DO.'},
          {id:'d_dedo',type:'build',variant:true,skill:'blend_d',prompt:'Arma DEDO',say:'dedo',parts:['de','do'],answerParts:['de','do'],word:'dedo',coach:'DE y después DO.'},
          {id:'d_lado',type:'build',variant:true,skill:'blend_d',prompt:'Arma LADO',say:'lado',parts:['la','do'],answerParts:['la','do'],word:'lado',coach:'LA y después DO.'},
          {id:'d_dama',type:'build',variant:true,skill:'blend_d',prompt:'Arma DAMA',say:'dama',parts:['da','ma'],answerParts:['da','ma'],word:'dama',coach:'DA y después MA.'},
          {id:'d_nudo',type:'build',variant:true,skill:'blend_d',prompt:'Arma NUDO',say:'nudo',parts:['nu','do'],answerParts:['nu','do'],word:'nudo',coach:'NU y después DO.'},
          {id:'d_medusa',type:'build',variant:true,skill:'blend_d',prompt:'Arma MEDUSA',say:'medusa',parts:['me','du','sa'],answerParts:['me','du','sa'],word:'medusa',coach:'ME, DU y SA.'},
          {id:'d_moneda',type:'build',variant:true,skill:'blend_d',prompt:'Arma MONEDA',say:'moneda',parts:['mo','ne','da'],answerParts:['mo','ne','da'],word:'moneda',coach:'MO, NE y DA.'},
          {id:'d_missing',type:'missingPart',variant:true,skill:'word_dado',prompt:'Completa DADO',say:'dado',word:'dado',display:['da','__'],options:['do','to','no'],answer:'do',coach:'Escucha DA-DO.'},
          {id:'d_word',type:'symbolPick',skill:'word_dado',prompt:'¿Dónde dice DADO?',say:'dado',options:['dado','dedo','lado'],answer:'dado',coach:'Busca DA y después DO.'}
        ]
      }
    ],
    reviewActivities:[
      {id:'rv_a',type:'listenPick',skill:'hear_vowels',prompt:'Una luciérnaga vuelve: ¿qué vocal escuchas?',say:'e',options:['a','e','o'],answer:'e',coach:'Escucha: eee.'},
      {id:'rv_v',type:'symbolPick',skill:'vowel_symbols',prompt:'Recuerda esta vocal',say:'i',options:['u','i','a'],answer:'i',coach:'Escucha otra vez: iii.'},
      {id:'rv_m',type:'symbolPick',skill:'m_family',prompt:'Una piedra conocida',say:'mo',options:['ma','mo','mu'],answer:'mo',coach:'Escucha MO completa.'},
      {id:'rv_mb',type:'picturePick',skill:'hear_m',prompt:'Escucha la palabra de Lumi. ¿Qué dibujo empieza igual?',say:'mamá',audioKind:'word',options:[{value:'mesa',src:O+'mesa.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'mesa',coach:'MAMÁ y MESA empiezan con el mismo sonido.'},
      {id:'rv_p',type:'symbolPick',skill:'p_family',prompt:'Recuerda P',say:'pa',options:['pa','pi','pu'],answer:'pa',coach:'Escucha PA completa.'},
      {id:'rv_s',type:'symbolPick',skill:'s_family',prompt:'Recuerda S',say:'su',options:['sa','su','so'],answer:'su',coach:'Escucha SU completa.'},
      {id:'rv_l',type:'symbolPick',skill:'l_family',prompt:'Recuerda L',say:'la',options:['lu','la','lo'],answer:'la',coach:'Escucha LA completa.'},
      {id:'rv_n',type:'soundBubbles',skill:'n_family',prompt:'Una sílaba vuelve',say:'no',options:['na','no','nu'],answer:'no',coach:'Escucha NO.'},
      {id:'rv_t',type:'missingPart',skill:'t_family',prompt:'Completa PATO',say:'pato',word:'pato',display:['pa','__'],options:['to','do','no'],answer:'to',coach:'Escucha PA-TO.'},
      {id:'rv_d',type:'soundBubbles',skill:'d_family',prompt:'Una sílaba vuelve',say:'do',options:['da','do','de'],answer:'do',coach:'Escucha DO.'}
    ],
    achievements:[
      {id:'first_path',icon:'🌱',name:'Primer brote'},
      {id:'vowels_done',icon:'✨',name:'Cinco luces'},
      {id:'builder_5',icon:'🧩',name:'Manos constructoras'},
      {id:'reader_5',icon:'📖',name:'Pequeño lector'},
      {id:'forest_5',icon:'🌳',name:'Explorador del bosque'},
      {id:'forest_8',icon:'🏆',name:'Guardián de palabras'}
    ],
    stories:[
      {id:'story_mp',title:'Mamá y papá',requires:[{skill:'word_mama',score:35},{skill:'word_papa',score:35}],art:O+'mama.svg',text:'Mamá mima a papá.',words:['Mamá','mima','a','papá.'],skill:'sentence_mp',comprehension:{prompt:'¿A quién mima mamá?',options:['A papá','Al sapo','A Lola'],answer:'A papá'}},
      {id:'story_l',title:'Lola y la lupa',requires:[{skill:'word_lupa',score:35},{skill:'s_family',score:35}],art:O+'lupa.svg',text:'Lola usa la lupa.',words:['Lola','usa','la','lupa.'],skill:'sentence_l',comprehension:{prompt:'¿Qué usa Lola?',options:['La lupa','La sopa','El sapo'],answer:'La lupa'}},
      {id:'story_ntd',title:'El nido',requires:[{skill:'word_nido',score:35},{skill:'t_family',score:35},{skill:'d_family',score:35}],art:O+'mono.svg',text:'Tito mira el nido.',words:['Tito','mira','el','nido.'],skill:'sentence_ntd',comprehension:{prompt:'¿Qué mira Tito?',options:['El nido','La sopa','La lupa'],answer:'El nido'}}
    ]
  };
})();
