const CACHE_NAME = 'clean-tracker-v3';
const ASSETS = [
  '/home.html','/add.html','/challenge.html','/manifest.json','/sw.js',
  '/icons/icon-72.svg','/icons/icon-192.svg','/icons/icon-512.svg'
];

// install
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

// activate
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=> k!==CACHE_NAME ? caches.delete(k) : null))));
  self.clients.claim();
});

// fetch
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r || fetch(e.request)));
});
