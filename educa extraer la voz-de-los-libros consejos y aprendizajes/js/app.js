/* ═══════════════════════════════════════════
   app.js — Lógica principal
   Fórmula: libro + perfil + intención + estilo
            = consejo lector personalizado
   ═══════════════════════════════════════════ */

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ─────────── Estado ─────────── */
const Estado = {
  perfil: Biblioteca.cargarPerfil() || {},
  borrador: { cantidad: "20", modoLectura: "ideas", capaLectura: "ambas", modo: "ambas", tipoEntrada: "lectura" }, // sesión en construcción
  sesionActual: null,
  ideaActual: 0,
  reproduciendoCadena: false,
  miniPlayerActivo: false
};

/* ─────────── Navegación ─────────── */
function ir(nombre) {
  $$(".pantalla").forEach(p => p.classList.remove("activa"));
  const destino = $("#p-" + nombre);
  if (destino) destino.classList.add("activa");
  if (nombre === "usuarios") pintarUsuarios();
  if (nombre === "perfil") entrarPerfil();
  if (nombre === "biblioteca") pintarBiblioteca();
  if (nombre === "para-mi") pintarParaMi?.();
  if (nombre === "inicio") { pintarSaludo(); if (typeof pintarHoy === "function") { pintarHoy(); } if (typeof pintarPlaylistsInicio === "function") pintarPlaylistsInicio(); }
  actualizarMiniBarraGlobal?.();
  window.scrollTo(0, 0);
}
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-ir]");
  if (!btn) return;
  const activa = document.querySelector(".pantalla.activa")?.id || "";
  const destino = btn.dataset.ir;
  if (destino === "intencion" && ["p-inicio", "p-biblioteca", "p-tipo-lectura"].includes(activa)) reiniciarNuevaLectura?.();
  if (destino === "situacion" && ["p-inicio", "p-tipo-lectura"].includes(activa)) reiniciarLecturaSituacion?.();
  if (destino === "historia-para" && ["p-inicio", "p-tipo-lectura"].includes(activa)) reiniciarHistoriaPara?.();
  ir(destino);
});

/* ─────────── Toast ─────────── */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.remove("oculto");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("oculto"), 2200);
}

/* ─────────── Inicio ─────────── */
function pintarSaludo() {
  const n = Estado.perfil.nombre;
  $("#saludo-inicio").textContent = n
    ? `Hola, ${n}. Convierte una lectura, tema o vivencia en algo que puedas escuchar, guardar y volver.`
    : "Hola. Convierte una lectura, tema o vivencia en algo que puedas escuchar, guardar y volver.";
}

$("#btn-escuchar-ultima").addEventListener("click", () => {
  const s = Biblioteca.ultima();
  if (!s) { toast("Aún no tienes sesiones. Crea tu primera lectura."); ir("tipo-lectura"); return; }
  abrirSesion(s);
});

function pintarPlaylistsInicio() {
  const caja = $("#home-playlists-rapidas");
  const lista = $("#home-playlists-lista");
  if (!caja || !lista) return;
  const playlists = (Biblioteca.listarPlaylists?.() || []).slice(0, 3);
  caja.classList.toggle("oculto", playlists.length === 0);
  lista.innerHTML = "";
  playlists.forEach(pl => {
    const b = document.createElement("button");
    b.type = "button";
    const sesiones = sesionesDePlaylist(pl);
    b.className = "home-playlist-chip";
    b.innerHTML = `🎼 <span>${escapar(pl.nombre || "Playlist")}</span><small>${sesiones.length}</small>`;
    b.addEventListener("click", () => abrirPlaylistGuardada(pl));
    lista.appendChild(b);
  });
}

/* ─────────── Perfil: resumen editable + entrevista híbrida ─────────── */
const OPCIONES_PERFIL = {
  temas: [
    "Espiritualidad", "Complejidad", "IA", "Sanación", "Reencarnación",
    "Filosofía", "Epistemología", "Crianza", "Trabajo", "De todo un poco", "Otro…"
  ],
  historias: [
    "Transformación personal", "Superación", "Maestros y aprendizajes", "Pérdida y renacimiento",
    "Historias espirituales", "Ciencia y misterio", "Vidas ejemplares", "De todo un poco", "Otro…"
  ],
  tono: ["Práctico", "Cálido", "Espiritual", "Académico", "Narrativo", "Profundo", "Sencillo", "Otro…"]
};

const PREGUNTAS_PERFIL = [
  { clave: "nombre",           etiqueta: "Nombre",                  texto: "¿Cómo te llamas?", tipo: "texto" },
  { clave: "momento",          etiqueta: "Momento vital",           texto: "¿Quién eres en este momento de tu vida? Cuéntamelo en una frase.", tipo: "texto" },
  { clave: "temas",            etiqueta: "Temas de interés",        texto: "¿Qué temas te interesan más? Puedes elegir varios.", tipo: "chips-multi", opciones: OPCIONES_PERFIL.temas },
  { clave: "historias",        etiqueta: "Historias que te conmueven", texto: "¿Qué historias vitales te conmueven? Puedes elegir varias.", tipo: "chips-multi", opciones: OPCIONES_PERFIL.historias },
  { clave: "autoresFavoritos", etiqueta: "Autores y obras",         texto: "¿Qué autores, libros o corrientes te inspiran?", tipo: "texto" },
  { clave: "tono",             etiqueta: "Tono preferido",          texto: "¿Qué tono prefieres para tus consejos?", tipo: "chips-unico", opciones: OPCIONES_PERFIL.tono }
];

let pasoPerfil = 0;
let editandoPerfil = null;
let seleccionPerfil = [];

function perfilTieneDatos() {
  return PREGUNTAS_PERFIL.some(p => valorPerfilTexto(Estado.perfil[p.clave]));
}

function valorPerfilTexto(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(", ");
  return (valor || "").toString().trim();
}

function entrarPerfil() {
  if (perfilTieneDatos()) mostrarResumenPerfil();
  else iniciarChatPerfil(true);
}

function mostrarEntradaPerfil(mostrar) {
  $("#entrada-perfil").classList.toggle("oculto", !mostrar);
  if (mostrar) setTimeout(() => $("#input-perfil").focus(), 80);
}

function mostrarResumenPerfil() {
  const chat = $("#chat-perfil");
  chat.innerHTML = "";
  mostrarEntradaPerfil(false);
  burbujaApp(chat, "Este es tu perfil lector-vital guardado. Puedes editar solo lo que necesites sin repetir toda la entrevista.");

  const cont = document.createElement("div");
  cont.className = "perfil-resumen";
  PREGUNTAS_PERFIL.forEach(p => {
    const card = document.createElement("div");
    card.className = "perfil-card";
    const valor = valorPerfilTexto(Estado.perfil[p.clave]) || "Sin definir";
    const esLargo = valor.length > 220;
    card.innerHTML = `
      <div class="perfil-card-cuerpo">
        <span class="perfil-label">${escapar(p.etiqueta)}</span>
        <p class="perfil-valor${esLargo ? " plegable plegado" : ""}">${escapar(valor)}</p>
        ${esLargo ? `<button class="perfil-vermas" type="button">Ver más</button>` : ""}
      </div>
      <button class="perfil-editar" data-editar-perfil="${p.clave}" data-tooltip="Editar solo este campo">Editar</button>
    `;
    const verMas = card.querySelector(".perfil-vermas");
    if (verMas) verMas.addEventListener("click", () => {
      const parrafo = card.querySelector(".perfil-valor");
      const plegado = parrafo.classList.toggle("plegado");
      verMas.textContent = plegado ? "Ver más" : "Ver menos";
    });
    cont.appendChild(card);
  });
  chat.appendChild(cont);

  const acciones = document.createElement("div");
  acciones.className = "perfil-acciones";
  acciones.innerHTML = `
    <button class="boton-secundario" id="btn-pin-perfil" data-tooltip="Protege este perfil con un PIN en dispositivos compartidos">🔒 PIN del perfil</button>
    <button class="boton-secundario" id="btn-rehacer-perfil" data-tooltip="Borra el perfil actual y repite la entrevista completa">Rehacer entrevista completa</button>
  `;
  chat.appendChild(acciones);

  chat.querySelectorAll("[data-editar-perfil]").forEach(btn => {
    btn.addEventListener("click", () => iniciarEdicionPerfil(btn.dataset.editarPerfil));
  });
  $("#btn-pin-perfil").addEventListener("click", () => configurarPin());
  $("#btn-rehacer-perfil").addEventListener("click", () => {
    if (!confirm("¿Rehacer la entrevista completa? Se reemplazará tu perfil vital actual.")) return;
    Estado.perfil = {};
    Biblioteca.guardarPerfil(Estado.perfil);
    iniciarChatPerfil(true);
  });
  aplicarTooltipsEscritorio();
}

function iniciarChatPerfil(reiniciar = false) {
  const chat = $("#chat-perfil");
  chat.innerHTML = "";
  mostrarEntradaPerfil(true);
  pasoPerfil = 0;
  editandoPerfil = null;
  seleccionPerfil = [];
  $("#input-perfil").value = "";
  burbujaApp(chat, reiniciar
    ? "Vamos a armar tu perfil lector-vital. Serán pocas preguntas, una a la vez. 🌱"
    : "Continuemos con tu perfil lector-vital."
  );
  setTimeout(() => preguntarSiguiente(chat), 350);
}

function iniciarEdicionPerfil(clave) {
  const pregunta = PREGUNTAS_PERFIL.find(p => p.clave === clave);
  if (!pregunta) return;
  editandoPerfil = pregunta;
  pasoPerfil = PREGUNTAS_PERFIL.indexOf(pregunta);
  const chat = $("#chat-perfil");
  chat.innerHTML = "";
  burbujaApp(chat, `Editaremos solo: ${pregunta.etiqueta}.`);
  renderPreguntaPerfil(chat, pregunta);
}

function burbujaApp(chat, texto) {
  const b = document.createElement("div");
  b.className = "burbuja app";
  b.textContent = texto;
  chat.appendChild(b);
  chat.scrollTop = chat.scrollHeight;
}
function burbujaUsuario(chat, texto) {
  const b = document.createElement("div");
  b.className = "burbuja usuario";
  b.textContent = texto;
  chat.appendChild(b);
  chat.scrollTop = chat.scrollHeight;
}

function preguntarSiguiente(chat) {
  if (pasoPerfil < PREGUNTAS_PERFIL.length) {
    renderPreguntaPerfil(chat, PREGUNTAS_PERFIL[pasoPerfil]);
  } else {
    Biblioteca.guardarPerfil(Estado.perfil);
    burbujaApp(chat, `Listo, ${Estado.perfil.nombre || "amigo"}. Tu perfil quedó guardado. Ahora los libros podrán hablarte según tu historia. ✨`);
    setTimeout(() => ir("inicio"), 1300);
  }
}

function renderPreguntaPerfil(chat, pregunta) {
  burbujaApp(chat, pregunta.texto);
  seleccionPerfil = [];
  $("#input-perfil").value = "";

  if (pregunta.tipo === "texto") {
    mostrarEntradaPerfil(true);
    $("#input-perfil").placeholder = "Escribe tu respuesta…";
    const actual = valorPerfilTexto(Estado.perfil[pregunta.clave]);
    if (actual && editandoPerfil) $("#input-perfil").value = actual;
    return;
  }

  mostrarEntradaPerfil(false);
  const caja = document.createElement("div");
  caja.className = "perfil-chips";
  const actuales = valorPerfilTexto(Estado.perfil[pregunta.clave]).split(",").map(x => x.trim()).filter(Boolean);
  seleccionPerfil = [...actuales];

  // Chips propios del usuario primero (los que ha creado con "Otro…"),
  // luego los predefinidos.
  const propias = Biblioteca.opcionesPropias(pregunta.clave)
    .filter(v => !pregunta.opciones.some(o => o.toLowerCase() === v.toLowerCase()));
  [...propias, ...pregunta.opciones].forEach(op => {
    const btn = document.createElement("button");
    btn.className = "chip" + (actuales.includes(op) ? " seleccionado" : "");
    btn.textContent = op;
    btn.type = "button";
    btn.dataset.valor = op;
    btn.addEventListener("click", () => seleccionarChipPerfil(btn, pregunta));
    caja.appendChild(btn);
  });

  const extraWrap = document.createElement("div");
  extraWrap.className = "campo-otro oculto";
  extraWrap.innerHTML = `
    <input type="text" class="input-otro" placeholder="Escribe otra opción…" autocomplete="off">
  `;

  const guardar = document.createElement("button");
  guardar.className = "boton-primario boton-guardar-chip";
  guardar.type = "button";
  guardar.textContent = editandoPerfil ? "Guardar cambio" : "Guardar y seguir";
  guardar.addEventListener("click", () => guardarChipsPerfil(pregunta, caja, extraWrap));

  chat.appendChild(caja);
  chat.appendChild(extraWrap);
  chat.appendChild(guardar);
  chat.scrollTop = chat.scrollHeight;
}

function seleccionarChipPerfil(btn, pregunta) {
  const valor = btn.dataset.valor;
  const caja = btn.closest(".perfil-chips");
  const extra = caja.nextElementSibling;

  if (valor === "Otro…") {
    btn.classList.toggle("seleccionado");
    extra.classList.toggle("oculto", !btn.classList.contains("seleccionado"));
    if (btn.classList.contains("seleccionado")) extra.querySelector("input").focus();
    return;
  }

  if (pregunta.tipo === "chips-unico") {
    caja.querySelectorAll(".chip").forEach(c => c.classList.remove("seleccionado"));
    btn.classList.add("seleccionado");
    extra.classList.add("oculto");
    return;
  }

  if (valor === "De todo un poco") {
    caja.querySelectorAll(".chip").forEach(c => c.classList.remove("seleccionado"));
    btn.classList.add("seleccionado");
    extra.classList.add("oculto");
    return;
  }

  const todo = [...caja.querySelectorAll(".chip")].find(c => c.dataset.valor === "De todo un poco");
  if (todo) todo.classList.remove("seleccionado");
  btn.classList.toggle("seleccionado");
}

function guardarChipsPerfil(pregunta, caja, extraWrap) {
  let valores = [...caja.querySelectorAll(".chip.seleccionado")]
    .map(c => c.dataset.valor)
    .filter(v => v !== "Otro…");
  const otroActivo = caja.querySelector('[data-valor="Otro…"]')?.classList.contains("seleccionado");
  const otro = extraWrap.querySelector("input")?.value.trim();
  if (otroActivo && otro) {
    valores.push(otro);
    // Adoptarla como chip permanente: aparecerá arriba la próxima vez
    Biblioteca.agregarOpcionPropia(pregunta.clave, otro);
  }
  if (!valores.length) { toast("Elige una opción o escribe otra."); return; }

  const valorFinal = pregunta.tipo === "chips-unico" ? valores[0] : valores;
  Estado.perfil[pregunta.clave] = valorFinal;
  Biblioteca.guardarPerfil(Estado.perfil);
  burbujaUsuario($("#chat-perfil"), valorPerfilTexto(valorFinal));

  if (editandoPerfil) {
    editandoPerfil = null;
    setTimeout(mostrarResumenPerfil, 450);
  } else {
    pasoPerfil++;
    setTimeout(() => preguntarSiguiente($("#chat-perfil")), 400);
  }
}

function responderPerfil() {
  const input = $("#input-perfil");
  const valor = input.value.trim();
  if (!valor) { toast("No guardo campos vacíos."); return; }
  const chat = $("#chat-perfil");
  const pregunta = editandoPerfil || PREGUNTAS_PERFIL[pasoPerfil];
  if (!pregunta || pregunta.tipo !== "texto") return;
  if (pregunta.clave === "nombre" && Biblioteca.esNombreGenerico?.(valor)) {
    toast("Escribe un nombre propio para que el audio no diga “Usuario”.");
    return;
  }

  burbujaUsuario(chat, valor);
  Estado.perfil[pregunta.clave] = valor;
  Biblioteca.guardarPerfil(Estado.perfil);
  input.value = "";

  if (editandoPerfil) {
    editandoPerfil = null;
    setTimeout(mostrarResumenPerfil, 450);
  } else {
    pasoPerfil++;
    setTimeout(() => preguntarSiguiente(chat), 400);
  }
}
$("#enviar-perfil").addEventListener("click", responderPerfil);
$("#input-perfil").addEventListener("keydown", e => { if (e.key === "Enter") responderPerfil(); });

function seleccionarChipPorValor(contenedor, valor) {
  const c = typeof contenedor === "string" ? $("#" + contenedor) : contenedor;
  if (!c) return;
  c.querySelectorAll(".chip").forEach(ch => ch.classList.toggle("seleccionado", ch.dataset.valor === valor));
}
function reiniciarBorradorBase(tipoEntrada = "lectura") {
  Estado.borrador = { cantidad: "20", modoLectura: "ideas", capaLectura: "ambas", modo: "ambas", tipoEntrada };
  seleccionarChipPorValor("chips-modo-lectura", "ideas");
  seleccionarChipPorValor("chips-cantidad", "20");
  seleccionarChipPorValor("chips-capa", "ambas");
  $("#cantidad-personalizada-box")?.classList.add("oculto");
  $("#historia-estilo-box")?.classList.add("oculto");
  const he = $("#historia-estilo"); if (he) he.value = "";
  const cp = $("#cantidad-personalizada"); if (cp) cp.value = "20";
  actualizarCantidadDinamica?.();
}
function reiniciarNuevaLectura() {
  reiniciarBorradorBase("lectura");
  $("#intencion-libre") && ($("#intencion-libre").value = "");
  $("#fuentes-libros") && ($("#fuentes-libros").value = "");
  $("#fuentes-autores") && ($("#fuentes-autores").value = "");
  $("#fuentes-sugerencias") && ($("#fuentes-sugerencias").checked = false);
  $("#historia-estilo") && ($("#historia-estilo").value = "");
  $("#texto-prompt") && ($("#texto-prompt").textContent = "");
  $("#entrada-json") && ($("#entrada-json").value = "");
  $("#error-json") && ($("#error-json").textContent = "");
  seleccionarChipPorValor("chips-intencion", "");
}
function reiniciarLecturaSituacion() {
  reiniciarBorradorBase("situacion");
  Estado.borrador.tipoSituacion = "mi";
  Estado.borrador.salidaSituacion = "destinatario";
  ["situacion-solicitante","situacion-destinatario","situacion-edad","situacion-relacion","situacion-concreta","situacion-emocion","situacion-objetivo","situacion-tono","situacion-fuentes"].forEach(id => { const el = $("#" + id); if (el) el.value = ""; });
  $("#situacion-sugerencias") && ($("#situacion-sugerencias").checked = false);
  $("#historia-estilo") && ($("#historia-estilo").value = "");
  seleccionarChipPorValor("chips-situacion-tipo", "mi");
  $("#texto-prompt") && ($("#texto-prompt").textContent = "");
  $("#entrada-json") && ($("#entrada-json").value = "");
  $("#error-json") && ($("#error-json").textContent = "");
}

function reiniciarHistoriaPara() {
  reiniciarBorradorBase("historia_para");
  Estado.borrador.tipoEntrada = "historia_para";
  Estado.borrador.modoLectura = "historia";
  Estado.borrador.capaLectura = "directas";
  Estado.borrador.modo = "directas";
  Estado.borrador.accionHistoria = "crear";
  seleccionarChipPorValor("chips-historia-accion", "crear");
  seleccionarChipPorValor("chips-modo-lectura", "historia");
  seleccionarChipPorValor("chips-capa", "directas");
  ["historia-destinatario","historia-edad","historia-base","historia-personajes","historia-referentes","historia-moraleja","historia-tono","historia-final","historia-estilo"].forEach(id => { const el = $("#" + id); if (el) el.value = ""; });
  $("#texto-prompt") && ($("#texto-prompt").textContent = "");
  $("#entrada-json") && ($("#entrada-json").value = "");
  $("#error-json") && ($("#error-json").textContent = "");
  actualizarCantidadDinamica?.();
}

/* ─────────── Intención del día ─────────── */
$("#chips-intencion").addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  $$("#chips-intencion .chip").forEach(c => c.classList.remove("seleccionado"));
  chip.classList.add("seleccionado");
  Estado.borrador.intencion = chip.dataset.valor;
});
$("#btn-intencion-seguir").addEventListener("click", () => {
  Estado.borrador.tipoEntrada = "lectura";
  delete Estado.borrador.situacionLectura;
  delete Estado.borrador.salidaSituacion;
  const libre = $("#intencion-libre").value.trim();
  if (libre) Estado.borrador.intencion = libre;
  if (!Estado.borrador.intencion) { toast("Elige una opción o escribe tu necesidad de hoy."); return; }
  ir("fuentes");
});

/* ─────────── Módulo: Una historia para… ─────────── */
$("#btn-historia-seguir")?.addEventListener("click", () => {
  const destinatario = $("#historia-destinatario")?.value.trim() || Estado.perfil.nombre || "alguien especial";
  const edad = $("#historia-edad")?.value.trim() || "";
  const argumento = $("#historia-base")?.value.trim() || "";
  const personajes = $("#historia-personajes")?.value.trim() || "";
  const referentes = $("#historia-referentes")?.value.split(/[\n,]/).map(x => x.trim()).filter(Boolean) || [];
  const moraleja = $("#historia-moraleja")?.value.trim() || "";
  const tono = $("#historia-tono")?.value.trim() || Estado.perfil.tono || "cálido, claro y narrativo";
  const finalDeseado = $("#historia-final")?.value.trim() || "";
  const accion = Estado.borrador.accionHistoria || "crear";

  if (!argumento && !moraleja && !personajes) {
    toast("Escribe una idea, argumento, personaje o enseñanza para la historia.");
    return;
  }

  Estado.borrador = {
    ...Estado.borrador,
    tipoEntrada: "historia_para",
    modoLectura: "historia",
    capaLectura: "directas",
    modo: "directas",
    accionHistoria: accion,
    historiaPara: {
      solicitante: Estado.perfil.nombre || "",
      destinatario,
      edad,
      argumento,
      personajes,
      referentes,
      moraleja,
      tono,
      finalDeseado
    },
    intencion: moraleja || argumento || "Crear una historia con enseñanza",
    libros: referentes,
    autores: [],
    sugerencias: false,
    estiloHistoria: tono || "cuento o aventura con enseñanza"
  };
  seleccionarChipPorValor("chips-modo-lectura", "historia");
  seleccionarChipPorValor("chips-capa", "directas");
  actualizarCantidadDinamica?.();
  ir("config");
});

