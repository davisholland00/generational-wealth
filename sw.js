/* Household Ledger service worker: lets the app open offline. The page itself is always fetched fresh when online, so updates still go live right away. */
var C='hl-v1';
var SHELL=['./','manifest.webmanifest','icon-192.png','apple-touch-icon.png','bg.jpg','bg-portrait.jpg'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return c.addAll(SHELL)}).then(function(){return self.skipWaiting()}).catch(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
var HOSTS=['cdn.jsdelivr.net','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.method!=='GET')return;
  var u=new URL(r.url);
  var same=u.origin===self.location.origin;
  if(!same&&HOSTS.indexOf(u.hostname)<0)return;
  var isPage=r.mode==='navigate'||(same&&(u.pathname==='/'||/index\.html$/.test(u.pathname)));
  if(isPage){
    e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put('./',cp)});return res}).catch(function(){return caches.match('./')}));
    return;
  }
  e.respondWith(caches.match(r).then(function(hit){
    var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)})}return res}).catch(function(){return hit});
    return hit||net;
  }));
});
