/**
 * AUDIO ENGINE — usa las voces de síntesis YA INSTALADAS en el dispositivo
 * (Web Speech API). No descarga ni almacena archivos de audio.
 *
 * Corrección crítica v7:
 * cada reproducción tiene un identificador interno de sesión. Al cambiar de
 * modo, idioma, ruta o tarjeta, stop() invalida la sesión anterior. Así ningún
 * onend viejo puede encadenar una frase que ya no corresponde a lo que se ve.
 */
window.AudioEngine = (() => {
  let voicesES = [];
  let voicesEN = [];
  let voicesByLang = {}; // { en:[...], fr:[...], pt:[...], es:[...] }
  let targetLang = "en"; // idioma que se practica
  let rate = 1;
  let speaking = false;
  let cancelled = false;
  let runId = 0; // invalida colas y callbacks antiguos
  let onStateChange = null;
  let onChainStep = null; // avisa qué idioma de la cadena suena (modo políglota)
  let onVoicesChanged = null;

  const PREFERRED = {
    en: ["en-US", "en-GB", "en-AU"],
    fr: ["fr-FR", "fr-CA"],
    pt: ["pt-BR", "pt-PT"],
    es: ["es-MX", "es-US", "es-419", "es-ES"]
  };

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    const byPrefix = p => voices.filter(v => v.lang.toLowerCase().startsWith(p));
    voicesByLang = { en: byPrefix("en"), fr: byPrefix("fr"), pt: byPrefix("pt"), es: byPrefix("es") };
    voicesES = voicesByLang.es;
    voicesEN = voicesByLang.en;
    if (onVoicesChanged) onVoicesChanged(getVoiceStatus());
  }

  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function beginRun() {
    runId += 1;
    cancelled = false;
    return runId;
  }

  function invalidateRun() {
    runId += 1;
    cancelled = true;
    if (onChainStep) onChainStep(null);
  }

  function isCurrent(id) {
    return id === runId && !cancelled;
  }

  function delay(ms, id) {
    return new Promise(resolve => {
      const t = setTimeout(resolve, ms);
      if (!isCurrent(id)) {
        clearTimeout(t);
        resolve();
      }
    });
  }

  function pickVoice(list, preferredLangs) {
    for (const lang of preferredLangs) {
      const match = list.find(v => v.lang.toLowerCase() === lang.toLowerCase());
      if (match) return match;
    }
    return list[0] || null;
  }

  function setSpeaking(val) {
    speaking = val;
    if (onStateChange) onStateChange(speaking);
  }

  function speakUtterance(text, lang, voiceList, preferredLangs, id) {
    return new Promise((resolve) => {
      if (!("speechSynthesis" in window) || !text || !isCurrent(id)) { resolve(); return; }

      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const voice = pickVoice(voiceList, preferredLangs);
      if (voice) u.voice = voice;
      u.rate = rate;

      let done = false;
      let keepAlive = null;
      let safety = null;

      const finish = () => {
        if (done) return;
        done = true;
        if (keepAlive) clearInterval(keepAlive);
        if (safety) clearTimeout(safety);
        resolve();
      };

      u.onend = finish;
      u.onerror = finish;

      keepAlive = setInterval(() => {
        if (!isCurrent(id)) { finish(); return; }
        if (!("speechSynthesis" in window)) return;
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 12000);

      const estMs = Math.max(2500, (text.length * 90) / Math.max(rate, 0.5)) + 4000;
      safety = setTimeout(finish, estMs);

      try {
        if (!isCurrent(id)) { finish(); return; }
        window.speechSynthesis.speak(u);
      } catch (e) {
        finish();
      }
    });
  }

  async function speakStep(text, lang, id) {
    if (!text || !isCurrent(id)) return;
    const usable = (lang === "en" || lang === "es" || (voicesByLang[lang] || []).length);
    if (!usable) return;
    const list = voicesByLang[lang] || voicesEN;
    const prefs = PREFERRED[lang] || PREFERRED.en;
    await speakUtterance(text, prefs[0], list, prefs, id);
  }

  function getVoiceStatus() {
    if (!("speechSynthesis" in window)) {
      return { supported: false, totalVoices: 0, englishVoices: 0, spanishVoices: 0 };
    }
    const all = window.speechSynthesis.getVoices();
    return {
      supported: true,
      totalVoices: all.length,
      englishVoices: voicesEN.length,
      spanishVoices: voicesES.length,
      frenchVoices: (voicesByLang.fr || []).length,
      portugueseVoices: (voicesByLang.pt || []).length
    };
  }

  return {
    hasSynthesis() { return "speechSynthesis" in window; },
    getVoiceStatus,
    setOnVoicesChanged(cb) { onVoicesChanged = typeof cb === "function" ? cb : null; },
    setRate(r) { rate = r; },
    getRate() { return rate; },
    setTargetLang(lang) { if (PREFERRED[lang]) targetLang = lang; },
    getTargetLang() { return targetLang; },
    setOnStateChange(cb) { onStateChange = cb; },
    setOnChainStep(cb) { onChainStep = typeof cb === "function" ? cb : null; },

    async speakOne(text, lang) {
      if (!text) return;
      const id = beginRun();
      setSpeaking(true);
      await speakStep(text, lang, id);
      if (isCurrent(id)) setSpeaking(false);
    },

    // Ruta funcional A1–B2: inglés primero, español siempre como ancla,
    // y después FR/PT solo si ese idioma fue elegido.
    async speakRecall(item, lang, onReveal) {
      const id = beginRun();
      setSpeaking(true);
      if (typeof onReveal === "function" && isCurrent(id)) onReveal();

      const sequence = [
        { lang: "en", text: item.en },
        { lang: "es", text: item.es }
      ];
      if ((lang === "fr" || lang === "pt") && item[lang]) {
        sequence.push({ lang, text: item[lang] });
      }

      let first = true;
      for (const step of sequence) {
        if (!isCurrent(id)) return;
        if (!step.text) continue;
        if (!first) {
          await delay(350, id);
          if (!isCurrent(id)) return;
        }
        first = false;
        await speakStep(step.text, step.lang, id);
      }
      if (isCurrent(id)) setSpeaking(false);
    },

    hasVoiceFor(lang) {
      const l = (voicesByLang[lang] || []);
      return lang === "es" || lang === "en" ? true : l.length > 0;
    },
    isSpeaking() { return speaking; },

    async speakPhrase(phrase, mode) {
      const id = beginRun();
      setSpeaking(true);

      const requestedLang = PREFERRED[targetLang] ? targetLang : "en";
      const actualLang = (requestedLang === "en" || phrase[requestedLang]) ? requestedLang : "en";
      const text = phrase[actualLang] || phrase.en;

      await speakStep(text, actualLang, id);
      if (!isCurrent(id)) return;
      if (mode === "bilingue" && phrase.es) {
        await delay(350, id);
        if (!isCurrent(id)) return;
        await speakStep(phrase.es, "es", id);
      }
      if (isCurrent(id)) setSpeaking(false);
    },

    async speakChain(phrase, langs) {
      const id = beginRun();
      setSpeaking(true);
      const orden = (Array.isArray(langs) && langs.length) ? langs : ["en", "es", "fr", "pt"];
      let primero = true;
      let pronunciado = false;
      for (const lang of orden) {
        if (!isCurrent(id)) return;
        const texto = (lang === "es") ? phrase.es : phrase[lang];
        if (!texto) continue;
        if (lang !== "en" && lang !== "es" && !((voicesByLang[lang] || []).length)) continue;
        if (!primero) {
          await delay(350, id);
          if (!isCurrent(id)) return;
        }
        primero = false;
        pronunciado = true;
        if (onChainStep && isCurrent(id)) onChainStep(lang);
        await speakStep(texto, lang, id);
      }
      if (onChainStep) onChainStep(null);
      if (!pronunciado && isCurrent(id)) await delay(700, id);
      if (isCurrent(id)) setSpeaking(false);
    },

    stop() {
      invalidateRun();
      setSpeaking(false);
      if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch (e) { /* noop */ }
        try { window.speechSynthesis.cancel(); } catch (e) { /* doble cancelación segura */ }
      }
    }
  };
})();