/* ─────────── Lectura para una situación ─────────── */
function seleccionarChipSimple(contenedor, clave, destino = Estado.borrador) {
  $("#" + contenedor)?.addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$("#" + contenedor + " .chip").forEach(c => c.classList.remove("seleccionado"));
    chip.classList.add("seleccionado");
    destino[clave] = chip.dataset.valor;
  });
}
seleccionarChipSimple("chips-situacion-tipo", "tipoSituacion");
seleccionarChipSimple("chips-historia-accion", "accionHistoria");
/* Salida simplificada: solo lectura principal para destinatario. */

$("#btn-situacion-seguir")?.addEventListener("click", () => {
  const solicitante = $("#situacion-solicitante")?.value.trim() || Estado.perfil.nombre || "Usuario";
  const destinatario = $("#situacion-destinatario")?.value.trim() || (Estado.borrador.tipoSituacion === "mi" ? solicitante : "destinatario");
  const edad = $("#situacion-edad")?.value.trim() || "";
  const relacion = $("#situacion-relacion")?.value.trim() || "";
  const situacion = $("#situacion-concreta")?.value.trim() || "";
  const emocion = $("#situacion-emocion")?.value.trim() || "";
  const objetivo = $("#situacion-objetivo")?.value.trim() || "";
  const tono = $("#situacion-tono")?.value.trim() || Estado.perfil.tono || "cálido y sencillo";
  const fuentes = $("#situacion-fuentes")?.value.split(/[\n,]/).map(x => x.trim()).filter(Boolean) || [];
  const pedirSugerencias = !!$("#situacion-sugerencias")?.checked;
  if (!situacion && !objetivo) { toast("Describe la situación u objetivo de la lectura."); return; }
  Estado.borrador = {
    ...Estado.borrador,
    tipoEntrada: "situacion",
    tipoSituacion: Estado.borrador.tipoSituacion || "mi",
    salidaSituacion: "destinatario",
    situacionLectura: {
      solicitante,
      destinatario,
      edad,
      relacion,
      situacion,
      emocion,
      objetivo,
      tono,
      fuentes,
      pedirSugerencias
    },
    intencion: objetivo || situacion,
    libros: fuentes,
    autores: [],
    sugerencias: pedirSugerencias
  };
  ir("config");
});

/* ─────────── Fuentes ─────────── */
$("#btn-fuentes-seguir").addEventListener("click", () => {
  Estado.borrador.tipoEntrada = "lectura";
  delete Estado.borrador.situacionLectura;
  delete Estado.borrador.salidaSituacion;
  Estado.borrador.libros = $("#fuentes-libros").value.split("\n").map(l => l.trim()).filter(Boolean);
  Estado.borrador.autores = $("#fuentes-autores").value.split(/[,\n]/).map(a => a.trim()).filter(Boolean);
  Estado.borrador.sugerencias = $("#fuentes-sugerencias").checked;
  ir("config");
});

/* ─────────── Configuración ─────────── */
function chipsUnicos(idContenedor, clave) {
  $("#" + idContenedor).addEventListener("click", e => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$("#" + idContenedor + " .chip").forEach(c => c.classList.remove("seleccionado"));
    chip.classList.add("seleccionado");
    Estado.borrador[clave] = chip.dataset.valor;
  });
}
chipsUnicos("chips-cantidad", "cantidad");
chipsUnicos("chips-modo-lectura", "modoLectura");
chipsUnicos("chips-capa", "capaLectura");
$("#chips-capa")?.addEventListener("click", () => { Estado.borrador.modo = Estado.borrador.capaLectura || "ambas"; });
$("#chips-cantidad")?.addEventListener("click", () => actualizarCantidadDinamica());
$("#chips-modo-lectura")?.addEventListener("click", () => actualizarCantidadDinamica());
$("#cantidad-personalizada")?.addEventListener("input", () => actualizarCantidadDinamica());

function rotuloModoLectura(modo) {
  if (Estado.borrador.tipoEntrada === "historia_para") return "escenas";
  return ({ ideas: "ideas/tarjetas", narrativa: "microcapítulos/escenas", historia: "escenas pedagógicas", academica: "conceptos/claves" })[modo || "ideas"] || "tarjetas";
}
function cantidadElegida() {
  const val = Estado.borrador.cantidad || "20";
  const box = $("#cantidad-personalizada-box");
  if (box) box.classList.toggle("oculto", val !== "personalizado");
  if (val !== "personalizado") return Math.max(1, parseInt(val, 10) || 20);
  const n = parseInt($("#cantidad-personalizada")?.value || "20", 10);
  return Math.max(1, Number.isFinite(n) ? n : 20);
}
function actualizarCantidadDinamica() {
  const cantidad = cantidadElegida();
  const rotulo = rotuloModoLectura(Estado.borrador.modoLectura);
  const nota = $("#nota-cantidad-dinamica");
  if (nota) {
    if (cantidad >= 200) nota.textContent = `La app pedirá ${cantidad} ${rotulo}. 200 o más puede colgar o cortar la IA; conviene dividir en varias sesiones.`;
    else if (cantidad >= 150) nota.textContent = `La app pedirá ${cantidad} ${rotulo}. 150 es avanzado: puede funcionar, pero tarda más y exige JSON muy limpio.`;
    else if (cantidad > 100) nota.textContent = `La app pedirá ${cantidad} ${rotulo}. Más de 100 puede tardar; si falla, divide por bloques.`;
    else nota.textContent = `La app pedirá ${cantidad} ${rotulo}. Rango recomendado para estabilidad: 30–100.`;
  }
  const notaModo = $("#nota-modo-lectura");
  const m = Estado.borrador.modoLectura || "ideas";
  const esHistoriaPara = Estado.borrador.tipoEntrada === "historia_para";
  const esSituacionConfig = Estado.borrador.tipoEntrada === "situacion";
  const volverConfig = $("#btn-volver-config");
  if (volverConfig) volverConfig.dataset.ir = esHistoriaPara ? "historia-para" : esSituacionConfig ? "situacion" : "fuentes";
  if ($("#config-titulo")) $("#config-titulo").textContent = esHistoriaPara ? "Escenas" : "Extracción";
  if ($("#config-subtitulo")) $("#config-subtitulo").textContent = esHistoriaPara ? "Historia · número de escenas" : "Paso 3 de 3 · Ideas y enfoque";
  $("#bloque-modo-lectura")?.classList.toggle("oculto", esHistoriaPara);
  $("#historia-estilo-box")?.classList.toggle("oculto", m !== "historia" || esHistoriaPara);
  const preguntaCantidad = $("#pregunta-cantidad-texto");
  if (preguntaCantidad) preguntaCantidad.textContent = esHistoriaPara ? "¿Cuántas escenas quieres recibir?" : "¿Cuántas tarjetas quieres recibir?";
  if (esHistoriaPara) {
    Estado.borrador.modoLectura = "historia";
    Estado.borrador.capaLectura = "directas";
    Estado.borrador.modo = "directas";
    seleccionarChipPorValor("chips-modo-lectura", "historia");
    seleccionarChipPorValor("chips-capa", "directas");
  }
  if (notaModo) {
    notaModo.textContent = esHistoriaPara
      ? "Historia para alguien: crea, mejora o continúa un relato original por escenas, con argumento, destinatario, referentes transformados y enseñanza clara."
      : ({
        ideas: "Ideas centrales extrae aprendizajes, frases memorables y acciones, evitando fórmulas repetidas.",
        narrativa: "Narrativa resumida sigue la obra en capítulos, escenas o partes ordenadas. Si es académica, resume su arquitectura sin saltos.",
        historia: "Historia para comprender crea una narración pedagógica nueva: presenta fuente al inicio, desarrolla una historia comprensible y cierra conectando con la obra o autores.",
        academica: "Guía académica explica conceptos, categorías y relaciones con rigor, procedencia audible y sin muletillas."
      })[m] || "Elige el modo de transformación del contenido.";
  }
}
actualizarCantidadDinamica();

$("#btn-generar-prompt").addEventListener("click", () => {
  const cantidad = cantidadElegida();
  if (cantidad >= 200 && !confirm("200 o más tarjetas puede colgar o cortar la IA. ¿Quieres continuar de todos modos?")) return;
  Estado.borrador.cantidadTarjetas = cantidad;
  Estado.borrador.cantidad = String(cantidad);
  if (Estado.borrador.tipoEntrada !== "historia_para") {
    Estado.borrador.estiloHistoria = $("#historia-estilo")?.value.trim() || "";
  }
  Estado.borrador.modo = Estado.borrador.capaLectura || Estado.borrador.modo || "ambas";
  const categoriasUsuario = [...new Set(Biblioteca.listar().map(s => claveCategoria(s.categoria_vital || "otro")))];
  const prompt = PromptVoz.generar(Estado.perfil, Estado.borrador, categoriasUsuario);
  $("#texto-prompt").textContent = prompt;
  ir("prompt");
});

function animarBotonesIA() {
  const links = Array.from(document.querySelectorAll(".hub-ia .hub-link"));
  links.forEach((link, i) => {
    link.classList.remove("ia-sugerida");
    setTimeout(() => {
      link.classList.add("ia-sugerida");
      setTimeout(() => link.classList.remove("ia-sugerida"), 900);
    }, i * 130);
  });
}

/* ─────────── Prompt: copiar ─────────── */
$("#btn-copiar-prompt").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText($("#texto-prompt").textContent);
    toast("Instrucciones copiadas ✅");
    animarBotonesIA();
  } catch {
    // Alternativa si el portapapeles está bloqueado: mostrar solo en emergencia.
    $("#texto-prompt").classList.remove("oculto");
    toast("Copia manualmente las instrucciones mostradas.");
  }
});

/* ─────────── JSON: procesar respuesta ─────────── */
$("#btn-procesar-json").addEventListener("click", () => {
  const bruto = $("#entrada-json").value.trim();
  const error = $("#error-json");
  error.textContent = "";
  if (!bruto) { error.textContent = "Pega primero el JSON de la IA."; return; }
  try {
    const limpio = extraerJSONValido(bruto);
    const datos = JSON.parse(limpio);
    if (!Array.isArray(datos.ideas) || !datos.ideas.length) {
      throw new Error("El JSON no contiene el arreglo 'ideas'.");
    }
    crearSesionDesdeJSON(datos);
  } catch (e) {
    error.textContent = "No pude leer el JSON: " + e.message + " Revisa que esté completo y sin texto extra.";
  }
});

$("#btn-cargar-ejemplo").addEventListener("click", async () => {
  try {
    const r = await fetch("data/ejemplo-respuesta.json");
    const datos = await r.json();
    crearSesionDesdeJSON(datos);
  } catch {
    $("#error-json").textContent = "Para cargar el ejemplo, abre la app desde un servidor local (ver README).";
  }
});

function extraerJSONValido(texto) {
  let t = (texto || "").trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  if (t.startsWith("{") && t.endsWith("}")) return t;

  const inicio = t.indexOf("{");
  if (inicio < 0) throw new Error("No encontré un objeto JSON que empiece con '{'.");
  let profundidad = 0, enCadena = false, escape = false;
  for (let i = inicio; i < t.length; i++) {
    const ch = t[i];
    if (enCadena) {
      if (escape) { escape = false; continue; }
      if (ch === "\\") { escape = true; continue; }
      if (ch === '"') enCadena = false;
      continue;
    }
    if (ch === '"') { enCadena = true; continue; }
    if (ch === "{") profundidad++;
    if (ch === "}") {
      profundidad--;
      if (profundidad === 0) return t.slice(inicio, i + 1).trim();
    }
  }
  throw new Error("El JSON parece incompleto: falta cerrar una llave '}'.");
}

function ideasValidasSesion(arr) {
  return Array.isArray(arr)
    ? arr.filter(i => i && typeof i === "object" && (i.directa || i.adaptada || i.consejo_practico || i.frase_memorable))
    : [];
}

function crearSesionDesdeJSON(datos) {
  if (!datos || !Array.isArray(datos.ideas)) throw new Error("El JSON debe incluir un arreglo llamado ideas.");
  const ideasValidas = ideasValidasSesion(datos.ideas);
  if (!ideasValidas.length) throw new Error("No encontré tarjetas/ideas válidas en el JSON.");
  const cantidadDeclarada = parseInt(datos.cantidadTarjetas || datos.cantidad || ideasValidas.length, 10);
  const cantidadFinal = ideasValidas.length;
  const situacion = Estado.borrador.situacionLectura || null;
  const sesion = {
    ...datos,
    ideas_todas: ideasValidas,
    ideas: ideasValidas,
    cantidadSolicitada: Number.isFinite(cantidadDeclarada) ? cantidadDeclarada : cantidadFinal,
    tipoEntrada: datos.tipoEntrada || Estado.borrador.tipoEntrada || "lectura",
    modoLectura: datos.modoLectura || Estado.borrador.modoLectura || "ideas",
    capaLectura: datos.capaLectura || Estado.borrador.capaLectura || Estado.borrador.modo || "ambas",
    cantidadTarjetas: cantidadFinal,
    modo: datos.capaLectura || Estado.borrador.capaLectura || Estado.borrador.modo || "ambas",
    situacionLectura: situacion,
    solicitante: situacion ? situacion.solicitante : datos.solicitante,
    destinatario: situacion ? { nombre: situacion.destinatario, edad: situacion.edad, relacion: situacion.relacion } : datos.destinatario,
    salidaSituacion: Estado.borrador.salidaSituacion || datos.salidaSituacion || undefined,
    fecha: datos.fecha || new Date().toISOString().slice(0, 10)
  };
  if (situacion?.destinatario) sesion.usuario = situacion.destinatario;
  Biblioteca.guardarSesion(sesion);
  Biblioteca.registrarSesionNueva(); // A2: cuenta para el recordatorio de backup
  $("#entrada-json").value = "";
  abrirSesion(sesion);
  toast(`Sesión guardada con ${cantidadFinal} tarjeta${cantidadFinal === 1 ? "" : "s"} 🗄️`);
}

function normalizarSesionVista(sesion) {
  const s = sesion || {};
  s.tipoEntrada = s.tipoEntrada || "lectura";
  s.modoLectura = s.modoLectura || (s.tipoEntrada === "situacion" ? "historia" : "ideas");
  s.capaLectura = s.capaLectura || s.modo || "ambas";
  s.modo = s.modo || s.capaLectura || "ambas";

  const todas = ideasValidasSesion(s.ideas_todas);
  const visibles = ideasValidasSesion(s.ideas);
  if (todas.length > visibles.length) {
    s.ideas = todas;
    s.ideas_todas = todas;
  } else if (visibles.length) {
    s.ideas = visibles;
    s.ideas_todas = todas.length ? todas : visibles;
  } else if (todas.length) {
    s.ideas = todas;
    s.ideas_todas = todas;
  }
  s.cantidadTarjetas = (s.ideas || []).length || s.cantidadTarjetas || 20;
  return s;
}
function etiquetaElementoSesion(sesion, i) {
  const modo = sesion?.modoLectura || "ideas";
  const base = ({ ideas: "Idea", narrativa: "Escena", historia: "Escena", academica: "Concepto" })[modo] || "Tarjeta";
  return base + " " + (i + 1);
}

/* ─────────── Sesión: pintar y escuchar ─────────── */
function abrirSesion(sesion) {
  sesion = normalizarSesionVista(sesion);
  Estado.sesionActual = sesion;
  Estado.ideaActual = 0;

  $("#sesion-titulo").textContent = sesion.alias || sesion.titulo_sesion || "Sesión de lectura";
  $("#sesion-sub").textContent =
    (sesion.fecha || "") + (sesion.tema ? " · " + sesion.tema : "");
  $("#sesion-saludo").textContent = saludoCompacto(sesion);

  const lista = $("#lista-ideas");
  lista.innerHTML = "";
  const esPlaylist = !!sesion.esPlaylist;
  const etiquetaModo = ({ directas: "Neto", adaptadas: "Contexto", ambas: "Ambos", accion: "Acción" })[sesion.modo] || "Ambos";
  const etiquetaModoLectura = etiquetaModoLecturaCorta(sesion.modoLectura, sesion.tipoEntrada);

  (sesion.ideas || []).forEach((idea, i) => {
    const div = document.createElement("details");
    div.className = "idea" + (idea.favorita ? " favorita" : "");
    div.dataset.indice = i;
    if (i === 0) div.open = true;

    const resumenBase = sesion.modo === "accion"
      ? (idea.consejo_practico || idea.frase_memorable || idea.adaptada || idea.directa)
      : sesion.modo === "directas"
        ? (idea.directa || idea.frase_memorable || idea.adaptada)
        : sesion.modo === "adaptadas"
          ? (idea.adaptada || idea.frase_memorable || idea.directa)
          : (idea.frase_memorable || idea.adaptada || idea.directa);
    const resumen = textoCorto(resumenBase || `Tarjeta ${i + 1}`, 145);

    div.innerHTML = `
      <summary>
        <div class="idea-resumen">
          <div>
            <div class="idea-etiquetas">
              <span class="idea-num">${etiquetaElementoSesion(sesion, i)}</span>
              <span class="idea-chip-modo">${etiquetaModo}</span><span class="idea-chip-modo modo-transformacion">${etiquetaModoLectura}</span>
            </div>
            <p class="idea-frase-mini">${escapar(resumen)}</p>
          </div>
          <span class="idea-toggle">Ver</span>
        </div>
      </summary>
      <div class="idea-cuerpo">
        ${(sesion.modo === "directas" || sesion.modo === "ambas") && idea.directa ? `<p class="idea-directa">${escapar(idea.directa)}</p>` : ""}
        ${(sesion.modo === "adaptadas" || sesion.modo === "ambas") && idea.adaptada ? `<p class="idea-adaptada"><strong>Para ti:</strong> ${escapar(idea.adaptada)}</p>` : ""}
        ${sesion.modo === "accion" && idea.consejo_practico ? `<div class="idea-consejo-practico"><strong>Haz:</strong> ${escapar(idea.consejo_practico)}</div>` : ""}
        ${(sesion.modo === "adaptadas" || sesion.modo === "ambas") && idea.frase_memorable ? `<p class="idea-adaptada">💬 ${escapar(idea.frase_memorable)}</p>` : ""}
        <div class="idea-acciones">
          <button class="idea-favorita-btn ${idea.favorita ? "activa" : ""}" data-favorita-idea="${i}" data-tooltip="Marcar o quitar favorita esta tarjeta" aria-label="Marcar favorita">${idea.favorita ? "★" : "☆"} Favorita</button>
          <button class="idea-compartir" data-compartir-idea="${i}" data-tooltip="Compartir esta idea como tarjeta, imagen o enlace" aria-label="Compartir esta idea"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="18" cy="5" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="6" cy="12" r="2.4" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="19" r="2.4" stroke="currentColor" stroke-width="1.8"/><path d="M8.1 10.8L15.9 6.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M8.1 13.2L15.9 17.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span class="idea-compartir-texto">Compartir idea</span></button>
          <span class="idea-lectura">Seleccionada para lectura</span>
          ${!esPlaylist ? `<button class="idea-eliminar" data-eliminar-idea="${i}" data-numero-idea="${escapar(idea.numero)}" data-tooltip="Eliminar esta idea de la sesión" aria-label="Eliminar idea">🗑️ Eliminar</button>` : `<span class="idea-lectura">Playlist</span>`}
        </div>
      </div>
    `;

    div.addEventListener("toggle", () => {
      if (!div.open) return;
      $$(".idea").forEach(o => { if (o !== div) o.open = false; });
      // Si el acordeón lo abrió la propia cadena (el evento toggle también
      // se dispara con cambios programáticos), no detener la reproducción.
      seleccionarIdea(i, false, false, !Estado.reproduciendoCadena);
    });
    div.querySelector("summary").addEventListener("click", () => {
      seleccionarIdea(i, false, false);
    });
    const btnFavoritaIdea = div.querySelector("[data-favorita-idea]");
    if (btnFavoritaIdea) btnFavoritaIdea.addEventListener("click", e => {
      e.stopPropagation();
      alternarFavoritaActual(i);
    });
    const btnEliminarIdea = div.querySelector("[data-eliminar-idea]");
    if (btnEliminarIdea) btnEliminarIdea.addEventListener("click", e => {
      e.stopPropagation();
      eliminarIdeaDeSesion(i);
    });
    lista.appendChild(div);
  });

  const retomarEn = (!sesion.esPlaylist && Number.isInteger(sesion.ultimoConsejo) &&
    sesion.ultimoConsejo > 0 && sesion.ultimoConsejo < (sesion.ideas || []).length)
    ? sesion.ultimoConsejo : 0;
  seleccionarIdea(retomarEn, retomarEn > 0);
  if (retomarEn > 0) setTimeout(() => toast("Continúas donde ibas: idea " + (retomarEn + 1) + " ▶"), 500);
  if (typeof agregarAvisoEtico === "function") agregarAvisoEtico(sesion); // A1
  if (typeof recalcularDuraciones === "function") recalcularDuraciones();
  actualizarSelectorModo();
  ir("sesion");
}

