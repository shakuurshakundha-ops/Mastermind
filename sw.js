// Simple service worker: basic caching + push handling
const CACHE_NAME = 'clean-tracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install: cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); })))
    .then(() => self.clients.claim())
  );
});

// Fetch: respond with cache-first
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Push notifications (if you later use web-push)
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {title:'Reminder', body:'Open your tracker.'};
  const options = {
    body: data.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg',
    data: data
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
// Service Worker for Custom Clean Tracker
const CACHE_NAME = 'custom-clean-tracker-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72.svg',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg'
];

// Install event: cache all static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});

// Optional push notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'Clean Tracker', body: 'Remember to log today!' };
  const options = {
    body: data.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-72.svg'
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

