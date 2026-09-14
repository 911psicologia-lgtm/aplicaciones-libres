/* ═══════════════════════════════════════════════════════════
   PequeWorld — VOCABULARIO NUEVO v8 (3 mundos con fotos reales
   ya existentes en assets: cero assets nuevos, cero riesgo)
   ═══════════════════════════════════════════════════════════ */
WORLDS.push(
  /* ── TECH WORLD (Nivel 3) ── */
  {id:'tech_world', name:'Tech World', es:'Tecnología', icon:'🤖', color:'wc-words', lvl:3, kind:'words', cover:'laptop',
   story:'En el Laboratorio Tecnológico cada aparato tiene nombre en inglés. ¿Los reconoces todos en casa?',
   items:[
    {en:'Laptop',     es:'Portátil',   img:'laptop',     em:'💻'},
    {en:'Robot',      es:'Robot',      img:'robot',      em:'🤖'},
    {en:'Controller', es:'Mando',      img:'controller', em:'🎮'},
    {en:'TV',         es:'Televisor',  img:'tv',         em:'📺'},
    {en:'Speaker',    es:'Altavoz',    img:'speaker',    em:'🔊'},
    {en:'Microphone', es:'Micrófono',  img:'microphone', em:'🎤'},
    {en:'Battery',    es:'Pila',       img:'battery',    em:'🔋'},
    {en:'Magnet',     es:'Imán',       img:'magnet',     em:'🧲'},
    {en:'Flashlight', es:'Linterna',   img:'flashlight', em:'🔦'},
    {en:'Laser',      es:'Láser',      img:'laser',      em:'🔴'},
   ]},

  /* ── SWEET SHOP (Nivel 2) ── */
  {id:'sweet_shop', name:'Sweet Shop', es:'Dulces', icon:'🍬', color:'wc-food', lvl:2, kind:'words', cover:'cupcake',
   story:'La Dulcería de PequeWorld huele delicioso. Aprende los dulces… ¡y cuál comes en tu cumpleaños!',
   items:[
    {en:'Cake',      es:'Torta',      img:'cake',      em:'🎂'},
    {en:'Cupcake',   es:'Bizcochito', img:'cupcake',   em:'🧁'},
    {en:'Cookie',    es:'Galleta',    img:'cookie',    em:'🍪'},
    {en:'Ice cream', es:'Helado',     img:'icecream',  em:'🍦'},
    {en:'Lollipop',  es:'Chupeta',    img:'lollipop',  em:'🍭'},
    {en:'Pie',       es:'Tarta',      img:'pie',       em:'🥧'},
    {en:'Popcorn',   es:'Palomitas',  img:'popcorn',   em:'🍿'},
    {en:'Treat',     es:'Premio dulce', img:'treat',   em:'🍬'},
   ]},

  /* ── BEDTIME (Nivel 2) ── */
  {id:'bedtime', name:'Bedtime', es:'Hora de dormir', icon:'🌙', color:'wc-home', lvl:2, kind:'words', cover:'bed',
   story:'Cuando cae la noche, el mundo de PequeWorld se apaga despacito. Estas son las palabras de la hora de dormir.',
   items:[
    {en:'Bed',          es:'Cama',        img:'bed',          em:'🛏️'},
    {en:'Lamp',         es:'Lámpara',     img:'lamp',         em:'💡'},
    {en:'Candle',       es:'Vela',        img:'candle',       em:'🕯️'},
    {en:'Sleeping bag', es:'Bolsa de dormir', img:'sleepingbag', em:'🛌'},
    {en:'Night sky',    es:'Cielo nocturno', img:'nightsky',   em:'🌃'},
    {en:'Mirror',       es:'Espejo',      img:'mirror',       em:'🪞'},
    {en:'Teddy',        es:'Osito',       img:'teddy',        em:'🧸'},
   ]},
);