function escapar(t) {
  const d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function textoCorto(t, n = 90) {
  const limpio = String(t || "").replace(/\s+/g, " ").trim();
  return limpio.length > n ? limpio.slice(0, n - 1) + "…" : limpio;
}
function saludoCompacto(sesion) {
  const nombre = sesion?.destinatario?.nombre || sesion?.usuario || Estado.perfil.nombre || "";
  const tema = sesion?.tema || "tu lectura";
  if (sesion?.tipoEntrada === "situacion" && sesion?.destinatario?.nombre) {
    return `Hola, ${sesion.destinatario.nombre}. Esta lectura está preparada para acompañarte con calma. Puedes escucharla o leerla a tu ritmo.`;
  }
  return `Hola${nombre ? ", " + nombre : ""}. Aquí tienes ${tema}. Puedes escucharla o leerla a tu ritmo.`;
}

function actualizarSelectorModo() {
  const modo = Estado.sesionActual?.modo || "ambas";
  $$("#selector-modo-sesion [data-modo-sesion]").forEach(btn => {
    btn.classList.toggle("seleccionado", btn.dataset.modoSesion === modo);
  });
}

function cambiarModoSesion(modo) {
  const s = Estado.sesionActual;
  if (!s || !["directas", "adaptadas", "ambas", "accion"].includes(modo)) return;
  const indice = Estado.ideaActual || 0;
  s.modo = modo;
  s.capaLectura = modo;
  if (!s.esPlaylist) Biblioteca.guardarSesion(s);
  abrirSesion(s);
  seleccionarIdea(Math.min(indice, (s.ideas || []).length - 1), false);
  const nombres = { directas: "Neto", adaptadas: "Contexto", ambas: "Ambos", accion: "Acción" };
  toast("Modo: " + nombres[modo]);
}


function eliminarIdeaDeSesion(indice) {
  const s = Estado.sesionActual;
  const idea = s?.ideas?.[indice];
  if (!s || !idea) return;
  if (s.esPlaylist) { toast("La playlist es temporal. Elimina desde la sesión original."); return; }

  const muestra = textoCorto(idea.frase_memorable || idea.adaptada || idea.directa || `Idea ${indice + 1}`);
  if (!confirm(`¿Eliminar esta idea de la sesión?\n\n${muestra}`)) return;

  AudioVoz.detener();
  actualizarBotonPlay(false);
  const actualizada = Biblioteca.eliminarIdea(s.id, idea.numero, indice);

  if (!actualizada || !(actualizada.ideas || []).length) {
    if (s.id) Biblioteca.eliminarSesion(s.id);
    Estado.sesionActual = null;
    toast("Idea eliminada. La sesión quedó vacía y también se eliminó.");
    ir("biblioteca");
    return;
  }

  Estado.sesionActual = actualizada;
  abrirSesion(actualizada);
  seleccionarIdea(Math.min(indice, actualizada.ideas.length - 1), false);
  toast("Idea eliminada de la biblioteca.");
}

function seleccionarIdea(i, desplazar = true, abrirAcordeon = true, detenerAudio = true) {
  const ideas = Estado.sesionActual?.ideas || [];
  if (!ideas.length) return;
  Estado.ideaActual = Math.max(0, Math.min(i, ideas.length - 1));
  $$(".idea").forEach(el => el.classList.remove("actual"));
  const el = document.querySelector(`.idea[data-indice="${Estado.ideaActual}"]`);
  if (el) {
    el.classList.add("actual");
    if (abrirAcordeon && "open" in el) {
      $$(".idea").forEach(o => { if (o !== el) o.open = false; });
      el.open = true;
    }
    if (desplazar) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  const etiquetaActiva = etiquetaElementoSesion(Estado.sesionActual, Estado.ideaActual);
  const contadorLegible = etiquetaActiva + " de " + ideas.length;
  $("#rep-contador").textContent = (Estado.ideaActual + 1) + "/" + ideas.length;
  $("#rep-contador").setAttribute("title", contadorLegible);
  $("#rep-contador").setAttribute("aria-label", contadorLegible);
  const idea = ideas[Estado.ideaActual];
  sincronizarBotonesFavorita?.(!!idea.favorita);
  actualizarMiniBarraGlobal?.();
  if (detenerAudio) {
    Estado.reproduciendoCadena = false;
    AudioVoz.detener();
    actualizarBotonPlay(false);
  }
}

function actualizarBotonPlay(sonando) {
  const btn = $("#rep-play");
  if (btn) {
    btn.textContent = sonando ? "⏸" : "▶";
    btn.classList.toggle("sonando", sonando);
  }
  if ($("#rep-estado")) $("#rep-estado").textContent = sonando ? "Escuchando…" : "Listo para escuchar";
  actualizarMiniBarraGlobal?.();
}

/* Reproductor */
function textoEstadoReproduccion() {
  const s = Estado.sesionActual;
  const total = s?.ideas?.length || 0;
  return total ? `Escuchando ${Estado.ideaActual + 1} de ${total}…` : "Escuchando…";
}

function detenerCadena() {
  Estado.reproduciendoCadena = false;
  AudioVoz.detener();
  actualizarBotonPlay(false);
}

function reproducirCadenaDesde(indiceInicio = 0) {
  const s = Estado.sesionActual;
  const ideas = s?.ideas || [];
  if (!ideas.length) return;

  Estado.miniPlayerActivo = true;
  Estado.reproduciendoCadena = true;
  actualizarBotonPlay(true);

  // 🔀 Modo aleatorio: recorre TODAS las ideas sin repetir, en orden barajado
  const yaReproducidas = new Set();
  const siguienteAleatoria = () => {
    const pendientes = ideas.map((_, i) => i).filter(i => !yaReproducidas.has(i));
    if (!pendientes.length) return ideas.length; // fin
    return pendientes[Math.floor(Math.random() * pendientes.length)];
  };

  const paso = indice => {
    if (!Estado.reproduciendoCadena) return;
    if (indice >= ideas.length) {
      Estado.reproduciendoCadena = false;
      actualizarBotonPlay(false);
      $("#rep-estado").textContent = s.esPlaylist ? "Playlist terminada" : "Sesión terminada";
      if (s.guion_audio_cierre && !s.esPlaylist) {
        setTimeout(() => {
          if (!Estado.reproduciendoCadena && !AudioVoz.sonando) toast("Lectura completa ✅");
        }, 250);
      }
      return;
    }

    seleccionarIdea(indice, true, true, false);
    actualizarBotonPlay(true);
    $("#rep-estado").textContent = textoEstadoReproduccion();

    const idea = ideas[indice];
    // v0.7: registrar escucha (racha B3, estadísticas C4, repaso B2)
    Biblioteca.registrarDiaEscucha();
    Biblioteca.registrarConsejoEscuchado();
    Biblioteca.marcarEscuchada(idea._claveRepaso || (s.esPlaylist ? "" : s.id + ":" + idea.numero));
    if (!s.esPlaylist) Biblioteca.guardarProgreso(s.id, indice);
    yaReproducidas.add(indice);
    const texto = AudioVoz.capsula(idea, indice, s.modo, s.destinatario?.nombre || s.usuario || Estado.perfil.nombre || "");
    AudioVoz.hablar(texto, () => {
      if (!Estado.reproduciendoCadena) return;
      const proxima = Estado.aleatorio ? siguienteAleatoria() : indice + 1;
      setTimeout(() => paso(proxima), 520);
    });
  };

  paso(Math.max(0, Math.min(indiceInicio, ideas.length - 1)));
}

$("#rep-play").addEventListener("click", () => {
  const s = Estado.sesionActual;
  if (!s) return;
  if (AudioVoz.sonando || Estado.reproduciendoCadena) {
    detenerCadena();
    $("#rep-estado").textContent = "En pausa · retomas en la idea " + (Estado.ideaActual + 1);
    return;
  }
  // Play normal: reproduce en cadena todos los consejos de la sesión actual desde el seleccionado.
  reproducirCadenaDesde(Estado.ideaActual);
});
$("#rep-siguiente").addEventListener("click", () => seleccionarIdea(Estado.ideaActual + 1));
$("#rep-anterior").addEventListener("click", () => seleccionarIdea(Estado.ideaActual - 1));
$("#selector-modo-sesion")?.addEventListener("click", e => {
  const btn = e.target.closest("[data-modo-sesion]");
  if (!btn) return;
  cambiarModoSesion(btn.dataset.modoSesion);
});

/* Velocidad de la voz (0.8× · 1× · 1.2× · 1.5×) */
function pintarVelocidad() {
  $("#rep-velocidad").textContent = String(AudioVoz.velocidad).replace(".", ",") + "×";
}
$("#rep-velocidad").addEventListener("click", () => {
  const estabaSonando = AudioVoz.sonando || Estado.reproduciendoCadena;
  const indice = Estado.ideaActual;
  AudioVoz.siguienteVelocidad();
  pintarVelocidad();
  toast("Velocidad: " + AudioVoz.velocidad + "×");
  if (estabaSonando) {
    detenerCadena();
    setTimeout(() => reproducirCadenaDesde(indice), 180);
  }
});
pintarVelocidad();

/* Descargar guion (.txt): función retirada del reproductor principal para compactar la tarjeta. */
/* rep-guion retirado: el guion vive en "Preparar audio" (v0.10.28) */

/* Descargar MP3 interno retirado: usar “Preparar audio” para guion externo. */
$("#rep-mp3")?.classList.add("oculto");
$("#rep-mp3").addEventListener("click", async () => {
  if (!Estado.sesionActual) return;
  $("#rep-estado").textContent = "Generando audio…";
  try {
    await AudioVoz.descargarMP3(Estado.sesionActual, true, Estado.ideaActual);
    toast("Audio descargado 🎧");
  } catch {
    toast("No pude generar el audio. Revisa el servicio de voz.");
  }
  $("#rep-estado").textContent = "Listo para escuchar";
});


function datosFavoritaActual(indice = Estado.ideaActual) {
  const s = Estado.sesionActual;
  const idea = s?.ideas?.[indice];
  if (!s || !idea) return null;
  const idSesion = s.esPlaylist ? idea._origenSesionId : s.id;
  const numeroIdea = s.esPlaylist ? idea._origenNumero : idea.numero;
  if (!idSesion || numeroIdea === undefined || numeroIdea === null) return null;
  return { s, idea, idSesion, numeroIdea, indice };
}

function sincronizarBotonesFavorita(fav = null) {
  const s = Estado.sesionActual;
  const idea = s?.ideas?.[Estado.ideaActual];
  const valor = fav !== null ? !!fav : !!idea?.favorita;
  const habilitada = !!datosFavoritaActual();
  const pintar = btn => {
    if (!btn) return;
    btn.textContent = valor ? "★" : "☆";
    btn.classList.toggle("activo", valor);
    btn.disabled = !habilitada;
    btn.setAttribute("aria-label", valor ? "Quitar favorita" : "Marcar favorita");
    btn.dataset.tooltip = habilitada
      ? (valor ? "Quitar de favoritas la tarjeta actual" : "Marcar favorita la tarjeta actual")
      : "Abre la sesión original para marcar favoritas";
  };
  pintar($("#rep-favorita"));
  pintar($("#mini-player-fav"));
  document.querySelectorAll("[data-favorita-idea]").forEach(btn => {
    const i = parseInt(btn.dataset.favoritaIdea || "-1", 10);
    const ideaBtn = s?.ideas?.[i];
    const marcada = !!ideaBtn?.favorita;
    btn.classList.toggle("activa", marcada);
    btn.textContent = (marcada ? "★" : "☆") + " Favorita";
  });
  aplicarTooltipsEscritorio?.();
}

function alternarFavoritaActual(indice = Estado.ideaActual) {
  const datos = datosFavoritaActual(indice);
  if (!datos) {
    toast("Abre la sesión original para marcar favoritas.");
    return;
  }
  const fav = Biblioteca.alternarFavorita(datos.idSesion, datos.numeroIdea);
  datos.idea.favorita = fav;
  // Si la idea viene de una playlist/repaso, actualizar la copia temporal actual.
  if (datos.s.esPlaylist) {
    const actual = datos.s.ideas?.[indice];
    if (actual) actual.favorita = fav;
  }
  // Si es la sesión original, mantener la copia en memoria sincronizada.
  if (!datos.s.esPlaylist && Array.isArray(datos.s.ideas_todas)) {
    const original = datos.s.ideas_todas.find(i => String(i.numero) === String(datos.numeroIdea));
    if (original) original.favorita = fav;
  }
  const el = document.querySelector(`.idea[data-indice="${indice}"]`);
  if (el) el.classList.toggle("favorita", fav);
  if (indice === Estado.ideaActual) sincronizarBotonesFavorita(fav);
  else sincronizarBotonesFavorita();
  pintarHoy?.();
  toast(fav ? "Guardada en favoritas ★" : "Quitada de favoritas");
}

$("#rep-favorita").addEventListener("click", () => alternarFavoritaActual());

/* ─────────── Compartir: tarjeta, imagen, enlace ───────────
   Regla de privacidad: entre usuarios SOLO viajan las capas
   neutras del consejo (directa, práctico, frase). La versión
   "adaptada" es íntima del emisor y nunca se comparte. */

function consejoNeutro() {
  const s = Estado.sesionActual;
  if (!s) return null;
  const idea = s.ideas[Estado.ideaActual];
  const MODOS = { directas: "Neto", adaptadas: "Contexto", ambas: "Neto + Contexto", accion: "Acción" };
  return {
    v: 1,
    n: Estado.ideaActual + 1,
    modo: MODOS[s.modo] || "Neto",
    frase: idea.frase_memorable || "",
    directa: idea.directa || "",
    practico: idea.consejo_practico || "",
    titulo: s.alias || s.titulo_sesion || "",
    tema: s.tema || "",
    fuente: (s.fuentes && s.fuentes[0]) || ""
  };
}

function textoCompartir(c) {
  // Con la misma estructura de la tarjeta visual
  const lineas = ["✦ IDEA PARA HOY ✦", ""];
  lineas.push(`❝ ${c.frase || c.directa} ❞`, "");
  if (c.n) lineas.push(`IDEA ${c.n}${c.modo ? " · " + c.modo.toUpperCase() : ""}`);
  if (c.tema) lineas.push("📖 " + c.tema);
  if (c.titulo) lineas.push("🌿 " + c.titulo);
  if (c.practico) lineas.push("", "Haz: " + c.practico);
  lineas.push("", "📖 Voz de los Libros · Ideas que te acompañan");
  const enlace = enlaceConsejo(c);
  if (enlace) lineas.push(enlace);
  return lineas.join("\n");
}

/* Enlace con el consejo codificado dentro (sin servidor) */
function enlaceConsejo(c) {
  if (location.protocol === "file:") return "";
  try {
    const json = JSON.stringify(c);
    const b64 = btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return location.origin + location.pathname + "#c=" + b64;
  } catch { return ""; }
}
function decodificarConsejo(hash) {
  try {
    const b64 = hash.replace(/^#c=/, "").replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch { return null; }
}

function abrirTarjetaConsejoActual() {
  const c = consejoNeutro();
  if (!c) return;
  $("#tarjeta-texto").textContent = textoCorto(c.frase || c.directa, 135);
  $("#tarjeta-titulo").textContent = c.titulo || "Una idea para caminar mejor";
  $("#tarjeta-fuente").textContent = "";
  $("#modal-tarjeta").classList.remove("oculto");
}
$("#rep-compartir")?.addEventListener("click", abrirTarjetaConsejoActual);
$("#btn-cerrar-tarjeta").addEventListener("click", () => $("#modal-tarjeta").classList.add("oculto"));

$("#btn-copiar-tarjeta").addEventListener("click", async () => {
  const c = consejoNeutro();
  try { await navigator.clipboard.writeText(textoCompartir(c)); toast("Texto copiado ✅"); }
  catch { toast("No pude copiar. Selecciona el texto manualmente."); }
});

$("#btn-enlace-consejo").addEventListener("click", async () => {
  const c = consejoNeutro();
  const enlace = enlaceConsejo(c);
  if (!enlace) { toast("Los enlaces requieren la app publicada (https)."); return; }
  try { await navigator.clipboard.writeText(enlace); toast("Enlace copiado: quien lo abra podrá adaptar el consejo a su vida 🔗"); }
  catch { toast("No pude copiar el enlace."); }
});

$("#btn-compartir-nativo").addEventListener("click", async () => {
  const c = consejoNeutro();
  const texto = textoCompartir(c);
  if (navigator.share) {
    try {
      // Intentar compartir con imagen si el sistema lo permite
      const blob = await tarjetaPNG(c);
      const archivo = new File([blob], "voz-de-los-libros.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
        await navigator.share({ files: [archivo], text: texto });
      } else {
        await navigator.share({ text: texto });
      }
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // el usuario canceló
    }
  }
  // Sin API nativa (escritorio): copiar el texto
  try { await navigator.clipboard.writeText(texto); toast("Texto copiado, listo para pegar ✅"); }
  catch { toast("Usa los botones Imagen, Enlace o Texto."); }
});

$("#btn-descargar-tarjeta").addEventListener("click", async () => {
  const c = consejoNeutro();
  const blob = await tarjetaPNG(c);
  descargarBlob(blob, "voz-de-los-libros-consejo.png");
  toast("Imagen descargada 🖼");
});

/* Tarjeta como imagen (1080×1350, compacta para WhatsApp/Instagram) */
async function tarjetaPNG(c) {
  try {
    await document.fonts.load('600 64px Inter');
    await document.fonts.load('600 30px Inter');
  } catch {}
  const W = 1080, H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const x = cv.getContext("2d");

  const ORO = "#E3C98B", ORO_SUAVE = "rgba(227,201,139,.55)", VERDE_CLARO = "#A9E7C9", CREMA = "#F6FBF7";

  /* Fondo: verde profundo con brillo esmeralda arriba a la derecha */
  const g = x.createLinearGradient(0, H, W * .85, 0);
  g.addColorStop(0, "#0A2E22");
  g.addColorStop(.55, "#11614A");
  g.addColorStop(1, "#1E9E76");
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  const brillo = x.createRadialGradient(W * .82, H * .16, 40, W * .82, H * .16, 520);
  brillo.addColorStop(0, "rgba(120,230,180,.28)");
  brillo.addColorStop(1, "rgba(120,230,180,0)");
  x.fillStyle = brillo; x.fillRect(0, 0, W, H);

  /* Marco dorado fino */
  x.strokeStyle = ORO_SUAVE; x.lineWidth = 2;
  redondeado(x, 38, 38, W - 76, H - 76, 34); x.stroke();

  /* Aros y destellos decorativos */
  x.lineWidth = 1.6;
  [[W - 90, 150, 130], [W - 40, 300, 210], [140, 260, 90], [W - 130, H - 180, 150], [120, H - 130, 100]].forEach(([cx, cy, r], i) => {
    x.strokeStyle = i % 2 ? "rgba(227,201,139,.30)" : "rgba(255,255,255,.14)";
    x.beginPath(); x.arc(cx, cy, r, 0, 7); x.stroke();
  });
  const destello = (cx, cy, r, color) => {
    x.fillStyle = color;
    x.beginPath();
    x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy);
    x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy);
    x.quadraticCurveTo(cx, cy, cx, cy - r); x.fill();
  };
  [[170, 190, 9], [W - 210, 120, 7], [W - 150, H - 300, 10], [220, H - 260, 7], [W - 320, 240, 5]].forEach(([a, b, r]) => destello(a, b, r, "rgba(240,220,170,.85)"));
  [[130, 420, 3], [W - 100, 480, 3], [90, H - 420, 3], [W - 240, H - 140, 3]].forEach(([a, b, r]) => {
    x.fillStyle = "rgba(255,255,255,.5)"; x.beginPath(); x.arc(a, b, r, 0, 7); x.fill();
  });

  /* Ramas de hojas: izquierda (relleno tenue) y derecha (trazo dorado) */
  const hoja = (cx, cy, largo, ang, estilo) => {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.beginPath();
    x.moveTo(0, 0);
    x.quadraticCurveTo(largo * .5, -largo * .38, largo, 0);
    x.quadraticCurveTo(largo * .5, largo * .38, 0, 0);
    if (estilo === "lleno") { x.fillStyle = "rgba(150,220,185,.16)"; x.fill(); }
    else { x.strokeStyle = "rgba(227,201,139,.5)"; x.lineWidth = 2; x.stroke(); }
    x.restore();
  };
  // tallo izquierdo
  x.strokeStyle = "rgba(150,220,185,.25)"; x.lineWidth = 3;
  x.beginPath(); x.moveTo(40, H * .62); x.quadraticCurveTo(150, H * .5, 210, H * .38); x.stroke();
  [[70, H * .58, 74, -0.9], [110, H * .52, 82, -0.4], [150, H * .47, 78, -1.1], [185, H * .42, 70, -0.5]].forEach(([a, b, l, r]) => hoja(a, b, l, r, "lleno"));
  // tallo derecho dorado
  x.strokeStyle = "rgba(227,201,139,.4)"; x.lineWidth = 2;
  x.beginPath(); x.moveTo(W - 40, H * .72); x.quadraticCurveTo(W - 150, H * .6, W - 200, H * .5); x.stroke();
  [[W - 80, H * .68, 70, 2.3], [W - 125, H * .62, 76, 2.8], [W - 165, H * .56, 68, 2.2]].forEach(([a, b, l, r]) => hoja(a, b, l, r, "trazo"));

  x.textAlign = "center";

  /* Emblema superior: círculo dorado con hoja */
  const eY = 130;
  x.strokeStyle = ORO_SUAVE; x.lineWidth = 2;
  x.beginPath(); x.arc(W / 2, eY, 34, 0, 7); x.stroke();
  x.beginPath(); x.moveTo(W / 2 - 220, eY); x.lineTo(W / 2 - 60, eY); x.moveTo(W / 2 + 60, eY); x.lineTo(W / 2 + 220, eY); x.stroke();
  x.save(); x.translate(W / 2, eY + 10); x.rotate(-0.6); hoja(0, 0, 34, 0, "lleno"); x.restore();
  x.fillStyle = VERDE_CLARO; x.font = '24px Inter, sans-serif'; x.fillText("🌿", W / 2, eY + 9);

  /* Eyebrow dorado espaciado */
  x.fillStyle = ORO;
  x.font = '600 34px Inter, sans-serif';
  x.fillText("✦   I D E A   P A R A   H O Y   ✦", W / 2, 218);

  /* Comilla grande */
  x.fillStyle = VERDE_CLARO;
  x.font = '700 150px Inter, sans-serif';
  x.fillText("❝", W / 2, 360);

  /* Frase en tipografía homogénea */
  x.fillStyle = CREMA;
  const frase = c.frase || c.directa || "";
  let tam = frase.length > 190 ? 46 : frase.length > 130 ? 54 : frase.length > 80 ? 62 : 72;
  x.font = `700 ${tam}px Inter, sans-serif`;
  const lineas = ajustarLineas(x, frase, W - 230);
  const alto = tam * 1.4;
  let y = 470;
  x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = 14; x.shadowOffsetY = 3;
  lineas.forEach(l => { x.fillText(l, W / 2, y); y += alto; });
  x.shadowColor = "transparent"; x.shadowBlur = 0; x.shadowOffsetY = 0;

  y += 26;
  /* Píldora IDEA n · MODO */
  const pill = `IDEA ${c.n || 1} · ${(c.modo || "NETO").toUpperCase()}`;
  x.font = '700 30px Inter, sans-serif';
  const aw = x.measureText(pill).width + 76;
  x.strokeStyle = ORO_SUAVE; x.lineWidth = 2;
  redondeado(x, W / 2 - aw / 2, y - 34, aw, 60, 30); x.stroke();
  x.fillStyle = VERDE_CLARO; x.fillText(pill, W / 2, y + 8);

  /* Tema y sesión: envueltos en hasta 2 líneas cada uno, sin recortes */
  y += 88;
  const limiteInferior = H - 235; // no invadir el pie de marca
  const escribirEnvuelto = (texto, fuente, color, maxLineas) => {
    x.font = fuente; x.fillStyle = color;
    let lns = ajustarLineas(x, texto, W - 260);
    if (lns.length > maxLineas) {
      lns = lns.slice(0, maxLineas);
      lns[maxLineas - 1] = lns[maxLineas - 1].replace(/\s+\S*$/, "") + "…";
    }
    lns.forEach(l => {
      if (y > limiteInferior) return;
      x.fillText(l, W / 2, y);
      y += 42;
    });
  };
  if (c.tema) {
    escribirEnvuelto("📖  " + c.tema, '400 32px Inter, sans-serif', CREMA, 2);
    if (y <= limiteInferior) {
      x.fillStyle = ORO_SUAVE; x.beginPath(); x.arc(W / 2, y - 12, 4, 0, 7); x.fill();
      y += 30;
    }
  }
  if (c.titulo) {
    escribirEnvuelto("🌿  " + c.titulo, '600 32px Inter, sans-serif', VERDE_CLARO, 2);
  }

  /* Pie de marca con borde dorado */
  const pW = 520, pH = 118, pY = H - 205;
  x.fillStyle = "rgba(10,40,30,.4)";
  redondeado(x, W / 2 - pW / 2, pY, pW, pH, 26); x.fill();
  x.strokeStyle = ORO; x.lineWidth = 2;
  redondeado(x, W / 2 - pW / 2, pY, pW, pH, 26); x.stroke();
  x.fillStyle = CREMA; x.font = '700 40px Inter, sans-serif';
  x.fillText("📖 Voz de los Libros", W / 2, pY + 52);
  x.fillStyle = ORO; x.font = '600 22px Inter, sans-serif';
  x.fillText("I D E A S   Q U E   T E   A C O M P A Ñ A N", W / 2, pY + 92);

  return new Promise(res => cv.toBlob(res, "image/png"));
}

function ajustarLineas(x, texto, maxAncho) {
  const palabras = (texto || "").split(/\s+/);
  const lineas = []; let actual = "";
  palabras.forEach(p => {
    const prueba = actual ? actual + " " + p : p;
    if (x.measureText(prueba).width > maxAncho && actual) { lineas.push(actual); actual = p; }
    else actual = prueba;
  });
  if (actual) lineas.push(actual);
  return lineas;
}
function redondeado(x, px, py, w, h, r) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
}

/* ─────────── Consejo recibido por enlace ─────────── */
let consejoRecibido = null;

function revisarEnlaceEntrante() {
  if (!location.hash.startsWith("#c=")) return;
  const c = decodificarConsejo(location.hash);
  history.replaceState(null, "", location.pathname); // limpiar la URL
  if (!c || (!c.frase && !c.directa)) return;
  consejoRecibido = c;
  $("#recibido-frase").textContent = c.frase || c.directa;
  $("#recibido-detalle").textContent = c.titulo || "Consejo compartido";
  $("#recibido-fuente").textContent = c.fuente ? "📚 " + c.fuente : "";
  $("#modal-recibido").classList.remove("oculto");
}

$("#btn-recibido-cerrar").addEventListener("click", () => $("#modal-recibido").classList.add("oculto"));

$("#btn-recibido-guardar").addEventListener("click", () => {
  if (!consejoRecibido) return;
  Biblioteca.guardarRecibido(consejoRecibido);
  $("#modal-recibido").classList.add("oculto");
  toast("Guardado en 'Consejos recibidos' 🗄️");
  pintarBiblioteca();
  ir("biblioteca");
});

$("#btn-recibido-adaptar").addEventListener("click", async () => {
  if (!consejoRecibido) return;
  const c = consejoRecibido;
  const p = Estado.perfil || {};
  const prompt = `Actúa como consejero lector cálido para la app "Voz de los Libros".

Me compartieron este consejo extraído de una lectura:
- Idea: ${c.directa || c.frase}
- Haz / pregunta breve: ${c.practico || "ninguno"}
- Frase: ${c.frase || ""}
- Contexto de origen: ${c.titulo || ""}${c.fuente ? " · Fuente: " + c.fuente : ""}

MI PERFIL (adáptalo a MÍ, no a quien lo compartió):
- Nombre: ${p.nombre || "Usuario"}
- Momento vital: ${p.momento || "No especificado"}
- Temas de interés: ${valorPerfilTexto(p.temas) || "No especificados"}
- Tono preferido: ${valorPerfilTexto(p.tono) || "cercano y sencillo"}

Devuelve ÚNICAMENTE un JSON válido, sin texto extra ni markdown, con esta estructura:
{
  "usuario": "${p.nombre || "Usuario"}",
  "fecha": "AAAA-MM-DD",
  "tema": "consejo recibido y adaptado",
  "titulo_sesion": "un título breve y sugestivo",
  "fuentes": ["${(c.fuente || "Consejo compartido").replace(/"/g, "'")}"],
  "autores": [],
  "categoria_vital": "otro",
  "palabras_clave": [],
  "saludo_audio": "saludo breve presentando el consejo adaptado",
  "ideas": [{
    "numero": 1, "prioritaria": true,
    "directa": "la idea original, fiel",
    "adaptada": "la idea reescrita para mi vida, en segunda persona, con mi tono",
    "consejo_practico": "un paso concreto ajustado a mi contexto",
    "frase_memorable": "una frase breve propia"
  }],
  "guion_audio_cierre": "despedida breve"
}`;
  try { await navigator.clipboard.writeText(prompt); } catch {}
  $("#modal-recibido").classList.add("oculto");
  toast("Instrucciones copiadas ✨ Pégalas en tu IA y trae el JSON.");
  ir("json");
});

/* ─────────── Biblioteca ─────────── */
let filtroCategoriaBiblioteca = "todas";

function etiquetaCategoria(cat) {
  const c = claveCategoria(cat || "otro");
  const mapa = {
    trabajo: "Trabajo", orientacion: "Orientación", "orientacion personal": "Orientación", crianza: "Crianza",
    estudio: "Estudio", escritura: "Escritura", espiritualidad: "Espiritualidad", decision: "Decisión",
    proyecto: "Proyecto", amor: "Amor", politica: "Política", autoayuda: "Autoayuda", duelo: "Duelo", otro: "Otro"
  };
  return mapa[c] || c.charAt(0).toUpperCase() + c.slice(1);
}

function claveCategoria(cat) {
  return (cat || "otro").toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function etiquetaModoLecturaLarga(modo, tipoEntrada = "lectura") {
  if (tipoEntrada === "situacion") return "Lectura para una situación";
  if (tipoEntrada === "historia_para") return "Una historia para…";
  if (tipoEntrada === "recomendacion") return "¿Qué hay para mí?";
  return ({ ideas: "Ideas centrales", narrativa: "Narrativa resumida", historia: "Historia para comprender", academica: "Guía académica" })[modo || "ideas"] || "Lectura";
}
function etiquetaModoLecturaCorta(modo, tipoEntrada = "lectura") {
  if (tipoEntrada === "situacion") return "Situación";
  if (tipoEntrada === "historia_para") return "Historia para…";
  if (tipoEntrada === "recomendacion") return "Para mí";
  return ({ ideas: "Ideas", narrativa: "Narrativa", historia: "Historia", academica: "Académica" })[modo || "ideas"] || "Lectura";
}
function rotuloElementosSesion(sesion) {
  const modo = sesion?.modoLectura || "ideas";
  return ({ ideas: "ideas", narrativa: "escenas", historia: "escenas", academica: "conceptos" })[modo] || "tarjetas";
}
let filtroTipoBiblioteca = "todas";

function pintarFiltrosModoBiblioteca(sesiones) {
  const cont = $("#filtros-modo-biblioteca");
  if (!cont) return;
  const disponibles = new Set();
  sesiones.forEach(s => {
    const ss = normalizarSesionVista(s);
    if (ss.tipoEntrada === "situacion") disponibles.add("situacion");
    else if (ss.tipoEntrada === "historia_para") disponibles.add("historia_para");
    else disponibles.add(ss.modoLectura || "ideas");
  });
  const orden = ["ideas", "historia_para", "historia", "narrativa", "academica", "situacion"];
  const etiquetas = {
    ideas: "💡 Ideas",
    historia_para: "🌙 Historias",
    historia: "🌿 Historia",
    narrativa: "📚 Narrativa",
    academica: "🎓 Acad.",
    situacion: "🫶 Situación"
  };
  const ayudas = {
    ideas: "Ideas centrales",
    historia_para: "Historias para alguien",
    historia: "Historia para comprender",
    narrativa: "Narrativa resumida",
    academica: "Guía académica",
    situacion: "Lecturas para una situación"
  };
  cont.innerHTML = "";
  if (!sesiones.length) return;
  const todas = document.createElement("button");
  todas.className = "chip chip-tipo" + (filtroTipoBiblioteca === "todas" ? " seleccionado" : "");
  todas.textContent = "✨ Todo";
  todas.addEventListener("click", () => { filtroTipoBiblioteca = "todas"; pintarBiblioteca($("#buscador").value); });
  cont.appendChild(todas);
  orden.filter(k => disponibles.has(k)).forEach(tipo => {
    const b = document.createElement("button");
    b.className = "chip chip-tipo" + (filtroTipoBiblioteca === tipo ? " seleccionado" : "");
    b.textContent = etiquetas[tipo];
    b.dataset.tooltip = ayudas[tipo];
    b.setAttribute("aria-label", ayudas[tipo]);
    b.addEventListener("click", () => { filtroTipoBiblioteca = tipo; pintarBiblioteca($("#buscador").value); });
    cont.appendChild(b);
  });
}

function pintarFiltrosBiblioteca(sesiones) {
  const cont = $("#filtros-biblioteca");
  if (!cont) return;
  const cats = [...new Set(sesiones.map(s => claveCategoria(s.categoria_vital || "otro")))];
  const etiquetas = {
    trabajo: "💼 Trabajo", orientacion: "🧭 Orientación", crianza: "👶 Crianza", estudio: "📚 Estudio",
    escritura: "✍️ Escritura", espiritualidad: "🕊️ Espiritualidad", decision: "⚖️ Decisión", proyecto: "🚀 Proyecto",
    amor: "💚 Amor", politica: "🏛️ Política", autoayuda: "🌿 Autoayuda", duelo: "🕯️ Duelo", historias: "🌙 Historias", otro: "🌿 Otro"
  };
  cont.innerHTML = "";
  if (!sesiones.length) return;
  const todas = document.createElement("button");
  todas.className = "chip" + (filtroCategoriaBiblioteca === "todas" ? " seleccionado" : "");
  todas.textContent = "Todas";
  todas.addEventListener("click", () => { filtroCategoriaBiblioteca = "todas"; pintarBiblioteca($("#buscador").value); });
  cont.appendChild(todas);
  cats.sort().forEach(cat => {
    const b = document.createElement("button");
    b.className = "chip" + (filtroCategoriaBiblioteca === cat ? " seleccionado" : "");
    b.textContent = etiquetas[cat] || ("🌿 " + etiquetaCategoria(cat));
    b.addEventListener("click", () => { filtroCategoriaBiblioteca = cat; pintarBiblioteca($("#buscador").value); });
    cont.appendChild(b);
  });
  const crearPlaylist = document.createElement("button");
  crearPlaylist.className = "chip chip-playlist crear";
  crearPlaylist.type = "button";
  crearPlaylist.id = "btn-crear-playlist-biblioteca";
  crearPlaylist.textContent = "🎧 Crear playlist";
  crearPlaylist.dataset.tooltip = "Seleccionar sesiones de la biblioteca";
  crearPlaylist.addEventListener("click", () => iniciarSeleccionPlaylist());
  cont.appendChild(crearPlaylist);

  const playlistRapida = document.createElement("button");
  playlistRapida.className = "chip chip-playlist rapida";
  playlistRapida.type = "button";
  playlistRapida.id = "btn-playlist-rapida-biblioteca";
  playlistRapida.textContent = "⚡ Rápida";
  playlistRapida.dataset.tooltip = "Escuchar por temas, favoritos o toda la biblioteca";
  playlistRapida.addEventListener("click", mostrarModalPlaylist);
  cont.appendChild(playlistRapida);

}

function mesSesion(fecha) {
  if (!fecha) return "Sin fecha";
  const [y, m] = fecha.slice(0, 7).split("-");
  const nombres = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const i = parseInt(m, 10) - 1;
  return (nombres[i] || m) + " de " + y;
}

function fechaSesionBreve(fecha) {
  if (!fecha) return "";
  const limpio = String(fecha).slice(0, 10);
  const partes = limpio.split("-");
  if (partes.length !== 3) return limpio;
  const [y, m, d] = partes;
  return `${d}/${m}/${y.slice(-2)}`;
}

function sesionesFiltradasBiblioteca(filtro) {
  const todas = Biblioteca.buscar(filtro).map(normalizarSesionVista);
  const sesiones = todas.filter(s => {
    const coincideCategoria = filtroCategoriaBiblioteca === "todas" || claveCategoria(s.categoria_vital || "otro") === filtroCategoriaBiblioteca;
    const coincideTipo = filtroTipoBiblioteca === "todas"
      ? true
      : filtroTipoBiblioteca === "situacion"
        ? (s.tipoEntrada === "situacion")
        : (s.modoLectura || (s.tipoEntrada === "situacion" ? "historia" : "ideas")) === filtroTipoBiblioteca;
    return coincideCategoria && coincideTipo;
  });
  return { todas, sesiones };
}

let vistaBiblioteca = "sesiones";

function totalFavoritasBiblioteca(sesiones = Biblioteca.listar()) {
  return sesiones.reduce((n, s) => n + (s.ideas || []).filter(i => i.favorita).length, 0);
}

function actualizarTabsBiblioteca(todas = Biblioteca.listar()) {
  const playlists = Biblioteca.listarPlaylists?.() || [];
  const favoritas = totalFavoritasBiblioteca(todas);
  $$("[data-vista-biblioteca]").forEach(btn => {
    const activa = btn.dataset.vistaBiblioteca === vistaBiblioteca;
    btn.classList.toggle("seleccionado", activa);
    btn.setAttribute("aria-selected", activa ? "true" : "false");
  });
  const cs = $("#tab-count-sesiones"); if (cs) cs.textContent = todas.length;
  const cp = $("#tab-count-playlists"); if (cp) cp.textContent = playlists.length;
  const cf = $("#tab-count-favoritas"); if (cf) cf.textContent = favoritas;
}

function cambiarVistaBiblioteca(vista) {
  vistaBiblioteca = ["sesiones", "playlists", "favoritas"].includes(vista) ? vista : "sesiones";
  if (vistaBiblioteca !== "sesiones") {
    modoSeleccionPlaylist = false;
    sesionesPlaylistSeleccionadas.clear();
  }
  pintarBiblioteca($("#buscador")?.value || "");
}

function actualizarMemoriaVivaBiblioteca(todas = Biblioteca.listar()) {
  const caja = $("#memoria-viva-resumen");
  if (!caja) return;
  const st = Biblioteca.estadisticas();
  const playlists = Biblioteca.listarPlaylists?.().length || 0;
  const ult = (todas || []).find(s => !s.esPlaylist);
  const ultima = ult ? `Última: ${textoCorto(ult.alias || ult.titulo_sesion || "sesión", 48)}` : "Tu biblioteca aún está esperando su primera lectura.";
  caja.innerHTML = `<strong>Tu memoria viva</strong><span>${st.sesiones} lectura${st.sesiones === 1 ? "" : "s"} · ${st.favoritas} favorita${st.favoritas === 1 ? "" : "s"} · ${playlists} playlist${playlists === 1 ? "" : "s"} · ${st.consejos} escucha${st.consejos === 1 ? "" : "s"}. ${escapar(ultima)}</span>`;
}

function pintarBiblioteca(filtro) {
  const lista = $("#lista-sesiones");
  if (!lista) return;
  const { todas, sesiones } = sesionesFiltradasBiblioteca(filtro);
  actualizarMemoriaVivaBiblioteca(todas);
  actualizarTabsBiblioteca(todas);
  pintarFiltrosModoBiblioteca(todas);
  pintarFiltrosBiblioteca(todas);
  pintarPlaylistsGuardadasBiblioteca();
  pintarFavoritasBiblioteca(todas);
  actualizarPlaylistBuilderBar();

  const zonas = {
    sesiones: $("#zona-sesiones-biblioteca"),
    playlists: $("#zona-playlists-biblioteca"),
    favoritas: $("#zona-favoritas-biblioteca")
  };
  Object.entries(zonas).forEach(([clave, el]) => el?.classList.toggle("oculto", clave !== vistaBiblioteca));

  lista.innerHTML = "";
  $("#biblioteca-vacia").style.display = sesiones.length ? "none" : "flex";

  let mesActual = "";
  sesiones.forEach(s => {
    const mes = mesSesion(s.fecha || s.guardadaEl || "");
    if (mes !== mesActual) {
      mesActual = mes;
      const h = document.createElement("div");
      h.className = "biblioteca-mes";
      h.textContent = mes;
      lista.appendChild(h);
    }

    const item = document.createElement("div");
    item.className = "sesion-item" + (modoSeleccionPlaylist ? " seleccionable" : "") + (sesionesPlaylistSeleccionadas.has(s.id) ? " seleccionada" : "");
    item.dataset.sesionId = s.id;
    const favoritas = (s.ideas || []).filter(i => i.favorita).length;
    const totalGuardado = (s.ideas_todas || s.ideas || []).length;
    const totalVisibles = (s.ideas || []).length;
    const tipoLectura = etiquetaModoLecturaLarga(s.modoLectura, s.tipoEntrada);
    const transformacionCorta = ({ ideas: "Ideas", narrativa: "Narrativa", historia: "Historia", academica: "Académica" })[s.modoLectura || "ideas"] || "Lectura";
    const rotuloElementos = rotuloElementosSesion(s);
    const conteoElementos = totalGuardado && totalGuardado !== totalVisibles
      ? `${totalVisibles} de ${totalGuardado} ${rotuloElementos}`
      : `${totalVisibles} ${rotuloElementos}`;
    const primeraFuente = (s.fuentes || []).find(Boolean) || "";
    const primerAutor = (s.autores || []).find(Boolean) || "";
    const fechaBreve = fechaSesionBreve(s.fecha || s.guardadaEl || "");
    const categoriaBreve = etiquetaCategoria(s.categoria_vital);
    const metaPrincipal = [fechaBreve, categoriaBreve, conteoElementos + (favoritas ? ` · ★${favoritas}` : "")].filter(Boolean).join(" · ");
    const metaSecundaria = s.tipoEntrada === "situacion"
      ? textoCorto([s.destinatario?.nombre ? `Para ${s.destinatario.nombre}` : "", s.tema || ""].filter(Boolean).join(" · "), 110)
      : textoCorto([primeraFuente, primerAutor].filter(Boolean).join(" · ") || (s.tema || ""), 100);
    item.innerHTML = `
      <div class="sesion-cabecera">
        <span class="sesion-titulo">${escapar(s.alias || s.titulo_sesion || "Sesión")}</span>
        <span class="sesion-botones">
          <button class="sesion-renombrar" data-renombrar-sesion="${escapar(s.id)}" data-tooltip="Renombrar esta sesión (el título original se conserva)" aria-label="Renombrar sesión">✏️</button>
          <button class="sesion-eliminar" data-eliminar-sesion="${escapar(s.id)}" data-tooltip="Eliminar esta sesión completa de la biblioteca" aria-label="Eliminar sesión">🗑️</button>
        </span>
      </div>
      ${s.alias ? `<span class="sesion-subtitulo">${escapar(s.titulo_sesion || "")}</span>` : ""}
      <span class="sesion-meta sesion-meta-principal"><strong>${escapar(tipoLectura)}</strong>${metaPrincipal ? ` · ${escapar(metaPrincipal)}` : ""}</span>
      ${metaSecundaria ? `<span class="sesion-meta sesion-meta-secundaria">${escapar(metaSecundaria)}</span>` : ""}
    `;
    item.addEventListener("click", () => {
      if (bloquearClickSeleccionPlaylist) { bloquearClickSeleccionPlaylist = false; return; }
      if (modoSeleccionPlaylist) { alternarSesionPlaylist(s.id); return; }
      abrirSesion(s);
    });
    prepararGestosSeleccionPlaylist(item, s.id);
    item.querySelector("[data-renombrar-sesion]")?.addEventListener("click", e => {
      e.stopPropagation();
      const nuevo = prompt("Nuevo nombre para la sesión:", s.alias || s.titulo_sesion || "");
      if (nuevo === null) return;
      Biblioteca.renombrarSesion(s.id, nuevo.trim());
      pintarBiblioteca($("#buscador").value);
      toast(nuevo.trim() ? "Sesión renombrada ✏️" : "Nombre original restaurado");
    });
    item.querySelector("[data-eliminar-sesion]").addEventListener("click", e => {
      e.stopPropagation();
      if (!confirm(`¿Eliminar "${s.titulo_sesion || "esta sesión"}" de tu biblioteca?`)) return;
      Biblioteca.eliminarSesion(s.id);
      if (Estado.sesionActual?.id === s.id) Estado.sesionActual = null;
      toast("Sesión eliminada de la biblioteca.");
      pintarBiblioteca($("#buscador").value);
    });
    lista.appendChild(item);
  });
  aplicarTooltipsEscritorio();
}
$("#buscador").addEventListener("input", e => pintarBiblioteca(e.target.value));
$$('[data-vista-biblioteca]').forEach(btn => {
  btn.addEventListener('click', () => cambiarVistaBiblioteca(btn.dataset.vistaBiblioteca));
});

function exportarBackupBiblioteca() {
  const respaldo = Biblioteca.exportarBackup();
  const fecha = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(respaldo, null, 2)], { type: "application/json;charset=utf-8" });
  descargarBlob(blob, `voz-de-los-libros-backup-${fecha}.json`);
  Biblioteca.registrarBackupHecho(); // A2
  toast("Backup descargado ✅");
}

