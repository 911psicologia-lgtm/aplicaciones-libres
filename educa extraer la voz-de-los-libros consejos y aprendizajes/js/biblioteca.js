/* ═══════════════════════════════════════════
   biblioteca.js — Memoria viva
   Guarda perfil y sesiones en localStorage.
   Fase 2: sincronización en la nube.
   ═══════════════════════════════════════════ */

const Biblioteca = {
  /* ── Multi-usuario ──
     Cada usuario tiene su propio perfil, biblioteca y opciones,
     separados por sufijo en localStorage. Las claves de siempre
     ahora son getters: todo el código existente sigue igual. */
  CLAVE_LISTA_USUARIOS: "vozlibros_usuarios",
  CLAVE_USUARIO_ACTUAL: "vozlibros_usuario_actual",

  idActual() { return localStorage.getItem(this.CLAVE_USUARIO_ACTUAL) || ""; },

  get CLAVE_SESIONES() { return "vozlibros_sesiones__" + (this.idActual() || "legacy"); },
  get CLAVE_PERFIL()   { return "vozlibros_perfil__"   + (this.idActual() || "legacy"); },
  get CLAVE_DEMOS()    { return "vozlibros_demos_v052__" + (this.idActual() || "legacy"); },
  get CLAVE_OPCIONES() { return "vozlibros_opciones__" + (this.idActual() || "legacy"); },

  usuarios() {
    try { return JSON.parse(localStorage.getItem(this.CLAVE_LISTA_USUARIOS)) || []; }
    catch { return []; }
  },

  limpiarNombrePerfil(nombre) {
    return (nombre || "").toString().replace(/\s+/g, " ").trim().slice(0, 40);
  },

  esNombreGenerico(nombre) {
    const n = this.limpiarNombrePerfil(nombre).toLowerCase();
    return !n || ["usuario", "mi perfil", "sin nombre", "user", "perfil"].includes(n);
  },

  nombreActivoSeguro() {
    const id = this.idActual();
    const perfil = this.cargarPerfil();
    const desdePerfil = this.limpiarNombrePerfil(perfil && perfil.nombre);
    if (!this.esNombreGenerico(desdePerfil)) return desdePerfil;
    const u = this.usuarios().find(x => x.id === id);
    const desdeLista = this.limpiarNombrePerfil(u && u.nombre);
    if (!this.esNombreGenerico(desdeLista)) return desdeLista;
    return "Mi perfil";
  },

  crearUsuario(nombre) {
    const lista = this.usuarios();
    const limpio = this.limpiarNombrePerfil(nombre);
    if (!limpio || this.esNombreGenerico(limpio)) throw new Error("Escribe un nombre propio para crear el perfil.");
    const u = { id: "u" + Date.now(), nombre: limpio, creadoEl: new Date().toISOString() };
    lista.push(u);
    localStorage.setItem(this.CLAVE_LISTA_USUARIOS, JSON.stringify(lista));
    // Sembrar el perfil con el nombre para que la app salude desde el inicio
    localStorage.setItem("vozlibros_perfil__" + u.id, JSON.stringify({ nombre: u.nombre }));
    return u;
  },

  actualizarUsuario(id, nombre) {
    const limpio = this.limpiarNombrePerfil(nombre);
    if (!limpio || this.esNombreGenerico(limpio)) throw new Error("Escribe un nombre propio, no un nombre genérico como Usuario o Mi perfil.");
    const lista = this.usuarios();
    const i = lista.findIndex(u => u.id === id);
    if (i < 0) throw new Error("No encontré ese perfil.");
    lista[i] = { ...lista[i], nombre: limpio, actualizadoEl: new Date().toISOString() };
    localStorage.setItem(this.CLAVE_LISTA_USUARIOS, JSON.stringify(lista));
    const clavePerfil = "vozlibros_perfil__" + id;
    let perfil = {};
    try { perfil = JSON.parse(localStorage.getItem(clavePerfil)) || {}; } catch {}
    perfil.nombre = limpio;
    localStorage.setItem(clavePerfil, JSON.stringify(perfil));
    return lista[i];
  },

  cambiarUsuario(id) { localStorage.setItem(this.CLAVE_USUARIO_ACTUAL, id); },
  salir() { localStorage.removeItem(this.CLAVE_USUARIO_ACTUAL); },

  contarSesiones(id) {
    try { return (JSON.parse(localStorage.getItem("vozlibros_sesiones__" + id)) || []).length; }
    catch { return 0; }
  },

  /* Migración desde la versión de un solo usuario: mueve los datos
     antiguos al primer usuario y lo deja con la sesión iniciada. */
  migrarUsuarios() {
    if (localStorage.getItem(this.CLAVE_LISTA_USUARIOS)) return;
    let perfilLegado = null;
    try { perfilLegado = JSON.parse(localStorage.getItem("vozlibros_perfil")); } catch {}
    const nombreLegado = this.limpiarNombrePerfil(perfilLegado && perfilLegado.nombre);
    const u = { id: "u1", nombre: this.esNombreGenerico(nombreLegado) ? "Mi perfil" : nombreLegado, creadoEl: new Date().toISOString() };
    localStorage.setItem(this.CLAVE_LISTA_USUARIOS, JSON.stringify([u]));
    [["vozlibros_perfil", "vozlibros_perfil__u1"],
     ["vozlibros_sesiones", "vozlibros_sesiones__u1"],
     ["vozlibros_demos_v052", "vozlibros_demos_v052__u1"]].forEach(([viejo, nuevo]) => {
      const dato = localStorage.getItem(viejo);
      if (dato !== null) { localStorage.setItem(nuevo, dato); localStorage.removeItem(viejo); }
    });
    localStorage.setItem(this.CLAVE_USUARIO_ACTUAL, u.id);
  },

  /* ── Opciones propias del usuario (chips personalizados) ── */
  opcionesPropias(clave) {
    try { return (JSON.parse(localStorage.getItem(this.CLAVE_OPCIONES)) || {})[clave] || []; }
    catch { return []; }
  },
  agregarOpcionPropia(clave, valor) {
    const v = (valor || "").trim();
    if (!v) return;
    let todas = {};
    try { todas = JSON.parse(localStorage.getItem(this.CLAVE_OPCIONES)) || {}; } catch {}
    const arr = todas[clave] || [];
    if (!arr.some(x => x.toLowerCase() === v.toLowerCase())) {
      arr.unshift(v);
      todas[clave] = arr.slice(0, 20); // límite prudente
      localStorage.setItem(this.CLAVE_OPCIONES, JSON.stringify(todas));
    }
  },

  _reemplazarNombreGenericoTexto(texto, nombre) {
    if (typeof texto !== "string" || !texto) return texto;
    return texto
      .replace(/\bUsuario\b/g, nombre)
      .replace(/\bUser\b/g, nombre)
      .replace(/Mi perfil/g, nombre);
  },

  _normalizarNombresGenericosSesion(sesion) {
    if (!sesion || typeof sesion !== "object") return sesion;
    const nombre = this.nombreActivoSeguro();
    if (this.esNombreGenerico(sesion.usuario)) sesion.usuario = nombre;
    ["saludo_audio", "guion_audio_cierre", "tema", "titulo_sesion"].forEach(k => {
      if (typeof sesion[k] === "string") sesion[k] = this._reemplazarNombreGenericoTexto(sesion[k], nombre);
    });
    if (sesion.destinatario && typeof sesion.destinatario === "object" && this.esNombreGenerico(sesion.destinatario.nombre)) {
      sesion.destinatario.nombre = nombre;
    }
    (sesion.ideas || []).forEach(idea => {
      if (!idea || typeof idea !== "object") return;
      ["directa", "adaptada", "consejo_practico", "frase_memorable"].forEach(k => {
        if (typeof idea[k] === "string") idea[k] = this._reemplazarNombreGenericoTexto(idea[k], nombre);
      });
    });
    if (Array.isArray(sesion.ideas_todas) && sesion.ideas_todas !== sesion.ideas) {
      sesion.ideas_todas.forEach(idea => {
        if (!idea || typeof idea !== "object") return;
        ["directa", "adaptada", "consejo_practico", "frase_memorable"].forEach(k => {
          if (typeof idea[k] === "string") idea[k] = this._reemplazarNombreGenericoTexto(idea[k], nombre);
        });
      });
    }
    return sesion;
  },

  /* ── Importación: backup completo o sesión suelta ── */
  importarDatos(obj) {
    if (obj && Array.isArray(obj.sesiones)) {
      const lista = this.listar();
      let agregadas = 0, actualizadas = 0;
      obj.sesiones.forEach(s => {
        if (!s || !Array.isArray(s.ideas)) return;
        s = this._normalizarNombresGenericosSesion(s);
        const i = lista.findIndex(x => x.id === s.id);
        if (i >= 0) { lista[i] = s; actualizadas++; }
        else { lista.unshift(s); agregadas++; }
      });
      localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
      const perfilActual = this.cargarPerfil();
      if (obj.perfil && obj.perfil.nombre && !this.esNombreGenerico(obj.perfil.nombre) && !(perfilActual && perfilActual.nombre)) {
        this.guardarPerfil(obj.perfil);
      }
      if (obj.opciones && typeof obj.opciones === "object") {
        Object.entries(obj.opciones).forEach(([clave, arr]) =>
          (arr || []).forEach(v => this.agregarOpcionPropia(clave, v)));
      }
      return { tipo: "backup", agregadas, actualizadas };
    }
    if (obj && Array.isArray(obj.ideas)) {
      const sesion = this._normalizarNombresGenericosSesion({ ...obj, id: "imp" + Date.now(), esPlaylist: false });
      this.guardarSesion(sesion);
      return { tipo: "sesion", titulo: sesion.titulo_sesion || "Sesión importada" };
    }
    throw new Error("El archivo no es un backup ni una sesión de Voz de los Libros.");
  },

  /* ── Perfil ── */
  guardarPerfil(perfil) {
    const limpio = this.limpiarNombrePerfil(perfil && perfil.nombre);
    if (perfil && "nombre" in perfil && !limpio) {
      perfil.nombre = this.nombreActivoSeguro();
    }
    localStorage.setItem(this.CLAVE_PERFIL, JSON.stringify(perfil));
    if (perfil && perfil.nombre && !this.esNombreGenerico(perfil.nombre) && this.idActual()) {
      try { this.actualizarUsuario(this.idActual(), perfil.nombre); } catch {}
    }
  },
  cargarPerfil() {
    try { return JSON.parse(localStorage.getItem(this.CLAVE_PERFIL)) || null; }
    catch { return null; }
  },

  /* ── Sesiones ── */
  _normalizarSesion(sesion) {
    const s = sesion || {};
    let cambio = false;
    const poner = (clave, valor) => { if (s[clave] === undefined || s[clave] === null || s[clave] === "") { s[clave] = valor; cambio = true; } };
    const ideasValidas = arr => Array.isArray(arr)
      ? arr.filter(i => i && typeof i === "object" && (i.directa || i.adaptada || i.consejo_practico || i.frase_memorable))
      : [];
    poner("tipoEntrada", "lectura");
    poner("modoLectura", s.tipoEntrada === "situacion" ? "historia" : "ideas");
    poner("capaLectura", s.modo || "ambas");
    poner("modo", s.capaLectura || "ambas");
    const todas = ideasValidas(s.ideas_todas);
    const visibles = ideasValidas(s.ideas);
    if (todas.length > visibles.length) {
      s.ideas = todas;
      s.ideas_todas = todas;
      cambio = true;
    } else if (visibles.length && !todas.length) {
      s.ideas = visibles;
      s.ideas_todas = visibles;
      cambio = true;
    } else if (visibles.length) {
      s.ideas = visibles;
    }
    s.cantidadTarjetas = (s.ideas || []).length || s.cantidadTarjetas || 20;
    return { sesion: s, cambio };
  },

  listar() {
    try {
      const lista = JSON.parse(localStorage.getItem(this.CLAVE_SESIONES)) || [];
      let cambio = false;
      const normalizadas = lista.map(s => {
        const r = this._normalizarSesion(s);
        if (r.cambio) cambio = true;
        return r.sesion;
      });
      if (cambio) localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(normalizadas));
      return normalizadas;
    }
    catch { return []; }
  },

  guardarSesion(sesion) {
    const lista = this.listar();
    sesion = this._normalizarSesion(sesion).sesion;
    sesion.id = sesion.id || "s" + Date.now();
    sesion.guardadaEl = new Date().toISOString();
    const i = lista.findIndex(s => s.id === sesion.id);
    if (i >= 0) lista[i] = sesion; else lista.unshift(sesion);
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return sesion.id;
  },

  obtener(id) {
    return this.listar().find(s => s.id === id) || null;
  },

  eliminarSesion(id) {
    const lista = this.listar().filter(s => s.id !== id);
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return lista;
  },

  eliminarIdea(idSesion, numeroIdea, indiceIdea) {
    const lista = this.listar();
    const s = lista.find(x => x.id === idSesion);
    if (!s) return null;

    const quitar = arr => {
      if (!Array.isArray(arr)) return [];
      let idx = -1;
      if (numeroIdea !== undefined && numeroIdea !== null && numeroIdea !== "") {
        idx = arr.findIndex(i => String(i.numero) === String(numeroIdea));
      }
      if (idx < 0 && Number.isInteger(indiceIdea)) idx = indiceIdea;
      if (idx >= 0 && idx < arr.length) arr.splice(idx, 1);
      arr.forEach((idea, i) => { idea.numero = i + 1; });
      return arr;
    };

    s.ideas = quitar(s.ideas || []);
    if (Array.isArray(s.ideas_todas)) s.ideas_todas = quitar(s.ideas_todas);
    s.actualizadaEl = new Date().toISOString();
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return s;
  },

  ultima() {
    const lista = this.listar();
    return lista.length ? lista[0] : null;
  },

  /** Búsqueda por fecha, tema, autor, libro, palabra clave o emoción. */
  buscar(texto) {
    const t = (texto || "").toLowerCase().trim();
    if (!t) return this.listar();
    return this.listar().filter(s => {
      const bolsa = [
        s.titulo_sesion, s.tema, s.fecha, s.categoria_vital,
        (s.fuentes || []).join(" "),
        (s.autores || []).join(" "),
        (s.palabras_clave || []).join(" "),
        (s.ideas || []).map(i => [i.directa, i.adaptada, i.frase_memorable, i.consejo_practico].join(" ")).join(" ")
      ].join(" ").toLowerCase();
      return bolsa.includes(t);
    });
  },

  alternarFavorita(idSesion, numeroIdea) {
    const lista = this.listar();
    const s = lista.find(x => x.id === idSesion);
    if (!s) return false;
    const idea = (s.ideas || []).find(i => String(i.numero) === String(numeroIdea));
    if (!idea) return false;
    const nuevoValor = !idea.favorita;
    const aplicar = arr => {
      if (!Array.isArray(arr)) return;
      const encontrada = arr.find(i => String(i.numero) === String(numeroIdea));
      if (encontrada) encontrada.favorita = nuevoValor;
    };
    aplicar(s.ideas);
    aplicar(s.ideas_todas);
    s.actualizadaEl = new Date().toISOString();
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return nuevoValor;
  },

  /** Guarda un consejo recibido por enlace en una sesión especial. */



  depurarDemosNoBasicos(idsBasicos = ["demo-monasterio-preguntas", "demo-volver-contigo", "demo-casa-luz", "demo-paideia-formar-humanidad", "demo-serenidad-necesario"]) {
    const basicos = new Set(idsBasicos);
    const lista = this.listar();
    const depurada = lista.filter(s => !s?.demo || basicos.has(s.id));
    if (depurada.length !== lista.length) {
      localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(depurada));
    }
    return lista.length - depurada.length;
  },

  sembrarDemos(demos) {
    if (!Array.isArray(demos) || !demos.length) return 0;
    // Registro de demos ya ofrecidos (por id): los nuevos se siembran,
    // los que el usuario borró no resucitan.
    const DEMOS_BASICOS = ["demo-trabajo-foco", "demo-orientacion-brujula", "demo-estudio-paideia", "demo-escritura-pensar", "demo-crianza-situacion", "demo-decision-calma", "demo-espiritualidad-lampara", "demo-proyecto-prototipo", "demo-amor-cuidado", "demo-politica-desacuerdo", "demo-autoayuda-ordenar-dia", "demo-duelo-respirar"];
    let ofrecidos = null;
    const crudo = localStorage.getItem(this.CLAVE_DEMOS);
    if (crudo) { try { ofrecidos = JSON.parse(crudo); } catch { ofrecidos = null; } }
    if (!Array.isArray(ofrecidos)) {
      // Marca antigua ("v0.5.2"): los demos originales ya fueron ofrecidos
      ofrecidos = crudo ? demos.map(d => d.id).filter(id => !DEMOS_BASICOS.includes(id)) : [];
    }
    this.depurarDemosNoBasicos?.(DEMOS_BASICOS);
    const lista = this.listar();
    let agregados = 0;
    demos.forEach(demo => {
      if (!demo || !demo.id) return;
      if (ofrecidos.includes(demo.id)) return; // ya ofrecido antes (aunque lo haya borrado)
      ofrecidos.push(demo.id);
      if (lista.some(s => s.id === demo.id)) return;
      lista.push({ ...demo, guardadaEl: demo.guardadaEl || new Date().toISOString() });
      agregados++;
    });
    if (agregados) localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    localStorage.setItem(this.CLAVE_DEMOS, JSON.stringify(ofrecidos));
    return agregados;
  },

  exportarBackup() {
    return {
      app: "Voz de los Libros",
      version: "v0.10.28",
      exportadoEl: new Date().toISOString(),
      perfil: this.cargarPerfil() || {},
      opciones: JSON.parse(localStorage.getItem(this.CLAVE_OPCIONES) || "{}"),
      sesiones: this.listar()
    };
  },

  guardarRecibido(c) {
    const lista = this.listar();
    let s = lista.find(x => x.id === "recibidos");
    if (!s) {
      s = {
        id: "recibidos",
        titulo_sesion: "Consejos recibidos",
        tema: "compartidos por otras personas",
        fecha: new Date().toISOString().slice(0, 10),
        fuentes: [], autores: [], palabras_clave: ["recibido"],
        modo: "directas",
        saludo_audio: "Estos son los consejos que otras personas han compartido contigo.",
        ideas: []
      };
      lista.unshift(s);
    }
    s.ideas.push({
      numero: s.ideas.length + 1,
      prioritaria: true,
      directa: c.directa || c.frase || "",
      consejo_practico: c.practico || "",
      frase_memorable: c.frase || "",
      origen: c.titulo || ""
    });
    if (c.fuente && !s.fuentes.includes(c.fuente)) s.fuentes.push(c.fuente);
    s.fecha = new Date().toISOString().slice(0, 10);
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return s;
  }
};


