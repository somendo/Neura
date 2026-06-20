const CACHE='neura-prod-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/index.html','/manifest.webmanifest','/icon.svg'])).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('/index.html'))))});
self.addEventListener('push',e=>{let d={title:'Neura reminder',body:'Medication reminder',url:'/'};try{d=e.data.json()}catch{}e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:'/icon.svg',badge:'/icon.svg',tag:d.event_id||'neura-med',data:{url:d.url||'/'},actions:[{action:'open',title:'Open Neura'}]}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=e.notification.data?.url||'/';e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const c of list){if('focus'in c)return c.focus()}return clients.openWindow(url)}))});