let categoriasPlaylistSeleccionadas = new Set();

let modoSeleccionPlaylist = false;
let sesionesPlaylistSeleccionadas = new Set();
let bloquearClickSeleccionPlaylist = false;

function iniciarSeleccionPlaylist(idInicial = null) {
  cerrarModalPlaylist?.();
  vistaBiblioteca = "sesiones";
  modoSeleccionPlaylist = true;
  if (idInicial) sesionesPlaylistSeleccionadas.add(idInicial);
  ir("biblioteca");
  setTimeout(() => {
    pintarBiblioteca($("#buscador")?.value || "");
    $("#playlist-builder-nombre")?.focus();
  }, 40);
}

function abrirBibliotecaParaPlaylist() {
  vistaBiblioteca = "playlists";
  ir("biblioteca");
  setTimeout(() => pintarBiblioteca($("#buscador")?.value || ""), 40);
}

function abrirBibliotecaCrearPlaylist() {
  vistaBiblioteca = "sesiones";
  ir("biblioteca");
  setTimeout(() => iniciarSeleccionPlaylist(), 60);
}

function cancelarSeleccionPlaylist() {
  modoSeleccionPlaylist = false;
  sesionesPlaylistSeleccionadas.clear();
  pintarBiblioteca($("#buscador")?.value || "");
}