/* ═══════════ v0.7.0: racha, repaso, estadísticas, backup-meta y PIN ═══════════ */
Object.assign(Biblioteca, {
  _claveMeta() { return "vozlibros_meta__" + (this.idActual() || "legacy"); },

  _meta() {
    try { return JSON.parse(localStorage.getItem(this._claveMeta())) || {}; } catch { return {}; }
  },
  _guardarMeta(m) { localStorage.setItem(this._claveMeta(), JSON.stringify(m)); },

  /* — A2: control de respaldo — */
  registrarSesionNueva() {
    const m = this._meta();
    m.sesionesSinBackup = (m.sesionesSinBackup || 0) + 1;
    this._guardarMeta(m);
  },
  registrarBackupHecho() {
    const m = this._meta();
    m.sesionesSinBackup = 0;
    m.ultimoBackup = Date.now();
    this._guardarMeta(m);
  },
  posponerAvisoBackup() {
    const m = this._meta();
    m.backupPospuestoHasta = Date.now() + 3 * 86400000; // 3 días
    this._guardarMeta(m);
  },
  debeAvisarBackup() {
    const m = this._meta();
    if ((m.sesionesSinBackup || 0) < 3) return 0;
    if (m.backupPospuestoHasta && Date.now() < m.backupPospuestoHasta) return 0;
    return m.sesionesSinBackup;
  },

  /* — B3: racha amable (sin castigo) — */
  registrarDiaEscucha() {
    const hoy = new Date().toISOString().slice(0, 10);
    const m = this._meta();
    if (m.rachaUltimoDia === hoy) return m.rachaDias || 1;
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    m.rachaDias = (m.rachaUltimoDia === ayer) ? (m.rachaDias || 0) + 1 : 1;
    m.rachaUltimoDia = hoy;
    this._guardarMeta(m);
    return m.rachaDias;
  },
  rachaActual() {
    const m = this._meta();
    const hoy = new Date().toISOString().slice(0, 10);
    const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    // Se muestra si escuchó hoy o ayer; si pasó más tiempo, simplemente no se muestra (sin drama)
    if (m.rachaUltimoDia === hoy || m.rachaUltimoDia === ayer) return m.rachaDias || 0;
    return 0;
  },

  /* — B2: repaso espaciado de favoritas — */
  marcarEscuchada(claveIdea) {
    if (!claveIdea) return;
    const m = this._meta();
    m.escuchas = m.escuchas || {};
    m.escuchas[claveIdea] = Date.now();
    this._guardarMeta(m);
  },
  favoritasParaRepaso(maximo = 5) {
    const escuchas = this._meta().escuchas || {};
    const candidatas = [];
    this.listar().forEach(s => {
      if (s.esPlaylist) return;
      (s.ideas || []).forEach(idea => {
        if (!idea.favorita) return;
        const clave = s.id + ":" + idea.numero;
        candidatas.push({ idea, sesion: s, clave, ultima: escuchas[clave] || 0 });
      });
    });
    // Las nunca repasadas primero; luego las más olvidadas
    candidatas.sort((a, b) => a.ultima - b.ultima);
    return candidatas.slice(0, maximo);
  },

  /* — C4: estadísticas ligeras — */
  registrarConsejoEscuchado() {
    const m = this._meta();
    m.consejosEscuchados = (m.consejosEscuchados || 0) + 1;
    this._guardarMeta(m);
  },
  estadisticas() {
    const m = this._meta();
    return {
      consejos: m.consejosEscuchados || 0,
      sesiones: this.listar().filter(s => !s.esPlaylist).length,
      favoritas: this.listar().reduce((n, s) => n + (s.ideas || []).filter(i => i.favorita).length, 0)
    };
  },

  /* — B4: PIN opcional por perfil (protección doméstica, no criptografía fuerte) — */
  async _hashPin(pin) {
    const datos = new TextEncoder().encode("vozlibros·" + pin);
    const hash = await crypto.subtle.digest("SHA-256", datos);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  },
  async fijarPin(idUsuario, pin) {
    const lista = this.usuarios();
    const u = lista.find(x => x.id === idUsuario);
    if (!u) return false;
    u.pinHash = pin ? await this._hashPin(pin) : undefined;
    if (!pin) delete u.pinHash;
    localStorage.setItem(this.CLAVE_LISTA_USUARIOS, JSON.stringify(lista));
    return true;
  },
  async verificarPin(idUsuario, pin) {
    const u = this.usuarios().find(x => x.id === idUsuario);
    if (!u || !u.pinHash) return true; // sin PIN, entra directo
    return (await this._hashPin(pin || "")) === u.pinHash;
  },
  tienePin(idUsuario) {
    const u = this.usuarios().find(x => x.id === idUsuario);
    return !!(u && u.pinHash);
  }
});

