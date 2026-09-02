(function(){
  const A='assets/';
  const O=A+'objects/';
  const skill=(id,label,group,order,prereqs=[])=>({id,label,group,order,prereqs});
  window.EMILIA_CONTENT={
    version:3,
    title:'Emilia · El Bosque de las Palabras',
    mascot:{name:'Lumi',src:A+'characters/lumi.svg'},
    skills:[
      skill('hear_vowels','Escucha vocales','Escucha',1),
      skill('vowel_symbols','Reconoce vocales','Letras',2,[{skill:'hear_vowels',score:35}]),
      skill('hear_m','Escucha M','Escucha',3,[{skill:'vowel_symbols',score:35}]),
      skill('m_symbol','Reconoce M','Letras',4,[{skill:'hear_m',score:40}]),
      skill('m_family','Familia M','Sílabas',5,[{skill:'m_symbol',score:40}]),
      skill('blend_m','Combina con M','Combinar',6,[{skill:'m_family',score:45}]),
      skill('word_mama','Lee mamá','Palabras',7,[{skill:'blend_m',score:45}]),
      skill('hear_p','Escucha P','Escucha',8,[{skill:'m_family',score:50}]),
      skill('p_symbol','Reconoce P','Letras',9,[{skill:'hear_p',score:40}]),
      skill('p_family','Familia P','Sílabas',10,[{skill:'p_symbol',score:40}]),
      skill('blend_p','Combina con P','Combinar',11,[{skill:'p_family',score:45},{skill:'m_family',score:40}]),
      skill('word_papa','Lee papá','Palabras',12,[{skill:'blend_p',score:45}]),
      skill('hear_s','Escucha S','Escucha',13,[{skill:'p_family',score:50}]),
      skill('s_symbol','Reconoce S','Letras',14,[{skill:'hear_s',score:40}]),
      skill('s_family','Familia S','Sílabas',15,[{skill:'s_symbol',score:40}]),
      skill('blend_s','Combina con S','Combinar',16,[{skill:'s_family',score:45},{skill:'p_family',score:40}]),
      skill('word_sapo','Lee sapo','Palabras',17,[{skill:'blend_s',score:45}]),
      skill('hear_l','Escucha L','Escucha',18,[{skill:'s_family',score:50}]),
      skill('l_symbol','Reconoce L','Letras',19,[{skill:'hear_l',score:40}]),
      skill('l_family','Familia L','Sílabas',20,[{skill:'l_symbol',score:40}]),
      skill('blend_l','Combina con L','Combinar',21,[{skill:'l_family',score:45},{skill:'p_family',score:40}]),
      skill('word_lupa','Lee lupa','Palabras',22,[{skill:'blend_l',score:45}]),
      skill('sentence_mp','Lee frase M/P','Lectura',23,[{skill:'word_mama',score:45},{skill:'word_papa',score:45}]),
      skill('sentence_l','Lee frase L','Lectura',24,[{skill:'word_lupa',score:45},{skill:'s_family',score:40}]),
      skill('comprehension_1','Comprende frases','Comprensión',25,[{skill:'sentence_mp',score:35}])
    ],
    worlds:[
      {id:'forest_vowels',letter:'A·E·I·O·U',name:'Claro de las Vocales',short:'Vocales',x:50,y:84},
      {id:'forest_m',letter:'M',name:'Puerta de M',short:'M',x:24,y:65},
      {id:'forest_p',letter:'P',name:'Puente de P',short:'P',x:71,y:53},
      {id:'forest_s',letter:'S',name:'Laguna de S',short:'S',x:31,y:34},
      {id:'forest_l',letter:'L',name:'Casa de L',short:'L',x:69,y:17}
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
        id:'forest_m',order:2,world:'Bosque de los Ecos',title:'La puerta que hace mmm',subtitle:'Descubre M, juega con MA·ME·MI·MO·MU y construye MAMÁ.',letter:'M',masteryTarget:58,requires:[{mission:'forest_vowels'},{skill:'vowel_symbols',score:45}],
        skillIds:['hear_m','m_symbol','m_family','blend_m','word_mama'],
        activities:[
          {id:'m_hunt',type:'picturePick',skill:'hear_m',prompt:'Toca lo que empieza como mmm',say:'mmm',options:[{value:'mamá',src:O+'mama.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'mamá',coach:'Cierra los labios y escucha: mmm… mamá.'},
          {id:'m_symbol',type:'symbolPick',skill:'m_symbol',prompt:'¿Cuál es la letra de mmm?',say:'mmm',options:['m','p','s'],answer:'m',coach:'La M tiene dos montañitas. Mmm.'},
          {id:'m_trace',type:'trace',assess:false,skill:'m_symbol',letter:'m',prompt:'Dibuja el camino de la M',say:'m'},
          {id:'m_trail',type:'syllableTrail',assess:false,skill:'m_family',prompt:'Haz sonar las piedras de M',items:['ma','me','mi','mo','mu']},
          {id:'m_family',type:'symbolPick',skill:'m_family',prompt:'Escucha y toca la sílaba',say:'mi',options:['ma','mi','mo','mu'],answer:'mi',coach:'Mmm + iii = mi.'},
          {id:'m_build',type:'build',skill:'blend_m',prompt:'Construye la palabra',say:'mamá',parts:['ma','má'],answerParts:['ma','má'],word:'mamá',coach:'Primero MA. Después MÁ: ma-má.'},
          {id:'m_read',type:'wordReveal',assess:false,skill:'word_mama',prompt:'Ahora intenta leerla tú',word:'mamá',parts:['ma','má'],say:'mamá'},
          {id:'m_word',type:'symbolPick',skill:'word_mama',prompt:'¿Dónde dice MAMÁ?',say:'mamá',options:['mamá','mesa','mono'],answer:'mamá',coach:'Mira cómo empieza: MA.'}
        ]
      },
      {
        id:'forest_p',order:3,world:'Bosque de los Ecos',title:'El puente que hace ppp',subtitle:'Escucha P y cruza formando PA·PE·PI·PO·PU.',letter:'P',masteryTarget:58,requires:[{mission:'forest_m'},{skill:'m_family',score:50}],
        skillIds:['hear_p','p_symbol','p_family','blend_p','word_papa'],
        activities:[
          {id:'p_hunt',type:'picturePick',skill:'hear_p',prompt:'¿Qué imagen empieza con ppp?',say:'ppp',options:[{value:'papá',src:O+'papa.svg'},{value:'mesa',src:O+'mesa.svg'},{value:'sapo',src:O+'sapo.svg'}],answer:'papá',coach:'Pon los labios juntos y suelta aire: ppp… papá.'},
          {id:'p_symbol',type:'symbolPick',skill:'p_symbol',prompt:'Busca la letra de ppp',say:'ppp',options:['m','p','l'],answer:'p',coach:'Escucha otra vez: ppp.'},
          {id:'p_trace',type:'trace',assess:false,skill:'p_symbol',letter:'p',prompt:'Sigue el camino de la P',say:'p'},
          {id:'p_trail',type:'syllableTrail',assess:false,skill:'p_family',prompt:'Haz sonar el puente de P',items:['pa','pe','pi','po','pu']},
          {id:'p_family',type:'symbolPick',skill:'p_family',prompt:'¿Qué sílaba escuchas?',say:'pu',options:['pa','pi','pu','po'],answer:'pu',coach:'Ppp + uuu = pu.'},
          {id:'p_build',type:'build',skill:'blend_p',prompt:'Construye PAPÁ',say:'papá',parts:['pa','pá'],answerParts:['pa','pá'],word:'papá',coach:'Primero PA. Después PÁ.'},
          {id:'p_mix',type:'build',skill:'blend_p',prompt:'M y P pueden trabajar juntas',say:'puma',parts:['pu','ma'],answerParts:['pu','ma'],word:'puma',coach:'Primero PU. Después MA.'},
          {id:'p_read',type:'wordReveal',assess:false,skill:'word_papa',prompt:'Intenta leer esta palabra',word:'papá',parts:['pa','pá'],say:'papá'},
          {id:'p_word',type:'symbolPick',skill:'word_papa',prompt:'¿Dónde dice PAPÁ?',say:'papá',options:['papá','puma','pipa'],answer:'papá',coach:'Busca PA al principio.'}
        ]
      },
      {
        id:'forest_s',order:4,world:'Bosque de los Ecos',title:'La laguna que susurra sss',subtitle:'Escucha S y mezcla lo nuevo con P para leer SAPO y SOPA.',letter:'S',masteryTarget:58,requires:[{mission:'forest_p'},{skill:'p_family',score:50}],
        skillIds:['hear_s','s_symbol','s_family','blend_s','word_sapo'],
        activities:[
          {id:'s_hunt',type:'picturePick',skill:'hear_s',prompt:'¿Cuál empieza como sss?',say:'sss',options:[{value:'sapo',src:O+'sapo.svg'},{value:'papá',src:O+'papa.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'sapo',coach:'Escucha el aire: sss… sapo.'},
          {id:'s_symbol',type:'symbolPick',skill:'s_symbol',prompt:'Busca la letra de sss',say:'sss',options:['s','m','p'],answer:'s',coach:'La S parece un caminito curvo.'},
          {id:'s_trace',type:'trace',assess:false,skill:'s_symbol',letter:'s',prompt:'Recorre la curva de la S',say:'s'},
          {id:'s_trail',type:'syllableTrail',assess:false,skill:'s_family',prompt:'Haz sonar las hojas de S',items:['sa','se','si','so','su']},
          {id:'s_family',type:'symbolPick',skill:'s_family',prompt:'¿Cuál escuchas?',say:'so',options:['sa','so','su','si'],answer:'so',coach:'Sss + ooo = so.'},
          {id:'s_build',type:'build',skill:'blend_s',prompt:'Construye SAPO',say:'sapo',parts:['sa','po'],answerParts:['sa','po'],word:'sapo',coach:'Primero SA. Después PO.'},
          {id:'s_build2',type:'build',skill:'blend_s',prompt:'Ahora construye SOPA',say:'sopa',parts:['so','pa'],answerParts:['so','pa'],word:'sopa',coach:'SO y después PA.'},
          {id:'s_read',type:'wordReveal',assess:false,skill:'word_sapo',prompt:'Intenta leer esta palabra',word:'sapo',parts:['sa','po'],say:'sapo'},
          {id:'s_word',type:'symbolPick',skill:'word_sapo',prompt:'¿Dónde dice SAPO?',say:'sapo',options:['sapo','sopa','suma'],answer:'sapo',coach:'Busca SA y después PO.'}
        ]
      },
      {
        id:'forest_l',order:5,world:'Bosque de los Ecos',title:'La casa que canta lll',subtitle:'Descubre L y usa lo aprendido para leer LUPA y LOLA.',letter:'L',masteryTarget:58,requires:[{mission:'forest_s'},{skill:'s_family',score:50}],
        skillIds:['hear_l','l_symbol','l_family','blend_l','word_lupa'],
        activities:[
          {id:'l_hunt',type:'picturePick',skill:'hear_l',prompt:'¿Qué imagen empieza con lll?',say:'lll',options:[{value:'lupa',src:O+'lupa.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'mesa',src:O+'mesa.svg'}],answer:'lupa',coach:'Pon la lengua arriba: lll… lupa.'},
          {id:'l_symbol',type:'symbolPick',skill:'l_symbol',prompt:'Busca la letra de lll',say:'lll',options:['l','p','m'],answer:'l',coach:'Escucha: lll.'},
          {id:'l_trace',type:'trace',assess:false,skill:'l_symbol',letter:'l',prompt:'Traza el camino de la L',say:'l'},
          {id:'l_trail',type:'syllableTrail',assess:false,skill:'l_family',prompt:'Enciende las ventanas de L',items:['la','le','li','lo','lu']},
          {id:'l_family',type:'symbolPick',skill:'l_family',prompt:'¿Cuál escuchas?',say:'lu',options:['lo','lu','la','li'],answer:'lu',coach:'Lll + uuu = lu.'},
          {id:'l_build',type:'build',skill:'blend_l',prompt:'Construye LUPA',say:'lupa',parts:['lu','pa'],answerParts:['lu','pa'],word:'lupa',coach:'LU y después PA.'},
          {id:'l_build2',type:'build',skill:'blend_l',prompt:'Construye LOLA',say:'Lola',parts:['lo','la'],answerParts:['lo','la'],word:'Lola',coach:'LO y después LA.'},
          {id:'l_read',type:'wordReveal',assess:false,skill:'word_lupa',prompt:'Intenta leer esta palabra',word:'lupa',parts:['lu','pa'],say:'lupa'},
          {id:'l_word',type:'symbolPick',skill:'word_lupa',prompt:'¿Dónde dice LUPA?',say:'lupa',options:['lupa','Lola','loma'],answer:'lupa',coach:'Busca LU y después PA.'}
        ]
      }
    ],
    reviewActivities:[
      {id:'rv_a',type:'listenPick',skill:'hear_vowels',prompt:'Una luciérnaga vuelve: ¿qué vocal escuchas?',say:'e',options:['a','e','o'],answer:'e',coach:'Escucha: eee.'},
      {id:'rv_v',type:'symbolPick',skill:'vowel_symbols',prompt:'Recuerda esta vocal',say:'i',options:['u','i','a'],answer:'i',coach:'Escucha otra vez: iii.'},
      {id:'rv_m',type:'symbolPick',skill:'m_family',prompt:'Una piedra conocida',say:'mo',options:['ma','mo','mu'],answer:'mo',coach:'Mmm + ooo = mo.'},
      {id:'rv_mb',type:'picturePick',skill:'hear_m',prompt:'¿Cuál empieza como mmm?',say:'mmm',options:[{value:'mesa',src:O+'mesa.svg'},{value:'sapo',src:O+'sapo.svg'},{value:'lupa',src:O+'lupa.svg'}],answer:'mesa',coach:'Mmm… mesa.'},
      {id:'rv_p',type:'symbolPick',skill:'p_family',prompt:'Recuerda P',say:'pa',options:['pa','pi','pu'],answer:'pa',coach:'Ppp + aaa = pa.'},
      {id:'rv_s',type:'symbolPick',skill:'s_family',prompt:'Recuerda S',say:'su',options:['sa','su','so'],answer:'su',coach:'Sss + uuu = su.'},
      {id:'rv_l',type:'symbolPick',skill:'l_family',prompt:'Recuerda L',say:'la',options:['lu','la','lo'],answer:'la',coach:'Lll + aaa = la.'}
    ],
    stories:[
      {id:'story_mp',title:'Mamá y papá',requires:[{skill:'word_mama',score:35},{skill:'word_papa',score:35}],art:O+'mama.svg',text:'Mamá mima a papá.',words:['Mamá','mima','a','papá.'],skill:'sentence_mp',comprehension:{prompt:'¿A quién mima mamá?',options:['A papá','Al sapo','A Lola'],answer:'A papá'}},
      {id:'story_l',title:'Lola y la lupa',requires:[{skill:'word_lupa',score:35},{skill:'s_family',score:35}],art:O+'lupa.svg',text:'Lola usa la lupa.',words:['Lola','usa','la','lupa.'],skill:'sentence_l',comprehension:{prompt:'¿Qué usa Lola?',options:['La lupa','La sopa','El sapo'],answer:'La lupa'}}
    ]
  };
})();
