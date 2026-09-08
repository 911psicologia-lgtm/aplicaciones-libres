(function(){
  const A='assets/';
  const O=A+'objects/';
  const C=A+'characters/';
  const AN=A+'animals/';
  const L=A+'letters/';
  const W=A+'worlds/';
  const X=A+'extras/';
  const SC=A+'scenes/';
  const skill=(id,label,group,order,prereqs=[])=>({id,label,group,order,prereqs});
  window.EMILIA_CONTENT={
    version:7.3,
    title:'Emilia · El Bosque de las Palabras',
    mascot:{
      name:'Lumi',
      src:A+'characters/lumi_guide.png',
      variants:{
        guide:A+'characters/lumi_guide.png',
        thinking:A+'characters/lumi_thinking.png',
        cheer:A+'characters/lumi_cheer.png',
        victory:A+'characters/lumi_victory.png'
      }
    },
    chapterMapArt:{
      1:W+'fondo_bosque_principal.webp',
      2:W+'fondo_gran_jardin_lector.webp',
      3:W+'fondo_bosque_secretos.webp'
    },
    ui:{
      listen:X+'icono_escuchar.webp',
      repeat:X+'icono_repetir.webp',
      play:X+'boton_play_ilustrado.webp',
      book:X+'icono_libro.webp',
      adult:X+'icono_adulto.webp',
      forest:X+'icono_bosque.webp',
      microphone:X+'icono_microfono.webp',
      seed:O+'semilla.webp',
      sprout:O+'brote.webp',
      firefly:O+'luciernaga.webp',
      star:X+'estrella_logro.webp',
      medal:X+'medalla.webp',
      chest:X+'cofre_semillas.webp',
      secretChest:X+'cofre_palabras.webp',
      secretStar:X+'estrella_confite.webp',
      secretMedal:X+'medalla_patrones.webp',
      secretBadge:X+'insignia_sendero_secretos.webp',
      secretKey:X+'llave_secreta.webp',
      secretDoor:X+'puerta_secreta.webp',
      secretScroll:X+'pergamino_patron.webp',
      secretTreasure:X+'tesoro_secreto.webp'
    },
    letterArt:{
      a:L+'vocal_a.webp',e:L+'vocal_e.webp',i:L+'vocal_i.webp',o:L+'vocal_o.webp',u:L+'vocal_u.webp',
      m:L+'letra_m.webp',p:L+'letra_p.webp',s:L+'letra_s.webp',l:L+'letra_l.webp',
      n:L+'letra_n.webp',t:L+'letra_t.webp',d:L+'letra_d.webp'
    },
    wordArt:{
      'mamá':C+'mama.webp','papá':C+'papa.webp','puma':AN+'puma.webp','sapo':AN+'sapo.webp','sopa':O+'sopa.webp',
      'lupa':O+'lupa.webp','mono':AN+'mono.webp','nido':O+'nido.webp','pato':AN+'pato.webp','dado':O+'dado.webp',
      'dedo':O+'dedo.webp','pelota':O+'pelota.webp','luna':O+'luna.webp','taza':O+'taza.webp','mapa':O+'mapa.webp',
      'pipa':O+'pipa.webp','tito':C+'tito.webp','nana':C+'nana.webp','dami':C+'dami.webp','nene':C+'nene.webp',
      'sol':O+'sol.webp','flor':O+'flor.webp','libro':O+'libro.webp','rana':AN+'rana.webp','cama':O+'cama.webp','brote':O+'brote.webp',
      'niño':C+'nino.webp','niña':C+'nina.webp','rama':O+'rama.webp','casa':O+'casa.webp','coco':O+'coco.webp','cuna':O+'cuna.webp',
      'bota':O+'bota.webp','bata':O+'bata.webp','beso':O+'beso.webp','bola':O+'bola.webp','banana':O+'banana.webp',
      'foto':O+'foto.webp','foca':AN+'foca.webp','gato':AN+'gato.webp','gusano':AN+'gusano.webp',
      'leche':O+'leche.webp','moño':O+'moño.webp','queso':O+'queso.webp','perro':AN+'perro.webp','burro':AN+'burro.webp',
      'carro':O+'carro.webp','torre':O+'torre.webp','cena':O+'cena.webp','cine':O+'cine.webp','cero':O+'cero.webp',
      'cima':O+'cima.webp','gema':O+'gema.webp','gel':O+'gel.webp','gigante':C+'gigante_amable.webp','chico':C+'chico.webp'
    },
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
      skill('comprehension_1','Comprende frases','Comprensión',41,[{skill:'sentence_mp',score:35}]),
      skill('mixed_words','Reconoce palabras variadas','Palabras',42,[{skill:'word_dado',score:40},{skill:'word_nido',score:40}]),
      skill('sentence_build','Ordena frases cortas','Lectura',43,[{skill:'mixed_words',score:40}]),
      skill('comprehension_2','Comprende frases nuevas','Comprensión',44,[{skill:'sentence_build',score:35}]),
      skill('word_image_link','Une palabra e imagen','Palabras',45,[{skill:'word_dado',score:35},{skill:'word_nido',score:35}]),
      skill('hear_r','Sonido inicial R','Escucha',46,[{skill:'mixed_words',score:35}]),
      skill('r_symbol','Reconoce R','Letras',47,[{skill:'hear_r',score:40}]),
      skill('r_family','Familia R','Sílabas',48,[{skill:'r_symbol',score:40}]),
      skill('blend_r','Combina con R','Combinar',49,[{skill:'r_family',score:45},{skill:'m_family',score:40}]),
      skill('word_rana','Lee palabras con R','Palabras',50,[{skill:'blend_r',score:45}]),
      skill('hear_c','Sonido inicial C','Escucha',51,[{skill:'r_family',score:45}]),
      skill('c_symbol','Reconoce C','Letras',52,[{skill:'hear_c',score:40}]),
      skill('c_family','CA · CO · CU','Sílabas',53,[{skill:'c_symbol',score:40}]),
      skill('blend_c','Combina con C','Combinar',54,[{skill:'c_family',score:45},{skill:'m_family',score:40}]),
      skill('word_cama','Lee palabras con C','Palabras',55,[{skill:'blend_c',score:45}]),
      skill('hear_b','Sonido inicial B','Escucha',56,[{skill:'c_family',score:45}]),
      skill('b_symbol','Reconoce B','Letras',57,[{skill:'hear_b',score:40}]),
      skill('b_family','Familia B','Sílabas',58,[{skill:'b_symbol',score:40}]),
      skill('blend_b','Combina con B','Combinar',59,[{skill:'b_family',score:45},{skill:'t_family',score:40}]),
      skill('word_bota','Lee palabras con B','Palabras',60,[{skill:'blend_b',score:45}]),
      skill('hear_f','Sonido inicial F','Escucha',61,[{skill:'b_family',score:45}]),
      skill('f_symbol','Reconoce F','Letras',62,[{skill:'hear_f',score:40}]),
      skill('f_family','Familia F','Sílabas',63,[{skill:'f_symbol',score:40}]),
      skill('blend_f','Combina con F','Combinar',64,[{skill:'f_family',score:45},{skill:'t_family',score:40}]),
      skill('word_foto','Lee palabras con F','Palabras',65,[{skill:'blend_f',score:45}]),
      skill('hear_g','Sonido inicial G','Escucha',66,[{skill:'f_family',score:45}]),
      skill('g_symbol','Reconoce G','Letras',67,[{skill:'hear_g',score:40}]),
      skill('g_family','GA · GO · GU','Sílabas',68,[{skill:'g_symbol',score:40}]),
      skill('blend_g','Combina con G','Combinar',69,[{skill:'g_family',score:45},{skill:'t_family',score:40}]),
      skill('word_gato','Lee palabras con G','Palabras',70,[{skill:'blend_g',score:45}]),
      skill('advanced_words','Reconoce palabras nuevas','Palabras',71,[{skill:'word_gato',score:40},{skill:'word_foto',score:40}]),
      skill('advanced_sentence','Ordena frases nuevas','Lectura',72,[{skill:'advanced_words',score:40}]),
      skill('advanced_comprehension','Comprende nuevas historias','Comprensión',73,[{skill:'advanced_sentence',score:35}]),
      skill('hear_enye','Escucha palabras con Ñ','Escucha',74,[{skill:'advanced_words',score:38}]),
      skill('enye_symbol','Reconoce Ñ','Letras',75,[{skill:'hear_enye',score:35}]),
      skill('enye_family','ÑA · ÑE · ÑI · ÑO · ÑU','Sílabas',76,[{skill:'enye_symbol',score:40}]),
      skill('blend_enye','Combina con Ñ','Combinar',77,[{skill:'enye_family',score:42},{skill:'n_family',score:40}]),
      skill('word_nino','Lee niño y niña','Palabras',78,[{skill:'blend_enye',score:45}]),
      skill('ch_pattern','Reconoce CH','Patrones',79,[{skill:'word_nino',score:40}]),
      skill('blend_ch','Combina con CH','Combinar',80,[{skill:'ch_pattern',score:42},{skill:'l_family',score:40}]),
      skill('word_leche','Lee palabras con CH','Palabras',81,[{skill:'blend_ch',score:45}]),
      skill('qu_pattern','Reconoce QUE · QUI','Patrones',82,[{skill:'word_leche',score:40}]),
      skill('blend_qu','Combina con QU','Combinar',83,[{skill:'qu_pattern',score:42},{skill:'s_family',score:40}]),
      skill('word_queso','Lee palabras con QU','Palabras',84,[{skill:'blend_qu',score:45}]),
      skill('rr_pattern','Reconoce RR dentro de palabra','Patrones',85,[{skill:'word_queso',score:40},{skill:'r_family',score:45}]),
      skill('word_perro','Lee palabras con RR','Palabras',86,[{skill:'rr_pattern',score:45}]),
      skill('c_soft','Reconoce CE · CI','Patrones',87,[{skill:'word_perro',score:40},{skill:'c_family',score:45}]),
      skill('word_cine','Lee palabras con CE · CI','Palabras',88,[{skill:'c_soft',score:45}]),
      skill('g_soft','Reconoce GE · GI','Patrones',89,[{skill:'word_cine',score:40},{skill:'g_family',score:45}]),
      skill('word_gema','Lee palabras con GE · GI','Palabras',90,[{skill:'g_soft',score:45}]),
      skill('secret_words','Distingue patrones especiales','Palabras',91,[{skill:'word_gema',score:40},{skill:'word_perro',score:40}]),
      skill('secret_sentence','Ordena frases con patrones especiales','Lectura',92,[{skill:'secret_words',score:40}]),
      skill('secret_comprehension','Comprende historias con patrones especiales','Comprensión',93,[{skill:'secret_sentence',score:35}])
    ],
    worlds:[
      {id:'forest_vowels',chapter:1,letter:'A·E·I·O·U',name:'Claro de las Vocales',short:'Vocales',x:50,y:88,art:W+'fondo_sendero_vocales.webp'},
      {id:'forest_m',chapter:1,letter:'M',name:'Puerta de M',short:'M',x:22,y:72,art:W+'fondo_casa_m.webp',letterArt:L+'letra_m.webp',stone:O+'piedra_m.webp'},
      {id:'forest_p',chapter:1,letter:'P',name:'Puente de P',short:'P',x:72,y:63,art:W+'fondo_casa_p.webp',letterArt:L+'letra_p.webp',stone:O+'piedra_p.webp'},
      {id:'forest_s',chapter:1,letter:'S',name:'Laguna de S',short:'S',x:28,y:52,art:W+'fondo_laguna_s.webp',letterArt:L+'letra_s.webp',stone:O+'piedra_s.webp'},
      {id:'forest_l',chapter:1,letter:'L',name:'Casa de L',short:'L',x:70,y:41,art:W+'fondo_ladera_l.webp',letterArt:L+'letra_l.webp',stone:O+'piedra_l.webp'},
      {id:'forest_n',chapter:1,letter:'N',name:'Nido de N',short:'N',x:27,y:30,art:W+'fondo_nido_n.webp',letterArt:L+'letra_n.webp',stone:O+'piedra_n.webp'},
      {id:'forest_t',chapter:1,letter:'T',name:'Torre de T',short:'T',x:70,y:20,art:W+'fondo_torre_t.webp',letterArt:L+'letra_t.webp',stone:O+'piedra_t.webp'},
      {id:'forest_d',chapter:1,letter:'D',name:'Domo de D',short:'D',x:48,y:10,art:W+'fondo_duna_d.webp',letterArt:L+'letra_d.webp',stone:O+'piedra_d.webp'},
      {id:'forest_mix',chapter:1,letter:'★',name:'Jardín de Palabras',short:'Palabras',x:80,y:8,art:W+'fondo_mi_libro.webp'},
      {id:'forest_r',chapter:2,letter:'R',name:'Río de la R',short:'R',x:23,y:77,art:W+'fondo_sendero_r.webp',stone:O+'piedra_d.webp'},
      {id:'forest_c',chapter:2,letter:'C',name:'Casa de CA·CO·CU',short:'C',x:72,y:64,art:W+'fondo_sendero_c.webp',stone:O+'piedra_d.webp'},
      {id:'forest_b',chapter:2,letter:'B',name:'Bosquecito de B',short:'B',x:28,y:50,art:W+'fondo_sendero_b.webp',stone:O+'piedra_d.webp'},
      {id:'forest_f',chapter:2,letter:'F',name:'Flor de la F',short:'F',x:70,y:37,art:W+'fondo_sendero_f.webp',stone:O+'piedra_d.webp'},
      {id:'forest_g',chapter:2,letter:'G',name:'Gruta de GA·GO·GU',short:'G',x:30,y:23,art:W+'fondo_sendero_g.webp',stone:O+'piedra_d.webp'},
      {id:'forest_expand',chapter:2,letter:'✦',name:'Gran Jardín Lector',short:'Historias',x:70,y:10,art:W+'fondo_gran_jardin_lector.webp'},
      {id:'forest_enye',chapter:3,letter:'Ñ',name:'Nube de la Ñ',short:'Ñ',x:24,y:78,art:W+'fondo_sendero_enye.webp',stone:O+'piedra_n.webp'},
      {id:'forest_ch',chapter:3,letter:'CH',name:'Choza de CH',short:'CH',x:73,y:66,art:W+'fondo_sendero_ch.webp',stone:O+'piedra_s.webp'},
      {id:'forest_qu',chapter:3,letter:'QU',name:'Puente de QU',short:'QU',x:28,y:53,art:W+'fondo_sendero_qu.webp',stone:O+'piedra_p.webp'},
      {id:'forest_rr',chapter:3,letter:'RR',name:'Carrera de RR',short:'RR',x:72,y:40,art:W+'fondo_sendero_rr.webp',stone:O+'piedra_d.webp'},
      {id:'forest_ceci',chapter:3,letter:'CE·CI',name:'Claro de CE · CI',short:'CE·CI',x:28,y:28,art:W+'fondo_sendero_ceci.webp',stone:O+'piedra_s.webp'},
      {id:'forest_gegi',chapter:3,letter:'GE·GI',name:'Gruta de GE · GI',short:'GE·GI',x:72,y:17,art:W+'fondo_sendero_gegi.webp',stone:O+'piedra_d.webp'},
      {id:'forest_secrets',chapter:3,letter:'★',name:'Bosque de Secretos',short:'Secretos',x:48,y:7,art:W+'fondo_bosque_secretos.webp'}
    ],
    missions:[
      {
        id:'forest_vowels',order:1,world:'Bosque de los Ecos',title:'El claro de las vocales',subtitle:'Escucha las cinco voces que iluminan el bosque.',letter:'A·E·I·O·U',masteryTarget:55,requires:[],
        skillIds:['hear_vowels','vowel_symbols'],
        activities:[
          {id:'v_intro',type:'syllableTrail',assess:false,skill:'hear_vowels',prompt:'Despierta las cinco luciérnagas',items:['a','e','i','o','u'],sayPrefix:'Vocal '},
          {id:'v_a',type:'listenPick',skill:'hear_vowels',prompt:'¿Qué vocal escuchas?',say:'a',options:['a','e','o'],answer:'a',coach:'Escucha la A otra vez. Abre mucho la boca.'},
          {id:'v_i',type:'listenPick',skill:'hear_vowels',prompt:'¿Cuál suena finita?',say:'i',options:['u','i','a'],answer:'i',coach:'Escucha la I otra vez.'},
          {id:'v_o',type:'symbolPick',skill:'vowel_symbols',prompt:'Busca la letra que suena así',say:'o',options:['e','o','u','a'],answer:'o',coach:'La O hace la boca redonda.'},
          {id:'v_u',type:'symbolPick',skill:'vowel_symbols',prompt:'Una última luz',say:'u',options:['i','u','e','o'],answer:'u',coach:'Escucha la U otra vez. Busca la U.'}
        ]
      },
      {
        id:'forest_m',order:2,world:'Bosque de los Ecos',title:'La puerta de la M',subtitle:'Escucha palabras que empiezan con M, juega con MA·ME·MI·MO·MU y construye MAMÁ.',letter:'M',masteryTarget:58,requires:[{mission:'forest_vowels'},{skill:'vowel_symbols',score:45}],
        skillIds:['hear_m','m_symbol','m_family','blend_m','word_mama'],
        activities:[
          {id:'m_hunt',type:'picturePick',skill:'hear_m',prompt:'Busca una palabra que empiece con M',voicePrompt:'Busca una palabra que empiece con M.',targetLetter:'M',options:[{value:'mamá',src:C+'mama.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'lupa',src:O+'lupa.webp'}],answer:'mamá',coach:'MAMÁ empieza con M.'},
          {id:'m_symbol',type:'symbolPick',skill:'m_symbol',prompt:'Escucha MAMÁ. ¿Con qué letra empieza?',voicePrompt:'Escucha: mamá. ¿Con qué letra empieza?',say:'mamá',audioKind:'word',options:['m','p','s'],answer:'m',coach:'MAMÁ empieza con M.'},
          {id:'m_trace',type:'trace',assess:false,skill:'m_symbol',letter:'m',prompt:'Dibuja el camino de la M',say:'Esta es la M, como en mamá.',audioKind:'instruction'},
          {id:'m_trail',type:'syllableTrail',assess:false,skill:'m_family',prompt:'Haz sonar las piedras de M',items:['ma','me','mi','mo','mu']},
          {id:'m_family',type:'symbolPick',skill:'m_family',prompt:'Escucha y toca la sílaba',say:'mi',options:['ma','mi','mo','mu'],answer:'mi',coach:'Escucha MI completa. Empieza con M y termina con I.'},
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
          {id:'p_hunt',type:'picturePick',skill:'hear_p',prompt:'Busca una palabra que empiece con P',voicePrompt:'Busca una palabra que empiece con P.',targetLetter:'P',options:[{value:'papá',src:C+'papa.webp'},{value:'cama',src:O+'cama.webp'},{value:'sapo',src:AN+'sapo.webp'}],answer:'papá',coach:'PAPÁ empieza con P.'},
          {id:'p_symbol',type:'symbolPick',skill:'p_symbol',prompt:'Escucha PAPÁ. ¿Con qué letra empieza?',voicePrompt:'Escucha: papá. ¿Con qué letra empieza?',say:'papá',audioKind:'word',options:['m','p','l'],answer:'p',coach:'PAPÁ empieza con P.'},
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
          {id:'s_hunt',type:'picturePick',skill:'hear_s',prompt:'Busca una palabra que empiece con S',voicePrompt:'Busca una palabra que empiece con S.',targetLetter:'S',options:[{value:'sapo',src:AN+'sapo.webp'},{value:'papá',src:C+'papa.webp'},{value:'lupa',src:O+'lupa.webp'}],answer:'sapo',coach:'SAPO empieza con S.'},
          {id:'s_symbol',type:'symbolPick',skill:'s_symbol',prompt:'Escucha SAPO. ¿Con qué letra empieza?',voicePrompt:'Escucha: sapo. ¿Con qué letra empieza?',say:'sapo',audioKind:'word',options:['s','m','p'],answer:'s',coach:'SAPO empieza con S.'},
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
          {id:'l_hunt',type:'picturePick',skill:'hear_l',prompt:'Busca una palabra que empiece con L',voicePrompt:'Busca una palabra que empiece con L.',targetLetter:'L',options:[{value:'lupa',src:O+'lupa.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'cama',src:O+'cama.webp'}],answer:'lupa',coach:'LUPA empieza con L.'},
          {id:'l_symbol',type:'symbolPick',skill:'l_symbol',prompt:'Escucha LUPA. ¿Con qué letra empieza?',voicePrompt:'Escucha: lupa. ¿Con qué letra empieza?',say:'lupa',audioKind:'word',options:['l','p','m'],answer:'l',coach:'LUPA empieza con L.'},
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
          {id:'n_hunt',type:'picturePick',skill:'hear_n',prompt:'Busca una palabra que empiece con N',voicePrompt:'Busca una palabra que empiece con N.',targetLetter:'N',options:[{value:'nido',src:O+'nido.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'lupa',src:O+'lupa.webp'}],answer:'nido',coach:'NIDO empieza con N.'},
          {id:'n_hear',type:'symbolPick',skill:'hear_n',prompt:'Escucha NIDO. ¿Con qué letra empieza?',voicePrompt:'Escucha: nido. ¿Con qué letra empieza?',say:'nido',audioKind:'word',options:['n','m','l'],answer:'n',coach:'NIDO empieza con N.'},
          {id:'n_symbol',type:'symbolPick',skill:'n_symbol',prompt:'Busca la N',voicePrompt:'Busca la N.',say:'nido',audioKind:'word',options:['n','m','l'],answer:'n',coach:'Esta es la N.'},
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
          {id:'t_hunt',type:'picturePick',skill:'hear_t',prompt:'Busca una palabra que empiece con T',voicePrompt:'Busca una palabra que empiece con T.',targetLetter:'T',options:[{value:'taza',src:O+'taza.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'papá',src:C+'papa.webp'}],answer:'taza',coach:'TAZA empieza con T.'},
          {id:'t_hear',type:'symbolPick',skill:'hear_t',prompt:'Escucha TINA. ¿Con qué letra empieza?',voicePrompt:'Escucha: tina. ¿Con qué letra empieza?',say:'tina',audioKind:'word',options:['t','n','p'],answer:'t',coach:'TINA empieza con T.'},
          {id:'t_symbol',type:'symbolPick',skill:'t_symbol',prompt:'Busca la T',voicePrompt:'Busca la T.',say:'tina',audioKind:'word',options:['t','n','p'],answer:'t',coach:'Esta es la T.'},
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
          {id:'d_hunt',type:'picturePick',skill:'hear_d',prompt:'Busca una palabra que empiece con D',voicePrompt:'Busca una palabra que empiece con D.',targetLetter:'D',options:[{value:'dado',src:O+'dado.webp'},{value:'nido',src:O+'nido.webp'},{value:'sapo',src:AN+'sapo.webp'}],answer:'dado',coach:'DADO empieza con D.'},
          {id:'d_hear',type:'symbolPick',skill:'hear_d',prompt:'Escucha DADO. ¿Con qué letra empieza?',voicePrompt:'Escucha: dado. ¿Con qué letra empieza?',say:'dado',audioKind:'word',options:['d','t','n'],answer:'d',coach:'DADO empieza con D.'},
          {id:'d_symbol',type:'symbolPick',skill:'d_symbol',prompt:'Busca la D',voicePrompt:'Busca la D.',say:'dado',audioKind:'word',options:['d','t','n'],answer:'d',coach:'Esta es la D.'},
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
      }      ,{
        id:'forest_mix',order:9,world:'Jardín lector',title:'El jardín de las palabras',subtitle:'Mezcla todo lo aprendido: imágenes, palabras, sílabas y primeras frases.',letter:'★',masteryTarget:62,minAssessed:6,maxAssessed:9,requires:[{mission:'forest_d'},{skill:'d_family',score:48}],
        skillIds:['mixed_words','word_image_link','sentence_build','comprehension_2'],
        activities:[
          {id:'mix_picword_puma',type:'imageWordPick',skill:'word_image_link',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra puma.',word:'puma',src:AN+'puma.webp',options:['sapo','puma','lupa'],answer:'puma',coach:'Busca pu y después ma.'},
          {id:'mix_picword_nido',type:'imageWordPick',variant:true,skill:'word_image_link',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra nido.',word:'nido',src:O+'nido.webp',options:['nido','dado','pato'],answer:'nido',coach:'Busca ni y después do.'},
          {id:'mix_picword_sopa',type:'imageWordPick',variant:true,skill:'word_image_link',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra sopa.',word:'sopa',src:O+'sopa.webp',options:['sopa','sapo','pipa'],answer:'sopa',coach:'Busca so y después pa.'},
          {id:'mix_memory',type:'memoryMatch',skill:'mixed_words',prompt:'Encuentra las parejas',voicePrompt:'Une cada dibujo con su palabra.',pairs:[{word:'mamá',src:C+'mama.webp'},{word:'sapo',src:AN+'sapo.webp'},{word:'lupa',src:O+'lupa.webp'}],coach:'Busca el dibujo y la palabra que dicen lo mismo.'},
          {id:'mix_clap',type:'symbolPick',skill:'mixed_words',prompt:'¿Cuántas partes escuchas?',voicePrompt:'Escucha: pelota. Da una palmada por cada parte. ¿Cuántas partes escuchas?',say:'pelota',audioKind:'word',options:['2','3','4'],answer:'3',coach:'PE · LO · TA tiene tres partes.'},
          {id:'mix_sentence_tito',type:'sentenceBuild',skill:'sentence_build',prompt:'Ordena la frase',voicePrompt:'Escucha: Tito toma sopa. Pon las palabras en orden.',say:'Tito toma sopa.',parts:['tito','toma','sopa'],answerParts:['tito','toma','sopa'],coach:'Primero Tito. Después toma. Al final sopa.'},
          {id:'mix_sentence_mama',type:'sentenceBuild',variant:true,skill:'sentence_build',prompt:'Ordena la frase',voicePrompt:'Escucha: Mamá mima a papá. Pon las palabras en orden.',say:'Mamá mima a papá.',parts:['mamá','mima','a','papá'],answerParts:['mamá','mima','a','papá'],coach:'Escucha otra vez y empieza por mamá.'},
          {id:'mix_sentence_pato',type:'sentenceBuild',variant:true,skill:'sentence_build',prompt:'Ordena la frase',voicePrompt:'Escucha: El pato nada. Pon las palabras en orden.',say:'El pato nada.',parts:['el','pato','nada'],answerParts:['el','pato','nada'],coach:'Primero el. Después pato. Al final nada.'},
          {id:'mix_build_paloma',type:'build',variant:true,skill:'mixed_words',prompt:'Construye paloma',say:'paloma',parts:['pa','lo','ma'],answerParts:['pa','lo','ma'],word:'paloma',coach:'PA, LO y MA.'},
          {id:'mix_find_dado',type:'symbolPick',skill:'mixed_words',prompt:'¿Dónde dice dado?',voicePrompt:'Busca la palabra dado.',say:'dado',audioKind:'word',options:['dedo','dado','lado'],answer:'dado',coach:'Busca da y después do.'}
        ]
      },
      {
        id:'forest_r',order:10,world:'Nuevos senderos',title:'El río de la R',subtitle:'Escucha R en palabras reales, juega con RA·RE·RI·RO·RU y construye RANA.',letter:'R',masteryTarget:60,requires:[{mission:'forest_mix'},{skill:'mixed_words',score:38}],
        skillIds:['hear_r','r_symbol','r_family','blend_r','word_rana'],
        activities:[
          {id:'r_hunt',type:'picturePick',skill:'hear_r',prompt:'Busca una palabra que empiece con R',voicePrompt:'Busca una palabra que empiece con R.',targetLetter:'R',options:[{value:'rana',src:AN+'rana.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'cama',src:O+'cama.webp'}],answer:'rana',coach:'RANA empieza con R.'},
          {id:'r_symbol',type:'symbolPick',skill:'r_symbol',prompt:'Escucha RANA. ¿Con qué letra empieza?',voicePrompt:'Escucha: rana. ¿Con qué letra empieza?',say:'rana',audioKind:'word',options:['r','l','d'],answer:'r',coach:'RANA empieza con R.'},
          {id:'r_trace',type:'trace',assess:false,skill:'r_symbol',letter:'r',prompt:'Une los puntos de la R',say:'Esta es la R, como en rana.',audioKind:'instruction'},
          {id:'r_trail',type:'syllableTrail',assess:false,skill:'r_family',prompt:'Haz sonar las piedras de R',items:['ra','re','ri','ro','ru']},
          {id:'r_family',type:'soundBubbles',skill:'r_family',prompt:'Atrapa la sílaba',say:'ra',options:['ra','re','ro','ru'],answer:'ra',coach:'Escucha RA.'},
          {id:'r_rana',type:'build',skill:'blend_r',prompt:'Arma RANA',say:'rana',parts:['ra','na'],answerParts:['ra','na'],word:'rana',coach:'RA y después NA.'},
          {id:'r_rama',type:'build',variant:true,skill:'blend_r',prompt:'Arma RAMA',say:'rama',parts:['ra','ma'],answerParts:['ra','ma'],word:'rama',coach:'RA y después MA.'},
          {id:'r_remo',type:'build',variant:true,skill:'blend_r',prompt:'Arma REMO',say:'remo',parts:['re','mo'],answerParts:['re','mo'],word:'remo',coach:'RE y después MO.'},
          {id:'r_risa',type:'build',variant:true,skill:'blend_r',prompt:'Arma RISA',say:'risa',parts:['ri','sa'],answerParts:['ri','sa'],word:'risa',coach:'RI y después SA.'},
          {id:'r_word',type:'symbolPick',skill:'word_rana',prompt:'¿Dónde dice rana?',voicePrompt:'Busca la palabra rana.',say:'rana',audioKind:'word',options:['rama','rana','luna'],answer:'rana',coach:'Busca ra y después na.'}
        ]
      },
      {
        id:'forest_c',order:11,world:'Nuevos senderos',title:'La casa de CA · CO · CU',subtitle:'Primero aprendemos el sonido de C en CA, CO y CU. CE y CI llegarán después.',letter:'C',masteryTarget:60,requires:[{mission:'forest_r'},{skill:'r_family',score:48}],
        skillIds:['hear_c','c_symbol','c_family','blend_c','word_cama'],
        activities:[
          {id:'c_hunt',type:'picturePick',skill:'hear_c',prompt:'Busca una palabra que empiece con C',voicePrompt:'Busca una palabra que empiece con C.',targetLetter:'C',options:[{value:'cama',src:O+'cama.webp'},{value:'rana',src:AN+'rana.webp'},{value:'pato',src:AN+'pato.webp'}],answer:'cama',coach:'CAMA empieza con C.'},
          {id:'c_symbol',type:'symbolPick',skill:'c_symbol',prompt:'Escucha CAMA. ¿Con qué letra empieza?',voicePrompt:'Escucha: cama. ¿Con qué letra empieza?',say:'cama',audioKind:'word',options:['c','g','p'],answer:'c',coach:'CAMA empieza con C.'},
          {id:'c_trace',type:'trace',assess:false,skill:'c_symbol',letter:'c',prompt:'Une los puntos de la C',say:'Esta es la C, como en cama.',audioKind:'instruction'},
          {id:'c_trail',type:'syllableTrail',assess:false,skill:'c_family',prompt:'Haz sonar CA · CO · CU',items:['ca','co','cu']},
          {id:'c_family',type:'soundBubbles',skill:'c_family',prompt:'Atrapa la sílaba',say:'co',options:['ca','co','cu'],answer:'co',coach:'Escucha CO.'},
          {id:'c_cama',type:'build',skill:'blend_c',prompt:'Arma CAMA',say:'cama',parts:['ca','ma'],answerParts:['ca','ma'],word:'cama',coach:'CA y después MA.'},
          {id:'c_casa',type:'build',variant:true,skill:'blend_c',prompt:'Arma CASA',say:'casa',parts:['ca','sa'],answerParts:['ca','sa'],word:'casa',coach:'CA y después SA.'},
          {id:'c_coco',type:'build',variant:true,skill:'blend_c',prompt:'Arma COCO',say:'coco',parts:['co','co'],answerParts:['co','co'],word:'coco',coach:'CO y otra vez CO.'},
          {id:'c_cuna',type:'build',variant:true,skill:'blend_c',prompt:'Arma CUNA',say:'cuna',parts:['cu','na'],answerParts:['cu','na'],word:'cuna',coach:'CU y después NA.'},
          {id:'c_word',type:'symbolPick',skill:'word_cama',prompt:'¿Dónde dice cama?',voicePrompt:'Busca la palabra cama.',say:'cama',audioKind:'word',options:['cama','casa','rama'],answer:'cama',coach:'Busca ca y después ma.'}
        ]
      },
      {
        id:'forest_b',order:12,world:'Nuevos senderos',title:'El bosquecito de la B',subtitle:'Escucha B en palabras y forma BA·BE·BI·BO·BU.',letter:'B',masteryTarget:60,requires:[{mission:'forest_c'},{skill:'c_family',score:48}],
        skillIds:['hear_b','b_symbol','b_family','blend_b','word_bota'],
        activities:[
          {id:'b_symbol',type:'symbolPick',skill:'hear_b',prompt:'Escucha BOTA. ¿Con qué letra empieza?',voicePrompt:'Escucha: bota. ¿Con qué letra empieza?',say:'bota',audioKind:'word',options:['b','p','d'],answer:'b',coach:'BOTA empieza con B.'},
          {id:'b_find',type:'picturePick',variant:true,skill:'hear_b',prompt:'Busca una palabra que empiece con B',voicePrompt:'Busca una palabra que empiece con B.',targetLetter:'B',options:[{value:'bota',src:O+'bota.webp'},{value:'rana',src:AN+'rana.webp'},{value:'foca',src:AN+'foca.webp'}],answer:'bota',coach:'BOTA empieza con B.'},
          {id:'b_trace',type:'trace',assess:false,skill:'b_symbol',letter:'b',prompt:'Une los puntos de la B',say:'Esta es la B, como en bota.',audioKind:'instruction'},
          {id:'b_trail',type:'syllableTrail',assess:false,skill:'b_family',prompt:'Haz sonar las piedras de B',items:['ba','be','bi','bo','bu']},
          {id:'b_family',type:'soundBubbles',skill:'b_family',prompt:'Atrapa la sílaba',say:'bo',options:['ba','be','bo','bu'],answer:'bo',coach:'Escucha BO.'},
          {id:'b_bota',type:'build',skill:'blend_b',prompt:'Arma BOTA',say:'bota',parts:['bo','ta'],answerParts:['bo','ta'],word:'bota',coach:'BO y después TA.'},
          {id:'b_bata',type:'build',variant:true,skill:'blend_b',prompt:'Arma BATA',say:'bata',parts:['ba','ta'],answerParts:['ba','ta'],word:'bata',coach:'BA y después TA.'},
          {id:'b_beso',type:'build',variant:true,skill:'blend_b',prompt:'Arma BESO',say:'beso',parts:['be','so'],answerParts:['be','so'],word:'beso',coach:'BE y después SO.'},
          {id:'b_bola',type:'build',variant:true,skill:'blend_b',prompt:'Arma BOLA',say:'bola',parts:['bo','la'],answerParts:['bo','la'],word:'bola',coach:'BO y después LA.'},
          {id:'b_banana',type:'build',variant:true,skill:'blend_b',prompt:'Arma BANANA',say:'banana',parts:['ba','na','na'],answerParts:['ba','na','na'],word:'banana',coach:'BA, NA y NA.'},
          {id:'b_word',type:'symbolPick',skill:'word_bota',prompt:'¿Dónde dice bota?',voicePrompt:'Busca la palabra bota.',say:'bota',audioKind:'word',options:['bota','bata','pato'],answer:'bota',coach:'Busca bo y después ta.'}
        ]
      },
      {
        id:'forest_f',order:13,world:'Nuevos senderos',title:'La flor de la F',subtitle:'Escucha F, juega con FA·FE·FI·FO·FU y construye nuevas palabras.',letter:'F',masteryTarget:60,requires:[{mission:'forest_b'},{skill:'b_family',score:48}],
        skillIds:['hear_f','f_symbol','f_family','blend_f','word_foto'],
        activities:[
          {id:'f_hunt',type:'picturePick',skill:'hear_f',prompt:'Busca una palabra que empiece con F',voicePrompt:'Busca una palabra que empiece con F.',targetLetter:'F',options:[{value:'foca',src:AN+'foca.webp'},{value:'rana',src:AN+'rana.webp'},{value:'cama',src:O+'cama.webp'}],answer:'foca',coach:'FOCA empieza con F.'},
          {id:'f_symbol',type:'symbolPick',skill:'f_symbol',prompt:'Escucha FOTO. ¿Con qué letra empieza?',voicePrompt:'Escucha: foto. ¿Con qué letra empieza?',say:'foto',audioKind:'word',options:['f','t','r'],answer:'f',coach:'FOTO empieza con F.'},
          {id:'f_trace',type:'trace',assess:false,skill:'f_symbol',letter:'f',prompt:'Une los puntos de la F',say:'Esta es la F, como en foto.',audioKind:'instruction'},
          {id:'f_trail',type:'syllableTrail',assess:false,skill:'f_family',prompt:'Haz sonar las piedras de F',items:['fa','fe','fi','fo','fu']},
          {id:'f_family',type:'soundBubbles',skill:'f_family',prompt:'Atrapa la sílaba',say:'fo',options:['fa','fi','fo','fu'],answer:'fo',coach:'Escucha FO.'},
          {id:'f_foto',type:'build',skill:'blend_f',prompt:'Arma FOTO',say:'foto',parts:['fo','to'],answerParts:['fo','to'],word:'foto',coach:'FO y después TO.'},
          {id:'f_fama',type:'build',variant:true,skill:'blend_f',prompt:'Arma FAMA',say:'fama',parts:['fa','ma'],answerParts:['fa','ma'],word:'fama',coach:'FA y después MA.'},
          {id:'f_fila',type:'build',variant:true,skill:'blend_f',prompt:'Arma FILA',say:'fila',parts:['fi','la'],answerParts:['fi','la'],word:'fila',coach:'FI y después LA.'},
          {id:'f_fino',type:'build',variant:true,skill:'blend_f',prompt:'Arma FINO',say:'fino',parts:['fi','no'],answerParts:['fi','no'],word:'fino',coach:'FI y después NO.'},
          {id:'f_foca',type:'build',variant:true,skill:'blend_f',prompt:'Arma FOCA',say:'foca',parts:['fo','ca'],answerParts:['fo','ca'],word:'foca',coach:'FO y después CA.'},
          {id:'f_word',type:'symbolPick',skill:'word_foto',prompt:'¿Dónde dice foto?',voicePrompt:'Busca la palabra foto.',say:'foto',audioKind:'word',options:['foto','pato','foca'],answer:'foto',coach:'Busca fo y después to.'}
        ]
      },
      {
        id:'forest_g',order:14,world:'Nuevos senderos',title:'La gruta de GA · GO · GU',subtitle:'Primero aprendemos G en GA, GO y GU. GE, GI y GUE, GUI llegarán después.',letter:'G',masteryTarget:60,requires:[{mission:'forest_f'},{skill:'f_family',score:48}],
        skillIds:['hear_g','g_symbol','g_family','blend_g','word_gato'],
        activities:[
          {id:'g_hunt',type:'picturePick',skill:'hear_g',prompt:'Busca una palabra que empiece con G',voicePrompt:'Busca una palabra que empiece con G.',targetLetter:'G',options:[{value:'gato',src:AN+'gato.webp'},{value:'foca',src:AN+'foca.webp'},{value:'cama',src:O+'cama.webp'}],answer:'gato',coach:'GATO empieza con G.'},
          {id:'g_symbol',type:'symbolPick',skill:'hear_g',prompt:'Escucha GATO. ¿Con qué letra empieza?',voicePrompt:'Escucha: gato. ¿Con qué letra empieza?',say:'gato',audioKind:'word',options:['g','c','d'],answer:'g',coach:'GATO empieza con G.'},
          {id:'g_symbol2',type:'symbolPick',skill:'g_symbol',prompt:'Busca la G',voicePrompt:'Busca la G.',options:['c','g','b'],answer:'g',coach:'Esta es la G.'},
          {id:'g_trace',type:'trace',assess:false,skill:'g_symbol',letter:'g',prompt:'Une los puntos de la G',say:'Esta es la G, como en gato.',audioKind:'instruction'},
          {id:'g_trail',type:'syllableTrail',assess:false,skill:'g_family',prompt:'Haz sonar GA · GO · GU',items:['ga','go','gu']},
          {id:'g_family',type:'soundBubbles',skill:'g_family',prompt:'Atrapa la sílaba',say:'go',options:['ga','go','gu'],answer:'go',coach:'Escucha GO.'},
          {id:'g_gato',type:'build',skill:'blend_g',prompt:'Arma GATO',say:'gato',parts:['ga','to'],answerParts:['ga','to'],word:'gato',coach:'GA y después TO.'},
          {id:'g_goma',type:'build',variant:true,skill:'blend_g',prompt:'Arma GOMA',say:'goma',parts:['go','ma'],answerParts:['go','ma'],word:'goma',coach:'GO y después MA.'},
          {id:'g_gota',type:'build',variant:true,skill:'blend_g',prompt:'Arma GOTA',say:'gota',parts:['go','ta'],answerParts:['go','ta'],word:'gota',coach:'GO y después TA.'},
          {id:'g_gusano',type:'build',variant:true,skill:'blend_g',prompt:'Arma GUSANO',say:'gusano',parts:['gu','sa','no'],answerParts:['gu','sa','no'],word:'gusano',coach:'GU, SA y NO.'},
          {id:'g_word',type:'symbolPick',skill:'word_gato',prompt:'¿Dónde dice gato?',voicePrompt:'Busca la palabra gato.',say:'gato',audioKind:'word',options:['gato','gota','pato'],answer:'gato',coach:'Busca ga y después to.'}
        ]
      },
      {
        id:'forest_expand',order:15,world:'Gran Jardín',title:'El gran jardín lector',subtitle:'Mezcla las letras nuevas con las conocidas para leer palabras y frases más largas.',letter:'✦',masteryTarget:64,minAssessed:7,maxAssessed:10,requires:[{mission:'forest_g'},{skill:'g_family',score:48}],
        skillIds:['advanced_words','advanced_sentence','advanced_comprehension'],
        activities:[
          {id:'ex_pic_rana',type:'imageWordPick',skill:'advanced_words',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra rana.',word:'rana',src:AN+'rana.webp',options:['rana','rama','cama'],answer:'rana',coach:'Busca ra y después na.'},
          {id:'ex_pic_cama',type:'imageWordPick',variant:true,skill:'advanced_words',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra cama.',word:'cama',src:O+'cama.webp',options:['cama','casa','rama'],answer:'cama',coach:'Busca ca y después ma.'},
          {id:'ex_pic_flor',type:'imageWordPick',variant:true,skill:'advanced_words',prompt:'Busca la palabra del dibujo',voicePrompt:'Mira el dibujo. Busca la palabra flor.',word:'flor',src:O+'flor.webp',options:['flor','foto','faro'],answer:'flor',coach:'FLOR empieza con F.'},
          {id:'ex_memory',type:'memoryMatch',skill:'advanced_words',prompt:'Encuentra las parejas',voicePrompt:'Une cada dibujo con su palabra.',pairs:[{word:'rana',src:AN+'rana.webp'},{word:'cama',src:O+'cama.webp'},{word:'flor',src:O+'flor.webp'}],coach:'Busca el dibujo y su palabra.'},
          {id:'ex_sentence_rana',type:'sentenceBuild',skill:'advanced_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: La rana salta. Pon las palabras en orden.',say:'La rana salta.',parts:['la','rana','salta'],answerParts:['la','rana','salta'],coach:'Primero la. Después rana. Al final salta.'},
          {id:'ex_sentence_foto',type:'sentenceBuild',variant:true,skill:'advanced_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: Tito toma la foto. Pon las palabras en orden.',say:'Tito toma la foto.',parts:['tito','toma','la','foto'],answerParts:['tito','toma','la','foto'],coach:'Escucha otra vez y empieza por Tito.'},
          {id:'ex_sentence_beso',type:'sentenceBuild',variant:true,skill:'advanced_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: Mamá da un beso. Pon las palabras en orden.',say:'Mamá da un beso.',parts:['mamá','da','un','beso'],answerParts:['mamá','da','un','beso'],coach:'Empieza por mamá.'},
          {id:'ex_build_gusano',type:'build',variant:true,skill:'advanced_words',prompt:'Construye gusano',say:'gusano',parts:['gu','sa','no'],answerParts:['gu','sa','no'],word:'gusano',coach:'GU, SA y NO.'},
          {id:'ex_build_banana',type:'build',variant:true,skill:'advanced_words',prompt:'Construye banana',say:'banana',parts:['ba','na','na'],answerParts:['ba','na','na'],word:'banana',coach:'BA, NA y NA.'},
          {id:'ex_count',type:'symbolPick',skill:'advanced_comprehension',prompt:'¿Cuántas partes escuchas?',voicePrompt:'Escucha: gusano. ¿Cuántas partes escuchas?',say:'gusano',audioKind:'word',options:['2','3','4'],answer:'3',coach:'GU · SA · NO tiene tres partes.'}
        ]
      },
      {
        id:'forest_enye',order:16,world:'Bosque de los Secretos',title:'La nube de la Ñ',subtitle:'Descubre la Ñ, escucha NIÑO y NIÑA y forma palabras con su sonido.',letter:'Ñ',masteryTarget:58,requires:[{mission:'forest_expand'},{skill:'advanced_words',score:38}],
        skillIds:['hear_enye','enye_symbol','enye_family','blend_enye','word_nino'],
        activities:[
          {id:'enye_intro',type:'patternIntro',assess:false,skill:'hear_enye',pattern:'Ñ',prompt:'La Ñ tiene una rayita encima',voicePrompt:'La eñe tiene una rayita encima. Escucha niño y niña.',examples:[{label:'niño',say:'niño',src:C+'nino.webp'},{label:'niña',say:'niña',src:C+'nina.webp'},{label:'moño',say:'moño',src:O+'moño.webp'}]},
          {id:'enye_symbol',type:'symbolPick',skill:'enye_symbol',prompt:'Busca la Ñ',voicePrompt:'Busca la eñe.',options:['n','ñ','m'],answer:'ñ',coach:'Esta es la Ñ.'},
          {id:'enye_trace',type:'trace',assess:false,skill:'enye_symbol',letter:'ñ',prompt:'Sigue la Ñ con tu dedo',say:'Esta es la eñe, como en niño.',audioKind:'instruction'},
          {id:'enye_trail',type:'syllableTrail',assess:false,skill:'enye_family',prompt:'Haz sonar la Ñ',items:['ña','ñe','ñi','ño','ñu']},
          {id:'enye_sound',type:'soundBubbles',skill:'enye_family',prompt:'Atrapa la sílaba',say:'ño',options:['no','ño','lo'],answer:'ño',coach:'Escucha ÑO.'},
          {id:'enye_nino',type:'build',skill:'blend_enye',prompt:'Construye niño',say:'niño',parts:['ni','ño'],answerParts:['ni','ño'],word:'niño',coach:'NI y después ÑO.'},
          {id:'enye_nina',type:'build',variant:true,skill:'blend_enye',prompt:'Construye niña',say:'niña',parts:['ni','ña'],answerParts:['ni','ña'],word:'niña',coach:'NI y después ÑA.'},
          {id:'enye_ano',type:'build',variant:true,skill:'blend_enye',prompt:'Construye año',say:'año',parts:['a','ño'],answerParts:['a','ño'],word:'año',coach:'A y después ÑO.'},
          {id:'enye_mono',type:'build',variant:true,skill:'blend_enye',prompt:'Construye moño',say:'moño',parts:['mo','ño'],answerParts:['mo','ño'],word:'moño',coach:'MO y después ÑO.'},
          {id:'enye_read',type:'wordReveal',assess:false,skill:'word_nino',prompt:'Intenta leerla tú',word:'niño',parts:['ni','ño'],say:'niño'}
        ]
      },
      {
        id:'forest_ch',order:17,world:'Bosque de los Secretos',title:'La choza de CH',subtitle:'Dos letras se juntan para crear un sonido nuevo: CH.',letter:'CH',masteryTarget:58,requires:[{mission:'forest_enye'},{skill:'word_nino',score:40}],
        skillIds:['ch_pattern','blend_ch','word_leche'],
        activities:[
          {id:'ch_intro',type:'patternIntro',assess:false,skill:'ch_pattern',pattern:'CH',prompt:'C y H juntas hacen CH',voicePrompt:'C y H juntas hacen CH. Escucha leche, noche y chico.',examples:[{label:'leche',say:'leche',src:O+'leche.webp'},{label:'chico',say:'chico',src:C+'chico.webp'},{label:'noche',say:'noche'}]},
          {id:'ch_sound',type:'soundBubbles',skill:'ch_pattern',prompt:'Escucha y toca',say:'che',options:['che','ce','se'],answer:'che',coach:'Escucha CHE.'},
          {id:'ch_missing',type:'missingPart',skill:'ch_pattern',prompt:'Completa leche',say:'leche',word:'leche',display:['le','__'],options:['che','ce','se'],answer:'che',coach:'LE y después CHE.'},
          {id:'ch_leche',type:'build',skill:'blend_ch',prompt:'Construye leche',say:'leche',parts:['le','che'],answerParts:['le','che'],word:'leche',coach:'LE y después CHE.'},
          {id:'ch_noche',type:'build',variant:true,skill:'blend_ch',prompt:'Construye noche',say:'noche',parts:['no','che'],answerParts:['no','che'],word:'noche',coach:'NO y después CHE.'},
          {id:'ch_techo',type:'build',variant:true,skill:'blend_ch',prompt:'Construye techo',say:'techo',parts:['te','cho'],answerParts:['te','cho'],word:'techo',coach:'TE y después CHO.'},
          {id:'ch_mucho',type:'build',variant:true,skill:'blend_ch',prompt:'Construye mucho',say:'mucho',parts:['mu','cho'],answerParts:['mu','cho'],word:'mucho',coach:'MU y después CHO.'},
          {id:'ch_read',type:'wordReveal',assess:false,skill:'word_leche',prompt:'Intenta leerla tú',word:'leche',parts:['le','che'],say:'leche'}
        ]
      },
      {
        id:'forest_qu',order:18,world:'Bosque de los Secretos',title:'El puente de QU',subtitle:'Descubre QUE y QUI: la Q camina junto a la U.',letter:'QU',masteryTarget:58,requires:[{mission:'forest_ch'},{skill:'word_leche',score:40}],
        skillIds:['qu_pattern','blend_qu','word_queso'],
        activities:[
          {id:'qu_intro',type:'patternIntro',assess:false,skill:'qu_pattern',pattern:'QU',prompt:'Q y U viajan juntas',voicePrompt:'Para escribir QUE y QUI usamos Q y U juntas. En estas sílabas, la U no suena. Escucha queso y quita.',examples:[{label:'queso',say:'queso',src:O+'queso.webp'},{label:'quita',say:'quita'}]},
          {id:'qu_sound',type:'soundBubbles',skill:'qu_pattern',prompt:'Escucha y toca',say:'que',options:['que','ce','ge'],answer:'que',coach:'Escucha QUE.'},
          {id:'qu_missing',type:'missingPart',skill:'qu_pattern',prompt:'Completa queso',say:'queso',word:'queso',display:['__','so'],options:['que','ce','ge'],answer:'que',coach:'QUESO empieza por QUE.'},
          {id:'qu_queso',type:'build',skill:'blend_qu',prompt:'Construye queso',say:'queso',parts:['que','so'],answerParts:['que','so'],word:'queso',coach:'QUE y después SO.'},
          {id:'qu_quita',type:'build',variant:true,skill:'blend_qu',prompt:'Construye quita',say:'quita',parts:['qui','ta'],answerParts:['qui','ta'],word:'quita',coach:'QUI y después TA.'},
          {id:'qu_quema',type:'build',variant:true,skill:'blend_qu',prompt:'Construye quema',say:'quema',parts:['que','ma'],answerParts:['que','ma'],word:'quema',coach:'QUE y después MA.'},
          {id:'qu_quiso',type:'build',variant:true,skill:'blend_qu',prompt:'Construye quiso',say:'quiso',parts:['qui','so'],answerParts:['qui','so'],word:'quiso',coach:'QUI y después SO.'},
          {id:'qu_read',type:'wordReveal',assess:false,skill:'word_queso',prompt:'Intenta leerla tú',word:'queso',parts:['que','so'],say:'queso'}
        ]
      },
      {
        id:'forest_rr',order:19,world:'Bosque de los Secretos',title:'La carrera de RR',subtitle:'La R fuerte también aparece dentro de las palabras: allí puede escribirse RR.',letter:'RR',masteryTarget:60,requires:[{mission:'forest_qu'},{skill:'word_queso',score:40},{skill:'r_family',score:45}],
        skillIds:['rr_pattern','word_perro'],
        activities:[
          {id:'rr_intro',type:'patternIntro',assess:false,skill:'rr_pattern',pattern:'R · RR',prompt:'Una R suave y dos R fuertes dentro de palabra',voicePrompt:'Dentro de una palabra, una sola erre puede sonar suave, como en pero. Dos erres hacen el sonido fuerte, como en perro.',examples:[{label:'pero',say:'pero'},{label:'perro',say:'perro',src:AN+'perro.webp'},{label:'caro',say:'caro'},{label:'carro',say:'carro',src:O+'carro.webp'}]},
          {id:'rr_soft',type:'listenPick',skill:'rr_pattern',prompt:'Escucha y busca pero',voicePrompt:'Escucha pero. Busca la palabra pero.',say:'pero',audioKind:'word',options:['pero','perro','pelo'],answer:'pero',coach:'PERO lleva una sola R entre vocales.'},
          {id:'rr_listen',type:'listenPick',skill:'rr_pattern',prompt:'Escucha y busca perro',voicePrompt:'Escucha perro. Busca la palabra perro.',say:'perro',audioKind:'word',options:['pero','perro','pelo'],answer:'perro',coach:'PERRO lleva dos erres.'},
          {id:'rr_missing',type:'missingPart',skill:'rr_pattern',prompt:'Completa perro',say:'perro',word:'perro',display:['pe','__','o'],options:['rr','r','l'],answer:'rr',coach:'Dentro de PERRO van dos R.'},
          {id:'rr_perro',type:'build',skill:'word_perro',prompt:'Construye perro',say:'perro',parts:['pe','rro'],answerParts:['pe','rro'],word:'perro',coach:'PE y después RRO.'},
          {id:'rr_carro',type:'build',variant:true,skill:'word_perro',prompt:'Construye carro',say:'carro',parts:['ca','rro'],answerParts:['ca','rro'],word:'carro',coach:'CA y después RRO.'},
          {id:'rr_torre',type:'build',variant:true,skill:'word_perro',prompt:'Construye torre',say:'torre',parts:['to','rre'],answerParts:['to','rre'],word:'torre',coach:'TO y después RRE.'},
          {id:'rr_burro',type:'build',variant:true,skill:'word_perro',prompt:'Construye burro',say:'burro',parts:['bu','rro'],answerParts:['bu','rro'],word:'burro',coach:'BU y después RRO.'},
          {id:'rr_read',type:'wordReveal',assess:false,skill:'word_perro',prompt:'Intenta leerla tú',word:'perro',parts:['pe','rro'],say:'perro'}
        ]
      },
      {
        id:'forest_ceci',order:20,world:'Bosque de los Secretos',title:'El claro de CE y CI',subtitle:'La C cambia de sonido cuando se encuentra con E o I.',letter:'CE·CI',masteryTarget:60,requires:[{mission:'forest_rr'},{skill:'word_perro',score:40},{skill:'c_family',score:45}],
        skillIds:['c_soft','word_cine'],
        activities:[
          {id:'ceci_intro',type:'patternIntro',assess:false,skill:'c_soft',pattern:'CE · CI',prompt:'La C cambia con E e I',voicePrompt:'Con E e I, la C suena como S. Escucha cena y cine.',examples:[{label:'cena',say:'cena',src:O+'cena.webp'},{label:'cine',say:'cine',src:O+'cine.webp'},{label:'cero',say:'cero',src:O+'cero.webp'}]},
          {id:'ce_missing',type:'missingPart',skill:'c_soft',prompt:'Completa cena',say:'cena',word:'cena',display:['__','na'],options:['ce','se','ge'],answer:'ce',coach:'CENA empieza por CE.'},
          {id:'ci_missing',type:'missingPart',skill:'c_soft',prompt:'Completa cine',say:'cine',word:'cine',display:['__','ne'],options:['ci','si','gi'],answer:'ci',coach:'CINE empieza por CI.'},
          {id:'ce_cena',type:'build',skill:'word_cine',prompt:'Construye cena',say:'cena',parts:['ce','na'],answerParts:['ce','na'],word:'cena',coach:'CE y después NA.'},
          {id:'ci_cine',type:'build',variant:true,skill:'word_cine',prompt:'Construye cine',say:'cine',parts:['ci','ne'],answerParts:['ci','ne'],word:'cine',coach:'CI y después NE.'},
          {id:'ce_cero',type:'build',variant:true,skill:'word_cine',prompt:'Construye cero',say:'cero',parts:['ce','ro'],answerParts:['ce','ro'],word:'cero',coach:'CE y después RO.'},
          {id:'ci_cima',type:'build',variant:true,skill:'word_cine',prompt:'Construye cima',say:'cima',parts:['ci','ma'],answerParts:['ci','ma'],word:'cima',coach:'CI y después MA.'},
          {id:'ci_read',type:'wordReveal',assess:false,skill:'word_cine',prompt:'Intenta leerla tú',word:'cine',parts:['ci','ne'],say:'cine'}
        ]
      },
      {
        id:'forest_gegi',order:21,world:'Bosque de los Secretos',title:'La gruta de GE y GI',subtitle:'La G también cambia de sonido cuando se encuentra con E o I.',letter:'GE·GI',masteryTarget:60,requires:[{mission:'forest_ceci'},{skill:'word_cine',score:40},{skill:'g_family',score:45}],
        skillIds:['g_soft','word_gema'],
        activities:[
          {id:'gegi_intro',type:'patternIntro',assess:false,skill:'g_soft',pattern:'GE · GI',prompt:'La G cambia con E e I',voicePrompt:'Con E e I, la G cambia de sonido. Escucha gema y gigante.',examples:[{label:'gema',say:'gema',src:O+'gema.webp'},{label:'gigante',say:'gigante',src:C+'gigante_amable.webp'},{label:'gel',say:'gel',src:O+'gel.webp'}]},
          {id:'ge_missing',type:'missingPart',skill:'g_soft',prompt:'Completa gema',say:'gema',word:'gema',display:['__','ma'],options:['ge','gue','ce'],answer:'ge',coach:'GEMA empieza por GE.'},
          {id:'gi_missing',type:'missingPart',skill:'g_soft',prompt:'Completa gigante',say:'gigante',word:'gigante',display:['__','gante'],options:['gi','gui','ci'],answer:'gi',coach:'GIGANTE empieza por GI.'},
          {id:'ge_gema',type:'build',skill:'word_gema',prompt:'Construye gema',say:'gema',parts:['ge','ma'],answerParts:['ge','ma'],word:'gema',coach:'GE y después MA.'},
          {id:'gi_gigante',type:'listenPick',variant:true,skill:'word_gema',prompt:'Escucha y busca gigante',voicePrompt:'Escucha gigante. Busca la palabra gigante.',say:'gigante',audioKind:'word',options:['gigante','gato','cena'],answer:'gigante',coach:'GIGANTE empieza por GI.'},
          {id:'ge_read',type:'wordReveal',assess:false,skill:'word_gema',prompt:'Intenta leerla tú',word:'gema',parts:['ge','ma'],say:'gema'}
        ]
      },
      {
        id:'forest_secrets',order:22,world:'Bosque de los Secretos',title:'El bosque de los secretos',subtitle:'Mezcla Ñ, CH, QU, RR, CE·CI y GE·GI dentro de palabras y frases.',letter:'★',masteryTarget:62,requires:[{mission:'forest_gegi'},{skill:'word_gema',score:40},{skill:'word_perro',score:40}],
        skillIds:['secret_words','secret_sentence','secret_comprehension'],minAssessed:5,maxAssessed:8,
        activities:[
          {id:'secret_intro',type:'patternIntro',assess:false,skill:'secret_words',pattern:'★',prompt:'Seis secretos ya viven en tu bosque',voicePrompt:'Ya conoces varios secretos. Escucha con atención y elige cómo se escriben.',examples:[{label:'niño',say:'niño',src:C+'nino.webp'},{label:'leche',say:'leche',src:O+'leche.webp'},{label:'queso',say:'queso',src:O+'queso.webp'},{label:'perro',say:'perro',src:AN+'perro.webp'},{label:'cine',say:'cine',src:O+'cine.webp'},{label:'gema',say:'gema',src:O+'gema.webp'}]},
          {id:'secret_nino',type:'missingPart',skill:'secret_words',prompt:'Completa niño',say:'niño',word:'niño',display:['ni','__'],options:['ño','no','lo'],answer:'ño',coach:'NIÑO termina en ÑO.'},
          {id:'secret_leche',type:'missingPart',variant:true,skill:'secret_words',prompt:'Completa leche',say:'leche',word:'leche',display:['le','__'],options:['che','ce','se'],answer:'che',coach:'LECHE termina en CHE.'},
          {id:'secret_queso',type:'missingPart',variant:true,skill:'secret_words',prompt:'Completa queso',say:'queso',word:'queso',display:['__','so'],options:['que','ce','ge'],answer:'que',coach:'QUESO empieza por QUE.'},
          {id:'secret_perro',type:'missingPart',variant:true,skill:'secret_words',prompt:'Completa perro',say:'perro',word:'perro',display:['pe','__','o'],options:['rr','r','l'],answer:'rr',coach:'PERRO lleva dos R.'},
          {id:'secret_cine',type:'missingPart',variant:true,skill:'secret_words',prompt:'Completa cine',say:'cine',word:'cine',display:['__','ne'],options:['ci','si','gi'],answer:'ci',coach:'CINE empieza por CI.'},
          {id:'secret_gema',type:'missingPart',variant:true,skill:'secret_words',prompt:'Completa gema',say:'gema',word:'gema',display:['__','ma'],options:['ge','gue','ce'],answer:'ge',coach:'GEMA empieza por GE.'},
          {id:'secret_sentence_nina',type:'sentenceBuild',skill:'secret_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: La niña come queso. Pon las palabras en orden.',say:'La niña come queso.',parts:['la','niña','come','queso'],answerParts:['la','niña','come','queso'],coach:'Empieza por la niña.'},
          {id:'secret_sentence_noche',type:'sentenceBuild',variant:true,skill:'secret_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: La noche es linda. Pon las palabras en orden.',say:'La noche es linda.',parts:['la','noche','es','linda'],answerParts:['la','noche','es','linda'],coach:'Empieza por la noche.'},
          {id:'secret_sentence_cine',type:'sentenceBuild',variant:true,skill:'secret_sentence',prompt:'Ordena la frase',voicePrompt:'Escucha: Tito sale del cine. Pon las palabras en orden.',say:'Tito sale del cine.',parts:['tito','sale','del','cine'],answerParts:['tito','sale','del','cine'],coach:'Empieza por Tito.'},
          {id:'secret_count',type:'symbolPick',skill:'secret_comprehension',prompt:'¿Cuántas palabras escuchas?',voicePrompt:'Escucha: La niña come queso. ¿Cuántas palabras tiene la frase?',say:'La niña come queso.',audioKind:'sentence',options:['3','4','5'],answer:'4',coach:'LA · NIÑA · COME · QUESO: cuatro palabras.'}
        ]
      }


    ],
    reviewActivities:[
      {id:'rv_a',type:'listenPick',skill:'hear_vowels',prompt:'Una luciérnaga vuelve: ¿qué vocal escuchas?',say:'e',options:['a','e','o'],answer:'e',coach:'Escucha la E otra vez.'},
      {id:'rv_v',type:'symbolPick',skill:'vowel_symbols',prompt:'Recuerda esta vocal',say:'i',options:['u','i','a'],answer:'i',coach:'Escucha la I otra vez.'},
      {id:'rv_m',type:'symbolPick',skill:'m_family',prompt:'Una piedra conocida',say:'mo',options:['ma','mo','mu'],answer:'mo',coach:'Escucha MO completa.'},
      {id:'rv_mb',type:'picturePick',skill:'hear_m',prompt:'Busca una palabra que empiece con M',voicePrompt:'Busca una palabra que empiece con M.',targetLetter:'M',options:[{value:'mamá',src:C+'mama.webp'},{value:'sapo',src:AN+'sapo.webp'},{value:'lupa',src:O+'lupa.webp'}],answer:'mamá',coach:'MAMÁ empieza con M.'},
      {id:'rv_p',type:'symbolPick',skill:'p_family',prompt:'Recuerda P',say:'pa',options:['pa','pi','pu'],answer:'pa',coach:'Escucha PA completa.'},
      {id:'rv_s',type:'symbolPick',skill:'s_family',prompt:'Recuerda S',say:'su',options:['sa','su','so'],answer:'su',coach:'Escucha SU completa.'},
      {id:'rv_l',type:'symbolPick',skill:'l_family',prompt:'Recuerda L',say:'la',options:['lu','la','lo'],answer:'la',coach:'Escucha LA completa.'},
      {id:'rv_n',type:'soundBubbles',skill:'n_family',prompt:'Una sílaba vuelve',say:'no',options:['na','no','nu'],answer:'no',coach:'Escucha NO.'},
      {id:'rv_t',type:'missingPart',skill:'t_family',prompt:'Completa PATO',say:'pato',word:'pato',display:['pa','__'],options:['to','do','no'],answer:'to',coach:'Escucha PA-TO.'},
      {id:'rv_d',type:'soundBubbles',skill:'d_family',prompt:'Una sílaba vuelve',say:'do',options:['da','do','de'],answer:'do',coach:'Escucha DO.'},
      {id:'rv_mix',type:'imageWordPick',skill:'word_image_link',prompt:'Una palabra vuelve',voicePrompt:'Mira el dibujo. Busca la palabra sapo.',word:'sapo',src:AN+'sapo.webp',options:['sopa','sapo','lupa'],answer:'sapo',coach:'Busca sa y después po.'},
      {id:'rv_r',type:'soundBubbles',skill:'r_family',prompt:'Una sílaba vuelve',say:'ra',options:['ra','re','ro'],answer:'ra',coach:'Escucha RA.'},
      {id:'rv_c',type:'missingPart',skill:'c_family',prompt:'Completa CAMA',say:'cama',word:'cama',display:['ca','__'],options:['ma','sa','na'],answer:'ma',coach:'Escucha CA-MA.'},
      {id:'rv_b',type:'soundBubbles',skill:'b_family',prompt:'Una sílaba vuelve',say:'bo',options:['ba','bo','bu'],answer:'bo',coach:'Escucha BO.'},
      {id:'rv_f',type:'soundBubbles',skill:'f_family',prompt:'Una sílaba vuelve',say:'fo',options:['fa','fi','fo'],answer:'fo',coach:'Escucha FO.'},
      {id:'rv_g',type:'missingPart',skill:'g_family',prompt:'Completa GATO',say:'gato',word:'gato',display:['ga','__'],options:['to','do','ta'],answer:'to',coach:'Escucha GA-TO.'},
      {id:'rv_expand',type:'imageWordPick',skill:'advanced_words',prompt:'Una palabra nueva vuelve',voicePrompt:'Mira el dibujo. Busca la palabra rana.',word:'rana',src:AN+'rana.webp',options:['rama','rana','cama'],answer:'rana',coach:'Busca ra y después na.'},
      {id:'rv_enye',type:'missingPart',skill:'enye_family',prompt:'Una Ñ vuelve',say:'niño',word:'niño',display:['ni','__'],options:['ño','no','lo'],answer:'ño',coach:'Escucha NI-ÑO.'},
      {id:'rv_ch',type:'missingPart',skill:'ch_pattern',prompt:'CH vuelve',say:'noche',word:'noche',display:['no','__'],options:['che','ce','se'],answer:'che',coach:'Escucha NO-CHE.'},
      {id:'rv_qu',type:'missingPart',skill:'qu_pattern',prompt:'QU vuelve',say:'queso',word:'queso',display:['__','so'],options:['que','ce','ge'],answer:'que',coach:'Escucha QUE-SO.'},
      {id:'rv_rr',type:'listenPick',skill:'rr_pattern',prompt:'Escucha y busca perro',say:'perro',options:['pero','perro','pelo'],answer:'perro',coach:'PERRO lleva dos R.'},
      {id:'rv_ceci',type:'missingPart',skill:'c_soft',prompt:'CE vuelve',say:'cena',word:'cena',display:['__','na'],options:['ce','se','ge'],answer:'ce',coach:'Escucha CE-NA.'},
      {id:'rv_gegi',type:'missingPart',skill:'g_soft',prompt:'GE vuelve',say:'gema',word:'gema',display:['__','ma'],options:['ge','gue','ce'],answer:'ge',coach:'Escucha GE-MA.'},
      {id:'rv_secret',type:'missingPart',skill:'secret_words',prompt:'Un secreto vuelve',say:'leche',word:'leche',display:['le','__'],options:['che','ce','se'],answer:'che',coach:'LECHE termina en CHE.'}
    ],
    achievements:[
      {id:'first_path',icon:'🌱',art:O+'brote.webp',name:'Primer brote'},
      {id:'vowels_done',icon:'✨',art:X+'estrella_logro.webp',name:'Cinco luces'},
      {id:'builder_5',icon:'🧩',art:X+'cofre_semillas.webp',name:'Manos constructoras'},
      {id:'reader_5',icon:'📖',art:X+'icono_libro.webp',name:'Pequeño lector'},
      {id:'forest_5',icon:'🌳',art:X+'icono_bosque.webp',name:'Explorador del bosque'},
      {id:'forest_8',icon:'🏆',art:X+'medalla.webp',name:'Guardián de palabras'},
      {id:'streak_3',icon:'★',art:X+'estrella_logro.webp',name:'Tres aciertos seguidos'},
      {id:'forest_mix',icon:'✦',art:X+'cofre_semillas.webp',name:'Jardín de palabras'},
      {id:'stories_3',icon:'📚',art:X+'icono_libro.webp',name:'Tres cuentos leídos'},
      {id:'new_letters_5',icon:'✨',art:X+'estrella_logro.webp',name:'Cinco letras nuevas'},
      {id:'forest_expand',icon:'🏅',art:X+'medalla.webp',name:'Gran jardín lector'},
      {id:'stories_6',icon:'📚',art:X+'icono_libro.webp',name:'Seis cuentos leídos'},
      {id:'enye_done',icon:'Ñ',art:X+'estrella_confite.webp',name:'Amigo de la Ñ'},
      {id:'patterns_3',icon:'✦',art:X+'cofre_palabras.webp',name:'Tres secretos descubiertos'},
      {id:'secret_forest',icon:'★',art:X+'insignia_sendero_secretos.webp',name:'Guardián de los secretos'},
      {id:'stories_10',icon:'📚',art:X+'medalla_patrones.webp',name:'Diez historias leídas'}
    ],
    stories:[
      {id:'story_mp',title:'Mamá y papá',requires:[{skill:'word_mama',score:35},{skill:'word_papa',score:35}],art:C+'mama.webp',art2:C+'papa.webp',text:'Mamá mima a papá.',words:['Mamá','mima','a','papá.'],skill:'sentence_mp',comprehension:{prompt:'¿A quién mima mamá?',options:['A papá','Al sapo','A Lola'],answer:'A papá'}},
      {id:'story_l',title:'La lupa',requires:[{skill:'word_lupa',score:35},{skill:'s_family',score:35}],art:O+'lupa.webp',text:'Lola usa la lupa.',words:['Lola','usa','la','lupa.'],skill:'sentence_l',comprehension:{prompt:'¿Qué usa Lola?',options:['La lupa','La sopa','El sapo'],answer:'La lupa'}},
      {id:'story_ntd',title:'El nido',requires:[{skill:'word_nido',score:35},{skill:'t_family',score:35},{skill:'d_family',score:35}],art:O+'nido.webp',art2:C+'tito.webp',text:'Tito nota el nido.',words:['Tito','nota','el','nido.'],skill:'sentence_ntd',comprehension:{prompt:'¿Qué nota Tito?',options:['El nido','La sopa','La lupa'],answer:'El nido'}},
      {id:'story_sopa',title:'La sopa',requires:[{skill:'s_family',score:45},{skill:'t_family',score:35}],art:C+'tito.webp',art2:O+'sopa.webp',text:'Tito toma sopa.',words:['Tito','toma','sopa.'],skill:'sentence_build',comprehensionSkill:'comprehension_2',comprehension:{prompt:'¿Qué toma Tito?',options:['Sopa','Un dado','Una lupa'],answer:'Sopa'}},
      {id:'story_pato',title:'El pato',requires:[{skill:'t_family',score:45},{skill:'d_family',score:40}],art:AN+'pato.webp',text:'El pato nada.',words:['El','pato','nada.'],skill:'sentence_build',comprehensionSkill:'comprehension_2',comprehension:{prompt:'¿Qué hace el pato?',options:['Nada','Toma sopa','Usa la lupa'],answer:'Nada'}},
      {id:'story_nana',title:'Nana y Tito',requires:[{skill:'sentence_build',score:30}],art:C+'nana.webp',art2:C+'tito.webp',text:'Nana mima a Tito.',words:['Nana','mima','a','Tito.'],skill:'sentence_build',comprehensionSkill:'comprehension_2',comprehension:{prompt:'¿A quién mima Nana?',options:['A Tito','Al pato','Al sapo'],answer:'A Tito'}},
      {id:'story_rana',title:'La rana',requires:[{skill:'word_rana',score:35},{skill:'t_family',score:35}],art:AN+'rana.webp',text:'La rana salta.',words:['La','rana','salta.'],skill:'advanced_sentence',comprehensionSkill:'advanced_comprehension',comprehension:{prompt:'¿Quién salta?',options:['La rana','El pato','Lola'],answer:'La rana'}},
      {id:'story_cama',title:'La cama',requires:[{skill:'word_cama',score:35},{skill:'l_family',score:35}],art:O+'cama.webp',art2:C+'nina.webp',text:'Lola usa la cama.',words:['Lola','usa','la','cama.'],skill:'advanced_sentence',comprehensionSkill:'advanced_comprehension',comprehension:{prompt:'¿Qué usa Lola?',options:['La cama','La lupa','La sopa'],answer:'La cama'}},
      {id:'story_beso',title:'Un beso',requires:[{skill:'word_bota',score:35},{skill:'d_family',score:35}],art:O+'beso.webp',text:'Mamá da un beso.',words:['Mamá','da','un','beso.'],skill:'advanced_sentence',comprehensionSkill:'advanced_comprehension',comprehension:{prompt:'¿Qué da mamá?',options:['Un beso','Una lupa','Un dado'],answer:'Un beso'}},
      {id:'story_foto',title:'La foto',requires:[{skill:'word_foto',score:35},{skill:'t_family',score:35}],art:O+'foto.webp',art2:C+'tito.webp',text:'Tito toma la foto.',words:['Tito','toma','la','foto.'],skill:'advanced_sentence',comprehensionSkill:'advanced_comprehension',comprehension:{prompt:'¿Qué toma Tito?',options:['La foto','La sopa','La lupa'],answer:'La foto'}},
      {id:'story_nina_queso',title:'La niña y el queso',requires:[{skill:'word_nino',score:35},{skill:'word_queso',score:35}],art:C+'nina.webp',art2:O+'queso.webp',text:'La niña come queso. Mamá toma sopa.',words:['La','niña','come','queso.','Mamá','toma','sopa.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Qué come la niña?',options:['Queso','Sopa','Una lupa'],answer:'Queso'}},
      {id:'story_noche',title:'La noche',requires:[{skill:'word_leche',score:35},{skill:'secret_sentence',score:25}],art:O+'luna.webp',text:'La noche es linda. Tito sale.',words:['La','noche','es','linda.','Tito','sale.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Cómo es la noche?',options:['Linda','Una sopa','Un dado'],answer:'Linda'}},
      {id:'story_cine',title:'El cine',requires:[{skill:'word_cine',score:35},{skill:'secret_sentence',score:25}],art:SC+'cine_familiar.webp',text:'Tito sale del cine. Mamá lo saluda.',words:['Tito','sale','del','cine.','Mamá','lo','saluda.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿De dónde sale Tito?',options:['Del cine','De la cama','Del nido'],answer:'Del cine'}},
      {id:'story_gema',title:'La gema',requires:[{skill:'word_gema',score:35},{skill:'secret_sentence',score:25}],art:O+'gema.webp',art2:C+'lola.webp',text:'La gema es lila. Lola la toma.',words:['La','gema','es','lila.','Lola','la','toma.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Quién toma la gema?',options:['Lola','Tito','Papá'],answer:'Lola'}},
      {id:'story_leche',title:'La leche',requires:[{skill:'word_leche',score:35},{skill:'secret_sentence',score:25}],art:SC+'chico_con_leche.webp',text:'El chico toma leche.',words:['El','chico','toma','leche.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Qué toma el chico?',options:['Leche','Queso','Sopa'],answer:'Leche'}},
      {id:'story_perro_carro',title:'El perro y el carro',requires:[{skill:'word_perro',score:35},{skill:'advanced_sentence',score:25}],art:SC+'perro_con_carro.webp',text:'El perro toca el carro.',words:['El','perro','toca','el','carro.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Qué toca el perro?',options:['El carro','La cama','El queso'],answer:'El carro'}},
      {id:'story_rana_cama',title:'La rana y la cama',requires:[{skill:'word_rana',score:35},{skill:'word_cama',score:35}],art:SC+'rana_en_cama.webp',text:'La rana salta a la cama.',words:['La','rana','salta','a','la','cama.'],skill:'advanced_sentence',comprehensionSkill:'advanced_comprehension',comprehension:{prompt:'¿A dónde salta la rana?',options:['A la cama','Al cine','Al carro'],answer:'A la cama'}},
      {id:'story_nina_lee',title:'La niña lee',requires:[{skill:'word_nino',score:35},{skill:'secret_sentence',score:20}],art:SC+'nina_lee.webp',text:'La niña lee.',words:['La','niña','lee.'],skill:'secret_sentence',comprehensionSkill:'secret_comprehension',comprehension:{prompt:'¿Qué hace la niña?',options:['Lee','Salta','Toma sopa'],answer:'Lee'}}
    ]
  };
})();
