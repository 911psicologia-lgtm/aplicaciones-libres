/* ═══════════════════════════════════════════
   pwa.js — Instalación y versiones
   ▸ Instalación: mensaje discreto, nunca
     obligatorio, respetuoso si el usuario dice
     "ahora no" (no vuelve a molestar en 7 días).
   ▸ Versiones: cuando el service worker detecta
     una versión nueva, muestra un aviso con
     botón "Actualizar".
   ═══════════════════════════════════════════ */

const PWA = {
  eventoInstalar: null,
  DIAS_SILENCIO: 7,
  CLAVE_RECHAZO: "vozlibros_instalar_despues",

  /* ── Instalación discreta ── */
  puedeSugerir() {
    // Ya instalada como app: no sugerir
    if (window.matchMedia("(display-mode: standalone)").matches) return false;
    if (window.navigator.standalone === true) return false; // iOS
    // El usuario dijo "ahora no" hace poco: respetarlo
    const cuando = parseInt(localStorage.getItem(this.CLAVE_RECHAZO) || "0", 10);
    const dias = (Date.now() - cuando) / 86400000;
    return dias > this.DIAS_SILENCIO;
  },

  mostrarSugerencia() {
    const banner = document.getElementById("banner-instalar");
    if (banner) banner.classList.remove("oculto");
  },

  ocultarSugerencia(recordarRechazo) {
    const banner = document.getElementById("banner-instalar");
    if (banner) banner.classList.add("oculto");
    if (recordarRechazo) {
      localStorage.setItem(this.CLAVE_RECHAZO, String(Date.now()));
    }
  },

  async instalar() {
    if (!this.eventoInstalar) return;
    this.eventoInstalar.prompt();
    const { outcome } = await this.eventoInstalar.userChoice;
    this.eventoInstalar = null;
    this.ocultarSugerencia(outcome !== "accepted");
  },

  /* ── Aviso de nueva versión ── */
  avisarNuevaVersion(registro) {
    const banner = document.getElementById("banner-version");
    if (!banner) return;
    banner.classList.remove("oculto");
    document.getElementById("btn-actualizar").onclick = () => {
      const esperando = registro.waiting;
      if (esperando) esperando.postMessage({ tipo: "ACTIVAR_NUEVA_VERSION" });
      banner.classList.add("oculto");
    };
    document.getElementById("btn-version-despues").onclick = () => {
      banner.classList.add("oculto"); // se aplicará al reabrir la app
    };
  },

  iniciar() {
    /* Evento de instalación (Chrome, Edge, Android) */
    window.addEventListener("beforeinstallprompt", e => {
      e.preventDefault(); // evitamos el aviso intrusivo del navegador
      this.eventoInstalar = e;
      if (this.puedeSugerir()) {
        // Aparece con calma, unos segundos después de entrar
        setTimeout(() => this.mostrarSugerencia(), 6000);
      }
    });
    window.addEventListener("appinstalled", () => {
      this.ocultarSugerencia(false);
      this.eventoInstalar = null;
    });

    const btnInstalar = document.getElementById("btn-instalar");
    const btnDespues = document.getElementById("btn-instalar-despues");
    if (btnInstalar) btnInstalar.addEventListener("click", () => this.instalar());
    if (btnDespues) btnDespues.addEventListener("click", () => this.ocultarSugerencia(true));

    /* Service worker + detección de versiones nuevas */
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("sw.js").then(registro => {
      // Buscar actualizaciones al abrir la app
      registro.update().catch(() => {});

      // ¿Ya hay una versión esperando? (se descargó en una visita anterior)
      if (registro.waiting && navigator.serviceWorker.controller) {
        this.avisarNuevaVersion(registro);
      }

      // ¿Llega una versión nueva mientras la app está abierta?
      registro.addEventListener("updatefound", () => {
        const nuevo = registro.installing;
        if (!nuevo) return;
        nuevo.addEventListener("statechange", () => {
          if (nuevo.state === "installed" && navigator.serviceWorker.controller) {
            this.avisarNuevaVersion(registro);
          }
        });
      });
    }).catch(() => {
      /* Sin HTTPS o abriendo el archivo directamente:
         la app funciona igual, solo sin modo offline. */
    });

    // Cuando el nuevo SW toma control, recargar una sola vez
    let recargado = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (recargado) return;
      recargado = true;
      window.location.reload();
    });
  }
};

PWA.iniciar();
