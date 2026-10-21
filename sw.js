const CACHE='shisan-v6';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k.indexOf('shisan-')===0).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request,u=new URL(req.url);
  if(req.method!=='GET'||u.origin!==location.origin)return;
  const key=u.origin+u.pathname;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    let cached=await cache.match(key);
    if(!cached&&req.mode==='navigate')cached=await cache.match(new URL('./',self.registration.scope).href);
    const net=fetch(req).then(r=>{if(r&&r.ok){cache.put(key,r.clone());return r}return cached||r});
    if(!cached)return net;
    return Promise.race([net.catch(()=>cached),new Promise(res=>setTimeout(()=>res(cached),3000))]);
  })());
});
