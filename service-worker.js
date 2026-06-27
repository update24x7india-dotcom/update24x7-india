const CACHE_NAME='update24-wb-v2';
self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(['./','index.html','manifest.json','icon-512.png'])))
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>{if(k!==CACHE_NAME){return caches.delete(k)}})))
  );
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  e.respondWith(
    fetch(e.request).then(res=>{
      if(e.request.method==='GET' && res && res.status===200){
        const resClone=res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request,resClone));
      }
      return res;
    }).catch(()=>caches.match(e.request))
  )
});