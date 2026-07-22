const CACHE_NAME='update24-wb-v12-no-form';
const STATIC_CACHE=[
  './',
  'index.html',
  'manifest.json',
  'links.json',
  'mobile-ui.css',
  'icon-512.png',
  'helpline.html',
  'apps.html',
  'find-office.html',
  'about.html',
  'privacy.html',
  'contact.html',
  'disclaimer.html'
];
const NEVER_CACHE=['script.google.com','googleapis.com','googletagmanager.com'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_CACHE).catch(()=>{}))
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.map(k=>{if(k!==CACHE_NAME)return caches.delete(k);})
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // Never cache API/analytics calls
  if(NEVER_CACHE.some(d=>url.includes(d))){
    e.respondWith(fetch(e.request).catch(()=>new Response('',{status:503})));
    return;
  }
  // Network first, fallback to cache
  e.respondWith(
    fetch(e.request).then(res=>{
      if(e.request.method==='GET'&&res&&res.status===200){
        const clone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
      }
      return res;
    }).catch(()=>caches.match(e.request).then(r=>r||new Response(
      '<h1 style="font-family:sans-serif;text-align:center;padding:40px">📶 ইন্টারনেট সংযোগ নেই। Offline mode-এ আছেন।</h1>',
      {headers:{'Content-Type':'text/html'}}
    )))
  );
});

// Background sync message
self.addEventListener('message',e=>{
  if(e.data==='skipWaiting')self.skipWaiting();
});