function alternarSesionPlaylist(id) {
  if (!id) return;
  if (sesionesPlaylistSeleccionadas.has(id)) sesionesPlaylistSeleccionadas.delete(id);
  else sesionesPlaylistSeleccionadas.add(id);
  actualizarPlaylistBuilderBar();
  const selectorId = window.CSS?.escape ? CSS.escape(id) : String(id).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  document.querySelector(`[data-sesion-id="${selectorId}"]`)?.classList.toggle("seleccionada", sesionesPlaylistSeleccionadas.has(id));
}

function actualizarPlaylistBuilderBar() {
  const bar = $("#playlist-builder-bar");
  if (!bar) return;
  bar.classList.toggle("oculto", !modoSeleccionPlaylist);
  const n = sesionesPlaylistSeleccionadas.size;
  const count = $("#playlist-builder-count");
  if (count) count.textContent = n + (n === 1 ? " sesión seleccionada" : " sesiones seleccionadas");
}

function sesionesSeleccionadasPlaylist() {
  const ids = [...sesionesPlaylistSeleccionadas];
  return ids.map(id => Biblioteca.obtener(id)).filter(Boolean);
}

function escucharPlaylistPersonalizada(nombre = "Playlist personalizada") {
  const sesiones = sesionesSeleccionadasPlaylist();
  if (!sesiones.length) { toast("Selecciona al menos una sesión."); return; }
  modoSeleccionPlaylist = false;
  sesionesPlaylistSeleccionadas.clear();
  abrirPlaylistDesdeSesiones(sesiones, nombre, "selección personalizada");
}

function guardarPlaylistPersonalizada() {
  const sesiones = sesionesSeleccionadasPlaylist();
  if (!sesiones.length) { toast("Selecciona al menos una sesión."); return; }
  const input = $("#playlist-builder-nombre");
  const sugerido = "Playlist " + new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  const nombre = (input?.value || prompt("Nombre de la playlist:", sugerido) || sugerido).trim();
  const playlist = Biblioteca.guardarPlaylist({ nombre, tipo: "sesiones", sessionIds: sesiones.map(s => s.id), orden: "seleccionado" });
  if (!playlist) { toast("No pude guardar la playlist. Revisa la selección."); return; }
  modoSeleccionPlaylist = false;
  sesionesPlaylistSeleccionadas.clear();
  if (input) input.value = "";
  vistaBiblioteca = "playlists";
  pintarBiblioteca($("#buscador")?.value || "");
  pintarPlaylistsInicio?.();
  toast(`Playlist “${playlist.nombre}” guardada en Mi biblioteca → Playlists 🎧`);
}

function sesionesDePlaylist(pl) {
  return (pl?.sessionIds || []).map(id => Biblioteca.obtener(id)).filter(Boolean);
}

function abrirPlaylistGuardada(idOPlaylist) {
  const pl = typeof idOPlaylist === "string"
    ? (Biblioteca.listarPlaylists?.() || []).find(x => x.id === idOPlaylist)
    : idOPlaylist;
  if (!pl) { toast("No encontré esa playlist guardada."); return; }
  const sesionesVivas = sesionesDePlaylist(pl);
  if (!sesionesVivas.length) { toast("Esta playlist ya no tiene sesiones disponibles."); return; }
  abrirPlaylistDesdeSesiones(sesionesVivas, pl.nombre || "Playlist guardada", "playlist guardada", { playlistId: pl.id, playlistNombre: pl.nombre });
}

function renombrarPlaylistGuardada(id) {
  const pl = (Biblioteca.listarPlaylists?.() || []).find(x => x.id === id);
  if (!pl) return;
  const nuevo = prompt("Nuevo nombre para la playlist:", pl.nombre || "Playlist");
  if (nuevo === null) return;
  const nombre = nuevo.trim();
  if (!nombre) { toast("El nombre no puede quedar vacío."); return; }
  Biblioteca.renombrarPlaylist?.(id, nombre) || Biblioteca.guardarPlaylist({ ...pl, nombre });
  pintarBiblioteca($("#buscador")?.value || "");
  pintarPlaylistsInicio?.();
  toast("Playlist renombrada ✏️");
}

function eliminarPlaylistGuardada(id) {
  const pl = (Biblioteca.listarPlaylists?.() || []).find(x => x.id === id);
  if (!pl) return;
  if (!confirm(`¿Eliminar la playlist “${pl.nombre}”?\n\nNo se borrarán las sesiones originales.`)) return;
  Biblioteca.eliminarPlaylist(id);
  pintarBiblioteca($("#buscador")?.value || "");
  pintarPlaylistsInicio?.();
  toast("Playlist eliminada.");
}

function pintarPlaylistsGuardadasBiblioteca() {
  const cont = $("#playlists-guardadas-biblioteca");
  if (!cont) return;
  const playlists = Biblioteca.listarPlaylists?.() || [];
  const vacio = $("#playlists-vacias-biblioteca");
  cont.innerHTML = "";
  if (vacio) vacio.classList.toggle("oculto", playlists.length > 0);
  playlists.forEach(pl => {
    const sesionesVivas = sesionesDePlaylist(pl);
    const totalIdeas = sesionesVivas.reduce((n, s) => n + (s.ideas || []).length, 0);
    const card = document.createElement("article");
    card.className = "playlist-guardada-card";
    card.innerHTML = `
      <div class="playlist-card-icono" aria-hidden="true">🎼</div>
      <div class="playlist-card-cuerpo">
        <h3>${escapar(pl.nombre || "Playlist")}</h3>
        <p>${sesionesVivas.length} sesión${sesionesVivas.length === 1 ? "" : "es"} · ${totalIdeas} tarjeta${totalIdeas === 1 ? "" : "s"}</p>
        <small>Guardada ${escapar((pl.creadaEl || "").slice(0, 10) || "sin fecha")}</small>
      </div>
      <div class="playlist-card-acciones">
        <button type="button" class="boton-primario" data-playlist-abrir="${escapar(pl.id)}">▶ Reproducir</button>
        <button type="button" class="boton-secundario" data-playlist-editar="${escapar(pl.id)}">✏️ Editar</button>
        <button type="button" class="boton-secundario peligro" data-playlist-eliminar="${escapar(pl.id)}">Eliminar</button>
      </div>
    `;
    card.querySelector("[data-playlist-abrir]")?.addEventListener("click", () => abrirPlaylistGuardada(pl));
    card.querySelector("[data-playlist-editar]")?.addEventListener("click", () => renombrarPlaylistGuardada(pl.id));
    card.querySelector("[data-playlist-eliminar]")?.addEventListener("click", () => eliminarPlaylistGuardada(pl.id));
    cont.appendChild(card);
  });
}

function pintarFavoritasBiblioteca(sesiones = Biblioteca.listar()) {
  const cont = $("#lista-favoritas-biblioteca");
  if (!cont) return;
  const favoritas = [];
  sesiones.forEach(s => {
    (s.ideas || []).forEach((idea, indice) => {
      if (idea.favorita) favoritas.push({ sesion: s, idea, indice });
    });
  });
  cont.innerHTML = "";
  $("#favoritas-vacias-biblioteca")?.classList.toggle("oculto", favoritas.length > 0);
  favoritas.forEach(({ sesion, idea, indice }) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "favorita-biblioteca-card";
    card.innerHTML = `
      <span class="favorita-marca">★</span>
      <span><strong>${escapar(textoCorto(idea.frase_memorable || idea.adaptada || idea.directa || "Idea favorita", 90))}</strong><small>${escapar(sesion.alias || sesion.titulo_sesion || "Sesión")}</small></span>
    `;
    card.addEventListener("click", () => {
      abrirSesion(sesion);
      setTimeout(() => seleccionarIdea(indice, true, true, false), 120);
    });
    cont.appendChild(card);
  });
}

function prepararGestosSeleccionPlaylist(item, id) {
  let inicioX = 0, inicioY = 0, timer = null, largo = false;
  item.addEventListener("pointerdown", ev => {
    if (ev.target.closest("button")) return;
    inicioX = ev.clientX; inicioY = ev.clientY; largo = false;
    timer = setTimeout(() => {
      largo = true;
      bloquearClickSeleccionPlaylist = true;
      if (!modoSeleccionPlaylist) iniciarSeleccionPlaylist(id);
      else alternarSesionPlaylist(id);
    }, 520);
  });
  item.addEventListener("pointerup", ev => {
    if (timer) clearTimeout(timer);
    const dx = ev.clientX - inicioX;
    const dy = ev.clientY - inicioY;
    if (!largo && dx < -50 && Math.abs(dy) < 40) {
      bloquearClickSeleccionPlaylist = true;
      if (!modoSeleccionPlaylist) iniciarSeleccionPlaylist(id);
      else alternarSesionPlaylist(id);
    }
  });
  ["pointerleave", "pointercancel"].forEach(ev => item.addEventListener(ev, () => { if (timer) clearTimeout(timer); }));
}

$("#btn-guardar-playlist-personalizada")?.addEventListener("click", guardarPlaylistPersonalizada);
$("#btn-escuchar-playlist-personalizada")?.addEventListener("click", () => escucharPlaylistPersonalizada($("#playlist-builder-nombre")?.value.trim() || "Playlist personalizada"));
$("#btn-cancelar-playlist-personalizada")?.addEventListener("click", cancelarSeleccionPlaylist);

function etiquetaCategoriaConIcono(cat) {
  const clave = claveCategoria(cat);
  const etiquetas = {
    trabajo: "💼 Trabajo", orientacion: "🧭 Orientación", crianza: "👶 Crianza", estudio: "📚 Estudio",
    escritura: "✍️ Escritura", espiritualidad: "🕊️ Espiritualidad", decision: "⚖️ Decisión", proyecto: "🚀 Proyecto",
    amor: "💚 Amor", politica: "🏛️ Política", autoayuda: "🌿 Autoayuda", duelo: "🕯️ Duelo", historias: "🌙 Historias", otro: "🌿 Otro"
  };
  return etiquetas[clave] || ("🌿 " + etiquetaCategoria(clave));
}

function mostrarModalPlaylist() {
  cerrarDrawer?.();
  cerrarModalAudio?.();
  const modal = $("#modal-playlist");
  const cont = $("#playlist-categorias");
  if (!modal || !cont) return;

  const { sesiones } = sesionesFiltradasBiblioteca($("#buscador").value);
  const cats = [...new Set(sesiones.map(s => claveCategoria(s.categoria_vital || "otro")))].sort();
  categoriasPlaylistSeleccionadas = new Set(
    filtroCategoriaBiblioteca !== "todas" && cats.includes(filtroCategoriaBiblioteca)
      ? [filtroCategoriaBiblioteca]
      : []
  );

  cont.innerHTML = "";
  cats.forEach(cat => {
    const b = document.createElement("button");
    b.className = "chip" + (categoriasPlaylistSeleccionadas.has(cat) ? " seleccionado" : "");
    b.type = "button";
    b.dataset.playlistCat = cat;
    b.textContent = etiquetaCategoriaConIcono(cat);
    b.addEventListener("click", () => {
      if (categoriasPlaylistSeleccionadas.has(cat)) categoriasPlaylistSeleccionadas.delete(cat);
      else categoriasPlaylistSeleccionadas.add(cat);
      b.classList.toggle("seleccionado", categoriasPlaylistSeleccionadas.has(cat));
    });
    cont.appendChild(b);
  });

  modal.classList.remove("oculto");
  aplicarTooltipsEscritorio();
  actualizarMiniBarraGlobal?.();
}

function cerrarModalPlaylist() {
  $("#modal-playlist")?.classList.add("oculto");
  actualizarMiniBarraGlobal?.();
}

$("#btn-playlist-cerrar")?.addEventListener("click", cerrarModalPlaylist);
$("#btn-playlist-todo")?.addEventListener("click", () => {
  const { sesiones } = sesionesFiltradasBiblioteca($("#buscador").value);
  cerrarModalPlaylist();
  abrirPlaylistDesdeSesiones(sesiones, "Playlist completa", "toda la biblioteca");
});
$("#btn-playlist-seleccion")?.addEventListener("click", () => {
  if (!categoriasPlaylistSeleccionadas.size) {
    toast("Elige uno o varios temas para la playlist.");
    return;
  }
  const { sesiones } = sesionesFiltradasBiblioteca($("#buscador").value);
  const seleccion = sesiones.filter(s => categoriasPlaylistSeleccionadas.has(claveCategoria(s.categoria_vital || "otro")));
  const nombres = [...categoriasPlaylistSeleccionadas].map(etiquetaCategoria).join(", ");
  cerrarModalPlaylist();
  abrirPlaylistDesdeSesiones(seleccion, "Playlist por tema", nombres);
});
$("#btn-playlist-aleatorio")?.addEventListener("click", () => {
  const { sesiones } = sesionesFiltradasBiblioteca($("#buscador").value);
  const base = categoriasPlaylistSeleccionadas.size
    ? sesiones.filter(s => categoriasPlaylistSeleccionadas.has(claveCategoria(s.categoria_vital || "otro")))
    : sesiones;
  cerrarModalPlaylist();
  abrirPlaylistAleatoriaPorTema(base);
});
$("#btn-playlist-favoritos")?.addEventListener("click", () => {
  // Favoritas de toda la biblioteca (las ★ marcadas por el usuario),
  // respetando los temas chuleados si hay alguno.
  const { sesiones } = sesionesFiltradasBiblioteca($("#buscador").value);
  const base = categoriasPlaylistSeleccionadas.size
    ? sesiones.filter(s => categoriasPlaylistSeleccionadas.has(claveCategoria(s.categoria_vital || "otro")))
    : sesiones;
  const ideas = [];
  base.forEach(s => {
    ideasDeSesionParaPlaylist(s).forEach(idea => {
      if (idea.favorita) ideas.push({ ...idea, numero: ideas.length + 1 });
    });
  });
  cerrarModalPlaylist();
  if (!ideas.length) {
    toast("Aún no tienes favoritas ★. Márcalas dentro de una sesión con la estrella.");
    return;
  }
  abrirSesion({
    id: "playlist-temporal",
    esPlaylist: true,
    usuario: Estado.perfil.nombre || "",
    fecha: new Date().toISOString().slice(0, 10),
    tema: "tus consejos favoritos",
    titulo_sesion: "Playlist de favoritos ★",
    fuentes: [ideas.length + " consejos marcados con estrella"],
    categoria_vital: "otro",
    saludo_audio: "Estos son los consejos que marcaste como favoritos. Una secuencia con lo que más te ha hablado.",
    ideas,
    ideas_todas: ideas,
    modo: "directas",
    guion_audio_cierre: "Fin de tus favoritos. Puedes volver a la biblioteca cuando quieras."
  });
  toast("Playlist de favoritos: " + ideas.length + " consejos ▶");
});

function ideasDeSesionParaPlaylist(sesion) {
  return (sesion.ideas || []).map(idea => ({
    ...idea,
    directa: idea.directa || idea.frase_memorable || idea.adaptada || "",
    frase_memorable: idea.frase_memorable || sesion.titulo_sesion || "",
    origen: sesion.titulo_sesion || sesion.tema || "Sesión",
    categoria_origen: claveCategoria(sesion.categoria_vital || "otro"),
    _origenSesionId: sesion.id,
    _origenNumero: idea.numero
  }));
}

function abrirPlaylistDesdeSesiones(sesiones, titulo, tema, meta = {}) {
  const ideas = [];
  sesiones.forEach(s => {
    ideasDeSesionParaPlaylist(s).forEach(idea => {
      ideas.push({ ...idea, numero: ideas.length + 1 });
    });
  });
  if (!ideas.length) { toast("No hay consejos para reproducir con esa selección."); return; }
  abrirSesion({
    id: "playlist-temporal",
    esPlaylist: true,
    playlistGuardadaId: meta.playlistId || undefined,
    playlistGuardadaNombre: meta.playlistNombre || undefined,
    usuario: Estado.perfil.nombre || "jose",
    fecha: new Date().toISOString().slice(0, 10),
    tema,
    titulo_sesion: titulo,
    fuentes: [sesiones.length + " sesiones"],
    categoria_vital: "otro",
    saludo_audio: "Playlist lista. Escucharás una secuencia continua de consejos de tu biblioteca.",
    ideas,
    ideas_todas: ideas,
    modo: "directas",
    guion_audio_cierre: "Fin de la playlist. Puedes volver a la biblioteca y cambiar la selección."
  });
  toast("Playlist lista: " + ideas.length + " consejos ▶");
}

function abrirPlaylistAleatoriaPorTema(sesiones) {
  // Agrupar TODOS los consejos por tema
  const grupos = new Map();
  sesiones.forEach(s => {
    const cat = claveCategoria(s.categoria_vital || "otro");
    const arr = grupos.get(cat) || [];
    arr.push(...ideasDeSesionParaPlaylist(s));
    grupos.set(cat, arr);
  });

  const barajar = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Barajar el contenido de cada tema y el orden de los temas
  const categorias = barajar([...grupos.keys()].filter(c => (grupos.get(c) || []).length));
  categorias.forEach(c => barajar(grupos.get(c)));
  if (!categorias.length) { toast("No hay temas con consejos para reproducir."); return; }

  // Ronda entrelazada: un consejo de cada tema por ciclo,
  // hasta agotar TODOS los consejos de TODOS los temas elegidos.
  const ideas = [];
  let quedan = true;
  while (quedan) {
    quedan = false;
    categorias.forEach(cat => {
      const arr = grupos.get(cat);
      if (!arr.length) return;
      const elegida = arr.pop(); // ya vienen barajados
      ideas.push({
        ...elegida,
        numero: ideas.length + 1,
        frase_memorable: elegida.frase_memorable || etiquetaCategoria(cat),
        origen: (elegida.origen ? elegida.origen + " · " : "") + etiquetaCategoriaConIcono(cat)
      });
      if (arr.length) quedan = true;
    });
  }

  abrirSesion({
    id: "playlist-aleatoria-temporal",
    esPlaylist: true,
    usuario: Estado.perfil.nombre || "",
    fecha: new Date().toISOString().slice(0, 10),
    tema: "ronda aleatoria por temas",
    titulo_sesion: "Ronda por temas 🎲",
    fuentes: [ideas.length + " consejos de " + categorias.length + " tema" + (categorias.length === 1 ? "" : "s") + ", entrelazados al azar"],
    categoria_vital: "otro",
    saludo_audio: "Ronda aleatoria lista. Escucharás todos los consejos de los temas elegidos, alternando un tema y otro, en orden sorpresa.",
    ideas,
    ideas_todas: ideas,
    modo: "directas",
    guion_audio_cierre: "Fin de la ronda por temas. Cada vez que la generes, el orden será distinto."
  });
  toast("Ronda por temas: " + ideas.length + " consejos de " + categorias.length + " temas 🎲");
}

