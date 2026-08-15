/* ═══════════════════════════════════════════
   push-worker.js — Recordatorios Web Push (C3, evolutiva)
   Worker de Cloudflare que envía "tu consejo del día"
   como notificación, incluso con la app cerrada.

   REQUIERE (por eso es evolutiva, no inmediata):
   1. Generar llaves VAPID:  npx web-push generate-vapid-keys
   2. Crear un KV namespace "SUSCRIPCIONES" y vincularlo al worker.
   3. Configurar un Cron Trigger (ej. "0 12 * * *" = 7 a.m. Colombia).
   4. Poner la llave pública VAPID en la app (js/pwa.js) y añadir
      el flujo de suscripción (pushManager.subscribe) + un endpoint
      POST /suscribir que guarde la suscripción en KV.
   5. Variables del worker: VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT
      (mailto:tu-correo).

   Este archivo es el esqueleto listo del lado servidor; la parte
   criptográfica de Web Push (firmado VAPID + cifrado del payload)
   conviene resolverla con una librería compatible con Workers,
   p. ej. "webpush-webcrypto". Pendiente de decisión de despliegue.
   ═══════════════════════════════════════════ */

export default {
  // Recibe y guarda suscripciones desde la app
  async fetch(request, env) {
    if (request.method === "POST" && new URL(request.url).pathname === "/suscribir") {
      const sub = await request.json();
      if (!sub || !sub.endpoint) return new Response("Suscripción inválida", { status: 400 });
      await env.SUSCRIPCIONES.put(crypto.randomUUID(), JSON.stringify(sub));
      return new Response("ok");
    }
    return new Response("Voz de los Libros · servicio de recordatorios", { status: 200 });
  },

  // Cron diario: envía la notificación a todas las suscripciones
  async scheduled(event, env, ctx) {
    const { sendNotification } = await importarWebPush(); // ver nota arriba
    const lista = await env.SUSCRIPCIONES.list();
    const payload = JSON.stringify({
      title: "📖 Voz de los Libros",
      body: "Tu consejo de hoy te espera. Un minuto de escucha puede ordenar el día.",
      url: "/"
    });
    for (const k of lista.keys) {
      const sub = JSON.parse(await env.SUSCRIPCIONES.get(k.name));
      try {
        await sendNotification(sub, payload, {
          vapidDetails: { subject: env.VAPID_SUBJECT, publicKey: env.VAPID_PUBLIC, privateKey: env.VAPID_PRIVATE }
        });
      } catch (e) {
        // Suscripción vencida: limpiar
        if (String(e).includes("410")) await env.SUSCRIPCIONES.delete(k.name);
      }
    }
  }
};

async function importarWebPush() {
  // Placeholder: integra aquí la librería web-push compatible con Workers.
  throw new Error("Integra una librería web-push para Workers antes de desplegar.");
}
