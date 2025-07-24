// Service Worker for Budget Tracker PWA
const CACHE_NAME = 'budget-tracker-v1';
const urlsToCache = [
  '/',
  '/src/main.tsx',
  '/src/main.css',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Handle background sync for offline transactions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Here you would sync any pending transactions when back online
  }
});

// Handle push notifications for budget alerts
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Budget alert!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'View Budget',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close', 
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Budget Tracker', options)
  );
});