// Migrar datos de la versión de un solo usuario (se ejecuta una vez)
Biblioteca.migrarUsuarios();

/* ═══ v0.8.0: progreso y renombrado ═══ */
Object.assign(Biblioteca, {
  guardarProgreso(idSesion, indice) {
    const lista = this.listar();
    const s = lista.find(x => x.id === idSesion);
    if (!s) return;
    s.ultimoConsejo = indice;
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
  },
  renombrarSesion(idSesion, alias) {
    const lista = this.listar();
    const s = lista.find(x => x.id === idSesion);
    if (!s) return false;
    if (alias) s.alias = alias; else delete s.alias;
    localStorage.setItem(this.CLAVE_SESIONES, JSON.stringify(lista));
    return true;
  }
});

/* ═══ v0.10.28: playlists personalizadas persistentes por perfil ═══ */
Object.defineProperty(Biblioteca, "CLAVE_PLAYLISTS", {
  configurable: true,
  get() { return "vozlibros_playlists__" + (Biblioteca.idActual() || "legacy"); }
});
Object.assign(Biblioteca, {
  listarPlaylists() {
    try { return JSON.parse(localStorage.getItem(this.CLAVE_PLAYLISTS)) || []; }
    catch { return []; }
  },
  guardarPlaylist(playlist = {}) {
    const lista = this.listarPlaylists();
    const limpia = {
      id: playlist.id || "pl" + Date.now(),
      nombre: (playlist.nombre || "Playlist sin nombre").trim() || "Playlist sin nombre",
      tipo: playlist.tipo || "sesiones",
      sessionIds: [...new Set(Array.isArray(playlist.sessionIds) ? playlist.sessionIds : [])],
      orden: playlist.orden || "seleccionado",
      creadaEl: playlist.creadaEl || new Date().toISOString(),
      actualizadaEl: new Date().toISOString()
    };
    if (!limpia.sessionIds.length) return null;
    const i = lista.findIndex(p => p.id === limpia.id);
    if (i >= 0) lista[i] = limpia; else lista.unshift(limpia);
    localStorage.setItem(this.CLAVE_PLAYLISTS, JSON.stringify(lista));
    return limpia;
  },
  eliminarPlaylist(id) {
    const lista = this.listarPlaylists().filter(p => p.id !== id);
    localStorage.setItem(this.CLAVE_PLAYLISTS, JSON.stringify(lista));
    return lista;
  },
  renombrarPlaylist(id, nombre) {
    const lista = this.listarPlaylists();
    const pl = lista.find(p => p.id === id);
    if (!pl) return false;
    pl.nombre = (nombre || "Playlist").trim() || "Playlist";
    pl.actualizadaEl = new Date().toISOString();
    localStorage.setItem(this.CLAVE_PLAYLISTS, JSON.stringify(lista));
    return true;
  }
});