function crearPlaylistAutomaticaPorIntencion() {
  const sesiones = Biblioteca.listar().filter(s => !s.esPlaylist && (s.ideas || []).length);
  if (!sesiones.length) { toast("Aún no hay lecturas para agrupar por intención."); ir("tipo-lectura"); return; }

  const grupos = new Map();
  sesiones.forEach(s => {
    const cat = claveCategoria(s.categoria_vital || s.intencion || s.tema || "otro");
    if (!grupos.has(cat)) grupos.set(cat, []);
    grupos.get(cat).push(s);
  });
  const ordenados = [...grupos.entries()]
    .filter(([, arr]) => arr.length)
    .sort((a, b) => b[1].length - a[1].length || etiquetaCategoria(a[0]).localeCompare(etiquetaCategoria(b[0]), "es"));
  if (!ordenados.length) { toast("No encontré una intención dominante todavía."); return; }

  const [cat, grupo] = ordenados[0];
  const nombre = "Intención · " + etiquetaCategoria(cat);
  const playlist = Biblioteca.guardarPlaylist({
    nombre,
    tipo: "intencion",
    sessionIds: grupo.map(s => s.id),
    orden: "categoria"
  });
  if (!playlist) { toast("No pude crear la playlist automática."); return; }
  vistaBiblioteca = "playlists";
  pintarBiblioteca($("#buscador")?.value || "");
  pintarPlaylistsInicio?.();
  abrirPlaylistGuardada(playlist);
  toast(`Playlist automática: ${nombre} 🎼`);
}

/* ─────────── Ayuda por pantalla, tooltips PC y dictado ─────────── */
const AYUDAS_PANTALLA = {
  "p-perfil": "Aquí defines tu identidad estable: nombre, momento vital, temas, historias, autores y tono. La necesidad concreta cambia en cada nueva lectura.",
  "p-intencion": "Aquí eliges lo que necesitas hoy. Esta intención orienta la extracción de ideas y evita que el perfil tenga que cambiar todo el tiempo.",
  "p-fuentes": "Aquí escribes libros, textos, autores o corrientes. Si tienes archivos, los cargarás en la IA cuando pegues las instrucciones.",
  "p-situacion": "Aquí separas solicitante y destinatario. La lectura se dirige a quien realmente va a escuchar.",
  "p-historia-para": "Aquí puedes crear, mejorar o continuar una historia sin formularios largos. Lo central es destinatario, argumento, referentes, enseñanza y tono.",
  "p-config": "Aquí eliges modo, cantidad y forma de escucha: Neto, Contexto, Ambos o Acción. En Historia puedes añadir tipo de historia opcional.",
  "p-prompt": "Copia las instrucciones, abre una IA desde el hub y pega luego el JSON que te devuelva.",
  "p-json": "Pega aquí el JSON que devuelve la IA. Si trae texto alrededor, la app intentará extraer el objeto JSON central.",
  "p-sesion": "Puedes cambiar entre idea central, contexto, ambos o acción práctica. La tarjeta activa se resalta y el lector no lee rótulos visuales.",
  "p-biblioteca": "Esta es tu memoria viva: sesiones, favoritas, playlists y repasos breves. Puedes buscar, filtrar o crear recorridos por intención.",
  "p-configuracion": "Aquí viven funciones locales: Backup, Importar, Manual, Tema, Perfil, Ayuda, borrar datos y volver al inicio. Sin nube, sin PDF, sin API interna, sin Word y sin cámara."
};

function prepararAyudasPantalla() {
  Object.keys(AYUDAS_PANTALLA).forEach(id => {
    const sec = document.getElementById(id);
    const cab = sec?.querySelector(".cabecera");
    if (!cab || cab.querySelector(".btn-ayuda")) return;
    const b = document.createElement("button");
    b.className = "btn-ayuda";
    b.type = "button";
    b.textContent = "?";
    b.setAttribute("aria-label", "Explicar esta pantalla");
    b.dataset.ayudaPantalla = id;
    b.dataset.tooltip = "Explicar esta pantalla";
    cab.appendChild(b);
  });
}

function mostrarAyudaPantalla(id) {
  const sec = document.getElementById(id);
  const cont = sec?.querySelector(".contenido");
  if (!cont) return;
  const existente = cont.querySelector(".ayuda-panel");
  if (existente) { existente.remove(); return; }
  const panel = document.createElement("div");
  panel.className = "ayuda-panel";
  panel.textContent = AYUDAS_PANTALLA[id] || "Esta pantalla reúne acciones de la app.";
  cont.prepend(panel);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-ayuda-pantalla]");
  if (b) mostrarAyudaPantalla(b.dataset.ayudaPantalla);
});

function aplicarTooltipsEscritorio() {
  const escritorio = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  document.querySelectorAll("[title]").forEach(el => {
    if (!el.dataset.tooltip) el.dataset.tooltip = el.getAttribute("title");
    el.removeAttribute("title");
  });
  document.querySelectorAll("[data-tooltip]").forEach(el => {
    if (escritorio) el.setAttribute("title", el.dataset.tooltip);
    else el.removeAttribute("title");
  });
}

const DictadoVoz = {
  reconocimiento: null,
  activo: false,
  boton: null,
  campo: null,
  ultimoTexto: "",
  ultimoInsertado: "",
  reinicios: 0,
  reiniciosMax: 2,
  manualStop: false,
  inicioMs: 0,
  finTimer: null,

  soportado() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },

  mensajeError(error) {
    const e = (error || "").toString().toLowerCase();
    if (e.includes("not-allowed") || e.includes("permission")) return "Permiso de micrófono denegado. Actívalo en el navegador.";
    if (e.includes("no-speech")) return "No escuché voz. Acerca el micrófono e intenta de nuevo.";
    if (e.includes("network")) return "El dictado del navegador necesita conexión estable.";
    if (e.includes("audio-capture")) return "No encontré micrófono activo en este dispositivo.";
    return "El dictado se detuvo. Puedes tocar el micrófono otra vez.";
  },

  async pedirPermisoMicrofono() {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      return true;
    } catch (e) {
      toast(this.mensajeError(e?.name || e?.message));
      return false;
    }
  },

  prepararBoton(escuchando) {
    if (!this.boton) return;
    this.boton.classList.toggle("dictando", escuchando);
    this.boton.setAttribute("aria-pressed", escuchando ? "true" : "false");
    this.boton.textContent = escuchando ? "■" : "🎙";
    this.boton.dataset.tooltip = escuchando ? "Toca para detener y pegar el dictado" : "Dictar con micrófono";
    aplicarTooltipsEscritorio?.();
  },

  configurarReconocimiento() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SpeechRecognition();
    r.lang = localStorage.getItem("vozlibros_dictado_lang") || "es-CO";
    r.interimResults = true;
    r.continuous = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      this.activo = true;
      this.inicioMs = Date.now();
      this.prepararBoton(true);
      toast(this.reinicios ? "Sigo escuchando…" : "Escuchando… habla con calma.");
    };

    r.onresult = ev => {
      const partes = [];
      for (let i = 0; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res && res[0] && res[0].transcript) partes.push(res[0].transcript);
      }
      const texto = partes.join(" ").replace(/\s+/g, " ").trim();
      if (texto) this.ultimoTexto = texto;
      clearTimeout(this.finTimer);
      // En móviles algunos navegadores tardan en cerrar el resultado; este corte suave evita sesiones colgadas.
      this.finTimer = setTimeout(() => {
        if (this.activo && this.ultimoTexto) {
          try { this.reconocimiento?.stop(); } catch {}
        }
      }, 9000);
    };

    r.onerror = ev => {
      const msg = this.mensajeError(ev?.error);
      if (!["no-speech", "aborted"].includes(ev?.error)) toast(msg);
    };

    r.onend = () => {
      clearTimeout(this.finTimer);
      this.pegarResultado();
      const duracion = Date.now() - this.inicioMs;
      const puedeReiniciar = this.activo && !this.manualStop && this.reinicios < this.reiniciosMax && duracion < 55000;
      if (puedeReiniciar) {
        this.reinicios++;
        this.ultimoTexto = "";
        setTimeout(() => {
          if (!this.activo || this.manualStop) return;
          try {
            this.reconocimiento = this.configurarReconocimiento();
            this.reconocimiento.start();
          } catch {
            this.detener(true);
          }
        }, 450);
        return;
      }
      this.detener(true);
    };

    return r;
  },

  async iniciar(selector, boton) {
    if (!this.soportado()) {
      toast("Este navegador no permite dictado web. Prueba Chrome o Edge actualizados.");
      return false;
    }
    if (this.activo) {
      this.detener(false);
      return true;
    }
    const campo = document.querySelector(selector);
    if (!campo) return false;

    this.boton = boton;
    this.campo = campo;
    this.ultimoTexto = "";
    this.ultimoInsertado = "";
    this.reinicios = 0;
    this.manualStop = false;

    const permiso = await this.pedirPermisoMicrofono();
    if (!permiso) {
      this.detener(true);
      return false;
    }

    this.reconocimiento = this.configurarReconocimiento();
    try {
      this.reconocimiento.start();
      return true;
    } catch {
      toast("No pude iniciar el micrófono. Cierra otro dictado activo e intenta de nuevo.");
      this.detener(true);
      return false;
    }
  },

  pegarResultado() {
    const campo = this.campo;
    const texto = (this.ultimoTexto || "").replace(/\s+/g, " ").trim();
    if (!campo || !texto) return;
    const valorActual = (campo.value || "").replace(/\s+/g, " ").trim();
    if (texto === this.ultimoInsertado || valorActual.endsWith(texto)) return;
    insertarDictado(campo, texto);
    this.ultimoInsertado = texto;
  },

  detener(silencioso = false) {
    this.manualStop = true;
    clearTimeout(this.finTimer);
    try { this.reconocimiento?.stop(); } catch {}
    this.pegarResultado();
    this.prepararBoton(false);
    if (!silencioso && this.ultimoInsertado) toast("Dictado pegado ✅");
    this.activo = false;
    this.reconocimiento = null;
    this.boton = null;
    this.campo = null;
    this.ultimoTexto = "";
  }
};

function insertarDictado(campo, texto) {
  const ini = campo.selectionStart ?? campo.value.length;
  const fin = campo.selectionEnd ?? campo.value.length;
  const antes = campo.value.slice(0, ini).trimEnd();
  const despues = campo.value.slice(fin).trimStart();
  const sep1 = antes ? " " : "";
  const sep2 = despues ? " " : "";
  campo.value = antes + sep1 + texto.trim() + sep2 + despues;
  campo.focus();
  const pos = (antes + sep1 + texto.trim()).length;
  try { campo.setSelectionRange(pos, pos); } catch {}
  campo.dispatchEvent(new Event("input", { bubbles: true }));
}

function prepararDictado() {
  const soportado = DictadoVoz.soportado();
  document.querySelectorAll("[data-dictado]").forEach(btn => {
    if (btn.dataset.dictadoPreparado) return;
    btn.dataset.dictadoPreparado = "1";
    if (!soportado) {
      btn.disabled = true;
      btn.classList.add("micro-no-soportado");
      btn.dataset.tooltip = "Dictado no disponible en este navegador. Prueba Chrome o Edge actualizados.";
      btn.setAttribute("aria-label", "Dictado no disponible");
    } else {
      btn.dataset.tooltip = btn.dataset.tooltip || "Dictar con micrófono";
      btn.addEventListener("click", () => DictadoVoz.iniciar(btn.dataset.dictado, btn));
    }
  });
  aplicarTooltipsEscritorio?.();
}

function iniciarSplash() {
  const splash = $("#splash-overlay");
  if (!splash) return;
  setTimeout(() => splash.classList.add("oculto-splash"), 2200);
}

async function cargarDemosIniciales() {
  try {
    const r = await fetch("data/demos-biblioteca.json", { cache: "no-store" });
    if (!r.ok) return;
    const demos = await r.json();
    const agregados = Biblioteca.sembrarDemos(demos);
    if (agregados && $("#p-biblioteca")?.classList.contains("activa")) pintarBiblioteca($("#buscador").value);
  } catch {}
}

/* ═══════════ v0.10.28 — mini-barra global, limpieza de formularios y configuración segura ═══════════ */
function sesionTituloCorto(s = Estado.sesionActual) {
  return textoCorto(s?.alias || s?.titulo_sesion || "Lectura activa", 42);
}
function crearMiniBarraGlobal() {
  if ($("#mini-player-global")) return;
  const bar = document.createElement("div");
  bar.id = "mini-player-global";
  bar.className = "mini-player-global oculto";
  bar.innerHTML = `
    <button class="mini-player-info" id="mini-player-volver" type="button" aria-label="Volver a la sesión activa">
      <span class="mini-player-onda">🎧</span>
      <span><strong id="mini-player-titulo">Lectura activa</strong><small id="mini-player-estado">Listo para escuchar</small></span>
    </button>
    <div class="mini-player-controles">
      <button type="button" id="mini-player-ant" aria-label="Anterior">⏮</button>
      <button type="button" id="mini-player-play" aria-label="Reproducir o pausar">▶</button>
      <button type="button" id="mini-player-sig" aria-label="Siguiente">⏭</button>
      <button type="button" id="mini-player-fav" aria-label="Marcar favorita" data-tooltip="Marcar favorita la tarjeta actual">☆</button>
    </div>`;
  document.body.appendChild(bar);
  $("#mini-player-volver").addEventListener("click", () => ir("sesion"));
  $("#mini-player-play").addEventListener("click", () => $("#rep-play")?.click());
  $("#mini-player-ant").addEventListener("click", () => $("#rep-anterior")?.click());
  $("#mini-player-sig").addEventListener("click", () => $("#rep-siguiente")?.click());
  $("#mini-player-fav").addEventListener("click", () => alternarFavoritaActual());
}
function actualizarMiniBarraGlobal() {
  crearMiniBarraGlobal();
  const bar = $("#mini-player-global");
  const s = Estado.sesionActual;
  const hayModal = !!document.querySelector(".modal:not(.oculto)");
  const activa = document.querySelector(".pantalla.activa")?.id || "";
  const pantallasSinMini = new Set(["p-usuarios", "p-configuracion"]);
  const tieneActividad = !!s && (Estado.miniPlayerActivo || AudioVoz.sonando || Estado.reproduciendoCadena);
  const mostrar = tieneActividad && !hayModal && !pantallasSinMini.has(activa);
  bar.classList.toggle("oculto", !mostrar);
  document.body.classList.toggle("con-mini-player", mostrar);
  document.body.classList.toggle("mini-player-en-sesion", mostrar && activa === "p-sesion");
  if (!mostrar) return;
  $("#mini-player-titulo").textContent = sesionTituloCorto(s);
  const total = s.ideas?.length || 0;
  const sonando = AudioVoz.sonando || Estado.reproduciendoCadena;
  const tipo = s.esPlaylist ? "Playlist" : "Lectura";
  $("#mini-player-estado").textContent = sonando ? `${tipo} · ${Estado.ideaActual + 1}/${total}` : `Pausado · ${tipo} · ${Estado.ideaActual + 1}/${total}`;
  $("#mini-player-play").textContent = sonando ? "⏸" : "▶";
  sincronizarBotonesFavorita?.();
}

function abrirDrawer() { /* v0.10.28: menú hamburguesa retirado. */ }
function cerrarDrawer() { /* v0.10.28: menú hamburguesa retirado. */ }
function prepararDrawer() {
  // Nombre conservado para no tocar el arranque anterior: ahora prepara la pantalla Configuración.
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      cerrarModalAudio?.();
      cerrarModalPlaylist?.();
      document.querySelectorAll(".modal:not(.oculto)").forEach(m => m.classList.add("oculto"));
      actualizarMiniBarraGlobal?.();
    }
  });
  $("#btn-playlist-home")?.addEventListener("click", abrirBibliotecaParaPlaylist);
  $("#btn-home-ver-playlists")?.addEventListener("click", abrirBibliotecaParaPlaylist);
  $("#btn-nueva-playlist-zona")?.addEventListener("click", abrirBibliotecaCrearPlaylist);
  $("#btn-crear-primera-playlist")?.addEventListener("click", abrirBibliotecaCrearPlaylist);
  $("#btn-escuchar-favoritas-biblioteca")?.addEventListener("click", abrirRepasoFavoritas);
  $("#btn-repaso-3-home")?.addEventListener("click", abrirRepasoTresMinutos);
  $("#btn-repaso-3-biblioteca")?.addEventListener("click", abrirRepasoTresMinutos);
  $("#btn-playlist-intencion")?.addEventListener("click", crearPlaylistAutomaticaPorIntencion);
  $("#btn-para-mi-hoy")?.addEventListener("click", () => abrirParaMi({ sorpresa: false }));
  $("#btn-para-mi-sorpresa")?.addEventListener("click", () => abrirParaMi({ sorpresa: true }));
  $("#btn-para-mi-favoritas")?.addEventListener("click", abrirRepasoTresMinutos);
  $("#btn-config-backup")?.addEventListener("click", () => exportarBackupBiblioteca());
  $("#btn-config-importar")?.addEventListener("click", () => $("#archivo-importar")?.click());
  $("#btn-config-tema")?.addEventListener("click", () => $("#btn-tema")?.click());
  $("#btn-config-usuarios")?.addEventListener("click", () => ir("usuarios"));
  $("#btn-config-salir")?.addEventListener("click", () => $("#btn-salir")?.click());
  $("#btn-usuarios-home")?.addEventListener("click", () => ir("usuarios"));
  $("#btn-config-ayuda")?.addEventListener("click", () => mostrarAyudaPantalla("p-configuracion"));
  $("#btn-config-borrar-app")?.addEventListener("click", borrarDatosAppSeguro);
}

async function borrarDatosAppSeguro() {
  const ok = confirm("Esto borrará perfiles, lecturas, playlists, favoritas, ajustes locales y datos guardados de Voz de los Libros en este dispositivo. No se puede deshacer. ¿Deseas continuar?");
  if (!ok) return;
  const palabra = prompt("Para confirmar escribe BORRAR en mayúsculas:");
  if (palabra !== "BORRAR") { toast("Borrado cancelado."); return; }
  try {
    Object.keys(localStorage).filter(k => k.startsWith("vozlibros")).forEach(k => localStorage.removeItem(k));
    Object.keys(sessionStorage).filter(k => k.startsWith("vozlibros")).forEach(k => sessionStorage.removeItem(k));
    if (window.indexedDB?.deleteDatabase) {
      try { indexedDB.deleteDatabase("vozlibros_audio_sesiones_v1"); } catch {}
    }
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => /voz|libros/i.test(k)).map(k => caches.delete(k)));
    }
  } finally {
    try {
      const u = Biblioteca.crearUsuario("Mi perfil");
      Biblioteca.cambiarUsuario(u.id);
      sessionStorage.setItem("vozlibros_perfil_confirmado", u.id);
    } catch {}
    alert("Datos borrados. La app volverá al inicio con los demos base.");
    location.replace(location.pathname + location.search);
  }
}

