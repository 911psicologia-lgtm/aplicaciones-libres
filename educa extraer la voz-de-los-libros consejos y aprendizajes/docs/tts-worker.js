/* ═══════════════════════════════════════════
   tts-worker.js — Voz descargable (MP3)
   Worker independiente de Cloudflare que
   convierte texto en audio con Workers AI.

   CÓMO DESPLEGARLO (5 minutos):
   1. En tu panel de Cloudflare → Workers → Create Worker.
      Nómbralo, por ejemplo: voz-tts
   2. Pega este código completo.
   3. En Settings → Bindings → añade un binding
      de tipo "Workers AI" con el nombre: AI
   4. Deploy. Copia la URL (ej. https://voz-tts.911psicologia.workers.dev)
   5. En la app, abre js/audio.js y pon esa URL en TTS_URL.
      Aparecerá el botón de descarga MP3 en el reproductor.

   Modelo: @cf/deepgram/aura-2-es (voz natural en español).
   Alternativa multilingüe: @cf/myshell-ai/melotts.
   Workers AI tiene capa gratuita; revisa límites en tu panel.
   ═══════════════════════════════════════════ */

// Dominios autorizados a usar tu servicio de voz (ajústalo):
const ORIGENES_PERMITIDOS = [
  "https://voz-de-los-libros.911psicologia.workers.dev",
  "http://localhost:8080"
];

const CORS = origen => ({
  "Access-Control-Allow-Origin": ORIGENES_PERMITIDOS.includes(origen) ? origen : ORIGENES_PERMITIDOS[0],
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
});

export default {
  async fetch(request, env) {
    const origen = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS(origen) });
    }
    if (request.method !== "POST") {
      return new Response("Usa POST con JSON: { \"texto\": \"...\" }", { status: 405, headers: CORS(origen) });
    }

    let texto = "";
    try {
      const cuerpo = await request.json();
      texto = String(cuerpo.texto || "").trim();
    } catch {
      return new Response("JSON inválido.", { status: 400, headers: CORS(origen) });
    }
    if (!texto) {
      return new Response("Falta el campo 'texto'.", { status: 400, headers: CORS(origen) });
    }
    // Límite prudente por petición (controla costos y tiempos)
    texto = texto.slice(0, 4000);

    try {
      const respuesta = await env.AI.run("@cf/deepgram/aura-2-es", {
        text: texto
        // Puedes fijar una voz concreta con: speaker: "celeste"
        // (revisa las voces disponibles del modelo en tu panel)
      });

      // El modelo devuelve un stream de audio MPEG
      return new Response(respuesta, {
        headers: {
          ...CORS(origen),
          "Content-Type": "audio/mpeg",
          "Content-Disposition": "attachment; filename=\"voz-de-los-libros.mp3\""
        }
      });
    } catch (e) {
      return new Response("Error generando el audio: " + e.message, { status: 500, headers: CORS(origen) });
    }
  }
};
