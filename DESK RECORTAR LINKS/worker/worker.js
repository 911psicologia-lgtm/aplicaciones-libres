/*
  RizoLink Cloudflare Worker
  Requisitos:
  1. Crear un KV namespace y enlazarlo como RIZOLINK_KV.
  2. Definir variable ADMIN_KEY para crear/editar/borrar enlaces.
  3. Desplegar en Cloudflare Workers.
*/

const json = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', ...cors() }
});
const cors = () => ({
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,x-admin-key'
});
const cleanAlias = value => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
const isUrl = value => { try { const u = new URL(value); return ['http:','https:'].includes(u.protocol); } catch { return false; } };
const requireAdmin = request => request.headers.get('x-admin-key') === ADMIN_KEY;

async function uniqueAlias(env, seed){
  const base = cleanAlias(seed) || `link-${Date.now().toString(36)}`;
  let candidate = base;
  let i = 2;
  while(await env.RIZOLINK_KV.get(`link:${candidate}`)) candidate = `${base}-${i++}`;
  return candidate;
}

export default {
  async fetch(request, env) {
    if(request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    globalThis.ADMIN_KEY = env.ADMIN_KEY || '';
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, '');

    try {
      if(path === 'api/links' && request.method === 'POST') {
        if(!requireAdmin(request)) return json({ error:'No autorizado' }, 401);
        const body = await request.json();
        if(!isUrl(body.destination || body.url)) return json({ error:'URL inválida' }, 400);
        const alias = await uniqueAlias(env, body.alias || body.title);
        const now = new Date().toISOString();
        const record = {
          alias,
          title: String(body.title || alias).slice(0,90),
          destination: body.destination || body.url,
          category: body.category || 'Otros',
          note: body.note || '',
          trust: Boolean(body.trust),
          priority: Boolean(body.priority),
          clicks: 0,
          createdAt: now,
          updatedAt: now
        };
        await env.RIZOLINK_KV.put(`link:${alias}`, JSON.stringify(record));
        return json({ ...record, shortUrl: `${url.origin}/${alias}` }, 201);
      }

      if(path === 'api/links' && request.method === 'GET') {
        if(!requireAdmin(request)) return json({ error:'No autorizado' }, 401);
        const list = await env.RIZOLINK_KV.list({ prefix:'link:' });
        const rows = await Promise.all(list.keys.map(k => env.RIZOLINK_KV.get(k.name, 'json')));
        return json({ links: rows.filter(Boolean) });
      }

      if(path.startsWith('api/links/') && request.method === 'PUT') {
        if(!requireAdmin(request)) return json({ error:'No autorizado' }, 401);
        const alias = cleanAlias(path.split('/').pop());
        const current = await env.RIZOLINK_KV.get(`link:${alias}`, 'json');
        if(!current) return json({ error:'No existe' }, 404);
        const body = await request.json();
        if(body.destination && !isUrl(body.destination)) return json({ error:'URL inválida' }, 400);
        const updated = { ...current, ...body, alias, updatedAt: new Date().toISOString() };
        await env.RIZOLINK_KV.put(`link:${alias}`, JSON.stringify(updated));
        return json(updated);
      }

      if(path.startsWith('api/links/') && request.method === 'DELETE') {
        if(!requireAdmin(request)) return json({ error:'No autorizado' }, 401);
        const alias = cleanAlias(path.split('/').pop());
        await env.RIZOLINK_KV.delete(`link:${alias}`);
        return json({ ok:true });
      }

      if(path && request.method === 'GET') {
        const alias = cleanAlias(path);
        const record = await env.RIZOLINK_KV.get(`link:${alias}`, 'json');
        if(!record) return new Response('RizoLink no encontrado', { status:404, headers:{'content-type':'text/plain; charset=utf-8'} });
        record.clicks = Number(record.clicks || 0) + 1;
        record.lastAccess = new Date().toISOString();
        await env.RIZOLINK_KV.put(`link:${alias}`, JSON.stringify(record));
        if(url.searchParams.get('preview') === '1' || record.trust) {
          return new Response(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${record.title}</title><body style="font-family:system-ui;background:#07111f;color:#eef5ff;display:grid;place-items:center;min-height:100vh;margin:0"><main style="max-width:560px;padding:28px;border:1px solid rgba(255,255,255,.18);border-radius:24px;background:rgba(255,255,255,.08)"><p style="color:#22d3ee;font-weight:800">RizoLink</p><h1>${record.title}</h1><p style="color:#a9b8cf;word-break:break-all">${record.destination}</p><a href="${record.destination}" style="display:inline-block;margin-top:12px;background:#8b5cf6;color:white;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:800">Abrir destino</a></main></body></html>`, { headers:{'content-type':'text/html; charset=utf-8'} });
        }
        return Response.redirect(record.destination, 302);
      }

      return json({ name:'RizoLink API', status:'ok' });
    } catch (error) {
      return json({ error:error.message || 'Error interno' }, 500);
    }
  }
};