const AudioSesionDB = {
  nombre: "vozlibros_audio_sesiones_v1",
  store: "audios",
  abrir() {
    return new Promise((res, rej) => {
      const req = indexedDB.open(this.nombre, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(this.store, { keyPath: "id" });
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error || new Error("No se pudo abrir IndexedDB"));
    });
  },
  async guardar(id, archivo) {
    const db = await this.abrir();
    return new Promise((res, rej) => {
      const tx = db.transaction(this.store, "readwrite");
      tx.objectStore(this.store).put({ id, blob: archivo, nombre: archivo.name, mimeType: archivo.type, size: archivo.size, fechaImportacion: new Date().toISOString() });
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  },
  async obtener(id) {
    const db = await this.abrir();
    return new Promise((res, rej) => {
      const tx = db.transaction(this.store, "readonly");
      const req = tx.objectStore(this.store).get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    });
  },
  async eliminar(id) {
    const db = await this.abrir();
    return new Promise((res, rej) => {
      const tx = db.transaction(this.store, "readwrite");
      tx.objectStore(this.store).delete(id);
      tx.oncomplete = () => res(true);
      tx.onerror = () => rej(tx.error);
    });
  }
};
function guionLimpioSesion(sesion = Estado.sesionActual) {
  if (!sesion) return "";
  const nombre = sesion.destinatario?.nombre || sesion.usuario || Estado.perfil.nombre || "";
  const lineas = [sesion.alias || sesion.titulo_sesion || "Voz de los Libros", ""];
  lineas.push(saludoCompacto(sesion), "");
  (sesion.ideas || []).forEach((idea) => {
    const texto = AudioVoz.capsula(idea, 0, sesion.modo || sesion.capaLectura || "ambas", nombre)
      .replace(/\b(Haz|Paso concreto|Un paso concreto|Recomendación|Consejo práctico|Recuerda)\s*[:：-]?\s*/gi, "")
      .replace(/\s+/g, " ").trim();
    if (texto) lineas.push(texto, "");
  });
  if (sesion.guion_audio_cierre) lineas.push(String(sesion.guion_audio_cierre)
    .replace(/\b(Haz|Paso concreto|Un paso concreto|Recomendación|Consejo práctico|Recuerda)\s*[:：-]?\s*/gi, "")
    .replace(/\s+/g, " ").trim());
  return lineas.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function abrirModalAudio() {
  if (!Estado.sesionActual) return;
  cerrarDrawer?.();
  cerrarModalPlaylist?.();
  const guion = guionLimpioSesion();
  const caja = $("#guion-audio-limpio");
  if (caja) caja.value = guion;
  $("#modal-audio")?.classList.remove("oculto");
  actualizarEstadoAudioImportado();
  actualizarMiniBarraGlobal?.();
}
function cerrarModalAudio() {
  $("#modal-audio")?.classList.add("oculto");
  actualizarMiniBarraGlobal?.();
}
async function actualizarEstadoAudioImportado() {
  const s = Estado.sesionActual;
  const estado = $("#audio-importado-estado");
  const player = $("#audio-importado-player");
  if (!s || !estado || !player) return;
  if (!s.audioExterno?.existe) {
    estado.textContent = "Sin audio importado para esta sesión.";
    player.classList.add("oculto");
    player.removeAttribute("src");
    return;
  }
  try {
    const item = await AudioSesionDB.obtener(s.id);
    if (item?.blob) {
      // Liberar el objectURL anterior para no acumular memoria
      if (player.dataset.urlPrevio) { try { URL.revokeObjectURL(player.dataset.urlPrevio); } catch {} }
      const url = URL.createObjectURL(item.blob);
      player.dataset.urlPrevio = url;
      player.src = url;
      player.classList.remove("oculto");
      estado.textContent = `Audio importado: ${s.audioExterno.nombreArchivo || "audio de sesión"}. Este audio corresponde a la sesión completa; las tarjetas quedan como apoyo de lectura.`;
    } else {
      // Sesión restaurada desde backup: el flag viaja, el archivo no.
      player.classList.add("oculto");
      estado.textContent = `Esta sesión tenía un audio (${s.audioExterno.nombreArchivo || "MP3/WAV"}), pero el archivo no está en este dispositivo: los backups no incluyen audios. Impórtalo de nuevo para reactivarlo.`;
    }
  } catch {
    player.classList.add("oculto");
    estado.textContent = "No pude leer el audio guardado en este dispositivo. Puedes importarlo de nuevo.";
  }
}

function prepararCierreDeModalesPorFondo() {
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", ev => {
      if (ev.target !== modal) return;
      if (modal.id === "modal-audio") cerrarModalAudio();
      else if (modal.id === "modal-playlist") cerrarModalPlaylist?.();
      else modal.classList.add("oculto");
      actualizarMiniBarraGlobal?.();
    });
  });
}

function prepararAudioExterno() {
  $("#rep-preparar-audio")?.addEventListener("click", () => {
    abrirModalAudio();
    const CAPAS = { directas: "Neto", adaptadas: "Contexto", ambas: "Neto + Contexto" };
    const aviso = $("#audio-capa-aviso");
    if (aviso) aviso.textContent = "El guion usará la capa activa: " + (CAPAS[Estado.sesionActual?.modo] || "Neto + Contexto") + ". Cámbiala en la sesión antes de copiar si prefieres otra.";
  });
  $("#btn-cerrar-audio")?.addEventListener("click", cerrarModalAudio);
  $("#btn-copiar-guion-audio")?.addEventListener("click", async () => {
    const texto = $("#guion-audio-limpio").value || guionLimpioSesion();
    $("#guion-audio-limpio").value = texto;
    try { await navigator.clipboard.writeText(texto); toast("Guion copiado ✅"); }
    catch {
      const detalle = document.querySelector(".audio-preview-detalle");
      if (detalle) detalle.open = true;
      caja?.focus?.();
      caja?.select?.();
      toast("No pude copiar. Dejé el guion visible para copiarlo manualmente.");
    }
  });
  $("#btn-descargar-guion-audio")?.addEventListener("click", () => {
    const texto = $("#guion-audio-limpio").value || guionLimpioSesion();
    $("#guion-audio-limpio").value = texto;
    const nombre = (Estado.sesionActual?.titulo_sesion || "guion-audio").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "guion-audio";
    descargarBlob(new Blob([texto], { type: "text/plain;charset=utf-8" }), nombre + ".txt");
    toast("TXT descargado 📄");
  });
  $("#btn-importar-audio-sesion")?.addEventListener("click", () => $("#archivo-audio-sesion")?.click());
  $("#archivo-audio-sesion")?.addEventListener("change", async e => {
    const archivo = e.target.files?.[0]; e.target.value = "";
    if (!archivo || !Estado.sesionActual?.id) return;
    if (!/audio\/(mpeg|mp3|wav|x-wav)/i.test(archivo.type) && !/\.(mp3|wav)$/i.test(archivo.name)) { toast("Importa un archivo MP3 o WAV."); return; }
    if (archivo.size > 80 * 1024 * 1024) { toast("El audio supera 80 MB. Usa un archivo más liviano."); return; }
    try {
      await AudioSesionDB.guardar(Estado.sesionActual.id, archivo);
      Estado.sesionActual.audioExterno = { existe: true, tipo: "sesion_completa", nombreArchivo: archivo.name, mimeType: archivo.type, size: archivo.size, fechaImportacion: new Date().toISOString(), almacenamiento: "IndexedDB" };
      Biblioteca.guardarSesion(Estado.sesionActual);
      await actualizarEstadoAudioImportado();
      toast("Audio importado y asociado a la sesión 🎧");
    } catch { toast("No pude guardar el audio en este dispositivo."); }
  });
  $("#btn-reproducir-audio-importado")?.addEventListener("click", async () => {
    await actualizarEstadoAudioImportado();
    const player = $("#audio-importado-player");
    if (!player || player.classList.contains("oculto")) { toast("No hay audio importado para reproducir."); return; }
    detenerCadena();
    player.play().catch(() => toast("Toca de nuevo para reproducir el audio importado."));
  });
  $("#btn-usar-lector-interno")?.addEventListener("click", () => {
    cerrarModalAudio();
    if (!AudioVoz.sonando && !Estado.reproduciendoCadena) {
      setTimeout(() => $("#rep-play")?.click(), 80);
    } else {
      toast("Lector interno activo.");
    }
  });
  $("#btn-compartir-audio-importado")?.addEventListener("click", async () => {
    const s = Estado.sesionActual;
    if (!s?.audioExterno?.existe) { toast("No hay audio importado para compartir."); return; }
    try {
      const item = await AudioSesionDB.obtener(s.id);
      if (!item?.blob) throw new Error();
      const archivo = new File([item.blob], item.nombre || "voz-de-los-libros-audio.mp3", { type: item.mimeType || "audio/mpeg" });
      if (navigator.share && navigator.canShare?.({ files: [archivo] })) await navigator.share({ files: [archivo], text: `Audio de la sesión: ${s.titulo_sesion || "Voz de los Libros"}` });
      else descargarBlob(item.blob, archivo.name);
    } catch { toast("No pude compartir. Revisa que el audio siga guardado localmente."); }
  });
  $("#btn-eliminar-audio-importado")?.addEventListener("click", async () => {
    const s = Estado.sesionActual;
    if (!s?.id || !s.audioExterno?.existe) { toast("No hay audio importado para eliminar."); return; }
    if (!confirm("¿Eliminar el audio importado de esta sesión? Las tarjetas no se borran.")) return;
    await AudioSesionDB.eliminar(s.id).catch(() => {});
    s.audioExterno = { existe: false };
    Biblioteca.guardarSesion(s);
    await actualizarEstadoAudioImportado();
    toast("Audio importado eliminado.");
  });
}

/* ─────────── Arranque ─────────── */
iniciarSplash();
prepararDrawer();
/* prepararAudioExterno retirado en v0.10.28: se conserva solo lector interno. */
prepararCierreDeModalesPorFondo();
prepararAyudasPantalla();
prepararDictado();
aplicarTooltipsEscritorio();
pintarSaludo();
pintarPlaylistsInicio?.();
if (Biblioteca.idActual()) cargarDemosIniciales();
if (Biblioteca.idActual()) revisarEnlaceEntrante();
window.matchMedia("(hover: hover) and (pointer: fine)").addEventListener?.("change", aplicarTooltipsEscritorio);

/* ═══════════ v0.6.0: Usuarios, home secundario, importar, compartir sesión ═══════════ */

/* ── Selector de usuarios ── */
function pintarUsuarios() {
  const cont = $("#lista-usuarios");
  if (!cont) return;
  cont.innerHTML = "";
  const actualId = Biblioteca.idActual();
  $("#btn-usuarios-volver-inicio")?.classList.toggle("oculto", !actualId);
  const usuarios = Biblioteca.usuarios();
  if (!usuarios.length) {
    const aviso = document.createElement("div");
    aviso.className = "nota";
    aviso.textContent = "Aún no hay perfiles. Crea uno con un nombre propio para que el audio sea personal.";
    cont.appendChild(aviso);
  }
  usuarios.forEach(u => {
    const n = Biblioteca.contarSesiones(u.id);
    const fila = document.createElement("div");
    fila.className = "usuario-fila" + (u.id === actualId ? " actual" : "");

    const b = document.createElement("button");
    b.className = "boton-menu usuario-selector";
    b.type = "button";
    b.innerHTML = `<span class="icono">🌿</span>
      <span><strong>${escapar(u.nombre)}${u.id === actualId ? " · actual" : ""}${Biblioteca.tienePin(u.id) ? " 🔒" : ""}</strong><br><small>${n ? n + (n === 1 ? " sesión guardada" : " sesiones guardadas") : "Biblioteca nueva"}</small></span>`;
    b.addEventListener("click", async () => {
      if (Biblioteca.tienePin(u.id)) {
        const pin = prompt(`🔒 El perfil de ${u.nombre} tiene PIN. Escríbelo:`);
        if (pin === null) return;
        if (!(await Biblioteca.verificarPin(u.id, pin))) { toast("PIN incorrecto."); return; }
      }
      Biblioteca.cambiarUsuario(u.id);
      sessionStorage.setItem("vozlibros_perfil_confirmado", u.id);
      location.reload(); // reinicia el estado limpio con la biblioteca de este usuario
    });

    const editar = document.createElement("button");
    editar.className = "usuario-editar";
    editar.type = "button";
    editar.textContent = "✏️";
    editar.dataset.tooltip = "Editar nombre del perfil";
    editar.setAttribute("aria-label", "Editar nombre del perfil");
    editar.addEventListener("click", () => {
      const nuevo = prompt("Editar nombre del perfil:", u.nombre || "");
      if (nuevo === null) return;
      const limpio = Biblioteca.limpiarNombrePerfil?.(nuevo) || nuevo.trim();
      if (!limpio) { toast("No guardo perfiles sin nombre."); return; }
      if (Biblioteca.esNombreGenerico?.(limpio)) { toast("Usa un nombre propio, no “Usuario” ni “Mi perfil”."); return; }
      try {
        Biblioteca.actualizarUsuario(u.id, limpio);
        if (u.id === actualId) {
          Estado.perfil = Biblioteca.cargarPerfil() || { nombre: limpio };
          pintarSaludo();
        }
        toast("Nombre actualizado.");
        pintarUsuarios();
      } catch (err) {
        toast(err.message || "No pude actualizar el nombre.");
      }
    });

    fila.appendChild(b);
    fila.appendChild(editar);
    cont.appendChild(fila);
  });
}

$("#btn-crear-usuario")?.addEventListener("click", () => {
  const nombre = $("#nuevo-usuario-nombre").value.trim();
  if (!nombre) { toast("Escribe tu nombre para crear el perfil."); return; }
  if (Biblioteca.esNombreGenerico?.(nombre)) { toast("Usa un nombre propio, no “Usuario” ni “Mi perfil”."); return; }
  try {
    const u = Biblioteca.crearUsuario(nombre);
    Biblioteca.cambiarUsuario(u.id);
    sessionStorage.setItem("vozlibros_perfil_confirmado", u.id);
    location.reload();
  } catch (err) {
    toast(err.message || "No pude crear el perfil.");
  }
});
$("#nuevo-usuario-nombre")?.addEventListener("keydown", e => {
  if (e.key === "Enter") $("#btn-crear-usuario").click();
});

$("#btn-salir")?.addEventListener("click", () => {
  if (!confirm("¿Volver al inicio para cambiar de perfil? Tu biblioteca queda guardada en este dispositivo.")) return;
  AudioVoz.detener();
  Biblioteca.salir();
  sessionStorage.removeItem("vozlibros_perfil_confirmado");
  location.replace(location.pathname + location.search);
});

/* ── Backup e importación desde el home ── */
$("#btn-exportar-home")?.addEventListener("click", () => exportarBackupBiblioteca());
$("#btn-importar-home")?.addEventListener("click", () => $("#archivo-importar").click());
$("#archivo-importar")?.addEventListener("change", async e => {
  const archivo = e.target.files && e.target.files[0];
  e.target.value = ""; // permitir reimportar el mismo archivo
  if (!archivo) return;
  try {
    const texto = await archivo.text();
    const datos = JSON.parse(texto);
    const r = Biblioteca.importarDatos(datos);
    if (r.tipo === "backup") {
      toast(`Backup importado: ${r.agregadas} nuevas, ${r.actualizadas} actualizadas ✅`);
    } else {
      toast(`Sesión importada: "${r.titulo}" 🗄️`);
    }
    if ($("#p-biblioteca")?.classList.contains("activa")) pintarBiblioteca($("#buscador").value);
  } catch (err) {
    toast("No pude importar: " + err.message);
  }
});

/* ── Compartir sesión completa como archivo ── */
$("#rep-compartir-sesion")?.addEventListener("click", async () => {
  const s = Estado.sesionActual;
  if (!s) return;
  if (s.esPlaylist) { toast("La playlist es temporal; comparte la sesión original."); return; }

  const incluirPersonal = confirm(
    "¿Incluir tu capa personal (versión adaptada a tu vida)?\n\n" +
    "Aceptar = compartir todo tal cual.\n" +
    "Cancelar = versión despersonalizada (recomendada): solo ideas del libro, pasos y frases."
  );

  const copia = JSON.parse(JSON.stringify(s));
  delete copia.id; delete copia.guardadaEl; delete copia.esPlaylist; delete copia.ideas_todas;
  if (!incluirPersonal) {
    copia.usuario = "";
    copia.modo = "directas";
    copia.saludo_audio = "Te compartieron esta sesión de Voz de los Libros. Puedes leerla o escucharla a tu ritmo.";
    (copia.ideas || []).forEach(i => { delete i.adaptada; delete i.favorita; });
  }
  copia.compartidaEl = new Date().toISOString();

  const nombreArchivo = "voz-sesion-" +
    (copia.titulo_sesion || "compartida").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) + ".json";
  const blob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" });

  // Compartir nativo con archivo (móvil); si no se puede, descargar
  if (navigator.share && navigator.canShare) {
    try {
      const archivo = new File([blob], nombreArchivo, { type: "application/json" });
      if (navigator.canShare({ files: [archivo] })) {
        await navigator.share({
          files: [archivo],
          text: `📖 Te comparto "${copia.titulo_sesion || "una sesión"}" de Voz de los Libros. Impórtala con el botón 📥 Importar de la app.`
        });
        return;
      }
    } catch (err) { if (err.name === "AbortError") return; }
  }
  descargarBlob(blob, nombreArchivo);
  toast("Sesión descargada 📤 Envíala y que la importen con 📥");
});

/* ── Arranque con multi-usuario ── */
(function arrancarUsuarios() {
  const usuarios = Biblioteca.usuarios();
  const actual = Biblioteca.idActual();
  const confirmado = sessionStorage.getItem("vozlibros_perfil_confirmado") === actual;
  if (!actual || (usuarios.length > 1 && !confirmado)) {
    pintarUsuarios();
    ir("usuarios");
  }
})();

/* ═══════════ v0.7.0 — DSEBI: Hoy, repaso, racha, backup, ético, PIN, PDF, modo directo ═══════════ */

/* ── B1 + B3 + C4: tarjeta "Hoy", racha y estadísticas en el inicio ── */
function pintarHoy() {
  if (!Biblioteca.idActual()) return;

  // Racha amable (solo se muestra si existe; si se rompió, silencio, sin drama)
  const racha = Biblioteca.rachaActual();
  const lineaRacha = $("#racha-linea");
  if (lineaRacha) {
    lineaRacha.classList.toggle("oculto", racha < 2);
    if (racha >= 2) lineaRacha.textContent = `🔥 ${racha} días escuchando tus lecturas`;
  }

  // Reunir frases: favoritas primero; si no hay, frases de las sesiones
  const bolsa = [];
  Biblioteca.listar().forEach(s => {
    if (s.esPlaylist) return;
    (s.ideas || []).forEach(idea => {
      const frase = idea.frase_memorable || "";
      if (!frase) return;
      bolsa.push({ frase, sesion: s, idea, fav: !!idea.favorita });
    });
  });
  const tarjeta = $("#tarjeta-hoy");
  if (!tarjeta) return;
  if (!bolsa.length) { tarjeta.classList.add("oculto"); return; }

  const pool = bolsa.some(x => x.fav) ? bolsa.filter(x => x.fav) : bolsa;
  // Rotación determinista: misma frase durante todo el día, distinta mañana
  const dia = Math.floor(Date.now() / 86400000);
  const elegida = pool[dia % pool.length];

  $("#hoy-frase").textContent = "❝ " + elegida.frase + " ❞";
  $("#hoy-origen").textContent = (elegida.fav ? "★ " : "") + (elegida.sesion.titulo_sesion || "");
  const st = Biblioteca.estadisticas();
  $("#hoy-stats").textContent =
    `${st.consejos} consejo${st.consejos === 1 ? "" : "s"} escuchado${st.consejos === 1 ? "" : "s"} · ${st.sesiones} sesión${st.sesiones === 1 ? "" : "es"} · ${st.favoritas} ★`;
  tarjeta.classList.remove("oculto");

  $("#btn-hoy-escuchar").onclick = () => {
    abrirSesion(elegida.sesion);
    const i = (elegida.sesion.ideas || []).findIndex(x => x.numero === elegida.idea.numero);
    if (i >= 0) setTimeout(() => reproducirCadenaDesde(i), 350);
  };
  $("#btn-hoy-repaso").onclick = abrirRepasoFavoritas;
}

/* ── B2: repaso espaciado de favoritas ── */
const REPASO_SEGUNDOS_OBJETIVO = 180;
const REPASO_SEGUNDOS_MINIMO = 145;
const REPASO_MAX_IDEAS = 12;

function textoParaEstimarRepaso(idea) {
  return [idea.directa, idea.adaptada, idea.frase_memorable, idea.consejo_practico]
    .filter(Boolean).join(" ");
}

function estimarSegundosIdea(idea) {
  const texto = textoParaEstimarRepaso(idea);
  const caracteres = texto.length || 120;
  return Math.max(10, Math.ceil(caracteres / 13) + 2);
}

function prepararIdeasRepaso(candidatas) {
  const ideas = [];
  const usadas = new Set();
  let segundos = 0;

  const agregar = c => {
    const clave = c.clave || (c.sesion?.id + ":" + c.idea?.numero);
    if (!c.idea || usadas.has(clave) || ideas.length >= REPASO_MAX_IDEAS) return;
    const copia = {
      ...c.idea,
      numero: ideas.length + 1,
      _claveRepaso: clave,
      _origen: c.sesion?.titulo_sesion || "",
      _origenSesionId: c.sesion?.id,
      _origenNumero: c.idea?.numero
    };
    ideas.push(copia);
    usadas.add(clave);
    segundos += estimarSegundosIdea(copia);
  };

  candidatas.forEach(c => {
    if (ideas.length < 3 || segundos < REPASO_SEGUNDOS_MINIMO) agregar(c);
  });

  candidatas.forEach(c => {
    if (segundos < REPASO_SEGUNDOS_OBJETIVO && ideas.length < REPASO_MAX_IDEAS) agregar(c);
  });

  return { ideas, segundos };
}

function candidatasRecientesParaRepaso(maximo = 40) {
  const candidatas = [];
  Biblioteca.listar().filter(s => !s.esPlaylist && (s.ideas || []).length).forEach(s => {
    (s.ideas || []).forEach(idea => {
      if (!idea) return;
      const peso = idea.favorita ? 2 : (idea.frase_memorable ? 1 : 0);
      candidatas.push({
        idea,
        sesion: s,
        clave: s.id + ":" + idea.numero,
        peso
      });
    });
  });
  return candidatas
    .sort((a, b) => b.peso - a.peso)
    .slice(0, maximo);
}

function abrirRepasoFavoritas() {
  const candidatas = Biblioteca.favoritasParaRepaso(60);
  if (!candidatas.length) {
    toast("Marca favoritas ★ dentro de tus sesiones y aquí volverán como repaso.");
    return;
  }
  const { ideas, segundos } = prepararIdeasRepaso(candidatas);
  abrirSesion({
    id: "playlist-temporal",
    esPlaylist: true,
    usuario: Estado.perfil.nombre || "",
    fecha: new Date().toISOString().slice(0, 10),
    tema: "repaso de tus favoritas",
    titulo_sesion: "Repaso de 3 minutos ★",
    fuentes: [ideas.length + " favoritas o ideas memorables · duración estimada " + Math.round(segundos / 60) + " min"],
    categoria_vital: "otro",
    saludo_audio: "Este es tu repaso de tres minutos. Reúne favoritas y memorables para que vuelvan en el momento justo.",
    ideas,
    ideas_todas: ideas,
    modo: "ambas",
    guion_audio_cierre: "Fin del repaso de hoy. Puedes volver mañana por otras ideas."
  });
  toast("Repaso de 3 minutos: " + ideas.length + " ideas · aprox. " + Math.round(segundos / 60) + " min ▶");
}