(() => {
  const exportarAnterior = Biblioteca.exportarBackup.bind(Biblioteca);
  Biblioteca.exportarBackup = function() {
    const respaldo = exportarAnterior();
    respaldo.version = "v0.10.28";
    respaldo.playlists = this.listarPlaylists();
    return respaldo;
  };
  const importarAnterior = Biblioteca.importarDatos.bind(Biblioteca);
  Biblioteca.importarDatos = function(obj) {
    const resultado = importarAnterior(obj);
    if (obj && Array.isArray(obj.playlists)) {
      const existentes = this.listarPlaylists();
      const mapa = new Map(existentes.map(p => [p.id, p]));
      obj.playlists.forEach(p => {
        if (!p || !Array.isArray(p.sessionIds)) return;
        mapa.set(p.id || ("pl" + Date.now()), {
          id: p.id || ("pl" + Date.now()),
          nombre: p.nombre || "Playlist importada",
          tipo: p.tipo || "sesiones",
          sessionIds: [...new Set(p.sessionIds)],
          orden: p.orden || "seleccionado",
          creadaEl: p.creadaEl || new Date().toISOString(),
          actualizadaEl: new Date().toISOString()
        });
      });
      localStorage.setItem(this.CLAVE_PLAYLISTS, JSON.stringify([...mapa.values()]));
      resultado.playlists = obj.playlists.length;
    }
    return resultado;
  };
})();
