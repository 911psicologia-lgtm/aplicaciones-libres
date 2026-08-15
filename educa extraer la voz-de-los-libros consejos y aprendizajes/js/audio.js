/* ═══════════════════════════════════════════
   audio.js — Módulo Escucha
   ▸ Síntesis de voz del navegador (gratis).
   ▸ Velocidad ajustable y recordada.
   ▸ Descarga del guion (.txt) siempre.
   ▸ Descarga de MP3 si configuras un endpoint
     TTS (ver docs/tts-worker.js). Deja la URL
     abajo en TTS_URL cuando lo tengas.
   ═══════════════════════════════════════════ */

const AudioVoz = {
  /* URL de tu Worker TTS (Cloudflare, Aura-2-es).
     Vacío = el botón MP3 no se muestra. Ejemplo:
     TTS_URL: "https://voz-tts.911psicologia.workers.dev" */
  TTS_URL: "",

  vozES: null,
  sonando: false,
  VELOCIDADES: [0.8, 1, 1.2, 1.5],
  velocidad: 1,
  CLAVE_VELOCIDAD: "vozlibros_velocidad",

  iniciar() {
    const guardada = parseFloat(localStorage.getItem(this.CLAVE_VELOCIDAD));
    if (this.VELOCIDADES.includes(guardada)) this.velocidad = guardada;

    if (!("speechSynthesis" in window)) return;
    const elegir = () => {
      const voces = speechSynthesis.getVoices();
      // Voz elegida por el usuario (#4), si sigue instalada
      const guardadaURI = localStorage.getItem("vozlibros_voz") || "";
      const elegidaUsuario = guardadaURI ? voces.find(v => v.voiceURI === guardadaURI) : null;
      this.vozES =
        elegidaUsuario ||
        voces.find(v => /es[-_](CO|MX|US|419)/i.test(v.lang)) ||
        voces.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) ||
        null;
    };
    elegir();
    speechSynthesis.onvoiceschanged = elegir;
  },

  /* Cambia a la siguiente velocidad y la recuerda. */
  siguienteVelocidad() {
    const i = this.VELOCIDADES.indexOf(this.velocidad);
    this.velocidad = this.VELOCIDADES[(i + 1) % this.VELOCIDADES.length];
    localStorage.setItem(this.CLAVE_VELOCIDAD, String(this.velocidad));
    return this.velocidad;
  },

  /* Detiene toda la reproducción y la vigilancia. */
  detener() {
    this.cancelado = true;
    this.limpiarVigilancia();
    if ("speechSynthesis" in window) {
      try { speechSynthesis.cancel(); } catch {}
    }
    this.sonando = false;
  },

  hablar(texto, alTerminar) {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no permite lectura en voz alta. Puedes leer el texto en pantalla.");
      return;
    }
    this.detener();
    this.cancelado = false;
    // En móvil (Android/iOS) el sintetizador se ahoga con locuciones largas:
    // fragmentos a nivel de frase (~190) lo mantienen fluido. En escritorio,
    // fragmentos amplios + el pulso de vigilancia funcionan bien.
    const movil = this.esMovil();
    const maxFragmento = movil ? 190 : 620;
    const fragmentos = this.fragmentar(texto || "", maxFragmento);
    if (!fragmentos.length) {
      if (typeof alTerminar === "function") alTerminar();
      return;
    }

    let indice = 0;
    let reintentos = 0;
    const hablarFragmento = () => {
      if (this.cancelado) return;
      if (indice >= fragmentos.length) {
        this.sonando = false;
        this.limpiarVigilancia();
        if (typeof alTerminar === "function") alTerminar();
        return;
      }

      const u = new SpeechSynthesisUtterance(fragmentos[indice]);
      if (this.vozES) u.voice = this.vozES;
      u.lang = this.vozES ? this.vozES.lang : "es-ES";
      u.rate = 0.96 * this.velocidad;
      u.pitch = 1.0;

      let cerrado = false;
      let arrancado = false;
      const seguir = () => {
        if (cerrado) return;
        cerrado = true;
        clearTimeout(vigiaArranque);
        this.limpiarVigilancia();
        reintentos = 0;
        indice++;
        setTimeout(hablarFragmento, 180);
      };

      u.onstart = () => { arrancado = true; };
      u.onend = seguir;
      // Si el motor de voz falla con un fragmento, no se cuelga la cadena: pasa al siguiente.
      u.onerror = seguir;

      // Vigilante de ARRANQUE: en Android, un speak() puede nacer mudo
      // (sobre todo tras un cancel()). Si en 4 s no ha empezado a sonar,
      // se reintenta el mismo fragmento una vez; si vuelve a fallar, se salta.
      const vigiaArranque = setTimeout(() => {
        if (arrancado || cerrado || this.cancelado) return;
        try { speechSynthesis.cancel(); } catch {}
        this.limpiarVigilancia();
        cerrado = true;
        if (reintentos < 1) {
          reintentos++;
          setTimeout(hablarFragmento, 250); // mismo índice: reintento
        } else {
          reintentos = 0;
          indice++;
          setTimeout(hablarFragmento, 250); // saltar y seguir
        }
      }, 4000);

      this.sonando = true;
      try {
        speechSynthesis.speak(u);
        this.activarVigilancia(u, seguir);
      } catch {
        clearTimeout(vigiaArranque);
        seguir();
      }
    };

    // En móvil, hablar justo después de cancel() traga la locución:
    // una pausa breve tras detener() evita el silencio fantasma.
    if (movil) setTimeout(() => { if (!this.cancelado) hablarFragmento(); }, 250);
    else hablarFragmento();
  },

  fragmentar(texto, max = 620) {
    const limpio = String(texto || "").replace(/\s+/g, " ").trim();
    if (!limpio) return [];
    const frases = limpio.match(/[^.!?;:]+[.!?;:]?|[^.!?;:]+$/g) || [limpio];
    const partes = [];
    let actual = "";
    frases.forEach(frase => {
      const f = frase.trim();
      if (!f) return;
      if ((actual + " " + f).trim().length <= max) {
        actual = (actual + " " + f).trim();
      } else {
        if (actual) partes.push(actual);
        if (f.length <= max) {
          actual = f;
        } else {
          for (let i = 0; i < f.length; i += max) partes.push(f.slice(i, i + max));
          actual = "";
        }
      }
    });
    if (actual) partes.push(actual);
    return partes;
  },

  /* #4: voces en español disponibles y selección persistente */
  vocesES() {
    if (!("speechSynthesis" in window)) return [];
    return speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
  },
  siguienteVoz() {
    const voces = this.vocesES();
    if (voces.length < 2) return null;
    const i = Math.max(0, voces.findIndex(v => this.vozES && v.voiceURI === this.vozES.voiceURI));
    const nueva = voces[(i + 1) % voces.length];
    this.vozES = nueva;
    localStorage.setItem("vozlibros_voz", nueva.voiceURI);
    return nueva;
  },

  esMovil() {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  },

  activarVigilancia(utterance, seguir) {
    this.limpiarVigilancia();

    // Pulso anti-cuelgue: SOLO en escritorio. En Android el truco
    // pause/resume no funciona (las voces de red lo ignoran) y puede
    // producir cortes audibles; allí la cura son los fragmentos cortos.
    if (!this.esMovil()) {
      this._vigilancia = setInterval(() => {
        if (this.cancelado || !this.sonando) return;
        try {
          if (speechSynthesis.paused) speechSynthesis.resume();
          else { speechSynthesis.pause(); speechSynthesis.resume(); }
        } catch {}
      }, 7000);
    }

    // Corte de seguridad proporcional al largo del fragmento
    // (~14 caracteres por segundo en español, ajustado por velocidad).
    // El vigilante de arranque cubre las locuciones que nacen mudas;
    // este corte rescata las que se cuelgan a mitad de camino.
    const caracteres = (utterance && utterance.text ? utterance.text.length : 300);
    const estimadoMs = (caracteres / 14) * 1000 / (this.velocidad || 1);
    const margen = this.esMovil() ? 1.5 : 1.8;
    const base = this.esMovil() ? 3000 : 4000;
    const limite = Math.min(45000, Math.max(6000, estimadoMs * margen + base));
    this._corteSeguridad = setTimeout(() => {
      if (this.cancelado || !this.sonando) return;
      try { speechSynthesis.cancel(); } catch {}
      seguir();
    }, limite);
  },

  limpiarVigilancia() {
    clearInterval(this._vigilancia);
    clearTimeout(this._corteSeguridad);
    this._vigilancia = null;
    this._corteSeguridad = null;
  },

  esNombreGenerico(nombre) {
    const n = String(nombre || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return !n || ["usuario", "mi perfil", "sin nombre", "user", "perfil", "lector", "lectora"].includes(n);
  },

  /* Conector de la capa adaptada: el nombre como vocativo.
     Si el perfil tiene nombre genérico ("Mi perfil", "Usuario"), no lo lee.
     Esto evita audios molestos como "Mi perfil: ...". */
  conectorAdaptada(adaptada, nombre) {
    const ad = String(adaptada || "").trim();
    const n = this.esNombreGenerico(nombre) ? "" : String(nombre || "").trim();
    if (!n) return ad;
    // Comparar sin tildes ni mayúsculas: "José" debe reconocer a "jose,"
    // y funcionar con nombres compuestos ("María Fernanda").
    const norm = t => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const palabrasNombre = norm(n).split(/\s+/).filter(Boolean);
    const inicioAdaptada = norm(ad).split(/[\s,.:;]+/).filter(Boolean).slice(0, palabrasNombre.length);
    if (inicioAdaptada.join(" ") === palabrasNombre.join(" ")) return ad; // ya trae el nombre
    return n + ": " + ad;
  },

  /* Texto de la cápsula de una idea.
     Regla auditiva v0.10.28:
     - Neto: solo directa.
     - Contexto: adaptada + frase memorable.
     - Ambos: directa + adaptada + frase memorable.
     - Acción: solo consejo práctico/Haz, sin leer la etiqueta “Haz:”. */
  capsula(idea, indice, modo, nombre) {
    const partes = [];
    const limpio = t => String(t || "")
      .replace(/\b(Haz|Paso concreto|Un paso concreto|Recomendación|Consejo práctico|Recuerda)\s*[:：-]?\s*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const frase = limpio(idea.frase_memorable || "");
    if (modo === "directas") {
      if (idea.directa) partes.push(limpio(idea.directa));
      return partes.filter(Boolean).join(" ");
    }
    if (modo === "adaptadas") {
      if (idea.adaptada) partes.push(this.conectorAdaptada(limpio(idea.adaptada), nombre));
      if (frase) partes.push(frase);
      return partes.filter(Boolean).join(" ");
    }
    if (modo === "accion") {
      if (idea.consejo_practico) partes.push(limpio(idea.consejo_practico));
      return partes.filter(Boolean).join(" ");
    }
    if (idea.directa) partes.push(limpio(idea.directa));
    if (idea.adaptada) partes.push(this.conectorAdaptada(limpio(idea.adaptada), nombre));
    if (frase) partes.push(frase);
    return partes.filter(Boolean).join(" ");
  },

  /* Guion completo de la sesión, para leer o para TTS. */
  guionSesion(sesion) {
    const lineas = [];
    if (sesion.saludo_audio) lineas.push(sesion.saludo_audio, "");
    (sesion.ideas || []).forEach((idea, i) => {
      lineas.push(this.capsula(idea, i, sesion.modo, sesion.usuario || ""), "");
    });
    if (sesion.guion_audio_cierre) lineas.push(sesion.guion_audio_cierre);
    return lineas.join("\n");
  },

  /* Descarga el guion como archivo de texto. */
  descargarGuion(sesion) {
    const blob = new Blob(
      ["VOZ DE LOS LIBROS\n" + (sesion.titulo_sesion || "Sesión") + "\n" +
       (sesion.fecha || "") + "\n\n" + this.guionSesion(sesion)],
      { type: "text/plain;charset=utf-8" }
    );
    descargarBlob(blob, (sesion.titulo_sesion || "sesion").replace(/\s+/g, "-") + ".txt");
  },

  /* Descarga MP3 desde el Worker TTS (si está configurado). */
  async descargarMP3(sesion, soloIdeaActual, indice) {
    if (!this.TTS_URL) return false;
    const texto = soloIdeaActual
      ? this.capsula(sesion.ideas[indice], indice, sesion.modo, sesion.usuario || "")
      : this.guionSesion(sesion);
    const r = await fetch(this.TTS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: texto.slice(0, 4000) })
    });
    if (!r.ok) throw new Error("El servicio de voz no respondió.");
    const blob = await r.blob();
    const nombre = (sesion.titulo_sesion || "consejo").replace(/\s+/g, "-") +
      (soloIdeaActual ? "-consejo-" + (indice + 1) : "") + ".mp3";
    descargarBlob(blob, nombre);
    return true;
  }
};

function descargarBlob(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

AudioVoz.iniciar();