function abrirRepasoTresMinutos() {
  const favoritas = Biblioteca.favoritasParaRepaso(60);
  const base = favoritas.length ? favoritas : candidatasRecientesParaRepaso(60);
  const { ideas, segundos } = prepararIdeasRepaso(base);
  if (!ideas.length) {
    toast("Crea tu primera lectura y aquí tendrás repasos breves.");
    ir("tipo-lectura");
    return;
  }
  abrirSesion({
    id: "repaso-3-temporal",
    esPlaylist: true,
    usuario: Estado.perfil.nombre || "",
    fecha: new Date().toISOString().slice(0, 10),
    tema: favoritas.length ? "favoritas para volver" : "ideas recientes y memorables",
    titulo_sesion: "Repaso de 3 minutos",
    fuentes: [ideas.length + " ideas · duración estimada " + Math.round(segundos / 60) + " min"],
    categoria_vital: "otro",
    saludo_audio: favoritas.length
      ? "Tres minutos para volver a tus favoritas. Lo importante merece repetición."
      : "Tres minutos con ideas recientes y memorables de tu biblioteca.",
    ideas,
    ideas_todas: ideas,
    modo: "ambas",
    guion_audio_cierre: "Fin del repaso breve. Puedes marcar favoritas para afinar los próximos repasos."
  });
  toast("Repaso de 3 minutos: " + ideas.length + " ideas · aprox. " + Math.round(segundos / 60) + " min ▶");
}


/* ── DSEBI v0.10.28: ¿Qué hay para mí? ── */
function sesionesBaseParaMi() {
  return Biblioteca.listar().filter(s => !s.esPlaylist && (s.ideas || []).length);
}

function analizarParaMi() {
  const sesiones = sesionesBaseParaMi();
  const st = Biblioteca.estadisticas();
  const cats = new Map();
  const modos = new Map();
  let totalIdeas = 0;
  let favoritas = 0;

  sesiones.forEach(s => {
    const cat = claveCategoria(s.categoria_vital || (s.tipoEntrada === "historia_para" ? "historias" : "otro"));
    cats.set(cat, (cats.get(cat) || 0) + 1);
    const modo = s.tipoEntrada === "historia_para" ? "historia_para" : (s.tipoEntrada === "situacion" ? "situacion" : (s.modoLectura || "ideas"));
    modos.set(modo, (modos.get(modo) || 0) + 1);
    (s.ideas || []).forEach(i => {
      totalIdeas++;
      if (i.favorita) favoritas++;
    });
  });

  const topCat = [...cats.entries()].sort((a, b) => b[1] - a[1])[0] || ["otro", 0];
  const topModo = [...modos.entries()].sort((a, b) => b[1] - a[1])[0] || ["ideas", 0];
  return { sesiones, st, cats, modos, totalIdeas, favoritas, topCat, topModo };
}

function pintarParaMi() {
  const panel = $("#para-mi-panel");
  if (!panel) return;
  const a = analizarParaMi();
  const sinDatos = a.sesiones.length === 0;
  $("#para-mi-titulo").textContent = sinDatos
    ? "Tu biblioteca todavía está despertando"
    : "Hoy tu biblioteca te puede devolver algo";
  $("#para-mi-resumen").textContent = sinDatos
    ? "Crea o importa una lectura para que este módulo pueda recomendar desde tus propias señales."
    : `Veo ${a.sesiones.length} lectura${a.sesiones.length === 1 ? "" : "s"}, ${a.favoritas} favorita${a.favoritas === 1 ? "" : "s"} y una inclinación hacia ${etiquetaCategoria(a.topCat[0])}.`;
  const metricas = $("#para-mi-metricas");
  if (metricas) {
    metricas.innerHTML = sinDatos ? "" : `
      <span>📚 ${a.sesiones.length} lecturas</span>
      <span>★ ${a.favoritas} favoritas</span>
      <span>🧭 ${escapar(etiquetaCategoria(a.topCat[0]))}</span>
      <span>🎧 ${a.st.consejos || 0} escuchas</span>`;
  }
  ["btn-para-mi-hoy", "btn-para-mi-sorpresa", "btn-para-mi-favoritas"].forEach(id => {
    const b = $("#" + id);
    if (b) b.disabled = sinDatos;
  });
}

function diaSemillaParaMi() {
  return Math.floor(Date.now() / 86400000);
}
function pseudoAleatorio(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function barajarConSemilla(arr, seed = Date.now()) {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(pseudoAleatorio(seed + i * 97) * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function candidatasParaMi({ sorpresa = false } = {}) {
  const a = analizarParaMi();
  const candidatas = [];
  const topCat = a.topCat[0];

  const agregar = (sesion, idea, peso, motivo) => {
    if (!sesion || !idea) return;
    candidatas.push({
      sesion,
      idea,
      clave: sesion.id + ":" + idea.numero,
      peso,
      motivo
    });
  };

  a.sesiones.forEach((s, sIdx) => {
    const cat = claveCategoria(s.categoria_vital || (s.tipoEntrada === "historia_para" ? "historias" : "otro"));
    const reciente = Math.max(0, 8 - sIdx);
    (s.ideas || []).forEach((idea, iIdx) => {
      let peso = 1 + reciente * 0.35;
      const motivos = [];
      if (idea.favorita) { peso += 5; motivos.push("favorita"); }
      if (cat === topCat) { peso += 2; motivos.push("categoría frecuente"); }
      if (idea.frase_memorable) { peso += 1; motivos.push("frase memorable"); }
      if (s.tipoEntrada === "historia_para") { peso += 0.7; motivos.push("historia"); }
      if (iIdx === 0) peso += 0.4;
      if (sIdx === 0) motivos.push("reciente");
      agregar(s, idea, peso, motivos.join(", ") || "lectura guardada");
    });
  });

  const favRepaso = Biblioteca.favoritasParaRepaso(30).map(c => ({ ...c, peso: 8, motivo: "favorita pendiente" }));
  const combinadas = [...favRepaso, ...candidatas];
  const seed = sorpresa ? Date.now() : diaSemillaParaMi();
  return barajarConSemilla(combinadas, seed)
    .sort((a, b) => (b.peso || 0) - (a.peso || 0))
    .slice(0, 80);
}

function abrirParaMi({ sorpresa = false } = {}) {
  const a = analizarParaMi();
  if (!a.sesiones.length) {
    toast("Primero crea o importa una lectura para recibir recomendaciones.");
    ir("tipo-lectura");
    return;
  }

  let base = candidatasParaMi({ sorpresa });
  if (!base.length) base = candidatasRecientesParaRepaso(60);
  const { ideas, segundos } = prepararIdeasRepaso(base);
  if (!ideas.length) {
    toast("No encontré ideas suficientes para recomendar hoy.");
    return;
  }

  const topCat = etiquetaCategoria(a.topCat[0]);
  const fraseModo = sorpresa ? "sorpresa aleatoria con sentido" : "recomendación diaria";
  abrirSesion({
    id: "para-mi-temporal",
    esPlaylist: true,
    usuario: Estado.perfil.nombre || "",
    fecha: new Date().toISOString().slice(0, 10),
    tema: fraseModo + " desde tu biblioteca",
    titulo_sesion: sorpresa ? "Sorpresa para mí 🎲" : "¿Qué hay para mí? 🎁",
    fuentes: [
      `${ideas.length} ideas seleccionadas · aprox. ${Math.round(segundos / 60)} min`,
      `Categoría dominante: ${topCat}`,
      `${a.favoritas} favoritas disponibles`
    ],
    categoria_vital: "recomendacion",
    saludo_audio: sorpresa
      ? "Preparé una sorpresa desde tu biblioteca: una mezcla breve para escuchar algo distinto sin perder sentido."
      : `Miré tus lecturas, favoritas y categorías. Hoy parece volver el tema ${topCat}. Te dejo un recorrido breve.`,
    ideas,
    ideas_todas: ideas,
    modo: "ambas",
    modoLectura: "ideas",
    tipoEntrada: "recomendacion",
    guion_audio_cierre: "Fin de la recomendación de hoy. Marca favoritas para que mañana la app te conozca mejor."
  });
  toast((sorpresa ? "Sorpresa" : "Recomendación de hoy") + `: ${ideas.length} ideas ▶`);
}

/* ── A2: recordatorio amable de backup ── */
function revisarAvisoBackup() {
  const n = Biblioteca.debeAvisarBackup();
  if (!n) return;
  $("#banner-backup-texto").textContent =
    `Tienes ${n} sesiones nuevas sin respaldar. Un backup toma un segundo y vive solo en tus manos.`;
  $("#banner-backup").classList.remove("oculto");
}
$("#btn-backup-ahora")?.addEventListener("click", () => {
  $("#banner-backup").classList.add("oculto");
  exportarBackupBiblioteca();
  Biblioteca.registrarBackupHecho();
});
$("#btn-backup-luego")?.addEventListener("click", () => {
  $("#banner-backup").classList.add("oculto");
  Biblioteca.posponerAvisoBackup();
});

/* ── A1: aviso ético en sesiones de categorías sensibles ── */
const CATEGORIAS_SENSIBLES = ["espiritualidad", "duelo", "autoayuda", "amor", "salud", "emociones", "familia", "crianza", "orientacion", "orientación", "situacion", "situación"];
function agregarAvisoEtico(sesion) {
  const cuerpo = $("#sesion-cuerpo");
  if (!cuerpo) return;
  cuerpo.querySelector(".aviso-etico")?.remove();
  const cat = (sesion.categoria_vital || "").toLowerCase();
  const temaSensible = CATEGORIAS_SENSIBLES.some(c => cat.includes(c) || (sesion.tema || "").toLowerCase().includes(c));
  if (!temaSensible || sesion.esPlaylist) return;
  const aviso = document.createElement("p");
  aviso.className = "aviso-etico";
  aviso.textContent = "🌱 Esta lectura acompaña reflexión y estudio. No reemplaza atención médica, psicológica, jurídica, espiritual ni decisiones profesionales.";
  cuerpo.appendChild(aviso);
}

/* ── B4: PIN opcional por perfil ── */
async function configurarPin() {
  const id = Biblioteca.idActual();
  if (!id) return;
  if (Biblioteca.tienePin(id)) {
    const actual = prompt("Este perfil tiene PIN. Escríbelo para continuar:");
    if (actual === null) return;
    if (!(await Biblioteca.verificarPin(id, actual))) { toast("PIN incorrecto."); return; }
    const nuevo = prompt("Nuevo PIN (4 a 6 dígitos). Deja vacío para QUITAR el PIN:");
    if (nuevo === null) return;
    if (nuevo === "") { await Biblioteca.fijarPin(id, ""); toast("PIN eliminado 🔓"); return; }
    if (!/^\d{4,6}$/.test(nuevo)) { toast("El PIN debe tener de 4 a 6 dígitos."); return; }
    await Biblioteca.fijarPin(id, nuevo);
    toast("PIN actualizado 🔒");
  } else {
    const nuevo = prompt("Crea un PIN para este perfil (4 a 6 dígitos).\nProtege tu perfil de otras personas que usen este dispositivo:");
    if (nuevo === null || nuevo === "") return;
    if (!/^\d{4,6}$/.test(nuevo)) { toast("El PIN debe tener de 4 a 6 dígitos."); return; }
    await Biblioteca.fijarPin(id, nuevo);
    toast("PIN activado 🔒 Se pedirá al entrar a este perfil.");
  }
}

/* v0.10.28: impresión/PDF retirado por decisión de producto. */
/* v0.10.28: IA interna con API retirada; se conserva flujo por prompt copiable + JSON. */
/* ── Arranque local ── */
if (Biblioteca.idActual()) {
  pintarHoy();
  revisarAvisoBackup();
}

/* ═══════════ v0.8.0 — cierre de versión ═══════════ */

/* ── #2: pantalla despierta mientras suena la voz (Wake Lock) ── */
let candadoPantalla = null;
async function pedirWakeLock() {
  try {
    if ("wakeLock" in navigator && !candadoPantalla) {
      candadoPantalla = await navigator.wakeLock.request("screen");
      candadoPantalla.addEventListener("release", () => { candadoPantalla = null; });
    }
  } catch {} // sin soporte o sin permiso: la app sigue igual
}
function soltarWakeLock() {
  try { candadoPantalla?.release(); } catch {}
  candadoPantalla = null;
}
document.addEventListener("visibilitychange", () => {
  // Al volver a la app durante una reproducción, re-pedir el candado
  if (document.visibilityState === "visible" && (AudioVoz.sonando || Estado.reproduciendoCadena)) pedirWakeLock();
});
// Engancharse al botón de play sin tocar su lógica
$("#rep-play")?.addEventListener("click", () => {
  setTimeout(() => {
    if (AudioVoz.sonando || Estado.reproduciendoCadena) pedirWakeLock();
    else soltarWakeLock();
  }, 100);
});

/* ── #4: selector de voz ── */
$("#rep-voz")?.addEventListener("click", () => {
  const voces = AudioVoz.vocesES();
  if (voces.length < 2) { toast("Tu dispositivo solo tiene una voz en español instalada."); return; }
  const estabaSonando = AudioVoz.sonando || Estado.reproduciendoCadena;
  const indice = Estado.ideaActual;
  const nueva = AudioVoz.siguienteVoz();
  toast("🗣 Voz: " + (nueva.name || nueva.voiceURI).slice(0, 40));
  if (estabaSonando) { detenerCadena(); setTimeout(() => reproducirCadenaDesde(indice), 200); }
});

/* ── #5: cronómetro de apagado ── */
const CRONO_OPCIONES = [0, 10, 20, 30]; // minutos; 0 = apagado
let cronoMin = 0, cronoTimer = null;
$("#rep-sueno")?.addEventListener("click", () => {
  const i = CRONO_OPCIONES.indexOf(cronoMin);
  cronoMin = CRONO_OPCIONES[(i + 1) % CRONO_OPCIONES.length];
  clearTimeout(cronoTimer);
  $("#rep-sueno").textContent = cronoMin ? "⏱" + cronoMin : "⏱";
  $("#rep-sueno").setAttribute("aria-label", cronoMin ? "Cronómetro: se detiene en " + cronoMin + " minutos" : "Cronómetro apagado");
  if (cronoMin) {
    cronoTimer = setTimeout(() => {
      detenerCadena();
      soltarWakeLock();
      cronoMin = 0;
      $("#rep-sueno").textContent = "⏱";
      $("#rep-sueno").setAttribute("aria-label", "Cronómetro apagado");
      $("#rep-estado").textContent = "Cronómetro cumplido · la voz se detuvo ⏱";
    }, cronoMin * 60000);
    toast("Cronómetro: la voz se detendrá en " + cronoMin + " minutos ⏱");
  } else {
    toast("Cronómetro apagado");
  }
});

/* ── #7: tamaño de letra de los consejos ── */
const ESCALAS = [0.8, 1, 1.12, 1.25];
let escalaIdx = Math.max(0, ESCALAS.indexOf(parseFloat(localStorage.getItem("vozlibros_letra") || "0.8")));
function aplicarEscala() {
  document.documentElement.style.setProperty("--escala-consejos", ESCALAS[escalaIdx]);
}
$("#rep-letra")?.addEventListener("click", () => {
  escalaIdx = (escalaIdx + 1) % ESCALAS.length;
  localStorage.setItem("vozlibros_letra", String(ESCALAS[escalaIdx]));
  aplicarEscala();
  toast("Texto al " + Math.round(ESCALAS[escalaIdx] * 100) + "%");
});
aplicarEscala();

/* ── #6: modo oscuro (auto / claro / oscuro) ── */
const TEMAS = ["auto", "oscuro", "claro"];
function aplicarTema() {
  const pref = localStorage.getItem("vozlibros_tema") || "auto";
  const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const oscuro = pref === "oscuro" || (pref === "auto" && sistemaOscuro);
  document.documentElement.dataset.tema = oscuro ? "oscuro" : "claro";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", oscuro ? "#14201B" : "#1FA97C");
}
$("#btn-tema")?.addEventListener("click", () => {
  const actual = localStorage.getItem("vozlibros_tema") || "auto";
  const siguiente = TEMAS[(TEMAS.indexOf(actual) + 1) % TEMAS.length];
  localStorage.setItem("vozlibros_tema", siguiente);
  aplicarTema();
  toast("Tema: " + (siguiente === "auto" ? "automático (según tu sistema)" : siguiente));
});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", aplicarTema);
aplicarTema();

/* ── #10: atajos de teclado en PC ── */
document.addEventListener("keydown", e => {
  if (!$("#p-sesion")?.classList.contains("activa")) return;
  const enCampo = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || "");
  if (enCampo || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === "Space") { e.preventDefault(); $("#rep-play").click(); }
  else if (e.key === "ArrowRight") { e.preventDefault(); $("#rep-siguiente").click(); }
  else if (e.key === "ArrowLeft") { e.preventDefault(); $("#rep-anterior").click(); }
  else if (e.key.toLowerCase() === "f") { e.preventDefault(); $("#rep-favorita").click(); }
});

/* ── #8 + R1: WhatsApp directo e Imagen con hoja de compartir ── */
$("#btn-whatsapp-tarjeta")?.addEventListener("click", () => {
  const c = consejoNeutro();
  if (!c) return;
  window.open("https://wa.me/?text=" + encodeURIComponent(textoCompartir(c)), "_blank", "noopener");
});

// El botón Imagen ahora abre la hoja de compartir del sistema (otras
// plataformas) cuando existe; si no (PC), descarga como antes.
(function mejorarBotonImagen() {
  const boton = $("#btn-descargar-tarjeta");
  if (!boton) return;
  const clon = boton.cloneNode(true); // retirar el handler anterior
  boton.replaceWith(clon);
  clon.addEventListener("click", async () => {
    const c = consejoNeutro();
    if (!c) return;
    const blob = await tarjetaPNG(c);
    const archivo = new File([blob], "voz-de-los-libros-consejo.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], text: textoCompartir(c) });
        return;
      } catch (e) { if (e.name === "AbortError") return; }
    }
    descargarBlob(blob, "voz-de-los-libros-consejo.png");
    toast("Imagen descargada 🖼");
  });
})();

/* ── R4: compartir un consejo desde su propia tarjeta ── */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-compartir-idea]");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  const i = parseInt(btn.dataset.compartirIdea, 10);
  if (Number.isInteger(i)) {
    seleccionarIdea(i, false, false, true);
    abrirTarjetaConsejoActual();
  }
});

/* ═══════════ v0.9.0 — barra de progreso estimada ═══════════ */
let _duraciones = [], _prefijos = [], _totalSeg = 0, _segEnIdea = 0, _ultimaIdeaTick = -1;

function recalcularDuraciones() {
  const s = Estado.sesionActual;
  _duraciones = []; _prefijos = []; _totalSeg = 0;
  if (s) {
    let acc = 0;
    (s.ideas || []).forEach((idea, i) => {
      const t = AudioVoz.capsula(idea, i, s.modo, s.destinatario?.nombre || s.usuario || Estado.perfil.nombre || "");
      const seg = Math.max(2, t.length / 14 / (AudioVoz.velocidad || 1));
      _duraciones.push(seg); _prefijos.push(acc); acc += seg;
    });
    _totalSeg = acc;
  }
  _segEnIdea = 0;
  pintarProgreso();
}
function _fmtSeg(seg) {
  seg = Math.max(0, Math.round(seg));
  return String(Math.floor(seg / 60)).padStart(2, "0") + ":" + String(seg % 60).padStart(2, "0");
}
function pintarProgreso() {
  const barra = $("#rep-barra-lleno");
  if (!barra) return;
  const i = Estado.ideaActual || 0;
  const trans = (_prefijos[i] || 0) + Math.min(_segEnIdea, _duraciones[i] || 0);
  $("#rep-tiempo-total").textContent = _totalSeg ? _fmtSeg(_totalSeg) : "—";
  $("#rep-tiempo-actual").textContent = _fmtSeg(trans);
  barra.style.width = (_totalSeg ? Math.min(100, trans / _totalSeg * 100) : 0) + "%";
}
setInterval(() => {
  if (!$("#p-sesion")?.classList.contains("activa")) return;
  const s = Estado.sesionActual;
  if (s && _duraciones.length !== (s.ideas || []).length) recalcularDuraciones();
  if (Estado.ideaActual !== _ultimaIdeaTick) { _segEnIdea = 0; _ultimaIdeaTick = Estado.ideaActual; }
  if (AudioVoz.sonando || Estado.reproduciendoCadena) _segEnIdea++;
  pintarProgreso();
  actualizarMiniBarraGlobal?.();
}, 1000);
// La velocidad y el modo cambian la estimación
$("#rep-velocidad")?.addEventListener("click", () => setTimeout(recalcularDuraciones, 50));
$("#selector-modo-sesion")?.addEventListener("click", () => setTimeout(recalcularDuraciones, 50));

/* ═══ v0.9.1: botón 🔀 aleatorio ═══ */
Estado.aleatorio = false;
$("#rep-aleatorio")?.addEventListener("click", () => {
  Estado.aleatorio = !Estado.aleatorio;
  $("#rep-aleatorio").classList.toggle("activo", Estado.aleatorio);
  toast(Estado.aleatorio
    ? "🔀 Aleatorio: los consejos sonarán en orden sorpresa, sin repetir"
    : "Orden normal restaurado");
});
