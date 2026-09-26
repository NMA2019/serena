/* ============================================================
   SERENA V1.2 — Service Worker
   Stratégie : cache-first pour les assets, network-first pour le reste
   ============================================================ */

   const CACHE_NAME = 'serena-v1.2.0';
   const CACHE_VERSION = 1;
   
   /* Ressources à précacher (App Shell) */
   const PRECACHE_URLS = [
     './',
     './index.html',
     './manifest.json',
     './assets/logo.svg',
     './assets/icon-192.png',
     './assets/icon-512.png',
     './assets/icon-512-maskable.png'
   ];
   
   /* Durée de vie maximale du cache (en ms) — 30 jours */
   const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
   
   /* ============================================================
      Install : précache l'App Shell
      ============================================================ */
   self.addEventListener('install', (event) => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then((cache) => {
           return Promise.allSettled(
             PRECACHE_URLS.map((url) =>
               cache.add(url).catch((err) => {
                 console.warn('[SW] Précache échoué pour', url, err);
               })
             )
           );
         })
         .then(() => self.skipWaiting())
     );
   });
   
   /* ============================================================
      Activate : nettoie les anciens caches
      ============================================================ */
   self.addEventListener('activate', (event) => {
     event.waitUntil(
       caches.keys()
         .then((keys) => {
           return Promise.all(
             keys
               .filter((key) => key !== CACHE_NAME)
               .map((key) => {
                 console.log('[SW] Suppression ancien cache', key);
                 return caches.delete(key);
               })
           );
         })
         .then(() => self.clients.claim())
     );
   });
   
   /* ============================================================
      Fetch : stratégie de cache
      ============================================================ */
   self.addEventListener('fetch', (event) => {
     const { request } = event;
   
     /* Ne pas intercepter les requêtes non-GET */
     if (request.method !== 'GET') return;
   
     /* Ne pas intercepter les schémas non-HTTP */
     const url = new URL(request.url);
     if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
   
     /* Ignorer les requêtes cross-origin (analytics, CDN tiers, etc.) */
     if (url.origin !== self.location.origin) return;
   
     /* IndexedDB, localStorage : ne passent pas par fetch */
   
     /* --- Stratégie 1 : App Shell (HTML, manifest, icônes) → cache-first --- */
     const isAppShell =
       url.pathname.endsWith('/') ||
       url.pathname.endsWith('/index.html') ||
       url.pathname.endsWith('/manifest.json') ||
       url.pathname.match(/\.(svg|png|ico|webp|jpg|jpeg)$/i);
   
     if (isAppShell) {
       event.respondWith(cacheFirst(request));
       return;
     }
   
     /* --- Stratégie 2 : Autres ressources same-origin → stale-while-revalidate --- */
     event.respondWith(staleWhileRevalidate(request));
   });
   
   /* ============================================================
      Stratégies de cache
      ============================================================ */
   
   /**
    * Cache-first : sert depuis le cache, réseau en fallback.
    * Idéal pour les assets statiques.
    */
   async function cacheFirst(request) {
     const cache = await caches.open(CACHE_NAME);
     const cached = await cache.match(request);
   
     if (cached && !isExpired(cached)) {
       /* Rafraîchit en arrière-plan (fire and forget) */
       fetchAndCache(request).catch(() => {});
       return cached;
     }
   
     try {
       const response = await fetch(request);
       if (response && response.status === 200) {
         cache.put(request, response.clone());
       }
       return response;
     } catch (err) {
       /* Réseau indisponible : sert le cache même expiré, ou fallback index */
       if (cached) return cached;
       if (request.mode === 'navigate') {
         const fallback = await cache.match('./index.html');
         if (fallback) return fallback;
       }
       return new Response('Hors-ligne', {
         status: 503,
         statusText: 'Service Unavailable',
         headers: { 'Content-Type': 'text/plain; charset=utf-8' }
       });
     }
   }
   
   /**
    * Stale-while-revalidate : sert le cache immédiatement,
    * met à jour en arrière-plan.
    */
   async function staleWhileRevalidate(request) {
     const cache = await caches.open(CACHE_NAME);
     const cached = await cache.match(request);
   
     const networkPromise = fetch(request)
       .then((response) => {
         if (response && response.status === 200) {
           cache.put(request, response.clone());
         }
         return response;
       })
       .catch(() => null);
   
     if (cached) {
       networkPromise.catch(() => {});
       return cached;
     }
   
     const response = await networkPromise;
     if (response) return response;
   
     return new Response('Hors-ligne', {
       status: 503,
       statusText: 'Service Unavailable',
       headers: { 'Content-Type': 'text/plain; charset=utf-8' }
     });
   }
   
   /**
    * Récupère et met en cache (utilitaire).
    */
   async function fetchAndCache(request) {
     const cache = await caches.open(CACHE_NAME);
     const response = await fetch(request);
     if (response && response.status === 200) {
       cache.put(request, response.clone());
     }
     return response;
   }
   
   /**
    * Vérifie si une réponse en cache est expirée.
    */
   function isExpired(response) {
     const dateHeader = response.headers.get('date');
     if (!dateHeader) return false;
     const cachedAt = new Date(dateHeader).getTime();
     return Date.now() - cachedAt > CACHE_MAX_AGE;
   }
   
   /* ============================================================
      Messages depuis la page (contrôle du SW)
      ============================================================ */
   self.addEventListener('message', (event) => {
     const data = event.data || {};
   
     /* Forcer la mise à jour du SW */
     if (data.type === 'SKIP_WAITING') {
       self.skipWaiting();
       return;
     }
   
     /* Vider le cache manuellement */
     if (data.type === 'CLEAR_CACHE') {
       event.waitUntil(
         caches.keys()
           .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
           .then(() => {
             if (event.ports && event.ports[0]) {
               event.ports[0].postMessage({ ok: true });
             }
           })
       );
       return;
     }
   
     /* Vérifier la version du cache */
     if (data.type === 'GET_VERSION') {
       if (event.ports && event.ports[0]) {
         event.ports[0].postMessage({
           cacheName: CACHE_NAME,
           version: CACHE_VERSION
         });
       }
       return;
     }
   });
   
   /* ============================================================
      Notifications push (placeholder, sans serveur)
      ============================================================ */
   self.addEventListener('notificationclick', (event) => {
     event.notification.close();
   
     const targetUrl = (event.notification.data && event.notification.data.url) || './index.html';
   
     event.waitUntil(
       self.clients.matchAll({ type: 'window', includeUncontrolled: true })
         .then((clientList) => {
           /* Réutilise un onglet existant */
           for (const client of clientList) {
             if (client.url.includes(self.location.origin) && 'focus' in client) {
               return client.focus();
             }
           }
           /* Sinon ouvre une nouvelle fenêtre */
           if (self.clients.openWindow) {
             return self.clients.openWindow(targetUrl);
           }
         })
     );
   });
   
   /* ============================================================
      Synchronisation en arrière-plan (placeholder)
      ============================================================ */
   self.addEventListener('sync', (event) => {
     if (event.tag === 'serena-sync') {
       /* Pas de synchronisation serveur dans SERENA (local-first).
          Réservé pour une future version E2E. */
       event.waitUntil(Promise.resolve());
     }
   });
   
   /* ============================================================
      Log d'activation
      ============================================================ */
   self.addEventListener('activate', () => {
     console.log('[SW] SERENA Service Worker activé — cache:', CACHE_NAME);
   });