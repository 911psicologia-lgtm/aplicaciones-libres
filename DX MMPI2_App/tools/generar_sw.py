import os, json, hashlib
root='.'
files=[]
for d,_,fs in os.walk(root):
    for f in fs:
        p=os.path.join(d,f)[2:]
        if p.startswith('.') or p.endswith(('.md','.zip','.py')) or p in ('_redirects','sw.js'): continue
        files.append(p)
files=sorted(files)
h=hashlib.sha1()
for p in files: h.update(open(p,'rb').read())
ver=h.hexdigest()[:10]
assets=['./']+['./'+p for p in files]
sw=f"""/* Service worker · MMPI-2 App (generado) — versión {ver}
   Precarga todos los archivos para que la app funcione sin conexión.
   Estrategia: caché primero; en segundo plano se actualiza la copia. */
const CACHE = 'mmpi2-{ver}';
const ASSETS = {json.dumps(assets, ensure_ascii=False, indent=2)};

self.addEventListener('install', (e) => {{
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
}});

self.addEventListener('activate', (e) => {{
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('mmpi2-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
}});

self.addEventListener('message', (e) => {{
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
}});

self.addEventListener('fetch', (e) => {{
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Navegación: servir index.html desde caché si no hay red
  if (req.mode === 'navigate') {{
    e.respondWith(fetch(req).then((r) => {{
      const copy = r.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return r;
    }}).catch(() => caches.match('./index.html')));
    return;
  }}
  e.respondWith(
    caches.match(req, {{ ignoreSearch: true }}).then((hit) => {{
      const net = fetch(req).then((r) => {{
        if (r && r.ok && r.type === 'basic') {{ const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }}
        return r;
      }}).catch(() => hit);
      return hit || net;
    }})
  );
}});
"""
open('sw.js','w',encoding='utf-8').write(sw)
print(ver, len(assets))
