const CACHE_NAME = 'ai-nougyou-adviser-kun-cache-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json?v=4',
  '/icons/icon.svg',
  '/icons/icon-180-v3.png',
  '/icons/icon-192-v3.png',
  '/icons/icon-512-v3.png',
  '/icons/icon-maskable-512-v3.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell assets safely');
        // Individually cache each asset to prevent a single 404 from breaking the PWA installation.
        return Promise.allSettled(
          urlsToCache.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
              throw new Error(`Failed to cache ${url}: status ${response.status}`);
            }).catch(err => {
              console.warn(`Non-blocking cache error for ${url}:`, err);
            })
          )
        );
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const url = new URL(event.request.url);

  if (url.hostname.includes('api.openweathermap.org') || url.hostname.includes('esm.sh')) {
    event.respondWith(
        fetch(event.request).catch(() => {
            return new Response('Network error', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
            });
        })
    );
    return;
  }
  
  // Stale-while-revalidate strategy
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed:', err);
            throw err;
        });

        return response || fetchPromise;
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});